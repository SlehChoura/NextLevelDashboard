import { useMemo, useState } from "react"
import { FileDrop } from "../components/common/FileDrop"
import { usePilotageStore } from "../store/pilotageStore"
import { useActionsStore } from "../store/actionsStore"
import { useCombinedImport } from "../hooks/useCombinedImport"
import {
  CATEGORY_LABELS,
  computeStatus,
  OWNER_LABELS,
  PILOTAGE_OBJECTIVES,
  progressPercent,
  visibleStatus,
  VISIBLE_STATUS_LABELS,
  type PilotageCategory,
  type PilotageObjective,
  type PilotageOwner,
  type VisiblePilotageStatus,
} from "../lib/pilotage"
import { downloadCombinedTemplate } from "../lib/combinedImport"

const CATEGORY_ICONS: Record<PilotageCategory, string> = {
  competences: "🎓",
  agents: "⚙️",
  plateforme: "🛡",
}

const STATUS_BADGE_CLASS: Record<VisiblePilotageStatus, string> = {
  unlocked: "text-[var(--color-success)] bg-[var(--color-success)]/12",
  accelerate: "text-[var(--color-warning)] bg-[var(--color-warning)]/12",
}

const PROGRESS_BAR_COLOR: Record<VisiblePilotageStatus, string> = {
  unlocked: "var(--color-success)",
  accelerate: "var(--color-warning)",
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })
}

function AchievementCard({
  objective,
  current,
  target,
  onSave,
}: {
  objective: PilotageObjective
  current: number
  target: number
  onSave: (current: number, target: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [currentDraft, setCurrentDraft] = useState(String(current))
  const [targetDraft, setTargetDraft] = useState(String(target))
  const status = visibleStatus(computeStatus(objective, current, target))
  const percent = progressPercent(objective, current, target)
  const barWidth = Math.max(0, Math.min(100, percent))

  function save() {
    const nCurrent = Number(currentDraft.replace(",", "."))
    const nTarget = Number(targetDraft.replace(",", "."))
    if (Number.isFinite(nCurrent) && Number.isFinite(nTarget)) onSave(nCurrent, nTarget)
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
          {VISIBLE_STATUS_LABELS[status]}
        </span>
      </div>

      <p className="mt-3 text-sm text-[var(--color-text-muted)]">{objective.description}</p>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <strong className="block text-2xl font-bold text-[var(--color-text)]">{formatNumber(current)}</strong>
          <span className="text-xs text-[var(--color-text-muted)]">{objective.unit} actuel(le)</span>
        </div>
        <div className="text-right">
          <strong className="block text-2xl font-bold text-[var(--color-text-muted)]">{formatNumber(target)}</strong>
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
          <div className="space-y-2 border-t border-[var(--color-border)] pt-3">
            <div className="flex items-center gap-2">
              <label className="flex-1 text-xs text-[var(--color-text-muted)]">
                Valeur actuelle
                <input
                  type="number"
                  step="any"
                  value={currentDraft}
                  onChange={(e) => setCurrentDraft(e.target.value)}
                  autoFocus
                  className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-sm text-[var(--color-text)]"
                />
              </label>
              <label className="flex-1 text-xs text-[var(--color-text-muted)]">
                Cible
                <input
                  type="number"
                  step="any"
                  value={targetDraft}
                  onChange={(e) => setTargetDraft(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-sm text-[var(--color-text)]"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={save}
                className="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                Enregistrer
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)]"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setCurrentDraft(String(current))
              setTargetDraft(String(target))
              setEditing(true)
            }}
            className="w-full rounded-lg border border-[var(--color-border)] py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Modifier la valeur ou la cible
          </button>
        )}
      </div>
    </article>
  )
}

export function PilotagePage() {
  const values = usePilotageStore((s) => s.values)
  const targets = usePilotageStore((s) => s.targets)
  const setValue = usePilotageStore((s) => s.setValue)
  const setTarget = usePilotageStore((s) => s.setTarget)

  const actions = useActionsStore((s) => s.actions)

  const { importMessage, handleImportFile: applyImportFile } = useCombinedImport()

  const [categoryFilter, setCategoryFilter] = useState<PilotageCategory | "all">("all")
  const [statusFilter, setStatusFilter] = useState<VisiblePilotageStatus | "all">("all")
  const [ownerFilter, setOwnerFilter] = useState<PilotageOwner | "all">("all")
  const [importOpen, setImportOpen] = useState(false)

  const computed = useMemo(
    () =>
      PILOTAGE_OBJECTIVES.map((objective) => {
        const current = values[objective.id] ?? objective.defaultCurrent
        const target = targets[objective.id] ?? objective.target
        return {
          objective,
          current,
          target,
          status: visibleStatus(computeStatus(objective, current, target)),
          percent: progressPercent(objective, current, target),
        }
      }),
    [values, targets],
  )

  const unlockedCount = computed.filter((c) => c.status === "unlocked").length
  const accelerateCount = computed.filter((c) => c.status === "accelerate").length
  const averageProgress = Math.round(
    computed.reduce((sum, c) => sum + Math.min(100, c.percent), 0) / computed.length,
  )

  const nextSuccess = computed
    .filter((c) => c.status === "accelerate")
    .sort((a, b) => b.percent - a.percent)[0]

  const filtered = computed.filter(
    (c) =>
      (categoryFilter === "all" || c.objective.category === categoryFilter) &&
      (statusFilter === "all" || c.status === statusFilter) &&
      (ownerFilter === "all" || c.objective.owner === ownerFilter),
  )

  const unlockedItems = computed.filter((c) => c.status === "unlocked")

  async function handleImportFile(file: File) {
    const ok = await applyImportFile(file)
    if (ok) setImportOpen(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
        Pilotage IA4CYB
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-[var(--color-text)]">Vos succès à atteindre</h1>
      <p className="mt-3 max-w-2xl text-[var(--color-text-muted)]">
        Chaque objectif du pilotage est présenté comme un résultat concret à débloquer, relié aux
        KPI suivis dans la page « KPI ». Ajustez l'avancement et les cibles au fil de l'eau,
        manuellement ou par import d'un fichier de suivi.
      </p>

      <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text)]">
              Import global — Pilotage, Actions et Dashboard
            </h2>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Un seul fichier Excel à 3 onglets (« Suivi pilotage », « Actions », « Agents IA4CYB »)
              pour mettre à jour les objectifs, les actions et générer le dashboard des agents en un
              seul import.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => downloadCombinedTemplate(values, targets, actions)}
              className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium whitespace-nowrap text-[var(--color-text)]"
            >
              Télécharger le modèle complet
            </button>
            <button
              onClick={() => setImportOpen((v) => !v)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              Importer le fichier complet
            </button>
          </div>
        </div>

        {importOpen && (
          <div className="mt-3 space-y-2 border-t border-[var(--color-border)] pt-3">
            <p className="text-xs text-[var(--color-text-muted)]">
              Téléchargez d'abord le modèle, complétez un ou plusieurs onglets, puis réimportez-le
              ici. Un onglet absent du fichier est simplement ignoré.
            </p>
            <FileDrop onFile={handleImportFile} accept=".xlsx,.xls,.csv" hint="Formats acceptés : .xlsx, .xls, .csv" />
          </div>
        )}

        {importMessage && <p className="mt-3 text-sm text-[var(--color-text)]">{importMessage}</p>}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            Succès débloqués
          </p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-success)]">{unlockedCount}</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">objectifs atteints</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            À accélérer
          </p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-warning)]">{accelerateCount}</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">objectifs restants</p>
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
              {formatNumber(nextSuccess.current)} / {formatNumber(nextSuccess.target)} {nextSuccess.objective.unit}
            </p>
          </div>
          <div className="text-right">
            <strong className="block text-2xl font-bold text-[var(--color-accent)]">{nextSuccess.percent}%</strong>
            <span className="text-xs text-[var(--color-text-muted)]">de la cible</span>
          </div>
        </div>
      )}

      <h2 className="mt-10 text-lg font-semibold text-[var(--color-text)]">Objectifs du pilotage</h2>

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
            onChange={(e) => setStatusFilter(e.target.value as VisiblePilotageStatus | "all")}
            className="w-full rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm"
          >
            <option value="all">Tous les statuts</option>
            {(Object.keys(VISIBLE_STATUS_LABELS) as VisiblePilotageStatus[]).map((s) => (
              <option key={s} value={s}>
                {VISIBLE_STATUS_LABELS[s]}
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
          {filtered.map(({ objective, current, target }) => (
            <AchievementCard
              key={objective.id}
              objective={objective}
              current={current}
              target={target}
              onSave={(newCurrent, newTarget) => {
                setValue(objective.id, newCurrent)
                setTarget(objective.id, newTarget)
              }}
            />
          ))}
        </div>
      )}

      {unlockedItems.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Succès débloqués</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {unlockedItems.map(({ objective, current, target }) => (
              <div
                key={objective.id}
                className="rounded-xl border border-[var(--color-success)]/25 bg-[var(--color-success)]/8 p-4"
              >
                <strong className="block text-sm text-[var(--color-text)]">✓ {objective.label}</strong>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {formatNumber(current)} / {formatNumber(target)} {objective.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
