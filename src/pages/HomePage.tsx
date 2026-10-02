import { Link } from "react-router-dom"
import { Badge } from "../components/common/Badge"
import { RefreshDataPanel } from "../components/common/RefreshDataPanel"
import { RagSummary } from "../components/dashboard/RagSummary"
import { useReportStore } from "../store/reportStore"
import { usePilotageStore } from "../store/pilotageStore"
import { useActionsStore } from "../store/actionsStore"
import { isClientReadyStatus } from "../lib/fixedFormatImport"
import { findCriterionByKeyword } from "../lib/criteria"
import { ACTION_STATUS_LABELS, type ActionStatus } from "../lib/actions"
import { computeStatus, PILOTAGE_OBJECTIVES, progressPercent, visibleStatus } from "../lib/pilotage"

const ACTION_STATUS_TEXT_CLASS: Record<ActionStatus, string> = {
  todo: "text-[var(--color-text-muted)]",
  in_progress: "text-[var(--color-info)]",
  done: "text-[var(--color-success)]",
}

/** Tuile KPI mise en avant en tête de page, avec une barre de progression vers la cible si fournie. */
function HeroKpi({
  label,
  value,
  sub,
  progress,
}: {
  label: string
  value: string
  sub: string
  progress?: { current: number; target: number }
}) {
  const percent = progress && progress.target > 0 ? Math.min(100, (progress.current / progress.target) * 100) : null
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] xl:min-h-[2rem]">{label}</p>
      <p className="mt-2 text-5xl font-semibold tracking-tight text-[var(--color-text)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{sub}</p>
      {percent !== null && (
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-border)]"
          role="progressbar"
          aria-valuenow={Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} : ${Math.round(percent)} % de la cible`}
        >
          <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${percent}%` }} />
        </div>
      )}
    </div>
  )
}

const OPEN_ACTIONS_SHOWN = 6

export function HomePage() {
  const report = useReportStore((s) => s.report)
  const values = usePilotageStore((s) => s.values)
  const targets = usePilotageStore((s) => s.targets)
  const actions = useActionsStore((s) => s.actions)

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
  const industrialised = computed.find((c) => c.objective.id === "agents_industrialises")

  const template = report.template
  const statusCriterion = template.criteria.find((c) => c.key === template.statusKey)
  const readyCount = statusCriterion
    ? report.rows.filter((row) => isClientReadyStatus(String(row[statusCriterion.key] ?? ""))).length
    : 0
  const missionsCriterion = findCriterionByKeyword(template, "mission")
  const totalMissions = missionsCriterion
    ? report.rows.reduce((sum, row) => {
        const n = Number(row[missionsCriterion.key])
        return Number.isFinite(n) ? sum + n : sum
      }, 0)
    : 0

  const today = new Date().toISOString().slice(0, 10)
  const openActions = actions
    .filter((a) => a.status !== "done")
    .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"))
  const lateCount = openActions.filter((a) => a.dueDate && a.dueDate < today).length

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
        Pilotage IA4CYB
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-[var(--color-text)]">Gouvernance des agents IA4CYB</h1>
      <p className="mt-3 max-w-2xl text-[var(--color-text-muted)]">
        Où en sont nos agents aujourd'hui : catalogue, industrialisation et usage en mission.
      </p>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <HeroKpi
              label="Agents IA4CYB"
              value={String(report.rows.length)}
              sub="agents suivis dans le dashboard"
            />
            {industrialised && (
              <HeroKpi
                label="Agents industrialisés"
                value={String(industrialised.current)}
                sub={`cible : ${industrialised.target} agents`}
                progress={{ current: industrialised.current, target: industrialised.target }}
              />
            )}
            <HeroKpi label="Missions réalisées" value={String(totalMissions)} sub="avec les agents, tous agents confondus" />
            <HeroKpi
              label="Prêts pour un client"
              value={String(readyCount)}
              sub={`présentables ou déployables, sur ${report.rows.length} agents`}
            />
          </div>
          {statusCriterion && <RagSummary criterion={statusCriterion} rows={report.rows} />}
          <div className="text-right">
            <Link to="/dashboard" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
              Voir le dashboard complet des agents →
            </Link>
          </div>
        </div>

        <RefreshDataPanel className="lg:sticky lg:top-20" />
      </div>

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
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          Actions à suivre{" "}
          <span className="text-sm font-normal text-[var(--color-text-muted)]">
            ({openActions.length} ouvertes{lateCount > 0 ? `, dont ${lateCount} en retard` : ""})
          </span>
        </h2>
        <Link to="/actions" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
          Voir toutes les actions →
        </Link>
      </div>

      {openActions.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-muted)]">
          Aucune action ouverte.
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
              {openActions.slice(0, OPEN_ACTIONS_SHOWN).map((action) => {
                const late = action.dueDate !== "" && action.dueDate < today
                return (
                  <tr key={action.id} className="even:bg-[var(--color-bg)]">
                    <td className="border-b border-[var(--color-border)] px-3 py-2 align-top text-[var(--color-text)]">
                      {action.title}
                    </td>
                    <td className="border-b border-[var(--color-border)] px-3 py-2 align-top text-[var(--color-text)]">
                      {action.owner}
                    </td>
                    <td className="border-b border-[var(--color-border)] px-3 py-2 align-top whitespace-nowrap text-[var(--color-text-muted)]">
                      {action.dueDate ? new Date(action.dueDate + "T00:00:00").toLocaleDateString("fr-FR") : "—"}
                      {late && (
                        <span className="ml-2">
                          <Badge label="En retard" color="danger" />
                        </span>
                      )}
                    </td>
                    <td className={`border-b border-[var(--color-border)] px-3 py-2 align-top font-medium ${ACTION_STATUS_TEXT_CLASS[action.status]}`}>
                      {ACTION_STATUS_LABELS[action.status]}
                    </td>
                  </tr>
                )
              })}
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
