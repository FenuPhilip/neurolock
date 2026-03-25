import { BrowserWindow, screen } from "electron"

let blurWindow = null

export function applyBlur() {
  if (blurWindow) return

  console.log("🌫️ BLUR APPLIED")

  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  blurWindow = new BrowserWindow({
    width,
    height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    fullscreen: true,
    focusable: false,
    skipTaskbar: true
  })

  blurWindow.setAlwaysOnTop(true, "screen-saver")
  blurWindow.setVisibleOnAllWorkspaces(true)

  blurWindow.loadURL(`
    data:text/html,
    <html>
      <body style="
        margin:0;
        backdrop-filter: blur(10px);
        background: rgba(0,0,0,0.2);
      ">
      </body>
    </html>
  `)
}

export function removeBlur() {
  if (!blurWindow) return

  console.log("🔥 BLUR REMOVED")

  blurWindow.close()
  blurWindow = null
}