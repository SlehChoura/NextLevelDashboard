import { useEffect, useState } from "react"
import { BadgeCheck, Coins, GitBranch, Lock, ShieldCheck, UserCheck, type LucideIcon } from "lucide-react"
import { AGENT_PRINCIPLES, type Principle } from "../../lib/pitch"

const PRINCIPLE_ICONS: Record<Principle["icon"], LucideIcon> = {
  shield: ShieldCheck,
  user: UserCheck,
  badge: BadgeCheck,
  git: GitBranch,
  lock: Lock,
  coins: Coins,
}

/** Durée d'affichage de chaque principe en défilement automatique. */
const ROTATE_MS = 6000

/**
 * Chapitre 2 : les principes communs à tous nos agents, un à la fois sous le projecteur. Ils
 * défilent seuls tant que personne n'en choisit un ; un clic sur un principe arrête le défilement.
 */
export function AgentPrinciples() {
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const principle = AGENT_PRINCIPLES[active]
  const Icon = PRINCIPLE_ICONS[principle.icon]

  useEffect(() => {
    if (!auto) return
    const id = window.setTimeout(() => setActive((i) => (i + 1) % AGENT_PRINCIPLES.length), ROTATE_MS)
    return () => window.clearTimeout(id)
  }, [auto, active])

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {AGENT_PRINCIPLES.map((p, i) => {
          const ItemIcon = PRINCIPLE_ICONS[p.icon]
          const current = i === active
          return (
            <li key={p.title}>
              <button
                type="button"
                onClick={() => {
                  setAuto(false)
                  setActive(i)
                }}
                aria-current={current ? "true" : undefined}
                className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
                  current
                    ? "border-[var(--color-accent)]/40 bg-[var(--color-surface)] shadow-[var(--shadow-raised)]"
                    : "border-transparent bg-[var(--color-surface)]/60 hover:bg-[var(--color-surface)]"
                }`}
              >
                {/* Barre de progression du défilement automatique */}
                {current && auto && (
                  <span
                    key={`progress-${active}`}
                    className="anim-bar absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[var(--color-accent)]"
                    style={{ animationDuration: `${ROTATE_MS}ms`, animationTimingFunction: "linear" }}
                    aria-hidden
                  />
                )}
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                    current ? "text-white" : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  }`}
                  style={current ? { background: "var(--gradient-brand)" } : undefined}
                >
                  <ItemIcon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <span className={`text-sm font-semibold ${current ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]"}`}>
                  {p.title}
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      {/* Principe sous le projecteur */}
      <div className="relative flex min-h-[320px] overflow-hidden rounded-[var(--radius-card)] p-8 text-white shadow-[var(--shadow-raised)] sm:p-10" style={{ background: "var(--gradient-brand)" }}>
        <Icon className="pointer-events-none absolute -right-10 -bottom-10 h-72 w-72 text-white/[0.06]" strokeWidth={1} aria-hidden />
        <div key={active} className="anim-rise relative flex flex-col">
          <span className="pitch-glow flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-energy)] text-[var(--color-primary)]">
            <Icon className="h-8 w-8" strokeWidth={1.75} aria-hidden />
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            Principe {active + 1} sur {AGENT_PRINCIPLES.length}
          </p>
          <h3 className="mt-2 text-2xl leading-tight font-semibold sm:text-3xl">{principle.title}</h3>
          <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">{principle.description}</p>
        </div>
      </div>
    </div>
  )
}
