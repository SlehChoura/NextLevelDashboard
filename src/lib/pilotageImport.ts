import * as XLSX from "xlsx"
import { CATEGORY_LABELS, PILOTAGE_OBJECTIVES } from "./pilotage"

const SHEET_NAME = "Suivi pilotage"
const COL_KEY = "Clé"
const COL_CATEGORY = "Catégorie"
const COL_LABEL = "Indicateur"
const COL_CURRENT = "Valeur actuelle"
const COL_TARGET = "Cible"
const COL_UNIT = "Unité"

/** Génère et télécharge le modèle à compléter (une ligne par objectif suivi). */
export function downloadPilotageTemplate(values: Record<string, number>): void {
  const rows = PILOTAGE_OBJECTIVES.map((o) => ({
    [COL_KEY]: o.id,
    [COL_CATEGORY]: CATEGORY_LABELS[o.category],
    [COL_LABEL]: o.label,
    [COL_CURRENT]: values[o.id] ?? o.defaultCurrent,
    [COL_TARGET]: o.target,
    [COL_UNIT]: o.unit,
  }))
  const sheet = XLSX.utils.json_to_sheet(rows)
  sheet["!cols"] = [{ wch: 24 }, { wch: 16 }, { wch: 42 }, { wch: 16 }, { wch: 12 }, { wch: 16 }]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, SHEET_NAME)
  XLSX.writeFile(workbook, "pilotage-ia4cyb-suivi.xlsx")
}

export interface PilotageImportResult {
  /** Nouvelles valeurs "Valeur actuelle" par identifiant d'objectif, prêtes à enregistrer. */
  updates: Record<string, number>
  /** Lignes dont l'objectif n'a pas pu être identifié (clé et libellé inconnus). */
  unmatched: string[]
}

const labelToId = new Map(PILOTAGE_OBJECTIVES.map((o) => [o.label.trim().toLowerCase(), o.id]))
const knownIds = new Set(PILOTAGE_OBJECTIVES.map((o) => o.id))

function parseNumber(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null
  if (typeof raw === "string") {
    const n = Number(raw.trim().replace(",", "."))
    return Number.isFinite(n) ? n : null
  }
  return null
}

/** Lit un fichier généré par {@link downloadPilotageTemplate} (ou tout fichier reprenant les mêmes colonnes). */
export async function parsePilotageFile(file: File): Promise<PilotageImportResult> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { cellDates: false })
  const sheetName = workbook.SheetNames.includes(SHEET_NAME) ? SHEET_NAME : workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })

  const updates: Record<string, number> = {}
  const unmatched: string[] = []

  for (const row of rows) {
    const rawKey = String(row[COL_KEY] ?? "").trim()
    const rawLabel = String(row[COL_LABEL] ?? "").trim()
    const id = knownIds.has(rawKey) ? rawKey : labelToId.get(rawLabel.toLowerCase())
    const current = parseNumber(row[COL_CURRENT])

    if (!id) {
      if (rawKey || rawLabel) unmatched.push(rawLabel || rawKey)
      continue
    }
    if (current === null) continue
    updates[id] = current
  }

  return { updates, unmatched }
}
