import { useState } from "react"
import { Link } from "react-router-dom"
import { FileDrop } from "../components/common/FileDrop"
import { KpiCard } from "../components/common/KpiCard"
import { RagSummary } from "../components/dashboard/RagSummary"
import { useReportStore } from "../store/reportStore"
import { usePilotageStore } from "../store/pilotageStore"
import { useActionsStore } from "../store/actionsStore"
import { useCombinedImport } from "../hooks/useCombinedImport"
import { isClientReadyStatus } from "../lib/fixedFormatImport"
import { findCriterionByKeyword } from "../lib/criteria"
import { ACTION_STATUS_LABELS, type ActionStatus } from "../lib/actions"
import { downloadCombinedTemplate } from "../lib/combinedImport"
import { computeStatus, PILOTAGE_OBJECTIVES, progressPercent, visibleStatus } from "../lib/pilotage"

const ACTION_STATUS_TEXT_CLASS: Record<ActionStatus, string> = {
  todo: "text-[var(--color-text-muted)]",
  in_progress: "text-[var(--color-info)]",
  done: "text-[var(--color-success)]",
}

export function HomePage() {
  const report = useReportStore((s) => s.activeReport())
  const values = usePilotageStore((s) => s.values)
  const targets = usePilotageStore((s) => s.targets)
  const actions = useActionsStore((s) => s.actions)

  const { importMessage, handleImportFile } = useCombinedImport()
  const [importOpen, setImportOpen] = useState(false)

  async function onImportFile(file: File) {
    const ok = await handleImportFile(file)
    if (ok) setImportOpen(false)
  }

  const computed = PILOTAGE_OBJECTIVES.map((objective) => {
    const current = values[objective.id] ?? objective.defaultCurrent
    const target = targets[objective.id] ?? objective.target
    return {
      objective,
      current,
      target,
      status: visibleStatus(computeStatus(objective, current, target)),
      percent: progressPercent(objective, current, target),
    }
  })
  const unlockedCount = computed.filter((c) => c.status === "unlocked").length
  const accelerateCount = computed.filter((c) => c.status === "accelerate").length
  const averageProgress = Math.round(
    computed.reduce((sum, c) => sum + Math.min(100, c.percent), 0) / computed.length,
  )
  const nextSuccess = computed.filter((c) => c.status === "accelerate").sort((a, b) => b.percent - a.percent)[0]

  const template = report?.template
  const statusCriterion = template?.criteria.find((c) => c.key === template.statusKey)
  const readyCount =
    report && statusCriterion
      ? report.rows.filter((row) => isClientReadyStatus(String(row[statusCriterion.key] ?? ""))).length
      : 0
  const missionsCriterion = template ? findCriterionByKeyword(template, "mission") : undefined
  const totalMissions =
    report && missionsCriterion
      ? report.rows.reduce((sum, row) => {
          const n = Number(row[missionsCriterion.key])
          return Number.isFinite(n) ? sum + n : sum
        }, 0)
      : 0

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
        Pilotage IA4CYB
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-[var(--color-text)]">Gouvernance des agents IA4CYB</h1>
      <p className="mt-3 max-w-2xl text-[var(--color-text-muted)]">
        Suivi des agents IA4CYB, des KPI et objectifs de pilotage, et des actions associées.
      </p>

      <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text)]">
              Import global — Pilotage, Actions et Dashboard
            </h2>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Toutes les données de cette page proviennent d'un seul fichier Excel à 3 onglets
              (« Suivi pilotage », « Actions », « Agents IA4CYB »). Réimportez-le à tout moment pour
              tout mettre à jour en un coup.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => downloadCombinedTemplate(values, targets, actions)}
              className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium whitespace-nowrap text-[var(--color-text)]"
            >
              Télécharger le modèle complet
            </button>
            <button
              onClick={() => setImportOpen((v) => !v)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              Importer le fichier complet
            </button>
          </div>
        </div>

        {importOpen && (
          <div className="mt-3 space-y-2 border-t border-[var(--color-border)] pt-3">
            <FileDrop onFile={onImportFile} accept=".xlsx,.xls,.csv" hint="Formats acceptés : .xlsx, .xls, .csv" />
          </div>
        )}

        {importMessage && <p className="mt-3 text-sm text-[var(--color-text)]">{importMessage}</p>}
      </div>

      <div className="mt-10 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Dashboard — Agents IA4CYB</h2>
        <Link to="/dashboard" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
          Voir le dashboard complet →
        </Link>
      </div>

      {report ? (
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard label="Agents IA4CYB suivis" value={String(report.rows.length)} />
            <KpiCard label="Prêts pour un contexte client" value={String(readyCount)} />
            <KpiCard label="Missions réalisées" value={String(totalMissions)} sub="tous agents confondus" />
          </div>
          {statusCriterion && <RagSummary criterion={statusCriterion} rows={report.rows} />}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-muted)]">
          Aucun dashboard pour le moment. Importez le fichier complet ci-dessus pour le générer.
        </div>
      )}

      <div className="mt-10 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Vos succès à atteindre</h2>
        <Link to="/pilotage" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
          Voir tous les objectifs →
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            Succès débloqués
          </p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-success)]">{unlockedCount}</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">objectifs atteints</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            À accélérer
          </p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-warning)]">{accelerateCount}</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">objectifs restants</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            Avancement global
          </p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-accent)]">{averageProgress}%</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">progression moyenne</p>
        </div>
      </div>

      {nextSuccess && (
        <div className="mt-4 flex flex-col gap-4 rounded-xl border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/5 p-5 sm:flex-row sm:items-center">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl text-white"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            🏆
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-accent)]">
              Prochain succès à débloquer
            </p>
            <h3 className="text-base font-semibold text-[var(--color-text)]">{nextSuccess.objective.label}</h3>
          </div>
          <strong className="text-2xl font-bold text-[var(--color-accent)]">{nextSuccess.percent}%</strong>
        </div>
      )}

      <div className="mt-10 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Actions en cours</h2>
        <Link to="/actions" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
          Voir toutes les actions →
        </Link>
      </div>

      {actions.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-muted)]">
          Aucune action pour le moment.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[var(--color-text-muted)]">
                <th className="border-b border-[var(--color-border)] px-3 py-2 text-xs font-medium uppercase">Action</th>
                <th className="border-b border-[var(--color-border)] px-3 py-2 text-xs font-medium uppercase">Porteur</th>
                <th className="border-b border-[var(--color-border)] px-3 py-2 text-xs font-medium uppercase">Échéance</th>
                <th className="border-b border-[var(--color-border)] px-3 py-2 text-xs font-medium uppercase">Statut</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action) => (
                <tr key={action.id} className="even:bg-[var(--color-bg)]">
                  <td className="border-b border-[var(--color-border)] px-3 py-2 align-top text-[var(--color-text)]">
                    {action.title}
                  </td>
                  <td className="border-b border-[var(--color-border)] px-3 py-2 align-top text-[var(--color-text)]">
                    {action.owner}
                  </td>
                  <td className="border-b border-[var(--color-border)] px-3 py-2 align-top text-[var(--color-text-muted)]">
                    {action.dueDate ? new Date(action.dueDate + "T00:00:00").toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className={`border-b border-[var(--color-border)] px-3 py-2 align-top font-medium ${ACTION_STATUS_TEXT_CLASS[action.status]}`}>
                    {ACTION_STATUS_LABELS[action.status]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-text-muted)]">
        <span className="font-medium text-[var(--color-text)]">Confidentialité — </span>
        les données importées restent dans votre navigateur (localStorage), rien n'est envoyé à un
        serveur applicatif. Pensez à vider le stockage local sur un poste partagé.
      </div>
    </div>
  )
}
