import { lazy, Suspense } from "react"
import { HashRouter, Navigate, Route, Routes } from "react-router-dom"
import { AppShell } from "./components/layout/AppShell"

const HomePage = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })))
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })))
const KpisPage = lazy(() => import("./pages/KpisPage").then((m) => ({ default: m.KpisPage })))
const PilotagePage = lazy(() => import("./pages/PilotagePage").then((m) => ({ default: m.PilotagePage })))
const ActionsPage = lazy(() => import("./pages/ActionsPage").then((m) => ({ default: m.ActionsPage })))
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })))

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<div className="px-6 py-8 text-sm text-[var(--color-text-muted)]">Chargement…</div>}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            {/* Anciennes pages « Nouveau rapport » et « Mes rapports » : un seul dashboard désormais. */}
            <Route path="ia" element={<Navigate to="/dashboard" replace />} />
            <Route path="mes-rapports" element={<Navigate to="/dashboard" replace />} />
            <Route path="pilotage" element={<PilotagePage />} />
            <Route path="actions" element={<ActionsPage />} />
            <Route path="kpis" element={<KpisPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
