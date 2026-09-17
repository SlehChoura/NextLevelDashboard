import { useState } from "react"
import type { ReportData, ReportTemplate } from "../../types"
import { useReportStore } from "../../store/reportStore"
import { ReportMetaForm } from "./ReportMetaForm"
import { Logo } from "../common/Logo"

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

  return (
    <div className="print-break-avoid overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      <div className="h-1.5" style={{ backgroundColor: "var(--color-accent)" }} />
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex items-start gap-3.5">
          <Logo size={48} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
              {template.name}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
              {report.meta.title || template.name}
            </h1>
            <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
              {[report.meta.client, report.meta.period, report.meta.author]
                .filter(Boolean)
                .join(" · ") || "Informations du rapport non renseignées"}
            </p>
          </div>
        </div>

        <div className="no-print flex shrink-0 gap-2">
          <button
            onClick={() => setEditing((e) => !e)}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)]"
          >
            {editing ? "Fermer" : "Modifier"}
          </button>
          <button
            onClick={onExport}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Exporter en PDF
          </button>
        </div>
      </div>

      {editing && (
        <div className="no-print border-t border-[var(--color-border)] px-5 pb-5 pt-4">
          <ReportMetaForm meta={report.meta} onChange={(patch) => updateMeta(report.id, patch)} />
        </div>
      )}
    </div>
  )
}
