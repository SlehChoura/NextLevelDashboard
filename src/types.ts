/** Types de critères pris en charge par un template de reporting. */
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
  /** Libellés alternatifs utilisés pour la reconnaissance automatique des colonnes Excel. */
  aliases?: string[]
  options?: CriterionOption[]
  required?: boolean
  /** Utilisé comme placeholder / valeur d'exemple dans le formulaire et l'export Excel type. */
  example?: string
}

export type TemplateCategory =
  | "projet"
  | "audit"
  | "vulnerabilites"
  | "comite"
  | "incident"

export interface ChartSpec {
  id: string
  title: string
  kind: "bar" | "pie"
  /** Clé du critère dont la distribution des valeurs est représentée. */
  criterionKey: string
}

export interface ReportTemplate {
  id: string
  name: string
  shortName: string
  description: string
  situation: string
  category: TemplateCategory
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
  templateId: string
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
