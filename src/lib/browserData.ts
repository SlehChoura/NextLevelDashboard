/** Préfixe des clés localStorage de l'application (stores persistés). */
const STORAGE_PREFIX = "nld-"

/** Efface toutes les données de l'application enregistrées dans ce navigateur (poste partagé). */
export function clearBrowserData(storage: Storage = localStorage): number {
  const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter(
    (k): k is string => k !== null && k.startsWith(STORAGE_PREFIX),
  )
  keys.forEach((k) => storage.removeItem(k))
  return keys.length
}

/** Date du dernier import enregistrée par le pilotage, lue directement (migrations des autres stores). */
export function readStoredLastImportAt(storage: Storage = localStorage): string | null {
  try {
    const raw = storage.getItem(`${STORAGE_PREFIX}pilotage`)
    const value = raw ? JSON.parse(raw)?.state?.lastImportAt : null
    return typeof value === "string" ? value : null
  } catch {
    return null
  }
}
