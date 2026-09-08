import type { ReportTemplate } from "../types"
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

export const categoryLabels: Record<ReportTemplate["category"], string> = {
  projet: "Suivi de projet",
  audit: "Audit & tests",
  vulnerabilites: "Vulnérabilités",
  comite: "Comité de pilotage",
  incident: "Incidents",
}
