import { useState } from "react"
import { ArrowLeft, ArrowRight, Lock, PlayCircle, Sparkles, Target, Users } from "lucide-react"
import { DEMO_SCENARIOS } from "../../lib/pitch"

/**
 * Chapitre 5 : deux démos en direct, déroulées étape par étape devant le client. Chaque étape met
 * en avant une fonctionnalité de l'agent et ce que le client y gagne.
 */
export function DemoGuide() {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const scenario = DEMO_SCENARIOS[scenarioIndex]
  const step = scenario.steps[stepIndex]
  const last = scenario.steps.length - 1

  function chooseScenario(i: number) {
    setScenarioIndex(i)
    setStepIndex(0)
  }

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Démos" className="grid gap-3 md:grid-cols-2">
        {DEMO_SCENARIOS.map((s, i) => {
          const active = i === scenarioIndex
          return (
            <button
              key={s.code}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => chooseScenario(i)}
              className={`relative overflow-hidden rounded-[var(--radius-card)] border p-5 text-left transition-all duration-300 ${
                active
                  ? "border-transparent text-white shadow-[var(--shadow-raised)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:-translate-y-0.5 hover:border-[var(--color-accent)]/50"
              }`}
              style={active ? { background: "var(--gradient-brand)" } : undefined}
            >
              <span className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${active ? "text-[var(--color-energy)]" : "text-[var(--color-accent)]"}`}>
                <PlayCircle className="h-3.5 w-3.5" aria-hidden />
                Démo {i + 1}
              </span>
              <span className="mt-1 block text-xl font-semibold">{s.name}</span>
              <span className={`mt-1 block text-sm ${active ? "text-white/80" : "text-[var(--color-text-muted)]"}`}>{s.tagline}</span>
              <span className={`mt-3 flex items-center gap-1.5 text-xs ${active ? "text-white/70" : "text-[var(--color-text-muted)]"}`}>
                <Users className="h-3.5 w-3.5" aria-hidden />
                {s.audience}
              </span>
              <span className="mt-3 flex flex-wrap gap-1.5">
                {s.highlights.map((h) => (
                  <span
                    key={h}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${active ? "bg-white/12 text-white" : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"}`}
                  >
                    {h}
                  </span>
                ))}
              </span>
            </button>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
        {/* Progression : une pastille par étape, cliquable. */}
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-5 py-3">
          <span className="text-xs font-semibold text-[var(--color-text-muted)]">{scenario.name}</span>
          <ol className="ml-auto flex items-center gap-1.5" aria-label="Étapes de la démo">
            {scenario.steps.map((s, i) => (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => setStepIndex(i)}
                  aria-current={i === stepIndex ? "step" : undefined}
                  aria-label={`Étape ${i + 1} : ${s.title}`}
                  className={`block h-2 rounded-full transition-all duration-300 ${
                    i === stepIndex ? "w-8 bg-[var(--color-accent)]" : i < stepIndex ? "w-2 bg-[var(--color-accent)]/60" : "w-2 bg-[var(--color-border)]"
                  }`}
                />
              </li>
            ))}
          </ol>
        </div>

        <div key={`${scenario.code}-${stepIndex}`} className="anim-rise grid gap-5 p-5 md:grid-cols-[auto_1fr] lg:p-7">
          <span className="text-6xl leading-none font-semibold text-[var(--color-accent)]/20 tabular-nums" aria-hidden>
            {String(stepIndex + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">{step.title}</h3>
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-[var(--color-border)] p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Ce que fait l'agent
                </p>
                <p className="mt-2 text-sm text-[var(--color-text)]">{step.feature}</p>
              </div>
              <div className="rounded-xl p-4 text-white" style={{ background: "var(--color-primary)" }}>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-energy)]">
                  <Target className="h-3.5 w-3.5" aria-hidden />
                  Ce que vous y gagnez
                </p>
                <p className="mt-2 text-base font-medium">{step.benefit}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] px-5 py-4">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-text)] disabled:opacity-40"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Précédent
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={scenario.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-energy)] px-4 py-2 text-xs font-semibold text-[var(--color-primary)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              {scenario.internal ? <Lock className="h-3.5 w-3.5" aria-hidden /> : <PlayCircle className="h-3.5 w-3.5" aria-hidden />}
              Voir {scenario.name.split(" ")[0]} en direct
            </a>
            {stepIndex < last ? (
              <button
                type="button"
                onClick={() => setStepIndex((i) => Math.min(last, i + 1))}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white"
              >
                Suite
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : (
              DEMO_SCENARIOS.length > 1 && (
                <button
                  type="button"
                  onClick={() => chooseScenario((scenarioIndex + 1) % DEMO_SCENARIOS.length)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white"
                >
                  {DEMO_SCENARIOS[(scenarioIndex + 1) % DEMO_SCENARIOS.length].name.split(" ")[0]}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
