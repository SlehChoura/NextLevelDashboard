import { useState } from "react"
import { BadgeCheck, CheckCircle2, Coins, GitBranch, Lock, ShieldCheck, UserCheck, type LucideIcon } from "lucide-react"
import { AGENT_PRINCIPLES, communityDocUrl, COMMUNITY_DOCS, INDUSTRIALISATION_CRITERIA, MATURITY_AXES, type Principle } from "../../lib/pitch"

const PRINCIPLE_ICONS: Record<Principle["icon"], LucideIcon> = {
  shield: ShieldCheck,
  user: UserCheck,
  badge: BadgeCheck,
  git: GitBranch,
  lock: Lock,
  coins: Coins,
}

const principlesDoc = COMMUNITY_DOCS.find((d) => d.path === "agent-principles.html")

/**
 * Chapitre 2 : nos principes de développement, la définition d'un agent industrialisé et les
 * échelles de maturité sur lesquelles chaque agent est évalué.
 */
export function AgentPrinciples() {
  const [axis, setAxis] = useState(0)
  const current = MATURITY_AXES[axis]

  return (
    <div className="space-y-8">
      <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENT_PRINCIPLES.map((p, i) => {
          const Icon = PRINCIPLE_ICONS[p.icon]
          return (
            <article
              key={p.title}
              className="group relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-raised)]"
            >
              <span className="absolute top-4 right-5 text-4xl font-semibold text-[var(--color-accent)]/10 tabular-nums" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] transition-colors duration-300 group-hover:bg-[var(--color-accent)] group-hover:text-white">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[var(--color-text)]">{p.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">{p.description}</p>
            </article>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        {/* Définition d'un agent industrialisé */}
        <div className="rounded-[var(--radius-card)] p-6 text-white shadow-[var(--shadow-card)]" style={{ background: "var(--gradient-brand)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Notre définition d'un agent industrialisé</p>
          <ul className="mt-4 space-y-3">
            {INDUSTRIALISATION_CRITERIA.map((c) => (
              <li key={c} className="flex gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-energy)]" strokeWidth={2} aria-hidden />
                {c}
              </li>
            ))}
          </ul>
          {principlesDoc && (
            <a
              href={communityDocUrl(principlesDoc)}
              target="_blank"
              rel="noopener noreferrer"
              className="no-print mt-5 inline-flex text-xs font-semibold text-white/85 underline-offset-4 hover:underline"
            >
              Tous les principes des agents (accès Wavestone) →
            </a>
          )}
        </div>

        {/* Échelles de maturité */}
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            Chaque agent est évalué sur 5 axes de maturité
          </p>
          <div role="tablist" aria-label="Axes de maturité" className="mt-3 flex flex-wrap gap-1.5">
            {MATURITY_AXES.map((a, i) => (
              <button
                key={a.axis}
                type="button"
                role="tab"
                aria-selected={i === axis}
                onClick={() => setAxis(i)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-200 ${
                  i === axis
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/15"
                }`}
              >
                {a.axis}
              </button>
            ))}
          </div>
          <ol key={current.axis} role="tabpanel" className="stagger mt-5 space-y-2">
            {current.levels.map((level, i) => (
              <li key={level.score} className="flex items-center gap-3">
                <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums text-[var(--color-accent)]">{level.score}</span>
                <span className="relative h-9 flex-1 overflow-hidden rounded-lg bg-[var(--color-bg)]">
                  <span
                    className="anim-bar absolute inset-y-0 left-0 origin-left rounded-lg"
                    style={{
                      width: `${((i + 1) / current.levels.length) * 100}%`,
                      background: "linear-gradient(90deg, var(--color-accent-soft), color-mix(in srgb, var(--color-accent) 30%, white))",
                    }}
                    aria-hidden
                  />
                  <span className="relative flex h-full items-center px-3 text-xs font-medium text-[var(--color-text)]">{level.label}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
