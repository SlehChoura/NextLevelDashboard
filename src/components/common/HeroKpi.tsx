import { Link } from "react-router-dom"

/**
 * Tuile KPI mise en avant (accueil, synthèse) : valeur, évolution depuis la mise à jour précédente,
 * barre de progression vers la cible si fournie. Cliquable vers le détail quand `to` est donné.
 */
export function HeroKpi({
  label,
  value,
  sub,
  progress,
  delta,
  to,
}: {
  label: string
  value: string
  sub: string
  progress?: { current: number; target: number }
  /** Variation depuis la mise à jour précédente (`since` au format "30/09"). */
  delta?: { value: number; since: string }
  to?: string
}) {
  const percent = progress && progress.target > 0 ? Math.min(100, (progress.current / progress.target) * 100) : null
  const body = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] xl:min-h-[2rem] print:min-h-0">{label}</p>
      <p className="mt-2 text-5xl font-semibold tracking-tight text-[var(--color-text)] print:mt-1 print:text-4xl">{value}</p>
      {delta && delta.value !== 0 && (
        <p
          className="mt-1 text-xs font-semibold"
          style={{ color: delta.value > 0 ? "var(--color-success)" : "var(--color-danger)" }}
        >
          {delta.value > 0 ? "▲ +" : "▼ −"}
          {Math.abs(delta.value)} <span className="font-normal text-[var(--color-text-muted)]">depuis le {delta.since}</span>
        </p>
      )}
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
      {to && <p className="no-print mt-3 text-xs font-medium text-[var(--color-accent)]">Voir le détail →</p>}
    </>
  )
  const className = "print-break-avoid block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm print:p-3"
  return to ? (
    <Link to={to} className={`${className} transition hover:border-[var(--color-accent)] hover:shadow-md`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}
