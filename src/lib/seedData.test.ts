import { describe, expect, it } from "vitest"
import { findCriterionByKeyword } from "./criteria"
import { PILOTAGE_OBJECTIVES } from "./pilotage"
import { SEED_ACTIONS, SEED_REPORT, SEED_REPORT_ID } from "./seedData"
import { refreshSeedActions, refreshSeedReports, SEED_ACTION_PREFIX } from "./seedMigration"
import type { ActionItem } from "./actions"
import type { ReportData } from "../types"

describe("données initiales", () => {
  it("rattachent chaque action à un objectif existant, avec une date valide", () => {
    const ids = new Set(PILOTAGE_OBJECTIVES.map((o) => o.id))
    for (const a of SEED_ACTIONS) {
      expect(ids.has(a.objectiveId), a.title).toBe(true)
      expect(a.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(a.id.startsWith(SEED_ACTION_PREFIX)).toBe(true)
    }
    expect(new Set(SEED_ACTIONS.map((a) => a.id)).size).toBe(SEED_ACTIONS.length)
  })

  it("donnent au rapport des agents des ids de ligne stables et uniques", () => {
    const ids = SEED_REPORT.rows.map((r) => r.__id)
    expect(ids[0]).toBe("seed-agent-1")
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("exposent les critères attendus par le dashboard (missions, propale, statut)", () => {
    expect(SEED_REPORT.template.statusKey).toBe("status")
    expect(findCriterionByKeyword(SEED_REPORT.template, "mission")?.type).toBe("number")
    expect(findCriterionByKeyword(SEED_REPORT.template, "propale")?.label).toBe("Propale type")
  })
})

describe("migration des données persistées", () => {
  const userAction: ActionItem = {
    id: "u1",
    title: "Mon action",
    owner: "moi",
    objectiveId: "",
    status: "todo",
    dueDate: "",
  }

  it("remplace les anciennes actions initiales et garde celles de l'utilisateur", () => {
    const old = { ...SEED_ACTIONS[0], id: "seed-action-99", title: "Ancienne action" }
    expect(refreshSeedActions([old, userAction])).toEqual([...SEED_ACTIONS, userAction])
  })

  it("ne duplique pas une action initiale déjà importée par l'utilisateur", () => {
    const imported = { ...SEED_ACTIONS[0], id: "imp-1", title: `  ${SEED_ACTIONS[0].title.toUpperCase()} ` }
    const refreshed = refreshSeedActions([imported])
    expect(refreshed).toHaveLength(SEED_ACTIONS.length)
    expect(refreshed.filter((a) => a.id === SEED_ACTIONS[0].id)).toEqual([])
  })

  it("tolère un état persisté corrompu", () => {
    expect(refreshSeedActions(undefined)).toEqual(SEED_ACTIONS)
    expect(refreshSeedActions([null, { title: "sans id" }])).toEqual(SEED_ACTIONS)
    expect(refreshSeedReports("n'importe quoi")).toEqual([])
  })

  it("remplace le rapport initial sans toucher aux autres ni le recréer s'il a été supprimé", () => {
    const other = { ...SEED_REPORT, id: "mine" } as ReportData
    const stale = { ...SEED_REPORT, rows: [] } as ReportData
    expect(refreshSeedReports([stale, other])).toEqual([SEED_REPORT, other])
    expect(refreshSeedReports([other])).toEqual([other])
    expect(SEED_REPORT.id).toBe(SEED_REPORT_ID)
  })
})
