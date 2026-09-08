import type { ReportTemplate } from "../types"
import { remediationStatusOptions, severityOptions } from "./optionSets"

export const auditFindingsTemplate: ReportTemplate = {
  id: "audit-constats",
  name: "Audit de sécurité / test d'intrusion",
  shortName: "Audit & pentest",
  category: "audit",
  situation:
    "Restitution d'audit, rapport de test d'intrusion, suivi des constats et de leur remédiation.",
  description:
    "Synthétise les constats d'un audit ou d'un pentest par sévérité et par statut de remédiation.",
  statusKey: "severite",
  criteria: [
    {
      key: "constat",
      label: "Constat",
      type: "text",
      role: "label",
      required: true,
      aliases: ["constat", "finding", "vulnérabilité", "observation"],
      example: "Absence de MFA sur l'accès VPN",
    },
    {
      key: "categorie",
      label: "Catégorie",
      type: "text",
      role: "dimension",
      aliases: ["catégorie", "domaine", "thème", "category"],
      example: "Contrôle d'accès",
    },
    {
      key: "severite",
      label: "Sévérité",
      type: "select",
      role: "dimension",
      required: true,
      options: severityOptions,
      aliases: ["sévérité", "criticité", "severity", "niveau", "risque"],
      example: "elevee",
    },
    {
      key: "statut",
      label: "Statut de remédiation",
      type: "select",
      role: "dimension",
      options: remediationStatusOptions,
      aliases: ["statut", "statut de traitement", "remediation status", "état"],
      example: "en_cours",
    },
    {
      key: "responsable",
      label: "Responsable",
      type: "text",
      role: "info",
      aliases: ["responsable", "owner"],
    },
    {
      key: "echeance",
      label: "Échéance de remédiation",
      type: "date",
      role: "date",
      aliases: ["échéance", "date cible", "deadline"],
    },
  ],
  charts: [
    {
      id: "severite",
      title: "Constats par sévérité",
      kind: "bar",
      criterionKey: "severite",
    },
    {
      id: "statut",
      title: "Constats par statut de remédiation",
      kind: "pie",
      criterionKey: "statut",
    },
  ],
}
