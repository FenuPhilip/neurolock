import { SystemState } from "../types/state.js"

export const InterventionLevel = "NONE" | "MILD" | "MEDIUM" | "AGGRESSIVE"

export function getInterventionLevel(
  state,
  doomscrollDuration,
  userAggression
) {

  if (state !== SystemState.DOOMSCROLL) return "NONE"

  const score = userAggression + doomscrollDuration / 60000

  if (score < 3) return "MILD"
  if (score < 7) return "MEDIUM"
  return "AGGRESSIVE"
}