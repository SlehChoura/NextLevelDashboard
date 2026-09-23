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
