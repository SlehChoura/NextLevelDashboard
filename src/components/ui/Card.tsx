import type { ReactNode } from "react"

/** Carte de base (charte Wavestone : fond blanc, filet fin, rayon 18 px, ombre bleutée légère). */
export function Card({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: ReactNode
  className?: string
  as?: "section" | "div" | "article"
}) {
  return (
    <Tag
      className={`print-break-avoid rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </Tag>
  )
}

/** Titre de carte : libellé en petites capitales espacées, action éventuelle à droite. */
export function CardTitle({ children, action, icon }: { children: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
        {icon && <span className="text-[var(--color-accent)]">{icon}</span>}
        {children}
      </h2>
      {action}
    </div>
  )
}
