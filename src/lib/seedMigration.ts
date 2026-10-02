import type { ActionItem } from "./actions"
import type { ReportData } from "../types"
import { normalizeKnownColumns } from "./fixedFormatImport"
import { PILOTAGE_OBJECTIVES } from "./pilotage"
import { SEED_ACTIONS, SEED_REPORT, SEED_REPORT_ID } from "./seedData"

/**
 * Migrations des données persistées (localStorage) lorsque {@link SEED_VERSION} change : les données
 * initiales enregistrées par une version précédente sont remplacées par les nouvelles, les données
 * créées par l'utilisateur sont conservées.
 */

export const SEED_ACTION_PREFIX = "seed-action-"

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase()
}

/**
 * Remplace les actions initiales d'une version précédente par celles de la version courante, en
 * conservant les actions créées ou importées par l'utilisateur. Les doublons (même titre) sont
 * supprimés : une action initiale déjà présente parmi celles de l'utilisateur (ex: importée depuis
 * le même fichier) n'est pas rajoutée, et une action importée plusieurs fois n'est gardée qu'une fois.
 */
export function refreshSeedActions(actions: unknown): ActionItem[] {
  const list = Array.isArray(actions) ? (actions as ActionItem[]) : []
  const seen = new Set<string>()
  const userActions = list.filter((a) => {
    if (typeof a?.id !== "string" || a.id.startsWith(SEED_ACTION_PREFIX)) return false
    const title = normalizeTitle(String(a.title ?? ""))
    if (seen.has(title)) return false
    seen.add(title)
    return true
  })
  const seeds = SEED_ACTIONS.filter((a) => !seen.has(normalizeTitle(a.title)))
  return [...seeds, ...userActions.map(relinkObjective)]
}

const knownObjectiveIds = new Set(PILOTAGE_OBJECTIVES.map((o) => o.id))
const seedByTitle = new Map(SEED_ACTIONS.map((a) => [normalizeTitle(a.title), a]))

/**
 * Une action importée avant l'ajout de son objectif (ex: « Publication d'agents AI4CYB sur le site
 * AI Showcase », importée quand l'objectif AI Showcase n'existait pas encore) a été enregistrée sans
 * objectif lié. Si c'est une action du fichier de suivi de référence, son objectif lui est rendu.
 */
function relinkObjective(action: ActionItem): ActionItem {
  if (knownObjectiveIds.has(action.objectiveId)) return action
  const seed = seedByTitle.get(normalizeTitle(String(action.title ?? "")))
  return seed ? { ...action, objectiveId: seed.objectiveId } : action
}

/**
 * Le rapport initial (s'il n'a pas été supprimé) est remplacé par sa version à jour. Les autres sont
 * conservés, avec leurs colonnes Oui/Non et compteurs remises au bon format — sauf un rapport des
 * agents IA4CYB importé depuis l'ancienne version du fichier (colonne « Lien AI Showcase » insérée,
 * qui décalait « Propale type » et « Nombre de missions réalisées ») : ses données, fausses, sont
 * remplacées par celles du fichier de suivi à jour, en gardant son titre et ses informations.
 */
export function refreshSeedReports(reports: unknown): ReportData[] {
  const list = Array.isArray(reports) ? (reports as ReportData[]) : []
  return list.map((r) => {
    if (r?.id === SEED_REPORT_ID) return SEED_REPORT
    if (!Array.isArray(r?.template?.criteria) || !Array.isArray(r.rows)) return r
    if (isObsoleteAgentsLayout(r)) {
      return { ...r, template: SEED_REPORT.template, rows: SEED_REPORT.rows.map((row) => ({ ...row, __id: `${r.id}-${row.__id}` })) }
    }
    const { template, rows } = normalizeKnownColumns(r.template, r.rows)
    return { ...r, template, rows }
  })
}

const seedAgentLabels = new Set(SEED_REPORT.rows.map((row) => normalizeTitle(String(row.label ?? ""))))

function isObsoleteAgentsLayout(report: ReportData): boolean {
  const hasLinkColumn = report.template.criteria.some((c) => normalizeTitle(c.label) === "lien ai showcase")
  return (
    hasLinkColumn &&
    report.rows.length > 0 &&
    report.rows.every((row) => seedAgentLabels.has(normalizeTitle(String(row.label ?? ""))))
  )
}

/**
 * Version 5 : un seul dashboard au lieu d'une liste de rapports. Retient, parmi les rapports
 * enregistrés, celui que l'import global alimentait (`legacyDashboardId`), à défaut le rapport
 * affiché, le rapport initial, puis le plus récent. Les rapports d'une version antérieure à la 4
 * reçoivent d'abord les corrections de {@link refreshSeedReports} ; ceux de la version 4 sont
 * gardés tels quels (ils contiennent les données importées par l'utilisateur).
 */
export function pickDashboardReport(persisted: unknown, version: number, legacyDashboardId: string | null): ReportData {
  const state = (persisted ?? {}) as { report?: ReportData; reports?: unknown; activeReportId?: unknown }
  if (isReport(state.report)) return state.report

  const stored = Array.isArray(state.reports) ? state.reports.filter(isReport) : []
  const reports = version < 4 ? refreshSeedReports(stored) : stored
  const byId = (id: unknown) => reports.find((r) => r.id === id)
  const latest = reports.slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))[0]
  return byId(legacyDashboardId) ?? byId(state.activeReportId) ?? byId(SEED_REPORT_ID) ?? latest ?? SEED_REPORT
}

function isReport(value: unknown): value is ReportData {
  const r = value as ReportData | undefined
  return typeof r?.id === "string" && Array.isArray(r.template?.criteria) && Array.isArray(r.rows)
}
