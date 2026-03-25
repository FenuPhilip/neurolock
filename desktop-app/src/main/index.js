import { app } from "electron"
import { startEngine } from "./engine-runner/engineRunner.js"

// 🔥 keep app alive even when all windows close
app.on("window-all-closed", (e) => {
  e.preventDefault()
})

app.whenReady().then(() => {
  console.log("NeuroLock started")
  startEngine()
})