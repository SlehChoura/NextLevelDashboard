import { describe, expect, it } from "vitest"
import { parseCombinedWorkbook } from "./combinedImport"
import { PILOTAGE_OBJECTIVES } from "./pilotage"
import { SEED_ACTIONS, SEED_REPORT } from "./seedData"
import {
  ACTIONS_SHEET_NAME,
  DASHBOARD_SHEET_NAME,
  PILOTAGE_SHEET_NAME,
  referenceWorkbook,
  workbookFrom,
} from "../test/referenceWorkbook"

const PIL_HEADERS = ["Clé", "Catégorie", "Indicateur", "Valeur actuelle", "Cible", "Unité"]
const ACT_HEADERS = ["Clé", "Titre", "Porteur", "Clé objectif", "Objectif lié", "Statut", "Échéance"]

describe("import du fichier de référence", () => {
  const result = parseCombinedWorkbook(referenceWorkbook(), new Set())

  it("ne signale aucune incohérence", () => {
    expect(result.warnings).toEqual([])
  })

  it("restitue les valeurs et cibles de tous les objectifs", () => {
    expect(result.pilotage?.unmatched).toEqual([])
    expect(result.pilotage?.valueUpdates).toEqual(
      Object.fromEntries(PILOTAGE_OBJECTIVES.map((o) => [o.id, o.defaultCurrent])),
    )
    expect(result.pilotage?.targetUpdates).toEqual(Object.fromEntries(PILOTAGE_OBJECTIVES.map((o) => [o.id, o.target])))
  })

  it("restitue les actions à l'identique (hors identifiant)", () => {
    const strip = ({ id: _id, ...rest }: { id: string }) => rest
    expect(result.actions?.unmatchedObjectives).toEqual([])
    expect(result.actions?.actions.map(strip)).toEqual(SEED_ACTIONS.map(strip))
  })

  it("reconnaît les actions existantes par leur clé", () => {
    const again = parseCombinedWorkbook(referenceWorkbook(), new Set(SEED_ACTIONS.map((a) => a.id)))
    expect(again.actions?.updated).toBe(SEED_ACTIONS.length)
    expect(again.actions?.created).toBe(0)
    expect(again.actions?.actions.map((a) => a.id)).toEqual(SEED_ACTIONS.map((a) => a.id))
  })

  it("restitue le dashboard des agents à l'identique", () => {
    const strip = ({ __id: _id, ...rest }: { __id: string }) => rest
    expect(result.dashboard?.template.criteria).toEqual(SEED_REPORT.template.criteria)
    expect(result.dashboard?.rows.map(strip)).toEqual(SEED_REPORT.rows.map(strip))
  })
})

describe("onglet Suivi pilotage", () => {
  it("reconnaît un objectif par sa clé quelle que soit son écriture, ou par son libellé", () => {
    const result = parseCombinedWorkbook(
      workbookFrom({
        [PILOTAGE_SHEET_NAME]: [
          PIL_HEADERS,
          ["Publication_AIShowcase", "", "", 7, 12, ""],
          ["", "", "Agents disponibles", "11,5", "", ""],
          ["cle_inconnue", "", "Objectif inconnu", 1, 2, ""],
        ],
      }),
      new Set(),
    )
    expect(result.pilotage?.valueUpdates).toEqual({ publication_ai_showcase: 7, agents_disponibles: 11.5 })
    expect(result.pilotage?.targetUpdates).toEqual({ publication_ai_showcase: 12 })
    expect(result.pilotage?.unmatched).toEqual(["Objectif inconnu"])
  })
})

describe("onglet Actions", () => {
  const result = parseCombinedWorkbook(
    workbookFrom({
      [ACTIONS_SHEET_NAME]: [
        ACT_HEADERS,
        ["", "Action A", "Moi", "DESCRIPTION_CICD", "", "Terminé", new Date(Date.UTC(2026, 9, 6))],
        ["", "Action B", "Moi", "", "Agents disponibles", "EN COURS", "2026-10-15"],
        ["", "Action C", "Moi", "x", "y", "statut bizarre", "demain"],
        ["", "", "Moi", "", "", "Fait", ""],
      ],
    }),
    new Set(),
  )
  const actions = result.actions!

  it("interprète statuts, dates et objectifs liés", () => {
    expect(actions.actions.map((a) => [a.title, a.objectiveId, a.status, a.dueDate])).toEqual([
      ["Action A", "description_cicd", "done", "2026-10-06"],
      ["Action B", "agents_disponibles", "in_progress", "2026-10-15"],
      ["Action C", "", "todo", ""],
    ])
  })

  it("compte les lignes ignorées ou non rattachées", () => {
    expect(actions.created).toBe(3)
    expect(actions.skippedNoTitle).toBe(1)
    expect(actions.unmatchedObjectives).toEqual(["Action C"])
  })
})

describe("onglets absents", () => {
  it("ignore simplement les onglets manquants", () => {
    const result = parseCombinedWorkbook(workbookFrom({ Autre: [["a"], [1]] }), new Set())
    expect(result.pilotage).toBeNull()
    expect(result.actions).toBeNull()
    expect(result.dashboard).toBeNull()
    expect(result.warnings).toEqual([])
  })

  it("ignore un onglet agents sans aucune ligne", () => {
    const result = parseCombinedWorkbook(workbookFrom({ [DASHBOARD_SHEET_NAME]: [["Nos agents IA4CYB", "Status"]] }), new Set())
    expect(result.dashboard).toBeNull()
  })
})

describe("cellules vides", () => {
  it("ne remettent pas une valeur ou une cible à 0", () => {
    const result = parseCombinedWorkbook(
      workbookFrom({ [PILOTAGE_SHEET_NAME]: [PIL_HEADERS, ["agents_disponibles", "", "", "", " ", ""]] }),
      new Set(),
    )
    expect(result.pilotage?.valueUpdates).toEqual({})
    expect(result.pilotage?.targetUpdates).toEqual({})
  })
})
