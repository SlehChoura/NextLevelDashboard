import { Suspense } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import { PageErrorBoundary } from "./PageErrorBoundary"
import { formatDataDate, useLastDataUpdate } from "../../hooks/useLastDataUpdate"
import { Logo } from "../common/Logo"

const NAV_ITEMS = [
  { to: "/", label: "Accueil", end: true },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/synthese", label: "Synthèse" },
  { to: "/pilotage", label: "Pilotage" },
  { to: "/actions", label: "Actions" },
  { to: "/kpis", label: "KPI" },
]

export function AppShell() {
  const { pathname } = useLocation()
  const lastUpdate = useLastDataUpdate()
  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-2 gap-y-1 px-6 py-3.5">
          <NavLink to="/" className="flex shrink-0 items-center gap-2.5">
            <Logo size={32} />
            <span className="text-sm font-semibold tracking-tight text-[var(--color-text)]">
              Dashboard IA4CYB Agents
            </span>
          </NavLink>
          <nav className="flex flex-wrap justify-end gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition ${
                    isActive
                      ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {/* Mise à jour des données : accès discret, à l'écart de la navigation de consultation. */}
            <NavLink
              to="/donnees"
              title={`Données au ${formatDataDate(lastUpdate)} — mettre à jour`}
              aria-label={`Mise à jour des données (données au ${formatDataDate(lastUpdate)})`}
              className={({ isActive }) =>
                `ml-1 flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs whitespace-nowrap transition ${
                  isActive
                    ? "border-[var(--color-accent)]/40 text-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`
              }
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden>
                <path
                  d="M16 10a6 6 0 1 1-1.76-4.24M16 4v3.5h-3.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Données {formatDataDate(lastUpdate).slice(0, 5)}
            </NavLink>
          </nav>
        </div>
      </header>
      <main>
        {/* Une page en erreur n'emporte ni le menu ni les autres pages (nouvelle page = nouvel essai). */}
        <PageErrorBoundary key={pathname}>
          <Suspense fallback={<div className="px-6 py-8 text-sm text-[var(--color-text-muted)]">Chargement…</div>}>
            <Outlet />
          </Suspense>
        </PageErrorBoundary>
      </main>
    </div>
  )
}
