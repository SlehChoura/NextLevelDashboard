import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ActionItem } from "../lib/actions"
import { makeId } from "../lib/id"
import { SEED_ACTIONS, SEED_VERSION } from "../lib/seedData"
import { refreshSeedActions } from "../lib/seedMigration"

interface ActionsState {
  actions: ActionItem[]
  addAction: (input: Omit<ActionItem, "id">) => void
  updateAction: (id: string, patch: Partial<Omit<ActionItem, "id">>) => void
  deleteAction: (id: string) => void
  /** Remplace toute la liste (import du fichier de suivi, qui fait foi). */
  replaceActions: (actions: ActionItem[]) => void
}

export const useActionsStore = create<ActionsState>()(
  persist(
    (set) => ({
      actions: [...SEED_ACTIONS],
      addAction: (input) => set((state) => ({ actions: [...state.actions, { ...input, id: makeId() }] })),
      updateAction: (id, patch) =>
        set((state) => ({
          actions: state.actions.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      deleteAction: (id) => set((state) => ({ actions: state.actions.filter((a) => a.id !== id) })),
      replaceActions: (actions) => set({ actions }),
    }),
    {
      name: "nld-actions",
      version: SEED_VERSION,
      migrate: (persisted) => {
        const state = persisted as Partial<ActionsState>
        return { ...state, actions: refreshSeedActions(state.actions) }
      },
    },
  ),
)
