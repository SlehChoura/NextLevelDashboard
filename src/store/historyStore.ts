import { create } from "zustand"
import { persist } from "zustand/middleware"
import { appendSnapshot, type Snapshot } from "../lib/history"
import { SEED_HISTORY, SEED_VERSION } from "../lib/seedData"
import { mergeSeedHistory } from "../lib/seedMigration"
import { readStoredLastImportAt } from "../lib/browserData"

interface HistoryState {
  /** Photos des chiffres à chaque mise à jour des données, de la plus ancienne à la plus récente. */
  snapshots: Snapshot[]
  addSnapshot: (snapshot: Snapshot) => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      snapshots: SEED_HISTORY,
      addSnapshot: (snapshot) => set((state) => ({ snapshots: appendSnapshot(state.snapshots, snapshot) })),
    }),
    {
      name: "nld-history",
      version: SEED_VERSION,
      // Nouvelles données de référence : leurs photos rejoignent l'historique enregistré.
      migrate: (persisted) => ({ ...(persisted as HistoryState), snapshots: mergeSeedHistory((persisted as HistoryState)?.snapshots, readStoredLastImportAt()) }),
    },
  ),
)
