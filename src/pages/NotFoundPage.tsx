import { Link } from "react-router-dom"

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-[var(--color-text)]">Page introuvable</h1>
      <Link to="/" className="mt-3 inline-block text-sm text-[var(--color-accent)] underline">
        Retour à l'accueil
      </Link>
    </div>
  )
}
