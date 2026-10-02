import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DataRow, ReportData, ReportMeta, ReportTemplate } from "../types"
import { SEED_REPORT, SEED_VERSION } from "../lib/seedData"
import { pickDashboardReport } from "../lib/seedMigration"

/**
 * Le dashboard unique des agents IA4CYB. Il n'y a plus de liste de rapports : l'import global
 * (onglet « Agents IA4CYB ») met ce dashboard à jour, et « Modifier les données » le corrige.
 */
interface ReportState {
  report: ReportData
  updateData: (template: ReportTemplate, rows: DataRow[]) => void
  updateMeta: (meta: Partial<ReportMeta>) => void
}

export const useReportStore = create<ReportState>()(
  persist(
    (set) => ({
      report: SEED_REPORT,
      updateData: (template, rows) =>
        set((state) => ({ report: { ...state.report, template, rows, updatedAt: new Date().toISOString() } })),
      updateMeta: (meta) =>
        set((state) => ({
          report: { ...state.report, meta: { ...state.report.meta, ...meta }, updatedAt: new Date().toISOString() },
        })),
    }),
    {
      name: "nld-reports",
      version: SEED_VERSION,
      // Versions précédentes : plusieurs rapports ("Mes rapports"). On garde celui que l'import
      // global alimentait (voir pickDashboardReport), remis à jour si besoin.
      migrate: (persisted, version) => ({ report: pickDashboardReport(persisted, version, readLegacyDashboardId()) }),
    },
  ),
)

/** Id du rapport alimenté par l'import global, enregistré par les versions précédentes du pilotage. */
function readLegacyDashboardId(): string | null {
  try {
    const raw = localStorage.getItem("nld-pilotage")
    const id = raw ? JSON.parse(raw)?.state?.dashboardReportId : null
    return typeof id === "string" ? id : null
  } catch {
    return null
  }
}
