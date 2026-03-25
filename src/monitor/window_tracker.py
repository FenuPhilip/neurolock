import pygetwindow as gw
import time
import threading

# Categorization logic
PRODUCTIVE_KEYWORDS = ["Visual Studio Code", "Code", "Notepad", "Word", "Termius", "Terminal", "Documentation", "Stack Overflow", "cmd", "PowerShell", "Command Prompt", "NeuroLock", "React"]
NON_PRODUCTIVE_KEYWORDS = ["Instagram", "Facebook", "YouTube", "TikTok", "Reddit", "Twitter", "X", "Netflix", "Prime Video", "Discord", "Steam", "LinkedIn"]

def categorize_window(title: str) -> str:
    title_lower = title.lower()
    for kw in NON_PRODUCTIVE_KEYWORDS:
        if kw.lower() in title_lower:
            return "Non-Productive"
    
    for kw in PRODUCTIVE_KEYWORDS:
        if kw.lower() in title_lower:
            return "Productive"
    
    return "Neutral"

class WindowTracker:
    def __init__(self, callback):
        self.callback = callback
        self.running = False
        self._thread = None
        self.last_title = ""

    def start(self):
        self.running = True
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()

    def stop(self):
        self.running = False
        if self._thread:
            self._thread.join(timeout=2)

    def _loop(self):
        while self.running:
            try:
                active_window = gw.getActiveWindow()
                if active_window is not None:
                    title = active_window.title
                    if title != self.last_title and title.strip() != "":
                        self.last_title = title
                        category = categorize_window(title)
                        self.callback(title, category)
            except Exception as e:
                pass # Ignore occasional pygetwindow errors (e.g. when locking screen)
            
            time.sleep(1.0)
