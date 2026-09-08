import { Link } from "react-router-dom"
import { useReportStore } from "../store/reportStore"
import { DashboardHeader } from "../components/dashboard/DashboardHeader"
import { RagSummary } from "../components/dashboard/RagSummary"
import { KpiCard } from "../components/common/KpiCard"
import { DistributionBarChart } from "../components/charts/DistributionBarChart"
import { DistributionPieChart } from "../components/charts/DistributionPieChart"
import { DataTable } from "../components/dashboard/DataTable"
import { averageOfNumeric } from "../lib/criteria"

export function DashboardPage() {
  const report = useReportStore((s) => s.activeReport())

  if (!report) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          Aucun rapport actif. Générez un dashboard à partir d'un fichier pour commencer.
        </p>
        <Link
          to="/ia"
          className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          Générer un dashboard
        </Link>
      </div>
    )
  }

  const template = report.template
  const statusCriterion = template.criteria.find((c) => c.key === template.statusKey)
  const metricCriteria = template.criteria.filter((c) => c.role === "metric")

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 print-page">
      <div className="no-print mb-4">
        <Link to="/mes-rapports" className="text-sm text-[var(--color-text-muted)] hover:underline">
          ← Mes rapports
        </Link>
      </div>

      <div className="space-y-4">
        <DashboardHeader report={report} template={template} onExport={() => window.print()} />

        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard label="Éléments suivis" value={String(report.rows.length)} />
          {metricCriteria.map((c) => {
            const avg = averageOfNumeric(report.rows, c.key)
            return (
              <KpiCard
                key={c.key}
                label={`${c.label} (moyenne)`}
                value={avg === null ? "—" : `${Math.round(avg * 10) / 10}${c.type === "percent" ? "%" : ""}`}
              />
            )
          })}
        </div>

        {statusCriterion && <RagSummary criterion={statusCriterion} rows={report.rows} />}

        {report.rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-muted)]">
            Ce rapport ne contient aucune donnée pour le moment.
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {template.charts.map((chart) => {
                const criterion = template.criteria.find((c) => c.key === chart.criterionKey)
                if (!criterion) return null
                if (chart.kind === "pie") {
                  return <DistributionPieChart key={chart.id} title={chart.title} criterion={criterion} rows={report.rows} />
                }
                return <DistributionBarChart key={chart.id} title={chart.title} criterion={criterion} rows={report.rows} />
              })}
            </div>

            <DataTable template={template} rows={report.rows} />
          </>
        )}
      </div>
    </div>
  )
}
