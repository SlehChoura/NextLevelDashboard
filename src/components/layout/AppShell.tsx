import { NavLink, Outlet } from "react-router-dom"
import { Logo } from "../common/Logo"

const NAV_ITEMS = [
  { to: "/", label: "Accueil", end: true },
  { to: "/templates", label: "Templates" },
  { to: "/mes-rapports", label: "Mes rapports" },
  { to: "/theme", label: "Charte graphique" },
]

export function AppShell() {
  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <NavLink to="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-sm font-semibold text-[var(--color-text)]">NextLevelDashboard</span>
          </NavLink>
          <nav className="flex gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
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
