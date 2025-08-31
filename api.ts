const API_BASE_URL = 'http://localhost:8000/api';

export interface ApiIdea {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED';
  votes: number;
  cluster_name?: string;
  is_evaluating: boolean;
  is_classifying: boolean;
  created_at: string;
  updated_at: string;
  evaluation?: {
    summary: string;
    desirability: { score: number; reasoning: string };
    feasibility: { score: number; reasoning: string };
    viability: { score: number; reasoning: string };
  };
}

export interface ApiEvaluationCriteria {
  id: number;
  desirability: string;
  feasibility: string;
  viability: string;
  created_at: string;
  updated_at: string;
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

class ApiService {
  // Ideas endpoints
  async getIdeas(): Promise<ApiIdea[]> {
    const response = await fetch(`${API_BASE_URL}/ideas`);
    if (!response.ok) throw new Error('Failed to fetch ideas');
    return response.json();
  }

  async getIdea(id: string): Promise<ApiIdea> {
    const response = await fetch(`${API_BASE_URL}/ideas/${id}`);
    if (!response.ok) throw new Error('Failed to fetch idea');
    return response.json();
  }

  async createIdea(idea: { title: string; description: string }): Promise<ApiIdea> {
    const response = await fetch(`${API_BASE_URL}/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(idea),
    });
    if (!response.ok) throw new Error('Failed to create idea');
    return response.json();
  }

  async updateIdea(id: string, updates: Partial<ApiIdea>): Promise<ApiIdea> {
    const response = await fetch(`${API_BASE_URL}/ideas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update idea');
    return response.json();
  }

  async deleteIdea(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/ideas/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete idea');
  }

  async voteIdea(id: string): Promise<ApiIdea> {
    const response = await fetch(`${API_BASE_URL}/ideas/${id}/vote`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to vote on idea');
    return response.json();
  }

  async publishIdea(id: string): Promise<ApiIdea> {
    const response = await fetch(`${API_BASE_URL}/ideas/${id}/publish`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to publish idea');
    return response.json();
  }

  async uploadIdeas(file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/ideas/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload ideas');
    return response.json();
  }

  // Evaluation endpoints
  async evaluateIdeas(ideaIds: string[]): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/ideas/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea_ids: ideaIds }),
    });
    if (!response.ok) throw new Error('Failed to evaluate ideas');
    return response.json();
  }

  async getEvaluationCriteria(): Promise<ApiEvaluationCriteria | null> {
    const response = await fetch(`${API_BASE_URL}/evaluation-criteria`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch evaluation criteria');
    return response.json();
  }

  async saveEvaluationCriteria(criteria: {
    desirability: string;
    feasibility: string;
    viability: string;
  }): Promise<ApiEvaluationCriteria> {
    const response = await fetch(`${API_BASE_URL}/evaluation-criteria`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(criteria),
    });
    if (!response.ok) throw new Error('Failed to save evaluation criteria');
    return response.json();
  }

  // Clustering endpoints
  async clusterIdeas(config: ClusterConfig): Promise<IdeaCluster[]> {
    const response = await fetch(`${API_BASE_URL}/ideas/cluster`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error('Failed to cluster ideas');
    return response.json();
  }

  async saveClusters(clusters: IdeaCluster[]): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/ideas/save-clusters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clusters),
    });
    if (!response.ok) throw new Error('Failed to save clusters');
    return response.json();
  }

  async classifySingleIdea(ideaId: string): Promise<SingleClusterSuggestion> {
    const response = await fetch(`${API_BASE_URL}/ideas/${ideaId}/classify`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to classify idea');
    return response.json();
  }

  async applyClassification(ideaId: string, suggestion: SingleClusterSuggestion): Promise<ApiIdea> {
    const response = await fetch(`${API_BASE_URL}/ideas/${ideaId}/apply-classification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(suggestion),
    });
    if (!response.ok) throw new Error('Failed to apply classification');
    return response.json();
  }

  async clearAllClusters(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/ideas/clusters`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to clear clusters');
    return response.json();
  }
}

export const apiService = new ApiService();