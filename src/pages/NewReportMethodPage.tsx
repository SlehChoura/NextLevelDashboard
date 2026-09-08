import { Link, useParams } from "react-router-dom"
import { getTemplate } from "../templates"

export function NewReportMethodPage() {
  const { templateId } = useParams()
  const template = getTemplate(templateId ?? "")

  if (!template) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8 text-sm text-[var(--color-text-muted)]">
        Template introuvable. <Link to="/templates" className="underline">Retour aux templates</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-accent)]">
        {template.shortName}
      </p>
      <h1 className="mt-1 text-xl font-semibold text-[var(--color-text)]">
        Comment souhaitez-vous renseigner les données ?
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          to={`/nouveau/${template.id}/import`}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-accent)]"
        >
          <h2 className="text-base font-semibold text-[var(--color-text)]">À partir d'un fichier Excel</h2>
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
            Importez un export existant (.xlsx, .xls, .csv). Les colonnes sont mappées
            automatiquement sur les critères du template.
          </p>
        </Link>

        <Link
          to={`/nouveau/${template.id}/formulaire`}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-accent)]"
        >
          <h2 className="text-base font-semibold text-[var(--color-text)]">Via un formulaire</h2>
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
            Saisissez directement les critères ligne par ligne, sans fichier Excel — utile pour
            un reporting rapide ou ponctuel.
          </p>
        </Link>
      </div>
    </div>
  )
}
