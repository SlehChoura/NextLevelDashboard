import { useState } from "react"
import { useNavigate } from "react-router-dom"
import * as XLSX from "xlsx"
import { parseWorkbookFile, readSheet, type ParsedSheet } from "../lib/excelImport"
import { buildFromSheet, applyNormalizations, type AmbiguousCell } from "../lib/fixedFormatImport"
import { normalizeAmbiguousCells, describeAiError } from "../lib/aiAnalysis"
import {
  addCriterion,
  addRow,
  removeCriterion,
  removeRow,
  setStatusKey,
  updateCell,
  updateCriterion,
} from "../lib/aiTemplateEdit"
import { useAiSettingsStore, type AiModel } from "../store/aiSettingsStore"
import { useReportStore } from "../store/reportStore"
import { FileDrop } from "../components/common/FileDrop"
import { ReportMetaForm } from "../components/dashboard/ReportMetaForm"
import { AiReviewEditor } from "../components/ai/AiReviewEditor"
import type { DataRow, ReportMeta, ReportTemplate } from "../types"

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
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const [sheet, setSheet] = useState<ParsedSheet | null>(null)
  const [draft, setDraft] = useState<{ template: ReportTemplate; rows: DataRow[] } | null>(null)
  const [ambiguousCells, setAmbiguousCells] = useState<AmbiguousCell[]>([])
  const [cleaning, setCleaning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function runImport(parsed: ParsedSheet) {
    setError(null)
    const { template, rows, ambiguousCells: ambiguous } = buildFromSheet(parsed)
    setDraft({ template, rows })
    setAmbiguousCells(ambiguous)
    if (ambiguous.length > 0 && apiKey) {
      void cleanup(ambiguous, rows)
    }
  }

  async function cleanup(cells: AmbiguousCell[], rows: DataRow[]) {
    setCleaning(true)
    setError(null)
    try {
      const normalizations = await normalizeAmbiguousCells(cells, apiKey, model)
      setDraft((d) => (d ? { ...d, rows: applyNormalizations(rows, normalizations) } : d))
    } catch (e) {
      setError(describeAiError(e))
    } finally {
      setCleaning(false)
    }
  }

  async function handleFile(file: File) {
    setError(null)
    try {
      const wb = await parseWorkbookFile(file)
      setWorkbook(wb)
      const parsed = readSheet(wb, wb.SheetNames[0])
      setSheet(parsed)
      runImport(parsed)
    } catch {
      setError("Impossible de lire ce fichier. Vérifiez qu'il s'agit bien d'un fichier Excel (.xlsx) ou CSV valide.")
    }
  }

  function handleSheetChange(name: string) {
    if (!workbook) return
    const parsed = readSheet(workbook, name)
    setSheet(parsed)
    runImport(parsed)
  }

  function handleConfirm() {
    if (!draft || cleaning) return
    createReport(draft.template, { ...meta, title: meta.title || draft.template.name }, draft.rows)
    navigate("/dashboard")
  }

  function handleDiscard() {
    setDraft(null)
    setWorkbook(null)
    setSheet(null)
    setAmbiguousCells([])
  }

  const unresolvedCount = draft
    ? ambiguousCells.filter((c) => {
        const row = draft.rows.find((r) => r.__id === c.rowId)
        return row && (row[c.criterionKey] === "" || row[c.criterionKey] === undefined)
      }).length
    : 0
  const resolvedCount = ambiguousCells.length - unresolvedCount

  let summary: string | undefined
  if (ambiguousCells.length === 0 && draft) {
    summary = "Fichier importé sans valeur ambiguë : aucun nettoyage par l'IA n'a été nécessaire."
  } else if (cleaning) {
    summary = `Nettoyage de ${ambiguousCells.length} valeur(s) ambiguë(s) par l'IA…`
  } else if (ambiguousCells.length > 0 && !apiKey) {
    summary =
      `${ambiguousCells.length} valeur(s) n'ont pas pu être interprétées automatiquement (texte au lieu ` +
      `d'un nombre attendu, par exemple). Configurez une clé API pour les nettoyer automatiquement, ou ` +
      `corrigez-les manuellement ci-dessous.`
  } else if (ambiguousCells.length > 0) {
    summary =
      `${resolvedCount} valeur(s) ambiguë(s) nettoyée(s) automatiquement par l'IA` +
      (unresolvedCount > 0 ? `, ${unresolvedCount} n'ont pas pu être interprétées — à vérifier manuellement ci-dessous.` : ".")
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

      {draft && error && (
        <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p>
      )}

      {draft && (
        <AiReviewEditor
          template={draft.template}
          rows={draft.rows}
          summary={summary}
          onUpdateCriterion={(key, patch) =>
            setDraft((d) => (d ? { ...d, template: updateCriterion(d.template, key, patch) } : d))
          }
          onRemoveCriterion={(key) =>
            setDraft((d) => {
              if (!d) return d
              const { template, rows: nextRows } = removeCriterion(d.template, d.rows, key)
              return { template, rows: nextRows }
            })
          }
          onAddCriterion={() =>
            setDraft((d) => {
              if (!d) return d
              const { template, rows: nextRows } = addCriterion(d.template, d.rows)
              return { template, rows: nextRows }
            })
          }
          onSetStatusKey={(key) => setDraft((d) => (d ? { ...d, template: setStatusKey(d.template, key) } : d))}
          onUpdateCell={(rowId, key, value) =>
            setDraft((d) => (d ? { ...d, rows: updateCell(d.rows, rowId, key, value) } : d))
          }
          onRemoveRow={(rowId) => setDraft((d) => (d ? { ...d, rows: removeRow(d.rows, rowId) } : d))}
          onAddRow={() => setDraft((d) => (d ? { ...d, rows: addRow(d.template, d.rows) } : d))}
          onConfirm={handleConfirm}
          onDiscard={handleDiscard}
          confirmLabel={cleaning ? "Nettoyage en cours…" : "Confirmer et générer le dashboard"}
          discardLabel="Recommencer"
          confirmDisabled={cleaning}
        />
      )}
    </div>
  )
}
