import type { Criterion, DataRow, ReportTemplate } from "../../types"
import { formatCellValue, getOption } from "../../lib/criteria"
import { Badge } from "../common/Badge"

/**
 * Poids relatif de largeur de colonne selon le contenu : un libellé ou un badge de statut a
 * besoin de bien plus de place qu'un pourcentage ou un nombre court, sinon son texte déborde
 * sur la colonne voisine dans un tableau à largeurs fixes.
 */
function widthWeight(c: Criterion): number {
  if (c.role === "label") return 2
  if (c.type === "select" || c.type === "severity" || c.type === "status") return 2
  if (c.type === "text") return 1.4
  return 1.1
}

export function DataTable({ template, rows }: { template: ReportTemplate; rows: DataRow[] }) {
  const totalWeight = template.criteria.reduce((sum, c) => sum + widthWeight(c), 0) || 1

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      <table className="w-full table-fixed text-left text-sm">
        <colgroup>
          {template.criteria.map((c) => (
            <col key={c.key} style={{ width: `${(widthWeight(c) / totalWeight) * 100}%` }} />
          ))}
        </colgroup>
        <thead>
          <tr className="text-[var(--color-text-muted)]">
            {template.criteria.map((c) => (
              <th
                key={c.key}
                lang="fr"
                className="[hyphens:auto] break-words border-b border-[var(--color-border)] px-3 py-2 align-top text-xs font-medium uppercase"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.__id} className="even:bg-[var(--color-bg)]">
              {template.criteria.map((c) => {
                const isBadgeType = c.type === "select" || c.type === "severity" || c.type === "status"
                const option = isBadgeType ? getOption(c, row[c.key]) : undefined
                return (
                  <td
                    key={c.key}
                    lang="fr"
                    className="[hyphens:auto] break-words border-b border-[var(--color-border)] px-3 py-2 align-top text-[var(--color-text)]"
                  >
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
