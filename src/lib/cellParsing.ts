/**
 * Lecture des cellules du fichier de suivi (nombres, N/A, Oui/Non, dates), partagée par l'import
 * et par le contrôle du fichier (workbookCheck) : les deux appliquent exactement les mêmes règles,
 * le contrôle signale donc précisément ce que l'import fera de chaque cellule.
 */

const DIACRITICS = /[̀-ͯ]/g

/** Texte comparable : sans accents, sans espaces aux extrémités, en minuscules. */
export function normalizeText(s: string): string {
  return s.normalize("NFD").replace(DIACRITICS, "").trim().toLowerCase()
}

/** Un nombre en tête de cellule (ex: "50%", "~99%", "50% (déployable en local)") — le reste du texte est ignoré. */
export const LEADING_NUMBER = /^[~≈]?\s*(\d+(?:[.,]\d+)?)\s*%?/

/** Espaces (y compris insécables) utilisés comme séparateurs de milliers : "1 234". */
const SPACES = /[\s  ]/g

/**
 * Une cellule numérique, ou null si elle est vide ou illisible (une cellule vide ne vaut pas 0).
 * Accepte la virgule décimale, les séparateurs de milliers en espaces et un "%" final ("75 %" → 75).
 */
export function parseNumber(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null
  if (typeof raw !== "string") return null
  const text = raw.replace(SPACES, "").replace(/%$/, "").replace(",", ".")
  if (text === "") return null
  const n = Number(text)
  return Number.isFinite(n) ? n : null
}

/**
 * Valeur numérique d'une cellule, compte tenu de son affichage dans Excel : une cellule au format
 * pourcentage contient une fraction (1 pour "100 %"), ramenée ici sur l'échelle affichée (100).
 */
export function cellNumber(raw: unknown, formatted?: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw) && typeof formatted === "string" && formatted.includes("%")) {
    return Math.round(raw * 100 * 1e6) / 1e6
  }
  return parseNumber(raw)
}

/** "N/A", "NA", "n.a." (brut ou passé par un slug), éventuellement suivi d'un commentaire ("N/A\nUse case interne"). */
export function isNotApplicable(value: unknown): boolean {
  const v = normalizeText(String(value ?? ""))
  const compact = v.replace(/[^a-z0-9]+/g, "")
  return compact === "" || compact === "na" || /^n\s*[/._]?\s*a\b/.test(v)
}

export type YesNo = "oui" | "en_cours" | "non"

const NO_VALUES = ["n", "0", "false", "faux", "-", "—", "–"]
const YES_VALUES = ["o", "y", "x", "✓", "✔", "1", "true", "vrai", "ok"]

/**
 * Lit une cellule Oui / En cours / Non (« Propale type », « Agent industrialisé »…).
 * `recognised` est faux pour une valeur qui ne ressemble à aucune réponse attendue : elle est
 * comptée « Non » (une valeur douteuse ne doit pas gonfler un indicateur) et signalée à l'import.
 */
export function readYesNo(raw: unknown): { value: YesNo; recognised: boolean } {
  const v = normalizeText(String(raw ?? "")).replace(/_/g, " ").replace(/\s+/g, " ")
  if (v === "" || isNotApplicable(v) || NO_VALUES.includes(v) || /^non?\b/.test(v)) return { value: "non", recognised: true }
  if (/^(en cours|encours|wip|in progress|en preparation|a venir)\b/.test(v)) return { value: "en_cours", recognised: true }
  if (YES_VALUES.includes(v) || /^(oui|yes|fait|done|disponible|termine|lien|link|deck)\b/.test(v) || /^(https?:\/\/|www\.)/.test(v)) {
    return { value: "oui", recognised: true }
  }
  return { value: "non", recognised: false }
}

/**
 * "oui" si la cellule indique un élément existant (Oui, Fait, X, un lien…), "en_cours" s'il est en
 * préparation (En cours, WIP…), "non" sinon (vide, Non, N/A avec ou sans commentaire, valeur inconnue).
 */
export function toYesNo(raw: unknown): YesNo {
  return readYesNo(raw).value
}

/** "YYYY-MM-DD" à partir d'une année, d'un mois (1-12) et d'un jour, ou null si la date n'existe pas. */
function isoDate(y: number, m: number, d: number): string | null {
  const date = new Date(Date.UTC(y, m - 1, d))
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

/** Date du jour (ou de `date`) au format YYYY-MM-DD, dans le fuseau horaire de l'utilisateur. */
export function localIsoDate(date: Date = new Date()): string {
  return isoDate(date.getFullYear(), date.getMonth() + 1, date.getDate())!
}

/** Numéros de série Excel plausibles pour une échéance (1954 à 2119). */
const MIN_EXCEL_SERIAL = 20000
const MAX_EXCEL_SERIAL = 80000
const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30)

/**
 * Une date de cellule vers "YYYY-MM-DD" : "" si la cellule est vide, null si elle est illisible.
 * Accepte une date Excel (objet Date), un numéro de série Excel (cellule au format Standard),
 * "AAAA-MM-JJ" et "JJ/MM/AAAA" (ou JJ-MM-AAAA, JJ.MM.AAAA, année sur 2 chiffres).
 */
export function parseDateCell(raw: unknown): string | null {
  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) return null
    // Selon la version de SheetJS et le fuseau du navigateur, une date sans heure arrive à minuit
    // heure locale (ex: 14/11 23:00 UTC pour le 15/11 à Paris) ou à minuit UTC : on retient le
    // jour du fuseau où elle tombe pile à minuit, pour ne jamais décaler l'échéance d'un jour.
    return raw.getHours() === 0 && raw.getMinutes() === 0 ? localIsoDate(raw) : raw.toISOString().slice(0, 10)
  }
  if (typeof raw === "number") {
    if (!Number.isInteger(raw) || raw < MIN_EXCEL_SERIAL || raw > MAX_EXCEL_SERIAL) return null
    return new Date(EXCEL_EPOCH_MS + raw * 86_400_000).toISOString().slice(0, 10)
  }
  const s = String(raw ?? "").trim()
  if (s === "") return ""
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/.exec(s)
  if (iso) return isoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]))
  const fr = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4}|\d{2})$/.exec(s)
  if (fr) {
    const year = fr[3].length === 2 ? 2000 + Number(fr[3]) : Number(fr[3])
    return isoDate(year, Number(fr[2]), Number(fr[1]))
  }
  return null
}
