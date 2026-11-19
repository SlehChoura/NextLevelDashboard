import { useState } from "react"
import { Check, ShieldAlert, X } from "lucide-react"
import { PATH_COMPARISON } from "../../lib/pitch"

type Path = "makers" | "personal"

/**
 * « Vibe-coder, oui, mais comment ? » : les deux chemins, un à la fois. Le chemin AI Makers est
 * affiché d'abord ; basculer sur l'exploration personnelle montre ce qu'il évite.
 */
export function PathComparison() {
  const [path, setPath] = useState<Path>("makers")
  const makers = path === "makers"

  return (
    <div className="flex flex-col rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Vibe-coder, oui, mais comment ?</p>
      <div role="tablist" aria-label="Chemins de développement" className="mt-3 grid grid-cols-2 rounded-full bg-[var(--color-bg)] p-1">
        {(
          [
            ["makers", "Communauté AI Makers"],
            ["personal", "Exploration personnelle"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={path === id}
            onClick={() => setPath(id)}
            className={`rounded-full px-3 py-2 text-xs font-semibold transition-all duration-300 sm:text-sm ${
              path === id
                ? id === "makers"
                  ? "text-white shadow-sm"
                  : "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
            style={path === id && id === "makers" ? { background: "var(--gradient-brand)" } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      <ul key={path} role="tabpanel" className="stagger mt-4 flex-1 space-y-2">
        {PATH_COMPARISON.map((row) => (
          <li
            key={row.question}
            className={`flex items-start gap-3 rounded-xl px-3.5 py-2.5 ${makers ? "bg-[var(--color-accent-soft)]" : "bg-[var(--color-bg)]"}`}
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                makers ? "bg-[var(--color-success)] text-white" : "bg-[var(--color-danger)]/12 text-[var(--color-danger)]"
              }`}
            >
              {makers ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> : <X className="h-3 w-3" strokeWidth={3} aria-hidden />}
            </span>
            <span className="text-sm">
              <span className="font-semibold text-[var(--color-text)]">{row.question} · </span>
              <span className={makers ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>{makers ? row.makers : row.personal}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm font-medium text-white" style={{ background: "var(--color-primary)" }}>
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-energy)]" aria-hidden />
        Vos données ne transitent que par le chemin AI Makers : c'est le seul autorisé pour une mission.
      </p>
    </div>
  )
}
