import type { DataRow, ReportTemplate } from "../../types"
import { findCriterionByKeyword } from "../../lib/criteria"
import { hasPropaleType } from "../../lib/fixedFormatImport"
import { Badge } from "../common/Badge"

const MEDALS = ["🥇", "🥈", "🥉"]

/**
 * Classement des agents par nombre de missions client réalisées, avec trophée pour le podium.
 * Repère les critères concernés par mot-clé dans leur libellé, le schéma étant généré dynamiquement
 * à l'import (pas de clé fixe pour "nombre de missions" ou "propale type").
 */
export function MissionsPodium({ template, rows }: { template: ReportTemplate; rows: DataRow[] }) {
  const labelCriterion = template.criteria.find((c) => c.role === "label")
  const missionsCriterion = findCriterionByKeyword(template, "mission")
  const propaleCriterion = findCriterionByKeyword(template, "propale")
  if (!labelCriterion || !missionsCriterion) return null

  const ranked = rows
    .map((row) => ({ row, count: Number(row[missionsCriterion.key]) }))
    .filter((r) => Number.isFinite(r.count) && r.count > 0)
    .sort((a, b) => b.count - a.count)

  if (ranked.length === 0) return null

  return (
    <div className="print-break-avoid rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-accent)]">
        🏆 Classement — agents les plus mobilisés en mission client
      </div>
      <ol className="mt-3 space-y-2">
        {ranked.map(({ row, count }, i) => (
          <li
            key={row.__id}
            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-lg leading-none" aria-hidden>
                {MEDALS[i] ?? `#${i + 1}`}
              </span>
              <span className="text-sm font-medium text-[var(--color-text)]">{row[labelCriterion.key]}</span>
            </div>
            <div className="flex items-center gap-2">
              {propaleCriterion && hasPropaleType(String(row[propaleCriterion.key] ?? "")) && (
                <Badge label="Propale type disponible" color="success" />
              )}
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {count} mission{count > 1 ? "s" : ""}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
