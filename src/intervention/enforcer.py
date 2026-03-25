import sys
import threading
from PyQt6.QtWidgets import QApplication, QWidget
from PyQt6.QtCore import Qt, QTimer

class BoredomOverlay(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowFlags(
            Qt.WindowType.WindowStaysOnTopHint |
            Qt.WindowType.FramelessWindowHint |
            Qt.WindowType.Tool |
            Qt.WindowType.WindowTransparentForInput
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents)
        
        # Cover all screens
        screens = QApplication.screens()
        geometry = screens[0].geometry()
        for screen in screens[1:]:
            geometry = geometry.united(screen.geometry())
            
        self.setGeometry(geometry)
        
        # We start fully invisible
        self.setStyleSheet("background-color: rgba(128, 128, 128, 0);")
        self.current_opacity = 0
        self.target_opacity = 0
        self.active = False
        
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_fade)
        self.timer.start(100)  # 10 fps fade

    def set_active(self, active: bool):
        self.active = active
        # Target opacity 180 (out of 255) for a very annoying gray wash over the screen
        self.target_opacity = 180 if active else 0

    def update_fade(self):
        if self.current_opacity < self.target_opacity:
            self.current_opacity = min(self.target_opacity, self.current_opacity + 10)
            self.setStyleSheet(f"background-color: rgba(128, 128, 128, {self.current_opacity});")
            if self.current_opacity > 0 and not self.isVisible():
                self.show()
        elif self.current_opacity > self.target_opacity:
            self.current_opacity = max(self.target_opacity, self.current_opacity - 10)
            self.setStyleSheet(f"background-color: rgba(128, 128, 128, {self.current_opacity});")
            if self.current_opacity <= 0 and self.isVisible():
                self.hide()


class InterventionEngine:
    def __init__(self):
        self.app = None
        self.overlay = None
        self._thread = None
        self.ready_event = threading.Event()

    def _run_app(self):
        self.app = QApplication(sys.argv)
        self.overlay = BoredomOverlay()
        self.ready_event.set()
        self.app.exec()

    def start(self):
        self._thread = threading.Thread(target=self._run_app, daemon=True)
        self._thread.start()
        self.ready_event.wait() # wait until QApplication is running

    def set_intervention_active(self, active: bool):
        if self.overlay:
            # Must safely call qt methods from another thread? 
            # In PyQt6, it's safer to use QTimer.singleShot but for simple properties it often works.
            # Best practice is to use signals, but directly setting target opacity should be fine here as it's read by the QTimer running in the main Qt thread.
            self.overlay.set_active(active)
