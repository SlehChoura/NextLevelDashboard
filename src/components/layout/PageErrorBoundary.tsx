import { Component, type ReactNode } from "react"
import { isChunkLoadError, reloadLatestVersion } from "../../lib/staleVersion"
import { ClearBrowserDataButton } from "../common/ClearBrowserDataButton"

interface State {
  error: Error | null
  reloading: boolean
}

/**
 * Empêche une page en erreur de faire disparaître toute l'application (page blanche, menu compris).
 * Fichier de page introuvable après une mise en ligne : rechargement de la dernière version. Autre
 * erreur (ex: données enregistrées illisibles) : message avec les moyens d'en sortir.
 */
export class PageErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, reloading: false }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error) {
    if (isChunkLoadError(error) && reloadLatestVersion()) this.setState({ reloading: true })
    console.error("Page en erreur :", error)
  }

  render() {
    const { error, reloading } = this.state
    if (!error) return this.props.children

    const stale = isChunkLoadError(error)
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-xl border border-[var(--color-warning)]/40 bg-[var(--color-surface)] p-6">
          <h1 className="text-lg font-semibold text-[var(--color-text)]">
            {stale ? "Une nouvelle version du site est en ligne" : "Cette page n'a pas pu s'afficher"}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            {reloading
              ? "Chargement de la dernière version…"
              : stale
                ? "Rechargez la page pour l'utiliser. Si le problème persiste, attendez quelques minutes : la mise en ligne n'est pas encore terminée partout."
                : "Rechargez la page. Si l'erreur revient, les données enregistrées dans ce navigateur sont peut-être en cause : effacez-les puis réimportez le fichier de suivi."}
          </p>
          {!reloading && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                Recharger la page
              </button>
              {!stale && <ClearBrowserDataButton />}
            </div>
          )}
          {!stale && (
            <p className="mt-4 break-words text-xs text-[var(--color-text-muted)]">Détail technique : {error.message}</p>
          )}
        </div>
      </div>
    )
  }
}
