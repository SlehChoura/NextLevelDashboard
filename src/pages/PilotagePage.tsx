import { useMemo, useState } from "react"
import { FileDrop } from "../components/common/FileDrop"
import { usePilotageStore } from "../store/pilotageStore"
import {
  CATEGORY_LABELS,
  computeStatus,
  OWNER_LABELS,
  PILOTAGE_OBJECTIVES,
  progressPercent,
  STATUS_LABELS,
  type PilotageCategory,
  type PilotageObjective,
  type PilotageOwner,
  type PilotageStatus,
} from "../lib/pilotage"
import { downloadPilotageTemplate, parsePilotageFile } from "../lib/pilotageImport"

const CATEGORY_ICONS: Record<PilotageCategory, string> = {
  competences: "🎓",
  agents: "⚙️",
  plateforme: "🛡",
  impact: "🎯",
}

const STATUS_BADGE_CLASS: Record<PilotageStatus, string> = {
  unlocked: "text-[var(--color-success)] bg-[var(--color-success)]/12",
  progress: "text-[var(--color-info)] bg-[var(--color-info)]/12",
  accelerate: "text-[var(--color-warning)] bg-[var(--color-warning)]/12",
  risk: "text-[var(--color-danger)] bg-[var(--color-danger)]/12",
}

const PROGRESS_BAR_COLOR: Record<PilotageStatus, string> = {
  unlocked: "var(--color-success)",
  progress: "var(--color-info)",
  accelerate: "var(--color-warning)",
  risk: "var(--color-danger)",
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })
}

function AchievementCard({
  objective,
  current,
  onSave,
}: {
  objective: PilotageObjective
  current: number
  onSave: (value: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(current))
  const status = computeStatus(objective, current)
  const percent = progressPercent(objective, current)
  const barWidth = Math.max(0, Math.min(100, percent))

  function save() {
    const n = Number(draft.replace(",", "."))
    if (Number.isFinite(n)) onSave(n)
    setEditing(false)
  }

  return (
    <article className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)]/12 text-lg">
            {CATEGORY_ICONS[objective.category]}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
              {CATEGORY_LABELS[objective.category]}
            </p>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">{objective.label}</h3>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap ${STATUS_BADGE_CLASS[status]}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      <p className="mt-3 text-sm text-[var(--color-text-muted)]">{objective.description}</p>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <strong className="block text-2xl font-bold text-[var(--color-text)]">{formatNumber(current)}</strong>
          <span className="text-xs text-[var(--color-text-muted)]">{objective.unit} actuel(le)</span>
        </div>
        <div className="text-right">
          <strong className="block text-2xl font-bold text-[var(--color-text-muted)]">{formatNumber(objective.target)}</strong>
          <span className="text-xs text-[var(--color-text-muted)]">cible</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${barWidth}%`, backgroundColor: PROGRESS_BAR_COLOR[status] }}
          />
        </div>
        <span className="min-w-[42px] text-right text-xs font-bold text-[var(--color-text)]">{percent}%</span>
      </div>

      <div className="mt-3 flex justify-between gap-4 text-xs">
        <span className="text-[var(--color-text-muted)]">Responsable</span>
        <span className="font-medium text-[var(--color-text)]">{OWNER_LABELS[objective.owner]}</span>
      </div>

      <div className="mt-auto pt-4">
        {editing ? (
          <div className="flex items-center gap-2 border-t border-[var(--color-border)] pt-3">
            <input
              type="number"
              step="any"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-sm"
            />
            <button
              onClick={save}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              Enregistrer
            </button>
            <button
              onClick={() => setEditing(false)}
              className="shrink-0 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)]"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setDraft(String(current))
              setEditing(true)
            }}
            className="w-full rounded-lg border border-[var(--color-border)] py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Modifier la valeur actuelle
          </button>
        )}
      </div>
    </article>
  )
}

export function PilotagePage() {
  const values = usePilotageStore((s) => s.values)
  const setValue = usePilotageStore((s) => s.setValue)
  const setValues = usePilotageStore((s) => s.setValues)

  const [categoryFilter, setCategoryFilter] = useState<PilotageCategory | "all">("all")
  const [statusFilter, setStatusFilter] = useState<PilotageStatus | "all">("all")
  const [ownerFilter, setOwnerFilter] = useState<PilotageOwner | "all">("all")
  const [importOpen, setImportOpen] = useState(false)
  const [importMessage, setImportMessage] = useState<string | null>(null)

  const computed = useMemo(
    () =>
      PILOTAGE_OBJECTIVES.map((objective) => {
        const current = values[objective.id] ?? objective.defaultCurrent
        return {
          objective,
          current,
          status: computeStatus(objective, current),
          percent: progressPercent(objective, current),
        }
      }),
    [values],
  )

  const unlockedCount = computed.filter((c) => c.status === "unlocked").length
  const progressCount = computed.filter((c) => c.status === "progress").length
  const riskItems = computed.filter((c) => c.status === "risk")
  const averageProgress = Math.round(
    computed.reduce((sum, c) => sum + Math.min(100, c.percent), 0) / computed.length,
  )

  const nextSuccess = computed
    .filter((c) => c.status === "progress" || c.status === "accelerate")
    .sort((a, b) => b.percent - a.percent)[0]

  const filtered = computed.filter(
    (c) =>
      (categoryFilter === "all" || c.objective.category === categoryFilter) &&
      (statusFilter === "all" || c.status === statusFilter) &&
      (ownerFilter === "all" || c.objective.owner === ownerFilter),
  )

  const unlockedItems = computed.filter((c) => c.status === "unlocked")

  async function handleImportFile(file: File) {
    setImportMessage(null)
    try {
      const { updates, unmatched } = await parsePilotageFile(file)
      const count = Object.keys(updates).length
      if (count > 0) setValues(updates)
      setImportMessage(
        count === 0
          ? "Aucune valeur reconnue dans ce fichier. Utilisez le modèle téléchargé et ne modifiez que la colonne « Valeur actuelle »."
          : `${count} valeur(s) mise(s) à jour.${unmatched.length > 0 ? ` ${unmatched.length} ligne(s) non reconnue(s) ignorée(s).` : ""}`,
      )
      setImportOpen(false)
    } catch {
      setImportMessage("Impossible de lire ce fichier. Vérifiez qu'il s'agit bien d'un export du modèle (.xlsx).")
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
        Pilotage IA4CYB
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-[var(--color-text)]">Vos succès à atteindre</h1>
      <p className="mt-3 max-w-2xl text-[var(--color-text-muted)]">
        Chaque objectif du pilotage est présenté comme un résultat concret à débloquer, relié aux
        KPI suivis dans la page « KPI ». Ajustez l'avancement au fil de l'eau, manuellement ou par
        import d'un fichier de suivi.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            Succès débloqués
          </p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-success)]">{unlockedCount}</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">objectifs atteints</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            En progression
          </p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-info)]">{progressCount}</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">trajectoires favorables</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            À sécuriser
          </p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-danger)]">{riskItems.length}</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">nécessitent une décision</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            Avancement global
          </p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-accent)]">{averageProgress}%</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">progression moyenne</p>
        </div>
      </div>

      {nextSuccess && (
        <div className="mt-8 flex flex-col gap-4 rounded-xl border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/5 p-5 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl text-white" style={{ backgroundColor: "var(--color-accent)" }}>
            🏆
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-accent)]">
              Prochain succès à débloquer
            </p>
            <h3 className="text-base font-semibold text-[var(--color-text)]">{nextSuccess.objective.label}</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              {formatNumber(nextSuccess.current)} / {formatNumber(nextSuccess.objective.target)} {nextSuccess.objective.unit}
            </p>
          </div>
          <div className="text-right">
            <strong className="block text-2xl font-bold text-[var(--color-accent)]">{nextSuccess.percent}%</strong>
            <span className="text-xs text-[var(--color-text-muted)]">de la cible</span>
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Objectifs du pilotage</h2>
        <div className="flex gap-2">
          <button
            onClick={() => downloadPilotageTemplate(values)}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)]"
          >
            Télécharger le modèle
          </button>
          <button
            onClick={() => setImportOpen((v) => !v)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Importer un fichier
          </button>
        </div>
      </div>

      {importOpen && (
        <div className="mt-3 space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            Téléchargez d'abord le modèle, complétez la colonne « Valeur actuelle », puis
            réimportez-le ici pour mettre à jour l'avancement.
          </p>
          <FileDrop onFile={handleImportFile} accept=".xlsx,.xls,.csv" hint="Formats acceptés : .xlsx, .xls, .csv" />
        </div>
      )}

      {importMessage && (
        <p className="mt-3 text-sm text-[var(--color-text)]">{importMessage}</p>
      )}

      <div className="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <label className="min-w-[160px] flex-1 text-xs">
          <span className="mb-1 block font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Catégorie
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as PilotageCategory | "all")}
            className="w-full rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm"
          >
            <option value="all">Toutes les catégories</option>
            {(Object.keys(CATEGORY_LABELS) as PilotageCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[160px] flex-1 text-xs">
          <span className="mb-1 block font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Statut
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PilotageStatus | "all")}
            className="w-full rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm"
          >
            <option value="all">Tous les statuts</option>
            {(Object.keys(STATUS_LABELS) as PilotageStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[160px] flex-1 text-xs">
          <span className="mb-1 block font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Responsable
          </span>
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value as PilotageOwner | "all")}
            className="w-full rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm"
          >
            <option value="all">Tous les responsables</option>
            {(Object.keys(OWNER_LABELS) as PilotageOwner[]).map((o) => (
              <option key={o} value={o}>
                {OWNER_LABELS[o]}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => {
            setCategoryFilter("all")
            setStatusFilter("all")
            setOwnerFilter("all")
          }}
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-text)]"
        >
          Réinitialiser
        </button>
      </div>

      <p className="mt-3 text-xs text-[var(--color-text-muted)]">
        <strong className="text-[var(--color-text)]">{filtered.length}</strong> objectif(s) affiché(s)
      </p>

      {filtered.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-[var(--color-border)] p-10 text-center text-sm text-[var(--color-text-muted)]">
          Aucun objectif ne correspond aux filtres sélectionnés.
        </div>
      ) : (
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {filtered.map(({ objective, current }) => (
            <AchievementCard
              key={objective.id}
              objective={objective}
              current={current}
              onSave={(value) => setValue(objective.id, value)}
            />
          ))}
        </div>
      )}

      {unlockedItems.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Succès débloqués</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {unlockedItems.map(({ objective, current }) => (
              <div
                key={objective.id}
                className="rounded-xl border border-[var(--color-success)]/25 bg-[var(--color-success)]/8 p-4"
              >
                <strong className="block text-sm text-[var(--color-text)]">✓ {objective.label}</strong>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {formatNumber(current)} / {formatNumber(objective.target)} {objective.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {riskItems.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Objectifs à sécuriser</h2>
          <div className="mt-4 space-y-3">
            {riskItems.map(({ objective, current }) => (
              <div
                key={objective.id}
                className="rounded-xl border border-[var(--color-danger)]/25 bg-[var(--color-danger)]/8 p-5"
              >
                <h3 className="text-sm font-semibold text-[var(--color-text)]">
                  {objective.label} — {formatNumber(current)} {objective.unit} (cible : {formatNumber(objective.target)} {objective.unit})
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Écart à analyser avec {OWNER_LABELS[objective.owner]} avant que la trajectoire ne se dégrade davantage.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
