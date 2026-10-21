import { usePilotageStore } from "../store/pilotageStore"
import { useReportStore } from "../store/reportStore"
import { SEED_REFERENCE_AT } from "../lib/seedData"

/**
 * Date des données affichées : le dernier import dans ce navigateur, à défaut le dernier fichier de
 * suivi intégré à l'application (ou une correction manuelle du dashboard, si plus récente).
 */
export function useLastDataUpdate(): Date | null {
  const lastImportAt = usePilotageStore((s) => s.lastImportAt)
  const reportUpdatedAt = useReportStore((s) => s.report.updatedAt)
  const fallback = [reportUpdatedAt ?? "", SEED_REFERENCE_AT].sort().at(-1)!
  const date = new Date(lastImportAt ?? fallback)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDataDate(date: Date | null): string {
  return date ? date.toLocaleDateString("fr-FR") : "—"
}
