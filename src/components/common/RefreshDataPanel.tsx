import { useState } from "react"
import { FileDrop } from "./FileDrop"
import { ImportFeedback } from "./ImportFeedback"
import { useCombinedImport } from "../../hooks/useCombinedImport"
import { usePilotageStore } from "../../store/pilotageStore"
import { useActionsStore } from "../../store/actionsStore"
import { useReportStore } from "../../store/reportStore"
import { downloadCombinedTemplate } from "../../lib/combinedImport"
import { SEED_PILOTAGE_DATE } from "../../lib/seedData"

/**
 * Encart compact de mise à jour des données : un seul fichier Excel (onglets « Suivi pilotage »,
 * « Actions », « Agents IA4CYB ») rafraîchit le pilotage, les actions et le dashboard en une fois.
 */
export function RefreshDataPanel({ className = "" }: { className?: string }) {
  const values = usePilotageStore((s) => s.values)
  const targets = usePilotageStore((s) => s.targets)
  const lastImportAt = usePilotageStore((s) => s.lastImportAt)
  const actions = useActionsStore((s) => s.actions)
  const report = useReportStore((s) => s.report)

  const { importMessage, importWarnings, handleImportFile } = useCombinedImport()
  const [open, setOpen] = useState(false)

  async function onFile(file: File) {
    if (await handleImportFile(file)) setOpen(false)
  }

  // Sans import dans ce navigateur, les données affichées sont celles du dernier fichier de suivi
  // intégré à l'application (ou d'une correction manuelle du dashboard, si plus récente).
  const fallback = [report.updatedAt, `${SEED_PILOTAGE_DATE}T00:00:00.000Z`].sort().at(-1)!
  const lastUpdate = new Date(lastImportAt ?? fallback)

  return (
    <div className={`no-print rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ${className}`}>
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-[var(--color-accent)]" aria-hidden>
          <path
            d="M16 10a6 6 0 1 1-1.76-4.24M16 4v3.5h-3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Mettre à jour les données</h2>
      </div>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        Dernière mise à jour :{" "}
        <span className="font-medium text-[var(--color-text)]">
          {Number.isNaN(lastUpdate.getTime()) ? "—" : lastUpdate.toLocaleDateString("fr-FR")}
        </span>
      </p>

      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-3 w-full rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
        style={{ backgroundColor: "var(--color-accent)" }}
      >
        {open ? "Annuler" : "Importer le fichier de suivi à jour"}
      </button>

      {open && (
        <div className="mt-3">
          <FileDrop onFile={onFile} accept=".xlsx,.xls,.csv" hint="Fichier Excel à 3 onglets (.xlsx)" />
        </div>
      )}

      <button
        onClick={() => downloadCombinedTemplate(values, targets, actions, report)}
        className="mt-2 w-full text-center text-xs font-medium text-[var(--color-accent)] hover:underline"
      >
        Télécharger le fichier actuel (modèle pré-rempli)
      </button>

      <ImportFeedback message={importMessage} warnings={importWarnings} />
    </div>
  )
}
