import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DataRow, ReportData, ReportMeta, ReportTemplate } from "../types"
import { makeId } from "../lib/id"

interface ReportState {
  reports: ReportData[]
  activeReportId: string | null
  activeReport: () => ReportData | undefined
  createReport: (templateId: string, meta: Partial<ReportMeta>) => string
  createReportFromAi: (template: ReportTemplate, meta: Partial<ReportMeta>, rows: DataRow[]) => string
  setRows: (reportId: string, rows: DataRow[]) => void
  updateMeta: (reportId: string, meta: Partial<ReportMeta>) => void
  deleteReport: (reportId: string) => void
  setActiveReport: (reportId: string | null) => void
}

const defaultMeta: ReportMeta = {
  title: "",
  client: "",
  author: "",
  period: "",
}

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: [],
      activeReportId: null,
      activeReport: () => get().reports.find((r) => r.id === get().activeReportId),
      createReport: (templateId, meta) => {
        const id = makeId()
        const now = new Date().toISOString()
        const report: ReportData = {
          id,
          templateId,
          meta: { ...defaultMeta, ...meta },
          rows: [],
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ reports: [...state.reports, report], activeReportId: id }))
        return id
      },
      createReportFromAi: (template, meta, rows) => {
        const id = makeId()
        const now = new Date().toISOString()
        const report: ReportData = {
          id,
          templateId: template.id,
          customTemplate: template,
          meta: { ...defaultMeta, ...meta },
          rows,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ reports: [...state.reports, report], activeReportId: id }))
        return id
      },
      setRows: (reportId, rows) =>
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId ? { ...r, rows, updatedAt: new Date().toISOString() } : r,
          ),
        })),
      updateMeta: (reportId, meta) =>
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId
              ? { ...r, meta: { ...r.meta, ...meta }, updatedAt: new Date().toISOString() }
              : r,
          ),
        })),
      deleteReport: (reportId) =>
        set((state) => ({
          reports: state.reports.filter((r) => r.id !== reportId),
          activeReportId: state.activeReportId === reportId ? null : state.activeReportId,
        })),
      setActiveReport: (reportId) => set({ activeReportId: reportId }),
    }),
    { name: "nld-reports" },
  ),
)
