import React from 'react';
import { Idea, IdeaStatus } from '../types';
import { Card } from './ui/Card';
import { PieChart } from './ui/PieChart';
import { ScoreBar } from './ui/ScoreBar';

interface DashboardProps {
    ideas: Idea[];
    onSelectIdea: (id: string) => void;
}

const StatCard: React.FC<{ title: string; value: string | number, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <Card className="flex flex-col">
        <div className="flex items-center text-slate-500 dark:text-slate-400">
            {icon}
            <h3 className="ml-2 text-sm font-medium">{title}</h3>
        </div>
        <p className="text-3xl font-bold mt-2">{value}</p>
    </Card>
);

const IdeaListItem: React.FC<{idea: Idea, onClick: (id: string) => void, metric: 'votes' | 'ai', getAvgScore?: (idea: Idea) => number}> = ({ idea, onClick, metric, getAvgScore }) => {
    const metricValue = metric === 'votes' ? idea.votes : (getAvgScore ? getAvgScore(idea).toFixed(1) : 'N/A');
    const metricIcon = metric === 'votes' ? (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
    ) : (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    );
    const metricColor = metric === 'votes' ? 'text-rose-500' : 'text-brand-secondary';

    return (
        <li 
            onClick={() => onClick(idea.id)}
            className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
        >
            <div>
                <p className="font-semibold">{idea.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs md:max-w-md">{idea.description}</p>
            </div>
            <div className={`flex items-center ${metricColor} font-bold text-lg ml-4 flex-shrink-0`}>
                {metricIcon}
                {metricValue}
            </div>
        </li>
    );
};


export const Dashboard: React.FC<DashboardProps> = ({ ideas, onSelectIdea }) => {
    const totalIdeas = ideas.length;
    const publishedIdeas = ideas.filter(i => i.status === IdeaStatus.PUBLISHED);
    const draftIdeas = ideas.filter(i => i.status === IdeaStatus.DRAFT);
    const totalVotes = publishedIdeas.reduce((sum, idea) => sum + idea.votes, 0);
    const topVotedIdeas = [...publishedIdeas].sort((a, b) => b.votes - a.votes).slice(0, 5);

    // AI Evaluation Metrics
    const evaluatedIdeas = ideas.filter(i => i.evaluation);
    const totalEvaluations = evaluatedIdeas.length;
    
    const averageScores = evaluatedIdeas.reduce(
        (acc, idea) => {
            if (idea.evaluation) {
                acc.desirability += idea.evaluation.desirability.score;
                acc.feasibility += idea.evaluation.feasibility.score;
                acc.viability += idea.evaluation.viability.score;
                acc.total += (idea.evaluation.desirability.score + idea.evaluation.feasibility.score + idea.evaluation.viability.score);
            }
            return acc;
        },
        { desirability: 0, feasibility: 0, viability: 0, total: 0 }
    );
    
    const avgDesirability = totalEvaluations > 0 ? (averageScores.desirability / totalEvaluations) : 0;
    const avgFeasibility = totalEvaluations > 0 ? (averageScores.feasibility / totalEvaluations) : 0;
    const avgViability = totalEvaluations > 0 ? (averageScores.viability / totalEvaluations) : 0;
    const avgOverallScore = totalEvaluations > 0 ? (averageScores.total / (totalEvaluations * 3)) : 0;

    const getAvgScore = (idea: Idea) => {
        if (!idea.evaluation) return 0;
        return (idea.evaluation.desirability.score + idea.evaluation.feasibility.score + idea.evaluation.viability.score) / 3;
    }
    
    const topAIEvaluatedIdeas = [...evaluatedIdeas]
        .sort((a, b) => getAvgScore(b) - getAvgScore(a))
        .slice(0, 5);


    const pieChartData = [
        { label: 'Published', value: publishedIdeas.length, color: '#10b981' },
        { label: 'Drafts', value: draftIdeas.length, color: '#f59e0b' },
    ];

    // Cluster Analysis
    const ideasWithClusters = ideas.filter(idea => !!idea.clusterName);
    const clusterCounts = ideasWithClusters.reduce((acc, idea) => {
        if (idea.clusterName) {
            acc[idea.clusterName] = (acc[idea.clusterName] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);
    const sortedClusters = Object.entries(clusterCounts).sort((a, b) => b[1] - a[1]);


    return (
        <div className="animate-fade-in space-y-8">
            <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard 
                    title="Total Ideas" 
                    value={totalIdeas} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
                />
                 <StatCard 
                    title="Total Votes Cast" 
                    value={totalVotes}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>}
                />
                 <StatCard 
                    title="Average AI Score" 
                    value={avgOverallScore > 0 ? avgOverallScore.toFixed(1) : 'N/A'}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>}
                />
                 <Card className="">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Idea Status</h3>
                    <div className="flex items-center justify-center">
                        <PieChart data={pieChartData} />
                    </div>
                </Card>
            </div>
            
            {totalEvaluations > 0 && (
                <Card>
                    <h3 className="text-xl font-bold mb-4">AI Score Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                        <ScoreBar label="Avg. Desirability" score={avgDesirability} />
                        <ScoreBar label="Avg. Feasibility" score={avgFeasibility} />
                        <ScoreBar label="Avg. Viability" score={avgViability} />
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h3 className="text-xl font-bold mb-4">Top 5 Voted Ideas</h3>
                    {topVotedIdeas.length > 0 ? (
                        <ul className="space-y-2">
                            {topVotedIdeas.map(idea => (
                                <IdeaListItem key={idea.id} idea={idea} onClick={onSelectIdea} metric="votes" />
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                            No published ideas have been voted on yet.
                        </p>
                    )}
                </Card>
                 <Card>
                    <h3 className="text-xl font-bold mb-4">Top 5 AI-Evaluated Ideas</h3>
                    {topAIEvaluatedIdeas.length > 0 ? (
                        <ul className="space-y-2">
                            {topAIEvaluatedIdeas.map(idea => (
                                <IdeaListItem key={idea.id} idea={idea} onClick={onSelectIdea} metric="ai" getAvgScore={getAvgScore}/>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                            No ideas have been evaluated by the AI yet.
                        </p>
                    )}
                </Card>
            </div>

            {sortedClusters.length > 0 && (
                <Card>
                    <h3 className="text-xl font-bold mb-4">Cluster Analysis</h3>
                    <ul className="space-y-2">
                        {sortedClusters.map(([clusterName, count]) => (
                            <li key={clusterName} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                <span className="font-semibold">{clusterName}</span>
                                <span className="font-bold text-brand-primary bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">{count} ideas</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}
        </div>
    );
};