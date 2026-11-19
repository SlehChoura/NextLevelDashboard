import { describe, expect, it } from "vitest"
import { AGENT_PROFILES } from "./agentProfiles"
import { AGENT_THEMES, communityDocUrl, COMMUNITY_DOCS, DEMO_SCENARIOS, MATURITY_AXES, VIBE_CHAIN } from "./pitch"

describe("contenu de la page Pitch client", () => {
  const codes = new Set(AGENT_PROFILES.map((p) => p.code))

  it("rattache chaque démo et chaque thème à un agent connu", () => {
    for (const demo of DEMO_SCENARIOS) {
      expect(codes.has(demo.code), demo.code).toBe(true)
      expect(demo.steps.length).toBeGreaterThan(2)
      expect(demo.url).toMatch(/^https:\/\//)
    }
    for (const code of codes) expect(AGENT_THEMES[code], code).toBeDefined()
  })

  it("donne des liens https uniques vers la documentation de la communauté", () => {
    const urls = COMMUNITY_DOCS.map(communityDocUrl)
    expect(new Set(urls).size).toBe(urls.length)
    for (const url of urls) expect(url).toMatch(/^https:\/\/.+\.html$/)
  })

  it("décrit une chaîne et des échelles de maturité complètes", () => {
    expect(new Set(VIBE_CHAIN.map((s) => s.id)).size).toBe(VIBE_CHAIN.length)
    for (const axis of MATURITY_AXES) expect(axis.levels.length).toBeGreaterThanOrEqual(3)
  })
})

describe("agents utilisables en mission", () => {
  it("reconnaît le vocabulaire du 19/11 comme celui des fichiers précédents", async () => {
    const { isClientReadyStatus } = await import("./fixedFormatImport")
    expect(isClientReadyStatus("utilisable_en_mission_operationnelle")).toBe(true)
    expect(isClientReadyStatus("Utilisable en mission opérationnelle")).toBe(true)
    expect(isClientReadyStatus("deployable_en_contexte_client")).toBe(true)
    expect(isClientReadyStatus("presentable_en_contexte_client")).toBe(true)
    expect(isClientReadyStatus("en_developpement")).toBe(false)
  })
})
