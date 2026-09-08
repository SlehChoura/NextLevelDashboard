import type { ReportMeta } from "../../types"

export function ReportMetaForm({
  meta,
  onChange,
}: {
  meta: ReportMeta
  onChange: (patch: Partial<ReportMeta>) => void
}) {
  const fields: { key: keyof ReportMeta; label: string; placeholder: string }[] = [
    { key: "title", label: "Titre du rapport", placeholder: "Ex. Reporting sécurité — Septembre 2026" },
    { key: "client", label: "Client / entité", placeholder: "Ex. Acme Corp" },
    { key: "author", label: "Auteur", placeholder: "Ex. Votre nom" },
    { key: "period", label: "Période", placeholder: "Ex. Septembre 2026" },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map((f) => (
        <label key={f.key} className="text-sm text-[var(--color-text)]">
          {f.label}
          <input
            type="text"
            value={meta[f.key] ?? ""}
            placeholder={f.placeholder}
            onChange={(e) => onChange({ [f.key]: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)]"
          />
        </label>
      ))}
    </div>
  )
}
