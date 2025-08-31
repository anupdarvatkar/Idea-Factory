import React from 'react';
import { Idea, IdeaStatus, IdeaCluster } from '../types';
import { IdeaCard } from './IdeaCard';
import { Button } from './ui/Button';
import { IdeaTable } from './IdeaTable';
import { Pagination } from './ui/Pagination';
import { ClusterView } from './ClusterView';

const SparkleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const ClusterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0112 3c2.757 0 5.223 1.243 6.95 3.236C21.5 8.236 22 11 22 13c-1-1-1.343-2.343-1.343-2.343s-2 2-2.657 2.657m0 0a8 8 0 01-9.313-9.313" />
    </svg>
);


const CancelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

type SortableKeys = keyof Pick<Idea, 'title' | 'status' | 'votes' | 'clusterName'> | 'ai_score';
type ColumnFilters = { title: string; status: string; votes: string; ai_score: string; clusterName: string };


interface IdeaListProps {
  ideas: Idea[];
  allIdeas: Idea[];
  onSelectIdea: (id: string) => void;
  onAddNew: () => void;
  currentFilter: IdeaStatus | 'ALL';
  onFilterChange: (status: IdeaStatus | 'ALL') => void;
  hasIdeas: boolean;
  isEvaluationMode: boolean;
  selectedForEvaluation: string[];
  onSelectIdeaForEvaluation: (id: string) => void;
  onToggleEvaluationMode: () => void;
  onDownloadIdeas: () => void;
  listViewMode: 'card' | 'table';
  onListViewModeChange: (mode: 'card' | 'table') => void;
  columnFilters: ColumnFilters;
  onColumnFilterChange: (column: keyof ColumnFilters, value: string) => void;
  sortConfig: { key: SortableKeys; direction: 'ascending' | 'descending' } | null;
  onRequestSort: (key: SortableKeys) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onClusterIdeas: () => void;
  isClustering: boolean;
  clusterResults: IdeaCluster[] | null;
  onClearClusters: () => void;
  onSaveClusters: () => void;
  hasSavedClusters: boolean;
  onClearAllSavedClusters: () => void;
}

const FilterControls: React.FC<Pick<IdeaListProps, 'currentFilter' | 'onFilterChange'>> = ({ currentFilter, onFilterChange }) => {
    const filters: (IdeaStatus | 'ALL')[] = ['ALL', IdeaStatus.DRAFT, IdeaStatus.PUBLISHED];
    
    const getButtonText = (filter: IdeaStatus | 'ALL') => {
        if (filter === 'ALL') return 'All';
        if (filter === IdeaStatus.DRAFT) return 'Drafts';
        if (filter === IdeaStatus.PUBLISHED) return 'Published';
    }

    return (
        <div className="flex space-x-2 md:space-x-4">
            {filters.map(filter => (
                <button
                    key={filter}
                    onClick={() => onFilterChange(filter)}
                    className={`px-4 py-2 text-sm md:text-base font-semibold rounded-full transition-colors ${
                        currentFilter === filter
                        ? 'bg-brand-primary text-white shadow'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                    {getButtonText(filter)}
                </button>
            ))}
        </div>
    );
};

const ViewModeToggle: React.FC<{
  currentMode: 'card' | 'table';
  onChange: (mode: 'card' | 'table') => void;
}> = ({ currentMode, onChange }) => (
    <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
        <button onClick={() => onChange('card')} className={`p-2 rounded-md ${currentMode === 'card' ? 'bg-white dark:bg-slate-800 shadow' : ''}`} aria-label="Card View">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
        </button>
        <button onClick={() => onChange('table')} className={`p-2 rounded-md ${currentMode === 'table' ? 'bg-white dark:bg-slate-800 shadow' : ''}`} aria-label="Table View">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
        </button>
    </div>
);


export const IdeaList: React.FC<IdeaListProps> = ({ 
    ideas, 
    allIdeas,
    onSelectIdea, 
    onAddNew, 
    currentFilter, 
    onFilterChange, 
    hasIdeas, 
    isEvaluationMode, 
    selectedForEvaluation, 
    onSelectIdeaForEvaluation, 
    onToggleEvaluationMode, 
    onDownloadIdeas, 
    listViewMode, 
    onListViewModeChange,
    columnFilters,
    onColumnFilterChange,
    sortConfig,
    onRequestSort,
    currentPage,
    totalPages,
    onPageChange,
    onClusterIdeas,
    isClustering,
    clusterResults,
    onClearClusters,
    onSaveClusters,
    hasSavedClusters,
    onClearAllSavedClusters,
}) => {
  if (!hasIdeas) {
    return (
      <div className="text-center animate-fade-in">
        <h2 className="text-2xl font-semibold mb-4">No ideas yet!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Be the first to create a brilliant idea.</p>
        <Button onClick={onAddNew}>Create First Idea</Button>
      </div>
    );
  }

  const ClusteringLoader = () => (
    <div className="text-center my-16 animate-fade-in">
      <div className="inline-block w-12 h-12 border-4 border-brand-primary border-dashed rounded-full animate-spin mb-4"></div>
      <h2 className="text-2xl font-semibold text-brand-primary">AI is Analyzing...</h2>
      <p className="text-slate-500 dark:text-slate-400 mt-2">Grouping similar ideas into clusters. This may take a moment.</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center space-x-4">
            {(!isEvaluationMode && !clusterResults) && (
                <>
                    <FilterControls currentFilter={currentFilter} onFilterChange={onFilterChange} />
                    <ViewModeToggle currentMode={listViewMode} onChange={onListViewModeChange} />
                </>
            )}
             {clusterResults && (
                 <h2 className="text-2xl font-bold">AI Cluster Preview</h2>
             )}
        </div>
        <div className="flex items-center space-x-2">
            {!isEvaluationMode && !clusterResults && (
              <>
                <Button onClick={onDownloadIdeas} variant="secondary">
                  <DownloadIcon /> Download
                </Button>
                 <Button onClick={onClusterIdeas} variant="secondary">
                  <ClusterIcon /> Cluster Ideas
                </Button>
                {hasSavedClusters && (
                  <Button onClick={onClearAllSavedClusters} variant="danger">
                     <TrashIcon /> Clear All Clusters
                  </Button>
                )}
              </>
            )}
            {clusterResults && (
                <>
                    <Button onClick={onClearClusters} variant="secondary">
                        <CancelIcon /> Discard
                    </Button>
                    <Button onClick={onSaveClusters} variant="success">
                        <SaveIcon /> Save Clusters
                    </Button>
                </>
            )}
            <Button onClick={onToggleEvaluationMode} variant={isEvaluationMode ? 'danger' : 'secondary'}>
                {isEvaluationMode ? (
                  <>
                    <CancelIcon /> Cancel
                  </>
                ) : (
                  <>
                    <SparkleIcon /> Evaluate Ideas
                  </>
                )}
            </Button>
        </div>
      </div>
      
      {isClustering ? <ClusteringLoader /> : clusterResults ? (
        <ClusterView clusters={clusterResults} ideas={allIdeas} onSelectIdea={onSelectIdea} />
      ) : ideas.length > 0 ? (
        <>
            {listViewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {ideas.map((idea) => (
                  <IdeaCard 
                    key={idea.id} 
                    idea={idea} 
                    onSelect={onSelectIdea}
                    isEvaluationMode={isEvaluationMode}
                    onSelectForEvaluation={onSelectIdeaForEvaluation}
                    isSelectedForEvaluation={selectedForEvaluation.includes(idea.id)}
                  />
                ))}
              </div>
            ) : (
              <IdeaTable 
                ideas={ideas}
                onSelectIdea={onSelectIdea}
                isEvaluationMode={isEvaluationMode}
                selectedForEvaluation={selectedForEvaluation}
                onSelectIdeaForEvaluation={onSelectIdeaForEvaluation}
                sortConfig={sortConfig}
                onRequestSort={onRequestSort}
                columnFilters={columnFilters}
                onColumnFilterChange={onColumnFilterChange}
              />
            )}
            {listViewMode === 'table' && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            )}
        </>
      ) : (
        <div className="text-center mt-16">
            <h2 className="text-2xl font-semibold mb-4">No ideas match your filters.</h2>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
};