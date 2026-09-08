import type { ReportTemplate } from "../types"
import { ragStatusOptions } from "./optionSets"

export const projectStatusTemplate: ReportTemplate = {
  id: "projet-ssi",
  name: "Suivi de projet / programme cybersécurité",
  shortName: "Suivi de projet",
  category: "projet",
  situation:
    "Comité de suivi projet, point d'avancement client, reporting mensuel d'un programme SSI.",
  description:
    "Suit l'avancement des jalons d'un projet ou programme sécurité : statut RAG, taux d'avancement, échéances et responsables.",
  statusKey: "statut",
  criteria: [
    {
      key: "jalon",
      label: "Jalon / Livrable",
      type: "text",
      role: "label",
      required: true,
      aliases: ["jalon", "livrable", "tâche", "activité", "item"],
      example: "Cadrage et lancement du projet",
    },
    {
      key: "statut",
      label: "Statut",
      type: "select",
      role: "dimension",
      required: true,
      options: ragStatusOptions,
      aliases: ["statut", "état", "status", "avancement statut", "rag"],
      example: "vert",
    },
    {
      key: "avancement",
      label: "Avancement (%)",
      type: "percent",
      role: "metric",
      aliases: ["avancement", "% avancement", "progress", "pourcentage"],
      example: "60",
    },
    {
      key: "echeance",
      label: "Échéance",
      type: "date",
      role: "date",
      aliases: ["échéance", "date échéance", "date fin", "deadline", "date cible"],
    },
    {
      key: "responsable",
      label: "Responsable",
      type: "text",
      role: "info",
      aliases: ["responsable", "owner", "pilote"],
      example: "J. Dupont",
    },
    {
      key: "risque",
      label: "Risques / points d'attention",
      type: "text",
      role: "info",
      aliases: ["risque", "risques", "points d'attention", "alertes"],
    },
  ],
  charts: [
    {
      id: "statut",
      title: "Répartition des jalons par statut",
      kind: "bar",
      criterionKey: "statut",
    },
    {
      id: "responsable",
      title: "Charge par responsable",
      kind: "pie",
      criterionKey: "responsable",
    },
  ],
}
