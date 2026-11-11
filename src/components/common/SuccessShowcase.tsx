import { Link } from "react-router-dom"
import { ArrowRight, Trophy } from "lucide-react"
import type { PilotageObjective } from "../../lib/pilotage"
import { plural } from "../../lib/plural"
import { LineConcept } from "../ui/LineConcept"

export interface UnlockedSuccess {
  objective: PilotageObjective
  current: number
  target: number
}

/**
 * Vitrine des succès de la communauté (accueil) : les objectifs atteints, mis en avant sur le
 * dégradé signature plutôt que noyés dans la liste des objectifs à poursuivre.
 */
export function SuccessShowcase({ successes, total }: { successes: UnlockedSuccess[]; total: number }) {
  if (successes.length === 0) return null
  return (
    <section
      className="print-break-avoid relative overflow-hidden rounded-[var(--radius-card)] p-5 text-white shadow-[var(--shadow-raised)]"
      style={{ background: "var(--gradient-brand)" }}
      aria-labelledby="success-showcase-title"
    >
      <LineConcept className="absolute -right-10 -bottom-8 h-40 w-2/3 opacity-40" />
      <div className="relative flex items-center justify-between gap-3">
        <h2
          id="success-showcase-title"
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/80"
        >
          <Trophy className="h-4 w-4 text-[var(--color-energy)]" aria-hidden />
          Succès de la communauté
        </h2>
        <p className="text-xs text-white/70">
          <strong className="text-base font-semibold text-white">{successes.length}</strong> / {total} objectifs atteints
        </p>
      </div>
      <ul className="relative mt-4 grid gap-2.5 sm:grid-cols-2">
        {successes.map(({ objective, current, target }, i) => (
          <li
            key={objective.id}
            className="anim-shine flex items-start gap-2.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5"
            style={{ "--i": i } as React.CSSProperties}
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-energy)] text-[var(--color-primary)]">
              <Trophy className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm leading-snug font-medium">{objective.label}</span>
              <span className="block text-xs text-white/70">
                {current} / {target} {objective.unit}
              </span>
              {current > target && objective.direction === "up" && (
                <span className="block text-xs font-semibold text-[var(--color-energy)]">Cible dépassée</span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <Link
        to="/pilotage"
        className="relative mt-4 inline-flex items-center gap-1 text-xs font-semibold text-white/85 hover:text-white hover:underline"
      >
        {plural(total - successes.length, "objectif encore à débloquer", "objectifs encore à débloquer")}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </section>
  )
}
