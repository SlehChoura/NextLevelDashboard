export type PilotageCategory = "competences" | "agents" | "plateforme" | "impact"
export type PilotageOwner = "academy" | "plateforme" | "missions" | "finops"
export type PilotageDirection = "up" | "down"
export type PilotageStatus = "unlocked" | "progress" | "accelerate" | "risk"

export interface PilotageObjective {
  id: string
  category: PilotageCategory
  owner: PilotageOwner
  label: string
  description: string
  unit: string
  /** "up" = plus la valeur actuelle est haute, mieux c'est ; "down" = l'inverse (budget, seuil à ne pas dépasser). */
  direction: PilotageDirection
  target: number
  defaultCurrent: number
}

export const CATEGORY_LABELS: Record<PilotageCategory, string> = {
  competences: "Compétences",
  agents: "Agents IA",
  plateforme: "Plateforme",
  impact: "Impact",
}

export const OWNER_LABELS: Record<PilotageOwner, string> = {
  academy: "Academy",
  plateforme: "Équipe plateforme",
  missions: "Responsables de mission",
  finops: "FinOps",
}

export const STATUS_LABELS: Record<PilotageStatus, string> = {
  unlocked: "Succès débloqué",
  progress: "En bonne voie",
  accelerate: "À accélérer",
  risk: "À sécuriser",
}

/** Libellés des statuts affichés à l'utilisateur (voir {@link visibleStatus}). */
export const VISIBLE_STATUS_LABELS: Record<VisiblePilotageStatus, string> = {
  unlocked: "Succès débloqué",
  accelerate: "À accélérer",
}

/** Un objectif par KPI suivi dans la page KPI (Compétences, Agents IA, Plateforme, Impact). */
export const PILOTAGE_OBJECTIVES: PilotageObjective[] = [
  {
    id: "cyber_academy_ia",
    category: "competences",
    owner: "academy",
    label: "Cyber Academy avec contenu IA",
    description: "Diffuser un contenu dédié à l'IA dans les modules Cyber Academy existants.",
    unit: "Cyber Academy",
    direction: "up",
    target: 5,
    defaultCurrent: 2,
  },
  {
    id: "bt_academy_transformees",
    category: "competences",
    owner: "academy",
    label: "BT Academy transformées",
    description: "Faire évoluer les Business Trainings existants pour intégrer les usages de l'IA.",
    unit: "BT Academy",
    direction: "up",
    target: 8,
    defaultCurrent: 3,
  },
  {
    id: "consultants_vibe_coding",
    category: "competences",
    owner: "academy",
    label: "Consultants formés au Vibe Coding",
    description: "Développer l'autonomie des équipes dans la conception accélérée de solutions IA.",
    unit: "consultants",
    direction: "up",
    target: 50,
    defaultCurrent: 42,
  },
  {
    id: "certifications_claude",
    category: "competences",
    owner: "academy",
    label: "Certifications Claude obtenues",
    description: "Valider la montée en compétence individuelle sur les outils Claude.",
    unit: "certifications",
    direction: "up",
    target: 20,
    defaultCurrent: 9,
  },
  {
    id: "agents_disponibles",
    category: "agents",
    owner: "plateforme",
    label: "Agents disponibles",
    description: "Élargir le catalogue d'agents mis à disposition des équipes.",
    unit: "agents",
    direction: "up",
    target: 20,
    defaultCurrent: 14,
  },
  {
    id: "agents_industrialises",
    category: "agents",
    owner: "plateforme",
    label: "Agents industrialisés",
    description: "Faire passer les agents prioritaires du prototype à une exploitation robuste et sécurisée.",
    unit: "agents",
    direction: "up",
    target: 12,
    defaultCurrent: 8,
  },
  {
    id: "missions_avec_agents",
    category: "agents",
    owner: "missions",
    label: "Missions utilisant des agents IA",
    description: "Démontrer l'adoption opérationnelle des agents IA dans les missions en cours.",
    unit: "missions",
    direction: "up",
    target: 15,
    defaultCurrent: 11,
  },
  {
    id: "disponibilite_cicd",
    category: "plateforme",
    owner: "plateforme",
    label: "Disponibilité de la chaîne CI/CD",
    description: "Garantir une chaîne CI/CD disponible et fiable pour les équipes de développement.",
    unit: "%",
    direction: "up",
    target: 99.5,
    defaultCurrent: 99.2,
  },
  {
    id: "missions_realisees",
    category: "impact",
    owner: "missions",
    label: "Missions réalisées avec les agents",
    description: "Mesurer la valeur créée et l'usage réel des agents dans les missions livrées.",
    unit: "missions",
    direction: "up",
    target: 10,
    defaultCurrent: 14,
  },
]

const PROGRESS_THRESHOLD = 0.8
const RISK_OVERSHOOT = 1.05

/**
 * Ratio d'avancement vers la cible, 1 = cible atteinte (peut dépasser 1). La cible peut être
 * surchargée (valeur ajustée manuellement) — par défaut celle de l'objectif est utilisée.
 */
export function progressRatio(objective: PilotageObjective, current: number, target = objective.target): number {
  if (objective.direction === "up") {
    return target > 0 ? current / target : 0
  }
  return current > 0 ? target / current : 1
}

/** Arrondi à l'entier inférieur pour ne jamais afficher 100 % avant que la cible ne soit réellement atteinte. */
export function progressPercent(objective: PilotageObjective, current: number, target = objective.target): number {
  return Math.floor(progressRatio(objective, current, target) * 100)
}

export function computeStatus(objective: PilotageObjective, current: number, target = objective.target): PilotageStatus {
  const ratio = progressRatio(objective, current, target)
  if (ratio >= 1) return "unlocked"
  if (objective.direction === "down" && current > target * RISK_OVERSHOOT) return "risk"
  return ratio >= PROGRESS_THRESHOLD ? "progress" : "accelerate"
}

/**
 * Statut simplifié affiché pour le moment dans l'interface : les nuances "en bonne voie" et
 * "à sécuriser" sont temporairement masquées (regroupées avec "à accélérer") le temps de fiabiliser
 * ces trajectoires intermédiaires.
 */
export type VisiblePilotageStatus = "unlocked" | "accelerate"

export function visibleStatus(status: PilotageStatus): VisiblePilotageStatus {
  return status === "unlocked" ? "unlocked" : "accelerate"
}
