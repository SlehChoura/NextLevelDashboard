import * as XLSX from "xlsx"
import { parseWorkbookFile, readSheet } from "./excelImport"
import { buildFromSheet, type FixedFormatImportResult } from "./fixedFormatImport"
import { CATEGORY_LABELS, PILOTAGE_OBJECTIVES } from "./pilotage"
import { ACTION_STATUS_LABELS, type ActionItem, type ActionStatus } from "./actions"
import { makeId } from "./id"

export const PILOTAGE_SHEET_NAME = "Suivi pilotage"
export const ACTIONS_SHEET_NAME = "Actions"
export const DASHBOARD_SHEET_NAME = "Agents IA4CYB"

const PIL_COL_KEY = "Clé"
const PIL_COL_CATEGORY = "Catégorie"
const PIL_COL_LABEL = "Indicateur"
const PIL_COL_CURRENT = "Valeur actuelle"
const PIL_COL_TARGET = "Cible"
const PIL_COL_UNIT = "Unité"

const ACT_COL_KEY = "Clé"
const ACT_COL_TITLE = "Titre"
const ACT_COL_OWNER = "Porteur"
const ACT_COL_OBJECTIVE_KEY = "Clé objectif"
const ACT_COL_OBJECTIVE_LABEL = "Objectif lié"
const ACT_COL_STATUS = "Statut"
const ACT_COL_DUE_DATE = "Échéance"

const DASHBOARD_HEADERS = [
  "Nos agents IA4CYB",
  "Status",
  "Portabilité",
  "Documentation",
  "Formation",
  "Communauté",
  "Ready to market",
  "Propale type",
  "Nombre de missions réalisées",
  "Publication dans le showcase AI",
]

function parseNumber(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null
  if (typeof raw === "string") {
    const n = Number(raw.trim().replace(",", "."))
    return Number.isFinite(n) ? n : null
  }
  return null
}

function normalizeText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
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

const pilotageLabelToId = new Map(PILOTAGE_OBJECTIVES.map((o) => [o.label.trim().toLowerCase(), o.id]))
const knownPilotageIds = new Set(PILOTAGE_OBJECTIVES.map((o) => o.id))

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
    const id = knownPilotageIds.has(rawKey) ? rawKey : pilotageLabelToId.get(rawLabel.toLowerCase())

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
  actions: ActionItem[]
  created: number
  updated: number
  /** Lignes importées mais dont l'objectif lié n'a pas été reconnu (laissé vide). */
  unmatchedObjectives: string[]
  /** Lignes ignorées faute de titre renseigné. */
  skippedNoTitle: number
}

const actionObjectiveIdByLabel = new Map(PILOTAGE_OBJECTIVES.map((o) => [o.label.trim().toLowerCase(), o.id]))
const knownActionObjectiveIds = new Set(PILOTAGE_OBJECTIVES.map((o) => o.id))

const STATUS_SYNONYMS: Record<string, ActionStatus> = {
  ...Object.fromEntries(
    (Object.entries(ACTION_STATUS_LABELS) as [ActionStatus, string][]).map(([status, label]) => [
      normalizeText(label),
      status,
    ]),
  ),
  "a faire": "todo",
  todo: "todo",
  "en cours": "in_progress",
  "in progress": "in_progress",
  fait: "done",
  termine: "done",
  done: "done",
}

function resolveActionObjectiveId(rawKey: string, rawLabel: string): { id: string; unmatched: boolean } {
  if (!rawKey && !rawLabel) return { id: "", unmatched: false }
  if (knownActionObjectiveIds.has(rawKey)) return { id: rawKey, unmatched: false }
  const byLabel = actionObjectiveIdByLabel.get(rawLabel.trim().toLowerCase())
  if (byLabel) return { id: byLabel, unmatched: false }
  return { id: "", unmatched: true }
}

function resolveActionStatus(raw: string): ActionStatus {
  return STATUS_SYNONYMS[normalizeText(raw)] ?? "todo"
}

function readActionsSheet(workbook: XLSX.WorkBook, existingIds: Set<string>): ActionsImportResult | null {
  if (!workbook.SheetNames.includes(ACTIONS_SHEET_NAME)) return null
  const sheet = workbook.Sheets[ACTIONS_SHEET_NAME]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })

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
    const id = rawId && existingIds.has(rawId) ? rawId : makeId()
    if (rawId && existingIds.has(rawId)) updated += 1
    else created += 1

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

  return { actions, created, updated, unmatchedObjectives, skippedNoTitle }
}

// ---------------------------------------------------------------------------
// Onglet dashboard ("Agents IA4CYB")
// ---------------------------------------------------------------------------

function buildDashboardRows() {
  return [
    {
      [DASHBOARD_HEADERS[0]]: "(exemple à remplacer ou supprimer) Mon agent IA",
      [DASHBOARD_HEADERS[1]]: "WIP",
      [DASHBOARD_HEADERS[2]]: 50,
      [DASHBOARD_HEADERS[3]]: 50,
      [DASHBOARD_HEADERS[4]]: 25,
      [DASHBOARD_HEADERS[5]]: 25,
      [DASHBOARD_HEADERS[6]]: 25,
      [DASHBOARD_HEADERS[7]]: "N/A",
      [DASHBOARD_HEADERS[8]]: 0,
      [DASHBOARD_HEADERS[9]]: "Non",
    },
  ]
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

export function downloadCombinedTemplate(
  values: Record<string, number>,
  targets: Record<string, number>,
  actions: ActionItem[],
): void {
  const workbook = XLSX.utils.book_new()

  const pilotageSheet = XLSX.utils.json_to_sheet(buildPilotageRows(values, targets))
  pilotageSheet["!cols"] = [{ wch: 24 }, { wch: 16 }, { wch: 42 }, { wch: 16 }, { wch: 12 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(workbook, pilotageSheet, PILOTAGE_SHEET_NAME)

  const actionsSheet = XLSX.utils.json_to_sheet(buildActionsRows(actions))
  actionsSheet["!cols"] = [{ wch: 24 }, { wch: 42 }, { wch: 18 }, { wch: 24 }, { wch: 34 }, { wch: 12 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(workbook, actionsSheet, ACTIONS_SHEET_NAME)

  const dashboardSheet = XLSX.utils.json_to_sheet(buildDashboardRows())
  dashboardSheet["!cols"] = DASHBOARD_HEADERS.map((h) => ({ wch: Math.max(14, Math.min(40, h.length + 4)) }))
  XLSX.utils.book_append_sheet(workbook, dashboardSheet, DASHBOARD_SHEET_NAME)

  XLSX.writeFile(workbook, "ia4cyb-suivi-complet.xlsx")
}

export interface CombinedImportResult {
  pilotage: PilotageImportResult | null
  actions: ActionsImportResult | null
  dashboard: FixedFormatImportResult | null
}

/**
 * Lit un fichier généré par {@link downloadCombinedTemplate} (3 onglets nommés "Suivi pilotage",
 * "Actions" et "Agents IA4CYB"). Chaque onglet absent du fichier importé est simplement ignoré —
 * un fichier ne contenant qu'un seul des trois onglets fonctionne aussi.
 */
export async function parseCombinedFile(file: File, existingActionIds: Set<string>): Promise<CombinedImportResult> {
  const workbook = await parseWorkbookFile(file)
  return {
    pilotage: readPilotageSheet(workbook),
    actions: readActionsSheet(workbook, existingActionIds),
    dashboard: readDashboardSheet(workbook),
  }
}
