import { BookOpen, Bot, Coins, Compass, KeyRound, Layers, Lock, Rocket, ShieldCheck, type LucideIcon } from "lucide-react"
import { communityDocUrl, COMMUNITY_DOCS, type CommunityDoc } from "../../lib/pitch"
import { CountUp } from "../ui/CountUp"

const DOC_ICONS: Record<CommunityDoc["icon"], LucideIcon> = {
  compass: Compass,
  rocket: Rocket,
  shield: ShieldCheck,
  book: BookOpen,
  layers: Layers,
  key: KeyRound,
  coins: Coins,
  bot: Bot,
}

/**
 * La documentation de la communauté, résumée en un coup d'œil : un chiffre, une promesse et une
 * tuile par guide (le détail apparaît au survol, le clic ouvre le guide sur le site interne).
 */
export function DocsHub() {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-[var(--radius-card)] p-6 text-white shadow-[var(--shadow-card)]" style={{ background: "var(--gradient-brand)" }}>
      <div
        className="pitch-float pointer-events-none absolute -right-16 -bottom-20 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #04f06a 0%, transparent 70%)" }}
        aria-hidden
      />
      <div className="relative flex items-end gap-4">
        <span className="text-6xl leading-none font-semibold text-[var(--color-energy)] tabular-nums">
          <CountUp value={COMMUNITY_DOCS.length} />
        </span>
        <div>
          <p className="text-lg leading-tight font-semibold">guides pour une communauté entièrement documentée</p>
          <p className="mt-1 text-sm text-white/70">De l'installation du poste à l'agent utilisé en mission.</p>
        </div>
      </div>

      <ul className="stagger relative mt-6 grid flex-1 grid-cols-2 content-center gap-2.5 sm:grid-cols-4">
        {COMMUNITY_DOCS.map((doc) => {
          const Icon = DOC_ICONS[doc.icon]
          return (
            <li key={doc.path}>
              <a
                href={communityDocUrl(doc)}
                target="_blank"
                rel="noopener noreferrer"
                title={`${doc.title} : ${doc.description}`}
                className="group flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.07] px-2 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-energy)]/60 hover:bg-white/[0.14]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[var(--color-energy)] transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="text-xs font-semibold leading-tight">{doc.short}</span>
              </a>
            </li>
          )
        })}
      </ul>

      <p className="relative mt-4 flex items-center gap-1.5 text-[11px] text-white/60">
        <Lock className="h-3 w-3" aria-hidden />
        Site interne de la communauté, accessible aux consultants Wavestone
      </p>
    </div>
  )
}
