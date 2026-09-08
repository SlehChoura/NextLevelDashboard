import { useState } from "react"
import { useNavigate } from "react-router-dom"
import * as XLSX from "xlsx"
import { parseWorkbookFile, readSheet, type ParsedSheet } from "../lib/excelImport"
import { analyzeSheetWithAI, describeAiError } from "../lib/aiAnalysis"
import { useAiSettingsStore, type AiModel } from "../store/aiSettingsStore"
import { useReportStore } from "../store/reportStore"
import { FileDrop } from "../components/common/FileDrop"
import { ReportMetaForm } from "../components/dashboard/ReportMetaForm"
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

  const [editingKey, setEditingKey] = useState(!apiKey)
  const [keyDraft, setKeyDraft] = useState(apiKey)
  const [meta, setMeta] = useState<ReportMeta>({ title: "", client: "", author: "", period: "" })
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const [sheet, setSheet] = useState<ParsedSheet | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    try {
      const wb = await parseWorkbookFile(file)
      setWorkbook(wb)
      setSheet(readSheet(wb, wb.SheetNames[0]))
    } catch {
      setError("Impossible de lire ce fichier. Vérifiez qu'il s'agit bien d'un fichier Excel (.xlsx) ou CSV valide.")
    }
  }

  async function handleAnalyze() {
    if (!sheet || !apiKey) return
    setLoading(true)
    setError(null)
    try {
      const result = await analyzeSheetWithAI(sheet, apiKey, model)
      createReport(result.template, { ...meta, title: meta.title || result.template.name }, result.rows)
      navigate("/dashboard")
    } catch (e) {
      setError(describeAiError(e))
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-accent)]">Analyse IA</p>
      <h1 className="mt-1 text-xl font-semibold text-[var(--color-text)]">
        Générer un dashboard à partir d'un fichier, analysé par l'IA
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        L'IA détermine elle-même les critères pertinents à partir de votre fichier, sans template
        prédéfini — utile par exemple pour un portefeuille de cas d'usage IA suivi selon des
        critères comme la portabilité, la documentation, la formation ou l'adoption par la
        communauté.
      </p>

      <div className="mt-4 rounded-xl border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/5 p-4 text-sm text-[var(--color-text)]">
        <span className="font-medium">Confidentialité — </span>
        cette fonctionnalité envoie le contenu du fichier (en-têtes et lignes de données) à l'API
        d'Anthropic (Claude) pour analyse. N'importez pas
        de données confidentielles ou personnelles sans vous en assurer au préalable. Votre clé
        API n'est stockée que dans le stockage local de ce navigateur et n'est envoyée qu'à l'API
        Anthropic, jamais ailleurs.
      </div>

      <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Clé API Anthropic</h2>
          {!editingKey && (
            <button
              onClick={() => {
                setKeyDraft(apiKey)
                setEditingKey(true)
              }}
              className="text-xs font-medium text-[var(--color-accent)] underline"
            >
              Modifier
            </button>
          )}
        </div>

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
                disabled={!keyDraft.trim()}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                Enregistrer
              </button>
              {apiKey && (
                <button
                  onClick={() => setEditingKey(false)}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)]"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Clé configurée · Modèle : {MODEL_OPTIONS.find((m) => m.value === model)?.label}
          </p>
        )}
      </div>

      {apiKey && (
        <>
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

          {workbook && sheet && (
            <div className="mt-4 space-y-4">
              {workbook.SheetNames.length > 1 && (
                <label className="block text-sm text-[var(--color-text)]">
                  Feuille à analyser
                  <select
                    value={sheet.activeSheet}
                    onChange={(e) => setSheet(readSheet(workbook, e.target.value))}
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

              <p className="text-xs text-[var(--color-text-muted)]">
                {sheet.rows.length} ligne(s) détectée(s), {sheet.headers.length} colonne(s).
              </p>

              <div className="flex justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-accent)" }}
                >
                  {loading ? "Analyse en cours…" : "Analyser avec l'IA et générer le dashboard"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
