/**
 * Mini-courbe d'évolution d'un chiffre au fil des mises à jour (une série, sans axe) : trait de
 * 2 px, dernier point marqué. Les valeurs et dates sont reprises dans le libellé accessible.
 */
export function Sparkline({
  points,
  width = 120,
  height = 36,
  label,
}: {
  points: { date: string; value: number }[]
  width?: number
  height?: number
  label: string
}) {
  if (points.length < 2) return null
  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = 4
  const x = (i: number) => pad + (i * (width - 2 * pad)) / (points.length - 1)
  const y = (v: number) => (max === min ? height / 2 : height - pad - ((v - min) * (height - 2 * pad)) / (max - min))
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ")
  const last = points[points.length - 1]
  const summary = points.map((p) => `${p.date.slice(8, 10)}/${p.date.slice(5, 7)} : ${p.value}`).join(", ")
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label} — ${summary}`}>
      <title>{`${label} — ${summary}`}</title>
      <path d={`${d} L${x(points.length - 1)},${height} L${x(0)},${height} Z`} fill="var(--color-accent)" opacity="0.08" />
      <path d={d} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(points.length - 1)} cy={y(last.value)} r="3.5" fill="var(--color-accent)" stroke="#fff" strokeWidth="2" />
    </svg>
  )
}
