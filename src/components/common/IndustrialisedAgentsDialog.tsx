import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Check } from "lucide-react"
import { useReportStore } from "../../store/reportStore"
import { usePilotageStore } from "../../store/pilotageStore"
import { industrialisedAgents, industrialisedCriterion } from "../../lib/dashboardMetrics"

/**
 * Liste des agents marqués « Oui » en « Agent industrialisé » (colonne K de l'onglet agents),
 * ouverte depuis l'indicateur « Agents industrialisés » (accueil, pilotage, page KPI). Signale un
 * écart avec la valeur saisie dans le pilotage plutôt que de laisser deux chiffres se contredire.
 */
export function IndustrialisedAgentsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const report = useReportStore((s) => s.report)
  const pilotageValue = usePilotageStore((s) => s.valueFor("agents_industrialises"))
  const agents = industrialisedAgents(report)
  const hasColumn = industrialisedCriterion(report) !== undefined

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="industrialised-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-0 text-[var(--color-text)] shadow-xl backdrop:bg-black/40"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">Agents IA</p>
            <h2 id="industrialised-title" className="text-lg font-semibold">
              Agents industrialisés ({agents.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg px-2 py-1 text-lg leading-none text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]"
          >
            ×
          </button>
        </div>

        {!hasColumn ? (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Le fichier importé n'a pas de colonne « Agent industrialisé » dans l'onglet agents.
          </p>
        ) : agents.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">Aucun agent n'est marqué « Oui ».</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--color-border)] text-sm">
            {agents.map((name) => (
              <li key={name} className="flex items-center gap-2.5 py-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white" aria-hidden>
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
                {name}
              </li>
            ))}
          </ul>
        )}

        {hasColumn && pilotageValue !== agents.length && (
          <p className="mt-3 rounded-lg border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/[0.06] px-3 py-2 text-xs">
            <span className="font-semibold text-[var(--color-warning)]">À vérifier :</span> le pilotage indique{" "}
            {pilotageValue} agent(s) industrialisé(s), l'onglet agents en marque {agents.length} « Oui ».
          </p>
        )}

        <p className="mt-4 text-xs text-[var(--color-text-muted)]">
          Source : colonne « Agent industrialisé » du fichier de suivi.{" "}
          <Link to="/dashboard" onClick={onClose} className="font-medium text-[var(--color-accent)] hover:underline">
            Voir le détail par agent →
          </Link>
        </p>
      </div>
    </dialog>
  )
}
