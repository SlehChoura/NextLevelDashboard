export function KpiCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="print-break-avoid rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </div>
      <div className="mt-1.5 text-3xl font-semibold tracking-tight text-[var(--color-text)]">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">{sub}</div>}
    </div>
  )
}
