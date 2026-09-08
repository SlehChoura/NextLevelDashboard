import type { DataRow, ReportTemplate } from "../types"
import { makeId } from "./id"

export function createEmptyRow(template: ReportTemplate): DataRow {
  const row: DataRow = { __id: makeId() }
  for (const criterion of template.criteria) {
    row[criterion.key] = ""
  }
  return row
}
