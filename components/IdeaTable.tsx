import React from 'react';
import { Idea, IdeaStatus } from '../types';

const getAvgScore = (idea: Idea): number | null => {
    if (!idea.evaluation) return null;
    return (idea.evaluation.desirability.score + idea.evaluation.feasibility.score + idea.evaluation.viability.score) / 3;
}

const StatusBadge: React.FC<{ status: IdeaStatus; isEvaluating?: boolean }> = ({ status, isEvaluating }) => {
  if (isEvaluating) {
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 animate-pulse">Evaluating...</span>;
  }
  
  const isPublished = status === IdeaStatus.PUBLISHED;
  const badgeClasses = `inline-block px-2 py-1 text-xs font-semibold rounded-full ${
    isPublished ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  }`;
  return <span className={badgeClasses}>{status}</span>;
};

type SortableKeys = keyof Pick<Idea, 'title' | 'status' | 'votes' | 'clusterName'> | 'ai_score';
type ColumnFilters = { title: string; status: string; votes: string; ai_score: string; clusterName: string };

interface IdeaTableProps {
  ideas: Idea[];
  onSelectIdea: (id: string) => void;
  isEvaluationMode: boolean;
  selectedForEvaluation: string[];
  onSelectIdeaForEvaluation: (id: string) => void;
  sortConfig: { key: SortableKeys; direction: 'ascending' | 'descending' } | null;
  onRequestSort: (key: SortableKeys) => void;
  columnFilters: ColumnFilters;
  onColumnFilterChange: (column: keyof ColumnFilters, value: string) => void;
}

export const IdeaTable: React.FC<IdeaTableProps> = ({ ideas, onSelectIdea, isEvaluationMode, selectedForEvaluation, onSelectIdeaForEvaluation, sortConfig, onRequestSort, columnFilters, onColumnFilterChange }) => {
    
    const SortableHeader: React.FC<{ sortKey: SortableKeys, children: React.ReactNode }> = ({ sortKey, children }) => {
        const isSorted = sortConfig?.key === sortKey;
        const directionIcon = sortConfig?.direction === 'ascending' ? '▲' : '▼';
        
        const textClass = isSorted 
            ? 'font-bold text-brand-primary' 
            : 'font-medium text-slate-500 dark:text-slate-300';

        return (
          <th scope="col" className="px-6 py-3 text-left text-xs uppercase tracking-wider">
            <button onClick={() => onRequestSort(sortKey)} className="flex items-center space-x-1 group">
              <span className={textClass}>{children}</span>
              <span className={`transition-opacity duration-200 ${isSorted ? 'opacity-100 text-brand-primary' : 'opacity-0 group-hover:opacity-50 text-slate-500'}`}>
                {directionIcon}
              </span>
            </button>
          </th>
        );
    };

    const FilterInput: React.FC<{ filterKey: keyof ColumnFilters; placeholder: string }> = ({ filterKey, placeholder }) => (
        <th className="px-4 py-2">
            <input
                type="text"
                placeholder={placeholder}
                value={columnFilters[filterKey]}
                onChange={(e) => onColumnFilterChange(filterKey, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-sm px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
        </th>
    );

    return (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                        {isEvaluationMode && <th className="w-12 px-6 py-3"></th>}
                        <SortableHeader sortKey="title">Title</SortableHeader>
                        <SortableHeader sortKey="status">Status</SortableHeader>
                        <SortableHeader sortKey="clusterName">Cluster</SortableHeader>
                        <SortableHeader sortKey="votes">Votes</SortableHeader>
                        <SortableHeader sortKey="ai_score">AI Score</SortableHeader>
                    </tr>
                    {!isEvaluationMode && (
                        <tr>
                            <FilterInput filterKey="title" placeholder="Filter title..." />
                            <FilterInput filterKey="status" placeholder="Filter status..." />
                            <FilterInput filterKey="clusterName" placeholder="Filter cluster..." />
                            <FilterInput filterKey="votes" placeholder=">= Votes" />
                            <FilterInput filterKey="ai_score" placeholder=">= Score" />
                        </tr>
                    )}
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {ideas.map(idea => {
                        const isSelected = selectedForEvaluation.includes(idea.id);
                        const isEligible = isEvaluationMode && idea.status === IdeaStatus.PUBLISHED && !idea.evaluation && !idea.isEvaluating;
                        
                        const handleClick = () => {
                            if (isEligible) {
                                onSelectIdeaForEvaluation(idea.id);
                            } else if (!isEvaluationMode) {
                                onSelectIdea(idea.id);
                            }
                        };
                        
                        const rowClasses = [
                            'transition-colors',
                            !isEvaluationMode && 'hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer',
                            isEvaluationMode && !isEligible && 'opacity-40 cursor-not-allowed',
                            isEvaluationMode && isEligible && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50',
                            isSelected && 'bg-blue-100 dark:bg-blue-900/50',
                        ].filter(Boolean).join(' ');

                        const avgScore = getAvgScore(idea);

                        return (
                            <tr key={idea.id} onClick={handleClick} className={rowClasses}>
                                {isEvaluationMode && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {isEligible && (
                                            <div className={`w-5 h-5 rounded border-2 ${isSelected ? 'bg-brand-primary border-brand-primary' : 'border-slate-300 dark:border-slate-500'} flex items-center justify-center`}>
                                                {isSelected && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                            </div>
                                        )}
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{idea.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={idea.status} isEvaluating={idea.isEvaluating} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                    {idea.clusterName || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                    {idea.votes}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                    {avgScore !== null && avgScore >= 0 ? avgScore.toFixed(1) : 'N/A'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};