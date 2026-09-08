import * as XLSX from "xlsx"
import type { ReportTemplate } from "../types"

/** Génère et télécharge un fichier Excel vierge (en-têtes + ligne d'exemple) pour un template. */
export function downloadBlankExcelTemplate(template: ReportTemplate) {
  const headers = template.criteria.map((c) => c.label)
  const exampleRow = template.criteria.map((c) => {
    if (c.example) return c.example
    if (c.options?.length) return c.options[0].label
    return ""
  })

  const worksheet = XLSX.utils.aoa_to_sheet([headers, exampleRow])
  worksheet["!cols"] = headers.map((h) => ({ wch: Math.max(16, h.length + 2) }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Données")

  const fileName = `modele-${template.id}.xlsx`
  XLSX.writeFile(workbook, fileName)
}
