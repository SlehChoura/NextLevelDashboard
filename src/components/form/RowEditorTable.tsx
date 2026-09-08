import type { DataRow, ReportTemplate } from "../../types"

function CellInput({
  criterion,
  value,
  onChange,
}: {
  criterion: ReportTemplate["criteria"][number]
  value: string | number | null
  onChange: (value: string | number) => void
}) {
  if (criterion.type === "select" || criterion.type === "severity" || criterion.type === "status") {
    return (
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-[9rem] rounded-md border border-[var(--color-border)] px-2 py-1.5 text-sm text-[var(--color-text)]"
      >
        <option value="">—</option>
        {criterion.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  }

  if (criterion.type === "date") {
    return (
      <input
        type="date"
        value={value ? String(value) : ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-[9rem] rounded-md border border-[var(--color-border)] px-2 py-1.5 text-sm text-[var(--color-text)]"
      />
    )
  }

  if (criterion.type === "number" || criterion.type === "percent") {
    return (
      <input
        type="number"
        value={value ?? ""}
        min={criterion.type === "percent" ? 0 : undefined}
        max={criterion.type === "percent" ? 100 : undefined}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className="w-full min-w-[6rem] rounded-md border border-[var(--color-border)] px-2 py-1.5 text-sm text-[var(--color-text)]"
      />
    )
  }

  return (
    <input
      type="text"
      value={value ?? ""}
      placeholder={criterion.example}
      onChange={(e) => onChange(e.target.value)}
      className="w-full min-w-[10rem] rounded-md border border-[var(--color-border)] px-2 py-1.5 text-sm text-[var(--color-text)]"
    />
  )
}

export function RowEditorTable({
  template,
  rows,
  onChange,
}: {
  template: ReportTemplate
  rows: DataRow[]
  onChange: (rows: DataRow[]) => void
}) {
  function updateCell(rowId: string, key: string, value: string | number) {
    onChange(rows.map((r) => (r.__id === rowId ? { ...r, [key]: value } : r)))
  }

  function removeRow(rowId: string) {
    onChange(rows.filter((r) => r.__id !== rowId))
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-[var(--color-text-muted)]">
            {template.criteria.map((c) => (
              <th key={c.key} className="border-b border-[var(--color-border)] px-3 py-2 font-medium">
                {c.label}
                {c.required && <span className="text-[var(--color-danger)]"> *</span>}
              </th>
            ))}
            <th className="border-b border-[var(--color-border)] px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.__id}>
              {template.criteria.map((c) => (
                <td key={c.key} className="border-b border-[var(--color-border)] px-3 py-2">
                  <CellInput
                    criterion={c}
                    value={row[c.key]}
                    onChange={(v) => updateCell(row.__id, c.key, v)}
                  />
                </td>
              ))}
              <td className="border-b border-[var(--color-border)] px-3 py-2">
                <button
                  onClick={() => removeRow(row.__id)}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                  aria-label="Supprimer la ligne"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={template.criteria.length + 1}
                className="px-3 py-6 text-center text-sm text-[var(--color-text-muted)]"
              >
                Aucune ligne. Ajoutez une première entrée ci-dessous.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
