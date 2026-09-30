import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ActionItem } from "../lib/actions"
import { makeId } from "../lib/id"
import { SEED_ACTIONS, SEED_VERSION } from "../lib/seedData"

interface ActionsState {
  actions: ActionItem[]
  addAction: (input: Omit<ActionItem, "id">) => void
  updateAction: (id: string, patch: Partial<Omit<ActionItem, "id">>) => void
  deleteAction: (id: string) => void
  /** Fusionne un import en masse : les actions dont l'id existe déjà sont mises à jour, les autres sont ajoutées. */
  mergeActions: (incoming: ActionItem[]) => void
}

const SEED_ACTION_PREFIX = "seed-action-"

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase()
}

/**
 * Remplace les actions initiales d'une version précédente par celles de la version courante, en
 * conservant les actions créées ou importées par l'utilisateur. Une action initiale dont le titre
 * existe déjà parmi ces dernières (ex: déjà importée depuis le même fichier) n'est pas dupliquée.
 */
function refreshSeedActions(actions: ActionItem[]): ActionItem[] {
  const userActions = actions.filter((a) => !a.id.startsWith(SEED_ACTION_PREFIX))
  const userTitles = new Set(userActions.map((a) => normalizeTitle(a.title)))
  const seeds = SEED_ACTIONS.filter((a) => !userTitles.has(normalizeTitle(a.title)))
  return [...seeds, ...userActions]
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
    {
      name: "nld-actions",
      version: SEED_VERSION,
      migrate: (persisted) => {
        const state = persisted as Partial<ActionsState>
        return { ...state, actions: refreshSeedActions(Array.isArray(state.actions) ? state.actions : []) }
      },
    },
  ),
)
