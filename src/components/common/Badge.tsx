type BadgeColor = "success" | "warning" | "danger" | "info" | "neutral"

const COLOR_VAR: Record<BadgeColor, string> = {
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
  neutral: "var(--color-text-muted)",
}

export function Badge({ label, color = "neutral" }: { label: string; color?: BadgeColor }) {
  const c = COLOR_VAR[color]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ color: c, backgroundColor: `color-mix(in srgb, ${c} 14%, transparent)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />
      {label}
    </span>
  )
}
