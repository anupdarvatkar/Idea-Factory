from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./idea_factory.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Idea(Base):
    __tablename__ = "ideas"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    status = Column(String, default="DRAFT")  # DRAFT or PUBLISHED
    votes = Column(Integer, default=0)
    cluster_name = Column(String, nullable=True)
    is_evaluating = Column(Boolean, default=False)
    is_classifying = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # AI Evaluation fields
    evaluation_summary = Column(Text, nullable=True)
    desirability_score = Column(Float, nullable=True)
    desirability_reasoning = Column(Text, nullable=True)
    feasibility_score = Column(Float, nullable=True)
    feasibility_reasoning = Column(Text, nullable=True)
    viability_score = Column(Float, nullable=True)
    viability_reasoning = Column(Text, nullable=True)

class EvaluationCriteria(Base):
    __tablename__ = "evaluation_criteria"
    
    id = Column(Integer, primary_key=True, index=True)
    desirability = Column(Text)
    feasibility = Column(Text)
    viability = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()