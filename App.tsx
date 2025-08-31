import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Idea, IdeaStatus, EvaluationCriteria, IdeaEvaluation, ClusterConfig, IdeaCluster, SingleClusterSuggestion } from './types';
import { Header } from './components/Header';
import { IdeaList } from './components/IdeaList';
import { IdeaDetail } from './components/IdeaDetail';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { Button } from './components/ui/Button';
import { ClusterConfigPanel } from './components/ClusterConfigPanel';
import { SingleClusterSuggestionModal } from './components/SingleClusterSuggestionModal';
import { useApiIdeas, useApiEvaluationCriteria } from './hooks/useApiData';
import { apiService } from './api';
import { convertApiIdeaToIdea } from './utils/apiConverter';

type SortableIdeaKeys = keyof Pick<Idea, 'title' | 'status' | 'votes' | 'clusterName'>;
type SortableKeys = SortableIdeaKeys | 'ai_score';

const ITEMS_PER_PAGE = 10;

const App: React.FC = () => {
  const { ideas, setIdeas, loading: ideasLoading, error: ideasError, createIdea, updateIdea, voteIdea, publishIdea } = useApiIdeas();
  const { criteria: evaluationCriteria, loading: criteriaLoading, error: criteriaError, saveCriteria } = useApiEvaluationCriteria();
  
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'dashboard' | 'settings'>('dashboard');
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<IdeaStatus | 'ALL'>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [isEvaluationMode, setIsEvaluationMode] = useState(false);
  const [selectedForEvaluation, setSelectedForEvaluation] = useState<string[]>([]);
  const [listViewMode, setListViewMode] = useState<'card' | 'table'>('card');
  const [columnFilters, setColumnFilters] = useState({ title: '', status: '', votes: '', ai_score: '', clusterName: '' });
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'title', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isClusterConfigOpen, setIsClusterConfigOpen] = useState(false);
  const [isClustering, setIsClustering] = useState(false);
  const [clusterResults, setClusterResults] = useState<IdeaCluster[] | null>(null);
  const [singleClusterSuggestion, setSingleClusterSuggestion] = useState<SingleClusterSuggestion | null>(null);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Combine errors from different sources
  useEffect(() => {
    const combinedError = ideasError || criteriaError;
    setError(combinedError);
  }, [ideasError, criteriaError]);

  const handleSelectIdea = (id: string) => {
    setSelectedIdeaId(id);
    setCurrentView('detail');
    setError(null);
  };
  
  const handleGoToDashboard = () => {
    setSelectedIdeaId(null);
    setCurrentView('dashboard');
    setError(null);
    setIsEvaluationMode(false);
  };

  const handleGoToList = () => {
    setSelectedIdeaId(null);
    setCurrentView('list');
    setError(null);
  };

  const handleGoToSettings = () => {
    setSelectedIdeaId(null);
    setCurrentView('settings');
    setError(null);
    setIsEvaluationMode(false);
  };

  const handleAddNew = () => {
    setSelectedIdeaId(null);
    setCurrentView('detail');
    setError(null);
    setIsEvaluationMode(false);
  };

  const handleSaveIdea = async (ideaData: Omit<Idea, 'id' | 'status' | 'votes' | 'evaluation' | 'isEvaluating' | 'isClassifying' | 'clusterName'>) => {
    try {
      if (selectedIdeaId) {
        await updateIdea(selectedIdeaId, ideaData);
        setCurrentView('detail');
      } else {
        const newIdea = await createIdea(ideaData);
        setSelectedIdeaId(newIdea.id);
        setCurrentView('detail');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save idea');
    }
  };

  const handlePublishIdea = async () => {
    if (!selectedIdeaId) return;
    try {
      await publishIdea(selectedIdeaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish idea');
    }
  };

  const handleVote = async () => {
    if (!selectedIdeaId) return;
    try {
      await voteIdea(selectedIdeaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote');
    }
  };

  const handleToggleEvaluationMode = () => {
    setIsEvaluationMode(prev => !prev);
    setSelectedForEvaluation([]);
    setError(null);
  };
  
  const handleSelectIdeaForEvaluation = (ideaId: string) => {
    setSelectedForEvaluation(prev => prev.includes(ideaId) ? prev.filter(id => id !== ideaId) : [...prev, ideaId]);
  };
  
  const handleStartEvaluation = async () => {
    if (selectedForEvaluation.length === 0) return;
    
    // Set ideas as evaluating locally for immediate UI feedback
    setIdeas(prevIdeas => prevIdeas.map(idea => 
      selectedForEvaluation.includes(idea.id) ? { ...idea, isEvaluating: true } : idea
    ));
    setIsEvaluationMode(false);
    
    try {
      await apiService.evaluateIdeas(selectedForEvaluation);
      // Refresh ideas to get updated evaluation data
      const updatedIdeas = await apiService.getIdeas();
      setIdeas(updatedIdeas.map(convertApiIdeaToIdea));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate ideas');
      // Reset evaluating status on error
      setIdeas(prevIdeas => prevIdeas.map(idea => 
        selectedForEvaluation.includes(idea.id) ? { ...idea, isEvaluating: false } : idea
      ));
    } finally {
      setSelectedForEvaluation([]);
    }
  };

  const handleDownloadIdeas = () => {
    const headers = [
      'ID', 'Title', 'Description', 'Status', 'Votes', 'Cluster',
      'AI Evaluation Summary',
      'AI Desirability Score', 'AI Desirability Reasoning',
      'AI Feasibility Score', 'AI Feasibility Reasoning',
      'AI Viability Score', 'AI Viability Reasoning'
    ];

    const csvRows = [headers.join(',')];

    ideas.forEach(idea => {
      const row = [
        escapeCsvField(idea.id),
        escapeCsvField(idea.title),
        escapeCsvField(idea.description),
        escapeCsvField(idea.status),
        escapeCsvField(idea.votes),
        escapeCsvField(idea.clusterName || ''),
        escapeCsvField(idea.evaluation?.summary || ''),
        escapeCsvField(idea.evaluation?.desirability.score || ''),
        escapeCsvField(idea.evaluation?.desirability.reasoning || ''),
        escapeCsvField(idea.evaluation?.feasibility.score || ''),
        escapeCsvField(idea.evaluation?.feasibility.reasoning || ''),
        escapeCsvField(idea.evaluation?.viability.score || ''),
        escapeCsvField(idea.evaluation?.viability.reasoning || '')
      ];
      csvRows.push(row.join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ideas.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const escapeCsvField = (field: string | number): string => {
    const stringField = String(field);
    if (/[",\n]/.test(stringField)) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  const handleDownloadTemplate = () => {
    const headers = ['title', 'description'];
    const exampleRow = [
      '"Your Brilliant Idea Title"',
      '"A detailed, compelling description of your idea, explaining the problem it solves and its potential impact."'
    ];
    
    const csvContent = [
      headers.join(','),
      exampleRow.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ideas_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadIdeas = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await apiService.uploadIdeas(file);
      // Refresh ideas list
      const updatedIdeas = await apiService.getIdeas();
      setIdeas(updatedIdeas.map(convertApiIdeaToIdea));
      handleGoToList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload ideas');
    } finally {
      if (event.target) event.target.value = '';
    }
  };
  
  const getAvgScore = (idea: Idea): number | null => {
    if (!idea.evaluation) return null;
    return (idea.evaluation.desirability.score + idea.evaluation.feasibility.score + idea.evaluation.viability.score) / 3;
  }
  
  const handleStartClustering = async (config: ClusterConfig) => {
    setIsClustering(true);
    setIsClusterConfigOpen(false);
    setError(null);
    
    try {
      const clusters = await apiService.clusterIdeas(config);
      setClusterResults(clusters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cluster ideas');
    } finally {
      setIsClustering(false);
    }
  };

  const handleSaveClusters = async () => {
    if (!clusterResults) return;

    try {
      await apiService.saveClusters(clusterResults);
      // Refresh ideas to get updated cluster data
      const updatedIdeas = await apiService.getIdeas();
      setIdeas(updatedIdeas.map(convertApiIdeaToIdea));
      setClusterResults(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save clusters');
    }
  };

  const handleClearAllSavedClusters = async () => {
    try {
      await apiService.clearAllClusters();
      // Refresh ideas to reflect cleared clusters
      const updatedIdeas = await apiService.getIdeas();
      setIdeas(updatedIdeas.map(convertApiIdeaToIdea));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear clusters');
    }
  };

  const handleClassifySingleIdea = async (ideaId: string) => {
    try {
      // Set idea as classifying locally for immediate UI feedback
      setIdeas(prev => prev.map(i => (i.id === ideaId ? { ...i, isClassifying: true } : i)));
      
      const suggestion = await apiService.classifySingleIdea(ideaId);
      setSingleClusterSuggestion(suggestion);
      setIsSuggestionModalOpen(true);
      
      // Reset classifying status
      setIdeas(prev => prev.map(i => (i.id === ideaId ? { ...i, isClassifying: false } : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to classify idea');
      setIdeas(prev => prev.map(i => (i.id === ideaId ? { ...i, isClassifying: false } : i)));
    }
  };
  
  const handleAcceptSuggestion = async () => {
    if (!singleClusterSuggestion || !selectedIdeaId) return;
    
    try {
      const updatedIdea = await apiService.applyClassification(selectedIdeaId, singleClusterSuggestion);
      setIdeas(prev => prev.map(i => i.id === selectedIdeaId ? convertApiIdeaToIdea(updatedIdea) : i));
      setIsSuggestionModalOpen(false);
      setSingleClusterSuggestion(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply classification');
    }
  };
  
  const handleRejectSuggestion = () => {
    setIsSuggestionModalOpen(false);
    setSingleClusterSuggestion(null);
  };

  const processedIdeas = useMemo(() => {
    let processableIdeas = [...ideas];

    // 1. Filter by status buttons
    if (filterStatus !== 'ALL' && !isEvaluationMode) {
      processableIdeas = processableIdeas.filter(idea => idea.status === filterStatus);
    }
    
    // 2. Filter by table columns
    if (listViewMode === 'table') {
        if (columnFilters.title) {
            const lowercasedFilter = columnFilters.title.toLowerCase();
            processableIdeas = processableIdeas.filter(idea => idea.title.toLowerCase().includes(lowercasedFilter));
        }
        if (columnFilters.status) {
            const lowercasedFilter = columnFilters.status.toLowerCase();
            processableIdeas = processableIdeas.filter(idea => idea.status.toLowerCase().includes(lowercasedFilter));
        }
        if (columnFilters.clusterName) {
            const lowercasedFilter = columnFilters.clusterName.toLowerCase();
            processableIdeas = processableIdeas.filter(idea =>
                idea.clusterName?.toLowerCase().includes(lowercasedFilter)
            );
        }
        if (columnFilters.votes) {
            const minVotes = parseFloat(columnFilters.votes);
            if (!isNaN(minVotes)) {
                processableIdeas = processableIdeas.filter(idea => idea.votes >= minVotes);
            }
        }
        if (columnFilters.ai_score) {
            const minScore = parseFloat(columnFilters.ai_score);
            if (!isNaN(minScore)) {
                processableIdeas = processableIdeas.filter(idea => {
                    const score = getAvgScore(idea);
                    return score !== null && score >= minScore;
                });
            }
        }
    }

    // 3. Sort
    if (sortConfig !== null && listViewMode === 'table') {
      processableIdeas.sort((a, b) => {
        let aValue: string | number | undefined;
        let bValue: string | number | undefined;

        if (sortConfig.key === 'ai_score') {
            aValue = getAvgScore(a) ?? -1;
            bValue = getAvgScore(b) ?? -1;
        } else if (sortConfig.key === 'clusterName') {
            aValue = a.clusterName ?? '';
            bValue = b.clusterName ?? '';
        } else {
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
        }

        if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return processableIdeas;
  }, [ideas, filterStatus, isEvaluationMode, listViewMode, columnFilters, sortConfig]);
  
  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, columnFilters]);

  const totalPages = useMemo(() => {
    if (listViewMode !== 'table' || processedIdeas.length === 0) return 1;
    return Math.ceil(processedIdeas.length / ITEMS_PER_PAGE);
  }, [processedIdeas, listViewMode]);
  
  const paginatedIdeas = useMemo(() => {
    if (listViewMode !== 'table') {
      return processedIdeas;
    }
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedIdeas.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedIdeas, currentPage, listViewMode]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handleColumnFilterChange = (column: keyof typeof columnFilters, value: string) => {
    setColumnFilters(prev => ({ ...prev, [column]: value }));
  };

  const selectedIdea = selectedIdeaId ? ideas.find(idea => idea.id === selectedIdeaId) : { title: '', description: '' };
  
  const hasSavedClusters = useMemo(() => ideas.some(idea => !!idea.clusterName), [ideas]);

  const renderContent = () => {
    if (ideasLoading || criteriaLoading) {
      return <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>;
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard ideas={ideas} onSelectIdea={handleSelectIdea} />;
      case 'list':
        return (
          <>
            {isEvaluationMode && (
              <div className="sticky top-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 rounded-lg shadow-lg mb-8 z-10 flex justify-between items-center animate-fade-in">
                <div>
                  <h3 className="text-lg font-semibold">Evaluation Mode</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Select published, unevaluated ideas.</p>
                </div>
                <Button variant="success" onClick={handleStartEvaluation} disabled={selectedForEvaluation.length === 0}>
                  Evaluate ({selectedForEvaluation.length}) Selected
                </Button>
              </div>
            )}
            <IdeaList 
              ideas={paginatedIdeas} 
              allIdeas={ideas}
              onSelectIdea={handleSelectIdea} 
              onAddNew={handleAddNew}
              currentFilter={filterStatus}
              onFilterChange={(s) => { setFilterStatus(s); setClusterResults(null); }}
              hasIdeas={ideas.length > 0}
              isEvaluationMode={isEvaluationMode}
              selectedForEvaluation={selectedForEvaluation}
              onSelectIdeaForEvaluation={handleSelectIdeaForEvaluation}
              onToggleEvaluationMode={handleToggleEvaluationMode}
              onDownloadIdeas={handleDownloadIdeas}
              listViewMode={listViewMode}
              onListViewModeChange={(m) => { setListViewMode(m); setClusterResults(null); }}
              columnFilters={columnFilters}
              onColumnFilterChange={handleColumnFilterChange}
              sortConfig={sortConfig}
              onRequestSort={requestSort}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onClusterIdeas={() => setIsClusterConfigOpen(true)}
              isClustering={isClustering}
              clusterResults={clusterResults}
              onClearClusters={() => setClusterResults(null)}
              onSaveClusters={handleSaveClusters}
              hasSavedClusters={hasSavedClusters}
              onClearAllSavedClusters={handleClearAllSavedClusters}
            />
          </>
        );
      case 'detail':
        if (selectedIdea) {
          return <IdeaDetail idea={selectedIdea} onSave={handleSaveIdea} onPublish={handlePublishIdea} onVote={handleVote} onUploadIdeas={handleUploadIdeas} onDownloadTemplate={handleDownloadTemplate} hasSavedClusters={hasSavedClusters} onClassify={handleClassifySingleIdea} onGoToList={handleGoToList} />;
        }
        return <p>Error: Idea not found.</p>;
      case 'settings':
        return <Settings criteria={evaluationCriteria} onSaveCriteria={saveCriteria} />;
      default:
        return null;
    }
  };
  
  const ErrorDisplay: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 animate-fade-in" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{message}</span>
        <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={onClose}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
        </button>
    </div>
  );

  return (
    <div className="min-h-screen">
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".json,.csv"
      />
      <ClusterConfigPanel
        isOpen={isClusterConfigOpen}
        onClose={() => setIsClusterConfigOpen(false)}
        onStartClustering={handleStartClustering}
        isClustering={isClustering}
      />
      <SingleClusterSuggestionModal
        isOpen={isSuggestionModalOpen}
        suggestion={singleClusterSuggestion}
        onAccept={handleAcceptSuggestion}
        onReject={handleRejectSuggestion}
      />
      <Header 
        onAddNew={handleAddNew} 
        onGoToList={handleGoToList}
        onGoToDashboard={handleGoToDashboard}
        onGoToSettings={handleGoToSettings}
        currentView={currentView}
      />
      <main className="container mx-auto px-4 pb-8">
        {error && <ErrorDisplay message={error} onClose={() => setError(null)} />}
        {renderContent()}
      </main>
    </div>
  );
};

export default App;