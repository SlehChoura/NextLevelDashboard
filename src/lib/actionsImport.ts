import * as XLSX from "xlsx"
import { ACTION_STATUS_LABELS, type ActionItem, type ActionStatus } from "./actions"
import { PILOTAGE_OBJECTIVES } from "./pilotage"
import { makeId } from "./id"

const SHEET_NAME = "Actions"
const COL_KEY = "Clé"
const COL_TITLE = "Titre"
const COL_OWNER = "Porteur"
const COL_OBJECTIVE_KEY = "Clé objectif"
const COL_OBJECTIVE_LABEL = "Objectif lié"
const COL_STATUS = "Statut"
const COL_DUE_DATE = "Échéance"

const objectiveLabel = new Map(PILOTAGE_OBJECTIVES.map((o) => [o.id, o.label]))
const objectiveIdByLabel = new Map(PILOTAGE_OBJECTIVES.map((o) => [o.label.trim().toLowerCase(), o.id]))
const knownObjectiveIds = new Set(PILOTAGE_OBJECTIVES.map((o) => o.id))
const statusByLabel = new Map(
  (Object.entries(ACTION_STATUS_LABELS) as [ActionStatus, string][]).map(([status, label]) => [
    label.trim().toLowerCase(),
    status,
  ]),
)

/** Génère et télécharge un fichier des actions en cours (une ligne par action existante). */
export function downloadActionsTemplate(actions: ActionItem[]): void {
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
  const rows = source.map((a) => ({
    [COL_KEY]: a.id,
    [COL_TITLE]: a.title,
    [COL_OWNER]: a.owner,
    [COL_OBJECTIVE_KEY]: a.objectiveId,
    [COL_OBJECTIVE_LABEL]: objectiveLabel.get(a.objectiveId) ?? "",
    [COL_STATUS]: ACTION_STATUS_LABELS[a.status],
    [COL_DUE_DATE]: a.dueDate,
  }))
  const sheet = XLSX.utils.json_to_sheet(rows)
  sheet["!cols"] = [{ wch: 24 }, { wch: 42 }, { wch: 18 }, { wch: 24 }, { wch: 34 }, { wch: 12 }, { wch: 14 }]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, SHEET_NAME)
  XLSX.writeFile(workbook, "actions-ia4cyb-suivi.xlsx")
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

function resolveObjectiveId(rawKey: string, rawLabel: string): { id: string; unmatched: boolean } {
  if (!rawKey && !rawLabel) return { id: "", unmatched: false }
  if (knownObjectiveIds.has(rawKey)) return { id: rawKey, unmatched: false }
  const byLabel = objectiveIdByLabel.get(rawLabel.trim().toLowerCase())
  if (byLabel) return { id: byLabel, unmatched: false }
  return { id: "", unmatched: true }
}

function resolveStatus(raw: string): ActionStatus {
  return statusByLabel.get(raw.trim().toLowerCase()) ?? "todo"
}

/** Lit un fichier généré par {@link downloadActionsTemplate} (ou tout fichier reprenant les mêmes colonnes). */
export async function parseActionsFile(file: File, existingIds: Set<string>): Promise<ActionsImportResult> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { cellDates: false })
  const sheetName = workbook.SheetNames.includes(SHEET_NAME) ? SHEET_NAME : workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })

  const actions: ActionItem[] = []
  const unmatchedObjectives: string[] = []
  let created = 0
  let updated = 0
  let skippedNoTitle = 0

  for (const row of rows) {
    const title = String(row[COL_TITLE] ?? "").trim()
    if (!title) {
      skippedNoTitle += 1
      continue
    }
    const rawId = String(row[COL_KEY] ?? "").trim()
    const id = rawId && existingIds.has(rawId) ? rawId : makeId()
    if (rawId && existingIds.has(rawId)) updated += 1
    else created += 1

    const { id: objectiveId, unmatched } = resolveObjectiveId(
      String(row[COL_OBJECTIVE_KEY] ?? "").trim(),
      String(row[COL_OBJECTIVE_LABEL] ?? "").trim(),
    )
    if (unmatched) unmatchedObjectives.push(title)

    actions.push({
      id,
      title,
      owner: String(row[COL_OWNER] ?? "").trim(),
      objectiveId,
      status: resolveStatus(String(row[COL_STATUS] ?? "")),
      dueDate: String(row[COL_DUE_DATE] ?? "").trim(),
    })
  }

  return { actions, created, updated, unmatchedObjectives, skippedNoTitle }
}
