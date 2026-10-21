import type { Criterion, DataRow } from "../../types"
import { countByCriterion } from "../../lib/criteria"
import { colorFor } from "../../lib/chartColors"
import { Card, CardTitle } from "../ui/Card"

/**
 * Répartition des agents par statut : barre empilée (segments séparés par un filet blanc) et
 * légende détaillée, chaque statut nommé, compté et en pourcentage.
 */
export function RagSummary({ criterion, rows, bare = false }: { criterion: Criterion; rows: DataRow[]; bare?: boolean }) {
  const counts = countByCriterion(rows, criterion)
  const total = rows.length
  if (total === 0) return null

  const content = (
    <>
      <div className="mt-4 flex h-3 w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label={`Répartition par ${criterion.label.toLowerCase()}`}>
        {counts.map((c, i) => (
          <div
            key={c.key}
            title={`${c.label} : ${c.count}`}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(c.count / total) * 100}%`, backgroundColor: colorFor(c.color, i) }}
          />
        ))}
      </div>
      <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-3">
        {counts.map((c, i) => (
          <li key={c.key} className="flex items-baseline gap-2 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 translate-y-[-1px] rounded-full" style={{ backgroundColor: colorFor(c.color, i) }} />
            <span className="min-w-0 text-[var(--color-text)]">{c.label}</span>
            <span className="ml-auto font-semibold text-[var(--color-text)]">{c.count}</span>
            <span className="w-9 text-right text-xs text-[var(--color-text-muted)]">{Math.round((c.count / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </>
  )
  if (bare) return content
  return (
    <Card className="p-5">
      <CardTitle>Répartition — {criterion.label}</CardTitle>
      {content}
    </Card>
  )
}
