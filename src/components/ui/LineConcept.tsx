import type { CSSProperties } from "react"

/**
 * Le « line concept » Wavestone : deux lignes qui se rejoignent en un point (géométrie du modèle
 * PowerPoint officiel). Sur fond sombre, la seconde ligne est blanche ; sur fond clair, Vibrant Blue.
 */
export function LineConcept({
  onDark = true,
  className = "",
  style,
}: {
  onDark?: boolean
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 1280 720"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={`pointer-events-none ${className}`}
      style={style}
    >
      <path d="M0 331 C 0 331, 666 584, 1280 180" stroke="#04F06A" strokeWidth="3.2" strokeLinecap="round" />
      <path
        d="M417 540 C 417 540, 707 214, 1280 325"
        stroke={onDark ? "#FFFFFF" : "#451DC7"}
        strokeOpacity={onDark ? 0.85 : 1}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
