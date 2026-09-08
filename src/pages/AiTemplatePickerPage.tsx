import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { templates, getTemplate } from "../templates"
import { parseWorkbookFile, readSheet, buildDataRows, type ParsedSheet } from "../lib/excelImport"
import { applyAiMapping, suggestDashboardFromExcel, type AiMappingSuggestion } from "../lib/ai"
import { useAiStore } from "../store/aiStore"
import { useReportStore } from "../store/reportStore"
import { FileDrop } from "../components/common/FileDrop"
import { ReportMetaForm } from "../components/dashboard/ReportMetaForm"
import type { ReportMeta } from "../types"

export function AiTemplatePickerPage() {
  const apiKey = useAiStore((s) => s.apiKey)
  const model = useAiStore((s) => s.model)
  const createReport = useReportStore((s) => s.createReport)
  const setRows = useReportStore((s) => s.setRows)
  const navigate = useNavigate()

  const [meta, setMeta] = useState<ReportMeta>({ title: "", client: "", author: "", period: "" })
  const [sheet, setSheet] = useState<ParsedSheet | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<AiMappingSuggestion | null>(null)

  if (!apiKey) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          Cette fonctionnalité nécessite une clé API IA configurée.
        </p>
        <Link
          to="/parametres-ia"
          className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          Configurer l'assistant IA
        </Link>
      </div>
    )
  }

  async function handleFile(file: File) {
    setError(null)
    setSuggestion(null)
    setLoading(true)
    try {
      const wb = await parseWorkbookFile(file)
      const parsed = readSheet(wb, wb.SheetNames[0])
      setSheet(parsed)
      const result = await suggestDashboardFromExcel({
        apiKey,
        model,
        candidates: templates,
        sheet: parsed,
      })
      setSuggestion(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'analyser ce fichier.")
    } finally {
      setLoading(false)
    }
  }

  const recommendedTemplate = suggestion ? getTemplate(suggestion.templateId) : undefined

  function handleGenerate() {
    if (!sheet || !suggestion || !recommendedTemplate) return
    const mapping = applyAiMapping(recommendedTemplate, sheet, suggestion)
    const rows = buildDataRows(recommendedTemplate, sheet, mapping)
    const id = createReport(recommendedTemplate.id, { ...meta, title: meta.title || recommendedTemplate.name })
    setRows(id, rows)
    navigate("/dashboard")
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-accent)]">
        Analyse IA
      </p>
      <h1 className="mt-1 text-xl font-semibold text-[var(--color-text)]">
        Laisser l'IA identifier le dashboard adapté
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Déposez un fichier Excel ou CSV : l'IA choisit le template le plus pertinent parmi ceux
        disponibles et propose la correspondance des colonnes.
      </p>

      <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Informations du rapport</h2>
        <div className="mt-3">
          <ReportMetaForm meta={meta} onChange={(patch) => setMeta((m) => ({ ...m, ...patch }))} />
        </div>
      </div>

      <div className="mt-4">
        <FileDrop onFile={handleFile} accept=".xlsx,.xls,.csv" hint="Formats acceptés : .xlsx, .xls, .csv" />
      </div>

      {loading && <p className="mt-3 text-sm text-[var(--color-text-muted)]">Analyse du fichier en cours…</p>}
      {error && <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p>}

      {suggestion && recommendedTemplate && sheet && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent)]/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-accent)]">
              Template recommandé
            </p>
            <h3 className="mt-1 text-base font-semibold text-[var(--color-text)]">
              {recommendedTemplate.name}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{suggestion.templateReason}</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">Correspondance proposée</h2>
            <table className="mt-3 w-full text-left text-sm">
              <thead>
                <tr className="text-[var(--color-text-muted)]">
                  <th className="border-b border-[var(--color-border)] px-2 py-1 font-medium">Critère</th>
                  <th className="border-b border-[var(--color-border)] px-2 py-1 font-medium">Colonne détectée</th>
                  <th className="border-b border-[var(--color-border)] px-2 py-1 font-medium">Confiance</th>
                </tr>
              </thead>
              <tbody>
                {recommendedTemplate.criteria.map((criterion) => {
                  const entry = suggestion.columnMapping.find((m) => m.criterionKey === criterion.key)
                  return (
                    <tr key={criterion.key}>
                      <td className="border-b border-[var(--color-border)] px-2 py-1 text-[var(--color-text)]">
                        {criterion.label}
                      </td>
                      <td className="border-b border-[var(--color-border)] px-2 py-1 text-[var(--color-text)]">
                        {entry?.matchedHeader ?? "—"}
                      </td>
                      <td className="border-b border-[var(--color-border)] px-2 py-1 text-[var(--color-text-muted)]">
                        {entry?.confidence ?? "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">
              Aperçu ({Math.min(5, sheet.rows.length)} premières lignes du fichier)
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
                {sheet.rows.slice(0, 5).map((row, ri) => (
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

          <div className="flex justify-end gap-3">
            <Link
              to={`/nouveau/${recommendedTemplate.id}/import`}
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)]"
            >
              Ajuster manuellement
            </Link>
            <button
              onClick={handleGenerate}
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
