import { expect, it } from "vitest"
import { plural } from "./plural"

it("accorde au singulier jusqu'à 1, au pluriel ensuite", () => {
  expect(plural(0, "action")).toBe("0 action")
  expect(plural(1, "action")).toBe("1 action")
  expect(plural(2, "action")).toBe("2 actions")
  expect(plural(3, "objectif atteint", "objectifs atteints")).toBe("3 objectifs atteints")
})
