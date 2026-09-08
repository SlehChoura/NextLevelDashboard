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
}: {
  title: string
  criterion: Criterion
  rows: DataRow[]
}) {
  const data = countByCriterion(rows, criterion)

  if (data.length === 0) return null

  return (
    <div className="print-break-avoid rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="text-sm font-medium text-[var(--color-text)]">{title}</div>
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
            <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell key={d.key} fill={colorFor(d.color, i)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
