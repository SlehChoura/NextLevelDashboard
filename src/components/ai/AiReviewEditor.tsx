import type { Criterion, CriterionRole, CriterionType, DataRow, ReportTemplate } from "../../types"

const TYPE_LABELS: Record<CriterionType, string> = {
  text: "Texte",
  number: "Nombre",
  percent: "Pourcentage",
  date: "Date",
  select: "Liste (options)",
  severity: "Sévérité",
  status: "Statut",
}

const ROLE_LABELS: Record<CriterionRole, string> = {
  label: "Identifiant de ligne",
  dimension: "Dimension (regroupement)",
  metric: "Métrique (moyenne)",
  date: "Date",
  info: "Information",
}

const BADGE_TYPES: CriterionType[] = ["select", "severity", "status"]

function Cell({
  criterion,
  row,
  onChange,
}: {
  criterion: Criterion
  row: DataRow
  onChange: (value: string) => void
}) {
  const value = row[criterion.key]
  const valueStr = String(value ?? "")

  if (BADGE_TYPES.includes(criterion.type)) {
    const options = criterion.options ?? []
    const hasCurrent = valueStr === "" || options.some((o) => o.value === valueStr)
    const displayOptions = hasCurrent ? options : [{ value: valueStr, label: valueStr, color: "neutral" as const }, ...options]
    return (
      <select
        value={valueStr}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text)]"
      >
        <option value="">—</option>
        {displayOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  }

  return (
    <input
      type="text"
      value={valueStr}
      onChange={(e) => onChange(e.target.value)}
      className="w-full min-w-[6rem] rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text)]"
    />
  )
}

export function AiReviewEditor({
  template,
  rows,
  summary,
  truncated,
  onUpdateCriterion,
  onRemoveCriterion,
  onAddCriterion,
  onSetStatusKey,
  onUpdateCell,
  onRemoveRow,
  onAddRow,
  onConfirm,
  onDiscard,
}: {
  template: ReportTemplate
  rows: DataRow[]
  summary: string
  truncated: boolean
  onUpdateCriterion: (key: string, patch: Partial<Pick<Criterion, "label" | "type" | "role">>) => void
  onRemoveCriterion: (key: string) => void
  onAddCriterion: () => void
  onSetStatusKey: (key: string | undefined) => void
  onUpdateCell: (rowId: string, key: string, value: string) => void
  onRemoveRow: (rowId: string) => void
  onAddRow: () => void
  onConfirm: () => void
  onDiscard: () => void
}) {
  const statusEligible = template.criteria.filter((c) => BADGE_TYPES.includes(c.type))

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm">
        <p className="font-medium text-[var(--color-text)]">Analyse de l'IA</p>
        <p className="mt-1 text-[var(--color-text-muted)]">{summary}</p>
        {truncated && (
          <p className="mt-2 text-xs text-[var(--color-warning)]">
            Le fichier a été tronqué : seules les premières lignes ont été analysées.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Vérifiez les critères détectés</h2>
          <button onClick={onAddCriterion} className="text-xs font-medium text-[var(--color-accent)] underline">
            + Ajouter un critère
          </button>
        </div>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Corrigez tout critère mal identifié par l'IA (libellé, type, rôle) avant de générer le dashboard.
        </p>

        <div className="mt-3 space-y-2">
          {template.criteria.map((c) => (
            <div
              key={c.key}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-border)] p-2"
            >
              <input
                value={c.label}
                onChange={(e) => onUpdateCriterion(c.key, { label: e.target.value })}
                className="min-w-[10rem] flex-1 rounded-lg border border-[var(--color-border)] px-2 py-1 text-sm text-[var(--color-text)]"
              />
              <select
                value={c.type}
                onChange={(e) => onUpdateCriterion(c.key, { type: e.target.value as CriterionType })}
                className="rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text)]"
              >
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={c.role}
                onChange={(e) => onUpdateCriterion(c.key, { role: e.target.value as CriterionRole })}
                className="rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text)]"
              >
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => onRemoveCriterion(c.key)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
              >
                Supprimer
              </button>
            </div>
          ))}
          {template.criteria.length === 0 && (
            <p className="text-xs text-[var(--color-text-muted)]">Aucun critère. Ajoutez-en au moins un.</p>
          )}
        </div>

        <label className="mt-3 block text-sm text-[var(--color-text)]">
          Critère utilisé pour la synthèse globale (RAG)
          <select
            value={template.statusKey ?? ""}
            onChange={(e) => onSetStatusKey(e.target.value || undefined)}
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)]"
          >
            <option value="">Aucun</option>
            {statusEligible.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">
            Vérifiez les données ({rows.length} ligne{rows.length > 1 ? "s" : ""})
          </h2>
          <button onClick={onAddRow} className="text-xs font-medium text-[var(--color-accent)] underline">
            + Ajouter une ligne
          </button>
        </div>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Supprimez les lignes qui ne sont pas des éléments réels (ex : légende, total) et corrigez les
          valeurs erronées.
        </p>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[var(--color-text-muted)]">
                {template.criteria.map((c) => (
                  <th key={c.key} className="border-b border-[var(--color-border)] px-2 py-1.5 font-medium">
                    {c.label}
                  </th>
                ))}
                <th className="border-b border-[var(--color-border)] px-2 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.__id}>
                  {template.criteria.map((c) => (
                    <td key={c.key} className="border-b border-[var(--color-border)] px-2 py-1">
                      <Cell criterion={c} row={row} onChange={(v) => onUpdateCell(row.__id, c.key, v)} />
                    </td>
                  ))}
                  <td className="border-b border-[var(--color-border)] px-2 py-1">
                    <button
                      onClick={() => onRemoveRow(row.__id)}
                      title="Supprimer cette ligne"
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={template.criteria.length + 1} className="px-2 py-4 text-center text-[var(--color-text-muted)]">
                    Aucune ligne.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onDiscard}
          className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)]"
        >
          Recommencer
        </button>
        <button
          onClick={onConfirm}
          disabled={template.criteria.length === 0}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          Confirmer et générer le dashboard
        </button>
      </div>
    </div>
  )
}
