import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ActionItem } from "../lib/actions"
import { makeId } from "../lib/id"
import { SEED_ACTIONS } from "../lib/seedData"

interface ActionsState {
  actions: ActionItem[]
  addAction: (input: Omit<ActionItem, "id">) => void
  updateAction: (id: string, patch: Partial<Omit<ActionItem, "id">>) => void
  deleteAction: (id: string) => void
  /** Fusionne un import en masse : les actions dont l'id existe déjà sont mises à jour, les autres sont ajoutées. */
  mergeActions: (incoming: ActionItem[]) => void
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
      mergeActions: (incoming) =>
        set((state) => {
          const byId = new Map(state.actions.map((a) => [a.id, a]))
          for (const action of incoming) byId.set(action.id, action)
          return { actions: Array.from(byId.values()) }
        }),
    }),
    { name: "nld-actions" },
  ),
)
