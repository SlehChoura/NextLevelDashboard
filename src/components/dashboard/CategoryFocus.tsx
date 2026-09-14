import type { Criterion, DataRow } from "../../types"

/**
 * Détail des agents d'une catégorie précise, affiché après un clic sur une barre/part de
 * graphique de répartition.
 */
export function CategoryFocus({
  title,
  labelCriterion,
  rows,
  onClose,
}: {
  title: string
  labelCriterion: Criterion
  rows: DataRow[]
  onClose: () => void
}) {
  return (
    <div className="print-break-avoid rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-accent)]">
          Focus — {title} ({rows.length})
        </div>
        <button
          onClick={onClose}
          className="no-print text-xs font-medium text-[var(--color-text-muted)] underline hover:text-[var(--color-text)]"
        >
          Fermer
        </button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.__id}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text)]"
          >
            {row[labelCriterion.key]}
          </div>
        ))}
        {rows.length === 0 && (
          <div className="text-sm text-[var(--color-text-muted)]">Aucun agent dans cette catégorie.</div>
        )}
      </div>
    </div>
  )
}
