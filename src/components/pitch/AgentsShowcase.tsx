import { useMemo, useState } from "react"
import { ExternalLink, PlayCircle } from "lucide-react"
import { useReportStore } from "../../store/reportStore"
import { AGENT_PROFILES, AI_SHOWCASE_CYBER_URL, findAgentProfile, type AgentProfile } from "../../lib/agentProfiles"
import { AGENT_THEMES } from "../../lib/pitch"
import { findCriterionByKeyword, formatCellValue, getOption } from "../../lib/criteria"
import { isClientReadyStatus } from "../../lib/fixedFormatImport"
import { AgentDetailDialog } from "../dashboard/AgentDetailDialog"
import { Badge } from "../common/Badge"
import type { DataRow } from "../../types"

interface ShowcaseAgent {
  profile: AgentProfile
  name: string
  theme: string
  row?: DataRow
  ready: boolean
  missions: number
}

const ALL = "Tous"

/**
 * Chapitre 3 : les agents publiés sur AI Showcase, avec leur statut et leur nombre de missions
 * tirés du dashboard, et les liens pour les montrer en direct. Les agents encore en préparation
 * peuvent être affichés à la demande.
 */
export function AgentsShowcase() {
  const report = useReportStore((s) => s.report)
  const [theme, setTheme] = useState(ALL)
  const [showUpcoming, setShowUpcoming] = useState(false)
  const [selected, setSelected] = useState<DataRow | null>(null)

  const { template } = report
  const statusCriterion = template.criteria.find((c) => c.key === template.statusKey)
  const missionsCriterion = findCriterionByKeyword(template, "mission")

  const agents = useMemo<ShowcaseAgent[]>(() => {
    const rowByProfile = new Map<AgentProfile, DataRow>()
    for (const row of report.rows) {
      const profile = findAgentProfile(String(row.label ?? ""))
      if (profile && !rowByProfile.has(profile)) rowByProfile.set(profile, row)
    }
    return AGENT_PROFILES.map((profile) => {
      const row = rowByProfile.get(profile)
      const status = row && statusCriterion ? String(row[statusCriterion.key] ?? "") : ""
      const missions = row && missionsCriterion ? Number(row[missionsCriterion.key]) : 0
      return {
        profile,
        name: profile.showcaseName ?? String(row?.label ?? profile.code),
        theme: AGENT_THEMES[profile.code] ?? "Autres",
        row,
        ready: isClientReadyStatus(status),
        missions: Number.isFinite(missions) ? missions : 0,
      }
    })
      // Les plus éprouvés d'abord : prêts pour un client, puis par nombre de missions.
      .sort((a, b) => Number(b.ready) - Number(a.ready) || b.missions - a.missions)
  }, [report.rows, statusCriterion, missionsCriterion])

  const visible = agents.filter((a) => showUpcoming || a.profile.showcaseName)
  const themes = [ALL, ...Array.from(new Set(visible.map((a) => a.theme)))]
  const shown = visible.filter((a) => theme === ALL || a.theme === theme)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Thèmes" className="flex flex-wrap gap-1.5">
          {themes.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={t === theme}
              onClick={() => setTheme(t)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                t === theme
                  ? "bg-[var(--color-primary)] text-white"
                  : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-accent)]/50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="no-print flex flex-wrap items-center gap-4 text-xs">
          <label className="flex items-center gap-2 text-[var(--color-text)]">
            <input type="checkbox" checked={showUpcoming} onChange={(e) => setShowUpcoming(e.target.checked)} />
            Afficher les agents en préparation
          </label>
          <a
            href={AI_SHOWCASE_CYBER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[var(--color-accent)] hover:underline"
          >
            Ouvrir AI Showcase Cyber
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((agent, i) => {
          const status = agent.row && statusCriterion ? agent.row[statusCriterion.key] : null
          const option = statusCriterion ? getOption(statusCriterion, status) : undefined
          return (
            <article
              key={agent.profile.code}
              className="anim-rise group flex flex-col rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)]/40 hover:shadow-[var(--shadow-raised)]"
              style={{ ["--i" as string]: i }}
            >
              <div className="relative overflow-hidden rounded-t-[var(--radius-card)] px-5 pt-5 pb-4 text-white" style={{ background: "var(--gradient-brand)" }}>
                <span className="absolute -right-6 -bottom-10 h-28 w-28 rounded-full bg-[var(--color-energy)]/20 blur-2xl transition-transform duration-500 group-hover:scale-150" aria-hidden />
                <p className="relative text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">{agent.theme}</p>
                <h3 className="relative mt-1 text-lg font-semibold">{agent.name}</h3>
                <div className="relative mt-3 flex flex-wrap gap-1.5">
                  {agent.profile.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/12 px-2 py-0.5 text-[10px] text-white/90">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {statusCriterion && status ? (
                    <Badge label={formatCellValue(statusCriterion, status)} color={option?.color ?? "neutral"} />
                  ) : null}
                  {agent.missions > 0 && (
                    <span className="text-xs font-semibold text-[var(--color-primary)]">
                      {agent.missions} mission{agent.missions > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="mt-3 line-clamp-4 text-sm text-[var(--color-text-muted)]">{agent.profile.description}</p>

                <div className="no-print mt-auto flex flex-wrap gap-2 pt-4">
                  {agent.row && (
                    <button
                      type="button"
                      onClick={() => setSelected(agent.row ?? null)}
                      className="rounded-full border border-[var(--color-border)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    >
                      Voir la fiche
                    </button>
                  )}
                  {agent.profile.demoUrl ? (
                    <a
                      href={agent.profile.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent)] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[var(--color-accent-dark)]"
                    >
                      <PlayCircle className="h-3.5 w-3.5" aria-hidden />
                      Démo en direct
                    </a>
                  ) : agent.profile.showcaseName ? (
                    <a
                      href={AI_SHOWCASE_CYBER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-soft)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-accent)] transition-colors duration-200 hover:bg-[var(--color-accent)] hover:text-white"
                    >
                      <PlayCircle className="h-3.5 w-3.5" aria-hidden />
                      Démo sur AI Showcase
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <AgentDetailDialog row={selected} template={template} onClose={() => setSelected(null)} />
    </div>
  )
}
