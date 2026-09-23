import { create } from "zustand"
import { persist } from "zustand/middleware"
import { PILOTAGE_OBJECTIVES } from "../lib/pilotage"

type PilotageValues = Record<string, number>

interface PilotageState {
  values: PilotageValues
  valueFor: (objectiveId: string) => number
  setValue: (objectiveId: string, value: number) => void
  setValues: (values: PilotageValues) => void
  resetValues: () => void
}

const defaultValues: PilotageValues = Object.fromEntries(
  PILOTAGE_OBJECTIVES.map((o) => [o.id, o.defaultCurrent]),
)

export const usePilotageStore = create<PilotageState>()(
  persist(
    (set, get) => ({
      values: { ...defaultValues },
      valueFor: (objectiveId) => get().values[objectiveId] ?? defaultValues[objectiveId] ?? 0,
      setValue: (objectiveId, value) =>
        set((state) => ({ values: { ...state.values, [objectiveId]: value } })),
      setValues: (values) => set((state) => ({ values: { ...state.values, ...values } })),
      resetValues: () => set({ values: { ...defaultValues } }),
    }),
    { name: "nld-pilotage" },
  ),
)
