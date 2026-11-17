import { useState } from "react"
import { ArrowLeft, ArrowRight, Clock, Lightbulb, Lock, PlayCircle } from "lucide-react"
import { DEMO_SCENARIOS } from "../../lib/pitch"

/**
 * Chapitre 4 : deux démos guidées pas à pas. Pour chaque étape, l'action à montrer et le message à
 * faire passer au client, avec le lien pour lancer la démo en direct.
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
        {DEMO_SCENARIOS.map((s, i) => (
          <button
            key={s.code}
            type="button"
            role="tab"
            aria-selected={i === scenarioIndex}
            onClick={() => chooseScenario(i)}
            className={`rounded-[var(--radius-card)] border p-5 text-left transition-all duration-300 ${
              i === scenarioIndex
                ? "border-transparent text-white shadow-[var(--shadow-raised)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-accent)]/50"
            }`}
            style={i === scenarioIndex ? { background: "var(--gradient-brand)" } : undefined}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">Démo {i + 1}</span>
              <span className="inline-flex items-center gap-1 text-xs opacity-80">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {s.duration}
              </span>
            </span>
            <span className="mt-1 block text-lg font-semibold">{s.name}</span>
            <span className={`mt-1 block text-sm ${i === scenarioIndex ? "text-white/80" : "text-[var(--color-text-muted)]"}`}>{s.pitch}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] lg:p-6">
        {/* Liste des étapes */}
        <div>
          <p className="flex items-start gap-2 rounded-xl bg-[var(--color-accent-soft)] p-3 text-xs text-[var(--color-text)]">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" aria-hidden />
            <span>
              <strong className="font-semibold">Pourquoi cette démo : </strong>
              {scenario.why}
            </span>
          </p>
          <ol className="mt-4 space-y-1">
            {scenario.steps.map((s, i) => (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => setStepIndex(i)}
                  aria-current={i === stepIndex ? "step" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-200 ${
                    i === stepIndex ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      i === stepIndex
                        ? "bg-[var(--color-energy)] text-[var(--color-primary)]"
                        : i < stepIndex
                          ? "bg-[var(--color-accent)] text-white"
                          : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {s.title}
                </button>
              </li>
            ))}
          </ol>
          <a
            href={scenario.url}
            target="_blank"
            rel="noopener noreferrer"
            className="no-print mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--color-accent-dark)]"
          >
            <PlayCircle className="h-4 w-4" aria-hidden />
            Lancer la démo {scenario.name.split(" ")[0]}
          </a>
          {scenario.internal && (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
              <Lock className="h-3 w-3" aria-hidden />
              Accès avec un compte Wavestone (SSO)
            </p>
          )}
        </div>

        {/* Étape active */}
        <div className="flex flex-col">
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-bg)]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${((stepIndex + 1) / scenario.steps.length) * 100}%`, background: "var(--gradient-brand)" }}
            />
          </div>
          <div key={`${scenario.code}-${stepIndex}`} className="anim-rise mt-5 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
              Étape {stepIndex + 1} sur {scenario.steps.length}
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-[var(--color-text)]">{step.title}</h3>
            <div className="mt-4 rounded-xl border border-[var(--color-border)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">À montrer</p>
              <p className="mt-1 text-sm text-[var(--color-text)]">{step.action}</p>
            </div>
            <div className="mt-3 rounded-xl p-4 text-white" style={{ background: "var(--color-primary)" }}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-energy)]">Message clé pour le client</p>
              <p className="mt-1 text-base font-medium">{step.takeaway}</p>
            </div>
          </div>
          <div className="no-print mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              disabled={stepIndex === 0}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-text)] disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Précédent
            </button>
            {stepIndex < last ? (
              <button
                type="button"
                onClick={() => setStepIndex((i) => Math.min(last, i + 1))}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white"
              >
                Étape suivante
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : (
              DEMO_SCENARIOS.length > 1 && (
                <button
                  type="button"
                  onClick={() => chooseScenario((scenarioIndex + 1) % DEMO_SCENARIOS.length)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white"
                >
                  Démo suivante
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              )
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">
        Scénarios proposés à partir de la description des agents : à ajuster avec leurs porteurs avant un rendez-vous client.
      </p>
    </div>
  )
}
