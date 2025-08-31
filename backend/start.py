#!/usr/bin/env python3
"""
Startup script for the Idea Factory FastAPI backend.
This script initializes the database with default evaluation criteria.
"""

import os
import sys
from sqlalchemy.orm import sessionmaker
from database import engine, create_tables, EvaluationCriteria

def initialize_database():
    """Initialize the database with default data."""
    create_tables()
    
    # Create a session
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Check if evaluation criteria already exist
        existing_criteria = session.query(EvaluationCriteria).first()
        
        if not existing_criteria:
            # Create default evaluation criteria
            default_criteria = EvaluationCriteria(
                desirability="Does this idea solve a real, significant problem for a clear target audience? Is it something people would genuinely want or need?",
                feasibility="Can this idea be built with current technology within a reasonable timeframe and budget? What are the primary technical hurdles?",
                viability="Is there a clear path to creating a sustainable business around this idea? How would it generate revenue, and what is the potential market size?"
            )
            session.add(default_criteria)
            session.commit()
            print("[OK] Default evaluation criteria created")
        else:
            print("[OK] Evaluation criteria already exist")
            
    except Exception as e:
        print(f"[ERROR] Error initializing database: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    print("Initializing Idea Factory database...")
    initialize_database()
    
    # Start the FastAPI server
    import uvicorn
    
    print("Starting FastAPI server on http://localhost:8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)