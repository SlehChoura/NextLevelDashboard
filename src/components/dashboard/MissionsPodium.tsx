import { Trophy } from "lucide-react"
import type { DataRow, ReportTemplate } from "../../types"
import { findCriterionByKeyword } from "../../lib/criteria"
import { hasPropaleType } from "../../lib/fixedFormatImport"
import { Card, CardTitle } from "../ui/Card"

/**
 * Classement des agents par nombre de missions client réalisées : barres horizontales
 * proportionnelles, valeur affichée en bout de barre, podium mis en avant. Repère les critères
 * concernés par mot-clé dans leur libellé, le schéma étant généré dynamiquement à l'import.
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
  const max = ranked[0].count
  const total = ranked.reduce((sum, r) => sum + r.count, 0)

  return (
    <Card className="p-5">
      <CardTitle icon={<Trophy className="h-4 w-4" />}>Agents les plus mobilisés en mission client</CardTitle>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        {total} missions réalisées par {ranked.length} agents
        {propaleCriterion && (
          <>
            {" "}·{" "}
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" aria-hidden /> propale type disponible
            </span>
          </>
        )}
      </p>
      <ol className="mt-4 space-y-3">
        {ranked.map(({ row, count }, i) => (
          <li key={row.__id} className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-x-3 gap-y-1 sm:grid-cols-[1.75rem_minmax(0,22rem)_minmax(0,1fr)]">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                i < 3 ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
              }`}
              aria-label={`Rang ${i + 1}`}
            >
              {i + 1}
            </span>
            <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-[var(--color-text)]">
              <span className="truncate" title={String(row[labelCriterion.key] ?? "")}>
                {row[labelCriterion.key]}
              </span>
              {propaleCriterion && hasPropaleType(String(row[propaleCriterion.key] ?? "")) && (
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-success)]"
                  title="Propale type disponible"
                  aria-label="Propale type disponible"
                />
              )}
            </span>
            <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--color-accent-soft)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(count / max) * 100}%`, background: i < 3 ? "var(--gradient-brand)" : "var(--color-accent)" }}
                />
              </div>
              <span className="w-24 shrink-0 whitespace-nowrap text-right text-sm font-semibold text-[var(--color-primary)]">
                {count} mission{count > 1 ? "s" : ""}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  )
}
