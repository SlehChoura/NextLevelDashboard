import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Bot, Briefcase, CalendarClock, Factory, FileText, ListChecks, Rocket, Target, Trophy } from "lucide-react"
import { Badge } from "../components/common/Badge"
import { RagSummary } from "../components/dashboard/RagSummary"
import { IndustrialisedAgentsDialog } from "../components/common/IndustrialisedAgentsDialog"
import { HeroKpi } from "../components/common/HeroKpi"
import { ChangesSinceUpdate } from "../components/common/ChangesSinceUpdate"
import { Card, CardTitle } from "../components/ui/Card"
import { LineConcept } from "../components/ui/LineConcept"
import { ProgressRing } from "../components/ui/ProgressRing"
import { OwnerAvatar } from "../components/ui/OwnerAvatar"
import { formatDataDate, useLastDataUpdate } from "../hooks/useLastDataUpdate"
import { useReportStore } from "../store/reportStore"
import { usePilotageStore } from "../store/pilotageStore"
import { useActionsStore } from "../store/actionsStore"
import { useHistoryStore } from "../store/historyStore"
import { dashboardMetrics, industrialisedAgents } from "../lib/dashboardMetrics"
import { latestDiff, shortDate, type Snapshot } from "../lib/history"
import { ACTION_STATUS_LABELS, isLate, openActionsByDueDate, todayIso, type ActionStatus } from "../lib/actions"
import {
  CATEGORY_LABELS,
  computeStatus,
  PILOTAGE_OBJECTIVES,
  progressPercent,
  visibleStatus,
  type PilotageCategory,
} from "../lib/pilotage"

const ACTION_STATUS_COLOR: Record<ActionStatus, "neutral" | "info" | "success"> = {
  todo: "neutral",
  in_progress: "info",
  done: "success",
}

const OPEN_ACTIONS_SHOWN = 5
const CATEGORY_ORDER: PilotageCategory[] = ["competences", "agents", "plateforme", "notoriete"]

/** Série d'un chiffre au fil des photos de l'historique (mini-courbes des tuiles). */
function trendOf(snapshots: Snapshot[], pick: (s: Snapshot) => number | undefined) {
  return snapshots.flatMap((s) => {
    const value = pick(s)
    return value === undefined ? [] : [{ date: s.date, value }]
  })
}

export function HomePage() {
  const report = useReportStore((s) => s.report)
  const values = usePilotageStore((s) => s.values)
  const targets = usePilotageStore((s) => s.targets)
  const actions = useActionsStore((s) => s.actions)
  const snapshots = useHistoryStore((s) => s.snapshots)
  const diff = latestDiff(snapshots)
  const lastUpdate = useLastDataUpdate()
  const [industrialisedOpen, setIndustrialisedOpen] = useState(false)

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
  const averageProgress = Math.round(computed.reduce((sum, c) => sum + Math.min(100, c.percent), 0) / computed.length)
  const nextSuccess = computed.filter((c) => c.status === "accelerate").sort((a, b) => b.percent - a.percent)[0]
  const industrialised = computed.find((c) => c.objective.id === "agents_industrialises")
  const missionsWithAgents = computed.find((c) => c.objective.id === "missions_avec_agents")

  const template = report.template
  const statusCriterion = template.criteria.find((c) => c.key === template.statusKey)
  const metrics = dashboardMetrics(report)
  const industrialisedCount = industrialisedAgents(report).length

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
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <IndustrialisedAgentsDialog open={industrialisedOpen} onClose={() => setIndustrialisedOpen(false)} />

      {/* Bandeau : dégradé bleu signature et line concept. */}
      <section
        className="relative overflow-hidden rounded-[var(--radius-card)] px-6 py-8 text-white shadow-[var(--shadow-raised)] sm:px-10 sm:py-10"
        style={{ background: "var(--gradient-brand)" }}
      >
        <LineConcept
          className="absolute inset-0 h-full w-full opacity-60"
          style={{ maskImage: "linear-gradient(to right, transparent 0%, transparent 60%, black 90%)" }}
        />
        <div className="relative max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Gouvernance IA4CYB</p>
          <h1 className="mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-[40px]">
            Nos agents IA, de l'idée à l'<span className="text-[var(--color-energy)]">impact</span>
          </h1>
          <p className="mt-3 text-sm text-white/80 sm:text-base">
            {metrics.agents} agents suivis, dont {metrics.ready} prêts pour un contexte client et {industrialisedCount}{" "}
            industrialisés · {metrics.missions} missions réalisées · {unlockedCount} objectifs sur {computed.length} atteints.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/synthese"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-energy)] px-5 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition hover:brightness-95"
            >
              <FileText className="h-4 w-4" aria-hidden />
              Synthèse comité
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explorer les agents
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/donnees" className="text-xs text-white/65 underline-offset-4 hover:text-white hover:underline">
              Données au {formatDataDate(lastUpdate)}
            </Link>
          </div>
        </div>
      </section>

      {/* Chiffres clés */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
        <HeroKpi
          label="Agents IA4CYB"
          value={String(metrics.agents)}
          sub="agents suivis dans le portefeuille"
          icon={<Bot className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          trend={trendOf(snapshots, (s) => s.dashboard.agents)}
          delta={dashboardDelta("Agents IA4CYB suivis")}
          to="/dashboard"
        />
        {industrialised && (
          <HeroKpi
            label="Agents industrialisés"
            value={String(industrialised.current)}
            sub={`cible : ${industrialised.target} agents`}
            icon={<Factory className="h-[18px] w-[18px]" strokeWidth={1.75} />}
            trend={trendOf(snapshots, (s) => s.values.agents_industrialises)}
            progress={{ current: industrialised.current, target: industrialised.target }}
            delta={industrialisedChange ? { value: industrialisedChange.to - industrialisedChange.from, since } : undefined}
            onClick={() => setIndustrialisedOpen(true)}
            actionLabel="Voir la liste des agents"
          />
        )}
        <HeroKpi
          label="Missions réalisées"
          value={String(metrics.missions)}
          sub={
            missionsWithAgents
              ? `somme par agent · cible pilotage : ${missionsWithAgents.target} missions`
              : "somme des missions par agent"
          }
          icon={<Briefcase className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          trend={trendOf(snapshots, (s) => s.dashboard.missions)}
          progress={missionsWithAgents ? { current: metrics.missions, target: missionsWithAgents.target } : undefined}
          delta={dashboardDelta("Missions réalisées (somme par agent)")}
          to="/dashboard?section=missions"
        />
        <HeroKpi
          label="Prêts pour un client"
          value={String(metrics.ready)}
          sub={`présentables ou déployables, sur ${metrics.agents} agents`}
          icon={<Rocket className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          trend={trendOf(snapshots, (s) => s.dashboard.ready)}
          delta={dashboardDelta("Agents prêts pour un client")}
          to="/dashboard?section=prets"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
        {/* Portefeuille des agents */}
        <Card className="p-5 lg:col-span-2">
          <CardTitle
            icon={<Bot className="h-4 w-4" />}
            action={
              <Link to="/dashboard" className="text-xs font-semibold text-[var(--color-accent)] hover:underline">
                Détail par agent
              </Link>
            }
          >
            Portefeuille des agents
          </CardTitle>
          {statusCriterion && <RagSummary criterion={statusCriterion} rows={report.rows} bare />}
          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--color-border)] pt-4">
            {[
              { label: "Propale type", value: `${metrics.propale}/${metrics.agents}` },
              { label: "Industrialisés", value: `${industrialisedCount}/${metrics.agents}` },
              { label: "Prêts client", value: `${metrics.ready}/${metrics.agents}` },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-xs text-[var(--color-text-muted)]">{item.label}</dt>
                <dd className="mt-0.5 text-lg font-semibold text-[var(--color-primary)]">{item.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {/* Synthèse du pilotage */}
        <Card className="flex flex-col p-5">
          <CardTitle icon={<Target className="h-4 w-4" />}>Pilotage</CardTitle>
          <div className="mt-4 flex items-center gap-4">
            <ProgressRing percent={averageProgress} size={84} stroke={8} label="Avancement global" />
            <div>
              <p className="text-2xl font-semibold text-[var(--color-primary)]">
                {unlockedCount}
                <span className="text-base font-normal text-[var(--color-text-muted)]"> / {computed.length}</span>
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">objectifs atteints · {averageProgress} % d'avancement moyen</p>
            </div>
          </div>
          {nextSuccess && (
            <div className="mt-5 rounded-xl bg-[var(--color-accent-soft)] p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">
                <Trophy className="h-3.5 w-3.5" aria-hidden /> Prochain succès
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--color-text)]">{nextSuccess.objective.label}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${Math.min(100, nextSuccess.percent)}%` }} />
                </div>
                <span className="text-xs font-semibold text-[var(--color-accent)]">{nextSuccess.percent}%</span>
              </div>
            </div>
          )}
          <Link to="/pilotage" className="mt-auto flex items-center gap-1 pt-4 text-xs font-semibold text-[var(--color-accent)] hover:underline">
            Tous les objectifs <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <ChangesSinceUpdate diff={diff} />

        {/* Actions à suivre */}
        <Card className="p-5">
          <CardTitle
            icon={<ListChecks className="h-4 w-4" />}
            action={
              <Link to="/actions" className="text-xs font-semibold text-[var(--color-accent)] hover:underline">
                Toutes les actions
              </Link>
            }
          >
            Actions à suivre
          </CardTitle>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {openActions.length} ouvertes
            {lateCount > 0 && (
              <>
                {" "}·{" "}
                <Link to="/actions?filtre=retard" className="font-semibold text-[var(--color-danger)] hover:underline">
                  {lateCount} en retard
                </Link>
              </>
            )}
          </p>
          {openActions.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">Aucune action ouverte.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--color-border)]">
              {openActions.slice(0, OPEN_ACTIONS_SHOWN).map((action) => {
                const late = isLate(action, today)
                return (
                  <li key={action.id} className="flex items-center gap-3 py-2.5">
                    <OwnerAvatar name={action.owner} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--color-text)]" title={action.title}>
                        {action.title}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                        {action.owner}
                        {action.dueDate && (
                          <>
                            <span aria-hidden>·</span>
                            <CalendarClock className="h-3 w-3" aria-hidden />
                            <span className={late ? "font-semibold text-[var(--color-danger)]" : ""}>
                              {new Date(action.dueDate + "T00:00:00").toLocaleDateString("fr-FR")}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    {late ? (
                      <Badge label="En retard" color="danger" />
                    ) : (
                      <Badge label={ACTION_STATUS_LABELS[action.status]} color={ACTION_STATUS_COLOR[action.status]} />
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Objectifs du pilotage, par catégorie */}
      <Card className="p-5">
        <CardTitle
          icon={<Target className="h-4 w-4" />}
          action={
            <Link to="/pilotage" className="text-xs font-semibold text-[var(--color-accent)] hover:underline">
              Piloter les objectifs
            </Link>
          }
        >
          Objectifs du pilotage
        </CardTitle>
        <div className="mt-4 grid gap-x-8 gap-y-5 md:grid-cols-2 [&>*]:min-w-0">
          {CATEGORY_ORDER.map((category) => {
            const items = computed.filter((c) => c.objective.category === category)
            if (items.length === 0) return null
            return (
              <div key={category}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-accent)]">
                  {CATEGORY_LABELS[category]}
                </p>
                <ul className="mt-2 space-y-2.5">
                  {items.map((c) => (
                    <li key={c.objective.id}>
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate text-[var(--color-text)]" title={c.objective.label}>
                          {c.objective.label}
                        </span>
                        <span className="shrink-0 text-xs text-[var(--color-text-muted)]">
                          <strong className="text-[var(--color-text)]">{c.current}</strong> / {c.target}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--color-accent-soft)]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, c.percent)}%`,
                            backgroundColor: c.status === "unlocked" ? "var(--color-success)" : "var(--color-accent)",
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
