import { applyBlur, removeBlur } from "../intervention-engine/actions/blur.js"
import { applyLag, removeLag } from "../intervention-engine/actions/lag.js"
import { freezeScreen, unfreezeScreen, showFreeze, hideFreeze } from "../intervention-engine/actions/freeze.js"

let currentLevel = 0
let lastApp = null

let levelStartTime = Date.now()
let productiveStartTime = null

export function handleIntervention(level, currentApp) {

  const appName = currentApp?.appName || ""
  const title = currentApp?.windowTitle?.toLowerCase() || ""

  // ----------------------------
  // 🧠 SOCIAL DETECTION
  // ----------------------------
  const isSocial =
    title.includes("youtube") ||
    title.includes("instagram") ||
    title.includes("facebook")

  // ----------------------------
  // 🧠 PRODUCTIVE DETECTION
  // ----------------------------
  const isProductive =
    title.includes("code") ||
    title.includes("visual studio") ||
    title.includes("github") ||
    title.includes("docs")

  // ----------------------------
  // 🧼 RESET AFTER 10s PRODUCTIVE
  // ----------------------------
  if (isProductive) {
    if (!productiveStartTime) productiveStartTime = Date.now()

    if (Date.now() - productiveStartTime > 10000) {
      console.log("🧼 PRODUCTIVE RESET")
      resetAll()
      currentLevel = 0
      levelStartTime = Date.now()
      return
    }
  } else {
    productiveStartTime = null
  }

  // ----------------------------
  // 🔁 TRACK APP (NO RESET)
  // ----------------------------
  lastApp = appName

  const targetLevel = mapLevel(level)

  const now = Date.now()
  const timeInLevel = now - levelStartTime

  // ----------------------------
  // 🧠 STEP-BY-STEP ESCALATION
  // ----------------------------
  const nextLevel = currentLevel + 1

  if (targetLevel < nextLevel) return
  if (timeInLevel < 5000) return

  console.log("⚡ Escalating →", nextLevel)

  if (nextLevel === 1) applyLag()
  if (nextLevel === 2) applyBlur()
  if (nextLevel === 3) freezeScreen()

  currentLevel = nextLevel
  levelStartTime = now

  // ----------------------------
  // 👁️ FREEZE VISIBILITY CONTROL
  // ----------------------------
  if (currentLevel === 3) {
    if (isSocial) {
      showFreeze()
    } else {
      hideFreeze()
    }
  }
}

// ----------------------------
// HELPERS
// ----------------------------

function mapLevel(level) {
  switch (level) {
    case "LOW": return 1
    case "MEDIUM": return 2
    case "HIGH": return 3
    default: return 0
  }
}

function resetAll() {
  console.log("🧼 Reset interventions")

  removeLag()
  removeBlur()
  unfreezeScreen()
}