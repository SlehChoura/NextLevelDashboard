import { useEffect, useRef, useState } from "react"

const DURATION_MS = 900

/**
 * Affiche un entier en le faisant défiler de 0 à sa valeur à l'apparition (chiffres clés). La
 * valeur finale est affichée d'emblée si l'utilisateur préfère réduire les animations, à
 * l'impression, et pour les lecteurs d'écran (`aria-label`).
 */
export function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(value)
  const frame = useRef(0)

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (reduced || !Number.isFinite(value) || value === 0) return
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS)
      // Décélération en fin de course (ease-out cubique).
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [value])

  return (
    <span aria-label={String(value)}>
      <span aria-hidden className="print:hidden">
        {shown}
      </span>
      <span aria-hidden className="hidden print:inline">
        {value}
      </span>
    </span>
  )
}
