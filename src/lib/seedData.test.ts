import { describe, expect, it } from "vitest"
import { findCriterionByKeyword } from "./criteria"
import { PILOTAGE_OBJECTIVES } from "./pilotage"
import { SEED_ACTIONS, SEED_REPORT, SEED_REPORT_ID } from "./seedData"
import { pickDashboardReport, refreshSeedActions, refreshSeedReports, SEED_ACTION_PREFIX } from "./seedMigration"
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

  it("supprime les doublons laissés par d'anciens imports (actions importées plusieurs fois)", () => {
    // État observé sur la version publiée : 13 actions initiales + les mêmes 13 importées
    // (clé vide → nouvel identifiant), éventuellement plusieurs fois.
    const imported = (suffix: string) => SEED_ACTIONS.map((a, i) => ({ ...a, id: `imp-${suffix}-${i}` }))
    const refreshed = refreshSeedActions([...SEED_ACTIONS, ...imported("a"), ...imported("b"), userAction])
    expect(refreshed).toHaveLength(SEED_ACTIONS.length + 1)
    expect(new Set(refreshed.map((a) => a.title)).size).toBe(refreshed.length)
    expect(refreshed.map((a) => a.id)).toEqual([...imported("a").map((a) => a.id), "u1"])
  })

  it("rend leur objectif aux actions importées avant la création de cet objectif", () => {
    // État observé : les 3 dernières actions du fichier, importées quand les objectifs AI Showcase,
    // description CI/CD et guidelines n'existaient pas encore, enregistrées sans objectif lié.
    const lastThree = SEED_ACTIONS.slice(-3)
    const imported = SEED_ACTIONS.map((a, i) => ({
      ...a,
      id: `imp-${i}`,
      objectiveId: lastThree.includes(a) ? "" : a.objectiveId,
    }))
    const refreshed = refreshSeedActions(imported)
    expect(refreshed.map((a) => a.id)).toEqual(imported.map((a) => a.id))
    expect(refreshed.map((a) => a.objectiveId)).toEqual(SEED_ACTIONS.map((a) => a.objectiveId))
  })

  it("laisse sans objectif une action de l'utilisateur absente du fichier de référence", () => {
    expect(refreshSeedActions([userAction]).at(-1)).toEqual(userAction)
  })

  it("remplace les données d'un rapport importé depuis l'ancien fichier à colonnes décalées", () => {
    const obsolete = {
      ...SEED_REPORT,
      id: "import-ancien",
      meta: { ...SEED_REPORT.meta, title: "Agents IA4CYB (import global)" },
      template: {
        ...SEED_REPORT.template,
        criteria: [...SEED_REPORT.template.criteria, { key: "lien_ai_showcase", label: "Lien AI Showcase", type: "text", role: "info" }],
      },
      rows: SEED_REPORT.rows.map((r) => ({ ...r, propale_type: "Lien Deck", nombre_de_missions_realisees: "" })),
    } as ReportData
    const [fixed] = refreshSeedReports([obsolete])
    expect(fixed.id).toBe("import-ancien")
    expect(fixed.meta.title).toBe("Agents IA4CYB (import global)")
    expect(fixed.template).toEqual(SEED_REPORT.template)
    expect(fixed.rows.map(({ __id: _id, ...rest }) => rest)).toEqual(SEED_REPORT.rows.map(({ __id: _id, ...rest }) => rest))
  })

  it("donne au rapport initial des propales Oui/Non et des nombres de missions", () => {
    const propale = findCriterionByKeyword(SEED_REPORT.template, "propale")!
    const missions = findCriterionByKeyword(SEED_REPORT.template, "mission")!
    expect(SEED_REPORT.rows.map((r) => r[propale.key])).toEqual(["non", "non", "non", "non", "non", "non", "non", "oui", "non", "non"])
    expect(SEED_REPORT.rows.map((r) => r[missions.key])).toEqual([0, 2, 2, 15, 2, 0, 2, 2, 0, 2])
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

describe("passage à un dashboard unique (version 5)", () => {
  const imported = { ...SEED_REPORT, id: "import-1", meta: { ...SEED_REPORT.meta, title: "Import" }, rows: SEED_REPORT.rows.slice(0, 2), updatedAt: "2026-09-29T00:00:00.000Z" } as ReportData
  const other = { ...SEED_REPORT, id: "autre", rows: [], updatedAt: "2026-10-01T00:00:00.000Z" } as ReportData

  it("garde le rapport alimenté par l'import global, avec ses données", () => {
    const state = { reports: [SEED_REPORT, imported, other], activeReportId: "autre" }
    expect(pickDashboardReport(state, 4, "import-1")).toBe(imported)
  })

  it("à défaut, garde le rapport affiché, puis le rapport initial, puis le plus récent", () => {
    expect(pickDashboardReport({ reports: [imported, other], activeReportId: "autre" }, 4, null)).toBe(other)
    expect(pickDashboardReport({ reports: [imported, SEED_REPORT], activeReportId: null }, 4, "supprimé")).toBe(SEED_REPORT)
    expect(pickDashboardReport({ reports: [imported, other] }, 4, null)).toBe(other)
  })

  it("repart du dashboard initial si rien d'exploitable n'est enregistré", () => {
    expect(pickDashboardReport(undefined, 4, null)).toBe(SEED_REPORT)
    expect(pickDashboardReport({ reports: "n'importe quoi" }, 4, null)).toBe(SEED_REPORT)
  })

  it("laisse tel quel un état déjà au format dashboard unique", () => {
    expect(pickDashboardReport({ report: imported }, 5, null)).toBe(imported)
  })
})
