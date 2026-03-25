import { classifyState } from "./classifiers/stateClassifier.js"
import { StateManager } from "./state-machine/stateManager.js"
import { DriftTracker } from "./drift-analysis/driftTracker.js"
import { getInterventionLevel } from "./rules/interventionEngine.js"

export class CoreEngine {
  constructor() {
    this.stateManager = new StateManager()
    this.driftTracker = new DriftTracker()

    this.previousApp = null
    this.sessionStartTime = Date.now()
  }

  process(currentApp, input) {

    console.log("ENGINE INPUT:", input)

    // ✅ FIXED
    const state = classifyState(currentApp, this.previousApp)

    const stateChanged = this.stateManager.updateState(state)

    if (stateChanged) {
      this.sessionStartTime = Date.now()
    }

    const driftData = this.driftTracker.track(
      currentApp?.appName || "unknown",
      state
    )

    const intervention = getInterventionLevel(
      state,
      Date.now() - this.sessionStartTime,
      3
    )

    this.previousApp = currentApp

    return {
      state,
      stateChanged,
      intervention,
      driftData
    }
  }
}