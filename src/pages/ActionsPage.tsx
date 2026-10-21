import { Fragment, useMemo, useState } from "react"
import { PageHeader } from "../components/ui/PageHeader"
import { OwnerAvatar } from "../components/ui/OwnerAvatar"
import { Plus, X } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import { Badge } from "../components/common/Badge"
import { useActionsStore } from "../store/actionsStore"
import { ACTION_STATUS_LABELS, isLate, todayIso, type ActionItem, type ActionStatus } from "../lib/actions"
import { CATEGORY_LABELS, PILOTAGE_OBJECTIVES } from "../lib/pilotage"

const STATUS_TEXT_CLASS: Record<ActionStatus, string> = {
  todo: "text-[var(--color-text-muted)]",
  in_progress: "text-[var(--color-info)]",
  done: "text-[var(--color-success)]",
}

const objectiveById = new Map(PILOTAGE_OBJECTIVES.map((o) => [o.id, o]))

const emptyForm = {
  title: "",
  owner: "",
  objectiveId: "",
  status: "todo" as ActionStatus,
  dueDate: "",
}

export function ActionsPage() {
  const actions = useActionsStore((s) => s.actions)
  const addAction = useActionsStore((s) => s.addAction)
  const updateAction = useActionsStore((s) => s.updateAction)
  const deleteAction = useActionsStore((s) => s.deleteAction)

  const [form, setForm] = useState(emptyForm)
  const [objectiveFilter, setObjectiveFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<ActionStatus | "all">("all")
  const [search, setSearch] = useState("")
  const [searchParams] = useSearchParams()
  const [lateOnly, setLateOnly] = useState(searchParams.get("filtre") === "retard")
  const [groupByOwner, setGroupByOwner] = useState(false)
  const today = todayIso()
  const lateCount = actions.filter((a) => isLate(a, today)).length
  const counts = {
    todo: actions.filter((a) => a.status === "todo").length,
    in_progress: actions.filter((a) => a.status === "in_progress").length,
    done: actions.filter((a) => a.status === "done").length,
  }
  const [formOpen, setFormOpen] = useState(false)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return actions.filter((a) => {
      const objectiveMatches = objectiveFilter === "all" || a.objectiveId === objectiveFilter
      const statusMatches = statusFilter === "all" || a.status === statusFilter
      const searchMatches =
        query === "" || a.title.toLowerCase().includes(query) || a.owner.toLowerCase().includes(query)
      const lateMatches = !lateOnly || isLate(a, today)
      return objectiveMatches && statusMatches && searchMatches && lateMatches
    })
  }, [actions, objectiveFilter, statusFilter, search, lateOnly, today])

  // Regroupement par porteur : un bloc par personne, avec son nombre d'actions et de retards.
  const groups = useMemo(() => {
    if (!groupByOwner) return [{ owner: null as string | null, items: filtered }]
    const byOwner = new Map<string, ActionItem[]>()
    for (const a of filtered) byOwner.set(a.owner || "Sans porteur", [...(byOwner.get(a.owner || "Sans porteur") ?? []), a])
    return Array.from(byOwner, ([owner, items]) => ({ owner, items })).sort((a, b) => a.owner.localeCompare(b.owner, "fr"))
  }, [filtered, groupByOwner])

  function submitForm(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.owner.trim()) return
    addAction({ ...form, title: form.title.trim(), owner: form.owner.trim() })
    setForm(emptyForm)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <PageHeader
        title="Actions"
        description="Suivez les actions qui font avancer les objectifs du pilotage, avec un porteur identifié pour chacune."
        actions={
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--color-accent-dark)]"
          >
            {formOpen ? <X className="h-3.5 w-3.5" aria-hidden /> : <Plus className="h-3.5 w-3.5" aria-hidden />}
            {formOpen ? "Fermer" : "Nouvelle action"}
          </button>
        }
      />

      {/* Compteurs par statut, cliquables pour filtrer la liste. */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {(
          [
            { key: "todo", label: "À faire", count: counts.todo, color: "var(--color-text-muted)", active: statusFilter === "todo" && !lateOnly, onClick: () => { setLateOnly(false); setStatusFilter(statusFilter === "todo" ? "all" : "todo") } },
            { key: "in_progress", label: "En cours", count: counts.in_progress, color: "var(--color-info)", active: statusFilter === "in_progress" && !lateOnly, onClick: () => { setLateOnly(false); setStatusFilter(statusFilter === "in_progress" ? "all" : "in_progress") } },
            { key: "done", label: "Terminées", count: counts.done, color: "var(--color-success)", active: statusFilter === "done" && !lateOnly, onClick: () => { setLateOnly(false); setStatusFilter(statusFilter === "done" ? "all" : "done") } },
            { key: "late", label: "En retard", count: lateCount, color: "var(--color-danger)", active: lateOnly, onClick: () => { setStatusFilter("all"); setLateOnly(!lateOnly) } },
          ] as const
        ).map((tile) => (
          <button
            key={tile.key}
            type="button"
            onClick={tile.onClick}
            aria-pressed={tile.active}
            className={`rounded-[var(--radius-card)] border bg-[var(--color-surface)] p-4 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)] ${
              tile.active ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20" : "border-[var(--color-border)]"
            }`}
          >
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tile.color }} aria-hidden />
              {tile.label}
            </span>
            <span className="mt-1 block text-3xl font-semibold text-[var(--color-primary)]">{tile.count}</span>
          </button>
        ))}
      </div>

      {formOpen && (
      <form
        onSubmit={submitForm}
        className="mt-6 grid gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] p-5 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="text-xs text-[var(--color-text-muted)] lg:col-span-2">
          Titre de l'action
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="ex : Recruter 2 formateurs Vibe Coding"
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm text-[var(--color-text)]"
          />
        </label>
        <label className="text-xs text-[var(--color-text-muted)]">
          Porteur
          <input
            type="text"
            required
            value={form.owner}
            onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
            placeholder="Prénom Nom"
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm text-[var(--color-text)]"
          />
        </label>
        <label className="text-xs text-[var(--color-text-muted)]">
          Objectif lié
          <select
            value={form.objectiveId}
            onChange={(e) => setForm((f) => ({ ...f, objectiveId: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm text-[var(--color-text)]"
          >
            <option value="">Aucun</option>
            {PILOTAGE_OBJECTIVES.map((o) => (
              <option key={o.id} value={o.id}>
                {CATEGORY_LABELS[o.category]} — {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-[var(--color-text-muted)]">
          Échéance
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm text-[var(--color-text)]"
          />
        </label>
        <div className="flex items-end gap-2 lg:col-span-5">
          <label className="flex-1 text-xs text-[var(--color-text-muted)]">
            Statut
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ActionStatus }))}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm text-[var(--color-text)]"
            >
              {(Object.keys(ACTION_STATUS_LABELS) as ActionStatus[]).map((s) => (
                <option key={s} value={s}>
                  {ACTION_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-full px-5 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Ajouter l'action
          </button>
        </div>
      </form>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Actions en cours</h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          Mise à jour en masse depuis le fichier de suivi :{" "}
          <Link to="/donnees" className="font-medium text-[var(--color-accent)] hover:underline">
            page Données
          </Link>
          .
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] p-4">
        <label className="min-w-[200px] flex-1 text-xs">
          <span className="mb-1 block font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Recherche
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Titre ou porteur…"
            className="w-full rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm"
          />
        </label>
        <label className="min-w-[200px] flex-1 text-xs">
          <span className="mb-1 block font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Objectif lié
          </span>
          <select
            value={objectiveFilter}
            onChange={(e) => setObjectiveFilter(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm"
          >
            <option value="all">Tous les objectifs</option>
            {PILOTAGE_OBJECTIVES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
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
            onChange={(e) => setStatusFilter(e.target.value as ActionStatus | "all")}
            className="w-full rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm"
          >
            <option value="all">Tous les statuts</option>
            {(Object.keys(ACTION_STATUS_LABELS) as ActionStatus[]).map((s) => (
              <option key={s} value={s}>
                {ACTION_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => {
            setObjectiveFilter("all")
            setStatusFilter("all")
            setSearch("")
            setLateOnly(false)
            setGroupByOwner(false)
          }}
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-text)]"
        >
          Réinitialiser
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-text)]">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={lateOnly} onChange={(e) => setLateOnly(e.target.checked)} />
          En retard uniquement <span className="text-[var(--color-text-muted)]">({lateCount})</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={groupByOwner} onChange={(e) => setGroupByOwner(e.target.checked)} />
          Grouper par porteur
        </label>
        <span className="text-[var(--color-text-muted)]">
          <strong className="text-[var(--color-text)]">{filtered.length}</strong> action(s) affichée(s)
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-[var(--color-border)] p-10 text-center text-sm text-[var(--color-text-muted)]">
          {actions.length === 0
            ? "Aucune action pour le moment. Ajoutez-en une ci-dessus ou importez un fichier."
            : "Aucune action ne correspond aux filtres sélectionnés."}
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[var(--color-text-muted)]">
                <th className="border-b border-[var(--color-border)] px-3 py-2 text-xs font-medium uppercase">Action</th>
                <th className="border-b border-[var(--color-border)] px-3 py-2 text-xs font-medium uppercase">Porteur</th>
                <th className="border-b border-[var(--color-border)] px-3 py-2 text-xs font-medium uppercase">Objectif lié</th>
                <th className="border-b border-[var(--color-border)] px-3 py-2 text-xs font-medium uppercase">Échéance</th>
                <th className="border-b border-[var(--color-border)] px-3 py-2 text-xs font-medium uppercase">Statut</th>
                <th className="border-b border-[var(--color-border)] px-3 py-2 text-xs font-medium uppercase"></th>
              </tr>
            </thead>
            <tbody>
              {groups.map(({ owner, items }) => (
                <Fragment key={owner ?? "all"}>
                  {owner !== null && (
                    <tr className="bg-[var(--color-accent)]/[0.05]">
                      <td colSpan={6} className="border-b border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-text)]">
                        {owner}{" "}
                        <span className="font-normal text-[var(--color-text-muted)]">
                          — {items.length} action(s)
                          {items.some((a) => isLate(a, today)) && `, dont ${items.filter((a) => isLate(a, today)).length} en retard`}
                        </span>
                      </td>
                    </tr>
                  )}
                  {items.map((action) => {
                const objective = objectiveById.get(action.objectiveId)
                    return (
                      <tr key={action.id} className="even:bg-[var(--color-bg)]">
                        <td className="border-b border-[var(--color-border)] px-3 py-2 align-top text-[var(--color-text)]">
                          {action.title}
                        </td>
                        <td className="border-b border-[var(--color-border)] px-3 py-2 align-top text-[var(--color-text)]">
                          <span className="flex items-center gap-2">
                            <OwnerAvatar name={action.owner} />
                            {action.owner}
                          </span>
                        </td>
                        <td className="border-b border-[var(--color-border)] px-3 py-2 align-top text-[var(--color-text-muted)]">
                          {objective ? (
                            <>
                              <span className="block text-[10px] font-bold uppercase tracking-wide">
                                {CATEGORY_LABELS[objective.category]}
                              </span>
                              {objective.label}
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="border-b border-[var(--color-border)] px-3 py-2 align-top text-[var(--color-text-muted)]">
                          {action.dueDate
                            ? new Date(action.dueDate + "T00:00:00").toLocaleDateString("fr-FR")
                            : "—"}
                          {isLate(action, today) && (
                            <span className="ml-2 inline-block">
                              <Badge label="En retard" color="danger" />
                            </span>
                          )}
                        </td>
                        <td className="border-b border-[var(--color-border)] px-3 py-2 align-top">
                          <select
                            value={action.status}
                            onChange={(e) => updateAction(action.id, { status: e.target.value as ActionStatus })}
                            className={`rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs font-medium ${STATUS_TEXT_CLASS[action.status]}`}
                          >
                            {(Object.keys(ACTION_STATUS_LABELS) as ActionStatus[]).map((s) => (
                              <option key={s} value={s}>
                                {ACTION_STATUS_LABELS[s]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="border-b border-[var(--color-border)] px-3 py-2 align-top text-right">
                          <button
                            onClick={() => deleteAction(action.id)}
                            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
