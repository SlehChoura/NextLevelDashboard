/**
 * Nouvelles initiatives IA de la communauté AI4CYB Makers, pas encore suivies comme agents dans le
 * dashboard (onglet « Initiatives IA » du classeur de pilotage). Les noms des porteurs n'y figurent
 * pas : le site est public.
 */
export interface Initiative {
  title: string
  /** Business Technology concernée, si connue. */
  bt?: string
  /** Avancement tel qu'indiqué dans le classeur (« Disponible », « En cours »…). */
  status?: string
  description: string
  /** Code source ou démonstrateur public. */
  url?: string
}

export const INITIATIVES: Initiative[] = [
  {
    title: "Mapping MITRE",
    description:
      "À partir du contexte du client, du renseignement sur la menace (CTI) et des règles de détection en place, l'agent génère la heat map MITRE ATT&CK de sa couverture.",
    url: "https://benoitmarionpro.github.io/MITREMapper",
  },
  {
    title: "Earshot – transcription locale de réunions",
    bt: "CDR",
    status: "Disponible",
    description:
      "Transcrit en direct et en local l'audio d'une application (Teams, Zoom…) avec Whisper, affiche des sous-titres en temps réel, récupère le nom des intervenants depuis Teams et range chaque session sous son événement d'agenda. Aucune donnée n'est envoyée dans le cloud. Usage : comptes rendus d'entretiens et d'ateliers.",
    url: "https://github.com/Bouliw/earshot",
  },
  {
    title: "Vigie – analyse de journaux mappée MITRE ATT&CK",
    bt: "CDR",
    status: "Disponible",
    description:
      "Outil blue team en Python : lit les journaux Windows (EVTX, Sysmon), Linux (auth.log) et macOS, applique 36 règles Sigma (dont des corrélations brute force et password spraying) et produit un rapport HTML / JSON où chaque alerte est rattachée à MITRE ATT&CK, en différé ou en temps réel. Complémentaire du Mapping MITRE.",
    url: "https://github.com/Bouliw/vigie",
  },
  {
    title: "doc-indexer – corpus documentaire pour agents IA",
    bt: "CDR",
    status: "Disponible",
    description:
      "Convertit en local un dossier de documents (PDF scannés, Word, photos) en texte exploitable par un agent IA, avec OCR Apple Vision et mise à jour incrémentale. Usage : faire analyser des politiques ou des procédures par l'IA sans que les documents quittent le poste.",
    url: "https://github.com/Bouliw/doc-indexer-macos",
  },
  {
    title: "Architecture Advisor for IAM",
    bt: "DI",
    status: "En cours",
    description:
      "Aide à la conception d'architectures IAM pour les agents IA : recommande un pattern IAM cible, une pile de protocoles et les exigences associées. Comprend un catalogue de protocoles (avec génération d'une présentation par protocole), une checklist de revue d'architecture et un générateur de doctrines.",
  },
]
