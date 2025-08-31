import React from 'react';

interface ScoreBarProps {
  score: number;
  label: string;
  maxScore?: number;
}

const getScoreColor = (score: number, maxScore: number): string => {
  const percentage = (score / maxScore) * 100;
  if (percentage < 40) return 'bg-red-500';
  if (percentage < 70) return 'bg-yellow-500';
  return 'bg-green-500';
};

export const ScoreBar: React.FC<ScoreBarProps> = ({ score, label, maxScore = 10 }) => {
  const widthPercentage = (score / maxScore) * 100;
  const colorClass = getScoreColor(score, maxScore);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className={`text-sm font-bold ${colorClass.replace('bg-', 'text-')}`}>{score.toFixed(1)}/{maxScore}</span>
      </div>
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
        <div
          className={`h-2 ${colorClass} rounded-full transition-all duration-500`}
          style={{ width: `${widthPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};