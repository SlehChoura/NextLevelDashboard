export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] px-3 py-2">
      <span className="text-sm text-[var(--color-text)]">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-9 cursor-pointer rounded border border-[var(--color-border)] bg-transparent p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 rounded border border-[var(--color-border)] px-2 py-1 font-mono text-xs text-[var(--color-text)]"
        />
      </span>
    </label>
  )
}
