import { clearBrowserData } from "../../lib/browserData"

export function ClearBrowserDataButton() {
  function onClick() {
    const ok = window.confirm(
      "Effacer toutes les données IA4CYB enregistrées dans ce navigateur (imports, actions, historique, corrections) ?\n\n" +
        "Le site affichera de nouveau les données de référence. Cette action est irréversible.",
    )
    if (!ok) return
    try {
      clearBrowserData()
    } finally {
      window.location.reload()
    }
  }

  return (
    <button
      onClick={onClick}
      className="no-print rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
    >
      Effacer les données de ce navigateur
    </button>
  )
}
