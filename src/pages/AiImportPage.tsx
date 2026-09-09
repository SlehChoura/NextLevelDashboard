import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useFileImport } from "../hooks/useFileImport"
import { reviewEditorHandlers } from "../lib/aiTemplateEdit"
import { useAiSettingsStore, type AiModel } from "../store/aiSettingsStore"
import { useReportStore } from "../store/reportStore"
import { FileDrop } from "../components/common/FileDrop"
import { ReportMetaForm } from "../components/dashboard/ReportMetaForm"
import { AiReviewEditor } from "../components/ai/AiReviewEditor"
import type { ReportMeta } from "../types"

const MODEL_OPTIONS: { value: AiModel; label: string; hint: string }[] = [
  { value: "claude-haiku-4-5", label: "Claude Haiku 4.5", hint: "le plus rapide et économique" },
  { value: "claude-sonnet-5", label: "Claude Sonnet 5", hint: "bon équilibre qualité / coût" },
  { value: "claude-opus-5", label: "Claude Opus 5", hint: "le plus capable, le plus coûteux" },
]

export function AiImportPage() {
  const navigate = useNavigate()
  const apiKey = useAiSettingsStore((s) => s.apiKey)
  const model = useAiSettingsStore((s) => s.model)
  const setApiKey = useAiSettingsStore((s) => s.setApiKey)
  const setModel = useAiSettingsStore((s) => s.setModel)
  const createReport = useReportStore((s) => s.createReport)

  const [editingKey, setEditingKey] = useState(false)
  const [keyDraft, setKeyDraft] = useState(apiKey)
  const [meta, setMeta] = useState<ReportMeta>({ title: "", client: "", author: "", period: "" })

  const { workbook, sheet, draft, setDraft, cleaning, error, summary, handleFile, handleSheetChange, reset } =
    useFileImport()

  function handleConfirm() {
    if (!draft || cleaning) return
    createReport(draft.template, { ...meta, title: meta.title || draft.template.name }, draft.rows)
    navigate("/dashboard")
  }

  return (
    <div className={`mx-auto px-6 py-8 ${draft ? "max-w-5xl" : "max-w-3xl"}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-accent)]">Nouveau rapport</p>
      <h1 className="mt-1 text-xl font-semibold text-[var(--color-text)]">
        Générer un dashboard de suivi de cas d'usage
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Importez un fichier Excel ou CSV où la première colonne liste les éléments suivis (ex : des
        agents/cas d'usage IA) et les colonnes suivantes portent leurs critères de reporting (statut,
        portabilité, documentation…). Le fichier est lu automatiquement, sans IA — une IA optionnelle
        peut ensuite nettoyer les quelques valeurs de cellules ambiguës qui n'auraient pas de format
        clair.
      </p>

      {!draft && (
        <>
          <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                Clé API Anthropic <span className="font-normal text-[var(--color-text-muted)]">(optionnelle)</span>
              </h2>
              {!editingKey && (
                <button
                  onClick={() => {
                    setKeyDraft(apiKey)
                    setEditingKey(true)
                  }}
                  className="text-xs font-medium text-[var(--color-accent)] underline"
                >
                  {apiKey ? "Modifier" : "Configurer"}
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Utilisée uniquement pour interpréter les valeurs de cellules ambiguës qu'un import
              classique ne sait pas lire (ex : une note en texte libre à la place d'un pourcentage). Le
              reste de l'import (colonnes, lignes) est entièrement local, sans IA.
            </p>

            {editingKey ? (
              <div className="mt-3 space-y-3">
                <label className="block text-sm text-[var(--color-text)]">
                  Clé API
                  <input
                    type="password"
                    value={keyDraft}
                    onChange={(e) => setKeyDraft(e.target.value)}
                    placeholder="sk-ant-..."
                    autoComplete="off"
                    className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)]"
                  />
                </label>
                <label className="block text-sm text-[var(--color-text)]">
                  Modèle
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value as AiModel)}
                    className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)]"
                  >
                    {MODEL_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label} — {m.hint}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setApiKey(keyDraft.trim())
                      setEditingKey(false)
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => setEditingKey(false)}
                    className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)]"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {apiKey ? `Clé configurée · Modèle : ${MODEL_OPTIONS.find((m) => m.value === model)?.label}` : "Aucune clé configurée."}
              </p>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">Informations du rapport (facultatif)</h2>
            <div className="mt-3">
              <ReportMetaForm meta={meta} onChange={(patch) => setMeta((m) => ({ ...m, ...patch }))} />
            </div>
          </div>

          <div className="mt-4">
            <FileDrop onFile={handleFile} accept=".xlsx,.xls,.csv" hint="Formats acceptés : .xlsx, .xls, .csv" />
          </div>

          {error && <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p>}
        </>
      )}

      {workbook && sheet && workbook.SheetNames.length > 1 && (
        <label className="mt-4 block text-sm text-[var(--color-text)]">
          Feuille à importer
          <select
            value={sheet.activeSheet}
            onChange={(e) => handleSheetChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          >
            {workbook.SheetNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      )}

      {draft && error && <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p>}

      {draft && (
        <AiReviewEditor
          template={draft.template}
          rows={draft.rows}
          summary={summary}
          {...reviewEditorHandlers(setDraft)}
          onConfirm={handleConfirm}
          onDiscard={reset}
          confirmLabel={cleaning ? "Nettoyage en cours…" : "Confirmer et générer le dashboard"}
          discardLabel="Recommencer"
          confirmDisabled={cleaning}
        />
      )}
    </div>
  )
}
