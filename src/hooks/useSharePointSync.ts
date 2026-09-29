import { useCallback, useEffect, useRef, useState } from "react"
import { fetchSharePointFile } from "../lib/sharePointSync"
import { useCombinedImport } from "./useCombinedImport"

/** Fréquence du rafraîchissement automatique en arrière-plan, tant que la page reste ouverte. */
export const AUTO_SYNC_INTERVAL_MS = 15 * 60 * 1000

const LAST_SYNCED_KEY = "ia4cyb.sharepoint.lastSyncedAt"

type SyncStatus = "idle" | "syncing" | "error"

function readLastSyncedAt(): string | null {
  try {
    return localStorage.getItem(LAST_SYNCED_KEY)
  } catch {
    return null
  }
}

function writeLastSyncedAt(iso: string) {
  try {
    localStorage.setItem(LAST_SYNCED_KEY, iso)
  } catch {
    // stockage indisponible (navigation privée...) : la synchro fonctionne quand même,
    // seul l'horodatage affiché ne survit pas au rechargement.
  }
}

/**
 * Synchronisation du fichier Excel SharePoint de pilotage IA4CYB avec les stores locaux, en
 * accès anonyme (lien de partage public, sans connexion Microsoft). Réutilise la même logique
 * d'application des données que l'import manuel ({@link useCombinedImport}).
 */
export function useSharePointSync() {
  const { importMessage: syncMessage, handleImportFile } = useCombinedImport()

  const [status, setStatus] = useState<SyncStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(readLastSyncedAt)
  const syncingRef = useRef(false)
  const autoSyncedRef = useRef(false)

  const syncNow = useCallback(async (): Promise<boolean> => {
    if (syncingRef.current) return false
    syncingRef.current = true
    setStatus("syncing")
    setErrorMessage(null)
    try {
      const file = await fetchSharePointFile()
      const ok = await handleImportFile(file)
      if (ok) {
        const now = new Date().toISOString()
        writeLastSyncedAt(now)
        setLastSyncedAt(now)
        setStatus("idle")
      } else {
        setStatus("error")
        setErrorMessage("Le fichier SharePoint n'a pas pu être interprété (onglets attendus introuvables).")
      }
      return ok
    } catch {
      setStatus("error")
      setErrorMessage(
        "Échec de la synchronisation. Vérifiez que le lien de partage du fichier est bien défini sur "
          + "« Toute personne disposant du lien » et que le fichier est accessible.",
      )
      return false
    } finally {
      syncingRef.current = false
    }
  }, [handleImportFile])

  // Synchronise automatiquement une fois à l'ouverture de la page.
  useEffect(() => {
    if (autoSyncedRef.current) return
    autoSyncedRef.current = true
    void syncNow()
  }, [syncNow])

  // Rafraîchissement régulier tant que la page reste ouverte.
  useEffect(() => {
    const id = window.setInterval(() => void syncNow(), AUTO_SYNC_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [syncNow])

  return { status, errorMessage, syncMessage, lastSyncedAt, syncNow }
}
