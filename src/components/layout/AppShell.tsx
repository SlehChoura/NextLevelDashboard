import { Suspense, useState } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import { Bot, FileText, Gauge, Home, ListChecks, Menu, RefreshCw, Target, X, type LucideIcon } from "lucide-react"
import { PageErrorBoundary } from "./PageErrorBoundary"
import { LineConcept } from "../ui/LineConcept"
import { formatDataDate, useLastDataUpdate } from "../../hooks/useLastDataUpdate"
import logotypeWhite from "../../assets/brand/wavestone-logotype-white.svg"

const NAV_ITEMS: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: "/", label: "Accueil", icon: Home, end: true },
  { to: "/dashboard", label: "Agents", icon: Bot },
  { to: "/pilotage", label: "Pilotage", icon: Target },
  { to: "/actions", label: "Actions", icon: ListChecks },
  { to: "/synthese", label: "Synthèse comité", icon: FileText },
  { to: "/kpis", label: "KPI suivis", icon: Gauge },
]

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
    isActive ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/6 hover:text-white"
  }`

/** Navigation de l'application, sur le dégradé bleu signature (barre latérale ou tiroir mobile). */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const lastUpdate = useLastDataUpdate()
  return (
    <div className="relative flex h-full flex-col overflow-hidden" style={{ background: "var(--gradient-brand)" }}>
      <LineConcept className="absolute -bottom-6 left-0 h-56 w-full opacity-60" />

      <div className="relative px-6 pt-7 pb-6">
        <img src={logotypeWhite} alt="Wavestone" className="h-9 w-auto" />
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Gouvernance IA4CYB</p>
      </div>

      <nav className="relative flex-1 space-y-1 px-3" aria-label="Navigation principale">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate} className={navItemClass}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-[var(--color-energy)]" aria-hidden />
                )}
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Mise à jour des données : accès discret, à l'écart de la navigation de consultation. */}
      <div className="relative px-3 pb-6">
        <NavLink
          to="/donnees"
          onClick={onNavigate}
          title="Importer ou télécharger le fichier de suivi"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl border px-3 py-2.5 text-xs transition-colors duration-200 ${
              isActive ? "border-white/40 bg-white/12 text-white" : "border-white/15 text-white/75 hover:bg-white/6 hover:text-white"
            }`
          }
        >
          <RefreshCw className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="leading-tight">
            Données au {formatDataDate(lastUpdate)}
            <span className="block text-white/55">Mettre à jour</span>
          </span>
        </NavLink>
      </div>
    </div>
  )
}

export function AppShell() {
  const { pathname } = useLocation()
  // Le tiroir mobile se ferme au clic sur un lien (onNavigate), sans effet sur le changement de route.
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen lg:pl-64 print:pl-0">
      {/* Barre latérale (écran large) */}
      <aside className="no-print fixed inset-y-0 left-0 z-20 hidden w-64 lg:block">
        <SidebarContent />
      </aside>

      {/* Barre supérieure et tiroir (mobile, tablette) */}
      <header
        className="no-print sticky top-0 z-20 flex items-center justify-between px-4 py-3 lg:hidden"
        style={{ background: "var(--gradient-brand)" }}
      >
        <img src={logotypeWhite} alt="Wavestone" className="h-7 w-auto" />
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="rounded-lg p-2 text-white hover:bg-white/10"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      </header>
      {menuOpen && (
        <div className="no-print fixed inset-0 z-30 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-black/40" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-[var(--shadow-raised)]">
            <SidebarContent onNavigate={() => setMenuOpen(false)} />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="absolute top-5 right-3 rounded-lg p-1.5 text-white/80 hover:bg-white/10"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      )}

      <main className="min-w-0">
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
