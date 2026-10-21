import { useState } from "react"
import type { ReportData, ReportTemplate } from "../../types"
import { useReportStore } from "../../store/reportStore"
import { ReportMetaForm } from "./ReportMetaForm"
import { LineConcept } from "../ui/LineConcept"

export function DashboardHeader({
  report,
  template,
  onExport,
}: {
  report: ReportData
  template: ReportTemplate
  onExport: () => void
}) {
  const updateMeta = useReportStore((s) => s.updateMeta)
  const [editing, setEditing] = useState(false)

  const details = [report.meta.client, report.meta.period, report.meta.author].filter(Boolean).join(" · ")

  return (
    <div className="print-break-avoid overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <div className="relative overflow-hidden px-6 py-6 text-white" style={{ background: "var(--gradient-brand)" }}>
        <LineConcept
          className="absolute inset-0 h-full w-full opacity-60"
          style={{ maskImage: "linear-gradient(to right, transparent 0%, transparent 30%, black 70%)" }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">{template.name}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{report.meta.title || template.name}</h1>
            <p className="mt-1 text-sm text-white/75">
              {report.rows.length} agents{details ? ` · ${details}` : ""}
            </p>
          </div>
          <div className="no-print flex shrink-0 gap-2">
            <button
              onClick={() => setEditing((e) => !e)}
              className="rounded-full border border-white/40 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              {editing ? "Fermer" : "Modifier les informations"}
            </button>
            <button
              onClick={onExport}
              className="rounded-full bg-[var(--color-energy)] px-4 py-2 text-xs font-semibold text-[var(--color-primary)] transition hover:brightness-95"
            >
              Exporter en PDF
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <div className="no-print border-t border-[var(--color-border)] px-5 pb-5 pt-4">
          <ReportMetaForm meta={report.meta} onChange={updateMeta} />
        </div>
      )}
    </div>
  )
}
