import Anthropic from "@anthropic-ai/sdk"
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod"
import { z } from "zod"
import type { AiModel } from "../store/aiSettingsStore"
import type { ChartSpec, Criterion, CriterionOption, DataRow, ReportTemplate } from "../types"
import { makeId } from "./id"
import type { ParsedSheet } from "./excelImport"

/** Nombre de lignes envoyées au modèle : au-delà, le fichier est tronqué (coût / fiabilité). */
const MAX_ROWS_SENT = 300

const colorSchema = z.enum(["success", "warning", "danger", "info", "neutral"])

const optionSchema = z.object({
  value: z.string().describe("valeur technique courte, en minuscules, sans accent ni espace"),
  label: z.string().describe("libellé affiché à l'utilisateur"),
  color: colorSchema.describe("couleur RAG associée à cette valeur"),
})

const criterionSchema = z.object({
  key: z
    .string()
    .describe("clé technique unique en snake_case, sans accent ni espace (ex: 'portabilite')"),
  label: z.string().describe("libellé affiché en en-tête de colonne et dans les graphiques"),
  type: z.enum(["text", "number", "percent", "date", "select", "severity", "status"]),
  role: z
    .enum(["dimension", "metric", "date", "label", "info"])
    .describe("dimension: axe de regroupement, metric: valeur numérique moyennée, label: identifiant de la ligne"),
  options: z
    .array(optionSchema)
    .nullable()
    .describe("obligatoire (non nul, 2 à 6 valeurs) si type vaut select/severity/status ; null sinon"),
})

const chartSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.enum(["bar", "pie"]),
  criterionKey: z.string().describe("doit correspondre exactement à la clé d'un des critères définis"),
})

const templateSchema = z.object({
  name: z.string().describe("nom complet du dashboard"),
  description: z.string().describe("une phrase décrivant ce que suit ce dashboard"),
  statusKey: z
    .string()
    .nullable()
    .describe("clé du critère utilisé pour la synthèse globale en tête de dashboard, ou null si aucun ne convient"),
  criteria: z
    .array(criterionSchema)
    .min(1)
    .max(12)
    .describe("les critères (colonnes) les plus pertinents à suivre pour ces données"),
  charts: z.array(chartSchema).min(1).max(4),
})

const rowValueSchema = z.union([z.string(), z.number(), z.null()])

const analysisSchema = z.object({
  template: templateSchema,
  rows: z
    .array(z.record(z.string(), rowValueSchema))
    .describe(
      "une entrée par élément réel identifié dans les données (ex: un agent/cas d'usage par ligne), " +
        "avec une valeur par critère défini ; n'inclus jamais une ligne de légende/glossaire, de total, " +
        "ou entièrement vide",
    ),
  summary: z.string().describe("synthèse en 3 à 5 phrases, en français, des enseignements clés de l'analyse"),
})

export interface AiAnalysisResult {
  template: ReportTemplate
  rows: DataRow[]
  summary: string
  truncated: boolean
}

function sheetToText(sheet: ParsedSheet, maxRows: number): { text: string; truncated: boolean } {
  const rows = sheet.rows.slice(0, maxRows)
  const lines = [
    sheet.headers.join(" | "),
    ...rows.map((row) => sheet.headers.map((_, i) => String(row[i] ?? "")).join(" | ")),
  ]
  return { text: lines.join("\n"), truncated: sheet.rows.length > maxRows }
}

export async function analyzeSheetWithAI(
  sheet: ParsedSheet,
  apiKey: string,
  model: AiModel,
): Promise<AiAnalysisResult> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  const { text, truncated } = sheetToText(sheet, MAX_ROWS_SENT)

  const response = await client.messages.parse({
    model,
    max_tokens: 8192,
    system:
      "Tu es un analyste qui transforme un export Excel/CSV arbitraire en dashboard de reporting. " +
      "Détermine toi-même les critères (colonnes) les plus pertinents à suivre : reprends les colonnes " +
      "utiles du fichier, ignore celles qui ne le sont pas, et n'hésite pas à déduire un critère qui " +
      "n'existe pas littéralement comme colonne si l'information est présente ailleurs (par exemple un " +
      "niveau de maturité déduit d'un commentaire libre).\n\n" +
      "Identifie la colonne qui nomme ou identifie chaque élément suivi (ex: un nom de cas d'usage/agent, " +
      "un identifiant) et donne-lui le rôle 'label' : c'est elle qui répond à la question « quels sont " +
      "les éléments suivis ? ». Sois vigilant : un fichier Excel contient souvent, à la suite ou à côté " +
      "du tableau de données, un bloc de légende qui explique la signification des valeurs (par exemple " +
      "une liste 'valeur → description' pour chaque critère, ou des notes de bas de tableau). Ce bloc " +
      "n'est jamais une ligne de données réelle : ne l'inclus pas dans les lignes renvoyées, même s'il " +
      "occupe des lignes ou colonnes proches du tableau principal. De même, ignore les lignes de total, " +
      "de séparation ou entièrement vides.\n\n" +
      "Si une cellule contient une note ou un texte libre (ex: 'N/A', 'en cours', un commentaire) plutôt " +
      "qu'une valeur franche pour un critère par ailleurs numérique, préfère garder ce critère en type " +
      "'text' pour ne perdre aucune information, plutôt que de forcer un type 'number'/'percent' qui " +
      "obligerait à jeter ces valeurs.\n\n" +
      "Pour chaque élément de données identifié, renvoie les valeurs correspondant aux critères que tu " +
      "as définis. Pour un critère de type select/severity/status, chaque valeur doit correspondre " +
      "exactement à la 'value' (pas au 'label') d'une des options définies pour ce critère.",
    messages: [
      {
        role: "user",
        content:
          `Fichier fourni (colonnes séparées par " | ", une ligne d'en-tête puis les lignes de données)` +
          `${truncated ? ` — seules les ${MAX_ROWS_SENT} premières lignes sont incluses` : ""} :\n\n${text}`,
      },
    ],
    output_config: { format: zodOutputFormat(analysisSchema) },
  })

  const parsed = response.parsed_output
  if (!parsed) {
    throw new Error("L'IA n'a pas pu produire un résultat exploitable pour ce fichier.")
  }

  const criteria: Criterion[] = parsed.template.criteria.map((c) => ({
    key: c.key,
    label: c.label,
    type: c.type,
    role: c.role,
    options: c.options?.map(
      (o): CriterionOption => ({ value: o.value, label: o.label, color: o.color }),
    ),
  }))
  const criterionKeys = new Set(criteria.map((c) => c.key))

  const charts: ChartSpec[] = parsed.template.charts.filter((chart) => criterionKeys.has(chart.criterionKey))

  const template: ReportTemplate = {
    id: `ia-${makeId()}`,
    name: parsed.template.name,
    description: parsed.template.description,
    statusKey: parsed.template.statusKey && criterionKeys.has(parsed.template.statusKey) ? parsed.template.statusKey : undefined,
    criteria,
    charts,
  }

  const rows: DataRow[] = parsed.rows.map((row) => {
    const dataRow: DataRow = { __id: makeId() }
    for (const c of criteria) {
      dataRow[c.key] = row[c.key] ?? ""
    }
    return dataRow
  })

  return { template, rows, summary: parsed.summary, truncated }
}

export function describeAiError(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError) {
    return "Clé API invalide ou refusée par Anthropic. Vérifiez la clé configurée ci-dessus."
  }
  if (error instanceof Anthropic.RateLimitError) {
    return "Limite de débit atteinte sur l'API Anthropic. Réessayez dans quelques instants."
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return "Impossible de contacter l'API Anthropic. Vérifiez votre connexion réseau."
  }
  if (error instanceof Anthropic.APIError) {
    return `Erreur de l'API Anthropic (${error.status}) : ${error.message}`
  }
  if (error instanceof Error) return error.message
  return "Une erreur inattendue est survenue pendant l'analyse."
}
