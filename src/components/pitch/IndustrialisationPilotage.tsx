import { useMemo, useState } from "react"
import { CheckCircle2, Factory, Gauge, ListChecks, RefreshCw } from "lucide-react"
import { useReportStore } from "../../store/reportStore"
import { usePilotageStore } from "../../store/pilotageStore"
import { useActionsStore } from "../../store/actionsStore"
import { useHistoryStore } from "../../store/historyStore"
import { averageOfNumeric, findCriterionByKeyword } from "../../lib/criteria"
import { dashboardMetrics } from "../../lib/dashboardMetrics"
import { PILOTAGE_OBJECTIVES } from "../../lib/pilotage"
import { INDUSTRIALISATION_CRITERIA, MATURITY_AXES } from "../../lib/pitch"
import { CountUp } from "../ui/CountUp"

const RADAR_SIZE = 300
const CENTER = RADAR_SIZE / 2
const RADIUS = 105

/** Coordonnées d'un point du radar : axe `i` sur `n`, à `ratio` (0-1) du centre. */
function point(i: number, n: number, ratio: number): [number, number] {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n
  return [CENTER + Math.cos(angle) * RADIUS * ratio, CENTER + Math.sin(angle) * RADIUS * ratio]
}

/** Jauge circulaire de l'objectif d'agents industrialisés. */
function GoalRing({ value, target }: { value: number; target: number }) {
  const ratio = target > 0 ? Math.min(1, value / target) : 0
  const r = 52
  const circumference = 2 * Math.PI * r
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="#04f06a"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          style={{ transition: "stroke-dashoffset 1200ms var(--ease-standard)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold tabular-nums">
          <CountUp value={value} />
        </span>
        <span className="text-xs text-white/70">sur {target}</span>
      </div>
    </div>
  )
}

/**
 * Chapitre 3 : notre objectif d'industrialisation et la façon dont nous pilotons les agents —
 * objectif chiffré (pilotage), critères d'un agent industrialisé, maturité moyenne des agents sur
 * les 5 axes d'évaluation (données du dashboard) et rythme de la gouvernance.
 */
export function IndustrialisationPilotage() {
  const report = useReportStore((s) => s.report)
  const industrialised = usePilotageStore((s) => s.valueFor("agents_industrialises"))
  const industrialisedTarget = usePilotageStore((s) => s.targetFor("agents_industrialises"))
  const actionsCount = useActionsStore((s) => s.actions.length)
  const snapshots = useHistoryStore((s) => s.snapshots)
  const [axisIndex, setAxisIndex] = useState(0)

  const metrics = dashboardMetrics(report)
  // Maturité moyenne des agents sur chaque axe (cellules vides exclues).
  const maturity = useMemo(
    () =>
      MATURITY_AXES.map((a) => {
        const criterion = findCriterionByKeyword(report.template, a.axis)
        const avg = criterion ? averageOfNumeric(report.rows, criterion.key) : null
        return { axis: a.axis, value: avg === null ? 0 : Math.round(avg) }
      }),
    [report],
  )
  const axis = MATURITY_AXES[axisIndex]
  const axisValue = maturity[axisIndex].value
  const n = maturity.length
  const polygon = maturity.map((m, i) => point(i, n, Math.min(100, m.value) / 100).join(",")).join(" ")
  const firstUpdate = snapshots[0]?.date

  const governance = [
    { icon: Gauge, value: PILOTAGE_OBJECTIVES.length, label: "indicateurs suivis dans le pilotage" },
    { icon: ListChecks, value: actionsCount, label: "actions pilotées, chacune avec un porteur" },
    {
      icon: RefreshCw,
      value: snapshots.length,
      label: firstUpdate ? `mises à jour du suivi depuis le ${firstUpdate.slice(8, 10)}/${firstUpdate.slice(5, 7)}` : "mises à jour du suivi",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Objectif et critères */}
        <div className="relative overflow-hidden rounded-[var(--radius-card)] p-6 text-white shadow-[var(--shadow-raised)] sm:p-8" style={{ background: "var(--gradient-brand)" }}>
          <Factory className="pointer-events-none absolute -top-6 -right-6 h-40 w-40 text-white/[0.06]" strokeWidth={1} aria-hidden />
          <div className="relative flex flex-wrap items-center gap-6">
            <GoalRing value={industrialised} target={industrialisedTarget} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-energy)]">Notre objectif</p>
              <p className="mt-1 text-2xl leading-tight font-semibold">{industrialisedTarget} agents industrialisés</p>
              <p className="mt-2 text-sm text-white/75">
                {industrialised} déjà industrialisés, {metrics.ready} agents utilisables en mission opérationnelle aujourd'hui.
              </p>
            </div>
          </div>

          <p className="relative mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Un agent industrialisé, c'est</p>
          <ol className="relative mt-3">
            {INDUSTRIALISATION_CRITERIA.map((c, i) => (
              <li key={c} className="anim-rise relative flex gap-3 pb-3 last:pb-0" style={{ ["--i" as string]: i }}>
                {i < INDUSTRIALISATION_CRITERIA.length - 1 && (
                  <span className="absolute top-6 bottom-0 left-[11px] w-px bg-[var(--color-energy)]/35" aria-hidden />
                )}
                <CheckCircle2 className="relative h-6 w-6 shrink-0 rounded-full bg-[var(--color-primary)] text-[var(--color-energy)]" strokeWidth={2} aria-hidden />
                <span className="pt-0.5 text-sm">{c}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Radar de maturité */}
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Maturité moyenne de nos agents</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Chaque agent est évalué sur 5 axes. Cliquez sur un axe pour voir son échelle.</p>
          <div className="mt-2 grid items-center gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
            <svg viewBox={`-50 -6 ${RADAR_SIZE + 100} ${RADAR_SIZE + 14}`} className="mx-auto w-full max-w-[420px] overflow-visible" role="img" aria-label="Radar de maturité moyenne des agents">
              <defs>
                <linearGradient id="pitch-radar-fill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#451dc7" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#04f06a" stopOpacity="0.35" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75, 1].map((ring) => (
                <polygon
                  key={ring}
                  points={maturity.map((_, i) => point(i, n, ring).join(",")).join(" ")}
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth="1"
                />
              ))}
              {maturity.map((_, i) => {
                const [x, y] = point(i, n, 1)
                return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="var(--color-border)" strokeWidth="1" />
              })}
              <polygon
                points={polygon}
                fill="url(#pitch-radar-fill)"
                stroke="#451dc7"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="anim-rise"
                style={{ transformOrigin: "center" }}
              />
              {maturity.map((m, i) => {
                const [x, y] = point(i, n, Math.min(100, m.value) / 100)
                const [lx, ly] = point(i, n, 1.3)
                const selected = i === axisIndex
                return (
                  <g key={m.axis} className="cursor-pointer" onClick={() => setAxisIndex(i)}>
                    <circle cx={x} cy={y} r={selected ? 6 : 4} fill={selected ? "#04f06a" : "#451dc7"} stroke="#fff" strokeWidth="2" />
                    <text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`text-[14px] ${selected ? "font-semibold" : ""}`}
                      fill={selected ? "var(--color-accent)" : "var(--color-text-muted)"}
                    >
                      {m.axis}
                    </text>
                    <text x={lx} y={ly + 17} textAnchor="middle" dominantBaseline="middle" className="text-[14px] font-semibold" fill="var(--color-text)">
                      {m.value} %
                    </text>
                  </g>
                )
              })}
            </svg>

            <div>
              <div role="tablist" aria-label="Axes de maturité" className="flex flex-wrap gap-1.5">
                {MATURITY_AXES.map((a, i) => (
                  <button
                    key={a.axis}
                    type="button"
                    role="tab"
                    aria-selected={i === axisIndex}
                    onClick={() => setAxisIndex(i)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors duration-200 ${
                      i === axisIndex ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    }`}
                  >
                    {a.axis}
                  </button>
                ))}
              </div>
              <ol key={axis.axis} role="tabpanel" className="stagger mt-3 space-y-1.5">
                {axis.levels.map((level) => {
                  const reached = axisValue >= Number.parseInt(level.score, 10)
                  return (
                    <li
                      key={level.score}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${reached ? "bg-[var(--color-accent-soft)] text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}`}
                    >
                      <span className={`w-9 shrink-0 font-semibold tabular-nums ${reached ? "text-[var(--color-accent)]" : ""}`}>{level.score}</span>
                      {level.label}
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Rythme de la gouvernance */}
      <div className="grid gap-3 sm:grid-cols-3">
        {governance.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 shadow-[var(--shadow-card)]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <span>
              <span className="block text-3xl leading-none font-semibold text-[var(--color-primary)] tabular-nums">
                <CountUp value={value} />
              </span>
              <span className="mt-1 block text-xs text-[var(--color-text-muted)]">{label}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
