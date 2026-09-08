import type { Criterion, DataRow } from "../../types"
import { countByCriterion } from "../../lib/criteria"
import { colorFor } from "../../lib/chartColors"

export function RagSummary({ criterion, rows }: { criterion: Criterion; rows: DataRow[] }) {
  const counts = countByCriterion(rows, criterion)
  const total = rows.length

  if (total === 0) return null

  return (
    <div className="print-break-avoid rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
        Synthèse — {criterion.label}
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {counts.map((c, i) => (
          <div key={c.key} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: colorFor(c.color, i) }}
            />
            <span className="text-sm text-[var(--color-text)]">{c.label}</span>
            <span className="text-sm font-semibold text-[var(--color-text)]">{c.count}</span>
            <span className="text-xs text-[var(--color-text-muted)]">
              ({Math.round((c.count / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
