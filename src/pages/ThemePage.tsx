import { useRef } from "react"
import { useThemeStore } from "../store/themeStore"
import { builtInThemes } from "../themes/presets"
import { ColorField } from "../components/theme/ColorField"
import { readFileAsDataUrl } from "../lib/file"
import type { ThemeColors } from "../types"

const COLOR_GROUPS: { title: string; fields: { key: keyof ThemeColors; label: string }[] }[] = [
  {
    title: "Couleurs de marque",
    fields: [
      { key: "primary", label: "Primaire" },
      { key: "primaryDark", label: "Primaire (foncé)" },
      { key: "accent", label: "Accent" },
      { key: "accentDark", label: "Accent (foncé)" },
    ],
  },
  {
    title: "Fond & bordures",
    fields: [
      { key: "bg", label: "Fond de page" },
      { key: "surface", label: "Surface (cartes)" },
      { key: "border", label: "Bordures" },
    ],
  },
  {
    title: "Texte",
    fields: [
      { key: "text", label: "Texte principal" },
      { key: "textMuted", label: "Texte secondaire" },
    ],
  },
  {
    title: "Couleurs sémantiques (statuts)",
    fields: [
      { key: "success", label: "Succès / Vert" },
      { key: "warning", label: "Alerte / Orange" },
      { key: "danger", label: "Critique / Rouge" },
      { key: "info", label: "Information / Bleu" },
    ],
  },
]

export function ThemePage() {
  const { activeThemeId, customTheme, selectTheme, updateCustomColors, updateCustomLogo, updateCustomName, resetCustomFrom } =
    useThemeStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await readFileAsDataUrl(file)
    updateCustomLogo(dataUrl)
    selectTheme("custom")
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-xl font-semibold text-[var(--color-text)]">Charte graphique</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Choisissez une palette prête à l'emploi ou personnalisez entièrement les couleurs et le
        logo pour coller à la charte de votre cabinet ou de votre client. Le thème
        « Wavestone » est une base indicative — importez vos codes couleur et votre logo
        officiels pour un rendu fidèle.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {builtInThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => selectTheme(theme.id)}
            className={`rounded-xl border p-4 text-left transition ${
              activeThemeId === theme.id
                ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]"
                : "border-[var(--color-border)]"
            }`}
            style={{ backgroundColor: "var(--color-surface)" }}
          >
            <div className="flex items-center gap-1.5">
              {[theme.colors.primary, theme.colors.accent, theme.colors.success, theme.colors.warning, theme.colors.danger].map(
                (c, i) => (
                  <span key={i} className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                ),
              )}
            </div>
            <div className="mt-2 text-sm font-medium text-[var(--color-text)]">{theme.name}</div>
            <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">{theme.description}</div>
          </button>
        ))}

        <button
          onClick={() => selectTheme("custom")}
          className={`rounded-xl border p-4 text-left transition ${
            activeThemeId === "custom"
              ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]"
              : "border-[var(--color-border)]"
          }`}
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <div className="flex items-center gap-1.5">
            {[customTheme.colors.primary, customTheme.colors.accent, customTheme.colors.success].map((c, i) => (
              <span key={i} className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="mt-2 text-sm font-medium text-[var(--color-text)]">{customTheme.name}</div>
          <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            Vos propres couleurs et votre logo.
          </div>
        </button>
      </div>

      <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Personnaliser</h2>
          <select
            className="rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text)]"
            onChange={(e) => resetCustomFrom(e.target.value)}
            value=""
          >
            <option value="" disabled>
              Repartir d'un thème…
            </option>
            {builtInThemes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <label className="mt-4 block text-sm text-[var(--color-text)]">
          Nom du thème
          <input
            type="text"
            value={customTheme.name}
            onChange={(e) => updateCustomName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)]"
          />
        </label>

        <div className="mt-4">
          <span className="text-sm text-[var(--color-text)]">Logo</span>
          <div className="mt-1 flex items-center gap-3">
            {customTheme.logoDataUrl ? (
              <img src={customTheme.logoDataUrl} alt="Logo" className="h-10 max-w-[160px] object-contain" />
            ) : (
              <span className="text-xs text-[var(--color-text-muted)]">Aucun logo importé</span>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)]"
            >
              Importer un logo
            </button>
            {customTheme.logoDataUrl && (
              <button
                onClick={() => updateCustomLogo(undefined)}
                className="text-xs text-[var(--color-text-muted)] underline"
              >
                Retirer
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {COLOR_GROUPS.map((group) => (
            <div key={group.title}>
              <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                {group.title}
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {group.fields.map((f) => (
                  <ColorField
                    key={f.key}
                    label={f.label}
                    value={customTheme.colors[f.key]}
                    onChange={(v) => updateCustomColors({ [f.key]: v })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
