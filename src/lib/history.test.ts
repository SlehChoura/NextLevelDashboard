import { describe, expect, it } from "vitest"
import { appendSnapshot, compareSnapshots, latestDiff, makeSnapshot, MAX_SNAPSHOTS, shortDate } from "./history"
import { dashboardMetrics } from "./dashboardMetrics"
import { SEED_HISTORY, SEED_REPORT } from "./seedData"
import { isLate, openActionsByDueDate, type ActionItem } from "./actions"
import { clearBrowserData } from "./browserData"

describe("chiffres du dashboard", () => {
  it("compte agents, missions, agents prêts et propales types", () => {
    expect(dashboardMetrics(SEED_REPORT)).toEqual({ agents: 10, missions: 27, ready: 7, propale: 1 })
  })
})

describe("historique des mises à jour", () => {
  const diff = latestDiff(SEED_HISTORY)!
  const byId = (changes: { objective: { id: string }; from: number; to: number }[]) =>
    Object.fromEntries(changes.map((c) => [c.objective.id, [c.from, c.to]]))

  it("compare le fichier du 30/09 à celui du 05/10", () => {
    expect([diff.from, diff.to]).toEqual(["2026-09-30", "2026-10-05"])
    expect(byId(diff.progress)).toEqual({
      certifications_claude: [10, 6],
      agents_industrialises: [8, 9],
      missions_avec_agents: [24, 27],
      description_cicd: [60, 100],
      publication_ai_showcase: [6, 9],
    })
    expect(diff.dashboard).toEqual([])
  })

  it("signale à part les cibles révisées", () => {
    expect(byId(diff.targetRevisions)).toEqual({
      consultants_vibe_coding: [500, 250],
      certifications_claude: [30, 10],
      agents_industrialises: [9, 10],
    })
  })

  it("compare aussi les chiffres du dashboard", () => {
    const fewer = { ...SEED_REPORT, rows: SEED_REPORT.rows.slice(0, 9) }
    const d = compareSnapshots(SEED_HISTORY[1], makeSnapshot("2026-10-12", SEED_HISTORY[1].values, SEED_HISTORY[1].targets, fewer))
    expect(d.dashboard.find((c) => c.label === "Agents IA4CYB suivis")).toMatchObject({ from: 10, to: 9 })
  })

  it("garde une seule photo par jour et en limite le nombre", () => {
    const s = (date: string) => ({ ...SEED_HISTORY[1], date })
    expect(appendSnapshot([s("2026-10-01"), s("2026-10-05")], s("2026-10-05")).map((x) => x.date)).toEqual([
      "2026-10-01",
      "2026-10-05",
    ])
    let history = [s("2026-01-01")]
    for (let i = 0; i < MAX_SNAPSHOTS + 5; i += 1) history = appendSnapshot(history, s(`2027-${String(i).padStart(4, "0")}`))
    expect(history).toHaveLength(MAX_SNAPSHOTS)
  })

  it("ne compare rien tant qu'il n'y a qu'une photo", () => {
    expect(latestDiff([SEED_HISTORY[1]])).toBeNull()
    expect(shortDate("2026-10-05")).toBe("05/10")
  })
})

describe("actions en retard", () => {
  const a = (dueDate: string, status: ActionItem["status"] = "in_progress"): ActionItem => ({
    id: dueDate + status,
    title: "t",
    owner: "o",
    objectiveId: "",
    status,
    dueDate,
  })

  it("une action ouverte dont l'échéance est passée est en retard", () => {
    expect(isLate(a("2026-09-30"), "2026-10-05")).toBe(true)
    expect(isLate(a("2026-10-05"), "2026-10-05")).toBe(false)
    expect(isLate(a("2026-09-30", "done"), "2026-10-05")).toBe(false)
    expect(isLate(a(""), "2026-10-05")).toBe(false)
  })

  it("trie les actions ouvertes par échéance, sans échéance en dernier", () => {
    const list = [a(""), a("2026-10-15"), a("2026-09-30", "done"), a("2026-09-30")]
    expect(openActionsByDueDate(list).map((x) => x.dueDate)).toEqual(["2026-09-30", "2026-10-15", ""])
  })
})

describe("effacement des données du navigateur", () => {
  it("n'efface que les clés de l'application", () => {
    const data = new Map([["nld-actions", "1"], ["nld-history", "2"], ["autre-site", "3"]])
    const storage = {
      get length() {
        return data.size
      },
      key: (i: number) => Array.from(data.keys())[i] ?? null,
      removeItem: (k: string) => void data.delete(k),
    } as unknown as Storage
    expect(clearBrowserData(storage)).toBe(2)
    expect(Array.from(data.keys())).toEqual(["autre-site"])
  })
})
