import { Files, Fingerprint, Globe, Radar, Scale, Siren, type LucideIcon } from "lucide-react"

/** Icône de chaque thématique d'agent (voir AGENT_THEMES). */
export const THEME_ICONS: Record<string, LucideIcon> = {
  Identité: Fingerprint,
  "Conformité et risques": Scale,
  "Audit et tests d'intrusion": Radar,
  "Gestion de crise": Siren,
  "Renseignement sur la menace": Globe,
  "Gestion des connaissances": Files,
}

const LINE = "rgba(255,255,255,0.55)"
const SOFT = "rgba(255,255,255,0.18)"
const GREEN = "#04f06a"

/** Motif propre à chaque thématique, dessiné en traits fins sur le dégradé de la carte. */
function Motif({ theme }: { theme: string }) {
  switch (theme) {
    case "Identité":
      return (
        <g fill="none" strokeLinecap="round">
          {[18, 32, 46, 60].map((r, i) => (
            <path key={r} d={`M ${300 - r} 120 A ${r} ${r} 0 0 1 ${300 + r} 120`} stroke={i === 3 ? GREEN : LINE} strokeWidth="2.5" />
          ))}
          <line x1="300" y1="120" x2="300" y2="96" stroke={LINE} strokeWidth="2.5" />
          {[
            [215, 40],
            [380, 46],
            [395, 120],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <line x1="300" y1="80" x2={x} y2={y} stroke={SOFT} strokeWidth="1.5" />
              <circle cx={x} cy={y} r="6" fill={GREEN} />
            </g>
          ))}
        </g>
      )
    case "Conformité et risques":
      return (
        <g fill="none" strokeWidth="2.5">
          <circle cx="280" cy="70" r="42" stroke={LINE} />
          <circle cx="330" cy="70" r="42" stroke={LINE} />
          <circle cx="305" cy="110" r="42" stroke={GREEN} />
          <path d="M 290 92 l 11 11 l 22 -24" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )
    case "Audit et tests d'intrusion":
      return (
        <g fill="none">
          {[25, 50, 75].map((r) => (
            <circle key={r} cx="310" cy="88" r={r} stroke={SOFT} strokeWidth="2" />
          ))}
          <g className="pitch-sweep" style={{ transformOrigin: "310px 88px" }}>
            <path d="M 310 88 L 310 13 A 75 75 0 0 1 375 50 Z" fill={GREEN} fillOpacity="0.28" />
            <line x1="310" y1="88" x2="310" y2="13" stroke={GREEN} strokeWidth="2.5" />
          </g>
          <circle cx="345" cy="62" r="5" fill={GREEN} />
          <circle cx="280" cy="120" r="4" fill="#fff" />
        </g>
      )
    case "Gestion de crise":
      return (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 190 100 H 260 l 14 -40 l 20 76 l 18 -56 l 12 20 H 420" stroke={GREEN} strokeWidth="3" />
          {[14, 28, 42].map((r) => (
            <circle key={r} className="pitch-ping" cx="294" cy="60" r={r} stroke={LINE} strokeWidth="1.5" style={{ transformOrigin: "294px 60px" }} />
          ))}
        </g>
      )
    case "Renseignement sur la menace":
      return (
        <g fill="none">
          <circle cx="310" cy="90" r="62" stroke={LINE} strokeWidth="2" />
          <ellipse cx="310" cy="90" rx="26" ry="62" stroke={SOFT} strokeWidth="2" />
          <line x1="248" y1="90" x2="372" y2="90" stroke={SOFT} strokeWidth="2" />
          <path d="M 258 60 Q 310 75 362 60 M 258 120 Q 310 105 362 120" stroke={SOFT} strokeWidth="2" />
          {[
            [275, 55],
            [345, 70],
            [330, 128],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill={GREEN} />
          ))}
        </g>
      )
    default:
      return (
        <g fill="none" strokeWidth="2.5">
          <rect x="262" y="30" width="80" height="100" rx="8" stroke={SOFT} />
          <rect x="276" y="42" width="80" height="100" rx="8" stroke={LINE} />
          <rect x="290" y="54" width="80" height="100" rx="8" stroke={GREEN} />
          {[78, 94, 110].map((y) => (
            <line key={y} x1="304" y1={y} x2="352" y2={y} stroke="#fff" strokeOpacity="0.6" strokeLinecap="round" />
          ))}
        </g>
      )
  }
}

/**
 * Bandeau illustré d'une carte d'agent : motif de sa thématique sur le dégradé Wavestone, avec un
 * halo qui s'intensifie au survol de la carte (classe `group` sur la carte).
 */
export function AgentArt({ theme }: { theme: string }) {
  return (
    <svg viewBox="0 0 440 180" preserveAspectRatio="xMaxYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="pitch-art-glow">
          <stop offset="0" stopColor={GREEN} stopOpacity="0.35" />
          <stop offset="1" stopColor={GREEN} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="350" cy="60" r="110" fill="url(#pitch-art-glow)" className="opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
      {/* Motif réduit et placé en haut à droite, au-dessus du titre de la carte. */}
      <g transform="translate(110 -16) scale(0.78)">
        <g className="origin-[310px_90px] transition-transform duration-700 group-hover:scale-110">
          <Motif theme={theme} />
        </g>
      </g>
    </svg>
  )
}
