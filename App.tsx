
import React, { useState, useEffect, useRef } from 'react';
import { Goal, GoalType, Category } from './types';
import GoalItem from './components/GoalItem';
import { getGoalMotivation } from './services/geminiService';

const App: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('vision2026_goals');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [motivation, setMotivation] = useState<string>("Buscando inspiração para seu 2026...");
  const [isAdding, setIsAdding] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [isMotivationExpanded, setIsMotivationExpanded] = useState(false);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  
  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<GoalType>(GoalType.SIMPLE);
  const [newCategory, setNewCategory] = useState<Category>(Category.PERSONAL);
  const [newTarget, setNewTarget] = useState(1);

  useEffect(() => {
    localStorage.setItem('vision2026_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    const fetchMotivation = async () => {
      const msg = await getGoalMotivation(goals);
      setMotivation(msg);
    };
    fetchMotivation();
  }, [goals.length]);

  const resetForm = () => {
    setNewTitle('');
    setNewType(GoalType.SIMPLE);
    setNewCategory(Category.PERSONAL);
    setNewTarget(1);
    setIsAdding(false);
    setEditingGoalId(null);
  };

  const addOrUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (editingGoalId) {
      setGoals(prev => prev.map(g => {
        if (g.id === editingGoalId) {
          const updated: Goal = {
            ...g,
            title: newTitle,
            type: newType,
            category: newCategory,
            targetValue: newType === GoalType.NUMERIC ? newTarget : 1,
            isCompleted: newType === GoalType.NUMERIC ? g.currentValue >= newTarget : g.isCompleted
          };
          return updated;
        }
        return g;
      }));
    } else {
      const newGoal: Goal = {
        id: crypto.randomUUID(),
        title: newTitle,
        type: newType,
        category: newCategory,
        currentValue: 0,
        targetValue: newType === GoalType.NUMERIC ? newTarget : 1,
        isCompleted: false,
        createdAt: Date.now(),
      };
      setGoals([newGoal, ...goals]);
    }

    resetForm();
  };

  const handleEdit = (goal: Goal) => {
    setNewTitle(goal.title);
    setNewType(goal.type);
    setNewCategory(goal.category);
    setNewTarget(goal.targetValue);
    setEditingGoalId(goal.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, isCompleted: !g.isCompleted } : g
    ));
  };

  const incrementGoal = (id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id && g.type === GoalType.NUMERIC) {
        const newVal = g.currentValue + 1;
        return { 
          ...g, 
          currentValue: newVal, 
          isCompleted: newVal >= g.targetValue 
        };
      }
      return g;
    }));
  };

  const deleteGoal = (id: string) => {
    if (window.confirm('Deseja realmente excluir esta meta?')) {
      setGoals(prev => prev.filter(g => g.id !== id));
      if (editingGoalId === id) resetForm();
    }
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverItem.current = index;
  };

  const handleDrop = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const _goals = [...goals];
      const draggedItemContent = _goals.splice(dragItem.current, 1)[0];
      _goals.splice(dragOverItem.current, 0, draggedItemContent);
      dragItem.current = null;
      dragOverItem.current = null;
      setGoals(_goals);
    }
  };

  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.isCompleted || (g.type === GoalType.NUMERIC && g.currentValue >= g.targetValue)).length,
  };

  return (
    <div className="min-h-screen pb-20 bg-orange-50/30">
      <header className="bg-orange-50 text-orange-950 pt-12 pb-24 px-6 border-b border-orange-100">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-orange-900">Vision 2026</h1>
              <p className="text-orange-700 font-medium mt-1">Transforme seus desejos em realidade.</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-orange-600">{stats.completed}/{stats.total}</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-orange-500">Concluídas</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-1.5 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707zM16 18a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Dica de IA</span>
              </div>
              {motivation.length > 80 && (
                <button 
                  onClick={() => setIsMotivationExpanded(!isMotivationExpanded)}
                  className="text-[10px] font-bold uppercase tracking-widest text-orange-500 hover:text-orange-700 transition-colors"
                >
                  {isMotivationExpanded ? 'Recolher' : 'Ver tudo'}
                </button>
              )}
            </div>
            <p className={`text-gray-700 italic font-medium leading-relaxed transition-all duration-300 ${isMotivationExpanded ? '' : 'line-clamp-2'}`}>
              "{motivation}"
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 -mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Minhas Prioridades</h2>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Nova Meta
            </button>
          )}
        </div>

        {isAdding && (
          <div className="bg-white rounded-2xl shadow-xl border border-orange-200 p-6 mb-8 animate-in fade-in slide-in-from-top-2">
            <h3 className="text-lg font-black text-orange-900 mb-4">
              {editingGoalId ? 'Editar Meta' : 'Criar Nova Meta'}
            </h3>
            <form onSubmit={addOrUpdateGoal}>
              <div className="mb-4">
                <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Título da Meta</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Treinar Muay Thai"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Tipo</label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as GoalType)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value={GoalType.SIMPLE}>Checklist</option>
                    <option value={GoalType.NUMERIC}>Contagem de Dias</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Categoria</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Category)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {Object.values(Category).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {newType === GoalType.NUMERIC && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Objetivo (dias totais)</label>
                  <input 
                    type="number" 
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-orange-600 text-white font-black py-3 rounded-xl hover:bg-orange-700 transition-colors shadow-md"
                >
                  {editingGoalId ? 'Salvar Alterações' : 'Confirmar Meta'}
                </button>
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-1">
          {goals.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-orange-100">
              <div className="text-6xl mb-4 opacity-50">☀️</div>
              <h3 className="text-xl font-black text-gray-800">Seu 2026 está em branco</h3>
              <p className="text-gray-500 max-w-xs mx-auto mt-2">
                Comece a planejar seus grandes feitos agora mesmo!
              </p>
            </div>
          ) : (
            goals.map((goal, index) => (
              <GoalItem 
                key={goal.id} 
                goal={goal} 
                index={index}
                onToggle={toggleGoal}
                onIncrement={incrementGoal}
                onDelete={deleteGoal}
                onEdit={handleEdit}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDrop}
              />
            ))
          )}
        </div>
      </main>

      <footer className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none">
        <div className="bg-orange-900/90 text-white backdrop-blur shadow-2xl px-6 py-3 rounded-full pointer-events-auto flex items-center gap-3 border border-orange-800/50">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
          <span className="text-sm font-black uppercase tracking-widest">
            {stats.completed === stats.total && stats.total > 0 ? 'Ano Concluído! 🏆' : `Progresso: ${stats.completed} de ${stats.total}`}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
