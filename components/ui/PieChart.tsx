import React from 'react';

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
}

export const PieChart: React.FC<PieChartProps> = ({ data, size = 120 }) => {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((acc, item) => acc + item.value, 0);

  if (total === 0) {
    return (
        <div className="flex items-center justify-center h-full text-slate-500">
            No data to display
        </div>
    )
  }

  let accumulatedPercentage = 0;

  return (
    <div className="flex items-center space-x-6">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth="10"
            className="dark:stroke-slate-700"
          />
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const offset = circumference - (accumulatedPercentage / 100) * circumference;
            accumulatedPercentage += percentage;
            
            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold dark:text-white">
            {total}
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center text-sm">
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: item.color }}
            ></span>
            <span className="text-slate-600 dark:text-slate-400">{item.label}: <strong>{item.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
};