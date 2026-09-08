import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import type { Criterion, DataRow } from "../../types"
import { countByCriterion } from "../../lib/criteria"
import { colorFor } from "../../lib/chartColors"

export function DistributionPieChart({
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
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              isAnimationActive={false}
            >
              {data.map((d, i) => (
                <Cell key={d.key} fill={colorFor(d.color, i)} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid var(--color-border)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-text-muted)" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
