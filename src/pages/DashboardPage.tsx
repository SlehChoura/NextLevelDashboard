import { useState } from "react"
import { Link } from "react-router-dom"
import { useReportStore } from "../store/reportStore"
import { useFileImport } from "../hooks/useFileImport"
import { DashboardHeader } from "../components/dashboard/DashboardHeader"
import { RagSummary } from "../components/dashboard/RagSummary"
import { ClientReadyAgents } from "../components/dashboard/ClientReadyAgents"
import { KpiCard } from "../components/common/KpiCard"
import { DistributionBarChart } from "../components/charts/DistributionBarChart"
import { DistributionPieChart } from "../components/charts/DistributionPieChart"
import { DataTable } from "../components/dashboard/DataTable"
import { AiReviewEditor } from "../components/ai/AiReviewEditor"
import { FileDrop } from "../components/common/FileDrop"
import { averageOfNumeric } from "../lib/criteria"
import { reviewEditorHandlers, type ImportDraft } from "../lib/aiTemplateEdit"

type Mode = "view" | "edit" | "update"

export function DashboardPage() {
  const report = useReportStore((s) => s.activeReport())
  const updateData = useReportStore((s) => s.updateData)
  const [mode, setMode] = useState<Mode>("view")
  const [editDraft, setEditDraft] = useState<ImportDraft | null>(null)
  const fileImport = useFileImport()

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

  function exitToView() {
    setMode("view")
    setEditDraft(null)
    fileImport.reset()
  }

  return (
    <div className={`mx-auto max-w-5xl px-6 py-8 ${mode === "view" ? "print-page" : ""}`}>
      <div className="no-print mb-4 flex items-center justify-between">
        <Link to="/mes-rapports" className="text-sm text-[var(--color-text-muted)] hover:underline">
          ← Mes rapports
        </Link>
        {mode === "view" && (
          <div className="flex gap-3">
            <button
              onClick={() => setMode("update")}
              className="text-sm text-[var(--color-text-muted)] hover:underline"
            >
              Mettre à jour avec un fichier
            </button>
            <button
              onClick={() => {
                setEditDraft({ template: report.template, rows: report.rows })
                setMode("edit")
              }}
              className="text-sm text-[var(--color-text-muted)] hover:underline"
            >
              Modifier les données
            </button>
          </div>
        )}
      </div>

      {mode === "edit" && editDraft && (
        <AiReviewEditor
          template={editDraft.template}
          rows={editDraft.rows}
          confirmLabel="Enregistrer les modifications"
          discardLabel="Annuler"
          {...reviewEditorHandlers(setEditDraft)}
          onConfirm={() => {
            updateData(report.id, editDraft.template, editDraft.rows)
            exitToView()
          }}
          onDiscard={exitToView}
        />
      )}

      {mode === "update" && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Importez un nouveau fichier pour remplacer les données de ce rapport (ex : un export à
            jour du même suivi). Les critères et lignes sont recalculés à partir de ce fichier ;
            vous pourrez les corriger avant de valider la mise à jour.
          </p>

          {!fileImport.draft && (
            <>
              <FileDrop onFile={fileImport.handleFile} accept=".xlsx,.xls,.csv" hint="Formats acceptés : .xlsx, .xls, .csv" />
              {fileImport.error && <p className="text-sm text-[var(--color-danger)]">{fileImport.error}</p>}
            </>
          )}

          {fileImport.workbook && fileImport.sheet && fileImport.workbook.SheetNames.length > 1 && (
            <label className="block text-sm text-[var(--color-text)]">
              Feuille à importer
              <select
                value={fileImport.sheet.activeSheet}
                onChange={(e) => fileImport.handleSheetChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                {fileImport.workbook.SheetNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {fileImport.draft && fileImport.error && <p className="text-sm text-[var(--color-danger)]">{fileImport.error}</p>}

          {fileImport.draft && (
            <AiReviewEditor
              template={fileImport.draft.template}
              rows={fileImport.draft.rows}
              summary={fileImport.summary}
              {...reviewEditorHandlers(fileImport.setDraft)}
              onConfirm={() => {
                if (!fileImport.draft || fileImport.cleaning) return
                updateData(report.id, fileImport.draft.template, fileImport.draft.rows)
                exitToView()
              }}
              onDiscard={exitToView}
              confirmLabel={fileImport.cleaning ? "Nettoyage en cours…" : "Enregistrer la mise à jour"}
              discardLabel="Annuler"
              confirmDisabled={fileImport.cleaning}
            />
          )}

          {!fileImport.draft && (
            <div className="flex justify-end">
              <button
                onClick={exitToView}
                className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)]"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      )}

      {mode === "view" && (
        <div className="space-y-4">
          <DashboardHeader report={report} template={template} onExport={() => window.print()} />

          <ClientReadyAgents template={template} rows={report.rows} />

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
      )}
    </div>
  )
}
