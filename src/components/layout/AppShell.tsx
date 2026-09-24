import { NavLink, Outlet } from "react-router-dom"
import { Logo } from "../common/Logo"

const NAV_ITEMS = [
  { to: "/", label: "Accueil", end: true },
  { to: "/ia", label: "Nouveau rapport" },
  { to: "/mes-rapports", label: "Mes rapports" },
  { to: "/pilotage", label: "Pilotage" },
  { to: "/actions", label: "Actions" },
  { to: "/kpis", label: "KPI" },
]

export function AppShell() {
  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-2 gap-y-1 px-6 py-3">
          <NavLink to="/" className="flex shrink-0 items-center gap-2">
            <Logo />
            <span className="text-sm font-semibold text-[var(--color-text)]">NextLevelDashboard</span>
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
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
