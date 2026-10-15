import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useReportStore } from "../store/reportStore"
import { DashboardHeader } from "../components/dashboard/DashboardHeader"
import { RagSummary } from "../components/dashboard/RagSummary"
import { ClientReadyAgents } from "../components/dashboard/ClientReadyAgents"
import { MissionsPodium } from "../components/dashboard/MissionsPodium"
import { CategoryFocus } from "../components/dashboard/CategoryFocus"
import { KpiCard } from "../components/common/KpiCard"
import { DistributionBarChart } from "../components/charts/DistributionBarChart"
import { DistributionPieChart } from "../components/charts/DistributionPieChart"
import { DataTable } from "../components/dashboard/DataTable"
import { AiReviewEditor } from "../components/ai/AiReviewEditor"
import { RefreshDataPanel } from "../components/common/RefreshDataPanel"
import { averageOfNumeric, findCriterionByKeyword } from "../lib/criteria"
import { hasPropaleType } from "../lib/fixedFormatImport"
import { reviewEditorHandlers, type ImportDraft } from "../lib/aiTemplateEdit"

type Mode = "view" | "edit"

export function DashboardPage() {
  const report = useReportStore((s) => s.report)
  const updateData = useReportStore((s) => s.updateData)
  const [mode, setMode] = useState<Mode>("view")
  const [editDraft, setEditDraft] = useState<ImportDraft | null>(null)
  const [focus, setFocus] = useState<{ criterionKey: string; criterionLabel: string; value: string; label: string } | null>(null)
  const [showTable, setShowTable] = useState(true)
  const [refreshOpen, setRefreshOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const section = searchParams.get("section")

  // Arrivée depuis une tuile de l'accueil (?section=missions|prets) : la section visée est amenée à l'écran.
  useEffect(() => {
    if (section) document.getElementById(`section-${section}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [section])

  const template = report.template
  const statusCriterion = template.criteria.find((c) => c.key === template.statusKey)
  const metricCriteria = template.criteria.filter((c) => c.role === "metric")
  const labelCriterion = template.criteria.find((c) => c.role === "label")
  const propaleCriterion = findCriterionByKeyword(template, "propale")

  function exitToView() {
    setMode("view")
    setEditDraft(null)
    setFocus(null)
  }

  return (
    <div className={`mx-auto max-w-5xl px-6 py-8 ${mode === "view" ? "print-page" : ""}`}>
      {mode === "view" && (
        <div className="no-print mb-4 flex flex-wrap items-center justify-end gap-3">
          <Link to="/synthese" className="text-sm text-[var(--color-text-muted)] hover:underline">
            Synthèse comité (PDF)
          </Link>
          <button onClick={() => setRefreshOpen((v) => !v)} className="text-sm text-[var(--color-text-muted)] hover:underline">
            {refreshOpen ? "Fermer la mise à jour" : "Mettre à jour les données"}
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

      {mode === "view" && refreshOpen && <RefreshDataPanel className="mb-5 ml-auto max-w-sm" />}

      {mode === "edit" && editDraft && (
        <AiReviewEditor
          template={editDraft.template}
          rows={editDraft.rows}
          confirmLabel="Enregistrer les modifications"
          discardLabel="Annuler"
          {...reviewEditorHandlers(setEditDraft)}
          onConfirm={() => {
            updateData(editDraft.template, editDraft.rows)
            exitToView()
          }}
          onDiscard={exitToView}
        />
      )}

      {mode === "view" && (
        <div className="space-y-5">
          <DashboardHeader report={report} template={template} onExport={() => window.print()} />

          <div id="section-prets" className="scroll-mt-20">
            <ClientReadyAgents template={template} rows={report.rows} />
          </div>

          <div id="section-missions" className="scroll-mt-20">
            <MissionsPodium template={template} rows={report.rows} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard label="Agents IA4CYB suivis" value={String(report.rows.length)} />
            {propaleCriterion && (
              <KpiCard
                label={`Agents avec ${propaleCriterion.label.toLowerCase()}`}
                value={`${report.rows.filter((row) => hasPropaleType(String(row[propaleCriterion.key] ?? ""))).length} / ${report.rows.length}`}
              />
            )}
            {metricCriteria.map((c) => {
              // Un compteur (ex: nombre de missions) se lit en total, un pourcentage en moyenne.
              if (c.type === "number") {
                const total = report.rows.reduce((sum, row) => {
                  const n = Number(row[c.key])
                  return Number.isFinite(n) ? sum + n : sum
                }, 0)
                return <KpiCard key={c.key} label={`${c.label} (total)`} value={String(total)} />
              }
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
                  const isFocusedChart = focus?.criterionKey === criterion.key
                  const handleSelect = (entry: { key: string; label: string }) =>
                    setFocus(
                      isFocusedChart && focus?.value === entry.key
                        ? null
                        : { criterionKey: criterion.key, criterionLabel: criterion.label, value: entry.key, label: entry.label },
                    )
                  if (chart.kind === "pie") {
                    return (
                      <DistributionPieChart
                        key={chart.id}
                        title={chart.title}
                        criterion={criterion}
                        rows={report.rows}
                        onSelect={handleSelect}
                        selectedKey={isFocusedChart ? focus?.value : undefined}
                      />
                    )
                  }
                  return (
                    <DistributionBarChart
                      key={chart.id}
                      title={chart.title}
                      criterion={criterion}
                      rows={report.rows}
                      onSelect={handleSelect}
                      selectedKey={isFocusedChart ? focus?.value : undefined}
                    />
                  )
                })}
              </div>

              {focus && labelCriterion && (
                <CategoryFocus
                  title={`${focus.criterionLabel} — ${focus.label}`}
                  labelCriterion={labelCriterion}
                  rows={report.rows.filter(
                    (row) => String(row[focus.criterionKey] ?? "").trim().toLowerCase() === focus.value,
                  )}
                  onClose={() => setFocus(null)}
                />
              )}

              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Détail par agent
                </div>
                <button
                  onClick={() => setShowTable((v) => !v)}
                  className="no-print text-xs font-medium text-[var(--color-accent)] underline"
                >
                  {showTable ? "Masquer le tableau" : "Afficher le tableau"}
                </button>
              </div>

              {showTable && <DataTable template={template} rows={report.rows} />}
            </>
          )}
        </div>
      )}
    </div>
  )
}
