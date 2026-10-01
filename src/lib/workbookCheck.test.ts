import { describe, expect, it } from "vitest"
import { checkCombinedWorkbook } from "./workbookCheck"
import { DASHBOARD_HEADERS } from "./seedData"
import {
  ACTIONS_SHEET_NAME,
  DASHBOARD_SHEET_NAME,
  PILOTAGE_SHEET_NAME,
  referenceWorkbook,
  workbookFrom,
} from "../test/referenceWorkbook"
import { PILOTAGE_OBJECTIVES } from "./pilotage"

const PIL_HEADERS = ["Clé", "Catégorie", "Indicateur", "Valeur actuelle", "Cible", "Unité"]
const ACT_HEADERS = ["Clé", "Titre", "Porteur", "Clé objectif", "Objectif lié", "Statut", "Échéance"]

/** Toutes les lignes de pilotage valides, pour ne tester qu'une anomalie à la fois. */
const validPilotageRows = PILOTAGE_OBJECTIVES.map((o) => [o.id, "", o.label, o.defaultCurrent, o.target, o.unit])

describe("checkCombinedWorkbook", () => {
  it("ne signale rien sur le fichier de référence", () => {
    expect(checkCombinedWorkbook(referenceWorkbook())).toEqual([])
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
    expect(warnings).toEqual([
      expect.stringMatching(/Ligne 12 : le libellé « Agents industrialisés » ne correspond pas à la clé « agents_disponibles »/),
      expect.stringMatching(/Ligne 12 : objectif « Agents disponibles » en double/),
      expect.stringMatching(/Ligne 13 : objectif « Objectif inconnu » inconnu/),
      expect.stringMatching(/Ligne 14 : « Valeur actuelle » n'est pas un nombre/),
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
    expect(warnings).toEqual([expect.stringMatching(/\[Suivi pilotage\] Ligne 10 : le libellé « Descripction CI\/CD »/)])
  })

  it("signale une colonne agents non prévue par le modèle", () => {
    const warnings = checkCombinedWorkbook(
      workbookFrom({ [DASHBOARD_SHEET_NAME]: [[...DASHBOARD_HEADERS, "Commentaire"], ["Kovex", "WIP"]] }),
    )
    expect(warnings).toEqual([expect.stringMatching(/Colonne K « Commentaire » non prévue/)])
  })
})
