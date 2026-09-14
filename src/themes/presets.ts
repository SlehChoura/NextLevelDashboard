import type { ThemeConfig } from "../types"

/**
 * Charte graphique officielle Wavestone (codes couleur et logo extraits du template de
 * présentation corporate). Le vert et le corail de marque sont trop clairs/saturés pour du
 * texte ou des badges lisibles (contraste insuffisant) : les couleurs sémantiques "succès" et
 * "critique" en reprennent la teinte dans une version plus foncée, accessible.
 */
export const wavestoneTheme: ThemeConfig = {
  id: "wavestone",
  name: "Wavestone",
  description: "Charte graphique officielle Wavestone (violet de marque, vert, corail).",
  builtIn: true,
  fontFamily: '"Aptos", "Segoe UI", system-ui, -apple-system, Arial, sans-serif',
  logoDataUrl: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTEzMy45MyAyODMuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgaWQ9ImFydHdvcmsiIG92ZXJmbG93PSJoaWRkZW4iPjxkZWZzLz48Zz48cGF0aCBkPSJNOTQuMzQgOTYuNjEgMTQ0LjIgMTg3LjkzIDE1Ny4zNCAxNjMuODUgMTIwLjUgOTYuNjEgOTQuMzQgOTYuNjFaIiBmaWxsPSIjNDUxREM3Ii8+PHBhdGggZD0iTTc3Ny45NiA5NC4zOEM3NDcuNTggOTQuMzggNzIzLjU1IDExMi4yOSA3MjMuNTUgMTQxLjU1IDcyMy41NSAxNzAuODEgNzQ3LjU4IDE4OC43MiA3NzcuOTYgMTg4LjcyIDgwOC4zNCAxODguNzIgODMyLjM3IDE3MC44MSA4MzIuMzcgMTQxLjU1IDgzMi4zNyAxMTIuMjkgODA4LjM0IDk0LjM4IDc3Ny45NiA5NC4zOFpNNzc3Ljk2IDE3OC43NkM3NTUuMzggMTc4Ljc2IDc0NS4wNSAxNjIuMjQgNzQ1LjA1IDE0MS41NSA3NDUuMDUgMTIwLjg2IDc1NS4zOCAxMDQuMzQgNzc3Ljk2IDEwNC4zNCA4MDAuNTQgMTA0LjM0IDgxMC44NyAxMjAuODYgODEwLjg3IDE0MS41NSA4MTAuODcgMTYyLjI0IDgwMC41NCAxNzguNzYgNzc3Ljk2IDE3OC43NloiIGZpbGw9IiM0NTFEQzciLz48cGF0aCBkPSJNNjI5Ljc1IDEwOC45OCA2NjIuNjQgMTA4Ljk4IDY2Mi42NCAxODYuMzggNjgzLjE1IDE4Ni4zOCA2ODMuMTUgMTA4Ljk4IDcxNi4wNCAxMDguOTggNzE2LjA0IDk2LjU5IDYyOS43NSA5Ni41OSA2MjkuNzUgMTA4Ljk4WiIgZmlsbD0iIzQ1MURDNyIvPjxwYXRoIGQ9Ik01NzcuODUgMTMwLjlDNTY0Ljc1IDEyNy40OCA1NTIuMzggMTI0LjI2IDU1Mi4zOCAxMTYuMTcgNTUyLjM4IDEwOC4wOCA1NjMuNzYgMTA0LjM3IDU3NS4wNCAxMDQuMzcgNTg2LjMyIDEwNC4zNyA1OTYuODkgMTA3LjE3IDYwNy41NSAxMTIuOTRMNjEwLjE0IDExNC4zNCA2MTAuMTQgMTAyLjQ3IDYwOS4xMiAxMDEuOTdDNTk5LjUgOTcuMTkgNTg2LjgxIDk0LjM0IDU3NS4yIDk0LjM0IDU1NS43MiA5NC4zNCA1MzQuOTEgMTAxLjUyIDUzNC45MSAxMjEuNjcgNTM0LjkxIDE0MS44MiA1NTQuOTEgMTQ2LjM5IDU3Mi41NiAxNTEuMDYgNTg1Ljg0IDE1NC41OCA1OTguMzkgMTU3LjkgNTk4LjM5IDE2Ni41MiA1OTguMzkgMTc1LjE0IDU4Ni41MiAxNzguNzIgNTc1LjQ5IDE3OC43MiA1NjIuNDQgMTc4LjcyIDU0OS40OSAxNzQuNjMgNTM3IDE2Ni42Nkw1MzUuNiAxNjUuNzcgNTI5LjggMTc0LjE5IDUzMS4zNyAxNzUuMjVDNTQzLjggMTgzLjY3IDU2MC44MSAxODguNjkgNTc2Ljg2IDE4OC42OSA2MDEuMTYgMTg4LjY5IDYxNi44NiAxNzcuODcgNjE2Ljg2IDE2MS4zNCA2MTYuODYgMTQxLjA2IDU5NS4yMyAxMzUuNDIgNTc3Ljg0IDEzMC44OFoiIGZpbGw9IiM0NTFEQzciLz48cGF0aCBkPSJNNDU2LjM5IDE0Ny41OSA1MDcuMjUgMTQ3LjU5IDUwNy4yOCAxMzUuMTcgNDU2LjM5IDEzNS4xNyA0NTYuMzkgMTA4Ljk4IDUxMS4yMyAxMDguOTggNTExLjI3IDk2LjU2IDQzNS44OCA5Ni41NiA0MzUuODggMTg2LjI5IDUxMi4wNCAxODYuMjkgNTEyLjA4IDE3My44NyA0NTYuMzkgMTczLjg3IDQ1Ni4zOSAxNDcuNTlaIiBmaWxsPSIjNDUxREM3Ii8+PHBhdGggZD0iTTk4My45IDE3My44NyA5ODMuOSAxNDcuNTkgMTAzNC43NiAxNDcuNTkgMTAzNC44IDEzNS4xNyA5ODMuOSAxMzUuMTcgOTgzLjkgMTA4Ljk4IDEwMzguNzUgMTA4Ljk4IDEwMzguNzggOTYuNTYgOTYzLjM5IDk2LjU2IDk2My4zOSAxODYuMjkgMTAzOS41NSAxODYuMjkgMTAzOS41OSAxNzMuODcgOTgzLjkgMTczLjg3WiIgZmlsbD0iIzQ1MURDNyIvPjxwYXRoIGQ9Ik0yMzMuMzMgMTg2LjI5IDI0Ny42NyAxODYuMzEgMjU2LjM3IDE3MC4xMyAzMDAuODYgMTcwLjEzIDMwOS43MiAxODYuMjkgMzMzLjAzIDE4Ni4yOSAyODMuMTcgOTQuOTcgMjMzLjM0IDE4Ni4yOVpNMjYzLjA0IDE1Ny43MSAyNzguMzkgMTI5LjEyIDI5NC4wNSAxNTcuNzEgMjYzLjAzIDE1Ny43MVoiIGZpbGw9IiM0NTFEQzciLz48cGF0aCBkPSJNMzczLjU2IDE1My43OCAzNDIuMjQgOTYuNjEgMzE4LjkzIDk2LjYxIDM2OC43OSAxODcuOTMgNDE4LjYyIDk2LjYxIDQwNC4yNyA5Ni41OSAzNzMuNTYgMTUzLjc4WiIgZmlsbD0iIzQ1MURDNyIvPjxwYXRoIGQ9Ik05MjYuNzIgOTYuNTYgOTI2Ljc0IDE1Mi40NCA4NTIuNTEgOTQuOTUgODUyLjUxIDE4Ni4zMiA4NjQuOTEgMTg2LjMyIDg2NSAxMzAuNDkgOTM5LjEyIDE4Ny45NSA5MzkuMTQgOTYuNTYgOTM5LjEyIDk2LjU2IDkyNi43MiA5Ni41NloiIGZpbGw9IiM0NTFEQzciLz48cGF0aCBkPSJNMjgwLjMyIDYxLjE1IDI2My45OCA2MS4xNUMyNDYuMTQgNzkuODUgMjI5LjU5IDk5LjY1IDIxNi43MiAxMjAuNDQgMjExLjQgMTI5LjA0IDIwNi41NyAxMzcuNzUgMjAyLjIxIDE0Ni41NEwxNzQuODUgOTYuNiAxNDguNjkgOTYuNiAxOTguNTUgMTg3LjkyIDE5OC41NSAxODcuODdDMjEzLjkzIDE0MS43IDI0Mi4wNyA5OC44NSAyODAuMzIgNjEuMTVaIiBmaWxsPSIjNDUxREM3Ii8+PC9nPjxyZWN0IHg9IjQyNS40MSIgeT0iLTQyNS40MSIgd2lkdGg9IjI4My4xMSIgaGVpZ2h0PSIxMTMzLjkzIiBmaWxsPSJub25lIiB0cmFuc2Zvcm09Im1hdHJpeCg2LjEyMzIzZS0xNyAxIC0xIDYuMTIzMjNlLTE3IDcwOC41MiAtNDI1LjQxKSIvPjwvc3ZnPg==",
  colors: {
    primary: "#250f6b",
    primaryDark: "#000000",
    accent: "#451dc7",
    accentDark: "#250f6b",
    bg: "#f6f6f6",
    surface: "#ffffff",
    border: "#e4e2ec",
    text: "#14101f",
    textMuted: "#615c73",
    success: "#0b8a4b",
    warning: "#c98a00",
    danger: "#ff2a49",
    info: "#00477f",
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
