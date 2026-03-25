const SOCIAL_KEYWORDS = ["youtube", "instagram", "facebook", "linkedin"]
const SOCIAL_APPS = ["chrome", "edge", "instagram", "youtube"]

let timeOnSameApp = 0

export function classifyState(currentApp, previousApp) {
  if (!currentApp) return "IDLE"

  const appName = currentApp.appName?.toLowerCase() || ""
  const title = currentApp.windowTitle?.toLowerCase() || ""

  console.log("APP:", appName)
  console.log("TITLE:", title)

  // ----------------------------
  // 🔁 SAME APP TRACKING
  // ----------------------------
  if (previousApp && previousApp.appName === currentApp.appName) {
    timeOnSameApp++
  } else {
    timeOnSameApp = 0
  }

  console.log("TIME ON SAME APP:", timeOnSameApp)

  // ----------------------------
  // 🔥 SOCIAL DETECTION (APP + TITLE)
  // ----------------------------
  const isSocial =
    SOCIAL_APPS.some(app => appName.includes(app)) ||
    SOCIAL_KEYWORDS.some(keyword => title.includes(keyword))

  if (!isSocial) return "IDLE"

  // ----------------------------
  // 🧠 STATE LOGIC
  // ----------------------------
  if (timeOnSameApp > 20) return "DOOMSCROLL"
  if (timeOnSameApp > 10) return "DRIFTING"

  return "IDLE"
}