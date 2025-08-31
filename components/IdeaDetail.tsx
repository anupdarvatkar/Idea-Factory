import React, { useState, useEffect } from 'react';
import { Idea, IdeaStatus } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { EvaluationDisplay } from './EvaluationDisplay';

interface IdeaDetailProps {
  idea: Idea | Omit<Idea, 'id' | 'status' | 'votes'>;
  onSave: (ideaData: Omit<Idea, 'id' | 'status' | 'votes' | 'evaluation' | 'isEvaluating' | 'isClassifying'>) => void;
  onPublish: () => void;
  onVote: () => void;
  onUploadIdeas: () => void;
  onDownloadTemplate: () => void;
  hasSavedClusters: boolean;
  onClassify: (ideaId: string) => void;
  onGoToList: () => void;
  onDelete?: (ideaId: string) => void;
}

const isExistingIdea = (idea: any): idea is Idea => {
  return 'id' in idea;
};

const EvaluationLoadingState = () => (
    <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-slate-800/50 my-6">
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 border-4 border-blue-400 border-dashed rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-300">AI Evaluation in Progress</h3>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
                Our AI is analyzing this idea. The evaluation will appear here once it's complete.
            </p>
        </div>
    </Card>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const DownloadTemplateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const ClassifyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0112 3c2.757 0 5.223 1.243 6.95 3.236C21.5 8.236 22 11 22 13c-1-1-1.343-2.343-1.343-2.343s-2 2-2.657 2.657m0 0a8 8 0 01-9.313-9.313" />
    </svg>
);

export const IdeaDetail: React.FC<IdeaDetailProps> = ({ idea, onSave, onPublish, onVote, onUploadIdeas, onDownloadTemplate, hasSavedClusters, onClassify, onGoToList, onDelete }) => {
  const [isEditing, setIsEditing] = useState(!isExistingIdea(idea));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    title: idea.title,
    description: idea.description,
  });

  useEffect(() => {
    setFormData({
      title: idea.title,
      description: idea.description,
    });
    if (!isExistingIdea(idea)) {
        setIsEditing(true);
    }
  }, [idea]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
        title: idea.title,
        description: idea.description,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!existingIdea || !onDelete) return;
    
    try {
      await onDelete(existingIdea.id);
      // Only navigate away if delete was successful
      onGoToList();
      return true; // Success
    } catch (error) {
      // Error is already handled in the parent component
      console.error('Delete failed:', error);
      return false; // Failed
    }
  };

  const existingIdea = isExistingIdea(idea) ? idea : null;

  if (isEditing) {
    return (
      <Card className="max-w-3xl mx-auto animate-fade-in">
        <h2 className="text-2xl font-bold mb-6">{existingIdea ? 'Edit Idea' : 'Create New Idea'}</h2>
        <div className="space-y-6">
          {!existingIdea && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bulk Add</label>
                 <div className="flex space-x-2">
                    <Button onClick={onUploadIdeas} variant="secondary" className="w-full flex justify-center items-center">
                        <UploadIcon />
                        Upload from File
                    </Button>
                    <Button onClick={onDownloadTemplate} variant="secondary" className="w-full flex justify-center items-center">
                        <DownloadTemplateIcon />
                        Download Template
                    </Button>
                </div>
                 <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                    <span className="flex-shrink mx-4 text-slate-500">Or add one manually</span>
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                </div>
              </div>
          )}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              name="description"
              id="description"
              rows={5}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-8">
          {existingIdea && <Button variant="secondary" onClick={handleCancel}>Cancel</Button>}
          <Button onClick={handleSave}>Save Idea</Button>
        </div>
      </Card>
    );
  }

  if (!existingIdea) return null; // Should not happen if not editing a new idea
  
  const canClassify = existingIdea.status === IdeaStatus.PUBLISHED && !existingIdea.clusterName && hasSavedClusters;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
        <button onClick={onGoToList} className="flex items-center text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary mb-4 transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to All Ideas
        </button>
        <Card>
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-bold">{existingIdea.title}</h2>
                {existingIdea.status === IdeaStatus.PUBLISHED ? (
                    <div className="flex items-center text-rose-500 bg-rose-100 dark:bg-rose-900/50 px-3 py-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <span className="font-bold text-lg">{existingIdea.votes}</span>
                    </div>
                ) : (
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">DRAFT</span>
                )}
            </div>

            {existingIdea.clusterName && (
                <div className="mb-4 text-sm font-semibold text-brand-secondary bg-indigo-100 dark:bg-indigo-900/50 inline-block px-3 py-1 rounded-full">
                Cluster: {existingIdea.clusterName}
                </div>
            )}

            <p className="text-slate-600 dark:text-slate-400 mt-4 mb-8 whitespace-pre-wrap">{existingIdea.description}</p>
            
            {existingIdea.isEvaluating && <EvaluationLoadingState />}
            {existingIdea.evaluation && <EvaluationDisplay evaluation={existingIdea.evaluation} />}
            
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                    {onDelete && (
                        <Button 
                            variant="danger" 
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Idea
                        </Button>
                    )}
                </div>
                <div className="flex items-center space-x-4">
                    {canClassify && (
                    <Button onClick={() => onClassify(existingIdea.id)} variant="secondary" disabled={existingIdea.isClassifying}>
                        {existingIdea.isClassifying ? 'Analyzing...' : <><ClassifyIcon /> Classify with AI</>}
                    </Button>
                    )}
                    {existingIdea.status === IdeaStatus.DRAFT ? (
                    <>
                        <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit</Button>
                        <Button variant="success" onClick={onPublish}>
                        Publish
                        </Button>
                    </>
                    ) : (
                    <Button onClick={onVote}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        Vote for this Idea
                    </Button>
                    )}
                </div>
            </div>
        </Card>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md mx-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                        Delete Idea
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Are you sure you want to delete "{existingIdea.title}"? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-4">
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowDeleteConfirm(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="danger" 
                            onClick={async () => {
                                const success = await handleDelete();
                                if (success) {
                                    setShowDeleteConfirm(false);
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};