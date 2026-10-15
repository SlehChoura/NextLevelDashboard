import { Link } from "react-router-dom"
import { Badge } from "../components/common/Badge"
import { RefreshDataPanel } from "../components/common/RefreshDataPanel"
import { RagSummary } from "../components/dashboard/RagSummary"
import { ClearBrowserDataButton } from "../components/common/ClearBrowserDataButton"
import { useReportStore } from "../store/reportStore"
import { usePilotageStore } from "../store/pilotageStore"
import { useActionsStore } from "../store/actionsStore"
import { HeroKpi } from "../components/common/HeroKpi"
import { ChangesSinceUpdate } from "../components/common/ChangesSinceUpdate"
import { useHistoryStore } from "../store/historyStore"
import { dashboardMetrics } from "../lib/dashboardMetrics"
import { latestDiff, shortDate } from "../lib/history"
import { ACTION_STATUS_LABELS, isLate, openActionsByDueDate, todayIso, type ActionStatus } from "../lib/actions"
import { computeStatus, PILOTAGE_OBJECTIVES, progressPercent, visibleStatus } from "../lib/pilotage"

const ACTION_STATUS_TEXT_CLASS: Record<ActionStatus, string> = {
  todo: "text-[var(--color-text-muted)]",
  in_progress: "text-[var(--color-info)]",
  done: "text-[var(--color-success)]",
}

const OPEN_ACTIONS_SHOWN = 6

export function HomePage() {
  const report = useReportStore((s) => s.report)
  const values = usePilotageStore((s) => s.values)
  const targets = usePilotageStore((s) => s.targets)
  const actions = useActionsStore((s) => s.actions)
  const snapshots = useHistoryStore((s) => s.snapshots)
  const diff = latestDiff(snapshots)

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
  const metrics = dashboardMetrics(report)
  const missionsWithAgents = computed.find((c) => c.objective.id === "missions_avec_agents")

  // Évolution depuis la mise à jour précédente, affichée sur chaque tuile.
  const since = diff ? shortDate(diff.from) : ""
  const dashboardDelta = (label: string) => {
    const c = diff?.dashboard.find((d) => d.label === label)
    return c ? { value: c.to - c.from, since } : undefined
  }
  const industrialisedChange = diff?.progress.find((c) => c.objective.id === "agents_industrialises")

  const today = todayIso()
  const openActions = openActionsByDueDate(actions)
  const lateCount = openActions.filter((a) => isLate(a, today)).length

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
              value={String(metrics.agents)}
              sub="agents suivis dans le dashboard"
              delta={dashboardDelta("Agents IA4CYB suivis")}
              to="/dashboard"
            />
            {industrialised && (
              <HeroKpi
                label="Agents industrialisés"
                value={String(industrialised.current)}
                sub={`cible : ${industrialised.target} agents`}
                progress={{ current: industrialised.current, target: industrialised.target }}
                delta={industrialisedChange ? { value: industrialisedChange.to - industrialisedChange.from, since } : undefined}
                to="/pilotage?categorie=agents"
              />
            )}
            <HeroKpi
              label="Missions réalisées"
              value={String(metrics.missions)}
              sub={
                "somme des missions par agent" +
                (missionsWithAgents ? ` · à distinguer des ${missionsWithAgents.current}/${missionsWithAgents.target} missions utilisant des agents (pilotage)` : "")
              }
              delta={dashboardDelta("Missions réalisées (somme par agent)")}
              to="/dashboard?section=missions"
            />
            <HeroKpi
              label="Prêts pour un client"
              value={String(metrics.ready)}
              sub={`présentables ou déployables, sur ${metrics.agents} agents`}
              delta={dashboardDelta("Agents prêts pour un client")}
              to="/dashboard?section=prets"
            />
          </div>
          {statusCriterion && <RagSummary criterion={statusCriterion} rows={report.rows} />}
          <ChangesSinceUpdate diff={diff} />
          <div className="flex flex-wrap justify-end gap-4">
            <Link to="/synthese" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
              Synthèse pour le comité (PDF) →
            </Link>
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
            ({openActions.length} ouvertes
            {lateCount > 0 && (
              <>
                , dont{" "}
                <Link to="/actions?filtre=retard" className="font-medium text-[var(--color-danger)] hover:underline">
                  {lateCount} en retard
                </Link>
              </>
            )}
            )
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
                const late = isLate(action, today)
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
        serveur applicatif. Sur un poste partagé, effacez-les après usage.
        <div className="mt-3">
          <ClearBrowserDataButton />
        </div>
      </div>
    </div>
  )
}
