import { describe, expect, it } from "vitest"
import { isChunkLoadError } from "./staleVersion"

describe("fichier de page introuvable après une mise en ligne", () => {
  it("reconnaît les erreurs de chargement de page des navigateurs", () => {
    // Chrome / Edge, Safari, Firefox.
    expect(isChunkLoadError(new TypeError("Failed to fetch dynamically imported module: https://x/assets/ActionsPage-abc.js"))).toBe(true)
    expect(isChunkLoadError(new TypeError("Importing a module script failed."))).toBe(true)
    expect(isChunkLoadError(new TypeError("error loading dynamically imported module"))).toBe(true)
  })

  it("ne confond pas une autre erreur avec une mise en ligne", () => {
    expect(isChunkLoadError(new TypeError("Cannot read properties of undefined (reading 'map')"))).toBe(false)
    expect(isChunkLoadError(undefined)).toBe(false)
  })
})
