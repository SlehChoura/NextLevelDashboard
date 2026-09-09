import type { DataRow, ReportTemplate } from "../../types"
import { getOption } from "../../lib/criteria"
import { isClientReadyStatus } from "../../lib/fixedFormatImport"
import { Badge } from "../common/Badge"

/**
 * Met en avant les éléments dont le statut est "présentable" ou "déployable" en contexte client —
 * ceux qui méritent d'être montrés en premier dans une présentation.
 */
export function ClientReadyAgents({ template, rows }: { template: ReportTemplate; rows: DataRow[] }) {
  const statusCriterion = template.criteria.find((c) => c.key === template.statusKey)
  const labelCriterion = template.criteria.find((c) => c.role === "label")
  if (!statusCriterion || !labelCriterion) return null

  const matches = rows.filter((row) => isClientReadyStatus(String(row[statusCriterion.key] ?? "")))
  if (matches.length === 0) return null

  return (
    <div className="print-break-avoid rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-accent)]">
        À mettre en avant — {matches.length} prêt{matches.length > 1 ? "s" : ""} pour un contexte client
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {matches.map((row) => {
          const option = getOption(statusCriterion, row[statusCriterion.key])
          return (
            <div
              key={row.__id}
              className="flex items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            >
              <span className="text-sm font-medium text-[var(--color-text)]">{row[labelCriterion.key]}</span>
              {option && <Badge label={option.label} color={option.color} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
