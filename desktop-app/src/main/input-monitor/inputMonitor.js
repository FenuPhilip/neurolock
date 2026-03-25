import * as hook from "uiohook-napi"

// 🔥 FORCE correct instance extraction
const uIOhook =
  hook?.uIOhook ||
  hook?.default?.uIOhook ||
  hook?.default ||
  hook

// 🔍 DEBUG — MUST SEE THIS
console.log("🧠 uIOhook resolved:", uIOhook)

// 🔥 metrics
let scrollEvents = 0
let typingEvents = 0
let mouseMoves = 0

// ----------------------------
// 🎯 EVENT LISTENERS
// ----------------------------

// ⚠️ Attach ONLY AFTER confirming instance
if (!uIOhook || typeof uIOhook.on !== "function") {
  console.error("❌ uIOhook is invalid:", uIOhook)
} else {

  // SCROLL
  uIOhook.on("wheel", (e) => {
    console.log("🔥 SCROLL EVENT", e)   // 🔥 MUST PRINT
    scrollEvents++
  })

  // KEYBOARD
  uIOhook.on("keydown", () => {
    typingEvents++
  })

  // MOUSE MOVE
  uIOhook.on("mousemove", () => {
    mouseMoves++
  })
}

// ----------------------------
// 🚀 START MONITORING
// ----------------------------
export function startInputMonitoring() {
  console.log("✅ Starting input monitoring...")

  try {
    uIOhook.start()
    console.log("✅ uIOhook started")
  } catch (err) {
    console.error("❌ Failed to start uIOhook:", err)
  }
}

// ----------------------------
// 📊 GET METRICS
// ----------------------------
export function getInputMetrics() {
  const data = {
    scrollEvents,
    scrollSpeed: scrollEvents,
    typingRate: typingEvents,
    mouseMovement: mouseMoves,
    timestamp: Date.now()
  }

  // 🔥 RESET AFTER READ
  scrollEvents = 0
  typingEvents = 0
  mouseMoves = 0

  return data
}