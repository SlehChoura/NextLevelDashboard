import * as XLSX from "xlsx"
import type { Criterion, DataRow, ReportTemplate } from "../types"
import { makeId } from "./id"

export interface ParsedSheet {
  sheetNames: string[]
  activeSheet: string
  headers: string[]
  rows: unknown[][]
}

function normalize(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

export async function parseWorkbookFile(file: File): Promise<XLSX.WorkBook> {
  const buffer = await file.arrayBuffer()
  return XLSX.read(buffer, { cellDates: true })
}

export function readSheet(workbook: XLSX.WorkBook, sheetName: string): ParsedSheet {
  const sheet = workbook.Sheets[sheetName]
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: "",
    blankrows: false,
  })
  const [headerRow, ...rows] = matrix as unknown[][]
  const headers = (headerRow ?? []).map((h) => String(h ?? "").trim())
  return { sheetNames: workbook.SheetNames, activeSheet: sheetName, headers, rows }
}

/**
 * Tente d'associer automatiquement chaque colonne du fichier Excel à un critère du template,
 * en comparant les en-têtes aux libellés et alias déclarés sur chaque critère.
 * Retourne, pour chaque critère, l'index de colonne détecté (ou -1 si aucune correspondance).
 */
export function autoMapColumns(
  headers: string[],
  template: ReportTemplate,
): Record<string, number> {
  const normalizedHeaders = headers.map(normalize)
  const claimed = new Set<number>()
  const mapping: Record<string, number> = {}

  for (const criterion of template.criteria) {
    const candidates = [criterion.label, ...(criterion.aliases ?? [])].map(normalize)
    let bestIndex = -1
    let bestScore = 0

    normalizedHeaders.forEach((header, index) => {
      if (claimed.has(index) || !header) return
      for (const candidate of candidates) {
        if (!candidate) continue
        let score = 0
        if (header === candidate) score = 3
        else if (header.includes(candidate) || candidate.includes(header)) score = 2
        if (score > bestScore) {
          bestScore = score
          bestIndex = index
        }
      }
    })

    mapping[criterion.key] = bestIndex
    if (bestIndex >= 0) claimed.add(bestIndex)
  }

  return mapping
}

function coerceCellValue(criterion: Criterion, raw: unknown): string | number | null {
  if (raw === null || raw === undefined || raw === "") return ""

  if (criterion.type === "date") {
    if (raw instanceof Date) return raw.toISOString().slice(0, 10)
    const parsed = new Date(String(raw))
    return Number.isNaN(parsed.getTime()) ? String(raw).trim() : parsed.toISOString().slice(0, 10)
  }

  if (criterion.type === "number" || criterion.type === "percent") {
    const cleaned = String(raw).replace("%", "").replace(",", ".").trim()
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : String(raw).trim()
  }

  if (criterion.type === "select" || criterion.type === "severity" || criterion.type === "status") {
    const normalized = normalize(raw)
    const match = criterion.options?.find(
      (o) => normalize(o.value) === normalized || normalize(o.label) === normalized,
    )
    return match ? match.value : String(raw).trim()
  }

  return String(raw).trim()
}

export function buildDataRows(
  template: ReportTemplate,
  sheet: ParsedSheet,
  mapping: Record<string, number>,
): DataRow[] {
  return sheet.rows
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
    .map((row) => {
      const dataRow: DataRow = { __id: makeId() }
      for (const criterion of template.criteria) {
        const colIndex = mapping[criterion.key]
        const raw = colIndex >= 0 ? row[colIndex] : ""
        dataRow[criterion.key] = coerceCellValue(criterion, raw)
      }
      return dataRow
    })
}
