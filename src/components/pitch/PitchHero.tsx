import { ArrowDown, Maximize2, Minimize2 } from "lucide-react"
import { CountUp } from "../ui/CountUp"
import { LineConcept } from "../ui/LineConcept"

export interface HeroStat {
  value: number
  label: string
}

/**
 * Ouverture du pitch : promesse de la communauté et chiffres clés tirés des données de
 * l'application (ils suivent chaque mise à jour du fichier de suivi).
 */
export function PitchHero({
  stats,
  fullscreen,
  onToggleFullscreen,
  onStart,
}: {
  stats: HeroStat[]
  fullscreen: boolean
  onToggleFullscreen: () => void
  onStart: () => void
}) {
  return (
    <section
      className="relative overflow-hidden rounded-[28px] px-6 py-12 text-white shadow-[var(--shadow-raised)] sm:px-10 lg:px-14 lg:py-16"
      style={{ background: "var(--gradient-brand)" }}
    >
      <LineConcept className="absolute inset-x-0 bottom-0 h-1/2 w-full opacity-35" />
      <div
        className="pitch-float pointer-events-none absolute -top-24 -right-20 h-80 w-80 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #04f06a 0%, transparent 70%)" }}
        aria-hidden
      />

      <div className="relative max-w-3xl">
        <p className="anim-rise inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-energy)]" aria-hidden />
          Wavestone Cybersécurité · AI4CYB Makers
        </p>
        <h1 className="anim-rise mt-5 text-3xl leading-tight font-semibold sm:text-5xl" style={{ ["--i" as string]: 1 }}>
          Des consultants cyber qui fabriquent <span className="text-[var(--color-energy)]">leurs propres agents IA</span>.
        </h1>
        <p className="anim-rise mt-5 max-w-2xl text-base text-white/80 sm:text-lg" style={{ ["--i" as string]: 2 }}>
          Une communauté de makers, une chaîne de développement industrielle et sécurisée, et des agents déjà utilisés
          en mission chez nos clients.
        </p>

        <div className="anim-rise mt-8 flex flex-wrap gap-3" style={{ ["--i" as string]: 3 }}>
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-primary)] shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
          >
            Découvrir la communauté
            <ArrowDown className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="no-print inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10"
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}
            {fullscreen ? "Quitter le plein écran" : "Mode présentation"}
          </button>
        </div>
      </div>

      <dl className="relative mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="anim-rise flex flex-col-reverse rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-4 backdrop-blur-sm"
            style={{ ["--i" as string]: 4 + i }}
          >
            <dt className="mt-1 text-xs leading-snug text-white/70">{stat.label}</dt>
            <dd className="text-3xl font-semibold tabular-nums sm:text-4xl">
              <CountUp value={stat.value} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
