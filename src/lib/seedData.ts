import type { ParsedSheet } from "./excelImport"
import { buildFromSheet } from "./fixedFormatImport"
import type { ActionItem } from "./actions"
import type { ReportData } from "../types"

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
export const SEED_VERSION = 2

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
  "Lien AI Showcase",
  "Publication dans le showcase AI",
  "Nombre de missions réalisées",
]

const DASHBOARD_ROWS: unknown[][] = [
  [
    "Smart Identity Analyzer",
    "Présentable en contexte client",
    0.75,
    0.9,
    0.5,
    0.5,
    0.55,
    "Lien Deck Smart Identity Analyzer",
    "AI makers - Smart Identity Analyzer",
    "Oui",
    "",
  ],
  [
    "Crisis Maker",
    "Déployable en contexte client",
    1,
    1,
    0.25,
    0.5,
    0.5,
    "Lien Deck Crisis Maker",
    "Sharepoint - Crisis Maker",
    "Oui",
    "",
  ],
  [
    "Booster EBIOS RM - Analyse de risques",
    "Présentable en contexte client",
    0.5,
    0.75,
    0.75,
    0.5,
    0.5,
    "Lien Deck Booster EBIOS RM - Analyse de risques",
    "",
    "Oui",
    "2 (+ un POC et une mission à lancer prochainement)",
  ],
  [
    "The Web Recon Accelerator - Local-LLM Powered Pentest Assistant",
    "Présentable en contexte client",
    1,
    "~99%",
    "",
    "",
    1,
    "Lien Deck The Web Recon Accelerator",
    "AI makers - The Web Recon Accelerator – Local-LLM Powered Pentest Assistant",
    "Oui",
    "",
  ],
  [
    "The CyberBench Intelligence Orchestrator ",
    "WIP",
    0.5,
    0.33,
    0,
    1,
    0.25,
    "Pitch Cyberbench Orchestrator",
    "AI makers - The CyberBench Intelligence Orchestrator – End-to-End Audit Automation",
    "Oui",
    "2 (en mode test)",
  ],
  [
    "The CTI Exposure Scout – Autonomous Attack Surface Intelligence",
    "WIP",
    "50%\n(Déployable en local sur un PC). ",
    "50% (documentation GitHub faite)",
    0,
    0,
    0.25,
    "",
    "AI makers - The CTI Exposure Scout – Autonomous Attack Surface Intelligence",
    "En cours",
    "",
  ],
  [
    "AI‑Powered NIS2 Intelligence & Compliance Assistant",
    "WIP",
    0.5,
    0.5,
    0.25,
    0.25,
    0.5,
    "NIS2 X IA - AI Showcase- Pitch.pptx",
    "AI makers - AI‑Powered NIS2 Intelligence & Compliance Assistant",
    "En cours",
    "2 en mode support (ANSSI + SYENSQO)",
  ],
  [
    "Cyber-by-Design Project Assistant",
    "Présentable en contexte client",
    0.75,
    1,
    0.75,
    0.75,
    0.75,
    "SAM - Demo.pptx",
    "WK - CYB - Strategy and operational excellence - 04. AI Agent for Architecture Review",
    "Oui",
    2,
  ],
  [
    "The Deliverable Purifier – Automated Anonymization & KM Re-injection",
    "Présentable en contexte client",
    "N/A\nUse case dans environnement Wavestone uniquement\n(Wanonym abandonné car difficile de lancer un Exe dans SI client)",
    1,
    1,
    0.5,
    "N/A\nMais communication auprès du client possible pour montrer notre engagement sur la protection de la confidentitalité des clients",
    "Fiche AI makers (lien SharePoint)",
    "AI makers - The Deliverable Purifier – Automated Anonymization & KM Re-injection",
    "Oui",
    "",
  ],
  ["Kovex", "Déployable en contexte client", 1, 0.75, 0.75, 0.25, 0.75, "", "", "Oui", 2],
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
  rows: dashboardBuild.rows,
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-30T00:00:00.000Z",
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
    dueDate: "2026-10-15",
  },
  {
    id: "seed-action-3",
    title: "Formation des consultants Cyber au vibe coding",
    owner: "Gérôme BILLOIS",
    objectiveId: "consultants_vibe_coding",
    status: "in_progress",
    dueDate: "2026-09-30",
  },
  {
    id: "seed-action-4",
    title: "Identifier de nouveaux formateurs au vibe coding",
    owner: "SlehEddine CHOURA",
    objectiveId: "consultants_vibe_coding",
    status: "todo",
    dueDate: "2026-10-15",
  },
  {
    id: "seed-action-5",
    title: "Suivre le nombre des consultants Cyb certifiés Claude",
    owner: "Anna VALIER",
    objectiveId: "certifications_claude",
    status: "in_progress",
    dueDate: "2026-10-15",
  },
  {
    id: "seed-action-6",
    title: "Suivre le nombre d'agents disponibles",
    owner: "Anna VALIER",
    objectiveId: "agents_disponibles",
    status: "in_progress",
    dueDate: "2026-10-15",
  },
  {
    id: "seed-action-7",
    title: "Suivre le nombre d'agents industrialisés",
    owner: "Anna VALIER",
    objectiveId: "agents_industrialises",
    status: "in_progress",
    dueDate: "2026-10-15",
  },
  {
    id: "seed-action-8",
    title: "Suivre le nombre d'agents utilisés en mission",
    owner: "Anna VALIER",
    objectiveId: "missions_avec_agents",
    status: "in_progress",
    dueDate: "2026-10-15",
  },
  {
    id: "seed-action-9",
    title: "Dcoumentation de la chaine CI/CD",
    owner: "Mehdi BOUDJELLA",
    objectiveId: "description_cicd",
    status: "in_progress",
    dueDate: "2026-09-30",
  },
  {
    id: "seed-action-10",
    title: "Documentation du How to",
    owner: "Mel ENZEN",
    objectiveId: "disponibilite_cicd",
    status: "in_progress",
    dueDate: "2026-09-30",
  },
  {
    id: "seed-action-11",
    title: "Publication d'agents AI4CYB sur le site AI Showcase",
    owner: "Tom WILTBERGER",
    objectiveId: "publication_ai_showcase",
    status: "in_progress",
    dueDate: "2026-10-06",
  },
  {
    id: "seed-action-12",
    title: "Descripction et How to de la chaine CI/CD",
    owner: "Mel ENZEN",
    objectiveId: "description_cicd",
    status: "in_progress",
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
]
