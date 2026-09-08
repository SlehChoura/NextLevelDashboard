import type { ReportData, ReportTemplate } from "../types"
import { projectStatusTemplate } from "./projectStatus"
import { auditFindingsTemplate } from "./auditFindings"
import { vulnerabilityTrackingTemplate } from "./vulnerabilityTracking"
import { securityCommitteeTemplate } from "./securityCommittee"
import { incidentReportTemplate } from "./incidentReport"

export const templates: ReportTemplate[] = [
  projectStatusTemplate,
  auditFindingsTemplate,
  vulnerabilityTrackingTemplate,
  securityCommitteeTemplate,
  incidentReportTemplate,
]

export function getTemplate(id: string): ReportTemplate | undefined {
  return templates.find((t) => t.id === id)
}

/** Résout le template d'un rapport : celui généré par l'IA s'il y en a un, sinon le template prédéfini. */
export function resolveReportTemplate(report: ReportData): ReportTemplate | undefined {
  return report.customTemplate ?? getTemplate(report.templateId)
}

export const categoryLabels: Record<ReportTemplate["category"], string> = {
  projet: "Suivi de projet",
  audit: "Audit & tests",
  vulnerabilites: "Vulnérabilités",
  comite: "Comité de pilotage",
  incident: "Incidents",
  ia: "Généré par IA",
}
