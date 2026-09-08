import Anthropic from "@anthropic-ai/sdk"
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod"
import { z } from "zod"
import type { AiModel } from "../store/aiSettingsStore"
import type { AmbiguousCell } from "./fixedFormatImport"

const normalizationSchema = z.object({
  normalizations: z.array(
    z.object({
      id: z.string().describe("recopie exactement l'id fourni pour cette cellule"),
      value: z
        .union([z.number(), z.string(), z.null()])
        .describe(
          "la valeur normalisée correspondant au type attendu (nombre 0-100 pour un critère de type " +
            "'percent', ou texte court sinon) ; null si la valeur brute ne permet vraiment aucune " +
            "interprétation (ex: 'N/A', une mention explicite de non-applicabilité)",
        ),
    }),
  ),
})

/**
 * Nettoie une petite liste de cellules dont la valeur brute n'a pas pu être interprétée
 * de façon fiable par le code (ex: "~99%", une faute de frappe, une note en texte libre à la
 * place d'un pourcentage). Le mapping des colonnes et l'exclusion des lignes hors périmètre
 * (légende, etc.) restent entièrement déterministes — l'IA n'intervient que sur ces valeurs
 * déjà localisées, jamais sur la structure du fichier.
 */
export async function normalizeAmbiguousCells(
  cells: AmbiguousCell[],
  apiKey: string,
  model: AiModel,
): Promise<Map<string, string | number | null>> {
  const result = new Map<string, string | number | null>()
  if (cells.length === 0) return result

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const response = await client.messages.parse({
    model,
    max_tokens: 4096,
    thinking: model === "claude-haiku-4-5" ? { type: "enabled", budget_tokens: 1024 } : { type: "adaptive" },
    system:
      "Tu nettoies des valeurs de cellules issues d'un fichier Excel de reporting, pour qu'elles " +
      "correspondent au type attendu de leur critère. Pour un critère 'percent', déduis un nombre " +
      "entre 0 et 100 si le texte contient une information exploitable (ex: une note qui décrit " +
      "clairement un niveau d'avancement), sinon renvoie null plutôt que d'inventer un chiffre. Pour " +
      "'N/A' ou une mention explicite de non-applicabilité, renvoie toujours null. Ne renvoie jamais " +
      "d'explication, uniquement les valeurs normalisées demandées.",
    messages: [
      {
        role: "user",
        content: JSON.stringify(
          cells.map((c) => ({
            id: c.id,
            element: c.rowLabel,
            critere: c.criterionLabel,
            type_attendu: c.criterionType,
            valeur_brute: c.rawValue,
          })),
        ),
      },
    ],
    output_config: { format: zodOutputFormat(normalizationSchema) },
  })

  const parsed = response.parsed_output
  if (!parsed) {
    throw new Error("L'IA n'a pas pu produire de résultat exploitable pour le nettoyage des valeurs.")
  }

  for (const n of parsed.normalizations) result.set(n.id, n.value)
  return result
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
  return "Une erreur inattendue est survenue pendant le nettoyage des valeurs."
}
