import React from 'react';
import { Idea, IdeaStatus } from '../types';
import { Card } from './ui/Card';

interface IdeaCardProps {
  idea: Idea;
  onSelect: (id: string) => void;
  isEvaluationMode?: boolean;
  isSelectedForEvaluation?: boolean;
  onSelectForEvaluation?: (id: string) => void;
}

const StatusBadge: React.FC<{ status: IdeaStatus; isEvaluating?: boolean }> = ({ status, isEvaluating }) => {
  if (isEvaluating) {
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 animate-pulse">Evaluating...</span>;
  }
  
  const isPublished = status === IdeaStatus.PUBLISHED;
  const badgeClasses = `px-2 py-1 text-xs font-semibold rounded-full ${
    isPublished ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  }`;
  return <span className={badgeClasses}>{status}</span>;
};

const EvaluationScore: React.FC<{ evaluation: Idea['evaluation'] }> = ({ evaluation }) => {
    if (!evaluation) return null;

    const avgScore = (
        evaluation.desirability.score +
        evaluation.feasibility.score +
        evaluation.viability.score
    ) / 3;

    return (
        <div className="mt-4 flex items-center text-brand-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-semibold">AI Score: {avgScore.toFixed(1)}</span>
        </div>
    );
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onSelect, isEvaluationMode, isSelectedForEvaluation, onSelectForEvaluation }) => {
  const isEligibleForEvaluation = isEvaluationMode && idea.status === IdeaStatus.PUBLISHED && !idea.evaluation && !idea.isEvaluating;

  const handleClick = () => {
    if (isEligibleForEvaluation && onSelectForEvaluation) {
      onSelectForEvaluation(idea.id);
    } else if (!isEvaluationMode) {
      onSelect(idea.id);
    }
  };

  const getCardClasses = () => {
    if (!isEvaluationMode) return '';
    if (isEligibleForEvaluation) {
      return isSelectedForEvaluation ? 'ring-2 ring-brand-primary ring-offset-2' : 'cursor-pointer opacity-70 hover:opacity-100';
    }
    return 'opacity-30 cursor-not-allowed';
  };

  return (
    <div className={`relative transition-all duration-300 ${getCardClasses()}`}>
      <Card onClick={handleClick}>
        {isEligibleForEvaluation && isSelectedForEvaluation && (
            <div className="absolute top-4 right-4 bg-brand-primary text-white rounded-full p-1 z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            </div>
        )}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white truncate pr-4">{idea.title}</h3>
          <StatusBadge status={idea.status} isEvaluating={idea.isEvaluating} />
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-6 h-24 overflow-hidden text-ellipsis">
          {idea.description}
        </p>
        <div className="flex justify-between items-center">
          {idea.status === IdeaStatus.PUBLISHED && (
              <div className="flex items-center text-rose-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">{idea.votes} Votes</span>
              </div>
            )}
            <EvaluationScore evaluation={idea.evaluation} />
        </div>
      </Card>
    </div>
  );
};