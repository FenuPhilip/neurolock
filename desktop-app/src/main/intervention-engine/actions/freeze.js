import { BrowserWindow, ipcMain } from "electron"

let freezeWindow = null
let currentAnswer = null

export function freezeScreen() {
  if (freezeWindow) {
    freezeWindow.show()
    return
  }

  console.log("🧊 FREEZE (SOFT MODE)")

  const a = Math.floor(Math.random() * 20) + 1
  const b = Math.floor(Math.random() * 20) + 1
  currentAnswer = a + b

  freezeWindow = new BrowserWindow({
    width: 400,
    height: 250,
    frame: true,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    show: false,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  freezeWindow.center()

  freezeWindow.loadURL(`
    data:text/html,
    <html>
      <body style="
        margin:0;
        background:#111;
        color:white;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        font-family:sans-serif;
      ">
        <h3>🧠 Focus Check</h3>
        <h2>${a} + ${b} = ?</h2>

        <input id="ans" type="number" style="padding:8px;" />
        <button onclick="submit()">Submit</button>

        <script>
          const { ipcRenderer } = require('electron')

          function submit() {
            const val = document.getElementById("ans").value
            ipcRenderer.send("solve-math", val)
          }

          document.getElementById("ans").focus()
        </script>
      </body>
    </html>
  `)

  freezeWindow.once("ready-to-show", () => {
    freezeWindow.show()
  })

  ipcMain.removeAllListeners("solve-math")

  ipcMain.on("solve-math", (e, val) => {
    if (parseInt(val) === currentAnswer) {
      console.log("✅ solved")
      unfreezeScreen()
    } else {
      console.log("❌ wrong")
    }
  })
}

// 👁️ SHOW when in social app
export function showFreeze() {
  if (freezeWindow) freezeWindow.show()
}

// 🙈 HIDE when switching app
export function hideFreeze() {
  if (freezeWindow) freezeWindow.hide()
}

export function unfreezeScreen() {
  if (!freezeWindow) return

  freezeWindow.destroy()
  freezeWindow = null

  ipcMain.removeAllListeners("solve-math")
}