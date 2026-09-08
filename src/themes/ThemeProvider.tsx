import { useEffect, type ReactNode } from "react"
import { useThemeStore } from "../store/themeStore"

const CSS_VAR_MAP: Record<string, string> = {
  primary: "--color-primary",
  primaryDark: "--color-primary-dark",
  accent: "--color-accent",
  accentDark: "--color-accent-dark",
  bg: "--color-bg",
  surface: "--color-surface",
  border: "--color-border",
  text: "--color-text",
  textMuted: "--color-text-muted",
  success: "--color-success",
  warning: "--color-warning",
  danger: "--color-danger",
  info: "--color-info",
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useThemeStore((s) => s.activeTheme())

  useEffect(() => {
    const root = document.documentElement
    for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
      const value = theme.colors[key as keyof typeof theme.colors]
      if (value) root.style.setProperty(cssVar, value)
    }
    root.style.setProperty("--font-family", theme.fontFamily)
  }, [theme])

  return <>{children}</>
}
