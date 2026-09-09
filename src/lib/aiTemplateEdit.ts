import type { Dispatch, SetStateAction } from "react"
import type { Criterion, DataRow, ReportTemplate } from "../types"
import { makeId } from "./id"

export interface ImportDraft {
  template: ReportTemplate
  rows: DataRow[]
}

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

/** Supprime un critère mal détecté, et le retire des graphiques/statut/lignes associés. */
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

/** Ajoute un critère manqué par l'import (texte libre par défaut, à ajuster ensuite). */
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

/** Retire une ligne mal identifiée comme un élément de données (ex: une ligne de légende). */
export function removeRow(rows: DataRow[], rowId: string): DataRow[] {
  return rows.filter((row) => row.__id !== rowId)
}

/** Ajoute une ligne manquée par l'import, à compléter manuellement. */
export function addRow(template: ReportTemplate, rows: DataRow[]): DataRow[] {
  const blank: DataRow = { __id: makeId() }
  for (const c of template.criteria) blank[c.key] = ""
  return [...rows, blank]
}

/**
 * Construit les callbacks attendus par `AiReviewEditor` à partir d'un setter de brouillon
 * `{template, rows}` — évite de répéter ce câblage partout où l'écran de relecture est utilisé
 * (nouveau rapport, édition d'un rapport existant, mise à jour depuis un nouveau fichier).
 */
export function reviewEditorHandlers(setDraft: Dispatch<SetStateAction<ImportDraft | null>>) {
  return {
    onUpdateCriterion: (key: string, patch: Partial<Pick<Criterion, "label" | "type" | "role">>) =>
      setDraft((d) => (d ? { ...d, template: updateCriterion(d.template, key, patch) } : d)),
    onRemoveCriterion: (key: string) =>
      setDraft((d) => {
        if (!d) return d
        const { template, rows } = removeCriterion(d.template, d.rows, key)
        return { template, rows }
      }),
    onAddCriterion: () =>
      setDraft((d) => {
        if (!d) return d
        const { template, rows } = addCriterion(d.template, d.rows)
        return { template, rows }
      }),
    onSetStatusKey: (key: string | undefined) =>
      setDraft((d) => (d ? { ...d, template: setStatusKey(d.template, key) } : d)),
    onUpdateCell: (rowId: string, key: string, value: string) =>
      setDraft((d) => (d ? { ...d, rows: updateCell(d.rows, rowId, key, value) } : d)),
    onRemoveRow: (rowId: string) => setDraft((d) => (d ? { ...d, rows: removeRow(d.rows, rowId) } : d)),
    onAddRow: () => setDraft((d) => (d ? { ...d, rows: addRow(d.template, d.rows) } : d)),
  }
}
