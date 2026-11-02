import { describe, expect, it } from "vitest"
import { AGENT_PROFILES, findAgentProfile } from "./agentProfiles"
import { SEED_REPORT } from "./seedData"

describe("fiches des agents", () => {
  const names = SEED_REPORT.rows.map((row) => String(row.label ?? ""))

  it("associe une fiche distincte à chaque agent du fichier de suivi", () => {
    const codes = names.map((name) => findAgentProfile(name)?.code)
    expect(codes).not.toContain(undefined)
    expect(new Set(codes).size).toBe(names.length)
  })

  it("reconnaît un agent malgré un nom légèrement différent", () => {
    expect(findAgentProfile("CrisisMaker")?.code).toBe("UC8")
    expect(findAgentProfile("Booster EBIOS RM - Analyse de risques")?.code).toBe("UC9")
    expect(findAgentProfile("Agent inconnu")).toBeUndefined()
  })

  it("ne publie que des liens https", () => {
    for (const p of AGENT_PROFILES) if (p.demoUrl) expect(p.demoUrl).toMatch(/^https:\/\//)
  })
})
