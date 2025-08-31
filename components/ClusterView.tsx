import React, { useState } from 'react';
import { IdeaCluster, Idea } from '../types';
import { Card } from './ui/Card';
import { IdeaCard } from './IdeaCard';

interface ClusterViewProps {
  clusters: IdeaCluster[];
  ideas: Idea[];
  onSelectIdea: (id: string) => void;
}

const AccordionItem: React.FC<{
  cluster: IdeaCluster;
  ideasInCluster: Idea[];
  onSelectIdea: (id: string) => void;
}> = ({ cluster, ideasInCluster, onSelectIdea }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className="mb-4 overflow-visible">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left flex justify-between items-center p-4 -m-6 mb-0"
      >
        <div>
            <h3 className="text-xl font-bold text-brand-primary">{cluster.clusterName} ({ideasInCluster.length})</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{cluster.clusterDescription}</p>
        </div>
        <svg
          className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[10000px] opacity-100 pt-6 mt-4 border-t border-slate-200 dark:border-slate-700' : 'max-h-0 opacity-0'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideasInCluster.map(idea => (
                <IdeaCard key={idea.id} idea={idea} onSelect={onSelectIdea} />
            ))}
        </div>
      </div>
    </Card>
  );
};

export const ClusterView: React.FC<ClusterViewProps> = ({ clusters, ideas, onSelectIdea }) => {
  const ideasById = new Map(ideas.map(idea => [idea.id, idea]));

  return (
    <div className="animate-fade-in">
      {clusters.map((cluster, index) => {
        const ideasInCluster = cluster.ideaIds
          .map(id => ideasById.get(id))
          .filter((idea): idea is Idea => idea !== undefined);
        return (
          <AccordionItem
            key={index}
            cluster={cluster}
            ideasInCluster={ideasInCluster}
            onSelectIdea={onSelectIdea}
          />
        );
      })}
    </div>
  );
};