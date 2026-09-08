import type { ReportTemplate } from "../types"
import { ragStatusOptions } from "./optionSets"

export const securityCommitteeTemplate: ReportTemplate = {
  id: "comite-pilotage",
  name: "Comité de pilotage sécurité (KPIs)",
  shortName: "Comité de pilotage",
  category: "comite",
  situation:
    "CODIR / comité de pilotage sécurité, reporting mensuel ou trimestriel d'indicateurs SSI.",
  description:
    "Présente un jeu d'indicateurs clés (KPI) de sécurité par domaine, avec statut RAG et valeur vs. cible.",
  statusKey: "statut",
  criteria: [
    {
      key: "indicateur",
      label: "Indicateur",
      type: "text",
      role: "label",
      required: true,
      aliases: ["indicateur", "kpi", "métrique"],
      example: "Taux de couverture EDR",
    },
    {
      key: "domaine",
      label: "Domaine",
      type: "text",
      role: "dimension",
      aliases: ["domaine", "catégorie", "pilier"],
      example: "Protection du poste de travail",
    },
    {
      key: "statut",
      label: "Statut",
      type: "select",
      role: "dimension",
      required: true,
      options: ragStatusOptions,
      aliases: ["statut", "état", "rag"],
      example: "vert",
    },
    {
      key: "valeur",
      label: "Valeur actuelle",
      type: "number",
      role: "metric",
      aliases: ["valeur", "résultat", "value", "mesure"],
      example: "92",
    },
    {
      key: "cible",
      label: "Cible",
      type: "number",
      role: "metric",
      aliases: ["cible", "objectif", "target"],
      example: "95",
    },
    {
      key: "commentaire",
      label: "Commentaire",
      type: "text",
      role: "info",
      aliases: ["commentaire", "analyse", "remarque"],
    },
  ],
  charts: [
    {
      id: "statut",
      title: "Indicateurs par statut",
      kind: "bar",
      criterionKey: "statut",
    },
    {
      id: "domaine",
      title: "Indicateurs par domaine",
      kind: "pie",
      criterionKey: "domaine",
    },
  ],
}
