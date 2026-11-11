import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Check } from "lucide-react"
import { PageHeader } from "../components/ui/PageHeader"
import { Card } from "../components/ui/Card"
import { IndustrialisedAgentsDialog } from "../components/common/IndustrialisedAgentsDialog"
import { usePilotageStore } from "../store/pilotageStore"
import {
  CATEGORY_LABELS,
  computeStatus,
  PILOTAGE_OBJECTIVES,
  progressPercent,
  visibleStatus,
  type PilotageCategory,
} from "../lib/pilotage"

const CATEGORY_ORDER: PilotageCategory[] = ["competences", "agents", "plateforme", "notoriete"]

/** KPI dont le détail (liste d'agents) s'ouvre au clic. */
const INDUSTRIALISED_KPI = "agents_industrialises"

/**
 * Les indicateurs suivis par la gouvernance, par catégorie : ce que chacun mesure, sa valeur et sa
 * cible. Lecture seule — les valeurs se modifient sur la page Pilotage ou par import du fichier.
 */
export function KpisPage() {
  const values = usePilotageStore((s) => s.values)
  const targets = usePilotageStore((s) => s.targets)
  const [industrialisedOpen, setIndustrialisedOpen] = useState(false)

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <PageHeader
        title="KPI suivis"
        description={
          <>
            Les {PILOTAGE_OBJECTIVES.length} indicateurs qui mesurent la montée en compétences, l'adoption des agents IA,
            la plateforme et la notoriété de la communauté.
          </>
        }
      />

      <IndustrialisedAgentsDialog open={industrialisedOpen} onClose={() => setIndustrialisedOpen(false)} />

      <div className="stagger mt-8 grid gap-4 md:grid-cols-2 [&>*]:min-w-0">
        {CATEGORY_ORDER.map((category) => {
          const objectives = PILOTAGE_OBJECTIVES.filter((o) => o.category === category)
          if (objectives.length === 0) return null
          return (
            <Card key={category} className="p-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">
                {CATEGORY_LABELS[category]}
              </h2>
              <ul className="mt-3 divide-y divide-[var(--color-border)]">
                {objectives.map((objective) => {
                  const current = values[objective.id] ?? objective.defaultCurrent
                  const target = targets[objective.id] ?? objective.target
                  const unlocked = visibleStatus(computeStatus(objective, current, target)) === "unlocked"
                  const percent = Math.min(100, progressPercent(objective, current, target))
                  return (
                    <li key={objective.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--color-text)]">{objective.label}</p>
                          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{objective.description}</p>
                        </div>
                        <p className="shrink-0 text-right text-sm whitespace-nowrap text-[var(--color-text-muted)]">
                          <strong className="text-lg font-semibold text-[var(--color-primary)]">{current}</strong> / {target}
                          <span className="block text-[11px]">{objective.unit}</span>
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-accent-soft)]">
                          <div
                            className="anim-bar h-full rounded-full"
                            style={{ width: `${percent}%`, backgroundColor: unlocked ? "var(--color-success)" : "var(--color-accent)" }}
                          />
                        </div>
                        {unlocked && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-success)]">
                            <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden /> Atteint
                          </span>
                        )}
                      </div>
                      {objective.id === INDUSTRIALISED_KPI && (
                        <button
                          type="button"
                          onClick={() => setIndustrialisedOpen(true)}
                          className="mt-2 text-xs font-semibold text-[var(--color-accent)] hover:underline"
                        >
                          Voir la liste des agents industrialisés
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </Card>
          )
        })}
      </div>

      <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 p-5 text-sm text-[var(--color-text-muted)]" as="div">
        <p>
          <span className="font-medium text-[var(--color-text)]">À terme : </span>
          suivre les gains et les prises de commande liés aux missions réalisées avec des agents IA4CYB.
        </p>
        <Link to="/pilotage" className="no-print flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)] hover:underline">
          Piloter les objectifs <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </Card>
    </div>
  )
}
