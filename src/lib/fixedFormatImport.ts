import type { ChartSpec, Criterion, CriterionOption, DataRow, ReportTemplate } from "../types"
import type { ParsedSheet } from "./excelImport"
import { makeId } from "./id"

const PALETTE: CriterionOption["color"][] = ["success", "info", "warning", "danger", "neutral"]

function slugify(text: string): string {
  const base = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
  return base || "critere"
}

function uniqueKey(base: string, existing: Set<string>): string {
  let key = base
  let n = 2
  while (existing.has(key)) {
    key = `${base}_${n}`
    n += 1
  }
  existing.add(key)
  return key
}

/** Un nombre en tête de cellule (ex: "50%", "~99%", "50% (déployable en local)") — le reste du texte est ignoré. */
const LEADING_NUMBER = /^[~≈]?\s*(\d+(?:[.,]\d+)?)\s*%?/

function extractLeadingNumber(raw: string): number | null {
  const match = LEADING_NUMBER.exec(raw.trim())
  if (!match) return null
  const n = Number(match[1].replace(",", "."))
  return Number.isFinite(n) ? n : null
}

interface ColumnInference {
  type: Criterion["type"]
  role: Criterion["role"]
  options?: CriterionOption[]
}

/** Un compteur (ex: "nombre de missions") n'est pas un pourcentage, même si ses valeurs sont numériques. */
const COUNT_HEADER = /^\s*(nombre|nb\.?)\s|\bcount\b/i

/** Une colonne Oui/Non (ex: "Propale type") : une cellule vide signifie "Non". */
const YES_NO_HEADER = /propale/i

const YES_NO_OPTIONS: CriterionOption[] = [
  { value: "oui", label: "Oui", color: "success" },
  { value: "non", label: "Non", color: "neutral" },
]

/**
 * Colonnes dont le type est fixé par leur en-tête plutôt que déduit des valeurs : la déduction
 * échoue dès que la colonne est peu remplie (ex: une seule propale type renseignée, ou des
 * compteurs laissés vides), alors que le dashboard attend toujours un Oui/Non et un nombre.
 */
function knownColumnKind(header: string): "yesNo" | "count" | null {
  if (YES_NO_HEADER.test(header)) return "yesNo"
  if (COUNT_HEADER.test(header)) return "count"
  return null
}

function inferColumn(values: string[], header: string): ColumnInference {
  const kind = knownColumnKind(header)
  if (kind === "yesNo") return { type: "select", role: "dimension", options: YES_NO_OPTIONS }
  if (kind === "count") return { type: "number", role: "metric" }

  const nonEmpty = values.filter((v) => v !== "")
  if (nonEmpty.length === 0) return { type: "text", role: "info" }

  const numericish = nonEmpty.filter((v) => LEADING_NUMBER.test(v))
  if (numericish.length / nonEmpty.length >= 0.6) {
    return { type: "percent", role: "metric" }
  }

  const distinct = Array.from(new Set(nonEmpty))
  const looksLikeCategory = distinct.length <= 6 && distinct.every((v) => v.length <= 60 && !v.includes("\n"))
  if (looksLikeCategory) {
    let paletteIndex = 0
    return {
      type: "select",
      role: "dimension",
      // "N/A" est toujours neutre, quel que soit son ordre d'apparition dans les données.
      options: distinct.map((v) => ({
        value: slugify(v),
        label: v,
        color: isNotApplicable(v) ? "neutral" : PALETTE[paletteIndex++ % PALETTE.length],
      })),
    }
  }

  return { type: "text", role: "info" }
}

export interface AmbiguousCell {
  /** Identifiant stable "rowId::criterionKey", utilisé pour réappliquer la normalisation IA. */
  id: string
  rowId: string
  rowLabel: string
  criterionKey: string
  criterionLabel: string
  criterionType: Criterion["type"]
  rawValue: string
}

export interface FixedFormatImportResult {
  template: ReportTemplate
  rows: DataRow[]
  ambiguousCells: AmbiguousCell[]
}

/**
 * Importe une feuille selon le seul format pris en charge par l'application : la première colonne
 * identifie l'élément suivi (ex: un agent/cas d'usage), les colonnes suivantes sont ses critères de
 * reporting. Entièrement déterministe : une ligne est une donnée réelle si sa première colonne est
 * non vide (ce qui exclut naturellement les blocs de légende, qui n'ont jamais cette colonne remplie).
 */
export function buildFromSheet(sheet: ParsedSheet): FixedFormatImportResult {
  const labelHeader = sheet.headers[0]?.trim() || "Élément suivi"
  const criterionColumns = sheet.headers
    .map((header, index) => ({ index, header: header.trim() }))
    .filter(({ index, header }) => index > 0 && header !== "")

  const dataSourceRows = sheet.rows.filter((row) => String(row[0] ?? "").trim() !== "")

  const usedKeys = new Set<string>(["label"])
  const criteria: Criterion[] = [
    { key: "label", label: labelHeader, type: "text", role: "label" },
    ...criterionColumns.map(({ index, header }) => {
      const values = dataSourceRows.map((row) => String(row[index] ?? "").trim())
      const inferred = inferColumn(values, header)
      return {
        key: uniqueKey(slugify(header), usedKeys),
        label: header,
        ...inferred,
      } satisfies Criterion
    }),
  ]

  const statusCriterion = criteria.find((c) => c.type === "select")
  const charts: ChartSpec[] = statusCriterion
    ? [{ id: statusCriterion.key, title: `Répartition par ${statusCriterion.label.toLowerCase()}`, kind: "bar", criterionKey: statusCriterion.key }]
    : []

  const template: ReportTemplate = {
    id: `ia4cyb-${makeId()}`,
    name: "Portefeuille des agents IA4CYB",
    description: `Suivi des éléments listés sous « ${labelHeader} », par critère de reporting.`,
    statusKey: statusCriterion?.key,
    criteria,
    charts,
  }

  const ambiguousCells: AmbiguousCell[] = []
  const rows: DataRow[] = dataSourceRows.map((sourceRow) => {
    const rowId = makeId()
    const rowLabel = String(sourceRow[0] ?? "").trim()
    const dataRow: DataRow = { __id: rowId, label: rowLabel }

    criterionColumns.forEach(({ index }, i) => {
      const criterion = criteria[i + 1]
      const rawCell = sourceRow[index]
      const raw = String(rawCell ?? "").trim()
      if (raw === "") {
        dataRow[criterion.key] = ""
        return
      }

      if (criterion.type === "percent") {
        const n = extractLeadingNumber(raw)
        if (n !== null) {
          // Excel stocke un pourcentage comme une fraction (0.75 pour "75 %") quand la cellule est
          // un vrai nombre ; un texte contenant déjà un "%" littéral (ex: "~99%") est lui sur 0-100.
          const isExcelFraction = typeof rawCell === "number" && n <= 1
          dataRow[criterion.key] = isExcelFraction ? Math.round(n * 1000) / 10 : n
          return
        }
        dataRow[criterion.key] = ""
        ambiguousCells.push({
          id: `${rowId}::${criterion.key}`,
          rowId,
          rowLabel,
          criterionKey: criterion.key,
          criterionLabel: criterion.label,
          criterionType: criterion.type,
          rawValue: raw,
        })
        return
      }

      if (criterion.type === "number") {
        const n = extractLeadingNumber(raw)
        if (n !== null) {
          dataRow[criterion.key] = n
          return
        }
        dataRow[criterion.key] = ""
        if (!isNotApplicable(raw)) {
          ambiguousCells.push({
            id: `${rowId}::${criterion.key}`,
            rowId,
            rowLabel,
            criterionKey: criterion.key,
            criterionLabel: criterion.label,
            criterionType: criterion.type,
            rawValue: raw,
          })
        }
        return
      }

      if (criterion.type === "select") {
        const match = criterion.options?.find((o) => o.label === raw || o.value === slugify(raw))
        dataRow[criterion.key] = match ? match.value : raw
        return
      }

      dataRow[criterion.key] = raw
    })

    return dataRow
  })

  return { template, rows: normalizeKnownColumns(template, rows).rows, ambiguousCells }
}

/** "oui" si la cellule indique une propale existante (Oui, X, un lien…), "non" si vide, Non ou N/A. */
export function toYesNo(raw: unknown): "oui" | "non" {
  const v = String(raw ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
  if (isNotApplicable(v) || ["non", "no", "n", "0", "false", "faux", "-", "—"].includes(v)) return "non"
  return "oui"
}

/** Un compteur : vide ou N/A vaut 0, un nombre en tête de texte est retenu, sinon la valeur brute est gardée. */
function toCount(raw: DataRow[string]): DataRow[string] {
  if (typeof raw === "number") return raw
  const text = String(raw ?? "").trim()
  if (isNotApplicable(text)) return 0
  return extractLeadingNumber(text) ?? text
}

/**
 * Applique aux colonnes à type fixe (Oui/Non, compteurs) leur type et des valeurs homogènes :
 * "oui"/"non" pour une propale type, un nombre (0 si vide) pour un nombre de missions. Utilisé à
 * l'import et pour remettre d'aplomb un rapport déjà enregistré par une version précédente.
 */
export function normalizeKnownColumns(template: ReportTemplate, rows: DataRow[]): { template: ReportTemplate; rows: DataRow[] } {
  const kinds = new Map<string, "yesNo" | "count">()
  const criteria = template.criteria.map((c) => {
    const kind = c.role === "label" ? null : knownColumnKind(c.label)
    if (!kind) return c
    kinds.set(c.key, kind)
    return kind === "yesNo"
      ? { ...c, type: "select" as const, role: "dimension" as const, options: YES_NO_OPTIONS }
      : { ...c, type: "number" as const, role: "metric" as const, options: undefined }
  })
  if (kinds.size === 0) return { template, rows }

  const nextRows = rows.map((row) => {
    const next = { ...row }
    for (const [key, kind] of kinds) {
      next[key] = kind === "yesNo" ? toYesNo(row[key]) : toCount(row[key])
    }
    return next
  })
  return { template: { ...template, criteria }, rows: nextRows }
}

/**
 * Un statut "présentable" ou "déployable" en contexte client (options générées par `inferColumn`,
 * dont la valeur technique est produite par `slugify` — donc déjà sans accent, en minuscules).
 */
export function isClientReadyStatus(value: string): boolean {
  const v = value.toLowerCase()
  return v.includes("contexte_client") && (v.startsWith("presentable") || v.startsWith("deployable"))
}

/** "N/A" (brut ou déjà passé par `slugify`) : une valeur explicitement non applicable. */
function isNotApplicable(value: string): boolean {
  const v = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "")
  return v === "" || v === "na"
}

/** Une "propale type" existe pour l'agent (voir {@link toYesNo}). */
export function hasPropaleType(value: string): boolean {
  return toYesNo(value) === "oui"
}

/** Réapplique les valeurs normalisées par l'IA (ou choisies manuellement) sur les lignes concernées. */
export function applyNormalizations(rows: DataRow[], normalizations: Map<string, string | number | null>): DataRow[] {
  if (normalizations.size === 0) return rows
  return rows.map((row) => {
    let changed = false
    const next = { ...row }
    for (const [id, value] of normalizations) {
      const [rowId, criterionKey] = id.split("::")
      if (rowId === row.__id) {
        next[criterionKey] = value ?? ""
        changed = true
      }
    }
    return changed ? next : row
  })
}
