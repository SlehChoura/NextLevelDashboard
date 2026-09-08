import type { DataRow, ReportTemplate } from "../../types"
import { formatCellValue, getOption } from "../../lib/criteria"
import { Badge } from "../common/Badge"

export function DataTable({ template, rows }: { template: ReportTemplate; rows: DataRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-[var(--color-text-muted)]">
            {template.criteria.map((c) => (
              <th key={c.key} className="border-b border-[var(--color-border)] px-3 py-2 font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.__id}>
              {template.criteria.map((c) => {
                const isBadgeType = c.type === "select" || c.type === "severity" || c.type === "status"
                const option = isBadgeType ? getOption(c, row[c.key]) : undefined
                return (
                  <td key={c.key} className="border-b border-[var(--color-border)] px-3 py-2 text-[var(--color-text)]">
                    {isBadgeType && row[c.key] ? (
                      <Badge label={formatCellValue(c, row[c.key])} color={option?.color ?? "neutral"} />
                    ) : (
                      formatCellValue(c, row[c.key])
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={template.criteria.length} className="px-3 py-6 text-center text-sm text-[var(--color-text-muted)]">
                Aucune donnée.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
