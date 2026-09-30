import { describe, expect, it } from "vitest"
import { applyNormalizations, buildFromSheet, hasPropaleType, isClientReadyStatus } from "./fixedFormatImport"
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
    expect(byLabel["Agent C"].nombre_de_missions_realisees).toBe("")
  })

  it("stocke la valeur technique des options de statut", () => {
    expect(byLabel["Agent B"].status).toBe("deployable_en_contexte_client")
    expect(isClientReadyStatus(String(byLabel["Agent B"].status))).toBe(true)
    expect(isClientReadyStatus(String(byLabel["Agent A"].status))).toBe(false)
  })
})

describe("helpers", () => {
  it("hasPropaleType considère N/A et vide comme absents", () => {
    expect(hasPropaleType("")).toBe(false)
    expect(hasPropaleType("N/A")).toBe(false)
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
