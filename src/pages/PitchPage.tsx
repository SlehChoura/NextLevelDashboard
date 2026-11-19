import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { Bot, Compass, Factory, PlayCircle, Workflow } from "lucide-react"
import { PitchHero, type HeroStat } from "../components/pitch/PitchHero"
import { MakerChain } from "../components/pitch/MakerChain"
import { AgentPrinciples } from "../components/pitch/AgentPrinciples"
import { IndustrialisationPilotage } from "../components/pitch/IndustrialisationPilotage"
import { AgentsShowcase } from "../components/pitch/AgentsShowcase"
import { DemoGuide } from "../components/pitch/DemoGuide"
import { useReportStore } from "../store/reportStore"
import { usePilotageStore } from "../store/pilotageStore"
import { dashboardMetrics } from "../lib/dashboardMetrics"

const CHAPTERS = [
  { id: "makers", label: "Des makers outillés", icon: Workflow },
  { id: "principes", label: "Nos principes", icon: Compass },
  { id: "industrialisation", label: "Industrialiser", icon: Factory },
  { id: "agents", label: "Nos agents", icon: Bot },
  { id: "demo", label: "Démo en direct", icon: PlayCircle },
] as const

type ChapterId = (typeof CHAPTERS)[number]["id"]

function Chapter({ id, index, title, intro, children }: { id: ChapterId; index: number; title: string; intro: string; children: ReactNode }) {
  return (
    <section id={`pitch-${id}`} className="scroll-mt-24 pt-14" aria-labelledby={`pitch-${id}-title`}>
      <div className="mb-6 flex items-end gap-4">
        <span className="text-5xl leading-none font-semibold text-[var(--color-accent)]/15 tabular-nums sm:text-6xl" aria-hidden>
          {String(index).padStart(2, "0")}
        </span>
        <div>
          <h2 id={`pitch-${id}-title`} className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-[var(--color-text-muted)] sm:text-base">{intro}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

/**
 * Page de présentation de la communauté AI4CYB Makers à un client : en quatre chapitres, la chaîne
 * de vibe coding, les principes de développement, les agents et deux démos guidées. Un mode
 * présentation passe en plein écran ; les flèches du clavier passent d'un chapitre à l'autre.
 */
export function PitchPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [activeChapter, setActiveChapter] = useState<ChapterId>("makers")
  const [fullscreen, setFullscreen] = useState(false)

  const report = useReportStore((s) => s.report)
  const consultants = usePilotageStore((s) => s.valueFor("consultants_vibe_coding"))
  const licences = usePilotageStore((s) => s.valueFor("licences_claude"))
  const metrics = dashboardMetrics(report)
  const stats: HeroStat[] = [
    { value: metrics.agents, label: "agents développés par la communauté" },
    { value: metrics.ready, label: "agents utilisables en mission opérationnelle" },
    { value: metrics.missions, label: "missions réalisées avec nos agents" },
    { value: consultants, label: "consultants formés au vibe coding" },
    { value: licences, label: "makers équipés de Claude Code" },
  ]

  const goTo = useCallback((id: ChapterId) => {
    document.getElementById(`pitch-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  // Chapitre en cours de lecture, pour la navigation.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveChapter(visible[0].target.id.replace("pitch-", "") as ChapterId)
      },
      { rootMargin: "-30% 0px -60% 0px" },
    )
    for (const c of CHAPTERS) {
      const el = document.getElementById(`pitch-${c.id}`)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  // Mode présentation : flèches et Page suivante / précédente changent de chapitre.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName))) return
      const forward = e.key === "PageDown" || (e.key === "ArrowRight" && e.altKey)
      const backward = e.key === "PageUp" || (e.key === "ArrowLeft" && e.altKey)
      if (!forward && !backward) return
      const index = CHAPTERS.findIndex((c) => c.id === activeChapter)
      const next = CHAPTERS[Math.min(CHAPTERS.length - 1, Math.max(0, index + (forward ? 1 : -1)))]
      e.preventDefault()
      goTo(next.id)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [activeChapter, goTo])

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void rootRef.current?.requestFullscreen?.()
  }

  const chapterIndex = CHAPTERS.findIndex((c) => c.id === activeChapter)

  return (
    <div ref={rootRef} className="pitch-root">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <PitchHero stats={stats} fullscreen={fullscreen} onToggleFullscreen={toggleFullscreen} onStart={() => goTo("makers")} />

        {/* Navigation entre chapitres, toujours visible pendant la présentation. */}
        <nav
          aria-label="Chapitres du pitch"
          className="no-print sticky top-2 z-30 mt-6 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-1.5 shadow-[var(--shadow-card)] backdrop-blur"
        >
          <ol className="relative grid grid-cols-5">
            <span
              className="absolute inset-y-0 rounded-full transition-all duration-500"
              style={{ width: `${100 / CHAPTERS.length}%`, left: `${(chapterIndex * 100) / CHAPTERS.length}%`, background: "var(--gradient-brand)" }}
              aria-hidden
            />
            {CHAPTERS.map((c, i) => {
              const Icon = c.icon
              const active = c.id === activeChapter
              return (
                <li key={c.id} className="relative">
                  <button
                    type="button"
                    onClick={() => goTo(c.id)}
                    aria-current={active ? "step" : undefined}
                    className={`flex w-full items-center justify-center gap-2 rounded-full px-2 py-2 text-xs font-semibold transition-colors duration-300 sm:text-sm ${
                      active ? "text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className="hidden lg:inline">
                      {i + 1}. {c.label}
                    </span>
                    <span className="lg:hidden">{i + 1}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>

        <Chapter
          id="makers"
          index={1}
          title="Des makers, et toute une chaîne de vibe coding sécurisée"
          intro="Chez Wavestone Cybersécurité, les consultants conçoivent eux-mêmes leurs agents IA, sur une chaîne de vibe coding complète, sécurisée et documentée."
        >
          <MakerChain />
        </Chapter>

        <Chapter
          id="principes"
          index={2}
          title="Des principes communs à tous nos agents"
          intro="Six règles de conception, les mêmes pour chaque agent, avant qu'il ne soit proposé en mission."
        >
          <AgentPrinciples />
        </Chapter>

        <Chapter
          id="industrialisation"
          index={3}
          title="Industrialiser nos agents, et les piloter"
          intro="Un objectif chiffré, des critères exigeants et un suivi continu : chaque agent progresse sur une trajectoire mesurée."
        >
          <IndustrialisationPilotage />
        </Chapter>

        <Chapter
          id="agents"
          index={4}
          title="Des agents déjà au service de nos missions"
          intro="Identité, conformité, audit, gestion de crise : un catalogue qui grandit chaque mois, avec des démos accessibles en direct."
        >
          <AgentsShowcase />
        </Chapter>

        <Chapter
          id="demo"
          index={5}
          title="Place à la démo"
          intro="Deux agents en action, fonctionnalité par fonctionnalité, et ce qu'ils changent pour vos équipes."
        >
          <DemoGuide />
        </Chapter>

        <section className="mt-16 overflow-hidden rounded-[28px] p-8 text-center text-white sm:p-12" style={{ background: "var(--gradient-brand)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">AI4CYB Makers</p>
          <p className="mx-auto mt-3 max-w-3xl text-2xl font-semibold sm:text-3xl">
            L'expertise cyber de nos consultants, <span className="text-[var(--color-energy)]">démultipliée par des agents</span> conçus
            pour vos enjeux.
          </p>
          <div className="no-print mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => goTo("agents")}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-primary)]"
            >
              Revoir les agents
            </button>
            <button
              type="button"
              onClick={() => goTo("demo")}
              className="rounded-full border border-white/35 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Revoir les démos
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
