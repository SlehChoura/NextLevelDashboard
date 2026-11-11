import { useEffect, useRef } from "react"
import { CheckCircle2, CircleDashed, ExternalLink, Flag, PlayCircle, Users } from "lucide-react"
import type { DataRow, ReportTemplate } from "../../types"
import { formatCellValue, getOption } from "../../lib/criteria"
import { AI_SHOWCASE_CYBER_URL, findAgentProfile } from "../../lib/agentProfiles"
import { Badge } from "../common/Badge"
import { OwnerAvatar } from "../ui/OwnerAvatar"

const sectionTitle = "text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
const linkButton =
  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200"

/**
 * Fiche d'un agent, ouverte au clic sur son nom (page Agents) : description et liens AI Showcase /
 * démo issus de {@link findAgentProfile}, puis les valeurs de sa ligne dans le fichier de suivi.
 */
export function AgentDetailDialog({
  row,
  template,
  onClose,
}: {
  row: DataRow | null
  template: ReportTemplate
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (row && !dialog.open) dialog.showModal()
    if (!row && dialog.open) dialog.close()
  }, [row])

  const labelCriterion = template.criteria.find((c) => c.role === "label")
  const statusCriterion = template.criteria.find((c) => c.key === template.statusKey)
  const name = row && labelCriterion ? String(row[labelCriterion.key] ?? "") : ""
  const profile = name ? findAgentProfile(name) : undefined
  const status = row && statusCriterion ? row[statusCriterion.key] : null
  const percentCriteria = template.criteria.filter((c) => c.type === "percent")
  const otherCriteria = template.criteria.filter(
    (c) => c !== labelCriterion && c !== statusCriterion && c.type !== "percent",
  )

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="agent-detail-title"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(46rem,calc(100vw-2rem))] overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-0 text-[var(--color-text)] shadow-xl backdrop:bg-black/40"
    >
      {row && (
        <>
          <header className="relative px-5 pt-5 pb-4 text-white sm:px-6" style={{ background: "var(--gradient-brand)" }}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                {profile ? `${profile.code} · ${profile.source}` : "Agent IA4CYB"}
              </p>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="-mt-1 -mr-1 rounded-lg px-2 py-1 text-lg leading-none text-white/80 hover:bg-white/10"
              >
                ×
              </button>
            </div>
            <h2 id="agent-detail-title" className="mt-1 text-xl font-semibold leading-snug">
              {name}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {statusCriterion && status && (
                <span className="rounded-full bg-white px-0.5 py-0.5">
                  <Badge label={formatCellValue(statusCriterion, status)} color={getOption(statusCriterion, status)?.color ?? "neutral"} />
                </span>
              )}
              {profile?.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/30 px-2.5 py-0.5 text-xs text-white/90">
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div className="space-y-5 px-5 py-5 sm:px-6">
            {profile ? (
              <p className="text-sm leading-relaxed">{profile.description}</p>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">Pas encore de fiche descriptive pour cet agent.</p>
            )}

            {(profile?.showcaseName || profile?.demoUrl) && (
              <div className="flex flex-wrap gap-2">
                {profile.showcaseName && (
                  <a
                    href={AI_SHOWCASE_CYBER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkButton} bg-[var(--color-accent)] text-white hover:opacity-90`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    Voir sur AI Showcase
                    <span className="font-normal text-white/75">« {profile.showcaseName} »</span>
                  </a>
                )}
                {profile.demoUrl && (
                  <a
                    href={profile.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkButton} border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]`}
                  >
                    <PlayCircle className="h-3.5 w-3.5" aria-hidden />
                    Ouvrir la démo
                  </a>
                )}
              </div>
            )}

            {percentCriteria.length > 0 && (
              <section>
                <h3 className={sectionTitle}>Maturité</h3>
                <ul className="mt-2 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {percentCriteria.map((c) => {
                    const value = Number(row[c.key])
                    const known = row[c.key] !== null && row[c.key] !== "" && Number.isFinite(value)
                    return (
                      <li key={c.key}>
                        <div className="flex items-baseline justify-between text-sm">
                          <span>{c.label}</span>
                          <span className="font-semibold">{known ? `${value}%` : "—"}</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--color-accent-soft)]">
                          <div
                            className="h-full rounded-full bg-[var(--color-accent)]"
                            style={{ width: `${known ? Math.min(100, Math.max(0, value)) : 0}%` }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}

            {otherCriteria.length > 0 && (
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {otherCriteria.map((c) => {
                  const isBadge = c.type === "select" || c.type === "severity" || c.type === "status"
                  const value = row[c.key]
                  return (
                    <div key={c.key} className="rounded-xl bg-[var(--color-bg)] px-3 py-2.5">
                      <dt className="text-[11px] leading-tight text-[var(--color-text-muted)]">{c.label}</dt>
                      <dd className="mt-1 text-sm font-semibold">
                        {isBadge && value ? (
                          <Badge label={formatCellValue(c, value)} color={getOption(c, value)?.color ?? "neutral"} />
                        ) : (
                          formatCellValue(c, value)
                        )}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            )}

            {profile && (
              <>
                <section className="flex flex-wrap gap-x-8 gap-y-3">
                  <div>
                    <h3 className={sectionTitle}>Porteur</h3>
                    <p className="mt-1.5 flex items-center gap-2 text-sm font-medium">
                      <OwnerAvatar name={profile.owner} />
                      {profile.owner}
                    </p>
                  </div>
                  {profile.bt && (
                    <div>
                      <h3 className={sectionTitle}>BT</h3>
                      <p className="mt-1.5 text-sm font-medium leading-7">{profile.bt}</p>
                    </div>
                  )}
                  {profile.team.length > 0 && (
                    <div className="min-w-0 basis-full">
                      <h3 className={`${sectionTitle} flex items-center gap-1.5`}>
                        <Users className="h-3.5 w-3.5" aria-hidden /> Équipe
                      </h3>
                      <p className="mt-1.5 text-sm text-[var(--color-text)]">{profile.team.join(" · ")}</p>
                    </div>
                  )}
                </section>

                <div className="grid gap-5 sm:grid-cols-2">
                  {profile.done.length > 0 && (
                    <section>
                      <h3 className={sectionTitle}>Réalisé</h3>
                      <ul className="mt-2 space-y-1.5 text-sm">
                        {profile.done.map((item) => (
                          <li key={item} className="flex gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" aria-hidden />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {profile.next.length > 0 && (
                    <section>
                      <h3 className={sectionTitle}>Prochaines étapes</h3>
                      <ul className="mt-2 space-y-1.5 text-sm">
                        {profile.next.map((item) => (
                          <li key={item} className="flex gap-2">
                            <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" aria-hidden />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>

                {profile.priority && (
                  <p className="flex items-start gap-2 rounded-xl border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/[0.05] px-3.5 py-2.5 text-sm">
                    <Flag className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" aria-hidden />
                    <span>
                      <span className="font-semibold">Priorité : </span>
                      {profile.priority}
                    </span>
                  </p>
                )}
              </>
            )}

            <p className="text-xs text-[var(--color-text-muted)]">
              Sources : fichier de pilotage IA4CYB et catalogue AI Showcase Cyber.
            </p>
          </div>
        </>
      )}
    </dialog>
  )
}
