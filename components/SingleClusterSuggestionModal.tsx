import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { SingleClusterSuggestion } from '../types';

interface SingleClusterSuggestionModalProps {
  isOpen: boolean;
  suggestion: SingleClusterSuggestion | null;
  onAccept: () => void;
  onReject: () => void;
}

export const SingleClusterSuggestionModal: React.FC<SingleClusterSuggestionModalProps> = ({
  isOpen,
  suggestion,
  onAccept,
  onReject,
}) => {
  if (!suggestion) {
    return null;
  }

  const isNewCluster = suggestion.suggestionType === 'NEW_CLUSTER';

  return (
    <Modal isOpen={isOpen} onClose={onReject} title="AI Classification Suggestion">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">AI's Reasoning</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md italic">
            "{suggestion.reasoning}"
          </p>
        </div>

        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Suggestion</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The AI suggests adding this idea to the{' '}
            {isNewCluster ? (
              <span className="font-bold text-green-600 dark:text-green-400">new cluster:</span>
            ) : (
              <span className="font-bold text-brand-primary">existing cluster:</span>
            )}
          </p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {suggestion.clusterName}
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-4">
          <Button variant="secondary" onClick={onReject}>
            Reject
          </Button>
          <Button variant="success" onClick={onAccept}>
            Accept Suggestion
          </Button>
        </div>
      </div>
    </Modal>
  );
};
