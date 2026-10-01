import { describe, expect, it } from "vitest"
import { applyNormalizations, buildFromSheet, hasPropaleType, isClientReadyStatus, normalizeKnownColumns } from "./fixedFormatImport"
import type { ParsedSheet } from "./excelImport"

function sheet(headers: string[], rows: unknown[][]): ParsedSheet {
  return { sheetNames: ["S"], activeSheet: "S", headers, rows }
}

describe("buildFromSheet", () => {
  const headers = ["Agent", "Status", "Portabilité", "Nombre de missions réalisées", "Notes", ""]
  const rows = [
    ["Agent A", "WIP", 0.75, 2, "texte libre\nsur deux lignes", "ignoré"],
    ["Agent B", "Déployable en contexte client", "~99%", "3 (en mode test)", "", ""],
    ["Agent C", "WIP", "pas encore", "N/A", "", ""],
    ["", "Légende : WIP = en cours", "", "", "", ""],
  ]
  const result = buildFromSheet(sheet(headers, rows))
  const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, r]))

  it("ne garde que les lignes dont la première colonne est renseignée", () => {
    expect(result.rows.map((r) => r.label)).toEqual(["Agent A", "Agent B", "Agent C"])
  })

  it("ignore les colonnes sans en-tête", () => {
    expect(result.template.criteria.map((c) => c.label)).toEqual([
      "Agent",
      "Status",
      "Portabilité",
      "Nombre de missions réalisées",
      "Notes",
    ])
  })

  it("déduit le type de chaque colonne", () => {
    const types = Object.fromEntries(result.template.criteria.map((c) => [c.label, c.type]))
    expect(types).toEqual({
      Agent: "text",
      Status: "select",
      Portabilité: "percent",
      "Nombre de missions réalisées": "number",
      Notes: "text",
    })
    expect(result.template.statusKey).toBe("status")
  })

  it("convertit les fractions Excel et les pourcentages texte en 0-100", () => {
    expect(byLabel["Agent A"].portabilite).toBe(75)
    expect(byLabel["Agent B"].portabilite).toBe(99)
  })

  it("garde le nombre en tête d'un compteur annoté", () => {
    expect(byLabel["Agent A"].nombre_de_missions_realisees).toBe(2)
    expect(byLabel["Agent B"].nombre_de_missions_realisees).toBe(3)
  })

  it("signale les pourcentages illisibles mais pas les compteurs N/A", () => {
    expect(result.ambiguousCells.map((c) => [c.rowLabel, c.criterionLabel, c.rawValue])).toEqual([
      ["Agent C", "Portabilité", "pas encore"],
    ])
    expect(byLabel["Agent C"].nombre_de_missions_realisees).toBe(0)
  })

  it("stocke la valeur technique des options de statut", () => {
    expect(byLabel["Agent B"].status).toBe("deployable_en_contexte_client")
    expect(isClientReadyStatus(String(byLabel["Agent B"].status))).toBe(true)
    expect(isClientReadyStatus(String(byLabel["Agent A"].status))).toBe(false)
  })
})

describe("colonnes Propale type et Nombre de missions (fichier de suivi réel)", () => {
  // Cas réel : une seule propale type renseignée, des compteurs laissés vides.
  const headers = ["Nos agents IA4CYB", "Status", "Propale type", "Nombre de missions réalisées"]
  const rows = [
    ["Smart Identity Analyzer", "WIP", "", ""],
    ["Cyber-by-Design Project Assistant", "WIP", "Oui", 2],
    ["The Web Recon Accelerator", "WIP", "non", "15"],
  ]
  const result = buildFromSheet(sheet(headers, rows))
  const propale = result.template.criteria.find((c) => c.label === "Propale type")!
  const missions = result.template.criteria.find((c) => c.label === "Nombre de missions réalisées")!

  it("traite Propale type comme un Oui/Non, vide = Non", () => {
    expect(propale.type).toBe("select")
    expect(propale.options?.map((o) => o.label)).toEqual(["Oui", "Non"])
    expect(result.rows.map((r) => r[propale.key])).toEqual(["non", "oui", "non"])
  })

  it("traite Nombre de missions comme un nombre, vide = 0", () => {
    expect(missions.type).toBe("number")
    expect(result.rows.map((r) => r[missions.key])).toEqual([0, 2, 15])
  })

  it("garde Status comme critère de synthèse", () => {
    expect(result.template.statusKey).toBe("status")
  })

  it("remet au bon format un rapport enregistré par une version précédente", () => {
    const stale = {
      ...result.template,
      criteria: result.template.criteria.map((c) =>
        c.key === propale.key ? { ...c, type: "text" as const, role: "info" as const, options: undefined } : c,
      ),
    }
    const staleRows = [{ __id: "r1", label: "A", status: "wip", [propale.key]: "", [missions.key]: "" }]
    const fixed = normalizeKnownColumns(stale, staleRows)
    expect(fixed.template.criteria.find((c) => c.key === propale.key)?.type).toBe("select")
    expect(fixed.rows[0][propale.key]).toBe("non")
    expect(fixed.rows[0][missions.key]).toBe(0)
  })
})

describe("helpers", () => {
  it("hasPropaleType considère vide, Non et N/A comme absents", () => {
    expect(hasPropaleType("")).toBe(false)
    expect(hasPropaleType("N/A")).toBe(false)
    expect(hasPropaleType("Non")).toBe(false)
    expect(hasPropaleType("non")).toBe(false)
    expect(hasPropaleType("Oui")).toBe(true)
    expect(hasPropaleType("oui")).toBe(true)
    expect(hasPropaleType("Lien Deck")).toBe(true)
  })

  it("applyNormalizations réapplique les valeurs sur les bonnes cellules", () => {
    const rows = [
      { __id: "r1", label: "A", p: "" },
      { __id: "r2", label: "B", p: "" },
    ]
    const next = applyNormalizations(rows, new Map([["r2::p", 50]]))
    expect(next[0]).toBe(rows[0])
    expect(next[1].p).toBe(50)
  })
})
