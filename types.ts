export enum IdeaStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface IdeaEvaluation {
  summary: string;
  desirability: {
    score: number;
    reasoning: string;
  };
  feasibility: {
    score: number;
    reasoning: string;
  };
  viability: {
    score: number;
    reasoning: string;
  };
}

export interface EvaluationCriteria {
  desirability: string;
  feasibility: string;
  viability: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  votes: number;
  evaluation?: IdeaEvaluation;
  isEvaluating?: boolean;
  clusterName?: string;
  isClassifying?: boolean;
}

export interface ClusterConfig {
  numberOfClusters: number;
  clusteringBasis: string;
}

export interface IdeaCluster {
  clusterName: string;
  clusterDescription: string;
  ideaIds: string[];
}

export interface SingleClusterSuggestion {
  reasoning: string;
  suggestionType: 'EXISTING_CLUSTER' | 'NEW_CLUSTER';
  clusterName: string;
}
