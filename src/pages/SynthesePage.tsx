import { Link } from "react-router-dom"
import { Logo } from "../components/common/Logo"
import { Badge } from "../components/common/Badge"
import { HeroKpi } from "../components/common/HeroKpi"
import { ChangesSinceUpdate } from "../components/common/ChangesSinceUpdate"
import { DataTable } from "../components/dashboard/DataTable"
import { useReportStore } from "../store/reportStore"
import { usePilotageStore } from "../store/pilotageStore"
import { useActionsStore } from "../store/actionsStore"
import { useHistoryStore } from "../store/historyStore"
import { dashboardMetrics } from "../lib/dashboardMetrics"
import { latestDiff, shortDate } from "../lib/history"
import { isClientReadyStatus } from "../lib/fixedFormatImport"
import { isLate, openActionsByDueDate, todayIso } from "../lib/actions"
import {
  CATEGORY_LABELS,
  computeStatus,
  PILOTAGE_OBJECTIVES,
  progressPercent,
  visibleStatus,
  VISIBLE_STATUS_LABELS,
} from "../lib/pilotage"

const ACTIONS_SHOWN = 5

const th = "border-b border-[var(--color-border)] px-2.5 py-1.5 text-left text-[11px] font-medium uppercase text-[var(--color-text-muted)]"
const td = "border-b border-[var(--color-border)] px-2.5 py-1.5 align-top text-[var(--color-text)] print:py-1"

/**
 * Synthèse d'une page pour un comité : chiffres clés, évolutions, objectifs, actions à arbitrer et
 * agents prêts pour un client ; le détail par agent suit en annexe, sur une nouvelle page à
 * l'impression (« Imprimer / PDF »).
 */
export function SynthesePage() {
  const report = useReportStore((s) => s.report)
  const values = usePilotageStore((s) => s.values)
  const targets = usePilotageStore((s) => s.targets)
  const actions = useActionsStore((s) => s.actions)
  const snapshots = useHistoryStore((s) => s.snapshots)

  const diff = latestDiff(snapshots)
  const dataDate = snapshots.at(-1)?.date
  const metrics = dashboardMetrics(report)
  const since = diff ? shortDate(diff.from) : ""
  const dashboardDelta = (label: string) => {
    const c = diff?.dashboard.find((d) => d.label === label)
    return c ? { value: c.to - c.from, since } : undefined
  }

  const objectives = PILOTAGE_OBJECTIVES.map((objective) => {
    const current = values[objective.id] ?? objective.defaultCurrent
    const target = targets[objective.id] ?? objective.target
    return {
      objective,
      current,
      target,
      status: visibleStatus(computeStatus(objective, current, target)),
      percent: progressPercent(objective, current, target),
      revised: diff?.targetRevisions.some((r) => r.objective.id === objective.id && r.to === target) ?? false,
    }
  })
  const industrialised = objectives.find((o) => o.objective.id === "agents_industrialises")
  const industrialisedChange = diff?.progress.find((c) => c.objective.id === "agents_industrialises")
  const unlocked = objectives.filter((o) => o.status === "unlocked").length

  const today = todayIso()
  const openActions = openActionsByDueDate(actions)
  const late = openActions.filter((a) => isLate(a, today))

  const statusCriterion = report.template.criteria.find((c) => c.key === report.template.statusKey)
  const readyAgents = statusCriterion
    ? report.rows.filter((row) => isClientReadyStatus(String(row[statusCriterion.key] ?? "")))
    : []

  return (
    <div className="print-page print-zoom mx-auto max-w-5xl px-6 py-8">
      <div className="no-print mb-4 flex items-center justify-between gap-3">
        <Link to="/" className="text-sm text-[var(--color-text-muted)] hover:underline">
          ← Accueil
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          Imprimer / PDF
        </button>
      </div>

      <header className="flex items-center gap-4 border-b-4 border-[var(--color-accent)] pb-4">
        <Logo size={44} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">Comité IA4CYB</p>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">Synthèse des agents IA4CYB</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Données au {dataDate ? new Date(dataDate + "T00:00:00").toLocaleDateString("fr-FR") : "—"} ·{" "}
            {unlocked} objectif(s) atteint(s) sur {objectives.length} · {late.length} action(s) en retard
          </p>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4 print:mt-3 print:grid-cols-4">
        <HeroKpi label="Agents IA4CYB" value={String(metrics.agents)} sub="suivis" delta={dashboardDelta("Agents IA4CYB suivis")} />
        {industrialised && (
          <HeroKpi
            label="Industrialisés"
            value={String(industrialised.current)}
            sub={`cible : ${industrialised.target}`}
            progress={{ current: industrialised.current, target: industrialised.target }}
            delta={industrialisedChange ? { value: industrialisedChange.to - industrialisedChange.from, since } : undefined}
          />
        )}
        <HeroKpi
          label="Missions réalisées"
          value={String(metrics.missions)}
          sub="somme par agent"
          delta={dashboardDelta("Missions réalisées (somme par agent)")}
        />
        <HeroKpi
          label="Prêts pour un client"
          value={String(metrics.ready)}
          sub={`sur ${metrics.agents} agents`}
          delta={dashboardDelta("Agents prêts pour un client")}
        />
      </div>

      <div className="mt-4">
        <ChangesSinceUpdate diff={diff} />
      </div>

      <section className="print-break-avoid mt-4 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <h2 className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Objectifs du pilotage
        </h2>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr>
              <th className={th}>Catégorie</th>
              <th className={th}>Objectif</th>
              <th className={th}>Actuel / cible</th>
              <th className={th}>Avancement</th>
              <th className={th}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {objectives.map((o) => (
              <tr key={o.objective.id}>
                <td className={`${td} whitespace-nowrap text-xs text-[var(--color-text-muted)]`}>
                  {CATEGORY_LABELS[o.objective.category]}
                </td>
                <td className={td}>{o.objective.label}</td>
                <td className={`${td} whitespace-nowrap`}>
                  {o.current} / {o.target} {o.objective.unit}
                  {o.revised && <span className="ml-1 text-[11px] text-[var(--color-warning)]">⚠ cible révisée</span>}
                </td>
                <td className={`${td} whitespace-nowrap`}>{o.percent}%</td>
                <td className={`${td} whitespace-nowrap`}>
                  <Badge label={VISIBLE_STATUS_LABELS[o.status]} color={o.status === "unlocked" ? "success" : "warning"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] print:grid-cols-[3fr_2fr]">
        <section className="print-break-avoid overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <h2 className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Actions à arbitrer ({late.length} en retard)
          </h2>
          <table className="mt-2 w-full text-sm">
            <tbody>
              {openActions.slice(0, ACTIONS_SHOWN).map((a) => (
                <tr key={a.id}>
                  <td className={td}>
                    {a.title} <span className="text-xs text-[var(--color-text-muted)]">— {a.owner}</span>
                  </td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    {a.dueDate ? new Date(a.dueDate + "T00:00:00").toLocaleDateString("fr-FR") : "—"}
                    {isLate(a, today) && (
                      <span className="ml-1.5 inline-block">
                        <Badge label="En retard" color="danger" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {openActions.length > ACTIONS_SHOWN && (
            <p className="px-4 py-2 text-xs text-[var(--color-text-muted)]">
              + {openActions.length - ACTIONS_SHOWN} autre(s) action(s) ouverte(s)
            </p>
          )}
        </section>

        <section className="print-break-avoid rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Agents prêts pour un client ({readyAgents.length})
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-[var(--color-text)] print:text-xs">
            {readyAgents.map((row) => (
              <li key={row.__id}>✓ {String(row.label ?? "")}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--color-text-muted)]">
            {metrics.propale} agent(s) sur {metrics.agents} disposent d'une propale type.
          </p>
        </section>
      </div>

      <section className="print-break-before mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Annexe — détail par agent
        </h2>
        <DataTable template={report.template} rows={report.rows} />
      </section>
    </div>
  )
}
