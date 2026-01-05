
import React from 'react';

interface ProgressBarProps {
  current: number;
  target: number;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, target, color = 'bg-indigo-600' }) => {
  const percentage = Math.min(Math.round((current / target) * 100), 100);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 text-xs font-medium text-gray-500">
        <span>{percentage}% concluído</span>
        <span>{current} / {target}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
