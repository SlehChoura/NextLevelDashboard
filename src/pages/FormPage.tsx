import { useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { getTemplate } from "../templates"
import { useReportStore } from "../store/reportStore"
import { createEmptyRow } from "../lib/rows"
import { ReportMetaForm } from "../components/dashboard/ReportMetaForm"
import { RowEditorTable } from "../components/form/RowEditorTable"
import type { DataRow, ReportMeta } from "../types"

export function FormPage() {
  const { templateId } = useParams()
  const template = getTemplate(templateId ?? "")
  const navigate = useNavigate()
  const location = useLocation()
  const editReportId = (location.state as { editReportId?: string } | null)?.editReportId
  const reports = useReportStore((s) => s.reports)
  const editingReport = editReportId ? reports.find((r) => r.id === editReportId) : undefined

  const createReport = useReportStore((s) => s.createReport)
  const setRows = useReportStore((s) => s.setRows)
  const updateMeta = useReportStore((s) => s.updateMeta)
  const setActiveReport = useReportStore((s) => s.setActiveReport)

  const [meta, setMeta] = useState<ReportMeta>(
    editingReport?.meta ?? { title: "", client: "", author: "", period: "" },
  )
  const [rows, setRowsState] = useState<DataRow[]>(() => {
    if (editingReport && editingReport.rows.length > 0) return editingReport.rows
    return template ? [createEmptyRow(template)] : []
  })

  if (!template) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8 text-sm text-[var(--color-text-muted)]">
        Template introuvable. <Link to="/templates" className="underline">Retour aux templates</Link>
      </div>
    )
  }

  const requiredMissing = rows.length === 0

  function handleGenerate() {
    if (!template) return
    const cleanRows = rows.filter((r) => template.criteria.some((c) => String(r[c.key] ?? "").trim() !== ""))
    const finalMeta = { ...meta, title: meta.title || template.name }

    if (editingReport) {
      updateMeta(editingReport.id, finalMeta)
      setRows(editingReport.id, cleanRows)
      setActiveReport(editingReport.id)
    } else {
      const id = createReport(template.id, finalMeta)
      setRows(id, cleanRows)
    }
    navigate("/dashboard")
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-accent)]">
        {template.shortName}
      </p>
      <h1 className="mt-1 text-xl font-semibold text-[var(--color-text)]">
        {editingReport ? "Modifier les données" : "Saisir les critères manuellement"}
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Renseignez une ligne par jalon, constat ou indicateur. Le dashboard se construit à partir
        des mêmes critères que pour un import Excel.
      </p>

      <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Informations du rapport</h2>
        <div className="mt-3">
          <ReportMetaForm meta={meta} onChange={(patch) => setMeta((m) => ({ ...m, ...patch }))} />
        </div>
      </div>

      <div className="mt-6">
        <RowEditorTable template={template} rows={rows} onChange={setRowsState} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => setRowsState((r) => [...r, createEmptyRow(template)])}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text)]"
        >
          + Ajouter une ligne
        </button>

        <button
          onClick={handleGenerate}
          disabled={requiredMissing}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          {editingReport ? "Mettre à jour le dashboard" : "Générer le dashboard"}
        </button>
      </div>
    </div>
  )
}
