import { Link, useNavigate } from "react-router-dom"
import { useReportStore } from "../store/reportStore"
import { resolveReportTemplate } from "../templates"

export function ReportsListPage() {
  const reports = useReportStore((s) => s.reports)
  const setActiveReport = useReportStore((s) => s.setActiveReport)
  const deleteReport = useReportStore((s) => s.deleteReport)
  const navigate = useNavigate()

  function open(id: string) {
    setActiveReport(id)
    navigate("/dashboard")
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Mes rapports</h1>
        <Link
          to="/templates"
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          + Nouveau rapport
        </Link>
      </div>

      {reports.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--color-text-muted)]">
          Aucun rapport enregistré pour l'instant. Les rapports que vous créez sont sauvegardés
          localement dans votre navigateur.
        </p>
      ) : (
        <div className="mt-6 space-y-2">
          {reports
            .slice()
            .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
            .map((report) => {
              const template = resolveReportTemplate(report)
              return (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
                >
                  <button onClick={() => open(report.id)} className="text-left">
                    <div className="text-sm font-medium text-[var(--color-text)]">
                      {report.meta.title || template?.name || "Rapport sans titre"}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {template?.shortName ?? "Template inconnu"} · {report.rows.length} ligne(s) · mis à jour
                      le {new Date(report.updatedAt).toLocaleDateString("fr-FR")}
                    </div>
                  </button>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                  >
                    Supprimer
                  </button>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
