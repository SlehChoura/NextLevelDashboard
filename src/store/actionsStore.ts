import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ActionItem } from "../lib/actions"
import { makeId } from "../lib/id"
import { SEED_ACTIONS, SEED_VERSION } from "../lib/seedData"
import { keepsLocalData, ownOrLegacy, refreshActions } from "../lib/seedMigration"
import { readStoredLastImportAt } from "../lib/browserData"

interface ActionsState {
  actions: ActionItem[]
  addAction: (input: Omit<ActionItem, "id">) => void
  updateAction: (id: string, patch: Partial<Omit<ActionItem, "id">>) => void
  deleteAction: (id: string) => void
  /** Remplace toute la liste (import du fichier de suivi, qui fait foi). */
  replaceActions: (actions: ActionItem[]) => void
  /** Date du dernier import de l'onglet Actions. */
  importedAt: string | null
  /** Dernière modification manuelle depuis la réception des données de référence (voir keepsLocalData). */
  editedAt: string | null
}

const now = () => new Date().toISOString()

export const useActionsStore = create<ActionsState>()(
  persist(
    (set) => ({
      actions: [...SEED_ACTIONS],
      addAction: (input) =>
        set((state) => ({ actions: [...state.actions, { ...input, id: makeId() }], editedAt: now() })),
      updateAction: (id, patch) =>
        set((state) => ({
          actions: state.actions.map((a) => (a.id === id ? { ...a, ...patch } : a)),
          editedAt: now(),
        })),
      deleteAction: (id) => set((state) => ({ actions: state.actions.filter((a) => a.id !== id), editedAt: now() })),
      replaceActions: (actions) => set({ actions, importedAt: now(), editedAt: null }),
      importedAt: null,
      editedAt: null,
    }),
    {
      name: "nld-actions",
      version: SEED_VERSION,
      // Nouvelles données de référence : reprises sauf si l'onglet Actions a été importé depuis leur
      // date ou modifié à la main. Pas de retour en arrière depuis un onglet resté sur une ancienne version.
      migrate: (persisted, version) => {
        const state = persisted as Partial<ActionsState>
        if (version > SEED_VERSION) return state as ActionsState
        const importedAt = ownOrLegacy(state.importedAt, readStoredLastImportAt())
        const kept = keepsLocalData({ importedAt, editedAt: state.editedAt })
        return {
          ...state,
          actions: refreshActions(state.actions, version, importedAt, state.editedAt),
          editedAt: kept ? (state.editedAt ?? null) : null,
        } as ActionsState
      },
    },
  ),
)
