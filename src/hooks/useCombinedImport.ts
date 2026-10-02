import { useState } from "react"
import { usePilotageStore } from "../store/pilotageStore"
import { useActionsStore } from "../store/actionsStore"
import { useReportStore } from "../store/reportStore"
import { parseCombinedFile } from "../lib/combinedImport"

/**
 * Applique un import du fichier combiné (pilotage + actions + dashboard) aux stores concernés.
 * Seul point d'entrée de mise à jour des données (encart « Mettre à jour les données »).
 */
export function useCombinedImport() {
  const setValues = usePilotageStore((s) => s.setValues)
  const setTargets = usePilotageStore((s) => s.setTargets)
  const setLastImportAt = usePilotageStore((s) => s.setLastImportAt)

  const actions = useActionsStore((s) => s.actions)
  const replaceActions = useActionsStore((s) => s.replaceActions)

  const updateReportData = useReportStore((s) => s.updateData)

  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [importWarnings, setImportWarnings] = useState<string[]>([])

  async function handleImportFile(file: File): Promise<boolean> {
    setImportMessage(null)
    setImportWarnings([])
    try {
      const result = await parseCombinedFile(file, actions)
      const parts: string[] = []

      if (result.pilotage) {
        const { valueUpdates, targetUpdates, unmatched } = result.pilotage
        const touched = new Set([...Object.keys(valueUpdates), ...Object.keys(targetUpdates)])
        if (Object.keys(valueUpdates).length > 0) setValues(valueUpdates)
        if (Object.keys(targetUpdates).length > 0) setTargets(targetUpdates)
        parts.push(
          `Pilotage : ${touched.size} objectif(s) mis à jour` +
            (unmatched.length > 0 ? ` (${unmatched.length} ligne(s) ignorée(s))` : "") +
            ".",
        )
      }

      if (result.actions) {
        const { actions: imported, created, updated, removed, unmatchedObjectives, skippedNoTitle } = result.actions
        replaceActions(imported)
        parts.push(
          `Actions : ${imported.length} au total — ${created} créée(s), ${updated} mise(s) à jour` +
            (removed > 0 ? `, ${removed} retirée(s) car absente(s) du fichier` : "") +
            (skippedNoTitle > 0 ? `, ${skippedNoTitle} ligne(s) sans titre ignorée(s)` : "") +
            (unmatchedObjectives.length > 0 ? `, ${unmatchedObjectives.length} objectif(s) non reconnu(s)` : "") +
            ".",
        )
      }

      if (result.dashboard) {
        const { template, rows } = result.dashboard
        updateReportData(template, rows)
        parts.push(`Dashboard : ${rows.length} agent(s) mis à jour.`)
      }

      if (parts.length > 0) setLastImportAt(new Date().toISOString())
      setImportWarnings(result.warnings)
      setImportMessage(
        parts.length > 0
          ? parts.join(" ")
          : "Aucun onglet reconnu dans ce fichier. Utilisez le modèle téléchargé (onglets « Suivi pilotage », « Actions », « Agents IA4CYB »).",
      )
      return true
    } catch {
      setImportMessage("Impossible de lire ce fichier. Vérifiez qu'il s'agit bien d'un export du modèle (.xlsx).")
      return false
    }
  }

  return { importMessage, importWarnings, handleImportFile }
}
