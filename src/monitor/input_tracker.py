from pynput import mouse, keyboard
import threading
import time

class InputTracker:
    def __init__(self):
        self.scroll_count = 0
        self.keystroke_count = 0
        self.click_count = 0
        self.mouse_move_count = 0
        
        self.running = False
        self._mouse_listener = None
        self._keyboard_listener = None
        self._lock = threading.Lock()

    def start(self):
        self.running = True
        self._mouse_listener = mouse.Listener(
            on_move=self.on_move,
            on_click=self.on_click,
            on_scroll=self.on_scroll
        )
        self._keyboard_listener = keyboard.Listener(
            on_press=self.on_press
        )
        
        self._mouse_listener.start()
        self._keyboard_listener.start()

    def stop(self):
        self.running = False
        if self._mouse_listener:
            self._mouse_listener.stop()
        if self._keyboard_listener:
            self._keyboard_listener.stop()

    def on_move(self, x, y):
        if self.running:
            with self._lock:
                self.mouse_move_count += 1

    def on_click(self, x, y, button, pressed):
        if self.running and pressed:
            with self._lock:
                self.click_count += 1

    def on_scroll(self, x, y, dx, dy):
        if self.running:
            with self._lock:
                # dy is negative for scroll down
                # We primarily care about absolute scrolls
                self.scroll_count += abs(dx) + abs(dy)

    def on_press(self, key):
        if self.running:
            with self._lock:
                self.keystroke_count += 1

    def get_metrics_and_reset(self):
        with self._lock:
            metrics = {
                "scroll_count": self.scroll_count,
                "keystroke_count": self.keystroke_count,
                "click_count": self.click_count,
                "mouse_move_count": self.mouse_move_count
            }
            # Reset
            self.scroll_count = 0
            self.keystroke_count = 0
            self.click_count = 0
            self.mouse_move_count = 0
            return metrics
