import type { ReactNode } from "react"

/** En-tête commun des pages : surtitre, titre, description et actions à droite. */
export function PageHeader({
  eyebrow = "Pilotage IA4CYB",
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">{eyebrow}</p>
        <h1 className="mt-1.5 text-[28px] leading-tight font-semibold tracking-tight text-[var(--color-primary)]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">{description}</p>}
      </div>
      {actions && <div className="no-print flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
