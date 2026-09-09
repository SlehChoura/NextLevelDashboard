import { useState } from "react"
import * as XLSX from "xlsx"
import { parseWorkbookFile, readSheet, type ParsedSheet } from "../lib/excelImport"
import { buildFromSheet, applyNormalizations, type AmbiguousCell } from "../lib/fixedFormatImport"
import { normalizeAmbiguousCells, describeAiError } from "../lib/aiAnalysis"
import { useAiSettingsStore } from "../store/aiSettingsStore"
import type { ImportDraft } from "../lib/aiTemplateEdit"
import type { DataRow } from "../types"

/**
 * Importe un fichier Excel/CSV selon le seul format pris en charge par l'app (voir
 * `fixedFormatImport.ts`), lance automatiquement le nettoyage IA des valeurs ambiguës si une clé
 * API est configurée, et expose le brouillon `{template, rows}` résultant pour relecture/édition.
 * Partagé entre la création d'un nouveau rapport et la mise à jour d'un rapport existant.
 */
export function useFileImport() {
  const apiKey = useAiSettingsStore((s) => s.apiKey)
  const model = useAiSettingsStore((s) => s.model)

  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const [sheet, setSheet] = useState<ParsedSheet | null>(null)
  const [draft, setDraft] = useState<ImportDraft | null>(null)
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

  function reset() {
    setDraft(null)
    setWorkbook(null)
    setSheet(null)
    setAmbiguousCells([])
    setError(null)
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

  return {
    workbook,
    sheet,
    draft,
    setDraft,
    cleaning,
    error,
    summary,
    handleFile,
    handleSheetChange,
    reset,
  }
}
