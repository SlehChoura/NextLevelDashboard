import Anthropic from "@anthropic-ai/sdk"
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod"
import { z } from "zod"
import type { ReportTemplate } from "../types"
import type { ParsedSheet } from "./excelImport"

const MAX_SAMPLE_ROWS = 8
const MAX_CELL_LENGTH = 120

function createClient(apiKey: string): Anthropic {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

export interface AiConnectionResult {
  ok: boolean
  message: string
}

/** Vérifie qu'une clé API est valide en comptant les tokens d'un message minimal (pas de génération facturée). */
export async function testAiConnection(apiKey: string, model: string): Promise<AiConnectionResult> {
  try {
    const client = createClient(apiKey)
    await client.messages.countTokens({
      model,
      messages: [{ role: "user", content: "ping" }],
    })
    return { ok: true, message: "Connexion réussie." }
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return { ok: false, message: "Clé API invalide ou refusée." }
    }
    if (error instanceof Anthropic.PermissionDeniedError) {
      return { ok: false, message: "Accès refusé pour cette clé (permissions insuffisantes)." }
    }
    if (error instanceof Anthropic.NotFoundError) {
      return { ok: false, message: `Modèle "${model}" introuvable.` }
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, message: "Limite de requêtes atteinte, réessayez dans un instant." }
    }
    if (error instanceof Anthropic.APIConnectionError) {
      return { ok: false, message: "Impossible de contacter l'API Anthropic (vérifiez votre connexion réseau)." }
    }
    if (error instanceof Anthropic.APIError) {
      return { ok: false, message: `Erreur API (${error.status}) : ${error.message}` }
    }
    return { ok: false, message: "Impossible de contacter l'API (réseau ou clé mal formée)." }
  }
}

const MappingSuggestionSchema = z.object({
  templateId: z.string().describe("Identifiant exact du template choisi, parmi ceux proposés"),
  templateReason: z
    .string()
    .describe("Justification courte (une phrase) du choix de ce template pour ces données"),
  columnMapping: z
    .array(
      z.object({
        criterionKey: z.string().describe("Clé exacte du critère du template"),
        matchedHeader: z
          .string()
          .nullable()
          .describe("En-tête de colonne Excel correspondant, recopié exactement, ou null si aucune colonne ne convient"),
        confidence: z.enum(["haute", "moyenne", "faible"]),
      }),
    )
    .describe("Une entrée pour chaque critère du template choisi"),
})

export interface AiMappingSuggestion {
  templateId: string
  templateReason: string
  columnMapping: { criterionKey: string; matchedHeader: string | null; confidence: "haute" | "moyenne" | "faible" }[]
}

function buildCandidatePayload(templates: ReportTemplate[]) {
  return templates.map((t) => ({
    id: t.id,
    name: t.name,
    situation: t.situation,
    criteria: t.criteria.map((c) => ({
      key: c.key,
      label: c.label,
      type: c.type,
      options: c.options?.map((o) => o.label),
    })),
  }))
}

function buildSheetPayload(sheet: ParsedSheet) {
  return {
    headers: sheet.headers,
    sampleRows: sheet.rows.slice(0, MAX_SAMPLE_ROWS).map((row) =>
      row.map((cell) => String(cell ?? "").slice(0, MAX_CELL_LENGTH)),
    ),
  }
}

/**
 * Interroge le modèle pour choisir le template le plus pertinent parmi `candidates` et proposer
 * une correspondance colonnes Excel -> critères. Quand `candidates` ne contient qu'un seul
 * template, le modèle est contraint de l'utiliser et ne propose que le mappage des colonnes.
 */
export async function suggestDashboardFromExcel(params: {
  apiKey: string
  model: string
  candidates: ReportTemplate[]
  sheet: ParsedSheet
}): Promise<AiMappingSuggestion> {
  const { apiKey, model, candidates, sheet } = params
  const client = createClient(apiKey)

  const payload = {
    candidateTemplates: buildCandidatePayload(candidates),
    excelFile: buildSheetPayload(sheet),
  }

  const forcedTemplate = candidates.length === 1 ? candidates[0].id : null

  const system = [
    "Tu assistes un consultant en cybersécurité qui prépare un dashboard de reporting à partir d'un export Excel.",
    "On te fournit une liste de templates candidats (chacun avec ses critères : clé, libellé, type, options éventuelles)",
    "et le contenu détecté du fichier Excel (en-têtes de colonnes + quelques lignes d'exemple).",
    forcedTemplate
      ? `Le template à utiliser est déjà fixé : "${forcedTemplate}". Renvoie ce templateId tel quel.`
      : "Choisis le template le plus adapté au contenu réel des données, parmi les templates proposés uniquement.",
    "Pour le template retenu, propose pour chaque critère la colonne Excel correspondante en te basant sur le sens des en-têtes ET sur les valeurs d'exemple (pas seulement une correspondance textuelle littérale).",
    "matchedHeader doit être recopié EXACTEMENT comme il apparaît dans la liste des en-têtes fournie, ou null si aucune colonne ne convient.",
    "Ne propose jamais une colonne pour un critère si les valeurs d'exemple ne correspondent manifestement pas à son type ou à ses options.",
  ].join(" ")

  const response = await client.messages.parse({
    model,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: JSON.stringify(payload) }],
    output_config: { format: zodOutputFormat(MappingSuggestionSchema) },
  })

  if (!response.parsed_output) {
    throw new Error("L'IA n'a pas retourné de résultat exploitable.")
  }

  return response.parsed_output
}

/** Convertit une suggestion IA (en-têtes recopiés) en mapping critère -> index de colonne. */
export function applyAiMapping(
  template: ReportTemplate,
  sheet: ParsedSheet,
  suggestion: AiMappingSuggestion,
): Record<string, number> {
  const mapping: Record<string, number> = {}
  for (const criterion of template.criteria) {
    const entry = suggestion.columnMapping.find((m) => m.criterionKey === criterion.key)
    const headerIndex = entry?.matchedHeader ? sheet.headers.indexOf(entry.matchedHeader) : -1
    mapping[criterion.key] = headerIndex
  }
  return mapping
}
