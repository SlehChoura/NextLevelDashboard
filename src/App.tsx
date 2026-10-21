import { lazy, Suspense, useEffect } from "react"
import { HashRouter, Navigate, Route, Routes } from "react-router-dom"
import { AppShell } from "./components/layout/AppShell"

const loaders = {
  home: () => import("./pages/HomePage").then((m) => ({ default: m.HomePage })),
  dashboard: () => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
  synthese: () => import("./pages/SynthesePage").then((m) => ({ default: m.SynthesePage })),
  kpis: () => import("./pages/KpisPage").then((m) => ({ default: m.KpisPage })),
  pilotage: () => import("./pages/PilotagePage").then((m) => ({ default: m.PilotagePage })),
  actions: () => import("./pages/ActionsPage").then((m) => ({ default: m.ActionsPage })),
  donnees: () => import("./pages/DonneesPage").then((m) => ({ default: m.DonneesPage })),
  notFound: () => import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
}

const HomePage = lazy(loaders.home)
const DashboardPage = lazy(loaders.dashboard)
const SynthesePage = lazy(loaders.synthese)
const KpisPage = lazy(loaders.kpis)
const PilotagePage = lazy(loaders.pilotage)
const ActionsPage = lazy(loaders.actions)
const DonneesPage = lazy(loaders.donnees)
const NotFoundPage = lazy(loaders.notFound)

/**
 * Toutes les pages sont chargées en arrière-plan dès l'ouverture du site : un onglet resté ouvert
 * pendant une mise en ligne les a déjà en mémoire, et ne réclame plus de fichiers qui n'existent plus.
 */
function usePrefetchPages() {
  useEffect(() => {
    const prefetch = () => Object.values(loaders).forEach((load) => load().catch(() => undefined))
    const id = window.setTimeout(prefetch, 1500)
    return () => window.clearTimeout(id)
  }, [])
}

export default function App() {
  usePrefetchPages()
  return (
    <HashRouter>
      <Suspense fallback={<div className="px-6 py-8 text-sm text-[var(--color-text-muted)]">Chargement…</div>}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="synthese" element={<SynthesePage />} />
            {/* Anciennes pages « Nouveau rapport » et « Mes rapports » : un seul dashboard désormais. */}
            <Route path="ia" element={<Navigate to="/dashboard" replace />} />
            <Route path="mes-rapports" element={<Navigate to="/dashboard" replace />} />
            <Route path="pilotage" element={<PilotagePage />} />
            <Route path="actions" element={<ActionsPage />} />
            <Route path="kpis" element={<KpisPage />} />
            <Route path="donnees" element={<DonneesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
