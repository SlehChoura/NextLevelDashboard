import { shortDate, type SnapshotDiff, type ValueChange } from "../../lib/history"

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })
}

function Delta({ change, upIsGood = true }: { change: ValueChange; upIsGood?: boolean }) {
  const delta = change.to - change.from
  const good = upIsGood ? delta > 0 : delta < 0
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold"
      style={{ color: good ? "var(--color-success)" : "var(--color-danger)" }}
    >
      <span aria-hidden>{delta > 0 ? "▲" : "▼"}</span>
      {delta > 0 ? "+" : "−"}
      {formatNumber(Math.abs(delta))}
    </span>
  )
}

function Row({ change, children }: { change: ValueChange; children: React.ReactNode }) {
  return (
    <li className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
      <span className="text-[var(--color-text)]">{change.label}</span>
      <span className="flex shrink-0 items-baseline gap-2 whitespace-nowrap text-[var(--color-text-muted)]">
        {formatNumber(change.from)} → <strong className="text-[var(--color-text)]">{formatNumber(change.to)}</strong>
        {children}
      </span>
    </li>
  )
}

/**
 * Ce qui a bougé entre les deux dernières mises à jour des données : progrès des objectifs et des
 * agents, et cibles révisées — signalées à part, car un succès peut venir d'une cible abaissée.
 */
export function ChangesSinceUpdate({ diff }: { diff: SnapshotDiff | null }) {
  if (!diff) return null
  const empty = diff.progress.length === 0 && diff.dashboard.length === 0 && diff.targetRevisions.length === 0

  return (
    <section className="print-break-avoid rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm print:p-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        Depuis la dernière mise à jour ({shortDate(diff.from)} → {shortDate(diff.to)})
      </h2>

      {empty && <p className="mt-2 text-sm text-[var(--color-text-muted)]">Aucune évolution des chiffres.</p>}

      <div className={diff.targetRevisions.length > 0 ? "print:grid print:grid-cols-2 print:items-start print:gap-4" : ""}>
        {(diff.progress.length > 0 || diff.dashboard.length > 0) && (
          <ul className="mt-2 divide-y divide-[var(--color-border)]">
            {diff.progress.map((c) => (
              <Row key={c.objective.id} change={c}>
                <Delta change={c} upIsGood={c.objective.direction === "up"} />
              </Row>
            ))}
            {diff.dashboard.map((c) => (
              <Row key={c.label} change={c}>
                <Delta change={c} />
              </Row>
            ))}
          </ul>
        )}

        {diff.targetRevisions.length > 0 && (
          <div className="mt-4 rounded-lg border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/[0.06] p-3 print:mt-2">
            <p className="text-xs font-semibold text-[var(--color-warning)]">
              ⚠ Cible(s) révisée(s) le {shortDate(diff.to)}
            </p>
            <ul className="mt-1">
              {diff.targetRevisions.map((c) => (
                <li key={c.objective.id} className="flex items-baseline justify-between gap-3 py-1 text-sm">
                  <span className="text-[var(--color-text)]">{c.label}</span>
                  <span className="shrink-0 whitespace-nowrap text-[var(--color-text-muted)]">
                    cible {formatNumber(c.from)} → <strong className="text-[var(--color-text)]">{formatNumber(c.to)}</strong>{" "}
                    ({c.to < c.from ? "abaissée" : "relevée"})
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Un objectif atteint grâce à une cible abaissée est signalé comme tel sur la page Pilotage.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
