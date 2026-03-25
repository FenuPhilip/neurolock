// ----------------------------
// 🐌 LAG STATE
// ----------------------------
let lagInterval = null
let lagStrength = 0

// ----------------------------
// 🐌 APPLY LAG
// ----------------------------
export function applyLag() {
  if (lagInterval) return // already running

  console.log("🐌 LAG APPLIED")

  lagStrength = 100

  lagInterval = setInterval(() => {
    const start = Date.now()

    // 🔥 block event loop (fake lag)
    while (Date.now() - start < lagStrength) {}

  }, 300)
}

// ----------------------------
// 🔥 REMOVE LAG
// ----------------------------
export function removeLag() {
  if (!lagInterval) return

  console.log("🔥 LAG REMOVED")

  clearInterval(lagInterval)
  lagInterval = null
  lagStrength = 0
}