import { useMemo, useState } from "react"
import { FileDrop } from "../components/common/FileDrop"
import { useActionsStore } from "../store/actionsStore"
import { ACTION_STATUS_LABELS, type ActionStatus } from "../lib/actions"
import { downloadActionsTemplate, parseActionsFile } from "../lib/actionsImport"
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
  const mergeActions = useActionsStore((s) => s.mergeActions)

  const [form, setForm] = useState(emptyForm)
  const [objectiveFilter, setObjectiveFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<ActionStatus | "all">("all")
  const [search, setSearch] = useState("")
  const [importOpen, setImportOpen] = useState(false)
  const [importMessage, setImportMessage] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return actions.filter((a) => {
      const objectiveMatches = objectiveFilter === "all" || a.objectiveId === objectiveFilter
      const statusMatches = statusFilter === "all" || a.status === statusFilter
      const searchMatches =
        query === "" || a.title.toLowerCase().includes(query) || a.owner.toLowerCase().includes(query)
      return objectiveMatches && statusMatches && searchMatches
    })
  }, [actions, objectiveFilter, statusFilter, search])

  function submitForm(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.owner.trim()) return
    addAction({ ...form, title: form.title.trim(), owner: form.owner.trim() })
    setForm(emptyForm)
  }

  async function handleImportFile(file: File) {
    setImportMessage(null)
    try {
      const existingIds = new Set(actions.map((a) => a.id))
      const { actions: imported, created, updated, unmatchedObjectives, skippedNoTitle } = await parseActionsFile(
        file,
        existingIds,
      )
      if (imported.length > 0) mergeActions(imported)
      const parts = [`${created} action(s) créée(s)`, `${updated} mise(s) à jour`]
      if (skippedNoTitle > 0) parts.push(`${skippedNoTitle} ligne(s) ignorée(s) (titre manquant)`)
      if (unmatchedObjectives.length > 0) parts.push(`${unmatchedObjectives.length} objectif(s) non reconnu(s) (laissé vide)`)
      setImportMessage(parts.join(" — ") + ".")
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
      <h1 className="mt-2 text-3xl font-semibold text-[var(--color-text)]">Actions</h1>
      <p className="mt-3 max-w-2xl text-[var(--color-text-muted)]">
        Suivez les actions en cours pour faire avancer les objectifs du pilotage et les KPI
        associés, avec un porteur identifié pour chacune.
      </p>

      <form
        onSubmit={submitForm}
        className="mt-8 grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:grid-cols-2 lg:grid-cols-5"
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
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Ajouter l'action
          </button>
        </div>
      </form>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Actions en cours</h2>
        <div className="flex gap-2">
          <button
            onClick={() => downloadActionsTemplate(actions)}
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
            Téléchargez d'abord le modèle (actions existantes ou exemple), complétez-le — ajoutez
            des lignes pour de nouvelles actions, laissez la colonne « Clé » pour mettre à jour une
            action existante — puis réimportez-le ici.
          </p>
          <FileDrop onFile={handleImportFile} accept=".xlsx,.xls,.csv" hint="Formats acceptés : .xlsx, .xls, .csv" />
        </div>
      )}

      {importMessage && <p className="mt-3 text-sm text-[var(--color-text)]">{importMessage}</p>}

      <div className="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
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
          }}
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-text)]"
        >
          Réinitialiser
        </button>
      </div>

      <p className="mt-3 text-xs text-[var(--color-text-muted)]">
        <strong className="text-[var(--color-text)]">{filtered.length}</strong> action(s) affichée(s)
      </p>

      {filtered.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-[var(--color-border)] p-10 text-center text-sm text-[var(--color-text-muted)]">
          {actions.length === 0
            ? "Aucune action pour le moment. Ajoutez-en une ci-dessus ou importez un fichier."
            : "Aucune action ne correspond aux filtres sélectionnés."}
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
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
              {filtered.map((action) => {
                const objective = objectiveById.get(action.objectiveId)
                return (
                  <tr key={action.id} className="even:bg-[var(--color-bg)]">
                    <td className="border-b border-[var(--color-border)] px-3 py-2 align-top text-[var(--color-text)]">
                      {action.title}
                    </td>
                    <td className="border-b border-[var(--color-border)] px-3 py-2 align-top text-[var(--color-text)]">
                      {action.owner}
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
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
