import { Idea, IdeaStatus, IdeaEvaluation, EvaluationCriteria } from '../types';
import { ApiIdea, ApiEvaluationCriteria } from '../api';

export function convertApiIdeaToIdea(apiIdea: ApiIdea): Idea {
  const evaluation: IdeaEvaluation | undefined = apiIdea.evaluation ? {
    summary: apiIdea.evaluation.summary,
    desirability: apiIdea.evaluation.desirability,
    feasibility: apiIdea.evaluation.feasibility,
    viability: apiIdea.evaluation.viability
  } : undefined;

  return {
    id: apiIdea.id,
    title: apiIdea.title,
    description: apiIdea.description,
    status: apiIdea.status as IdeaStatus,
    votes: apiIdea.votes,
    clusterName: apiIdea.cluster_name,
    isEvaluating: apiIdea.is_evaluating,
    isClassifying: apiIdea.is_classifying,
    evaluation
  };
}

export function convertApiCriteriaToEvaluationCriteria(apiCriteria: ApiEvaluationCriteria): EvaluationCriteria {
  return {
    desirability: apiCriteria.desirability,
    feasibility: apiCriteria.feasibility,
    viability: apiCriteria.viability
  };
}

export function convertEvaluationCriteriaToApi(criteria: EvaluationCriteria) {
  return {
    desirability: criteria.desirability,
    feasibility: criteria.feasibility,
    viability: criteria.viability
  };
}