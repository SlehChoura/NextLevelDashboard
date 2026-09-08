import type { Criterion, CriterionOption, DataRow } from "../types"

export function getOption(criterion: Criterion, rawValue: unknown): CriterionOption | undefined {
  if (!criterion.options) return undefined
  const value = String(rawValue ?? "").trim().toLowerCase()
  return criterion.options.find(
    (o) => o.value.toLowerCase() === value || o.label.toLowerCase() === value,
  )
}

export function formatCellValue(criterion: Criterion, rawValue: unknown): string {
  if (rawValue === null || rawValue === undefined || rawValue === "") return "—"
  if (criterion.type === "select" || criterion.type === "severity" || criterion.type === "status") {
    return getOption(criterion, rawValue)?.label ?? String(rawValue)
  }
  if (criterion.type === "percent") {
    const n = Number(rawValue)
    return Number.isFinite(n) ? `${n}%` : String(rawValue)
  }
  if (criterion.type === "date") {
    return formatDateValue(rawValue)
  }
  return String(rawValue)
}

export function formatDateValue(rawValue: unknown): string {
  if (rawValue === null || rawValue === undefined || rawValue === "") return "—"
  const d = new Date(String(rawValue))
  if (Number.isNaN(d.getTime())) return String(rawValue)
  return d.toLocaleDateString("fr-FR")
}

/** Regroupe les lignes par valeur d'un critère et compte les occurrences non vides. */
export function countByCriterion(
  rows: DataRow[],
  criterion: Criterion,
): { key: string; label: string; count: number; color?: string }[] {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const raw = row[criterion.key]
    if (raw === null || raw === undefined || raw === "") continue
    const key = String(raw).trim().toLowerCase()
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return Array.from(counts.entries()).map(([key, count]) => {
    const option = criterion.options?.find(
      (o) => o.value.toLowerCase() === key || o.label.toLowerCase() === key,
    )
    return {
      key,
      label: option?.label ?? key,
      count,
      color: option?.color,
    }
  })
}

export function averageOfNumeric(rows: DataRow[], key: string): number | null {
  const values = rows
    .map((r) => Number(r[key]))
    .filter((n) => Number.isFinite(n))
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}
