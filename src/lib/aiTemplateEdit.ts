import type { Criterion, DataRow, ReportTemplate } from "../types"
import { makeId } from "./id"

/** Met à jour les propriétés éditables d'un critère (libellé, type, rôle). */
export function updateCriterion(
  template: ReportTemplate,
  key: string,
  patch: Partial<Pick<Criterion, "label" | "type" | "role">>,
): ReportTemplate {
  return {
    ...template,
    criteria: template.criteria.map((c) => (c.key === key ? { ...c, ...patch } : c)),
  }
}

/** Supprime un critère mal détecté par l'IA, et le retire des graphiques/statut/lignes associés. */
export function removeCriterion(
  template: ReportTemplate,
  rows: DataRow[],
  key: string,
): { template: ReportTemplate; rows: DataRow[] } {
  const criteria = template.criteria.filter((c) => c.key !== key)
  const charts = template.charts.filter((c) => c.criterionKey !== key)
  const statusKey = template.statusKey === key ? undefined : template.statusKey
  const rows2 = rows.map((row) => {
    const next = { ...row }
    delete next[key]
    return next
  })
  return { template: { ...template, criteria, charts, statusKey }, rows: rows2 }
}

/** Ajoute un critère manqué par l'IA (texte libre par défaut, à ajuster ensuite). */
export function addCriterion(
  template: ReportTemplate,
  rows: DataRow[],
): { template: ReportTemplate; rows: DataRow[] } {
  const existing = new Set(template.criteria.map((c) => c.key))
  let n = template.criteria.length + 1
  let key = `critere_${n}`
  while (existing.has(key)) {
    n += 1
    key = `critere_${n}`
  }
  const criterion: Criterion = { key, label: "Nouveau critère", type: "text", role: "info" }
  const rows2 = rows.map((row) => ({ ...row, [key]: "" }))
  return { template: { ...template, criteria: [...template.criteria, criterion] }, rows: rows2 }
}

export function setStatusKey(template: ReportTemplate, statusKey: string | undefined): ReportTemplate {
  return { ...template, statusKey }
}

export function updateCell(rows: DataRow[], rowId: string, key: string, value: string): DataRow[] {
  return rows.map((row) => (row.__id === rowId ? { ...row, [key]: value } : row))
}

/** Retire une ligne que l'IA a mal identifiée comme un élément de données (ex: une ligne de légende). */
export function removeRow(rows: DataRow[], rowId: string): DataRow[] {
  return rows.filter((row) => row.__id !== rowId)
}

/** Ajoute une ligne manquée par l'IA, à compléter manuellement. */
export function addRow(template: ReportTemplate, rows: DataRow[]): DataRow[] {
  const blank: DataRow = { __id: makeId() }
  for (const c of template.criteria) blank[c.key] = ""
  return [...rows, blank]
}
