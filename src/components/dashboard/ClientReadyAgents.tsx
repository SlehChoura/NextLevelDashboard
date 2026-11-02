import type { DataRow, ReportTemplate } from "../../types"
import { isClientReadyStatus } from "../../lib/fixedFormatImport"

/**
 * Met en avant les éléments dont le statut est "présentable" ou "déployable" en contexte client —
 * ceux qui méritent d'être montrés en premier dans une présentation. Seul le nom est affiché : le
 * statut exact importe moins ici que le fait d'être prêt, et l'ensemble se lit comme une vitrine.
 */
export function ClientReadyAgents({
  template,
  rows,
  onSelect,
}: {
  template: ReportTemplate
  rows: DataRow[]
  /** Ouvre la fiche de l'agent cliqué. */
  onSelect?: (row: DataRow) => void
}) {
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
      {onSelect && (
        <p className="no-print mt-1 text-xs text-[var(--color-text-muted)]">Cliquez sur un agent pour découvrir sa fiche.</p>
      )}
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((row) => (
          <button
            type="button"
            key={row.__id}
            onClick={() => onSelect?.(row)}
            disabled={!onSelect}
            title={onSelect ? "Découvrir l'agent" : undefined}
            className="flex items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-left shadow-sm transition-colors duration-200 enabled:hover:border-[var(--color-accent)]/50 enabled:hover:bg-[var(--color-accent-soft)]"
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
          </button>
        ))}
      </div>
    </div>
  )
}
