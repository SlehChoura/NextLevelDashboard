import type { ReportData } from "../types"
import { dashboardMetrics, type DashboardMetrics } from "./dashboardMetrics"
import { PILOTAGE_OBJECTIVES, type PilotageObjective } from "./pilotage"

/**
 * Photo des chiffres à une date de mise à jour des données (un import du fichier de suivi). Deux
 * photos successives montrent ce qui a bougé : progrès, mais aussi cibles révisées.
 */
export interface Snapshot {
  /** Date de la mise à jour, au format YYYY-MM-DD (une seule photo par jour). */
  date: string
  values: Record<string, number>
  targets: Record<string, number>
  dashboard: DashboardMetrics
}

/** Nombre de photos conservées (environ un an de mises à jour hebdomadaires). */
export const MAX_SNAPSHOTS = 52

export function makeSnapshot(
  date: string,
  values: Record<string, number>,
  targets: Record<string, number>,
  report: ReportData,
): Snapshot {
  return { date: date.slice(0, 10), values: { ...values }, targets: { ...targets }, dashboard: dashboardMetrics(report) }
}

/** Ajoute une photo ; une photo du même jour remplace la précédente (réimport le même jour). */
export function appendSnapshot(history: Snapshot[], snapshot: Snapshot): Snapshot[] {
  const kept = history.filter((s) => s.date !== snapshot.date && s.date < snapshot.date)
  return [...kept, snapshot].slice(-MAX_SNAPSHOTS)
}

export interface ValueChange {
  label: string
  unit: string
  from: number
  to: number
}

export interface ObjectiveChange extends ValueChange {
  objective: PilotageObjective
}

export interface SnapshotDiff {
  from: string
  to: string
  /** Valeurs actuelles des objectifs qui ont bougé. */
  progress: ObjectiveChange[]
  /** Cibles modifiées : à signaler, un succès peut venir d'une cible abaissée. */
  targetRevisions: ObjectiveChange[]
  /** Chiffres du dashboard des agents qui ont bougé. */
  dashboard: ValueChange[]
}

const DASHBOARD_LABELS: Record<keyof DashboardMetrics, { label: string; unit: string }> = {
  agents: { label: "Agents IA4CYB suivis", unit: "agents" },
  missions: { label: "Missions réalisées (somme par agent)", unit: "missions" },
  ready: { label: "Agents prêts pour un client", unit: "agents" },
  propale: { label: "Agents avec propale type", unit: "agents" },
}

export function compareSnapshots(previous: Snapshot, current: Snapshot): SnapshotDiff {
  const progress: ObjectiveChange[] = []
  const targetRevisions: ObjectiveChange[] = []
  for (const objective of PILOTAGE_OBJECTIVES) {
    const base = { objective, label: objective.label, unit: objective.unit }
    const v0 = previous.values[objective.id]
    const v1 = current.values[objective.id]
    if (v0 !== undefined && v1 !== undefined && v0 !== v1) progress.push({ ...base, from: v0, to: v1 })
    const t0 = previous.targets[objective.id]
    const t1 = current.targets[objective.id]
    if (t0 !== undefined && t1 !== undefined && t0 !== t1) targetRevisions.push({ ...base, from: t0, to: t1 })
  }
  const dashboard = (Object.keys(DASHBOARD_LABELS) as (keyof DashboardMetrics)[])
    .filter((key) => previous.dashboard[key] !== current.dashboard[key])
    .map((key) => ({ ...DASHBOARD_LABELS[key], from: previous.dashboard[key], to: current.dashboard[key] }))
  return { from: previous.date, to: current.date, progress, targetRevisions, dashboard }
}

/** Écart entre les deux dernières photos, ou null s'il n'y en a pas encore deux. */
export function latestDiff(history: Snapshot[]): SnapshotDiff | null {
  if (history.length < 2) return null
  return compareSnapshots(history[history.length - 2], history[history.length - 1])
}

/** "05/10" à partir de "2026-10-05". */
export function shortDate(isoDate: string): string {
  const [, m, d] = isoDate.split("-")
  return `${d}/${m}`
}
