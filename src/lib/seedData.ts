import type { ParsedSheet } from "./excelImport"
import { buildFromSheet } from "./fixedFormatImport"
import type { ActionItem } from "./actions"
import type { ReportData } from "../types"
import { makeSnapshot, type Snapshot } from "./history"
import { PILOTAGE_OBJECTIVES } from "./pilotage"

/**
 * Données initiales du POC IA4CYB (pilotage, actions, dashboard des agents), reprises du fichier
 * de suivi combiné fourni pour que l'application affiche un état déjà rempli dès le premier
 * chargement, sans import manuel. Un import (page Pilotage) écrase ensuite ces valeurs de départ.
 */

/**
 * Version des données initiales. À incrémenter à chaque mise à jour de ce fichier : les stores
 * persistés (localStorage) s'en servent pour rafraîchir les données initiales déjà enregistrées
 * dans le navigateur d'un visiteur précédent, sans toucher à ce qu'il a lui-même créé.
 */
export const SEED_VERSION = 11

/**
 * Date du fichier de suivi dont sont tirées les valeurs de référence du pilotage : un navigateur
 * qui n'a rien importé depuis reçoit ces valeurs à la place des précédentes.
 */
export const SEED_PILOTAGE_DATE = "2026-10-29"

/**
 * Instant d'intégration du dernier fichier de suivi : un import fait avant (même plus tôt le même
 * jour, quand deux versions du fichier se suivent) est plus ancien que ces données.
 */
export const SEED_REFERENCE_AT = "2026-10-29T12:20:00.000Z"

/** Colonnes de l'onglet "Agents IA4CYB" (première colonne = agent suivi, suivantes = critères). */
export const DASHBOARD_HEADERS = [
  "Nos agents AI4CYB",
  "Status",
  "Portabilité",
  "Documentation",
  "Formation",
  "Communauté",
  "Ready to market",
  "Propale type",
  "Nombre de missions réalisées",
  "Publication dans le showcase AI",
  "Agent industrialisé",
]

export const DASHBOARD_ROWS: unknown[][] = [
  ["Smart Identity Analyzer", "Déployable en contexte client", 1, 0.9, 0.5, 0.5, 0.6, "Non", 1, "Oui", "Oui"],
  ["Crisis Maker", "Déployable en contexte client", 1, 1, 0.75, 1, 1, "Non", 10, "Oui", "Oui"],
  [
    "Booster EBIOS RM – Analyse de risques",
    "Déployable en contexte client",
    1,
    0.75,
    0.75,
    0.5,
    1,
    "Oui",
    3,
    "Oui",
    "Oui",
  ],
  ["Web Recon", "Déployable en contexte client", 1, 1, 1, 0.25, 1, "Non", 20, "Oui", "Oui"],
  [
    "The CyberBench Intelligence Orchestrator",
    "En développement",
    0.75,
    0.33,
    0.5,
    1,
    0.75,
    "En cours",
    2,
    "Oui",
    "Oui",
  ],
  [
    "The CTI Threat Landscape Scout – Autonomous Threat Landscape Generation",
    "En développement",
    0.5,
    0.5,
    0,
    0,
    0.25,
    "",
    0,
    "En cours",
    "Non",
  ],
  [
    "AI-Powered NIS2 Intelligence & Compliance Assistant",
    "En développement",
    0.5,
    0.5,
    0.25,
    0.25,
    0.5,
    "Non",
    2,
    "Oui",
    "Oui",
  ],
  ["Cyber-by-Design Project Assistant", "Déployable en contexte client", 1, 1, 0.75, 0.75, 1, "Oui", 2, "Oui", "Oui"],
  [
    "The Deliverable Purifier – Automated Anonymization & KM Re-injection",
    "Présentable en contexte client",
    "",
    1,
    1,
    0.5,
    "",
    "",
    "",
    "",
    "Oui",
  ],
  ["Kovex", "Déployable en contexte client", 1, 0.75, 0.75, 0.25, 1, "", 2, "Oui", "Oui"],
  ["RegWatch", "En développement", 0.5, 0.5, 0.75, 0.25, 0.25, "", "", "", "Non"],
  ["WaveWarden", "En développement", 0.5, 0.25, 0.25, 0.25, 0.5, "En cours", "", "", "Non"],
]

const dashboardSheet: ParsedSheet = {
  sheetNames: ["Agents IA4CYB"],
  activeSheet: "Agents IA4CYB",
  headers: DASHBOARD_HEADERS,
  rows: DASHBOARD_ROWS,
}

const dashboardBuild = buildFromSheet(dashboardSheet)

/** Id stable (indépendant de {@link buildFromSheet}) pour que le pilotage puisse mettre ce rapport à jour au prochain import global au lieu d'en créer un second. */
export const SEED_REPORT_ID = "seed-agents-ia4cyb"

export const SEED_REPORT: ReportData = {
  id: SEED_REPORT_ID,
  template: dashboardBuild.template,
  meta: { title: "Agents IA4CYB", client: "", author: "", period: "" },
  // Ids de ligne stables (plutôt qu'aléatoires à chaque chargement de l'application).
  rows: dashboardBuild.rows.map((row, i) => ({ ...row, __id: `seed-agent-${i + 1}` })),
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: SEED_REFERENCE_AT,
}

export const SEED_ACTIONS: ActionItem[] = [
  {
    id: "seed-action-1",
    title: "Se synchroniser avec le relais Cyber Academy pour faire évoluer le support et le format",
    owner: "SlehEddine CHOURA",
    objectiveId: "cyber_academy_ia",
    status: "done",
    dueDate: "2026-09-30",
  },
  {
    id: "seed-action-2",
    title: "Former les consultants Cyber au vibe coding",
    owner: "Gérôme BILLOIS",
    objectiveId: "consultants_vibe_coding",
    status: "done",
    dueDate: "2026-09-30",
  },
  {
    id: "seed-action-3",
    title: "Identifier de nouveaux formateurs au vibe coding",
    owner: "SlehEddine CHOURA",
    objectiveId: "consultants_vibe_coding",
    status: "todo",
    dueDate: "2026-11-15",
  },
  {
    id: "seed-action-4",
    title: "Suivre le nombre de consultants Cyber certifiés Claude",
    owner: "Anna VALIER",
    objectiveId: "certifications_claude",
    status: "in_progress",
    dueDate: "2026-12-31",
  },
  {
    id: "seed-action-5",
    title: "Suivre le nombre d'agents disponibles",
    owner: "Anna VALIER",
    objectiveId: "agents_disponibles",
    status: "in_progress",
    dueDate: "2026-12-31",
  },
  {
    id: "seed-action-6",
    title: "Suivre le nombre d'agents industrialisés",
    owner: "Anna VALIER",
    objectiveId: "agents_industrialises",
    status: "in_progress",
    dueDate: "2026-12-31",
  },
  {
    id: "seed-action-7",
    title: "Suivre le nombre d'agents utilisés en mission",
    owner: "Anna VALIER",
    objectiveId: "missions_avec_agents",
    status: "in_progress",
    dueDate: "2026-12-31",
  },
  {
    id: "seed-action-8",
    title: "Documenter la chaîne CI/CD",
    owner: "Mehdi BOUDJELLA",
    objectiveId: "description_cicd",
    status: "done",
    dueDate: "2026-09-30",
  },
  {
    id: "seed-action-9",
    title: "Rédiger le guide d'utilisation (How to) de la chaîne CI/CD",
    owner: "Mel ENZEN",
    objectiveId: "disponibilite_cicd",
    status: "done",
    dueDate: "2026-09-30",
  },
  {
    id: "seed-action-10",
    title: "Publier les agents AI4CYB sur le site AI Showcase",
    owner: "Tom WILTBERGER",
    objectiveId: "publication_ai_showcase",
    status: "done",
    dueDate: "2026-10-06",
  },
  {
    id: "seed-action-11",
    title: "Rédiger la description et le guide d'utilisation de la chaîne CI/CD",
    owner: "Mel ENZEN",
    objectiveId: "description_cicd",
    status: "done",
    dueDate: "2026-10-06",
  },
  {
    id: "seed-action-12",
    title: "Centraliser les guidelines de secure vibe coding",
    owner: "Mel ENZEN",
    objectiveId: "guidelines_cicd",
    status: "todo",
    dueDate: "2026-10-31",
  },
  {
    id: "seed-action-13",
    title: "Ajouter un mode démo aux agents AI4CYB",
    owner: "SlehEddine CHOURA",
    objectiveId: "demo_ai_showcase",
    status: "in_progress",
    dueDate: "2026-11-12",
  },
  {
    id: "seed-action-14",
    title: "Identifier les bénéficiaires et piloter l'attribution des licences Claude Code de la communauté AI4CYB Makers",
    owner: "SlehEddine CHOURA",
    objectiveId: "licences_claude",
    status: "done",
    dueDate: "2026-10-31",
  },
  {
    id: "seed-action-15",
    title: "Vérifier les critères d'industrialisation des agents et accompagner les équipes pour les atteindre",
    owner: "Anna VALIER",
    objectiveId: "agents_industrialises",
    status: "done",
    dueDate: "2026-10-20",
  },
  {
    id: "seed-action-16",
    title: "Déployer les nouvelles fonctionnalités sur Parallax",
    owner: "Arnaud PETICOL",
    objectiveId: "description_cicd",
    status: "in_progress",
    dueDate: "2026-10-19",
  },
  {
    id: "seed-action-17",
    title: "Établir les actions prioritaires de chaque agent",
    owner: "Anna VALIER",
    objectiveId: "agents_industrialises",
    status: "done",
    dueDate: "2026-10-20",
  },
  {
    id: "seed-action-18",
    title: "Définir les besoins budgétaires 2027 de la communauté AI4CYB Makers",
    owner: "SlehEddine CHOURA",
    objectiveId: "",
    status: "todo",
    dueDate: "2026-12-31",
  },
  {
    id: "seed-action-19",
    title: "Recenser les bénéficiaires des licences Claude Code",
    owner: "Anna VALIER",
    objectiveId: "licences_claude",
    status: "done",
    dueDate: "2026-10-22",
  },
  {
    id: "seed-action-20",
    title: "Contacter les relais Learning des BT",
    owner: "Anna VALIER",
    objectiveId: "bt_academy_transformees",
    status: "done",
    dueDate: "2026-10-28",
  },
  {
    id: "seed-action-21",
    title: "Identifier les prochains BT Days",
    owner: "Anna VALIER",
    objectiveId: "bt_academy_transformees",
    status: "in_progress",
    dueDate: "2026-10-31",
  },
  {
    id: "seed-action-22",
    title: "Constituer le backlog des cas d'usage à développer en vibe coding (backlog DAIS et travaux des BT)",
    owner: "Anna VALIER",
    objectiveId: "agents_disponibles",
    status: "todo",
    dueDate: "2026-11-30",
  },
  {
    id: "seed-action-23",
    title: "Contacter les porteurs de formation des BT",
    owner: "Anna VALIER",
    objectiveId: "bt_academy_transformees",
    status: "done",
    dueDate: "2026-10-31",
  },
  {
    id: "seed-action-24",
    title: "Tester les démos des agents",
    owner: "Anna VALIER",
    objectiveId: "agents_disponibles",
    status: "in_progress",
    dueDate: "2026-11-10",
  },
]

const referenceValues = Object.fromEntries(PILOTAGE_OBJECTIVES.map((o) => [o.id, o.defaultCurrent]))
const referenceTargets = Object.fromEntries(PILOTAGE_OBJECTIVES.map((o) => [o.id, o.target]))

/** Objectifs apparus dans le fichier du 14/10 : absents des photos précédentes. */
const ADDED_ON_2026_10_14 = ["licences_claude", "demo_ai_showcase"]
const without = (record: Record<string, number>, ids: string[]) =>
  Object.fromEntries(Object.entries(record).filter(([id]) => !ids.includes(id)))

const values1005 = {
  ...without(referenceValues, ADDED_ON_2026_10_14),
  consultants_vibe_coding: 250,
  agents_disponibles: 10,
  agents_industrialises: 9,
  missions_avec_agents: 27,
}
const targets1005 = without(referenceTargets, ADDED_ON_2026_10_14)
/** Dashboard des agents des fichiers du 30/09 et du 05/10 (10 agents, une propale type). */
const dashboardBefore1014 = { agents: 10, missions: 27, ready: 7, propale: 1 }

/** Fichier corrigé du 21/10, avant celui du 29/10. */
const values1021 = { ...referenceValues, licences_claude: 0 }
const dashboard1021 = { agents: 12, missions: 41, ready: 7, propale: 5 }

/** Fichier corrigé du 14/10, avant celui du 21/10. */
const values1014 = { ...values1021, consultants_vibe_coding: 250, agents_industrialises: 8, missions_avec_agents: 41 }
const targets1014 = { ...referenceTargets, licences_claude: 23 }
const dashboard1014 = { agents: 12, missions: 41, ready: 7, propale: 3 }

/**
 * Historique initial : les fichiers de suivi du 30/09, du 05/10, du 14/10, du 21/10 et du
 * {@link SEED_PILOTAGE_DATE},
 * pour que « Depuis la dernière mise à jour » montre d'emblée les évolutions (et les cibles révisées).
 */
export const SEED_HISTORY: Snapshot[] = [
  {
    date: "2026-09-30",
    values: {
      ...values1005,
      certifications_claude: 10,
      agents_industrialises: 8,
      missions_avec_agents: 24,
      description_cicd: 60,
      publication_ai_showcase: 6,
    },
    targets: { ...targets1005, consultants_vibe_coding: 500, certifications_claude: 30, agents_industrialises: 9 },
    dashboard: dashboardBefore1014,
  },
  { date: "2026-10-05", values: values1005, targets: targets1005, dashboard: dashboardBefore1014 },
  { date: "2026-10-14", values: values1014, targets: targets1014, dashboard: dashboard1014 },
  { date: "2026-10-21", values: values1021, targets: referenceTargets, dashboard: dashboard1021 },
  makeSnapshot(SEED_PILOTAGE_DATE, referenceValues, referenceTargets, SEED_REPORT),
]
