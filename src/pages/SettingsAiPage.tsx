import { useState } from "react"
import { AI_MODEL_OPTIONS, useAiStore } from "../store/aiStore"
import { testAiConnection } from "../lib/ai"

export function SettingsAiPage() {
  const { apiKey, model, setApiKey, setModel, clear } = useAiStore()
  const [keyInput, setKeyInput] = useState(apiKey)
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setApiKey(keyInput)
    setSaved(true)
    setTestResult(null)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleClear() {
    clear()
    setKeyInput("")
    setTestResult(null)
  }

  async function handleTest() {
    if (!keyInput.trim()) {
      setTestResult({ ok: false, message: "Renseignez une clé API avant de tester." })
      return
    }
    setTesting(true)
    setTestResult(null)
    const result = await testAiConnection(keyInput.trim(), model)
    setTestResult(result)
    setTesting(false)
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-xl font-semibold text-[var(--color-text)]">Assistant IA</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Renseignez une clé API Anthropic (Claude) pour permettre à l'application d'analyser vos
        fichiers Excel de façon plus pertinente : choix automatique du template le plus adapté et
        proposition d'une correspondance de colonnes plus fine que la reconnaissance par en-tête
        seule. Cette fonctionnalité est entièrement optionnelle — l'import Excel et la saisie
        manuelle fonctionnent normalement sans clé configurée.
      </p>

      <div className="mt-4 rounded-xl border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 p-4 text-sm text-[var(--color-text)]">
        <span className="font-medium">À savoir avant de configurer une clé — </span>
        cette application est 100&nbsp;% côté navigateur : la clé est stockée uniquement dans le
        stockage local de ce navigateur et les appels à l'API Claude partent directement de votre
        poste (aucun serveur intermédiaire). Ne configurez pas votre clé personnelle sur un poste
        partagé ou public, et n'envoyez au modèle que des données que vous êtes autorisé à
        transmettre à un tiers (seuls les en-têtes de colonnes et un échantillon de lignes sont
        transmis, jamais le fichier entier).
      </div>

      <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <label className="block text-sm text-[var(--color-text)]">
          Clé API Anthropic
          <div className="mt-1 flex gap-2">
            <input
              type={showKey ? "text" : "password"}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk-ant-..."
              autoComplete="off"
              spellCheck={false}
              className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-mono text-[var(--color-text)]"
            />
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="shrink-0 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-text)]"
            >
              {showKey ? "Masquer" : "Afficher"}
            </button>
          </div>
        </label>

        <label className="mt-4 block text-sm text-[var(--color-text)]">
          Modèle
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)]"
          >
            {AI_MODEL_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} — {m.hint}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            onClick={handleSave}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            {saved ? "Enregistré ✓" : "Enregistrer"}
          </button>
          <button
            onClick={handleTest}
            disabled={testing}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] disabled:opacity-50"
          >
            {testing ? "Test en cours…" : "Tester la connexion"}
          </button>
          {apiKey && (
            <button
              onClick={handleClear}
              className="text-xs text-[var(--color-text-muted)] underline"
            >
              Retirer la clé enregistrée
            </button>
          )}
        </div>

        {testResult && (
          <p
            className="mt-3 text-sm"
            style={{ color: testResult.ok ? "var(--color-success)" : "var(--color-danger)" }}
          >
            {testResult.message}
          </p>
        )}
      </div>

      <p className="mt-4 text-xs text-[var(--color-text-muted)]">
        Une fois une clé enregistrée, un bouton « Analyser avec l'IA » apparaît lors de l'import
        d'un fichier Excel.
      </p>
    </div>
  )
}
