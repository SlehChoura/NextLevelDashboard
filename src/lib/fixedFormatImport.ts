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
const COUNT_HEADER = /nombre|compte|count/i

function inferColumn(values: string[], header: string): ColumnInference {
  const nonEmpty = values.filter((v) => v !== "")
  if (nonEmpty.length === 0) return { type: "text", role: "info" }

  const numericish = nonEmpty.filter((v) => LEADING_NUMBER.test(v))
  if (numericish.length / nonEmpty.length >= 0.6) {
    return COUNT_HEADER.test(header) ? { type: "number", role: "metric" } : { type: "percent", role: "metric" }
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
    name: "Portefeuille de cas d'usage IA",
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

  return { template, rows, ambiguousCells }
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

/** Une "propale type" existe pour l'agent (cellule renseignée et différente de "N/A"). */
export function hasPropaleType(value: string): boolean {
  return !isNotApplicable(value)
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
