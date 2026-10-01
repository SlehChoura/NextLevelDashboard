import type { DataRow, ReportTemplate } from "../../types"
import { isClientReadyStatus } from "../../lib/fixedFormatImport"

/**
 * Met en avant les éléments dont le statut est "présentable" ou "déployable" en contexte client —
 * ceux qui méritent d'être montrés en premier dans une présentation. Seul le nom est affiché : le
 * statut exact importe moins ici que le fait d'être prêt, et l'ensemble se lit comme une vitrine.
 */
export function ClientReadyAgents({ template, rows }: { template: ReportTemplate; rows: DataRow[] }) {
  const statusCriterion = template.criteria.find((c) => c.key === template.statusKey)
  const labelCriterion = template.criteria.find((c) => c.role === "label")
  if (!statusCriterion || !labelCriterion) return null

  const matches = rows.filter((row) => isClientReadyStatus(String(row[statusCriterion.key] ?? "")))
  if (matches.length === 0) return null

  return (
    <div className="print-break-avoid rounded-xl border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/[0.04] p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
        Nos agents prêts pour un contexte client ({matches.length})
      </div>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((row) => (
          <div
            key={row.__id}
            className="flex items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 shadow-sm"
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden>
                <path
                  d="M4 10.5 8 14.5 16 6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-sm font-medium text-[var(--color-text)]">{row[labelCriterion.key]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
