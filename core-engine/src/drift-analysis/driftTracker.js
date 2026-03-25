import { SystemState } from "../types/state.js"
import { PRODUCTIVE_APPS } from "../constants/apps.js"

export class DriftTracker {
  currentPath = []
  currentSession = null

  track(appName, state) {
    if (!this.currentPath.includes(appName)) {
      this.currentPath.push(appName)
    }

    if (state === SystemState.DOOMSCROLL && !this.currentSession) {
      const origin = this.currentPath.find(app =>
        PRODUCTIVE_APPS.includes(app)
      ) || "UNKNOWN"

      this.currentSession = {
        origin,
        path: [...this.currentPath],
        doomscrollDuration: 0,
        startTime: Date.now()
      }
    }

    if (state === SystemState.RECOVERY && this.currentSession) {
      this.currentSession.endTime = Date.now()
      this.currentSession.doomscrollDuration =
        this.currentSession.endTime - this.currentSession.startTime

      const completedSession = this.currentSession

      this.reset()

      return completedSession
    }

    return null
  }

  reset() {
    this.currentPath = []
    this.currentSession = null
  }
}