import { describe, expect, it } from "vitest"
import {
  CATEGORY_LABELS,
  computeStatus,
  findObjectiveIdByKey,
  findObjectiveIdByLabel,
  OWNER_LABELS,
  PILOTAGE_OBJECTIVES,
  progressPercent,
  type PilotageObjective,
} from "./pilotage"

const up = { ...PILOTAGE_OBJECTIVES[0], direction: "up", target: 10 } as PilotageObjective
const down = { ...PILOTAGE_OBJECTIVES[0], direction: "down", target: 100 } as PilotageObjective

describe("objectifs du pilotage", () => {
  it("ont des identifiants uniques, une catégorie et un responsable connus", () => {
    const ids = PILOTAGE_OBJECTIVES.map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const o of PILOTAGE_OBJECTIVES) {
      expect(CATEGORY_LABELS[o.category]).toBeTruthy()
      expect(OWNER_LABELS[o.owner]).toBeTruthy()
      expect(o.target).toBeGreaterThan(0)
    }
  })

  it("ont des libellés distincts (utilisés pour reconnaître une ligne sans clé)", () => {
    const labels = PILOTAGE_OBJECTIVES.map((o) => findObjectiveIdByLabel(o.label))
    expect(labels).toEqual(PILOTAGE_OBJECTIVES.map((o) => o.id))
  })
})

describe("recherche d'objectif", () => {
  it("tolère casse, accents et séparateurs dans la clé", () => {
    expect(findObjectiveIdByKey("Publication_AIShowcase")).toBe("publication_ai_showcase")
    expect(findObjectiveIdByKey(" DISPONIBILITE-CICD ")).toBe("disponibilite_cicd")
    expect(findObjectiveIdByKey("inconnu")).toBeUndefined()
    expect(findObjectiveIdByKey("")).toBeUndefined()
  })

  it("tolère casse et accents dans le libellé", () => {
    expect(findObjectiveIdByLabel("disponibilite de la chaine ci/cd")).toBe("disponibilite_cicd")
    expect(findObjectiveIdByLabel("")).toBeUndefined()
  })
})

describe("avancement et statut", () => {
  it("n'affiche jamais 100 % avant d'atteindre la cible", () => {
    expect(progressPercent(up, 9.99)).toBe(99)
    expect(progressPercent(up, 10)).toBe(100)
  })

  it("calcule le statut d'un objectif croissant", () => {
    expect(computeStatus(up, 10)).toBe("unlocked")
    expect(computeStatus(up, 8)).toBe("progress")
    expect(computeStatus(up, 2)).toBe("accelerate")
    expect(computeStatus(up, 0, 0)).toBe("accelerate")
  })

  it("calcule le statut d'un objectif décroissant (seuil à ne pas dépasser)", () => {
    expect(computeStatus(down, 90)).toBe("unlocked")
    expect(computeStatus(down, 110)).toBe("risk")
  })

  it("utilise la cible ajustée quand elle est fournie", () => {
    expect(computeStatus(up, 5, 5)).toBe("unlocked")
  })
})
