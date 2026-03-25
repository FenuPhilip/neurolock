import { SystemState } from "../types/state.js"

export class StateManager {
  currentState = SystemState.IDLE

  getState() {
    return this.currentState
  }

  updateState(newState) {
    if (this.currentState !== newState) {
      this.currentState = newState
      return true
    }
    return false
  }
}