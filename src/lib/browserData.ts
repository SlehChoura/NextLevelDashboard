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
