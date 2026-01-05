
import React from 'react';
import { Goal, GoalType } from '../types';
import ProgressBar from './ProgressBar';

interface GoalItemProps {
  goal: Goal;
  index: number;
  onToggle: (id: string) => void;
  onIncrement: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (goal: Goal) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}

const GoalItem: React.FC<GoalItemProps> = ({ 
  goal, 
  index, 
  onToggle, 
  onIncrement, 
  onDelete,
  onEdit,
  onDragStart,
  onDragOver,
  onDragEnd
}) => {
  const isNumeric = goal.type === GoalType.NUMERIC;
  const isFullyCompleted = goal.isCompleted || (isNumeric && goal.currentValue >= goal.targetValue);

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`goal-card bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4 cursor-default group transition-all duration-200 hover:border-orange-200 ${isFullyCompleted ? 'bg-gray-50' : ''}`}
    >
      <div className="flex items-start gap-4">
        {/* Reorder Handle */}
        <div className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-orange-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>

        <div className="flex items-start gap-3 flex-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggle(goal.id);
            }}
            className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
              isFullyCompleted ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300 hover:border-orange-400'
            }`}
          >
            {isFullyCompleted && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                {goal.category}
              </span>
            </div>
            <h3 className={`text-lg font-semibold text-gray-800 ${isFullyCompleted ? 'line-through text-gray-400' : ''}`}>
              {goal.title}
            </h3>
            
            {isNumeric && (
              <div className="mt-4">
                <ProgressBar current={goal.currentValue} target={goal.targetValue} color="bg-orange-500" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(goal);
              }}
              className="text-gray-300 hover:text-orange-500 transition-colors p-1"
              title="Editar meta"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(goal.id);
              }}
              className="text-gray-300 hover:text-red-500 transition-colors p-1"
              title="Excluir meta"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1-1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {isNumeric && !isFullyCompleted && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onIncrement(goal.id);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95"
            >
              +1 dia
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalItem;
