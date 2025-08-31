import { useState, useEffect } from 'react';
import { Idea, EvaluationCriteria } from '../types';
import { apiService } from '../api';
import { convertApiIdeaToIdea, convertApiCriteriaToEvaluationCriteria, convertEvaluationCriteriaToApi } from '../utils/apiConverter';

export function useApiIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      const apiIdeas = await apiService.getIdeas();
      const convertedIdeas = apiIdeas.map(convertApiIdeaToIdea);
      setIdeas(convertedIdeas);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  const createIdea = async (ideaData: { title: string; description: string }) => {
    try {
      const apiIdea = await apiService.createIdea(ideaData);
      const convertedIdea = convertApiIdeaToIdea(apiIdea);
      setIdeas(prev => [...prev, convertedIdea]);
      return convertedIdea;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create idea');
      throw err;
    }
  };

  const updateIdea = async (id: string, updates: Partial<Idea>) => {
    try {
      const apiUpdates: any = { ...updates };
      if (updates.clusterName !== undefined) {
        apiUpdates.cluster_name = updates.clusterName;
        delete apiUpdates.clusterName;
      }
      if (updates.isEvaluating !== undefined) {
        apiUpdates.is_evaluating = updates.isEvaluating;
        delete apiUpdates.isEvaluating;
      }
      if (updates.isClassifying !== undefined) {
        apiUpdates.is_classifying = updates.isClassifying;
        delete apiUpdates.isClassifying;
      }
      delete apiUpdates.evaluation;

      const apiIdea = await apiService.updateIdea(id, apiUpdates);
      const convertedIdea = convertApiIdeaToIdea(apiIdea);
      setIdeas(prev => prev.map(idea => idea.id === id ? convertedIdea : idea));
      return convertedIdea;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update idea');
      throw err;
    }
  };

  const deleteIdea = async (id: string) => {
    try {
      await apiService.deleteIdea(id);
      setIdeas(prev => prev.filter(idea => idea.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete idea');
      throw err;
    }
  };

  const voteIdea = async (id: string) => {
    try {
      const apiIdea = await apiService.voteIdea(id);
      const convertedIdea = convertApiIdeaToIdea(apiIdea);
      setIdeas(prev => prev.map(idea => idea.id === id ? convertedIdea : idea));
      return convertedIdea;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote on idea');
      throw err;
    }
  };

  const publishIdea = async (id: string) => {
    try {
      const apiIdea = await apiService.publishIdea(id);
      const convertedIdea = convertApiIdeaToIdea(apiIdea);
      setIdeas(prev => prev.map(idea => idea.id === id ? convertedIdea : idea));
      return convertedIdea;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish idea');
      throw err;
    }
  };

  useEffect(() => {
    loadIdeas();
  }, []);

  return {
    ideas,
    setIdeas,
    loading,
    error,
    loadIdeas,
    createIdea,
    updateIdea,
    deleteIdea,
    voteIdea,
    publishIdea
  };
}

export function useApiEvaluationCriteria() {
  const [criteria, setCriteria] = useState<EvaluationCriteria>({
    desirability: 'Does this idea solve a real, significant problem for a clear target audience? Is it something people would genuinely want or need?',
    feasibility: 'Can this idea be built with current technology within a reasonable timeframe and budget? What are the primary technical hurdles?',
    viability: 'Is there a clear path to creating a sustainable business around this idea? How would it generate revenue, and what is the potential market size?',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCriteria = async () => {
    try {
      setLoading(true);
      const apiCriteria = await apiService.getEvaluationCriteria();
      if (apiCriteria) {
        setCriteria(convertApiCriteriaToEvaluationCriteria(apiCriteria));
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load criteria');
    } finally {
      setLoading(false);
    }
  };

  const saveCriteria = async (newCriteria: EvaluationCriteria) => {
    try {
      const apiCriteria = await apiService.saveEvaluationCriteria(convertEvaluationCriteriaToApi(newCriteria));
      setCriteria(convertApiCriteriaToEvaluationCriteria(apiCriteria));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save criteria');
      throw err;
    }
  };

  useEffect(() => {
    loadCriteria();
  }, []);

  return {
    criteria,
    loading,
    error,
    saveCriteria
  };
}