import { useMemo, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import * as XLSX from "xlsx"
import { getTemplate } from "../templates"
import { autoMapColumns, buildDataRows, parseWorkbookFile, readSheet, type ParsedSheet } from "../lib/excelImport"
import { downloadBlankExcelTemplate } from "../lib/excelTemplate"
import { useReportStore } from "../store/reportStore"
import { FileDrop } from "../components/common/FileDrop"
import { ReportMetaForm } from "../components/dashboard/ReportMetaForm"
import type { ReportMeta } from "../types"

export function ImportExcelPage() {
  const { templateId } = useParams()
  const template = getTemplate(templateId ?? "")
  const navigate = useNavigate()
  const createReport = useReportStore((s) => s.createReport)
  const setRows = useReportStore((s) => s.setRows)

  const [meta, setMeta] = useState<ReportMeta>({ title: "", client: "", author: "", period: "" })
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const [sheet, setSheet] = useState<ParsedSheet | null>(null)
  const [mapping, setMapping] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)

  const previewRows = useMemo(() => sheet?.rows.slice(0, 5) ?? [], [sheet])

  if (!template) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8 text-sm text-[var(--color-text-muted)]">
        Template introuvable. <Link to="/templates" className="underline">Retour aux templates</Link>
      </div>
    )
  }

  async function handleFile(file: File) {
    setError(null)
    try {
      const wb = await parseWorkbookFile(file)
      setWorkbook(wb)
      selectSheet(wb, wb.SheetNames[0])
    } catch {
      setError("Impossible de lire ce fichier. Vérifiez qu'il s'agit bien d'un fichier Excel (.xlsx) ou CSV valide.")
    }
  }

  function selectSheet(wb: XLSX.WorkBook, sheetName: string) {
    const parsed = readSheet(wb, sheetName)
    if (!template) return
    setSheet(parsed)
    setMapping(autoMapColumns(parsed.headers, template))
  }

  function handleConfirm() {
    if (!template || !sheet) return
    const rows = buildDataRows(template, sheet, mapping)
    const id = createReport(template.id, { ...meta, title: meta.title || template.name })
    setRows(id, rows)
    navigate("/dashboard")
  }

  const mappedCount = Object.values(mapping).filter((i) => i >= 0).length

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-accent)]">
        {template.shortName}
      </p>
      <h1 className="mt-1 text-xl font-semibold text-[var(--color-text)]">
        Importer un fichier Excel
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Chargez votre export Excel ou CSV. Les colonnes sont reconnues automatiquement à partir
        de leur en-tête ; vous pouvez corriger le mappage avant de générer le dashboard.
      </p>

      <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Informations du rapport</h2>
        <div className="mt-3">
          <ReportMetaForm meta={meta} onChange={(patch) => setMeta((m) => ({ ...m, ...patch }))} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm">
        <span className="text-[var(--color-text-muted)]">
          Pas de fichier sous la main ? Téléchargez un modèle vierge pour ce type de reporting.
        </span>
        <button
          onClick={() => downloadBlankExcelTemplate(template)}
          className="shrink-0 rounded-lg border border-[var(--color-border)] px-3 py-1.5 font-medium text-[var(--color-text)]"
        >
          Télécharger le modèle
        </button>
      </div>

      <div className="mt-4">
        <FileDrop onFile={handleFile} accept=".xlsx,.xls,.csv" hint="Formats acceptés : .xlsx, .xls, .csv" />
      </div>

      {error && <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p>}

      {workbook && sheet && (
        <div className="mt-6 space-y-4">
          {workbook.SheetNames.length > 1 && (
            <label className="block text-sm text-[var(--color-text)]">
              Feuille à importer
              <select
                value={sheet.activeSheet}
                onChange={(e) => selectSheet(workbook, e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                {workbook.SheetNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                Correspondance des colonnes
              </h2>
              <span className="text-xs text-[var(--color-text-muted)]">
                {mappedCount} / {template.criteria.length} critères reconnus
              </span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {template.criteria.map((criterion) => (
                <label key={criterion.key} className="text-xs text-[var(--color-text-muted)]">
                  {criterion.label}
                  {criterion.required && <span className="text-[var(--color-danger)]"> *</span>}
                  <select
                    value={mapping[criterion.key] ?? -1}
                    onChange={(e) =>
                      setMapping((m) => ({ ...m, [criterion.key]: Number(e.target.value) }))
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-sm text-[var(--color-text)]"
                  >
                    <option value={-1}>— Non importé —</option>
                    {sheet.headers.map((h, i) => (
                      <option key={i} value={i}>
                        {h || `Colonne ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>

          {previewRows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                Aperçu ({previewRows.length} premières lignes)
              </h2>
              <table className="mt-3 w-full text-left text-xs">
                <thead>
                  <tr className="text-[var(--color-text-muted)]">
                    {sheet.headers.map((h, i) => (
                      <th key={i} className="border-b border-[var(--color-border)] px-2 py-1 font-medium">
                        {h || `Colonne ${i + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, ri) => (
                    <tr key={ri}>
                      {sheet.headers.map((_, ci) => (
                        <td key={ci} className="border-b border-[var(--color-border)] px-2 py-1 text-[var(--color-text)]">
                          {String(row[ci] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleConfirm}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              Générer le dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
