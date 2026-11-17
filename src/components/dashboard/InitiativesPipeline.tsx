import { ExternalLink, Lightbulb } from "lucide-react"
import { INITIATIVES } from "../../lib/initiatives"
import { Badge } from "../common/Badge"

/**
 * Nouvelles initiatives IA de la communauté, présentées après les agents suivis : ce sont les
 * prochains candidats au catalogue, pas encore évalués sur les critères du dashboard.
 */
export function InitiativesPipeline() {
  if (INITIATIVES.length === 0) return null
  return (
    <section className="print-break-avoid rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
        <Lightbulb className="h-4 w-4 text-[var(--color-accent)]" aria-hidden />
        Nouvelles initiatives de la communauté ({INITIATIVES.length})
      </h2>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        Outils développés par les AI4CYB Makers, candidats au catalogue d'agents : pas encore évalués sur les critères
        ci-dessus.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {INITIATIVES.map((initiative) => (
          <article
            key={initiative.title}
            className="flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">{initiative.title}</h3>
              <span className="flex shrink-0 gap-1.5">
                {initiative.bt && <Badge label={initiative.bt} color="neutral" />}
                {initiative.status && (
                  <Badge label={initiative.status} color={initiative.status === "Disponible" ? "success" : "info"} />
                )}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-muted)]">{initiative.description}</p>
            {initiative.url && (
              <a
                href={initiative.url}
                target="_blank"
                rel="noopener noreferrer"
                className="no-print mt-3 inline-flex items-center gap-1 self-start text-xs font-medium text-[var(--color-accent)] hover:underline"
              >
                Voir le projet
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
