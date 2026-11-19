/**
 * Contenu de la page « Pitch client » : la chaîne de vibe coding de la communauté AI4CYB Makers,
 * ses principes, ses agents et deux scénarios de démo. Sources : page interne « Vibe-code, yes,
 * but how? », catalogue AI Showcase Cyber et onglet « Agents IA4CYB » du classeur de pilotage
 * (critères d'industrialisation, échelles de maturité, derniers liens de démo).
 */

/** Documentation de la communauté (site interne, accessible avec un compte Wavestone). */
export const COMMUNITY_SITE_URL = "https://internal.w-cyberlab.com/hdzIJm/wavestonecybaimakerinitiative"

export interface CommunityDoc {
  title: string
  /** Libellé court affiché sur la tuile. */
  short: string
  description: string
  path: string
  icon: "compass" | "rocket" | "shield" | "book" | "layers" | "key" | "coins" | "bot"
}

export const COMMUNITY_DOCS: CommunityDoc[] = [
  { short: "Choisir son chemin", title: "Vibe-code, yes, but how?", description: "Les deux chemins comparés, question par question.", path: "vibecoding-paths.html", icon: "compass" },
  { short: "Premier agent", title: "Environnement et premier agent", description: "Tutoriel d'installation et de déploiement d'un premier agent.", path: "vibecoding-setup-guide.html", icon: "rocket" },
  { short: "Principes", title: "Principes des agents", description: "Les règles de conception communes à tous nos agents.", path: "agent-principles.html", icon: "shield" },
  { short: "Playbook", title: "Playbook", description: "Des exemples concrets pour passer de l'idée au code.", path: "playbook.html", icon: "book" },
  { short: "Usages de l'IA", title: "De Copilot aux agents", description: "Quatre façons d'utiliser l'IA, jusqu'à l'agent personnel.", path: "ai-usage-models.html", icon: "layers" },
  { short: "Clé API", title: "Clé API Azure Foundry", description: "Connecter un agent aux modèles du tenant Wavestone.", path: "api-key.html", icon: "key" },
  { short: "Coûts", title: "Token economics", description: "Budgéter et suivre la consommation, en mission ou en interne.", path: "token-economics.html", icon: "coins" },
  { short: "Catalogue", title: "Nos agents", description: "Le catalogue des agents de la communauté.", path: "our-agents.html", icon: "bot" },
]

export function communityDocUrl(doc: CommunityDoc): string {
  return `${COMMUNITY_SITE_URL}/${doc.path}`
}

/** Une étape de la chaîne de vibe coding, de l'idée à l'agent utilisé en mission. */
export interface ChainStep {
  id: string
  title: string
  tools: string[]
  description: string
  /** Ce que l'étape garantit au client. */
  benefit: string
}

export const VIBE_CHAIN: ChainStep[] = [
  {
    id: "poste",
    title: "Poste Wavestone",
    tools: ["VS Code", "Claude Code", "Git"],
    description: "Le maker prépare son environnement : VS Code, l'extension Claude Code (licence Wavestone) et Git.",
    benefit: "Des outils validés par la DSI Wavestone, identiques pour tous les makers.",
  },
  {
    id: "parallax",
    title: "Parallax",
    tools: ["Hébergement", "Publication"],
    description: "Il demande à Parallax un environnement d'hébergement et de publication pour son futur agent.",
    benefit: "Chaque agent naît dans un espace sécurisé, géré par Wavestone.",
  },
  {
    id: "gitlab",
    title: "GitLab et AWS S3",
    tools: ["GitLab Wavestone", "AWS S3 Wavestone"],
    description: "Parallax crée automatiquement un dépôt de code sur le GitLab Wavestone et un espace de stockage S3 sur un compte AWS géré par Wavestone.",
    benefit: "Le code est versionné, partagé et maintenable par d'autres makers.",
  },
  {
    id: "vibe",
    title: "Vibe coding",
    tools: ["Claude Code", "Commits", "Déploiement automatique"],
    description: "Le maker code avec Claude Code et pousse régulièrement sur GitLab : des automatisations mettent à jour l'agent publié à chaque modification.",
    benefit: "Des itérations en heures plutôt qu'en semaines, sans étape manuelle de mise en production.",
  },
  {
    id: "sso",
    title: "SSO Wavestone",
    tools: ["Authentification", "Accès contrôlé"],
    description: "L'agent publié n'est accessible qu'après authentification par le SSO Wavestone.",
    benefit: "Personne n'utilise un agent sans être identifié.",
  },
  {
    id: "foundry",
    title: "Azure Foundry",
    tools: ["Tenant Azure Wavestone", "Modèles hébergés en Europe"],
    description: "Pour une mission, l'agent est connecté aux modèles hébergés sur le tenant Azure Wavestone, en Europe, avec un suivi des coûts (FinOps).",
    benefit: "Vos données restent dans un cadre maîtrisé : c'est le seul chemin autorisé pour des données client.",
  },
]

/** Les deux façons de vibe-coder un agent, comparées (page « Vibe-code, yes, but how? »). */
export const PATH_COMPARISON: { question: string; personal: string; makers: string }[] = [
  { question: "Méthode", personal: "On ouvre un outil d'IA et on itère, sans prérequis.", makers: "Les pratiques et outils de la communauté, déjà en place." },
  { question: "Outil de développement", personal: "N'importe quel outil, pour un PoC.", makers: "VS Code et Claude Code, validés par la DSI Wavestone." },
  { question: "Code source", personal: "Un GitHub personnel, hors Wavestone.", makers: "Le GitLab Wavestone, administré et sécurisé." },
  { question: "Mise en ligne", personal: "Un hébergeur public (GitHub Pages, Vercel…).", makers: "Parallax, derrière le SSO Wavestone, mis à jour à chaque push." },
  { question: "Modèles et données", personal: "Données fictives uniquement, jamais de données client.", makers: "Azure Foundry Wavestone (Europe) : données client autorisées." },
]

export interface Principle {
  title: string
  description: string
  icon: "shield" | "badge" | "git" | "lock" | "user" | "coins"
}

/**
 * Principes de développement de nos agents, tels qu'ils ressortent de la chaîne de la communauté
 * et des critères d'industrialisation (la page « Principes des agents » les détaille).
 */
export const AGENT_PRINCIPLES: Principle[] = [
  {
    icon: "shield",
    title: "Vos données ne sortent pas du cadre",
    description: "Les données client ne passent que par les modèles du tenant Azure Wavestone, hébergés en Europe. Plusieurs agents traitent même tout en local, sur le poste.",
  },
  {
    icon: "user",
    title: "L'IA propose, l'expert valide",
    description: "Chaque agent outille un consultant : les résultats sont relus et validés par un expert cyber avant d'arriver chez vous.",
  },
  {
    icon: "badge",
    title: "Des outils validés",
    description: "Un seul environnement, VS Code et Claude Code, validé par la DSI Wavestone et partagé par tous les makers.",
  },
  {
    icon: "git",
    title: "Un code maintenable",
    description: "Tout le code vit sur le GitLab Wavestone : un agent est repris, corrigé et enrichi par d'autres makers.",
  },
  {
    icon: "lock",
    title: "Un accès contrôlé",
    description: "Les agents sont publiés sur Parallax, derrière le SSO Wavestone, et mis à jour automatiquement.",
  },
  {
    icon: "coins",
    title: "Des coûts maîtrisés",
    description: "La consommation des modèles est suivie (FinOps) et budgétée, en mission comme en interne.",
  },
]

/** Critères d'un agent industrialisé (onglet « Agents IA4CYB » du classeur de pilotage). */
export const INDUSTRIALISATION_CRITERIA = [
  "Agent fonctionnel et déployable, dans sa version finale, dans un environnement client",
  "Publication de l'agent sur Parallax",
  "Publication de l'agent sur AI Showcase",
  "Mode démo et guide utilisateur disponibles",
  "Proposition commerciale type",
]

/** Échelles de maturité utilisées pour évaluer chaque agent (onglet « Agents IA4CYB »). */
export const MATURITY_AXES: { axis: string; levels: { score: string; label: string }[] }[] = [
  {
    axis: "Portabilité",
    levels: [
      { score: "0 %", label: "Application en local" },
      { score: "50 %", label: "Utilisable sur un poste Wavestone" },
      { score: "100 %", label: "Utilisable dans un environnement client" },
    ],
  },
  {
    axis: "Documentation",
    levels: [
      { score: "25 %", label: "Quelques documents de description" },
      { score: "50 %", label: "Fiche d'identité et démo" },
      { score: "75 %", label: "Support de présentation complet, utilisable en pitch" },
      { score: "100 %", label: "Site de présentation et de gouvernance de l'agent" },
    ],
  },
  {
    axis: "Formation",
    levels: [
      { score: "25 %", label: "Support de présentation" },
      { score: "50 %", label: "Démonstration de prise en main" },
      { score: "75 %", label: "Support de prise en main avec guidelines" },
      { score: "100 %", label: "Formateurs identifiés, formations lancées" },
    ],
  },
  {
    axis: "Communauté",
    levels: [
      { score: "25 %", label: "Équipe en place" },
      { score: "50 %", label: "Canal Teams pour animer la communauté" },
      { score: "75 %", label: "Mailing list ou point de contact" },
      { score: "100 %", label: "Animation effective" },
    ],
  },
  {
    axis: "Ready to market",
    levels: [
      { score: "25 %", label: "Business case identifié" },
      { score: "50 %", label: "Prêt à être présenté et vendu" },
      { score: "75 %", label: "Testé en mission chez un client" },
      { score: "100 %", label: "Industrialisé, comme une mission classique" },
    ],
  },
]

/** Grandes familles de sujets cyber couvertes par les agents (référence de cas d'usage → thème). */
export const AGENT_THEMES: Record<string, string> = {
  UC7: "Identité",
  UC10: "Identité",
  UC12: "Identité",
  UC3: "Conformité et risques",
  UC9: "Conformité et risques",
  UC11: "Conformité et risques",
  UC4: "Conformité et risques",
  UC6: "Audit et tests d'intrusion",
  UC1: "Audit et tests d'intrusion",
  UC8: "Gestion de crise",
  UC2: "Renseignement sur la menace",
  UC5: "Gestion des connaissances",
}

export interface DemoStep {
  title: string
  /** Ce que fait l'agent à cette étape. */
  feature: string
  /** Ce que le client y gagne. */
  benefit: string
}

export interface DemoScenario {
  /** Référence du cas d'usage (voir AGENT_PROFILES). */
  code: string
  name: string
  tagline: string
  /** Pour qui l'agent est conçu. */
  audience: string
  /** Trois atouts mis en avant sur la carte de la démo. */
  highlights: string[]
  url: string
  /** Démonstrateur hébergé sur l'environnement Wavestone (connexion SSO). */
  internal: boolean
  steps: DemoStep[]
}

/**
 * Deux démos parmi les derniers liens du classeur de pilotage : SAM (démo publique, utile à toute
 * équipe projet) et CrisisMaker (l'agent le plus utilisé en mission). Textes écrits pour être
 * présentés tels quels au client : fonctionnalités et bénéfices, sans consigne d'animation.
 */
export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    code: "UC4",
    name: "SAM – Security Advisor Mate",
    tagline: "Votre assistant Security by Design, à chaque phase de vos projets.",
    audience: "DSI, chefs de projet et équipes cyber",
    highlights: ["Relecture d'architecture en minutes", "Plan de remédiation priorisé", "Revue des clauses cyber"],
    url: "https://sam-webapp-179255767007.europe-west1.run.app/demo",
    internal: false,
    steps: [
      {
        title: "Un guide à chaque phase du projet",
        feature: "SAM indique à l'équipe projet ce qui est attendu d'elle en sécurité à chaque phase du cycle de vie, et quand solliciter l'équipe cyber.",
        benefit: "La sécurité s'intègre au rythme du projet, sans le ralentir.",
      },
      {
        title: "La relecture d'architecture automatisée",
        feature: "À partir d'un document d'architecture, SAM produit un rapport de conformité et insère ses commentaires directement dans le fichier Word.",
        benefit: "Des jours de relecture ramenés à quelques minutes, dans le format habituel de vos équipes.",
      },
      {
        title: "Des vulnérabilités enfin priorisées",
        feature: "SAM transforme un rapport de scan de vulnérabilités en plan de remédiation priorisé et contextualisé.",
        benefit: "Vos équipes traitent d'abord ce qui compte vraiment pour le projet.",
      },
      {
        title: "Les contrats passés au crible",
        feature: "SAM relit les clauses cyber d'un contrat et signale les manques au regard de vos exigences.",
        benefit: "Le même assistant couvre le technique et le contractuel.",
      },
      {
        title: "Déployable chez vous",
        feature: "SAM peut être déployé dans votre environnement, et chaque résultat reste validé par vos experts.",
        benefit: "Un accélérateur pour vos équipes, sous le contrôle de votre filière cyber.",
      },
    ],
  },
  {
    code: "UC8",
    name: "CrisisMaker",
    tagline: "Des exercices de crise immersifs et réalistes, conçus en un temps record.",
    audience: "RSSI, cellules de crise et directions générales",
    highlights: ["Notre agent le plus utilisé en mission", "Contenus multi-formats", "Compatible avec vos modèles d'IA"],
    url: "https://internal.w-cyberlab.com/DXEPHV/default/",
    internal: true,
    steps: [
      {
        title: "Un scénario taillé pour votre organisation",
        feature: "CrisisMaker part de votre secteur, de votre organisation et de la menace choisie (rançongiciel, fuite de données…).",
        benefit: "Un exercice qui colle à votre réalité, pas à un scénario générique.",
      },
      {
        title: "Des contenus générés en quelques minutes",
        feature: "La plateforme génère les injects de l'exercice : mails, articles de presse, messages, appels.",
        benefit: "Des semaines de préparation ramenées à quelques heures.",
      },
      {
        title: "Une chronologie maîtrisée",
        feature: "Le déroulé de l'exercice est visible minute par minute et ajustable en direct.",
        benefit: "Vous gardez la main sur le rythme et l'intensité de la crise.",
      },
      {
        title: "Vos données restent chez vous",
        feature: "CrisisMaker peut s'appuyer sur vos propres modèles d'IA, dans un environnement sécurisé et conforme à votre gouvernance.",
        benefit: "Aucun compromis entre réalisme et confidentialité.",
      },
    ],
  },
]
