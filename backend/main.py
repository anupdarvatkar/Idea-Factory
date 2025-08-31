from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import csv
import io
from datetime import datetime
import uuid

from database import get_db, create_tables, Idea, EvaluationCriteria
from schemas import (
    IdeaCreate, IdeaUpdate, IdeaResponse, 
    EvaluationCriteriaCreate, EvaluationCriteriaResponse,
    ClusterConfig, IdeaCluster, SingleClusterSuggestion,
    EvaluationRequest, IdeaStatus
)
from ai_service import AIService

app = FastAPI(title="Idea Factory API", version="1.0.0")

# Create tables on startup
create_tables()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_service = AIService()

@app.get("/")
async def root():
    return {"message": "Idea Factory API"}

# Ideas endpoints
@app.post("/api/ideas", response_model=IdeaResponse)
async def create_idea(idea: IdeaCreate, db: Session = Depends(get_db)):
    db_idea = Idea(
        id=str(uuid.uuid4()),
        title=idea.title,
        description=idea.description,
        status="DRAFT",
        votes=0
    )
    db.add(db_idea)
    db.commit()
    db.refresh(db_idea)
    return format_idea_response(db_idea)

@app.get("/api/ideas", response_model=List[IdeaResponse])
async def get_ideas(db: Session = Depends(get_db)):
    ideas = db.query(Idea).all()
    return [format_idea_response(idea) for idea in ideas]

@app.get("/api/ideas/{idea_id}", response_model=IdeaResponse)
async def get_idea(idea_id: str, db: Session = Depends(get_db)):
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    return format_idea_response(idea)

@app.put("/api/ideas/{idea_id}", response_model=IdeaResponse)
async def update_idea(idea_id: str, idea_update: IdeaUpdate, db: Session = Depends(get_db)):
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    for field, value in idea_update.dict(exclude_unset=True).items():
        setattr(idea, field, value)
    
    idea.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(idea)
    return format_idea_response(idea)

@app.delete("/api/ideas/{idea_id}")
async def delete_idea(idea_id: str, db: Session = Depends(get_db)):
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    db.delete(idea)
    db.commit()
    return {"message": "Idea deleted successfully"}

@app.post("/api/ideas/{idea_id}/vote", response_model=IdeaResponse)
async def vote_idea(idea_id: str, db: Session = Depends(get_db)):
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    idea.votes += 1
    idea.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(idea)
    return format_idea_response(idea)

@app.post("/api/ideas/{idea_id}/publish", response_model=IdeaResponse)
async def publish_idea(idea_id: str, db: Session = Depends(get_db)):
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    idea.status = "PUBLISHED"
    idea.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(idea)
    return format_idea_response(idea)

# File upload endpoints
@app.post("/api/ideas/upload")
async def upload_ideas(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.csv', '.json')):
        raise HTTPException(status_code=400, detail="Only CSV and JSON files are supported")
    
    content = await file.read()
    content_str = content.decode('utf-8')
    
    ideas_data = []
    
    if file.filename.endswith('.csv'):
        csv_reader = csv.DictReader(io.StringIO(content_str))
        ideas_data = list(csv_reader)
    else:
        ideas_data = json.loads(content_str)
    
    created_ideas = []
    for item in ideas_data:
        if 'title' in item and 'description' in item and item['title'] and item['description']:
            db_idea = Idea(
                id=str(uuid.uuid4()),
                title=item['title'],
                description=item['description'],
                status="DRAFT",
                votes=0
            )
            db.add(db_idea)
            created_ideas.append(db_idea)
    
    db.commit()
    return {"message": f"Successfully uploaded {len(created_ideas)} ideas"}

# Evaluation criteria endpoints
@app.get("/api/evaluation-criteria", response_model=Optional[EvaluationCriteriaResponse])
async def get_evaluation_criteria(db: Session = Depends(get_db)):
    criteria = db.query(EvaluationCriteria).first()
    return criteria

@app.post("/api/evaluation-criteria", response_model=EvaluationCriteriaResponse)
async def create_or_update_evaluation_criteria(criteria: EvaluationCriteriaCreate, db: Session = Depends(get_db)):
    existing = db.query(EvaluationCriteria).first()
    
    if existing:
        existing.desirability = criteria.desirability
        existing.feasibility = criteria.feasibility
        existing.viability = criteria.viability
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    else:
        db_criteria = EvaluationCriteria(**criteria.dict())
        db.add(db_criteria)
        db.commit()
        db.refresh(db_criteria)
        return db_criteria

# AI endpoints
@app.post("/api/ideas/evaluate")
async def evaluate_ideas(request: EvaluationRequest, db: Session = Depends(get_db)):
    # Get evaluation criteria
    criteria = db.query(EvaluationCriteria).first()
    if not criteria:
        raise HTTPException(status_code=400, detail="Evaluation criteria not set")
    
    criteria_dict = {
        "desirability": criteria.desirability,
        "feasibility": criteria.feasibility,
        "viability": criteria.viability
    }
    
    # Set ideas as evaluating
    db.query(Idea).filter(Idea.id.in_(request.idea_ids)).update(
        {"is_evaluating": True}, synchronize_session=False
    )
    db.commit()
    
    try:
        for idea_id in request.idea_ids:
            idea = db.query(Idea).filter(Idea.id == idea_id).first()
            if not idea:
                continue
            
            idea_data = {"title": idea.title, "description": idea.description}
            evaluation = await ai_service.evaluate_idea(idea_data, criteria_dict)
            
            # Update idea with evaluation results
            idea.evaluation_summary = evaluation["summary"]
            idea.desirability_score = evaluation["desirability"]["score"]
            idea.desirability_reasoning = evaluation["desirability"]["reasoning"]
            idea.feasibility_score = evaluation["feasibility"]["score"]
            idea.feasibility_reasoning = evaluation["feasibility"]["reasoning"]
            idea.viability_score = evaluation["viability"]["score"]
            idea.viability_reasoning = evaluation["viability"]["reasoning"]
            idea.is_evaluating = False
            idea.updated_at = datetime.utcnow()
        
        db.commit()
        return {"message": f"Successfully evaluated {len(request.idea_ids)} ideas"}
    
    except Exception as e:
        # Reset evaluating status on error
        db.query(Idea).filter(Idea.id.in_(request.idea_ids)).update(
            {"is_evaluating": False}, synchronize_session=False
        )
        db.commit()
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

@app.post("/api/ideas/cluster")
async def cluster_ideas(config: ClusterConfig, db: Session = Depends(get_db)):
    ideas = db.query(Idea).all()
    if not ideas:
        raise HTTPException(status_code=400, detail="No ideas found to cluster")
    
    ideas_data = [{"id": idea.id, "title": idea.title, "description": idea.description} for idea in ideas]
    
    try:
        clusters = await ai_service.cluster_ideas(ideas_data, config.dict())
        return clusters
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Clustering failed: {str(e)}")

@app.post("/api/ideas/save-clusters")
async def save_clusters(clusters: List[IdeaCluster], db: Session = Depends(get_db)):
    try:
        # Create a mapping of idea ID to cluster name
        idea_cluster_map = {}
        for cluster in clusters:
            for idea_id in cluster.ideaIds:
                idea_cluster_map[idea_id] = cluster.clusterName
        
        # Update ideas with cluster names
        for idea_id, cluster_name in idea_cluster_map.items():
            idea = db.query(Idea).filter(Idea.id == idea_id).first()
            if idea:
                idea.cluster_name = cluster_name
                idea.updated_at = datetime.utcnow()
        
        db.commit()
        return {"message": f"Successfully saved clusters for {len(idea_cluster_map)} ideas"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save clusters: {str(e)}")

@app.post("/api/ideas/{idea_id}/classify")
async def classify_single_idea(idea_id: str, db: Session = Depends(get_db)):
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    # Set idea as classifying
    idea.is_classifying = True
    db.commit()
    
    try:
        # Get existing clusters
        clustered_ideas = db.query(Idea).filter(Idea.cluster_name.isnot(None)).all()
        existing_clusters = {}
        for clustered_idea in clustered_ideas:
            if clustered_idea.cluster_name not in existing_clusters:
                existing_clusters[clustered_idea.cluster_name] = []
            existing_clusters[clustered_idea.cluster_name].append(clustered_idea.title)
        
        idea_data = {"title": idea.title, "description": idea.description}
        suggestion = await ai_service.classify_single_idea(idea_data, existing_clusters)
        
        idea.is_classifying = False
        db.commit()
        
        return suggestion
    
    except Exception as e:
        idea.is_classifying = False
        db.commit()
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

@app.post("/api/ideas/{idea_id}/apply-classification")
async def apply_classification(idea_id: str, suggestion: SingleClusterSuggestion, db: Session = Depends(get_db)):
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    idea.cluster_name = suggestion.clusterName
    idea.updated_at = datetime.utcnow()
    db.commit()
    
    return format_idea_response(idea)

@app.delete("/api/ideas/clusters")
async def clear_all_clusters(db: Session = Depends(get_db)):
    db.query(Idea).update({"cluster_name": None}, synchronize_session=False)
    db.commit()
    return {"message": "All clusters cleared successfully"}

def format_idea_response(idea: Idea) -> IdeaResponse:
    evaluation = None
    if idea.evaluation_summary:
        evaluation = {
            "summary": idea.evaluation_summary,
            "desirability": {
                "score": idea.desirability_score,
                "reasoning": idea.desirability_reasoning
            },
            "feasibility": {
                "score": idea.feasibility_score,
                "reasoning": idea.feasibility_reasoning
            },
            "viability": {
                "score": idea.viability_score,
                "reasoning": idea.viability_reasoning
            }
        }
    
    return IdeaResponse(
        id=idea.id,
        title=idea.title,
        description=idea.description,
        status=idea.status,
        votes=idea.votes,
        cluster_name=idea.cluster_name,
        is_evaluating=idea.is_evaluating,
        is_classifying=idea.is_classifying,
        created_at=idea.created_at,
        updated_at=idea.updated_at,
        evaluation=evaluation
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)