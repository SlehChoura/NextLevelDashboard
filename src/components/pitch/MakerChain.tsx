import { useEffect, useState } from "react"
import { Check, Cloud, Code2, GitBranch, KeyRound, Laptop, Pause, Play, RotateCcw, Server, type LucideIcon } from "lucide-react"
import { VIBE_CHAIN } from "../../lib/pitch"
import { PathComparison } from "./PathComparison"
import { DocsHub } from "./DocsHub"

const STEP_ICONS: Record<string, LucideIcon> = {
  poste: Laptop,
  parallax: Server,
  gitlab: GitBranch,
  vibe: Code2,
  sso: KeyRound,
  foundry: Cloud,
}

/** Durée d'affichage de chaque étape en lecture automatique. */
const STEP_MS = 3200

/**
 * Chapitre 1 : la chaîne de vibe coding de la communauté, de l'idée à l'agent utilisé en mission,
 * en lecture animée ou étape par étape, puis les deux chemins de développement et la documentation
 * de la communauté.
 */
export function MakerChain() {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const step = VIBE_CHAIN[active]

  useEffect(() => {
    if (!playing) return
    if (active >= VIBE_CHAIN.length - 1) {
      const stop = window.setTimeout(() => setPlaying(false), STEP_MS)
      return () => window.clearTimeout(stop)
    }
    const next = window.setTimeout(() => setActive((i) => i + 1), STEP_MS)
    return () => window.clearTimeout(next)
  }, [playing, active])

  function togglePlay() {
    if (!playing && active >= VIBE_CHAIN.length - 1) setActive(0)
    setPlaying((p) => !p)
  }

  const StepIcon = STEP_ICONS[step.id] ?? Code2
  const progress = (active / (VIBE_CHAIN.length - 1)) * 100

  return (
    <div className="space-y-8">
      {/* Chaîne animée */}
      <div className="relative overflow-hidden rounded-[var(--radius-card)] p-6 text-white sm:p-8" style={{ background: "var(--color-primary)" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">La chaîne AI Makers, de l'idée à la mission</p>
          <div className="no-print flex gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-energy)] px-4 py-1.5 text-xs font-semibold text-[var(--color-primary)]"
            >
              {playing ? <Pause className="h-3.5 w-3.5" aria-hidden /> : <Play className="h-3.5 w-3.5" aria-hidden />}
              {playing ? "Pause" : "Lancer l'animation"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false)
                setActive(0)
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white"
              aria-label="Revenir au début"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        </div>

        {/* Piste : une étape par nœud, le flux avance jusqu'à l'étape active. */}
        <ol className="relative mt-8 grid grid-cols-3 gap-y-6 sm:grid-cols-6">
          {/* Piste entre le premier et le dernier nœud (centres des colonnes extrêmes). */}
          <div className="pointer-events-none absolute top-7 right-[8.33%] left-[8.33%] hidden h-0.5 rounded-full bg-white/15 sm:block" aria-hidden>
            <div
              className="relative h-full rounded-full bg-[var(--color-energy)] transition-[width] duration-700 ease-out"
              style={{ width: `${progress}%` }}
            >
              <span className="pitch-glow absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[var(--color-energy)]" />
            </div>
          </div>
          {VIBE_CHAIN.map((s, i) => {
            const Icon = STEP_ICONS[s.id] ?? Code2
            const done = i < active
            const current = i === active
            return (
              <li key={s.id} className="relative flex flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(false)
                    setActive(i)
                  }}
                  aria-current={current ? "step" : undefined}
                  aria-label={`Étape ${i + 1} : ${s.title}`}
                  className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-300 ${
                    current
                      ? "pitch-glow scale-110 border-[var(--color-energy)] bg-[var(--color-energy)] text-[var(--color-primary)]"
                      : done
                        ? "border-[var(--color-energy)]/60 bg-white/10 text-[var(--color-energy)]"
                        : "border-white/20 bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {done ? <Check className="h-6 w-6" strokeWidth={2.5} aria-hidden /> : <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />}
                </button>
                <span className={`mt-2 text-[11px] font-semibold sm:text-xs ${current ? "text-white" : "text-white/60"}`}>{s.title}</span>
              </li>
            )
          })}
        </ol>

        {/* Détail de l'étape active */}
        <div key={step.id} className="anim-rise mt-8 grid gap-5 rounded-2xl border border-white/15 bg-white/[0.06] p-5 md:grid-cols-[auto_1fr_1fr]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[var(--color-energy)]">
            <StepIcon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
              Étape {active + 1} / {VIBE_CHAIN.length}
            </p>
            <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-white/80">{step.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {step.tools.map((tool) => (
                <span key={tool} className="rounded-full border border-white/20 px-2.5 py-0.5 text-[11px] text-white/85">
                  {tool}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-[var(--color-energy)]/12 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-energy)]">Ce que ça vous garantit</p>
            <p className="mt-2 text-sm font-medium text-white">{step.benefit}</p>
          </div>
        </div>
      </div>

      {/* Les deux chemins et la documentation de la communauté */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PathComparison />
        <DocsHub />
      </div>
    </div>
  )
}
