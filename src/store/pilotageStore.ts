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
  /** Modification manuelle (carte d'un objectif) : protégée des prochaines données de référence. */
  setValue: (objectiveId: string, value: number) => void
  setTarget: (objectiveId: string, target: number) => void
  /** Import de l'onglet « Suivi pilotage » : le fichier fait foi pour les objectifs qu'il contient. */
  applyImport: (values: PilotageValues, targets: PilotageValues) => void
  resetValues: () => void
  /** Date (ISO) du dernier import global réussi, affichée comme « dernière mise à jour des données ». */
  lastImportAt: string | null
  setLastImportAt: (date: string) => void
  /** Date du dernier import ayant mis à jour des valeurs ou cibles du pilotage (≠ import d'un autre onglet). */
  valuesImportedAt: string | null
  /** Dernière modification manuelle depuis la réception des données de référence (voir keepsLocalData). */
  editedAt: string | null
}

const defaultValues: PilotageValues = Object.fromEntries(
  PILOTAGE_OBJECTIVES.map((o) => [o.id, o.defaultCurrent]),
)
const defaultTargets: PilotageValues = Object.fromEntries(
  PILOTAGE_OBJECTIVES.map((o) => [o.id, o.target]),
)

const now = () => new Date().toISOString()

export const usePilotageStore = create<PilotageState>()(
  persist(
    (set, get) => ({
      values: { ...defaultValues },
      targets: { ...defaultTargets },
      valueFor: (objectiveId) => get().values[objectiveId] ?? defaultValues[objectiveId] ?? 0,
      targetFor: (objectiveId) => get().targets[objectiveId] ?? defaultTargets[objectiveId] ?? 0,
      setValue: (objectiveId, value) =>
        set((state) => ({ values: { ...state.values, [objectiveId]: value }, editedAt: now() })),
      setTarget: (objectiveId, target) =>
        set((state) => ({ targets: { ...state.targets, [objectiveId]: target }, editedAt: now() })),
      applyImport: (values, targets) =>
        set((state) => ({
          values: { ...state.values, ...values },
          targets: { ...state.targets, ...targets },
          valuesImportedAt: now(),
          editedAt: null,
        })),
      resetValues: () => set({ values: { ...defaultValues }, targets: { ...defaultTargets }, editedAt: null }),
      lastImportAt: null,
      setLastImportAt: (date) => set({ lastImportAt: date }),
      valuesImportedAt: null,
      editedAt: null,
    }),
    {
      name: "nld-pilotage",
      version: SEED_VERSION,
      // Nouvelles données de référence : remplacent les valeurs enregistrées, sauf si l'onglet
      // pilotage a été importé depuis leur date ou modifié à la main (voir refreshPilotage). Un onglet
      // resté ouvert sur une version plus ancienne du site ne rétrograde pas des données plus récentes.
      migrate: (persisted, version) =>
        version > SEED_VERSION
          ? (persisted as PilotageState)
          : refreshPilotage(persisted as PilotageState, version, { values: defaultValues, targets: defaultTargets }),
    },
  ),
)
