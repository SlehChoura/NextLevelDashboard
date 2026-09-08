import { useMemo, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import * as XLSX from "xlsx"
import { getTemplate } from "../templates"
import { autoMapColumns, buildDataRows, parseWorkbookFile, readSheet, type ParsedSheet } from "../lib/excelImport"
import { downloadBlankExcelTemplate } from "../lib/excelTemplate"
import { applyAiMapping, suggestDashboardFromExcel } from "../lib/ai"
import { useReportStore } from "../store/reportStore"
import { useAiStore } from "../store/aiStore"
import { FileDrop } from "../components/common/FileDrop"
import { ReportMetaForm } from "../components/dashboard/ReportMetaForm"
import type { ReportMeta } from "../types"

export function ImportExcelPage() {
  const { templateId } = useParams()
  const template = getTemplate(templateId ?? "")
  const navigate = useNavigate()
  const createReport = useReportStore((s) => s.createReport)
  const setRows = useReportStore((s) => s.setRows)
  const aiApiKey = useAiStore((s) => s.apiKey)
  const aiModel = useAiStore((s) => s.model)

  const [meta, setMeta] = useState<ReportMeta>({ title: "", client: "", author: "", period: "" })
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const [sheet, setSheet] = useState<ParsedSheet | null>(null)
  const [mapping, setMapping] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiNote, setAiNote] = useState<string | null>(null)

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
    setAiNote(null)
    setAiError(null)
  }

  async function handleAiAnalyze() {
    if (!template || !sheet || !aiApiKey) return
    setAiLoading(true)
    setAiError(null)
    try {
      const suggestion = await suggestDashboardFromExcel({
        apiKey: aiApiKey,
        model: aiModel,
        candidates: [template],
        sheet,
      })
      setMapping(applyAiMapping(template, sheet, suggestion))
      setAiNote(suggestion.templateReason)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Erreur inattendue lors de l'analyse IA.")
    } finally {
      setAiLoading(false)
    }
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

      {!aiApiKey && (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Astuce :{" "}
          <Link to="/parametres-ia" className="underline">
            configurez une clé IA
          </Link>{" "}
          pour une analyse des colonnes plus fine que la reconnaissance automatique.
        </p>
      )}

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
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                Correspondance des colonnes
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--color-text-muted)]">
                  {mappedCount} / {template.criteria.length} critères reconnus
                </span>
                {aiApiKey && (
                  <button
                    onClick={handleAiAnalyze}
                    disabled={aiLoading}
                    className="shrink-0 rounded-lg border border-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent)] disabled:opacity-50"
                  >
                    {aiLoading ? "Analyse en cours…" : "✨ Analyser avec l'IA"}
                  </button>
                )}
              </div>
            </div>
            {aiError && <p className="mt-2 text-xs text-[var(--color-danger)]">{aiError}</p>}
            {aiNote && !aiError && (
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                <span className="font-medium text-[var(--color-text)]">Analyse IA — </span>
                {aiNote}
              </p>
            )}
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
