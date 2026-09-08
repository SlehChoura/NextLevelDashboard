import { lazy, Suspense } from "react"
import { HashRouter, Route, Routes } from "react-router-dom"
import { AppShell } from "./components/layout/AppShell"

const HomePage = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })))
const TemplatesPage = lazy(() => import("./pages/TemplatesPage").then((m) => ({ default: m.TemplatesPage })))
const NewReportMethodPage = lazy(() =>
  import("./pages/NewReportMethodPage").then((m) => ({ default: m.NewReportMethodPage })),
)
const ImportExcelPage = lazy(() => import("./pages/ImportExcelPage").then((m) => ({ default: m.ImportExcelPage })))
const AiImportPage = lazy(() => import("./pages/AiImportPage").then((m) => ({ default: m.AiImportPage })))
const FormPage = lazy(() => import("./pages/FormPage").then((m) => ({ default: m.FormPage })))
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })))
const ReportsListPage = lazy(() => import("./pages/ReportsListPage").then((m) => ({ default: m.ReportsListPage })))
const ThemePage = lazy(() => import("./pages/ThemePage").then((m) => ({ default: m.ThemePage })))
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })))

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<div className="px-6 py-8 text-sm text-[var(--color-text-muted)]">Chargement…</div>}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="nouveau/:templateId" element={<NewReportMethodPage />} />
            <Route path="nouveau/:templateId/import" element={<ImportExcelPage />} />
            <Route path="nouveau/:templateId/formulaire" element={<FormPage />} />
            <Route path="ia" element={<AiImportPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="mes-rapports" element={<ReportsListPage />} />
            <Route path="theme" element={<ThemePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
