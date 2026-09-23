import { useState } from "react"
import { usePilotageStore } from "../store/pilotageStore"
import { useActionsStore } from "../store/actionsStore"
import { useReportStore } from "../store/reportStore"
import { parseCombinedFile } from "../lib/combinedImport"

/**
 * Applique un import du fichier combiné (pilotage + actions + dashboard) aux stores concernés.
 * Partagé entre la page d'accueil et la page Pilotage, seuls points d'entrée de cet import.
 */
export function useCombinedImport() {
  const setValues = usePilotageStore((s) => s.setValues)
  const setTargets = usePilotageStore((s) => s.setTargets)
  const dashboardReportId = usePilotageStore((s) => s.dashboardReportId)
  const setDashboardReportId = usePilotageStore((s) => s.setDashboardReportId)

  const actions = useActionsStore((s) => s.actions)
  const mergeActions = useActionsStore((s) => s.mergeActions)

  const reports = useReportStore((s) => s.reports)
  const createReport = useReportStore((s) => s.createReport)
  const updateReportData = useReportStore((s) => s.updateData)
  const setActiveReport = useReportStore((s) => s.setActiveReport)

  const [importMessage, setImportMessage] = useState<string | null>(null)

  async function handleImportFile(file: File): Promise<boolean> {
    setImportMessage(null)
    try {
      const existingActionIds = new Set(actions.map((a) => a.id))
      const result = await parseCombinedFile(file, existingActionIds)
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
        const { actions: imported, created, updated, unmatchedObjectives, skippedNoTitle } = result.actions
        if (imported.length > 0) mergeActions(imported)
        parts.push(
          `Actions : ${created} créée(s), ${updated} mise(s) à jour` +
            (skippedNoTitle > 0 ? `, ${skippedNoTitle} ligne(s) sans titre ignorée(s)` : "") +
            (unmatchedObjectives.length > 0 ? `, ${unmatchedObjectives.length} objectif(s) non reconnu(s)` : "") +
            ".",
        )
      }

      if (result.dashboard) {
        const { template, rows } = result.dashboard
        const stillExists = dashboardReportId && reports.some((r) => r.id === dashboardReportId)
        if (stillExists && dashboardReportId) {
          updateReportData(dashboardReportId, template, rows)
          setActiveReport(dashboardReportId)
        } else {
          const newId = createReport(template, { title: "Agents IA4CYB (import global)" }, rows)
          setDashboardReportId(newId)
        }
        parts.push(`Dashboard : ${rows.length} agent(s) importé(s), rapport « Agents IA4CYB » ${stillExists ? "mis à jour" : "généré"}.`)
      }

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

  return { importMessage, handleImportFile }
}
