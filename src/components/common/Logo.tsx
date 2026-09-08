import { useThemeStore } from "../../store/themeStore"

export function Logo({ size = 28 }: { size?: number }) {
  const theme = useThemeStore((s) => s.activeTheme())

  if (theme.logoDataUrl) {
    return (
      <img
        src={theme.logoDataUrl}
        alt={theme.name}
        style={{ height: size, maxWidth: size * 4 }}
        className="object-contain"
      />
    )
  }

  return (
    <span
      className="inline-flex items-center justify-center rounded-md font-bold text-white"
      style={{
        height: size,
        width: size,
        backgroundColor: "var(--color-accent)",
        fontSize: size * 0.5,
      }}
    >
      N
    </span>
  )
}
