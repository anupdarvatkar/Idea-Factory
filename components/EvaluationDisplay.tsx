import React from 'react';
import { IdeaEvaluation } from '../types';
import { Card } from './ui/Card';
import { ScoreBar } from './ui/ScoreBar';

interface EvaluationDisplayProps {
  evaluation: IdeaEvaluation;
}

const CriterionDisplay: React.FC<{ title: string; data: { score: number; reasoning: string } }> = ({ title, data }) => (
  <div>
    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">{title}</h4>
    <ScoreBar score={data.score} label={title} />
    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md">
      {data.reasoning}
    </p>
  </div>
);

export const EvaluationDisplay: React.FC<EvaluationDisplayProps> = ({ evaluation }) => {
  return (
    <div className="my-6 animate-fade-in">
      <h3 className="text-2xl font-bold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-brand-secondary" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
        AI Evaluation
      </h3>
      <Card className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Summary</h4>
            <p className="text-slate-700 dark:text-slate-300 italic">{evaluation.summary}</p>
          </div>
          <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <CriterionDisplay title="Desirability" data={evaluation.desirability} />
            <CriterionDisplay title="Feasibility" data={evaluation.feasibility} />
            <CriterionDisplay title="Viability" data={evaluation.viability} />
          </div>
        </div>
      </Card>
    </div>
  );
};