export type PilotageCategory = "competences" | "agents" | "plateforme" | "notoriete"
export type PilotageOwner = "academy" | "plateforme" | "missions" | "finops" | "communication"
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
  notoriete: "Notoriété",
}

export const OWNER_LABELS: Record<PilotageOwner, string> = {
  academy: "Academy",
  plateforme: "Équipe plateforme",
  missions: "Responsables de mission",
  finops: "FinOps",
  communication: "Communication",
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

/** Un objectif par KPI suivi dans la page KPI (Compétences, Agents IA, Plateforme, Notoriété). */
export const PILOTAGE_OBJECTIVES: PilotageObjective[] = [
  {
    id: "cyber_academy_ia",
    category: "competences",
    owner: "academy",
    label: "Cyber Academy avec contenu IA",
    description: "Diffuser un contenu dédié à l'IA dans les modules Cyber Academy existants.",
    unit: "Cyber Academy",
    direction: "up",
    target: 1,
    defaultCurrent: 1,
  },
  {
    id: "bt_academy_transformees",
    category: "competences",
    owner: "academy",
    label: "BT Academy transformées",
    description: "Faire évoluer les Business Trainings existants pour intégrer les usages de l'IA.",
    unit: "BT Academy",
    direction: "up",
    target: 5,
    defaultCurrent: 1,
  },
  {
    id: "consultants_vibe_coding",
    category: "competences",
    owner: "academy",
    label: "Consultants formés au Vibe Coding",
    description: "Développer l'autonomie des équipes dans la conception accélérée de solutions IA.",
    unit: "consultants",
    direction: "up",
    target: 500,
    defaultCurrent: 250,
  },
  {
    id: "certifications_claude",
    category: "competences",
    owner: "academy",
    label: "Certifications Claude obtenues",
    description: "Valider la montée en compétence individuelle sur les outils Claude.",
    unit: "certifications",
    direction: "up",
    target: 30,
    defaultCurrent: 10,
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
    defaultCurrent: 10,
  },
  {
    id: "agents_industrialises",
    category: "agents",
    owner: "plateforme",
    label: "Agents industrialisés",
    description: "Faire passer les agents prioritaires du prototype à une exploitation robuste et sécurisée.",
    unit: "agents",
    direction: "up",
    target: 9,
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
    target: 50,
    defaultCurrent: 24,
  },
  {
    id: "disponibilite_cicd",
    category: "plateforme",
    owner: "plateforme",
    label: "Disponibilité de la chaîne CI/CD",
    description: "Garantir une chaîne CI/CD disponible et fiable pour les équipes de développement.",
    unit: "%",
    direction: "up",
    target: 100,
    defaultCurrent: 100,
  },
  {
    id: "description_cicd",
    category: "plateforme",
    owner: "plateforme",
    label: "Description et How to de la chaîne CI/CD",
    description: "Documenter la chaîne CI/CD et son mode d'emploi pour faciliter son adoption par les équipes.",
    unit: "%",
    direction: "up",
    target: 100,
    defaultCurrent: 60,
  },
  {
    id: "guidelines_cicd",
    category: "plateforme",
    owner: "plateforme",
    label: "Centraliser les guidelines pour un secure vibe coding",
    description: "Regrouper en un point unique les bonnes pratiques de sécurité pour le vibe coding.",
    unit: "%",
    direction: "up",
    target: 100,
    defaultCurrent: 10,
  },
  {
    id: "publication_ai_showcase",
    category: "notoriete",
    owner: "communication",
    label: "Publication d'agents AI4CYB sur le site AI Showcase",
    description: "Donner de la visibilité aux agents AI4CYB en les publiant sur le site AI Showcase.",
    unit: "agents",
    direction: "up",
    target: 10,
    defaultCurrent: 6,
  },
]

/**
 * Retrouve l'identifiant d'un objectif à partir d'une clé saisie dans un fichier importé, sans tenir
 * compte de la casse ni des séparateurs (ex: "Publication_AIShowcase" → "publication_ai_showcase").
 */
export function findObjectiveIdByKey(rawKey: string): string | undefined {
  const needle = compactKey(rawKey)
  if (!needle) return undefined
  return PILOTAGE_OBJECTIVES.find((o) => compactKey(o.id) === needle)?.id
}

/** Retrouve l'identifiant d'un objectif à partir de son libellé (insensible à la casse et aux accents). */
export function findObjectiveIdByLabel(rawLabel: string): string | undefined {
  const needle = compactKey(rawLabel)
  if (!needle) return undefined
  return PILOTAGE_OBJECTIVES.find((o) => compactKey(o.label) === needle)?.id
}

function compactKey(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
}

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
