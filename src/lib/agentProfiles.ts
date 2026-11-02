import { normalizeText } from "./combinedFormat"

/**
 * Fiche descriptive d'un agent IA4CYB, affichée au clic sur un agent (page Agents). Les chiffres
 * (statut, maturité, missions…) viennent de l'onglet agents du fichier de suivi ; cette fiche y
 * ajoute ce que le fichier importé ne porte pas : description, équipe, avancement et liens.
 *
 * Sources : catalogue AI Showcase Cyber (description, thèmes) et onglet « Agents IA4CYB » du
 * fichier de pilotage (porteur, équipe, actions effectuées, prochaines étapes, priorité). Les
 * liens SharePoint internes et les commentaires de risques n'y figurent pas : le site est public.
 */
export interface AgentProfile {
  /** Fragments de nom (sans accents, en minuscules) qui identifient l'agent dans le fichier. */
  keys: string[]
  /** Référence du cas d'usage dans le fichier de pilotage (ex: « UC7 »). */
  code: string
  /** Origine du cas d'usage (Interne, DAIS…). */
  source: string
  owner: string
  team: string[]
  description: string
  tags: string[]
  /** Nom de la démo sur AI Showcase Cyber, si l'agent y est publié. */
  showcaseName?: string
  /** Démonstrateur accessible en ligne. */
  demoUrl?: string
  done: string[]
  next: string[]
  /** Business Technology concernée. */
  bt?: string
  priority?: string
}

export const AI_SHOWCASE_CYBER_URL = "https://ai-showcase.wavestone-app.com/ai-demos/cyber"

export const AGENT_PROFILES: AgentProfile[] = [
  {
    keys: ["smart identity"],
    code: "UC7",
    source: "Interne",
    owner: "Nicolas LERMUSIAUX",
    team: ["Nicolas LERMUSIAUX (PMO)", "Martin CREUZE (IA)", "Youness BAKILI (DI)", "Louise CAIGNEART (Alumni IA)", "Anatole CATHERIN"],
    description:
      "Débloque les projets IGA freinés par la mauvaise qualité des données d'identité et par des règles de transformation non documentées. À partir d'un extrait brut (Active Directory, Workday, Entra ID, SIRH), l'agent déduit la structure et les règles de dérivation réellement appliquées, signale les incohérences et produit un rapport détaillé de qualité des données. Des semaines d'investigation manuelle deviennent quelques minutes d'analyse, entièrement on-premise : aucune donnée d'identité ne quitte l'environnement du client.",
    tags: ["Identité", "Qualité des données"],
    showcaseName: "Smart identity analyzer",
    done: ["Optimisation des temps de traitement", "Publication sur AI Showcase", "Réalisation de la vidéo de présentation"],
    next: [
      "Refonte graphique pour l'aligner sur le modèle AI4CYB Wavestone",
      "Vidéo v2",
      "Nouvelle fonctionnalité en développement : liens et gestion complexes entre identités",
    ],
    bt: "DI",
  },
  {
    keys: ["crisis maker", "crisismaker"],
    code: "UC8",
    source: "Interne",
    owner: "Hugo TRICARD",
    team: ["Gérôme BILLOIS"],
    description:
      "Plateforme Wavestone de conception d'exercices de gestion de crise. Elle permet de créer rapidement des simulations immersives et réalistes en générant des contenus multiformats, tout en pouvant s'appuyer sur les modèles d'IA du client dans un environnement sécurisé, conforme à ses exigences de gouvernance et de sécurité.",
    tags: ["Simulation de crise", "Gouvernance"],
    showcaseName: "CrisisMaker",
    done: [
      "Livraison de la V2 de CrisisMaker",
      "Premières clés distribuées pour test en environnement client",
      "Livraison de plusieurs correctifs",
      "Livraison de la v1 du SharePoint",
      "Création d'un tableau de suivi des clés",
      "Début de production du business case",
    ],
    next: [
      "Tests de plusieurs modèles d'IA pour optimiser le rapport performance / coût",
      "Évaluer l'intérêt des modèles GPT-5",
      "Automatiser la livraison des clés (Azure Key Vault + Power Automate)",
      "Mettre en place un service de récupération des clés API pour les utilisateurs",
    ],
    bt: "CTC/CDR",
    priority: "Service de récupération des clés API pour faciliter le suivi des usages",
  },
  {
    keys: ["ebios"],
    code: "UC9",
    source: "Interne",
    owner: "Jean-François DI TOMMASO YEKPE",
    team: ["Swen LAURENT (IA)", "Matteo CRUZ (IA)", "Daniel CRUZ (IA)", "Maxime MIKIKIAN (ALMA)"],
    description:
      "Système agentique qui accélère les analyses de risques EBIOS RM et génère automatiquement des livrables structurés à partir des données et documents de la mission.",
    tags: ["Analyse de risques", "EBIOS RM"],
    showcaseName: "EBIOS RM",
    done: [
      "Nouvelle architecture cible livrée sur le Lab IA",
      "Business case finalisé",
      "Cahier des charges V2 finalisé (IEC, option langue)",
      "Livraison de la V1 bis, tests en cours",
    ],
    next: [
      "Déployer l'architecture cible en production (via Parallax)",
      "Lancer le développement de la V2 (volet anglais / français)",
      "Ajouter un mode démo",
    ],
    bt: "CTC/CDR",
    priority: "Mode démo",
  },
  {
    keys: ["web recon"],
    code: "UC6",
    source: "Interne / vote public",
    owner: "Corentin GOETGHEBEUR",
    team: ["Thomas ROUSSEAU"],
    description:
      "Workflow assisté par IA qui accélère les tests d'intrusion d'applications web tout en garantissant un haut niveau de confidentialité et de maîtrise. Il prend en charge les tâches répétitives pour que les pentesteurs se concentrent sur les activités complexes à forte valeur ajoutée.",
    tags: ["Pentest", "Sécurité web"],
    showcaseName: "Web Recon Accelerator",
    done: ["Outil déployé et utilisé en mission (20 missions)"],
    next: [
      "Corriger les problèmes mineurs pour garder l'outil utilisable",
      "Remplacement prévu par Crosswind dès que la plateforme sera disponible",
    ],
    bt: "AIR",
    priority: "En attente de Crosswind",
  },
  {
    keys: ["cyberbench"],
    code: "UC1",
    source: "DAIS",
    owner: "Julien MOREAU",
    team: ["Gérôme BILLOIS", "Ryan KAOUKEB", "Nesrine MATHLOUTHI", "Yann PATE", "Walfroy SAINT GUILHEM", "Julian MAZERAT"],
    description:
      "Simplifie la conduite d'une mission CyberBench en remplissant automatiquement le questionnaire d'audit à partir des échanges en atelier. L'agent accélère aussi la production des résultats comparés au benchmark Wavestone et fournit une analyse détaillée des forces et faiblesses de l'entreprise évaluée.",
    tags: ["Audit", "Benchmark"],
    showcaseName: "CyberBench Orchestrator",
    done: [
      "Deux agents créés : l'un exploite les enregistrements audio, l'autre facilite les restitutions",
      "Présentation des solutions formalisée",
      "POC réalisé sur un environnement client et des données internes",
      "Vidéo de présentation des agents",
    ],
    next: [
      "Mise en production : outil, propale et guide d'utilisation disponibles (novembre 2026)",
      "Système autonome de délivrance des clés API (novembre 2026)",
      "Améliorations à partir des retours des missions clients",
    ],
    bt: "CTC/CDR",
    priority: "Mise en production (début novembre)",
  },
  {
    keys: ["threat landscape", "cti exposure"],
    code: "UC2",
    source: "DAIS",
    owner: "Martin D'ACREMONT",
    team: ["Elliot HOUDJAL", "Matthieu HUBSCHWERLIN"],
    description:
      "Génère de façon autonome un panorama de la menace (threat landscape) à partir de sources de renseignement sur la menace (CTI). Le projet est poursuivi dans le cadre d'un projet de fin d'études EPITA encadré par l'offre CTI et la BU IA.",
    tags: ["Renseignement sur la menace", "CTI"],
    done: [
      "Premier POC avec un pipeline fonctionnel",
      "Documentation du projet sur le dépôt GitHub (installation et utilisation)",
    ],
    next: [
      "Publication sur AI Showcase (cible fin novembre 2026)",
      "Optimisation de l'usage de l'IA, des sources et de l'architecture par les étudiants EPITA (fin janvier)",
    ],
    bt: "CTC/CDR",
    priority: "Restructurer l'équipe",
  },
  {
    keys: ["nis2"],
    code: "UC3",
    source: "DAIS",
    owner: "Emma FADDA",
    team: ["Ouala BARHOUMI", "Wassim ALIDRA", "Louis MICHEL", "Devika VASISHT", "Maxime BOUSSO"],
    description:
      "Agent qui fait le lien entre réglementations de cybersécurité comme NIS2, DORA et ISO 27001. Il identifie automatiquement les correspondances entre exigences, met en évidence les écarts de conformité et montre ce qui peut être réutilisé d'un référentiel à l'autre, pour accélérer les projets de conformité en réduisant fortement l'effort manuel.",
    tags: ["Conformité", "Exigences"],
    showcaseName: "NIS2 x AI",
    done: [
      "Développement des fonctionnalités de l'agent",
      "Vidéo de démonstration",
      "Documentation : pitch et processus technique",
    ],
    next: ["Corriger l'agent suite aux bugs identifiés", "V2 en cours de développement"],
    bt: "CTC",
    priority: "Corriger l'agent (définir l'architecture la plus pertinente)",
  },
  {
    keys: ["cyber-by-design", "cyber by design", "security advisor"],
    code: "UC4",
    source: "DAIS",
    owner: "Emeline LEGRAND",
    team: ["Grégoire SENAME"],
    description:
      "SAM (Security Advisor Mate) est un assistant Security by Design. Il guide les équipes projet à chaque phase du cycle de vie, explique ce qui est attendu d'elles et quand impliquer l'équipe Cyber. Il peut relire des documents d'architecture (rapport de conformité et commentaires insérés dans le fichier Word), transformer des scans de vulnérabilités en plan de remédiation priorisé et contextualisé, ou encore relire les clauses cyber des contrats.",
    tags: ["Security by Design", "Conseil"],
    showcaseName: "Security Advisor Mate",
    demoUrl: "https://sam-webapp-179255767007.europe-west1.run.app/",
    done: ["Développement de l'outil", "Démos sur AI Showcase", "Slide de référence", "Pitch de l'outil"],
    next: [
      "Ajouter une vue tableau de bord / KPI",
      "Faire tester l'application (pentest)",
      "Déployer avec Parallax",
      "Pitch / démo de 3 minutes sur les fonctionnalités clés",
    ],
    bt: "CDR",
    priority: "Déploiement avec Parallax et démo de 3 minutes",
  },
  {
    keys: ["deliverable purifier"],
    code: "UC5",
    source: "DAIS",
    owner: "Benoit MARION",
    team: [
      "Salma AZIZ-ALAOUI",
      "Rowan HADJAZ",
      "Kjell ZIEGERT",
      "Aymane LAMHAMDI (dev)",
      "Théo BEKHEDDA (dev)",
      "Anahide CORLAY (dev)",
      "Thomas RIVOAL (dev)",
    ],
    description:
      "Anonymise automatiquement les livrables de mission pour pouvoir les réinjecter dans la base de connaissances (KM). Cas d'usage réservé à l'environnement Wavestone, qui peut être présenté aux clients pour montrer l'engagement de Wavestone sur la confidentialité de leurs données.",
    tags: ["Anonymisation", "Knowledge management"],
    done: [
      "Développement des fonctionnalités principales (nouvelles fonctionnalités en cours)",
      "Vidéos de démonstration",
      "Slide de référence et présentation de l'outil",
    ],
    next: [],
    bt: "Toutes",
  },
  {
    keys: ["kovex"],
    code: "UC10",
    source: "Interne",
    owner: "Nicolas CUDON",
    team: ["Nicolas CUDON"],
    description:
      "Outil Wavestone de role mining et d'analyse des identités : contrôle de la qualité des données, identification et cartographie des règles de séparation des tâches (SoD), campagnes de role mining. Tout reste dans le navigateur, sans installation : aucune donnée ne quitte le poste. L'IA n'est appelée que pour approfondir l'analyse, sur les données choisies par l'utilisateur, qui valide chaque résultat.",
    tags: ["Analyse des identités", "Role mining"],
    showcaseName: "KOVEX",
    demoUrl: "https://kovex-demo-179255767007.europe-west1.run.app/",
    done: [
      "Développement des fonctionnalités",
      "Vidéo marketing et vidéos de démo",
      "Formation Workday en cours de validation",
      "Page de présentation",
      "Déploiement en mode démonstrateur",
    ],
    next: ["Propale type"],
    bt: "DI / Nantes",
    priority: "Propale type, licence Claude",
  },
  {
    keys: ["regwatch"],
    code: "UC11",
    source: "Interne",
    owner: "Ouala BARHOUMI",
    team: ["Jules CHARLET SOMLETTE", "Faustine AVRIL"],
    description:
      "Veille réglementaire assistée par IA qui suit la transposition de la directive NIS 2 dans 29 pays européens. Chaque semaine, un agent autonome lit environ 80 sources officielles et de presse et propose les nouveautés à la validation d'experts. Fonctionnalités : veille avec score de pertinence et traduction, assistant qui répond en citant ses sources, rapports clients générés en PowerPoint. Extensible à d'autres réglementations.",
    tags: ["Veille réglementaire", "NIS 2"],
    showcaseName: "RegWatch",
    done: ["Interface complète"],
    next: ["Connecter le fichier comparatif de veille NIS 2 à l'outil déployé sur Parallax (mise à jour automatique)"],
    bt: "CTC",
  },
  {
    keys: ["wavewarden"],
    code: "UC12",
    source: "Interne",
    owner: "Samuel MAZAUD",
    team: ["Mathis MAGLOIRE"],
    description:
      "Agent d'analyse des identités et des accès cloud, alimenté par des données Entra ID, AWS et GCP. Les premiers pitchs clients arrivent.",
    tags: ["Identités cloud"],
    done: ["Interface complète"],
    next: [
      "Affiner les données importées (Entra ID, AWS, GCP) avec des logs d'activité réels",
      "Vidéo de démonstration (en cours)",
      "Présentation de l'outil en une slide",
    ],
    bt: "DI",
    priority: "Alimenter l'outil avec des données réelles",
  },
]

/** Fiche de l'agent dont le nom (tel qu'écrit dans le fichier de suivi) correspond. */
export function findAgentProfile(name: string): AgentProfile | undefined {
  const label = normalizeText(name) + " "
  return AGENT_PROFILES.find((p) => p.keys.some((key) => label.includes(key)))
}
