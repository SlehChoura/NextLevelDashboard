import type { ActionItem } from "./actions"
import type { ReportData } from "../types"
import { normalizeKnownColumns } from "./fixedFormatImport"
import { PILOTAGE_OBJECTIVES } from "./pilotage"
import { SEED_ACTIONS, SEED_HISTORY, SEED_REFERENCE_AT, SEED_REPORT, SEED_REPORT_ID } from "./seedData"
import { MAX_SNAPSHOTS, type Snapshot } from "./history"
import { normalizeText } from "./cellParsing"

/**
 * Migrations des données persistées (localStorage) lorsque {@link SEED_VERSION} change : les données
 * initiales enregistrées par une version précédente sont remplacées par les nouvelles, les données
 * créées par l'utilisateur sont conservées.
 */

export const SEED_ACTION_PREFIX = "seed-action-"

/** Même comparaison de titres que l'import (casse et accents ignorés). */
const normalizeTitle = normalizeText

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

/**
 * Ce que ce navigateur a fait de ses propres données, pour décider à la mise à jour des données de
 * référence s'il garde les siennes.
 */
export interface LocalChanges {
  /** Date du dernier import de ces données depuis le fichier de suivi. */
  importedAt?: unknown
  /** Date de la dernière modification faite dans l'application depuis la réception des données de référence. */
  editedAt?: unknown
}

/**
 * Les données de ce navigateur l'emportent sur les nouvelles données de référence si elles viennent
 * d'un import plus récent que celles-ci, ou si elles ont été modifiées dans l'application (une
 * valeur corrigée, une action passée « Terminée »…) : ce travail n'est jamais écrasé en silence.
 */
export function keepsLocalData({ importedAt, editedAt }: LocalChanges): boolean {
  return importedSinceReference(importedAt) || typeof editedAt === "string"
}

/**
 * Date propre à un store si elle a déjà été enregistrée, sinon la date d'import commune, seule
 * connue des versions précédentes (où un import, même partiel, valait pour toutes les données).
 */
export function ownOrLegacy(own: unknown, legacy: unknown): unknown {
  return own === undefined ? legacy : own
}

interface PersistedPilotage {
  values?: Record<string, number>
  targets?: Record<string, number>
  lastImportAt?: string | null
  valuesImportedAt?: string | null
  editedAt?: string | null
}

/**
 * Valeurs et cibles du pilotage à la mise à jour des données de référence. Elles sont remplacées
 * par celles du dernier fichier de suivi ({@link SEED_REFERENCE_AT}), sauf si l'onglet pilotage a
 * été importé depuis ou si une valeur a été modifiée dans l'application (voir {@link keepsLocalData}).
 */
export function refreshPilotage<T extends PersistedPilotage>(
  persisted: T,
  version: number,
  defaults: { values: Record<string, number>; targets: Record<string, number> },
): T {
  const changes = { importedAt: ownOrLegacy(persisted?.valuesImportedAt, persisted?.lastImportAt), editedAt: persisted?.editedAt }
  if (version >= 3 && keepsLocalData(changes)) return persisted
  return { ...persisted, values: { ...defaults.values }, targets: { ...defaults.targets }, editedAt: null }
}

/**
 * Un fichier a été importé dans ce navigateur depuis la date des données de référence : ses données,
 * plus récentes, l'emportent sur celles intégrées à l'application.
 */
export function importedSinceReference(lastImportAt: unknown): boolean {
  return typeof lastImportAt === "string" && lastImportAt >= SEED_REFERENCE_AT
}

/**
 * Actions à la mise à jour des données de référence. Sans import depuis leur date ni modification
 * dans l'application, les actions du fichier de suivi de référence remplacent celles enregistrées
 * (statuts, échéances, nouvelles actions) ; les actions créées à la main, absentes du fichier, sont
 * conservées. Après un import plus récent ou une modification, rien ne change. Une liste
 * enregistrée illisible (stockage corrompu) est remplacée par les actions de référence.
 */
export function refreshActions(actions: unknown, version: number, lastImportAt: unknown, editedAt: unknown = null): ActionItem[] {
  if (!Array.isArray(actions)) return [...SEED_ACTIONS]
  if (keepsLocalData({ importedAt: lastImportAt, editedAt })) {
    return version >= 4 ? (actions as ActionItem[]) : refreshSeedActions(actions)
  }
  const list = actions as ActionItem[]
  const referenceTitles = new Set(SEED_ACTIONS.map((a) => normalizeTitle(a.title)))
  const userOnly = list.filter(
    (a) =>
      typeof a?.id === "string" &&
      !a.id.startsWith(SEED_ACTION_PREFIX) &&
      !referenceTitles.has(normalizeTitle(String(a.title ?? ""))),
  )
  return [...SEED_ACTIONS, ...userOnly]
}

/**
 * Dashboard à la mise à jour des données de référence : sans import depuis leur date ni correction
 * dans l'application (« Modifier les données »), il reprend les agents du fichier de suivi de
 * référence, en gardant le titre et les informations saisis.
 */
export function refreshDashboard(report: ReportData, lastImportAt: unknown, editedAt: unknown = null): ReportData {
  return keepsLocalData({ importedAt: lastImportAt, editedAt }) ? report : { ...SEED_REPORT, meta: report.meta }
}

/**
 * Ajoute à l'historique enregistré les photos de référence qui lui manquent, dans l'ordre des dates.
 * Sans import depuis les données de référence, une photo enregistrée à la date d'une photo de
 * référence est remplacée par celle-ci (fichier corrigé et réintégré le même jour).
 */
export function mergeSeedHistory(snapshots: unknown, lastImportAt: unknown = null): Snapshot[] {
  const stored = Array.isArray(snapshots) ? (snapshots as Snapshot[]).filter((s) => typeof s?.date === "string") : []
  const seedDates = new Set(SEED_HISTORY.map((s) => s.date))
  const kept = importedSinceReference(lastImportAt) ? stored : stored.filter((s) => !seedDates.has(s.date))
  const dates = new Set(kept.map((s) => s.date))
  return [...kept, ...SEED_HISTORY.filter((s) => !dates.has(s.date))]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-MAX_SNAPSHOTS)
}
