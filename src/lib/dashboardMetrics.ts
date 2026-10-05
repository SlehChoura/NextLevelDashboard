import type { ReportData } from "../types"
import { findCriterionByKeyword } from "./criteria"
import { hasPropaleType, isClientReadyStatus } from "./fixedFormatImport"

/** Chiffres clés du dashboard des agents, partagés par l'accueil, la synthèse et l'historique. */
export interface DashboardMetrics {
  /** Nombre d'agents suivis (lignes du dashboard). */
  agents: number
  /** Somme du « Nombre de missions réalisées » de chaque agent. */
  missions: number
  /** Agents dont le statut est « présentable » ou « déployable » en contexte client. */
  ready: number
  /** Agents disposant d'une propale type. */
  propale: number
}

export function dashboardMetrics(report: ReportData): DashboardMetrics {
  const { template, rows } = report
  const status = template.criteria.find((c) => c.key === template.statusKey)
  const missions = findCriterionByKeyword(template, "mission")
  const propale = findCriterionByKeyword(template, "propale")
  return {
    agents: rows.length,
    missions: missions
      ? rows.reduce((sum, row) => {
          const n = Number(row[missions.key])
          return Number.isFinite(n) ? sum + n : sum
        }, 0)
      : 0,
    ready: status ? rows.filter((row) => isClientReadyStatus(String(row[status.key] ?? ""))).length : 0,
    propale: propale ? rows.filter((row) => hasPropaleType(String(row[propale.key] ?? ""))).length : 0,
  }
}
