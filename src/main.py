import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session as DBSession
from src.db.database import init_db, SessionLocal
from src.db.models import Session, DriftEvent
from src.monitor.window_tracker import WindowTracker
from src.monitor.input_tracker import InputTracker
from src.monitor.state_machine import StateMachine
from src.intervention.enforcer import InterventionEngine
import uvicorn

# Global components
input_tracker = InputTracker()
intervention_engine = InterventionEngine()
state_machine = StateMachine(intervention_engine.set_intervention_active)
window_tracker = WindowTracker(state_machine.on_window_changed)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    
    # 1. Start input tracker
    input_tracker.start()
    
    # 2. Start state machine
    state_machine.set_input_tracker(input_tracker)
    state_machine.start()
    
    # 3. Start window tracker
    window_tracker.start()
    
    # 4. Start intervention engine (requires a thread since it runs QApplication)
    intervention_engine.start()
    
    print("NeuroLock background service fully started.")
    yield
    # Shutdown
    window_tracker.stop()
    state_machine.stop()
    input_tracker.stop()
    print("NeuroLock background service stopped.")

app = FastAPI(title="NeuroLock API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/sessions")
def get_sessions():
    db = SessionLocal()
    sessions = db.query(Session).order_by(Session.start_time.desc()).limit(100).all()
    db.close()
    return sessions

@app.get("/api/drifts")
def get_drifts():
    db = SessionLocal()
    drifts = db.query(DriftEvent).order_by(DriftEvent.detected_time.desc()).limit(50).all()
    results = []
    for d in drifts:
        prod = db.query(Session).filter(Session.id == d.productive_session_id).first()
        non_prod = db.query(Session).filter(Session.id == d.non_productive_session_id).first()
        if prod and non_prod:
            results.append({
                "id": d.id,
                "detected_time": d.detected_time,
                "is_doom_scrolling": bool(d.doom_scrolling_detected),
                "from_app": prod.app_name,
                "from_title": prod.window_title,
                "to_app": non_prod.app_name,
                "to_title": non_prod.window_title,
                "duration": non_prod.duration_seconds
            })
    db.close()
    return results

@app.get("/api/status")
def get_status():
    return {
        "status": "running",
        "current_state": "Doom Scrolling" if state_machine.is_doom_scrolling else state_machine.current_category,
        "current_window": window_tracker.last_title
    }

def run_api():
    uvicorn.run("src.main:app", host="127.0.0.1", port=8000, reload=False)

if __name__ == "__main__":
    run_api()
