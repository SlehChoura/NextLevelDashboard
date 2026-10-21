/** Anneau de progression vers une cible (0–100 %), pourcentage au centre. */
export function ProgressRing({
  percent,
  size = 56,
  stroke = 6,
  color = "var(--color-accent)",
  label,
}: {
  percent: number
  size?: number
  stroke?: number
  color?: string
  label: string
}) {
  const clamped = Math.max(0, Math.min(100, percent))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label} : ${percent} %`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * c} ${c}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-[var(--color-text)]">
        {percent}%
      </span>
    </div>
  )
}
