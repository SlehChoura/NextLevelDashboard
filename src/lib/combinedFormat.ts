import { ACTION_STATUS_LABELS, type ActionStatus } from "./actions"

/** Noms des onglets et colonnes du fichier de suivi combiné (voir combinedImport.ts). */

export const PILOTAGE_SHEET_NAME = "Suivi pilotage"
export const ACTIONS_SHEET_NAME = "Actions"
export const DASHBOARD_SHEET_NAME = "Agents IA4CYB"

export const PIL_COL_KEY = "Clé"
export const PIL_COL_CATEGORY = "Catégorie"
export const PIL_COL_LABEL = "Indicateur"
export const PIL_COL_CURRENT = "Valeur actuelle"
export const PIL_COL_TARGET = "Cible"
export const PIL_COL_UNIT = "Unité"

export const ACT_COL_KEY = "Clé"
export const ACT_COL_TITLE = "Titre"
export const ACT_COL_OWNER = "Porteur"
export const ACT_COL_OBJECTIVE_KEY = "Clé objectif"
export const ACT_COL_OBJECTIVE_LABEL = "Objectif lié"
export const ACT_COL_STATUS = "Statut"
export const ACT_COL_DUE_DATE = "Échéance"

export function normalizeText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

/** Libellés de statut d'action acceptés à l'import (insensibles à la casse et aux accents). */
export const STATUS_SYNONYMS: Record<string, ActionStatus> = {
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
