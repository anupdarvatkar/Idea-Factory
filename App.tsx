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
import useLocalStorage from './hooks/useLocalStorage';

const sampleIdeas: Idea[] = [
    { id: '1', title: 'AI-Powered Personal Gardener', description: 'A small robot that tends to your indoor plants, monitoring soil moisture, sunlight, and providing water. It uses machine learning to identify plant species and their specific needs.', status: IdeaStatus.PUBLISHED, votes: 12, isEvaluating: false },
    { id: '2', title: 'Augmented Reality Board Games', description: 'Classic board games like Chess or Settlers of Catan brought to life with AR. Pieces animate, and special effects appear on the board when viewed through a smartphone.', status: IdeaStatus.PUBLISHED, votes: 25, isEvaluating: false },
    { id: '3', title: 'Subscription Box for Global Snacks', description: 'A monthly delivery service that curates and sends a collection of unique snacks and candies from a different country each month.', status: IdeaStatus.DRAFT, votes: 0, isEvaluating: false },
    { id: '4', title: 'Smart Bike Lock with GPS Tracking', description: 'A bike lock that not only secures your bike but also tracks its location in real-time and sends an alert to your phone if it\'s tampered with.', status: IdeaStatus.PUBLISHED, votes: 8, isEvaluating: false },
    { id: '5', title: 'Virtual Reality Language Immersion', description: 'Learn a new language by "visiting" a virtual city where you can interact with AI-powered characters and practice conversation in realistic scenarios.', status: IdeaStatus.DRAFT, votes: 0, isEvaluating: false },
];

const defaultCriteria: EvaluationCriteria = {
    desirability: 'Does this idea solve a real, significant problem for a clear target audience? Is it something people would genuinely want or need?',
    feasibility: 'Can this idea be built with current technology within a reasonable timeframe and budget? What are the primary technical hurdles?',
    viability: 'Is there a clear path to creating a sustainable business around this idea? How would it generate revenue, and what is the potential market size?',
};

type SortableIdeaKeys = keyof Pick<Idea, 'title' | 'status' | 'votes' | 'clusterName'>;
type SortableKeys = SortableIdeaKeys | 'ai_score';

const ITEMS_PER_PAGE = 10;

const App: React.FC = () => {
  const [ideas, setIdeas] = useLocalStorage<Idea[]>('ideas', sampleIdeas);
  const [evaluationCriteria, setEvaluationCriteria] = useLocalStorage<EvaluationCriteria>('evaluationCriteria', defaultCriteria);
  
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

  const handleSaveIdea = (ideaData: Omit<Idea, 'id' | 'status' | 'votes' | 'evaluation' | 'isEvaluating' | 'isClassifying' | 'clusterName'>) => {
    if (selectedIdeaId) {
      setIdeas(prevIdeas => prevIdeas.map(idea => idea.id === selectedIdeaId ? { ...idea, ...ideaData } : idea));
      setCurrentView('detail');
    } else {
      const newIdea: Idea = {
        ...ideaData,
        id: new Date().toISOString(),
        status: IdeaStatus.DRAFT,
        votes: 0,
      };
      setIdeas(prevIdeas => [...prevIdeas, newIdea]);
      setSelectedIdeaId(newIdea.id);
      setCurrentView('detail');
    }
  };

  const handlePublishIdea = () => {
    if (!selectedIdeaId) return;
    setIdeas(prevIdeas => prevIdeas.map(idea => idea.id === selectedIdeaId ? { ...idea, status: IdeaStatus.PUBLISHED } : idea));
  };

  const handleVote = () => {
    if (!selectedIdeaId) return;
    setIdeas(prevIdeas => prevIdeas.map(idea => idea.id === selectedIdeaId ? { ...idea, votes: idea.votes + 1 } : idea));
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
    
    setIdeas(prevIdeas => prevIdeas.map(idea => selectedForEvaluation.includes(idea.id) ? { ...idea, isEvaluating: true } : idea));
    setIsEvaluationMode(false);
    
    try {
      const { GoogleGenAI, Type } = await import('@google/genai');

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: 'A brief, one-paragraph summary of the AI\'s overall impression of the idea.' },
          desirability: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: 'A score from 1 to 10.' },
              reasoning: { type: Type.STRING, description: 'Detailed reasoning for the score, based on the provided criteria.' },
            },
          },
          feasibility: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: 'A score from 1 to 10.' },
              reasoning: { type: Type.STRING, description: 'Detailed reasoning for the score, based on the provided criteria.' },
            },
          },
          viability: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: 'A score from 1 to 10.' },
              reasoning: { type: Type.STRING, description: 'Detailed reasoning for the score, based on the provided criteria.' },
            },
          },
        },
      };

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const evaluationPromises = selectedForEvaluation.map(async (ideaId) => {
        const ideaToEvaluate = ideas.find(i => i.id === ideaId);
        if (!ideaToEvaluate) return;

        const prompt = `
          Please evaluate the following business/product idea based on the provided criteria.
          
          Idea Title: "${ideaToEvaluate.title}"
          Idea Description: "${ideaToEvaluate.description}"

          Evaluation Criteria:
          1. Desirability: ${evaluationCriteria.desirability}
          2. Feasibility: ${evaluationCriteria.feasibility}
          3. Viability: ${evaluationCriteria.viability}

          Provide a score from 1-10 for each criterion, with 1 being the lowest and 10 being the highest.
          Also provide detailed reasoning for each score.
          Return the entire response as a JSON object that conforms to the specified schema.
        `;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema,
          },
        });
        
        const evaluationResult = JSON.parse(response.text) as IdeaEvaluation;
        
        setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, evaluation: evaluationResult, isEvaluating: false } : i));
      });

      await Promise.all(evaluationPromises);

    } catch (e: any) {
      setError(`Error calling Gemini API: ${e.message}`);
      setIdeas(prevIdeas => prevIdeas.map(idea => selectedForEvaluation.includes(idea.id) ? { ...idea, isEvaluating: false } : idea));
    } finally {
        setSelectedForEvaluation([]);
    }
  };

  const escapeCsvField = (field: string | number): string => {
    const stringField = String(field);
    if (/[",\n]/.test(stringField)) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File content is not readable.");
        
        let uploadedIdeas: { title: string; description: string }[];

        if (file.name.endsWith('.csv')) {
            const lines = text.trim().split(/\r?\n/);
            if (lines.length < 2) throw new Error("CSV file must have a header and at least one data row.");
            
            const parseCsvLine = (line: string): string[] => {
                const result: string[] = [];
                let currentField = '';
                let inQuotedField = false;
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (inQuotedField) {
                        if (char === '"') {
                            if (i + 1 < line.length && line[i + 1] === '"') {
                                currentField += '"';
                                i++;
                            } else {
                                inQuotedField = false;
                            }
                        } else {
                            currentField += char;
                        }
                    } else {
                        if (char === '"') {
                            inQuotedField = true;
                        } else if (char === ',') {
                            result.push(currentField);
                            currentField = '';
                        } else {
                            currentField += char;
                        }
                    }
                }
                result.push(currentField);
                return result;
            };

            const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
            const titleIndex = headers.indexOf('title');
            const descriptionIndex = headers.indexOf('description');

            if (titleIndex === -1 || descriptionIndex === -1) {
                throw new Error("CSV file must contain 'title' and 'description' columns.");
            }
            
            uploadedIdeas = lines.slice(1).map(line => {
                const values = parseCsvLine(line);
                return {
                    title: values[titleIndex] || '',
                    description: values[descriptionIndex] || '',
                };
            });

        } else if (file.name.endsWith('.json')) {
            const parsedJson = JSON.parse(text);
            if (!Array.isArray(parsedJson)) throw new Error("JSON file must contain an array of ideas.");
            uploadedIdeas = parsedJson;
        } else {
            throw new Error("Unsupported file type. Please upload a .json or .csv file.");
        }

        const newIdeas: Idea[] = uploadedIdeas.map((item: any): Idea | null => {
            if (typeof item.title !== 'string' || typeof item.description !== 'string' || !item.title || !item.description) {
                console.warn("Skipping invalid item in uploaded file:", item);
                return null;
            }
            return {
                id: `${new Date().toISOString()}-${Math.random()}`,
                title: item.title,
                description: item.description,
                status: IdeaStatus.DRAFT,
                votes: 0,
                isEvaluating: false,
            };
        }).filter((idea): idea is Idea => idea !== null);

        if (newIdeas.length === 0 && uploadedIdeas.length > 0) {
            throw new Error("No valid ideas found. Each idea must have a non-empty 'title' and 'description'.");
        }
        
        if (newIdeas.length > 0) {
          setIdeas(prev => [...prev, ...newIdeas]);
          handleGoToList();
        }
        
      } catch (err: any) {
        setError(`Failed to upload ideas: ${err.message}`);
      } finally {
        if (event.target) event.target.value = '';
      }
    };
    reader.onerror = () => {
      setError("Failed to read the selected file.");
      if (event.target) event.target.value = '';
    };
    reader.readAsText(file);
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
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const clusterSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            clusterName: { type: Type.STRING, description: 'A short, descriptive name for this cluster (e.g., "Sustainable Living Tech").' },
            clusterDescription: { type: Type.STRING, description: 'A one-sentence summary of the common theme in this cluster.' },
            ideaIds: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      };

      const ideasToCluster = ideas.map(i => ({ id: i.id, title: i.title, description: i.description }));
      const prompt = `
        Analyze the following list of ideas and group them into ${config.numberOfClusters} distinct clusters.
        The primary basis for clustering should be: "${config.clusteringBasis}".
        
        For each cluster, provide a descriptive name, a brief summary of the theme, and a list of the IDs of the ideas that belong to it.
        Ensure every idea is assigned to exactly one cluster.

        Here is the list of ideas in JSON format:
        ${JSON.stringify(ideasToCluster, null, 2)}

        Return the entire response as a JSON object that conforms to the specified schema.
      `;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: clusterSchema,
        },
      });

      const result = JSON.parse(response.text) as IdeaCluster[];
      setClusterResults(result);

    } catch (e: any) {
      setError(`AI Clustering failed: ${e.message}`);
    } finally {
      setIsClustering(false);
    }
  };

  const handleSaveClusters = () => {
    if (!clusterResults) return;

    const ideaClusterMap = new Map<string, string>();
    clusterResults.forEach(cluster => {
      cluster.ideaIds.forEach(ideaId => {
        ideaClusterMap.set(ideaId, cluster.clusterName);
      });
    });

    setIdeas(prevIdeas =>
      prevIdeas.map(idea => {
        const clusterName = ideaClusterMap.get(idea.id);
        if (clusterName) {
          return { ...idea, clusterName };
        }
        return idea;
      })
    );
    setClusterResults(null);
  };

  const handleClearAllSavedClusters = () => {
    setIdeas(prevIdeas =>
      prevIdeas.map(idea => {
        const { clusterName, ...rest } = idea;
        return rest as Idea;
      })
    );
  };

  const handleClassifySingleIdea = async (ideaId: string) => {
    const ideaToClassify = ideas.find(i => i.id === ideaId);
    if (!ideaToClassify) return;
  
    setIdeas(prev => prev.map(i => (i.id === ideaId ? { ...i, isClassifying: true } : i)));
    setError(null);
  
    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
      const existingClusters = ideas.reduce((acc, idea) => {
        if (idea.clusterName) {
          if (!acc[idea.clusterName]) {
            acc[idea.clusterName] = [];
          }
          acc[idea.clusterName].push(idea.title);
        }
        return acc;
      }, {} as Record<string, string[]>);
  
      const clusterDescriptions = Object.entries(existingClusters)
        .map(([name, titles]) => `- ${name}: (Includes ideas like: ${titles.slice(0, 2).join(', ')}, etc.)`)
        .join('\n');
  
      const suggestionSchema = {
        type: Type.OBJECT,
        properties: {
          reasoning: { type: Type.STRING, description: "A brief explanation for why the idea fits an existing cluster or needs a new one." },
          suggestionType: { type: Type.STRING, enum: ['EXISTING_CLUSTER', 'NEW_CLUSTER'] },
          clusterName: { type: Type.STRING, description: "The name of the suggested cluster. If it's a new cluster, provide a suitable new name." },
        },
      };
  
      const prompt = `
        I have a new idea and I need to classify it into my existing organizational clusters.
  
        Here are my existing clusters and some example ideas within them:
        ${clusterDescriptions}
  
        Here is the new idea to classify:
        - Title: "${ideaToClassify.title}"
        - Description: "${ideaToClassify.description}"
  
        Your task:
        1. Analyze the new idea.
        2. Decide if it fits well into one of the existing clusters.
        3. If it doesn't fit, suggest a new, appropriate cluster name for it.
        4. Provide a brief reasoning for your decision.
  
        Return your suggestion as a JSON object conforming to the specified schema.
      `;
  
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: suggestionSchema,
        },
      });
  
      const result = JSON.parse(response.text) as SingleClusterSuggestion;
      setSingleClusterSuggestion(result);
      setIsSuggestionModalOpen(true);
  
    } catch (e: any) {
      setError(`AI Classification failed: ${e.message}`);
    } finally {
      setIdeas(prev => prev.map(i => (i.id === ideaId ? { ...i, isClassifying: false } : i)));
    }
  };
  
  const handleAcceptSuggestion = () => {
    if (!singleClusterSuggestion || !selectedIdeaId) return;
    setIdeas(prev => prev.map(i => i.id === selectedIdeaId ? { ...i, clusterName: singleClusterSuggestion.clusterName } : i));
    setIsSuggestionModalOpen(false);
    setSingleClusterSuggestion(null);
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
        return <Settings criteria={evaluationCriteria} onSaveCriteria={setEvaluationCriteria} />;
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