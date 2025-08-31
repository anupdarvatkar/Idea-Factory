import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { ClusterConfig } from '../types';

interface ClusterConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onStartClustering: (config: ClusterConfig) => void;
  isClustering: boolean;
}

export const ClusterConfigPanel: React.FC<ClusterConfigPanelProps> = ({ isOpen, onClose, onStartClustering, isClustering }) => {
  const [config, setConfig] = useState<ClusterConfig>({
    numberOfClusters: 5,
    clusteringBasis: 'the core problem the idea is trying to solve',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: name === 'numberOfClusters' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = () => {
    onStartClustering(config);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure AI Clustering">
      <div className="space-y-6">
        <div>
          <label htmlFor="numberOfClusters" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Number of Clusters</label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">How many distinct groups should the AI try to find? (2-10)</p>
          <input
            type="range"
            min="2"
            max="10"
            id="numberOfClusters"
            name="numberOfClusters"
            value={config.numberOfClusters}
            onChange={handleInputChange}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
          />
          <div className="text-center font-bold text-brand-primary mt-1">{config.numberOfClusters}</div>
        </div>
        <div>
          <label htmlFor="clusteringBasis" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Clustering Basis</label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Guide the AI on what similarity to look for. Examples: "target audience", "technology used", "business model".</p>
          <textarea
            id="clusteringBasis"
            name="clusteringBasis"
            value={config.clusteringBasis}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <Button onClick={handleSubmit} disabled={isClustering} className="w-full">
          {isClustering ? 'Analyzing...' : 'Start Analysis'}
        </Button>
      </div>
    </Modal>
  );
};