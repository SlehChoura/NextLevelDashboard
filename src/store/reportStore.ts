import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DataRow, ReportData, ReportMeta, ReportTemplate } from "../types"
import { SEED_REPORT, SEED_VERSION } from "../lib/seedData"
import { keepsLocalData, ownOrLegacy, pickDashboardReport, refreshDashboard } from "../lib/seedMigration"
import { readStoredLastImportAt } from "../lib/browserData"

/**
 * Le dashboard unique des agents IA4CYB. Il n'y a plus de liste de rapports : l'import global
 * (onglet « Agents IA4CYB ») met ce dashboard à jour, et « Modifier les données » le corrige.
 */
interface ReportState {
  report: ReportData
  /** `import` : onglet agents du fichier de suivi ; `edit` : correction via « Modifier les données ». */
  updateData: (template: ReportTemplate, rows: DataRow[], source: "import" | "edit") => void
  updateMeta: (meta: Partial<ReportMeta>) => void
  /** Date du dernier import de l'onglet agents. */
  importedAt: string | null
  /** Dernière correction manuelle depuis la réception des données de référence (voir keepsLocalData). */
  editedAt: string | null
}

export const useReportStore = create<ReportState>()(
  persist(
    (set) => ({
      report: SEED_REPORT,
      updateData: (template, rows, source) =>
        set((state) => {
          const at = new Date().toISOString()
          return {
            report: { ...state.report, template, rows, updatedAt: at },
            ...(source === "import" ? { importedAt: at, editedAt: null } : { editedAt: at }),
          }
        }),
      updateMeta: (meta) =>
        set((state) => ({
          report: { ...state.report, meta: { ...state.report.meta, ...meta }, updatedAt: new Date().toISOString() },
        })),
      importedAt: null,
      editedAt: null,
    }),
    {
      name: "nld-reports",
      version: SEED_VERSION,
      // Versions précédentes : plusieurs rapports ("Mes rapports"). On garde celui que l'import
      // global alimentait (voir pickDashboardReport), puis on lui donne les agents des nouvelles
      // données de référence, sauf si l'onglet agents a été importé depuis leur date ou corrigé à la main.
      // Pas de retour en arrière depuis un onglet resté ouvert sur une ancienne version du site.
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<ReportState>
        if (version > SEED_VERSION) return state as ReportState
        const importedAt = ownOrLegacy(state.importedAt, readStoredLastImportAt())
        const kept = keepsLocalData({ importedAt, editedAt: state.editedAt })
        return {
          report: refreshDashboard(pickDashboardReport(persisted, version, readLegacyDashboardId()), importedAt, state.editedAt),
          importedAt: state.importedAt ?? null,
          editedAt: kept ? (state.editedAt ?? null) : null,
        } as ReportState
      },
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
