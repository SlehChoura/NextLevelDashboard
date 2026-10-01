import * as XLSX from "xlsx"
import {
  ACT_COL_DUE_DATE,
  ACT_COL_OBJECTIVE_KEY,
  ACT_COL_OBJECTIVE_LABEL,
  ACT_COL_OWNER,
  ACT_COL_STATUS,
  ACT_COL_TITLE,
  ACTIONS_SHEET_NAME,
  DASHBOARD_SHEET_NAME,
  normalizeText,
  PIL_COL_CURRENT,
  PIL_COL_KEY,
  PIL_COL_LABEL,
  PIL_COL_TARGET,
  PILOTAGE_SHEET_NAME,
  STATUS_SYNONYMS,
} from "./combinedFormat"
import { findObjectiveIdByKey, findObjectiveIdByLabel, PILOTAGE_OBJECTIVES } from "./pilotage"
import { DASHBOARD_HEADERS } from "./seedData"

/**
 * Contrôle de cohérence d'un fichier de suivi combiné, indépendant de l'import lui-même : chaque
 * message décrit une anomalie (onglet, ligne/colonne Excel) qui ferait perdre ou mal interpréter
 * une donnée à l'import. Un fichier sans anomalie renvoie une liste vide.
 */
export function checkCombinedWorkbook(workbook: XLSX.WorkBook): string[] {
  return [...checkPilotageSheet(workbook), ...checkActionsSheet(workbook), ...checkDashboardSheet(workbook)]
}

interface Grid {
  headers: string[]
  /** Lignes de données avec leur numéro de ligne Excel (1 = ligne d'en-tête). */
  rows: { line: number; cells: unknown[] }[]
}

function readGrid(workbook: XLSX.WorkBook, sheetName: string): Grid | null {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) return null
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: "", blankrows: true })
  const [headerRow = [], ...rest] = matrix
  return {
    headers: headerRow.map((h) => String(h ?? "").trim()),
    rows: rest
      .map((cells, i) => ({ line: i + 2, cells }))
      .filter(({ cells }) => cells.some((c) => String(c ?? "").trim() !== "")),
  }
}

function cellText(cells: unknown[], index: number): string {
  return index < 0 ? "" : String(cells[index] ?? "").trim()
}

function columnIndex(grid: Grid, header: string): number {
  return grid.headers.findIndex((h) => normalizeText(h) === normalizeText(header))
}

function isNumeric(raw: unknown): boolean {
  if (typeof raw === "number") return Number.isFinite(raw)
  const s = String(raw ?? "").trim().replace(",", ".")
  return s !== "" && Number.isFinite(Number(s))
}

function requireColumns(grid: Grid, sheetName: string, headers: string[]): string[] {
  return headers
    .filter((h) => columnIndex(grid, h) < 0)
    .map((h) => `[${sheetName}] Colonne « ${h} » introuvable dans la ligne d'en-tête.`)
}

function objectiveLabel(id: string): string {
  return PILOTAGE_OBJECTIVES.find((o) => o.id === id)?.label ?? id
}

function checkPilotageSheet(workbook: XLSX.WorkBook): string[] {
  const grid = readGrid(workbook, PILOTAGE_SHEET_NAME)
  if (!grid) return []
  const sheet = PILOTAGE_SHEET_NAME
  const warnings = requireColumns(grid, sheet, [PIL_COL_KEY, PIL_COL_LABEL, PIL_COL_CURRENT, PIL_COL_TARGET])
  const keyCol = columnIndex(grid, PIL_COL_KEY)
  const labelCol = columnIndex(grid, PIL_COL_LABEL)
  const currentCol = columnIndex(grid, PIL_COL_CURRENT)
  const targetCol = columnIndex(grid, PIL_COL_TARGET)
  const seen = new Map<string, number>()

  for (const { line, cells } of grid.rows) {
    const key = cellText(cells, keyCol)
    const label = cellText(cells, labelCol)
    const byKey = findObjectiveIdByKey(key)
    const byLabel = findObjectiveIdByLabel(label)
    const id = byKey ?? byLabel

    if (!id) {
      warnings.push(`[${sheet}] Ligne ${line} : objectif « ${label || key} » inconnu de l'application, ligne ignorée.`)
      continue
    }
    if (key && !byKey) {
      warnings.push(`[${sheet}] Ligne ${line} : clé « ${key} » inconnue (objectif reconnu par son libellé).`)
    } else if (label && byLabel !== id) {
      warnings.push(
        `[${sheet}] Ligne ${line} : le libellé « ${label} » ne correspond pas à la clé « ${key} » (« ${objectiveLabel(id)} »).`,
      )
    }
    if (seen.has(id)) {
      warnings.push(`[${sheet}] Ligne ${line} : objectif « ${objectiveLabel(id)} » en double (déjà ligne ${seen.get(id)}).`)
    }
    seen.set(id, line)
    for (const [col, name] of [
      [currentCol, PIL_COL_CURRENT],
      [targetCol, PIL_COL_TARGET],
    ] as const) {
      if (col < 0 || isNumeric(cells[col])) continue
      const text = cellText(cells, col)
      warnings.push(
        text
          ? `[${sheet}] Ligne ${line} : « ${name} » n'est pas un nombre (« ${text} »), valeur ignorée.`
          : `[${sheet}] Ligne ${line} : « ${name} » vide, valeur inchangée.`,
      )
    }
  }

  for (const o of PILOTAGE_OBJECTIVES) {
    if (!seen.has(o.id)) warnings.push(`[${sheet}] Objectif « ${o.label} » absent du fichier (valeur inchangée).`)
  }
  return warnings
}

function sameText(a: string | undefined, b: string): boolean {
  return a !== undefined && normalizeText(a) === normalizeText(b)
}

function pilotageLabelsInFile(workbook: XLSX.WorkBook): Map<string, string> {
  const labels = new Map<string, string>()
  const grid = readGrid(workbook, PILOTAGE_SHEET_NAME)
  if (!grid) return labels
  const keyCol = columnIndex(grid, PIL_COL_KEY)
  const labelCol = columnIndex(grid, PIL_COL_LABEL)
  for (const { cells } of grid.rows) {
    const id = findObjectiveIdByKey(cellText(cells, keyCol))
    const label = cellText(cells, labelCol)
    if (id && label) labels.set(id, label)
  }
  return labels
}

function checkActionsSheet(workbook: XLSX.WorkBook): string[] {
  const grid = readGrid(workbook, ACTIONS_SHEET_NAME)
  if (!grid) return []
  const sheet = ACTIONS_SHEET_NAME
  const warnings = requireColumns(grid, sheet, [ACT_COL_TITLE, ACT_COL_STATUS])
  const col = {
    title: columnIndex(grid, ACT_COL_TITLE),
    owner: columnIndex(grid, ACT_COL_OWNER),
    objectiveKey: columnIndex(grid, ACT_COL_OBJECTIVE_KEY),
    objectiveLabel: columnIndex(grid, ACT_COL_OBJECTIVE_LABEL),
    status: columnIndex(grid, ACT_COL_STATUS),
    dueDate: columnIndex(grid, ACT_COL_DUE_DATE),
  }
  const seenTitles = new Map<string, number>()
  // Libellés tels qu'écrits dans l'onglet pilotage du même fichier : une action qui reprend ce
  // libellé (même avec une coquille) désigne bien le même objectif que sa clé.
  const fileLabels = pilotageLabelsInFile(workbook)

  for (const { line, cells } of grid.rows) {
    const title = cellText(cells, col.title)
    if (!title) {
      warnings.push(`[${sheet}] Ligne ${line} : action sans titre, ligne ignorée.`)
      continue
    }
    const normalizedTitle = normalizeText(title)
    if (seenTitles.has(normalizedTitle)) {
      warnings.push(`[${sheet}] Ligne ${line} : action « ${title} » en double (déjà ligne ${seenTitles.get(normalizedTitle)}).`)
    }
    seenTitles.set(normalizedTitle, line)

    if (col.owner >= 0 && !cellText(cells, col.owner)) {
      warnings.push(`[${sheet}] Ligne ${line} : action « ${title} » sans porteur.`)
    }

    const key = cellText(cells, col.objectiveKey)
    const label = cellText(cells, col.objectiveLabel)
    const byKey = findObjectiveIdByKey(key)
    const byLabel = findObjectiveIdByLabel(label)
    if ((key || label) && !byKey && !byLabel) {
      warnings.push(`[${sheet}] Ligne ${line} : objectif lié « ${key || label} » inconnu, action non rattachée.`)
    } else if (key && !byKey) {
      warnings.push(`[${sheet}] Ligne ${line} : clé objectif « ${key} » inconnue (objectif reconnu par son libellé).`)
    } else if (byKey && label && byLabel !== byKey && !sameText(fileLabels.get(byKey), label)) {
      warnings.push(
        `[${sheet}] Ligne ${line} : « ${ACT_COL_OBJECTIVE_KEY} » (${key} = « ${objectiveLabel(byKey)} ») et « ${ACT_COL_OBJECTIVE_LABEL} » (« ${label} ») ne désignent pas le même objectif — la clé est retenue.`,
      )
    }

    const status = cellText(cells, col.status)
    if (!STATUS_SYNONYMS[normalizeText(status)]) {
      warnings.push(`[${sheet}] Ligne ${line} : statut « ${status} » non reconnu, « À faire » appliqué par défaut.`)
    }

    const due = col.dueDate >= 0 ? cells[col.dueDate] : ""
    const dueText = String(due ?? "").trim()
    if (dueText && !(due instanceof Date) && !/^\d{4}-\d{2}-\d{2}$/.test(dueText)) {
      warnings.push(`[${sheet}] Ligne ${line} : échéance « ${dueText} » illisible (attendu : date Excel ou AAAA-MM-JJ).`)
    }
  }
  return warnings
}

/** Colonnes de l'onglet agents attendues en pourcentage (0-1 dans Excel, ou texte "50%"). */
const PERCENT_HEADERS = new Set(["Portabilité", "Documentation", "Formation", "Communauté", "Ready to market"])
const COUNT_HEADER = "Nombre de missions réalisées"
const LEADING_NUMBER = /^[~≈]?\s*\d+(?:[.,]\d+)?/

/** "N/A", éventuellement suivi d'un commentaire (ex: "N/A\nUse case interne uniquement"). */
function isNotApplicable(value: string): boolean {
  return /^n\s*\/?\s*a\b/i.test(value)
}

function checkDashboardSheet(workbook: XLSX.WorkBook): string[] {
  const grid = readGrid(workbook, DASHBOARD_SHEET_NAME)
  if (!grid) return []
  const sheet = DASHBOARD_SHEET_NAME
  const warnings: string[] = []

  const present = new Set(grid.headers.filter(Boolean).map(normalizeText))
  const expected = new Set(DASHBOARD_HEADERS.map(normalizeText))
  for (const h of DASHBOARD_HEADERS) {
    if (!present.has(normalizeText(h))) warnings.push(`[${sheet}] Colonne attendue « ${h} » absente.`)
  }
  grid.headers.forEach((h, i) => {
    if (h && !expected.has(normalizeText(h))) {
      warnings.push(`[${sheet}] Colonne ${XLSX.utils.encode_col(i)} « ${h} » non prévue par le modèle (importée telle quelle).`)
    }
  })

  const agentRows = grid.rows.filter(({ cells }) => cellText(cells, 0) !== "")
  const seenAgents = new Map<string, number>()
  for (const { line, cells } of agentRows) {
    const agent = cellText(cells, 0)
    const normalized = normalizeText(agent)
    if (seenAgents.has(normalized)) {
      warnings.push(`[${sheet}] Ligne ${line} : agent « ${agent} » en double (déjà ligne ${seenAgents.get(normalized)}).`)
    }
    seenAgents.set(normalized, line)

    cells.forEach((cell, i) => {
      const value = String(cell ?? "").trim()
      if (i === 0 || value === "") return
      const header = grid.headers[i] ?? ""
      const where = `[${sheet}] ${XLSX.utils.encode_col(i)}${line} (${agent})`
      if (!header) {
        warnings.push(`${where} : valeur « ${value} » dans une colonne sans en-tête, ignorée à l'import.`)
        return
      }
      const canonical = DASHBOARD_HEADERS.find((h) => normalizeText(h) === normalizeText(header))
      const isNumber = typeof cell === "number" || LEADING_NUMBER.test(value)
      if (canonical && PERCENT_HEADERS.has(canonical) && !isNumber && !isNotApplicable(value)) {
        warnings.push(`${where} : « ${header} » devrait être un pourcentage (« ${value} »).`)
      }
      if (canonical === COUNT_HEADER && !isNumber && !isNotApplicable(value)) {
        warnings.push(`${where} : « ${header} » devrait être un nombre (« ${value} »).`)
      }
    })
  }

  for (const { line, cells } of grid.rows) {
    if (cellText(cells, 0) === "") {
      warnings.push(`[${sheet}] Ligne ${line} : ligne renseignée sans nom d'agent (colonne A), ignorée à l'import.`)
    }
  }
  return warnings
}
