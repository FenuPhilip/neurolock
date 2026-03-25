import time
import threading
from datetime import datetime, timezone
from src.db.database import SessionLocal
from src.db.models import Session, DriftEvent

# Configuration
DOOM_SCROLLING_THRESHOLD_SCROLLS = 30
DOOM_SCROLLING_THRESHOLD_TIME = 10  # Evaluate every 10 seconds

class StateMachine:
    def __init__(self, intervention_callback):
        self.intervention_callback = intervention_callback
        self.current_session_id = None
        self.current_category = None
        self.last_productive_session_id = None
        self.current_drift_event_id = None
        
        self.is_doom_scrolling = False
        
        # We will keep a background thread that periodically evaluates input metrics
        self.input_tracker = None
        self._eval_thread = None
        self.running = False
        self._lock = threading.Lock()

    def set_input_tracker(self, tracker):
        self.input_tracker = tracker

    def start(self):
        self.running = True
        self._eval_thread = threading.Thread(target=self._evaluation_loop, daemon=True)
        self._eval_thread.start()

    def stop(self):
        self.running = False
        if self._eval_thread:
            self._eval_thread.join(timeout=2)

    def on_window_changed(self, title: str, category: str):
        with self._lock:
            # Provide app name as first word of title
            app_name = title.split("-")[-1].strip() if "-" in title else title
            
            db = SessionLocal()
            now = datetime.now(timezone.utc)
            
            # Close previous session
            if self.current_session_id:
                prev_session = db.query(Session).filter(Session.id == self.current_session_id).first()
                if prev_session:
                    prev_session.end_time = now
                    prev_session.duration_seconds = (now - prev_session.start_time.replace(tzinfo=timezone.utc)).total_seconds()
                    
                    if prev_session.category == "Productive":
                        self.last_productive_session_id = prev_session.id
                        
            # Open new session
            new_session = Session(
                app_name=app_name,
                window_title=title,
                category=category,
                start_time=now
            )
            db.add(new_session)
            db.commit()
            db.refresh(new_session)
            
            self.current_session_id = new_session.id
            self.current_category = category
            
            # Reset doom scrolling state when switching windows
            self.is_doom_scrolling = False
            
            # Check for Drift (Productive -> Non-Productive)
            if category == "Non-Productive" and self.last_productive_session_id:
                drift = DriftEvent(
                    productive_session_id=self.last_productive_session_id,
                    non_productive_session_id=new_session.id,
                    detected_time=now,
                    doom_scrolling_detected=0
                )
                db.add(drift)
                db.commit()
                db.refresh(drift)
                self.current_drift_event_id = drift.id
            else:
                self.current_drift_event_id = None

            db.close()

    def _evaluation_loop(self):
        while self.running:
            time.sleep(DOOM_SCROLLING_THRESHOLD_TIME)
            
            if not self.input_tracker:
                continue
                
            metrics = self.input_tracker.get_metrics_and_reset()
            
            with self._lock:
                if self.current_category == "Non-Productive":
                    # Doom scrolling heuristic: High scrolls, very few keystrokes
                    if metrics["scroll_count"] > DOOM_SCROLLING_THRESHOLD_SCROLLS and metrics["keystroke_count"] < 10:
                        if not self.is_doom_scrolling:
                            self.is_doom_scrolling = True
                            # Log to DB
                            if self.current_drift_event_id:
                                db = SessionLocal()
                                drift = db.query(DriftEvent).filter(DriftEvent.id == self.current_drift_event_id).first()
                                if drift:
                                    drift.doom_scrolling_detected = 1
                                    db.commit()
                                db.close()
                                
                            # Trigger intervention
                            if self.intervention_callback:
                                self.intervention_callback(True)
                    else:
                        if self.is_doom_scrolling:
                            self.is_doom_scrolling = False
                            if self.intervention_callback:
                                self.intervention_callback(False)
