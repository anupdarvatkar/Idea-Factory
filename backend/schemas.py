from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class IdeaStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"

class IdeaEvaluation(BaseModel):
    summary: str
    desirability: dict
    feasibility: dict
    viability: dict

class IdeaBase(BaseModel):
    title: str
    description: str

class IdeaCreate(IdeaBase):
    pass

class IdeaUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[IdeaStatus] = None
    votes: Optional[int] = None
    cluster_name: Optional[str] = None

class IdeaResponse(IdeaBase):
    id: str
    status: IdeaStatus
    votes: int
    cluster_name: Optional[str] = None
    is_evaluating: bool
    is_classifying: bool
    created_at: datetime
    updated_at: datetime
    evaluation: Optional[dict] = None
    
    class Config:
        from_attributes = True

class EvaluationCriteriaBase(BaseModel):
    desirability: str
    feasibility: str
    viability: str

class EvaluationCriteriaCreate(EvaluationCriteriaBase):
    pass

class EvaluationCriteriaResponse(EvaluationCriteriaBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ClusterConfig(BaseModel):
    numberOfClusters: int
    clusteringBasis: str

class IdeaCluster(BaseModel):
    clusterName: str
    clusterDescription: str
    ideaIds: List[str]

class SingleClusterSuggestion(BaseModel):
    reasoning: str
    suggestionType: str
    clusterName: str

class EvaluationRequest(BaseModel):
    idea_ids: List[str]