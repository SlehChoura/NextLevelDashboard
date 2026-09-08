import type { ReportTemplate } from "../types"
import { progressStatusOptions, severityOptions } from "./optionSets"

export const incidentReportTemplate: ReportTemplate = {
  id: "reporting-incidents",
  name: "Reporting incidents / gestion de crise",
  shortName: "Incidents",
  category: "incident",
  situation:
    "Point de situation en cellule de crise, reporting post-incident, bilan périodique des incidents traités.",
  description:
    "Suit les incidents de sécurité traités, leur gravité, leur catégorie et l'avancement de leur clôture.",
  statusKey: "statut",
  criteria: [
    {
      key: "incident",
      label: "Incident",
      type: "text",
      role: "label",
      required: true,
      aliases: ["incident", "titre", "objet"],
      example: "Tentative de phishing ciblé - Direction Finance",
    },
    {
      key: "categorie",
      label: "Catégorie",
      type: "text",
      role: "dimension",
      aliases: ["catégorie", "type", "category"],
      example: "Phishing",
    },
    {
      key: "gravite",
      label: "Gravité",
      type: "select",
      role: "dimension",
      required: true,
      options: severityOptions,
      aliases: ["gravité", "impact", "criticité", "severity"],
      example: "moyenne",
    },
    {
      key: "statut",
      label: "Statut",
      type: "select",
      role: "dimension",
      options: progressStatusOptions,
      aliases: ["statut", "status", "état"],
      example: "en_cours",
    },
    {
      key: "date_detection",
      label: "Date de détection",
      type: "date",
      role: "date",
      aliases: ["date détection", "date incident", "date"],
    },
    {
      key: "responsable",
      label: "Responsable",
      type: "text",
      role: "info",
      aliases: ["responsable", "owner", "analyste"],
    },
  ],
  charts: [
    {
      id: "gravite",
      title: "Incidents par gravité",
      kind: "bar",
      criterionKey: "gravite",
    },
    {
      id: "categorie",
      title: "Incidents par catégorie",
      kind: "pie",
      criterionKey: "categorie",
    },
  ],
}
