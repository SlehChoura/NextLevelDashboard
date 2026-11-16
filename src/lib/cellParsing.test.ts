import { describe, expect, it } from "vitest"
import { cellNumber, isNotApplicable, localIsoDate, parseDateCell, parseNumber, readYesNo, toYesNo } from "./cellParsing"

describe("parseNumber", () => {
  it("lit nombres, virgule décimale, séparateurs de milliers et % final", () => {
    expect(parseNumber(12)).toBe(12)
    expect(parseNumber("11,5")).toBe(11.5)
    expect(parseNumber("75 %")).toBe(75)
    expect(parseNumber("75%")).toBe(75)
    expect(parseNumber("1 234")).toBe(1234)
    expect(parseNumber("1 234,5")).toBe(1234.5)
  })

  it("renvoie null pour une cellule vide ou illisible (une cellule vide ne vaut pas 0)", () => {
    expect(parseNumber("")).toBeNull()
    expect(parseNumber("  ")).toBeNull()
    expect(parseNumber(null)).toBeNull()
    expect(parseNumber("beaucoup")).toBeNull()
  })
})

describe("cellNumber", () => {
  it("ramène une cellule au format pourcentage sur l'échelle affichée", () => {
    expect(cellNumber(1, "100%")).toBe(100)
    expect(cellNumber(0.755, "75.5%")).toBe(75.5)
    expect(cellNumber(1, "1")).toBe(1)
    expect(cellNumber("75 %", "75 %")).toBe(75)
  })
})

describe("isNotApplicable", () => {
  it("reconnaît N/A seul ou suivi d'un commentaire", () => {
    for (const v of ["", "N/A", "n/a", "NA", "n.a.", "n_a", "N/A\nUse case interne uniquement", "N/A – usage interne"]) {
      expect(isNotApplicable(v), v).toBe(true)
    }
    for (const v of ["Nantes", "Non", "Oui", "naïf"]) expect(isNotApplicable(v), v).toBe(false)
  })
})

describe("readYesNo / toYesNo", () => {
  it("compte « Non » les réponses négatives, même commentées", () => {
    for (const v of ["", "Non", "non", "NO", "Non prévu", "Non (T1)", "N/A", "N/A\nUse case interne", "N/A – usage interne", "-", "0"]) {
      expect(readYesNo(v), v).toEqual({ value: "non", recognised: true })
    }
  })

  it("compte « Oui » les réponses positives, liens compris", () => {
    for (const v of ["Oui", "oui", "OUI (v2)", "Yes", "X", "x", "Fait", "Lien Deck", "https://sharepoint/propale.pptx", "1"]) {
      expect(readYesNo(v), v).toEqual({ value: "oui", recognised: true })
    }
  })

  it("reconnaît « en cours » et ses variantes", () => {
    for (const v of ["En cours", "en_cours", "En cours de rédaction", "WIP", "À venir"]) expect(toYesNo(v), v).toBe("en_cours")
  })

  it("compte « Non » une valeur inconnue, et la signale comme non reconnue", () => {
    expect(readYesNo("peut-être")).toEqual({ value: "non", recognised: false })
    expect(readYesNo("Nantes")).toEqual({ value: "non", recognised: false })
  })
})

describe("parseDateCell", () => {
  it("garde le jour d'une date Excel, qu'elle arrive à minuit local ou à minuit UTC", () => {
    // Minuit heure locale : ce que renvoie SheetJS à un navigateur à Paris (14/11 23:00 UTC).
    expect(parseDateCell(new Date(2026, 10, 15))).toBe("2026-11-15")
    expect(parseDateCell(new Date(Date.UTC(2026, 10, 15)))).toBe("2026-11-15")
  })

  it("lit un numéro de série Excel, AAAA-MM-JJ et JJ/MM/AAAA", () => {
    expect(parseDateCell(46341)).toBe("2026-11-15")
    expect(parseDateCell("2026-11-15")).toBe("2026-11-15")
    expect(parseDateCell("15/11/2026")).toBe("2026-11-15")
    expect(parseDateCell("5/1/2027")).toBe("2027-01-05")
    expect(parseDateCell("15.11.26")).toBe("2026-11-15")
  })

  it("distingue une cellule vide (\"\") d'une date illisible (null)", () => {
    expect(parseDateCell("")).toBe("")
    expect(parseDateCell(undefined)).toBe("")
    expect(parseDateCell("demain")).toBeNull()
    expect(parseDateCell("31/02/2026")).toBeNull()
    expect(parseDateCell(3)).toBeNull()
  })
})

describe("localIsoDate", () => {
  it("formate la date dans le fuseau de l'utilisateur", () => {
    expect(localIsoDate(new Date(2026, 10, 16, 0, 30))).toBe("2026-11-16")
  })
})
