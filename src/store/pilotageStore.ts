import { create } from "zustand"
import { persist } from "zustand/middleware"
import { PILOTAGE_OBJECTIVES } from "../lib/pilotage"
import { SEED_VERSION } from "../lib/seedData"
import { refreshPilotage } from "../lib/seedMigration"

type PilotageValues = Record<string, number>

interface PilotageState {
  values: PilotageValues
  targets: PilotageValues
  valueFor: (objectiveId: string) => number
  targetFor: (objectiveId: string) => number
  setValue: (objectiveId: string, value: number) => void
  setValues: (values: PilotageValues) => void
  setTarget: (objectiveId: string, target: number) => void
  setTargets: (targets: PilotageValues) => void
  resetValues: () => void
  /** Date (ISO) du dernier import global réussi, affichée comme « dernière mise à jour des données ». */
  lastImportAt: string | null
  setLastImportAt: (date: string) => void
}

const defaultValues: PilotageValues = Object.fromEntries(
  PILOTAGE_OBJECTIVES.map((o) => [o.id, o.defaultCurrent]),
)
const defaultTargets: PilotageValues = Object.fromEntries(
  PILOTAGE_OBJECTIVES.map((o) => [o.id, o.target]),
)

export const usePilotageStore = create<PilotageState>()(
  persist(
    (set, get) => ({
      values: { ...defaultValues },
      targets: { ...defaultTargets },
      valueFor: (objectiveId) => get().values[objectiveId] ?? defaultValues[objectiveId] ?? 0,
      targetFor: (objectiveId) => get().targets[objectiveId] ?? defaultTargets[objectiveId] ?? 0,
      setValue: (objectiveId, value) =>
        set((state) => ({ values: { ...state.values, [objectiveId]: value } })),
      setValues: (values) => set((state) => ({ values: { ...state.values, ...values } })),
      setTarget: (objectiveId, target) =>
        set((state) => ({ targets: { ...state.targets, [objectiveId]: target } })),
      setTargets: (targets) => set((state) => ({ targets: { ...state.targets, ...targets } })),
      resetValues: () => set({ values: { ...defaultValues }, targets: { ...defaultTargets } }),
      lastImportAt: null,
      setLastImportAt: (date) => set({ lastImportAt: date }),
    }),
    {
      name: "nld-pilotage",
      version: SEED_VERSION,
      // Nouvelles données de référence : remplacent les valeurs enregistrées, sauf si un fichier
      // a été importé depuis la date de ces données (voir refreshPilotage).
      migrate: (persisted, version) =>
        refreshPilotage(persisted as PilotageState, version, { values: defaultValues, targets: defaultTargets }),
    },
  ),
)
