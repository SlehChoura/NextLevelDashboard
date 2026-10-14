import { describe, expect, it } from "vitest"
import { checkCombinedWorkbook } from "./workbookCheck"
import { DASHBOARD_HEADERS } from "./seedData"
import {
  ACTIONS_SHEET_NAME,
  DASHBOARD_SHEET_NAME,
  PILOTAGE_SHEET_NAME,
  KNOWN_REFERENCE_WARNINGS,
  referenceWorkbook,
  workbookFrom,
} from "../test/referenceWorkbook"
import { PILOTAGE_OBJECTIVES } from "./pilotage"

const PIL_HEADERS = ["Clé", "Catégorie", "Indicateur", "Valeur actuelle", "Cible", "Unité"]
const ACT_HEADERS = ["Clé", "Titre", "Porteur", "Clé objectif", "Objectif lié", "Statut", "Échéance"]

/** Toutes les lignes de pilotage valides, pour ne tester qu'une anomalie à la fois. */
const validPilotageRows = PILOTAGE_OBJECTIVES.map((o) => [o.id, "", o.label, o.defaultCurrent, o.target, o.unit])

describe("checkCombinedWorkbook", () => {
  it("ne signale sur le fichier de référence que son écart connu entre onglets", () => {
    expect(checkCombinedWorkbook(referenceWorkbook())).toEqual(KNOWN_REFERENCE_WARNINGS)
  })

  it("compare les chiffres saisis à la fois dans le pilotage et dans l'onglet agents", () => {
    const pilotage = validPilotageRows.map((r) =>
      r[0] === "agents_disponibles" ? [r[0], "", r[2], 3, r[4], r[5]] : r[0] === "publication_ai_showcase" ? [r[0], "", r[2], 1, r[4], r[5]] : r,
    )
    const agentRow = (name: string, showcase: string) => [name, "WIP", 0.5, 0.5, 0.5, 0.5, 0.5, "", 1, showcase]
    const warnings = checkCombinedWorkbook(
      workbookFrom({
        [PILOTAGE_SHEET_NAME]: [PIL_HEADERS, ...pilotage],
        [DASHBOARD_SHEET_NAME]: [DASHBOARD_HEADERS, agentRow("A", "Oui"), agentRow("B", "En cours")],
      }),
    )
    expect(warnings).toEqual([
      expect.stringMatching(/« Agents disponibles » vaut 3 .* compte 2 agents — à vérifier/),
    ])
  })

  it("signale les anomalies de l'onglet pilotage", () => {
    const warnings = checkCombinedWorkbook(
      workbookFrom({
        [PILOTAGE_SHEET_NAME]: [
          PIL_HEADERS,
          ...validPilotageRows.slice(1),
          ["agents_disponibles", "", "Agents industrialisés", 1, 2, ""],
          ["inconnu", "", "Objectif inconnu", 1, 2, ""],
          ["cyber_academy_ia", "", "Cyber Academy avec contenu IA", "beaucoup", 1, ""],
        ],
      }),
    )
    // Lignes ajoutées après les objectifs valides (en-tête en ligne 1, premier objectif retiré).
    const first = PILOTAGE_OBJECTIVES.length + 1
    expect(warnings).toEqual([
      expect.stringMatching(new RegExp(`Ligne ${first} : le libellé « Agents industrialisés » ne correspond pas à la clé « agents_disponibles »`)),
      expect.stringMatching(new RegExp(`Ligne ${first} : objectif « Agents disponibles » en double`)),
      expect.stringMatching(new RegExp(`Ligne ${first + 1} : objectif « Objectif inconnu » inconnu`)),
      expect.stringMatching(new RegExp(`Ligne ${first + 2} : « Valeur actuelle » n'est pas un nombre`)),
    ])
  })

  it("signale un objectif absent du fichier", () => {
    const warnings = checkCombinedWorkbook(workbookFrom({ [PILOTAGE_SHEET_NAME]: [PIL_HEADERS, ...validPilotageRows.slice(1)] }))
    expect(warnings).toEqual([expect.stringMatching(/Objectif « Cyber Academy avec contenu IA » absent du fichier/)])
  })

  it("signale les anomalies de l'onglet actions", () => {
    const warnings = checkCombinedWorkbook(
      workbookFrom({
        [ACTIONS_SHEET_NAME]: [
          ACT_HEADERS,
          ["", "A", "Moi", "description_cicd", "Disponibilité de la chaîne CI/CD", "Fait", "2026-10-01"],
          ["", "B", "Moi", "description_cicd", "Description et How to de la chaîne CI/CD", "Fait", "2026-10-01"],
          ["", "a ", "", "inconnu", "", "Peut-être", "bientôt"],
          ["", "", "Moi", "", "", "", ""],
        ],
      }),
    )
    expect(warnings).toEqual([
      expect.stringMatching(/Ligne 2 : « Clé objectif » .* ne désignent pas le même objectif/),
      expect.stringMatching(/Ligne 4 : action « a » en double/),
      expect.stringMatching(/Ligne 4 : action « a » sans porteur/),
      expect.stringMatching(/Ligne 4 : objectif lié « inconnu » inconnu/),
      expect.stringMatching(/Ligne 4 : statut « Peut-être » non reconnu/),
      expect.stringMatching(/Ligne 4 : échéance « bientôt » illisible/),
      expect.stringMatching(/Ligne 5 : action sans titre/),
    ])
  })

  it("détecte des en-têtes décalés dans l'onglet agents", () => {
    // Cas réel (1re version du fichier) : une colonne de liens a été insérée en I sans décaler les
    // en-têtes — « Nombre de missions » se retrouve au-dessus des liens, et les nombres de
    // missions en colonne K, sans en-tête.
    const warnings = checkCombinedWorkbook(
      workbookFrom({
        [DASHBOARD_SHEET_NAME]: [
          DASHBOARD_HEADERS,
          ["Kovex", "WIP", 1, 0.75, "N/A", 0.25, "bientôt", "Lien Deck", "AI makers - Kovex", "Oui", 2],
          ["Kovex", "WIP"],
          ["", "orphelin"],
        ],
      }),
    )
    expect(warnings).toEqual([
      expect.stringMatching(/G2 \(Kovex\) : « Ready to market » devrait être un pourcentage/),
      expect.stringMatching(/I2 \(Kovex\) : « Nombre de missions réalisées » devrait être un nombre/),
      expect.stringMatching(/K2 \(Kovex\) : valeur « 2 » dans une colonne sans en-tête/),
      expect.stringMatching(/Ligne 3 : agent « Kovex » en double/),
      expect.stringMatching(/Ligne 4 : ligne renseignée sans nom d'agent/),
    ])
  })

  it("signale une colonne attendue absente", () => {
    const headers = DASHBOARD_HEADERS.filter((h) => h !== "Propale type")
    const warnings = checkCombinedWorkbook(workbookFrom({ [DASHBOARD_SHEET_NAME]: [headers, ["Kovex", "WIP"]] }))
    expect(warnings).toEqual([expect.stringMatching(/Colonne attendue « Propale type » absente/)])
  })

  it("accepte un libellé d'objectif repris de l'onglet pilotage du même fichier, même avec une coquille", () => {
    const pilotage = validPilotageRows.map((r) => (r[0] === "description_cicd" ? [r[0], "", "Descripction CI/CD", 60, 100, "%"] : r))
    const warnings = checkCombinedWorkbook(
      workbookFrom({
        [PILOTAGE_SHEET_NAME]: [PIL_HEADERS, ...pilotage],
        [ACTIONS_SHEET_NAME]: [ACT_HEADERS, ["", "A", "Moi", "description_cicd", "Descripction CI/CD", "Fait", ""]],
      }),
    )
    const line = PILOTAGE_OBJECTIVES.findIndex((o) => o.id === "description_cicd") + 2
    expect(warnings).toEqual([expect.stringMatching(new RegExp(`\\[Suivi pilotage\\] Ligne ${line} : le libellé « Descripction CI/CD »`))])
  })

  it("signale une colonne agents non prévue par le modèle", () => {
    const warnings = checkCombinedWorkbook(
      workbookFrom({ [DASHBOARD_SHEET_NAME]: [[...DASHBOARD_HEADERS, "Commentaire"], ["Kovex", "WIP"]] }),
    )
    expect(warnings).toEqual([expect.stringMatching(/Colonne K « Commentaire » non prévue/)])
  })
})
