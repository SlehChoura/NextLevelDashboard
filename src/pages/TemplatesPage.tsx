import { Link } from "react-router-dom"
import { categoryLabels, templates } from "../templates"

export function TemplatesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-xl font-semibold text-[var(--color-text)]">Templates de reporting</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Chaque template définit les critères importants à suivre pour une situation donnée.
        Choisissez celui qui correspond à votre besoin, puis importez un fichier Excel ou
        saisissez vos données via un formulaire.
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm">
        <span className="text-[var(--color-text-muted)]">
          Vous ne savez pas quel template choisir ? Déposez votre fichier, l'IA propose le
          dashboard adapté.
        </span>
        <Link
          to="/import-ia"
          className="shrink-0 rounded-lg border border-[var(--color-accent)] px-3 py-1.5 font-medium text-[var(--color-accent)]"
        >
          ✨ Laisser l'IA choisir
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {templates.map((template) => (
          <div key={template.id} className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <span className="w-fit rounded-full bg-[var(--color-accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
              {categoryLabels[template.category]}
            </span>
            <h2 className="mt-2 text-base font-semibold text-[var(--color-text)]">{template.name}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{template.description}</p>
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              <span className="font-medium">Quand l'utiliser : </span>
              {template.situation}
            </p>
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
              Critères suivis : {template.criteria.map((c) => c.label).join(" · ")}
            </p>
            <Link
              to={`/nouveau/${template.id}`}
              className="mt-4 inline-flex w-fit rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              Utiliser ce template
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
