import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ThemeConfig, ThemeColors } from "../types"
import { builtInThemes, createCustomTheme, wavestoneTheme } from "../themes/presets"

interface ThemeState {
  activeThemeId: string
  customTheme: ThemeConfig
  activeTheme: () => ThemeConfig
  selectTheme: (id: string) => void
  updateCustomColors: (colors: Partial<ThemeColors>) => void
  updateCustomLogo: (logoDataUrl: string | undefined) => void
  updateCustomName: (name: string) => void
  resetCustomFrom: (themeId: string) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      activeThemeId: wavestoneTheme.id,
      customTheme: createCustomTheme(wavestoneTheme),
      activeTheme: () => {
        const { activeThemeId, customTheme } = get()
        if (activeThemeId === "custom") return customTheme
        return builtInThemes.find((t) => t.id === activeThemeId) ?? wavestoneTheme
      },
      selectTheme: (id) => set({ activeThemeId: id }),
      updateCustomColors: (colors) =>
        set((state) => ({
          customTheme: { ...state.customTheme, colors: { ...state.customTheme.colors, ...colors } },
          activeThemeId: "custom",
        })),
      updateCustomLogo: (logoDataUrl) =>
        set((state) => ({
          customTheme: { ...state.customTheme, logoDataUrl },
        })),
      updateCustomName: (name) =>
        set((state) => ({
          customTheme: { ...state.customTheme, name: name || "Personnalisé" },
        })),
      resetCustomFrom: (themeId) => {
        const base = builtInThemes.find((t) => t.id === themeId) ?? wavestoneTheme
        set({ customTheme: createCustomTheme(base), activeThemeId: "custom" })
      },
    }),
    { name: "nld-theme" },
  ),
)
