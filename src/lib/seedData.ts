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
export const SEED_VERSION = 7

/**
 * Date du fichier de suivi dont sont tirées les valeurs de référence du pilotage : un navigateur
 * qui n'a rien importé depuis reçoit ces valeurs à la place des précédentes.
 */
export const SEED_PILOTAGE_DATE = "2026-10-14"

/** Colonnes de l'onglet "Agents IA4CYB" (première colonne = agent suivi, suivantes = critères). */
export const DASHBOARD_HEADERS = [
  "Nos agents IA4CYB",
  "Status",
  "Portabilité",
  "Documentation",
  "Formation",
  "Communauté",
  "Ready to market",
  "Propale type",
  "Nombre de missions réalisées",
  "Publication dans le showcase AI",
]

export const DASHBOARD_ROWS: unknown[][] = [
  ["Smart Identity Analyzer", "Présentable en contexte client", 0.75, 0.9, 0.5, 0.5, 0.55, "", "", "Oui"],
  ["Crisis Maker", "Déployable en contexte client", 1, 1, 0.25, 0.5, 0.5, "Oui", 2, "Oui"],
  ["Booster EBIOS RM - Analyse de risques", "Présentable en contexte client", 0.5, 0.75, 0.75, 0.5, 0.5, "", 2, "Oui"],
  [
    "The Web Recon Accelerator - Local-LLM Powered Pentest Assistant",
    "Présentable en contexte client",
    1,
    1,
    1,
    1,
    1,
    "Oui",
    15,
    "Oui",
  ],
  ["The CyberBench Intelligence Orchestrator ", "WIP", 0.5, 0.33, 0, 1, 0.25, "En cours", 2, "Oui"],
  ["The CTI Exposure Scout – Autonomous Attack Surface Intelligence", "WIP", 0.5, 0.5, 0, 0, 0.25, "", "", "En cours"],
  ["AI‑Powered NIS2 Intelligence & Compliance Assistant", "WIP", 0.5, 0.5, 0.25, 0.25, 0.5, "", 2, "En cours"],
  ["Cyber-by-Design Project Assistant", "Présentable en contexte client", 0.75, 1, 0.75, 0.75, 0.75, "Oui", 2, "Oui"],
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
    "Oui",
  ],
  ["Kovex", "Déployable en contexte client", 1, 0.75, 0.75, 0.25, 0.75, "", 2, "Oui"],
  ["RegWatch", "WIP", 0.5, 0.5, 0.75, 0.25, 0.25, "", "", ""],
  ["WaveWarden", "WIP", 0.5, 0.25, 0.25, 0.25, 0.5, "", "", ""],
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
  updatedAt: "2026-10-14T00:00:00.000Z",
}

export const SEED_ACTIONS: ActionItem[] = [
  {
    id: "seed-action-1",
    title: "Synchronisation avec le relai cyber academy pour évoluer le support et le format",
    owner: "SlehEddine CHOURA",
    objectiveId: "cyber_academy_ia",
    status: "done",
    dueDate: "2026-09-30",
  },
  {
    id: "seed-action-2",
    title: "Synchronisation avec les différents relai cyber academy par BT",
    owner: "SlehEddine CHOURA",
    objectiveId: "bt_academy_transformees",
    status: "todo",
    dueDate: "2026-10-30",
  },
  {
    id: "seed-action-3",
    title: "Formation des consultants Cyber au vibe coding",
    owner: "Gérôme BILLOIS",
    objectiveId: "consultants_vibe_coding",
    status: "done",
    dueDate: "2026-09-30",
  },
  {
    id: "seed-action-4",
    title: "Identifier de nouveaux formateurs au vibe coding",
    owner: "SlehEddine CHOURA",
    objectiveId: "consultants_vibe_coding",
    status: "todo",
    dueDate: "2026-10-30",
  },
  {
    id: "seed-action-5",
    title: "Suivre le nombre des consultants Cyb certifiés Claude",
    owner: "Anna VALIER",
    objectiveId: "certifications_claude",
    status: "in_progress",
    dueDate: "2026-12-31",
  },
  {
    id: "seed-action-6",
    title: "Suivre le nombre d'agents disponibles",
    owner: "Anna VALIER",
    objectiveId: "agents_disponibles",
    status: "in_progress",
    dueDate: "2026-12-31",
  },
  {
    id: "seed-action-7",
    title: "Suivre le nombre d'agents industrialisés",
    owner: "Anna VALIER",
    objectiveId: "agents_industrialises",
    status: "in_progress",
    dueDate: "2026-12-31",
  },
  {
    id: "seed-action-8",
    title: "Suivre le nombre d'agents utilisés en mission",
    owner: "Anna VALIER",
    objectiveId: "missions_avec_agents",
    status: "in_progress",
    dueDate: "2026-12-31",
  },
  {
    id: "seed-action-9",
    title: "Dcoumentation de la chaine CI/CD",
    owner: "Mehdi BOUDJELLA",
    objectiveId: "description_cicd",
    status: "done",
    dueDate: "2026-09-30",
  },
  {
    id: "seed-action-10",
    title: "Documentation du How to",
    owner: "Mel ENZEN",
    objectiveId: "disponibilite_cicd",
    status: "done",
    dueDate: "2026-09-30",
  },
  {
    id: "seed-action-11",
    title: "Publication d'agents AI4CYB sur le site AI Showcase",
    owner: "Tom WILTBERGER",
    objectiveId: "publication_ai_showcase",
    status: "done",
    dueDate: "2026-10-06",
  },
  {
    id: "seed-action-12",
    title: "Descripction et How to de la chaine CI/CD",
    owner: "Mel ENZEN",
    objectiveId: "description_cicd",
    status: "done",
    dueDate: "2026-10-06",
  },
  {
    id: "seed-action-13",
    title: "Centraliser les guidelines pour un secure vibe coding",
    owner: "Mel ENZEN",
    objectiveId: "guidelines_cicd",
    status: "todo",
    dueDate: "2026-10-31",
  },
  {
    id: "seed-action-14",
    title: "Ajouter un démo mode pour nos agents AI4CYB",
    owner: "SlehEddine CHOURA",
    objectiveId: "demo_ai_showcase",
    status: "todo",
    dueDate: "2026-10-31",
  },
  {
    id: "seed-action-15",
    title: "Identifier et piloter l'attribution de licence Claude Code à la communauté AI4CYB Makers",
    owner: "SlehEddine CHOURA",
    objectiveId: "licences_claude",
    status: "in_progress",
    dueDate: "2026-10-31",
  },
  {
    id: "seed-action-16",
    title: "Vérification des critères de l'industrialisation pour les agents et les aider à les atteindre facilement",
    owner: "Anna VALIER",
    objectiveId: "agents_industrialises",
    status: "todo",
    dueDate: "2026-10-15",
  },
  {
    id: "seed-action-17",
    title: "Déployer les nouvelles fonctionnalités sur PARALLAX",
    owner: "Arnaud PETICOL",
    objectiveId: "description_cicd",
    status: "in_progress",
    dueDate: "2026-10-19",
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
  agents_disponibles: 10,
  agents_industrialises: 9,
  missions_avec_agents: 27,
}
const targets1005 = without(referenceTargets, ADDED_ON_2026_10_14)
/** Dashboard des agents des fichiers du 30/09 et du 05/10 (10 agents, une propale type). */
const dashboardBefore1014 = { agents: 10, missions: 27, ready: 7, propale: 1 }

/**
 * Historique initial : les fichiers de suivi du 30/09, du 05/10 et du {@link SEED_PILOTAGE_DATE},
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
  makeSnapshot(SEED_PILOTAGE_DATE, referenceValues, referenceTargets, SEED_REPORT),
]
