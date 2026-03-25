import { activeWindow } from "get-windows"

export async function getActiveApp() {
  try {
    const win = await activeWindow()

    if (!win) {
      return {
        appName: "",
        windowTitle: ""
      }
    }

    return {
      appName: win.owner?.name || "",
      windowTitle: win.title || ""
    }

  } catch (err) {
    console.error("❌ getActiveApp error:", err)

    return {
      appName: "",
      windowTitle: ""
    }
  }
}