/** Types de critères pris en charge par un dashboard de reporting. */
export type CriterionType =
  | "text"
  | "number"
  | "percent"
  | "date"
  | "select"
  | "severity"
  | "status"

export interface CriterionOption {
  value: string
  label: string
  /** Couleur RAG associée (utilisée pour badges et graphiques). */
  color: "success" | "warning" | "danger" | "info" | "neutral"
}

/** Rôle joué par un critère dans les graphiques du dashboard. */
export type CriterionRole = "dimension" | "metric" | "date" | "label" | "info"

export interface Criterion {
  key: string
  label: string
  type: CriterionType
  role: CriterionRole
  options?: CriterionOption[]
}

export interface ChartSpec {
  id: string
  title: string
  kind: "bar" | "pie"
  /** Clé du critère dont la distribution des valeurs est représentée. */
  criterionKey: string
}

/** Schéma d'un dashboard (critères, graphiques), déterminé par l'analyse IA du fichier importé. */
export interface ReportTemplate {
  id: string
  name: string
  description: string
  criteria: Criterion[]
  /** Clé du critère utilisé pour la synthèse RAG (rouge/orange/vert) en tête de dashboard. */
  statusKey?: string
  charts: ChartSpec[]
}

/** Une ligne de données, indexée par la clé du critère. */
export type DataRow = Record<string, string | number | null> & { __id: string }

export interface ReportMeta {
  title: string
  client: string
  author: string
  period: string
}

export interface ReportData {
  id: string
  /** Schéma du dashboard, généré par l'analyse IA du fichier importé pour ce rapport. */
  template: ReportTemplate
  meta: ReportMeta
  rows: DataRow[]
  createdAt: string
  updatedAt: string
}

export interface ThemeColors {
  primary: string
  primaryDark: string
  accent: string
  accentDark: string
  bg: string
  surface: string
  border: string
  text: string
  textMuted: string
  success: string
  warning: string
  danger: string
  info: string
}

export interface ThemeConfig {
  id: string
  name: string
  description: string
  colors: ThemeColors
  fontFamily: string
  logoDataUrl?: string
  /** true pour les palettes fournies par l'app (non supprimables), false pour un thème personnalisé. */
  builtIn: boolean
}
