from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    app_name = Column(String, index=True)
    window_title = Column(String)
    category = Column(String)  # "Productive", "Non-Productive", "Neutral"
    start_time = Column(DateTime)
    end_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, default=0.0)

class DriftEvent(Base):
    __tablename__ = "drift_events"
    
    id = Column(Integer, primary_key=True, index=True)
    productive_session_id = Column(Integer)
    non_productive_session_id = Column(Integer)
    detected_time = Column(DateTime)
    doom_scrolling_detected = Column(Integer, default=0)  # Boolean 0 or 1
