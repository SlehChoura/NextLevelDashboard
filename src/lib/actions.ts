export type ActionStatus = "todo" | "in_progress" | "done"

export interface ActionItem {
  id: string
  title: string
  owner: string
  /** Identifiant d'un objectif du pilotage (voir lib/pilotage.ts), ou "" si non lié. */
  objectiveId: string
  status: ActionStatus
  /** Date d'échéance au format YYYY-MM-DD, ou "" si non renseignée. */
  dueDate: string
}

export const ACTION_STATUS_LABELS: Record<ActionStatus, string> = {
  todo: "À faire",
  in_progress: "En cours",
  done: "Terminée",
}

/** Date du jour au format YYYY-MM-DD (même format que les échéances). */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Une action non terminée dont l'échéance est passée. */
export function isLate(action: ActionItem, today = todayIso()): boolean {
  return action.status !== "done" && action.dueDate !== "" && action.dueDate < today
}

/** Actions non terminées, triées par échéance (sans échéance en dernier). */
export function openActionsByDueDate(actions: ActionItem[]): ActionItem[] {
  return actions
    .filter((a) => a.status !== "done")
    .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"))
}
