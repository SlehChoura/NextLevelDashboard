import { useCallback, useEffect, useRef, useState } from "react"
import type { AccountInfo } from "@azure/msal-browser"
import {
  fetchSharePointFile,
  getSignedInAccount,
  isSharePointSyncConfigured,
  signIn as msalSignIn,
  signOut as msalSignOut,
} from "../lib/sharePointSync"
import { useCombinedImport } from "./useCombinedImport"

/** Fréquence du rafraîchissement automatique en arrière-plan, tant que la page reste ouverte. */
export const AUTO_SYNC_INTERVAL_MS = 15 * 60 * 1000

const LAST_SYNCED_KEY = "ia4cyb.sharepoint.lastSyncedAt"

type SyncStatus = "idle" | "connecting" | "syncing" | "error"

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
 * Connexion Microsoft (compte et permissions de l'utilisateur) et synchronisation du fichier
 * Excel SharePoint de pilotage IA4CYB avec les stores locaux. Réutilise la même logique
 * d'application des données que l'import manuel ({@link useCombinedImport}).
 */
export function useSharePointSync() {
  const { importMessage: syncMessage, handleImportFile } = useCombinedImport()

  const [account, setAccount] = useState<AccountInfo | null>(null)
  const [status, setStatus] = useState<SyncStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(readLastSyncedAt)
  const syncingRef = useRef(false)
  const sessionCheckedRef = useRef(false)

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
    } catch (err) {
      setStatus("error")
      setErrorMessage(
        err instanceof Error && err.message === "not-signed-in"
          ? "Connectez-vous avec votre compte Microsoft pour synchroniser."
          : "Échec de la synchronisation. Vérifiez votre connexion et vos autorisations sur ce fichier SharePoint.",
      )
      return false
    } finally {
      syncingRef.current = false
    }
  }, [handleImportFile])

  const signIn = useCallback(async () => {
    setStatus("connecting")
    setErrorMessage(null)
    try {
      const signedInAccount = await msalSignIn()
      setAccount(signedInAccount)
      await syncNow()
    } catch {
      setStatus("error")
      setErrorMessage("Connexion Microsoft annulée ou impossible.")
    }
  }, [syncNow])

  const signOut = useCallback(async () => {
    await msalSignOut()
    setAccount(null)
    setStatus("idle")
  }, [])

  // Retrouve une session Microsoft déjà ouverte au chargement de la page, et synchronise
  // aussitôt (sans ouvrir de fenêtre de connexion) — c'est le "refresh à l'ouverture" demandé.
  useEffect(() => {
    if (!isSharePointSyncConfigured || sessionCheckedRef.current) return
    sessionCheckedRef.current = true
    let cancelled = false
    getSignedInAccount().then((found) => {
      if (cancelled || !found) return
      setAccount(found)
      void syncNow()
    })
    return () => {
      cancelled = true
    }
  }, [syncNow])

  // Rafraîchissement régulier tant que l'utilisateur reste connecté et la page ouverte.
  useEffect(() => {
    if (!account) return
    const id = window.setInterval(() => void syncNow(), AUTO_SYNC_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [account, syncNow])

  return {
    isConfigured: isSharePointSyncConfigured,
    account,
    status,
    errorMessage,
    syncMessage,
    lastSyncedAt,
    signIn,
    signOut,
    syncNow,
  }
}
