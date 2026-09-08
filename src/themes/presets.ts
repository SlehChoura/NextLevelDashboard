import type { ThemeConfig } from "../types"

/**
 * Palette inspirée de l'identité Wavestone (encre foncée + framboise), à ajuster avec les
 * codes couleur officiels du cabinet (cf. réglages du thème pour saisir vos propres codes
 * hexadécimaux et importer votre logo).
 */
export const wavestoneTheme: ThemeConfig = {
  id: "wavestone",
  name: "Wavestone (inspiration)",
  description:
    "Encre foncée et framboise, dans l'esprit de la charte Wavestone. À affiner avec vos codes couleur officiels.",
  builtIn: true,
  fontFamily: '"Inter", system-ui, "Segoe UI", Roboto, sans-serif',
  colors: {
    primary: "#1a1a24",
    primaryDark: "#000000",
    accent: "#e2007a",
    accentDark: "#a8005c",
    bg: "#f7f5f6",
    surface: "#ffffff",
    border: "#e7e2e5",
    text: "#1a1a24",
    textMuted: "#6b6570",
    success: "#1b8a5a",
    warning: "#c98a00",
    danger: "#c22a2a",
    info: "#2563a8",
  },
}

export const sobreBleuTheme: ThemeConfig = {
  id: "sobre-bleu",
  name: "Sobre Bleu",
  description: "Bleu marine neutre, adapté à la plupart des cabinets de conseil.",
  builtIn: true,
  fontFamily: '"Inter", system-ui, "Segoe UI", Roboto, sans-serif',
  colors: {
    primary: "#14335c",
    primaryDark: "#0b2038",
    accent: "#2f6fed",
    accentDark: "#1d4fbf",
    bg: "#f4f6fa",
    surface: "#ffffff",
    border: "#e1e6ee",
    text: "#16202e",
    textMuted: "#5a6472",
    success: "#1b8a5a",
    warning: "#c98a00",
    danger: "#c22a2a",
    info: "#2563a8",
  },
}

export const sobreVertTheme: ThemeConfig = {
  id: "sobre-vert",
  name: "Sobre Vert",
  description: "Vert forêt neutre, alternative discrète au bleu.",
  builtIn: true,
  fontFamily: '"Inter", system-ui, "Segoe UI", Roboto, sans-serif',
  colors: {
    primary: "#163a2e",
    primaryDark: "#0b241c",
    accent: "#1f9d6b",
    accentDark: "#147a51",
    bg: "#f4f8f6",
    surface: "#ffffff",
    border: "#dfe9e4",
    text: "#122822",
    textMuted: "#546b62",
    success: "#1b8a5a",
    warning: "#c98a00",
    danger: "#c22a2a",
    info: "#2563a8",
  },
}

export const monochromeTheme: ThemeConfig = {
  id: "monochrome",
  name: "Monochrome",
  description: "Gris et noir, pour un rendu neutre compatible avec toute charte cliente.",
  builtIn: true,
  fontFamily: '"Inter", system-ui, "Segoe UI", Roboto, sans-serif',
  colors: {
    primary: "#26282c",
    primaryDark: "#0f1012",
    accent: "#54585f",
    accentDark: "#33363a",
    bg: "#f5f5f6",
    surface: "#ffffff",
    border: "#e3e3e5",
    text: "#1c1d1f",
    textMuted: "#6a6c70",
    success: "#1b8a5a",
    warning: "#c98a00",
    danger: "#c22a2a",
    info: "#2563a8",
  },
}

export const builtInThemes: ThemeConfig[] = [
  wavestoneTheme,
  sobreBleuTheme,
  sobreVertTheme,
  monochromeTheme,
]

export function createCustomTheme(base: ThemeConfig): ThemeConfig {
  return {
    ...base,
    id: "custom",
    name: "Personnalisé",
    description: "Thème personnalisé, adapté à la charte graphique de votre client.",
    builtIn: false,
  }
}
