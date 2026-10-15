import * as XLSX from "xlsx"
import { parseWorkbookFile, readSheet } from "./excelImport"
import { buildFromSheet, type FixedFormatImportResult } from "./fixedFormatImport"
import { CATEGORY_LABELS, findObjectiveIdByKey, findObjectiveIdByLabel, PILOTAGE_OBJECTIVES } from "./pilotage"
import { ACTION_STATUS_LABELS, type ActionItem, type ActionStatus } from "./actions"
import { makeId } from "./id"
import { DASHBOARD_HEADERS } from "./seedData"
import { checkCombinedWorkbook } from "./workbookCheck"
import { getOption } from "./criteria"
import type { Criterion, DataRow, ReportData } from "../types"
import {
  ACT_COL_DUE_DATE,
  ACT_COL_KEY,
  ACT_COL_OBJECTIVE_KEY,
  ACT_COL_OBJECTIVE_LABEL,
  ACT_COL_OWNER,
  ACT_COL_STATUS,
  ACT_COL_TITLE,
  ACTIONS_SHEET_NAME,
  DASHBOARD_SHEET_NAME,
  normalizeText,
  STATUS_SYNONYMS,
  PIL_COL_CATEGORY,
  PIL_COL_CURRENT,
  PIL_COL_KEY,
  PIL_COL_LABEL,
  PIL_COL_TARGET,
  PIL_COL_UNIT,
  PILOTAGE_SHEET_NAME,
} from "./combinedFormat"

export { ACTIONS_SHEET_NAME, DASHBOARD_SHEET_NAME, PILOTAGE_SHEET_NAME }

/** Une cellule numérique, ou null si elle est vide ou illisible (une cellule vide ne vaut pas 0). */
function parseNumber(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null
  if (typeof raw === "string") {
    const text = raw.trim()
    if (text === "") return null
    const n = Number(text.replace(",", "."))
    return Number.isFinite(n) ? n : null
  }
  return null
}

/** Une date de cellule Excel (objet Date en UTC minuit avec `cellDates: true`) vers "YYYY-MM-DD". */
function toDateInputValue(raw: unknown): string {
  if (raw instanceof Date) {
    const y = raw.getUTCFullYear()
    const m = String(raw.getUTCMonth() + 1).padStart(2, "0")
    const d = String(raw.getUTCDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }
  const s = String(raw ?? "").trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ""
}

// ---------------------------------------------------------------------------
// Onglet "Suivi pilotage"
// ---------------------------------------------------------------------------

function buildPilotageRows(values: Record<string, number>, targets: Record<string, number>) {
  return PILOTAGE_OBJECTIVES.map((o) => ({
    [PIL_COL_KEY]: o.id,
    [PIL_COL_CATEGORY]: CATEGORY_LABELS[o.category],
    [PIL_COL_LABEL]: o.label,
    [PIL_COL_CURRENT]: values[o.id] ?? o.defaultCurrent,
    [PIL_COL_TARGET]: targets[o.id] ?? o.target,
    [PIL_COL_UNIT]: o.unit,
  }))
}

export interface PilotageImportResult {
  /** Nouvelles valeurs "Valeur actuelle" par identifiant d'objectif, prêtes à enregistrer. */
  valueUpdates: Record<string, number>
  /** Nouvelles valeurs "Cible" par identifiant d'objectif, prêtes à enregistrer. */
  targetUpdates: Record<string, number>
  /** Lignes dont l'objectif n'a pas pu être identifié (clé et libellé inconnus). */
  unmatched: string[]
}

function readPilotageSheet(workbook: XLSX.WorkBook): PilotageImportResult | null {
  if (!workbook.SheetNames.includes(PILOTAGE_SHEET_NAME)) return null
  const sheet = workbook.Sheets[PILOTAGE_SHEET_NAME]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })

  const valueUpdates: Record<string, number> = {}
  const targetUpdates: Record<string, number> = {}
  const unmatched: string[] = []

  for (const row of rows) {
    const rawKey = String(row[PIL_COL_KEY] ?? "").trim()
    const rawLabel = String(row[PIL_COL_LABEL] ?? "").trim()
    const id = findObjectiveIdByKey(rawKey) ?? findObjectiveIdByLabel(rawLabel)

    if (!id) {
      if (rawKey || rawLabel) unmatched.push(rawLabel || rawKey)
      continue
    }
    const current = parseNumber(row[PIL_COL_CURRENT])
    if (current !== null) valueUpdates[id] = current
    const target = parseNumber(row[PIL_COL_TARGET])
    if (target !== null) targetUpdates[id] = target
  }

  return { valueUpdates, targetUpdates, unmatched }
}

// ---------------------------------------------------------------------------
// Onglet "Actions"
// ---------------------------------------------------------------------------

function buildActionsRows(actions: ActionItem[]) {
  const objectiveLabel = new Map(PILOTAGE_OBJECTIVES.map((o) => [o.id, o.label]))
  const source =
    actions.length > 0
      ? actions
      : [
          {
            id: "",
            title: "(exemple à remplacer ou supprimer) Sécuriser les accès API de l'agent X",
            owner: "Prénom Nom",
            objectiveId: PILOTAGE_OBJECTIVES[0]?.id ?? "",
            status: "todo" as ActionStatus,
            dueDate: "",
          },
        ]
  return source.map((a) => ({
    [ACT_COL_KEY]: a.id,
    [ACT_COL_TITLE]: a.title,
    [ACT_COL_OWNER]: a.owner,
    [ACT_COL_OBJECTIVE_KEY]: a.objectiveId,
    [ACT_COL_OBJECTIVE_LABEL]: objectiveLabel.get(a.objectiveId) ?? "",
    [ACT_COL_STATUS]: ACTION_STATUS_LABELS[a.status],
    [ACT_COL_DUE_DATE]: a.dueDate,
  }))
}

export interface ActionsImportResult {
  /** Liste complète des actions après import (remplace la liste existante). */
  actions: ActionItem[]
  created: number
  updated: number
  /** Actions existantes absentes du fichier, retirées de la liste. */
  removed: number
  /** Lignes importées mais dont l'objectif lié n'a pas été reconnu (laissé vide). */
  unmatchedObjectives: string[]
  /** Lignes ignorées faute de titre renseigné. */
  skippedNoTitle: number
}

function resolveActionObjectiveId(rawKey: string, rawLabel: string): { id: string; unmatched: boolean } {
  if (!rawKey && !rawLabel) return { id: "", unmatched: false }
  const id = findObjectiveIdByKey(rawKey) ?? findObjectiveIdByLabel(rawLabel)
  return id ? { id, unmatched: false } : { id: "", unmatched: true }
}

function resolveActionStatus(raw: string): ActionStatus {
  return STATUS_SYNONYMS[normalizeText(raw)] ?? "todo"
}

/**
 * Lit l'onglet Actions. Le fichier fait foi : la liste obtenue remplace intégralement les actions
 * existantes (une action absente du fichier est retirée). Une ligne est rattachée à une action
 * existante par sa clé, ou à défaut par son titre, pour conserver son identifiant : réimporter
 * plusieurs fois le même fichier ne crée donc jamais de doublon.
 */
function readActionsSheet(workbook: XLSX.WorkBook, existingActions: ActionItem[]): ActionsImportResult | null {
  if (!workbook.SheetNames.includes(ACTIONS_SHEET_NAME)) return null
  const sheet = workbook.Sheets[ACTIONS_SHEET_NAME]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })

  const byId = new Map(existingActions.map((a) => [a.id, a]))
  const matched = new Set<string>()
  const findByTitle = (title: string) =>
    existingActions.find((a) => !matched.has(a.id) && normalizeText(a.title) === normalizeText(title))

  const actions: ActionItem[] = []
  const unmatchedObjectives: string[] = []
  let created = 0
  let updated = 0
  let skippedNoTitle = 0

  for (const row of rows) {
    const title = String(row[ACT_COL_TITLE] ?? "").trim()
    if (!title) {
      skippedNoTitle += 1
      continue
    }
    const rawId = String(row[ACT_COL_KEY] ?? "").trim()
    const existing = (rawId && !matched.has(rawId) ? byId.get(rawId) : undefined) ?? findByTitle(title)
    const id = existing ? existing.id : makeId()
    if (existing) {
      matched.add(existing.id)
      updated += 1
    } else {
      created += 1
    }

    const { id: objectiveId, unmatched } = resolveActionObjectiveId(
      String(row[ACT_COL_OBJECTIVE_KEY] ?? "").trim(),
      String(row[ACT_COL_OBJECTIVE_LABEL] ?? "").trim(),
    )
    if (unmatched) unmatchedObjectives.push(title)

    actions.push({
      id,
      title,
      owner: String(row[ACT_COL_OWNER] ?? "").trim(),
      objectiveId,
      status: resolveActionStatus(String(row[ACT_COL_STATUS] ?? "")),
      dueDate: toDateInputValue(row[ACT_COL_DUE_DATE]),
    })
  }

  // Un onglet Actions vide (ex: en-têtes seuls) ne doit pas effacer toutes les actions existantes.
  if (actions.length === 0) return null
  const removed = existingActions.filter((a) => !matched.has(a.id)).length
  return { actions, created, updated, removed, unmatchedObjectives, skippedNoTitle }
}

// ---------------------------------------------------------------------------
// Onglet dashboard ("Agents IA4CYB")
// ---------------------------------------------------------------------------

function buildExampleDashboardRows() {
  return [
    {
      [DASHBOARD_HEADERS[0]]: "(exemple à remplacer ou supprimer) Mon agent IA",
      [DASHBOARD_HEADERS[1]]: "WIP",
      [DASHBOARD_HEADERS[2]]: 50,
      [DASHBOARD_HEADERS[3]]: 50,
      [DASHBOARD_HEADERS[4]]: 25,
      [DASHBOARD_HEADERS[5]]: 25,
      [DASHBOARD_HEADERS[6]]: 25,
      [DASHBOARD_HEADERS[7]]: "Oui",
      [DASHBOARD_HEADERS[8]]: 0,
      [DASHBOARD_HEADERS[9]]: "Non",
    },
  ]
}

/** Valeur d'une cellule telle qu'écrite dans le fichier, relisible à l'identique par l'import. */
function exportCell(criterion: Criterion, raw: DataRow[string]): string | number {
  if (raw === null || raw === undefined || raw === "") return ""
  if (criterion.type === "percent" && typeof raw === "number") return `${raw}%`
  if (criterion.options) return getOption(criterion, raw)?.label ?? String(raw)
  return raw
}

/** Onglet agents pré-rempli avec le dashboard actuel (colonnes = critères, dans leur ordre). */
function buildDashboardSheet(report: ReportData | undefined): XLSX.WorkSheet {
  if (!report || report.rows.length === 0) {
    const sheet = XLSX.utils.json_to_sheet(buildExampleDashboardRows())
    sheet["!cols"] = DASHBOARD_HEADERS.map((h) => ({ wch: Math.max(14, Math.min(40, h.length + 4)) }))
    return sheet
  }
  const { criteria } = report.template
  const sheet = XLSX.utils.aoa_to_sheet([
    criteria.map((c) => c.label),
    ...report.rows.map((row) => criteria.map((c) => exportCell(c, row[c.key]))),
  ])
  sheet["!cols"] = criteria.map((c, i) => ({ wch: i === 0 ? 48 : Math.max(14, Math.min(40, c.label.length + 4)) }))
  return sheet
}

function readDashboardSheet(workbook: XLSX.WorkBook): FixedFormatImportResult | null {
  if (!workbook.SheetNames.includes(DASHBOARD_SHEET_NAME)) return null
  const parsed = readSheet(workbook, DASHBOARD_SHEET_NAME)
  const result = buildFromSheet(parsed)
  return result.rows.length > 0 ? result : null
}

// ---------------------------------------------------------------------------
// Modèle combiné (3 onglets) et import combiné
// ---------------------------------------------------------------------------

/** Construit le classeur du modèle combiné (3 onglets), pré-rempli avec l'état courant (dashboard compris). */
export function buildCombinedWorkbook(
  values: Record<string, number>,
  targets: Record<string, number>,
  actions: ActionItem[],
  report?: ReportData,
): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new()

  const pilotageSheet = XLSX.utils.json_to_sheet(buildPilotageRows(values, targets))
  pilotageSheet["!cols"] = [{ wch: 24 }, { wch: 16 }, { wch: 42 }, { wch: 16 }, { wch: 12 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(workbook, pilotageSheet, PILOTAGE_SHEET_NAME)

  const actionsSheet = XLSX.utils.json_to_sheet(buildActionsRows(actions))
  actionsSheet["!cols"] = [{ wch: 24 }, { wch: 42 }, { wch: 18 }, { wch: 24 }, { wch: 34 }, { wch: 12 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(workbook, actionsSheet, ACTIONS_SHEET_NAME)

  XLSX.utils.book_append_sheet(workbook, buildDashboardSheet(report), DASHBOARD_SHEET_NAME)

  return workbook
}

export function downloadCombinedTemplate(
  values: Record<string, number>,
  targets: Record<string, number>,
  actions: ActionItem[],
  report?: ReportData,
): void {
  XLSX.writeFile(buildCombinedWorkbook(values, targets, actions, report), "ia4cyb-suivi-complet.xlsx")
}

export interface CombinedImportResult {
  pilotage: PilotageImportResult | null
  actions: ActionsImportResult | null
  dashboard: FixedFormatImportResult | null
  /** Incohérences détectées dans le fichier (voir {@link checkCombinedWorkbook}), à signaler à l'utilisateur. */
  warnings: string[]
}

/**
 * Lit un fichier généré par {@link downloadCombinedTemplate} (3 onglets nommés "Suivi pilotage",
 * "Actions" et "Agents IA4CYB"). Chaque onglet absent du fichier importé est simplement ignoré —
 * un fichier ne contenant qu'un seul des trois onglets fonctionne aussi.
 */
export async function parseCombinedFile(file: File, existingActions: ActionItem[]): Promise<CombinedImportResult> {
  return parseCombinedWorkbook(await parseWorkbookFile(file), existingActions)
}

export function parseCombinedWorkbook(workbook: XLSX.WorkBook, existingActions: ActionItem[]): CombinedImportResult {
  return {
    pilotage: readPilotageSheet(workbook),
    actions: readActionsSheet(workbook, existingActions),
    dashboard: readDashboardSheet(workbook),
    warnings: checkCombinedWorkbook(workbook),
  }
}
