import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { Criterion, DataRow } from "../../types"
import { countByCriterion } from "../../lib/criteria"
import { colorFor } from "../../lib/chartColors"

export function DistributionBarChart({
  title,
  criterion,
  rows,
  onSelect,
  selectedKey,
}: {
  title: string
  criterion: Criterion
  rows: DataRow[]
  /** Appelé avec la catégorie cliquée, pour afficher un focus sur ses agents. */
  onSelect?: (entry: { key: string; label: string }) => void
  selectedKey?: string
}) {
  const data = countByCriterion(rows, criterion)

  if (data.length === 0) return null

  return (
    <div className="print-break-avoid rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
      <div className="text-sm font-medium text-[var(--color-text)]">{title}</div>
      {onSelect && (
        <div className="text-xs text-[var(--color-text-muted)]">Cliquez sur une barre pour voir le détail</div>
      )}
      <div className="mt-2 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              interval={0}
              angle={data.length > 5 ? -20 : 0}
              textAnchor={data.length > 5 ? "end" : "middle"}
              height={data.length > 5 ? 40 : 24}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid var(--color-border)",
              }}
            />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
              onClick={onSelect ? (bar) => onSelect(bar.payload ?? bar) : undefined}
              cursor={onSelect ? "pointer" : undefined}
            >
              {data.map((d, i) => (
                <Cell
                  key={d.key}
                  fill={colorFor(d.color, i)}
                  opacity={selectedKey && selectedKey !== d.key ? 0.35 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
