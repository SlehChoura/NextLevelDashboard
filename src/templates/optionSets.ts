import type { CriterionOption } from "../types"

/** Statut RAG classique (comité de pilotage / avancement projet). */
export const ragStatusOptions: CriterionOption[] = [
  { value: "vert", label: "Vert", color: "success" },
  { value: "orange", label: "Orange", color: "warning" },
  { value: "rouge", label: "Rouge", color: "danger" },
]

/** Sévérité d'un constat d'audit / d'une vulnérabilité. */
export const severityOptions: CriterionOption[] = [
  { value: "critique", label: "Critique", color: "danger" },
  { value: "elevee", label: "Élevée", color: "warning" },
  { value: "moyenne", label: "Moyenne", color: "info" },
  { value: "faible", label: "Faible", color: "success" },
]

/** Statut de remédiation / traitement d'un constat ou d'une vulnérabilité. */
export const remediationStatusOptions: CriterionOption[] = [
  { value: "ouvert", label: "Ouvert", color: "danger" },
  { value: "en_cours", label: "En cours", color: "warning" },
  { value: "clos", label: "Clos", color: "success" },
  { value: "accepte", label: "Risque accepté", color: "info" },
]

/** Statut d'avancement d'une action / d'un jalon. */
export const progressStatusOptions: CriterionOption[] = [
  { value: "a_faire", label: "À faire", color: "neutral" },
  { value: "en_cours", label: "En cours", color: "warning" },
  { value: "termine", label: "Terminé", color: "success" },
  { value: "retard", label: "En retard", color: "danger" },
]

/** Niveau de conformité par rapport à un référentiel (ISO 27001, NIST, etc.). */
export const complianceStatusOptions: CriterionOption[] = [
  { value: "conforme", label: "Conforme", color: "success" },
  { value: "partiel", label: "Partiellement conforme", color: "warning" },
  { value: "non_conforme", label: "Non conforme", color: "danger" },
  { value: "non_applicable", label: "Non applicable", color: "neutral" },
]
