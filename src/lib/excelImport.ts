import * as XLSX from "xlsx"

export interface ParsedSheet {
  sheetNames: string[]
  activeSheet: string
  headers: string[]
  rows: unknown[][]
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
