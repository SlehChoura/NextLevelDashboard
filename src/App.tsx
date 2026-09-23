import { lazy, Suspense } from "react"
import { HashRouter, Route, Routes } from "react-router-dom"
import { AppShell } from "./components/layout/AppShell"

const HomePage = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })))
const AiImportPage = lazy(() => import("./pages/AiImportPage").then((m) => ({ default: m.AiImportPage })))
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })))
const ReportsListPage = lazy(() => import("./pages/ReportsListPage").then((m) => ({ default: m.ReportsListPage })))
const KpisPage = lazy(() => import("./pages/KpisPage").then((m) => ({ default: m.KpisPage })))
const PilotagePage = lazy(() => import("./pages/PilotagePage").then((m) => ({ default: m.PilotagePage })))
const ThemePage = lazy(() => import("./pages/ThemePage").then((m) => ({ default: m.ThemePage })))
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })))

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<div className="px-6 py-8 text-sm text-[var(--color-text-muted)]">Chargement…</div>}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="ia" element={<AiImportPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="mes-rapports" element={<ReportsListPage />} />
            <Route path="pilotage" element={<PilotagePage />} />
            <Route path="kpis" element={<KpisPage />} />
            <Route path="theme" element={<ThemePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
