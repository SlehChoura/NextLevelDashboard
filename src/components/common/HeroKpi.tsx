import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react"
import { Sparkline } from "../ui/Sparkline"

/**
 * Tuile KPI mise en avant (accueil, synthèse) : pictogramme, valeur, évolution depuis la mise à
 * jour précédente, mini-courbe de l'historique, barre de progression vers la cible si fournie.
 * Cliquable vers le détail (`to`) ou pour ouvrir un détail sur place (`onClick`).
 */
export function HeroKpi({
  label,
  value,
  sub,
  progress,
  delta,
  to,
  onClick,
  actionLabel = "Voir le détail",
  icon,
  trend,
}: {
  label: string
  value: string
  sub: string
  progress?: { current: number; target: number }
  /** Variation depuis la mise à jour précédente (`since` au format "30/09"). */
  delta?: { value: number; since: string }
  to?: string
  /** Alternative à `to` : ouvre un détail sur place (ex: liste d'agents). */
  onClick?: () => void
  actionLabel?: string
  icon?: ReactNode
  /** Valeurs successives (historique des mises à jour) pour la mini-courbe. */
  trend?: { date: string; value: number }[]
}) {
  const percent = progress && progress.target > 0 ? Math.min(100, (progress.current / progress.target) * 100) : null
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)] xl:min-h-[2rem] print:min-h-0">
          {label}
        </p>
        {icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] print:hidden">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-[44px] leading-none font-semibold tracking-tight text-[var(--color-primary)] print:text-4xl">{value}</p>
        {trend && trend.length > 1 && (
          <span className="print:hidden">
            <Sparkline points={trend} label={label} width={96} height={34} />
          </span>
        )}
      </div>
      {delta && delta.value !== 0 ? (
        <p
          className="mt-2 inline-flex items-center gap-1 self-start rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{
            color: delta.value > 0 ? "var(--color-success)" : "var(--color-danger)",
            backgroundColor: `color-mix(in srgb, ${delta.value > 0 ? "var(--color-success)" : "var(--color-danger)"} 10%, transparent)`,
          }}
        >
          {delta.value > 0 ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /> : <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />}
          {delta.value > 0 ? "+" : "−"}
          {Math.abs(delta.value)}
          <span className="font-normal text-[var(--color-text-muted)]">depuis le {delta.since}</span>
        </p>
      ) : (
        <p className="mt-2 h-[22px]" aria-hidden />
      )}
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">{sub}</p>
      {percent !== null && (
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-accent-soft)]"
          role="progressbar"
          aria-valuenow={Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} : ${Math.round(percent)} % de la cible`}
        >
          <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${percent}%` }} />
        </div>
      )}
      {(to || onClick) && (
        <p className="no-print mt-auto flex items-center gap-1 pt-4 text-xs font-semibold text-[var(--color-accent)]">
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
        </p>
      )}
    </>
  )
  const className =
    "print-break-avoid group flex h-full flex-col rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] print:p-3"
  const interactive = `${className} w-full text-left transition duration-200 ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:border-[var(--color-accent)]/40 hover:shadow-[var(--shadow-raised)]`
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={interactive}>
        {body}
      </button>
    )
  }
  return to ? (
    <Link to={to} className={interactive}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}
