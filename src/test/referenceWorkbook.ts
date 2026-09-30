import * as XLSX from "xlsx"
import { ACTIONS_SHEET_NAME, DASHBOARD_SHEET_NAME, PILOTAGE_SHEET_NAME } from "../lib/combinedFormat"
import { buildCombinedWorkbook } from "../lib/combinedImport"
import { PILOTAGE_OBJECTIVES } from "../lib/pilotage"
import { DASHBOARD_HEADERS, DASHBOARD_ROWS, SEED_ACTIONS } from "../lib/seedData"

/**
 * Fichier de suivi combiné de référence, reconstruit à partir des données initiales : les onglets
 * pilotage et actions sont ceux du modèle téléchargeable, l'onglet agents reprend les lignes réelles
 * (et non la ligne d'exemple du modèle). Passé par une écriture/relecture .xlsx complète pour
 * reproduire fidèlement un import de fichier.
 */
export function referenceWorkbook(): XLSX.WorkBook {
  const values = Object.fromEntries(PILOTAGE_OBJECTIVES.map((o) => [o.id, o.defaultCurrent]))
  const targets = Object.fromEntries(PILOTAGE_OBJECTIVES.map((o) => [o.id, o.target]))
  const workbook = buildCombinedWorkbook(values, targets, SEED_ACTIONS)
  workbook.Sheets[DASHBOARD_SHEET_NAME] = XLSX.utils.aoa_to_sheet([DASHBOARD_HEADERS, ...DASHBOARD_ROWS])
  return roundTrip(workbook)
}

/** Écrit puis relit le classeur au format .xlsx, comme lors d'un import depuis un fichier. */
export function roundTrip(workbook: XLSX.WorkBook): XLSX.WorkBook {
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
  return XLSX.read(buffer, { cellDates: true })
}

/** Construit un classeur à partir de tableaux (première ligne = en-têtes), un par onglet. */
export function workbookFrom(sheets: Partial<Record<string, unknown[][]>>): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new()
  for (const [name, rows] of Object.entries(sheets)) {
    if (rows) XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), name)
  }
  return roundTrip(workbook)
}

export { ACTIONS_SHEET_NAME, DASHBOARD_SHEET_NAME, PILOTAGE_SHEET_NAME }
