import { applyBlur } from "./actions/blur.js"
import { applyLag } from "./actions/lag.js"
import { applyFreeze } from "./actions/freeze.js"

let currentLevel = "NONE"

export function handleIntervention(level) {
  if (level === currentLevel) return
  currentLevel = level

  console.log("⚡ Intervention Triggered:", level)

  switch (level) {
    case "LOW":
      applyLag(100)
      break

    case "MEDIUM":
      applyBlur()
      applyLag(200)
      break

    case "HIGH":
      applyFreeze()
      break

    case "NONE":
    default:
      resetAll()
      break
  }
}

function resetAll() {
  console.log("🔄 Resetting interventions")

  // optional: you can later remove blur, stop lag etc.
}