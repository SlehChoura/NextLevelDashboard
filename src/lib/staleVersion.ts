/**
 * Récupération après une mise en ligne. Les pages sont chargées à la demande depuis des fichiers
 * dont le nom change à chaque version : un onglet ouvert avant une mise en ligne (ou une page
 * d'accueil encore en cache chez GitHub Pages, environ 10 minutes) réclame des fichiers qui
 * n'existent plus. Plutôt qu'une page blanche, on recharge une fois la dernière version.
 */

const RELOAD_FLAG = "nld-stale-reload-at"
/** Pas de second rechargement automatique avant ce délai, pour ne jamais boucler. */
const RELOAD_COOLDOWN_MS = 30_000

/** Erreur levée par le navigateur quand un fichier de page chargé à la demande est introuvable. */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error ?? "")
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|ChunkLoadError/i.test(
    message,
  )
}

/**
 * Recharge la page en contournant le cache de la page d'accueil (paramètre `v` dans l'URL, la route
 * après `#` est conservée). Renvoie false si un rechargement automatique vient déjà d'avoir lieu.
 */
export function reloadLatestVersion(now = Date.now()): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_FLAG) ?? 0)
    if (now - last < RELOAD_COOLDOWN_MS) return false
    sessionStorage.setItem(RELOAD_FLAG, String(now))
  } catch {
    // sessionStorage indisponible : on recharge quand même, une seule fois par erreur.
  }
  const url = new URL(window.location.href)
  url.searchParams.set("v", String(now))
  window.location.replace(url.toString())
  return true
}
