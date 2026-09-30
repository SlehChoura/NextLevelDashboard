import type { ActionItem } from "./actions"
import type { ReportData } from "../types"
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
 * conservant les actions créées ou importées par l'utilisateur. Une action initiale dont le titre
 * existe déjà parmi ces dernières (ex: déjà importée depuis le même fichier) n'est pas dupliquée.
 */
export function refreshSeedActions(actions: unknown): ActionItem[] {
  const list = Array.isArray(actions) ? (actions as ActionItem[]) : []
  const userActions = list.filter((a) => typeof a?.id === "string" && !a.id.startsWith(SEED_ACTION_PREFIX))
  const userTitles = new Set(userActions.map((a) => normalizeTitle(String(a.title ?? ""))))
  const seeds = SEED_ACTIONS.filter((a) => !userTitles.has(normalizeTitle(a.title)))
  return [...seeds, ...userActions]
}

/** Le rapport initial (s'il n'a pas été supprimé) est remplacé par sa version à jour ; les autres sont conservés. */
export function refreshSeedReports(reports: unknown): ReportData[] {
  const list = Array.isArray(reports) ? (reports as ReportData[]) : []
  return list.map((r) => (r?.id === SEED_REPORT_ID ? SEED_REPORT : r))
}
