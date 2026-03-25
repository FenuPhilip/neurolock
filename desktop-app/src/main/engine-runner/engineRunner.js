import { CoreEngine } from "../../../../core-engine/src/index.js"
import { getActiveApp } from "../app-monitor/appMonitor.js"
import { getInputMetrics } from "../input-monitor/inputMonitor.js"
import { handleIntervention } from "./outputHandler.js"

const core = new CoreEngine()

export function startEngine() {
  console.log("🔥 NeuroLock started")

  setInterval(async () => {
    try {
      // ✅ GET REAL APP
      const app = await getActiveApp()

      console.log("ACTIVE APP:", app)

      // ✅ GET INPUT
      const input = getInputMetrics()

      console.log("ENGINE INPUT:", input)

      // ✅ PASS FULL OBJECT (CRITICAL FIX)
      const result = core.process(app, input)

      console.log("STATE:", result.state)
      console.log("INTERVENTION:", result.intervention)

      // ✅ APPLY INTERVENTION
      handleIntervention(result.intervention, app)

    } catch (err) {
      console.error("ENGINE ERROR:", err)
    }
  }, 1000)
}