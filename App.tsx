
import React, { useState, useEffect, useRef } from 'react';
import { Goal, GoalType, Category, UserStats } from './types';
import GoalItem from './components/GoalItem';
import { getGoalMotivation, generateVisionImage } from './services/geminiService';

const App: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('vision2026_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('vision2026_stats');
    return saved ? JSON.parse(saved) : { xp: 0, level: 1 };
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
  const [newDeadline, setNewDeadline] = useState('');

  useEffect(() => {
    localStorage.setItem('vision2026_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('vision2026_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    const fetchMotivation = async () => {
      const msg = await getGoalMotivation(goals);
      setMotivation(msg);
    };
    fetchMotivation();
  }, [goals.length]);

  const addXP = (amount: number) => {
    setStats(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      const xpNeeded = prev.level * 100;
      
      if (newXp >= xpNeeded) {
        newXp -= xpNeeded;
        newLevel += 1;
      }
      return { xp: newXp, level: newLevel };
    });
  };

  const resetForm = () => {
    setNewTitle('');
    setNewType(GoalType.SIMPLE);
    setNewCategory(Category.PERSONAL);
    setNewTarget(1);
    setNewDeadline('');
    setIsAdding(false);
    setEditingGoalId(null);
  };

  const addOrUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (editingGoalId) {
      setGoals(prev => prev.map(g => {
        if (g.id === editingGoalId) {
          return {
            ...g,
            title: newTitle,
            type: newType,
            category: newCategory,
            targetValue: newType === GoalType.NUMERIC ? newTarget : 1,
            deadline: newDeadline || undefined,
            isCompleted: newType === GoalType.NUMERIC ? g.currentValue >= newTarget : g.isCompleted
          };
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
        deadline: newDeadline || undefined,
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
    setNewDeadline(goal.deadline || '');
    setEditingGoalId(goal.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const isNowCompleted = !g.isCompleted;
        if (isNowCompleted) addXP(50);
        return { ...g, isCompleted: isNowCompleted };
      }
      return g;
    }));
  };

  const incrementGoal = (id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id && g.type === GoalType.NUMERIC) {
        const newVal = g.currentValue + 1;
        const reachedTarget = newVal >= g.targetValue;
        if (!g.isCompleted && reachedTarget) addXP(50);
        else addXP(10);
        return { 
          ...g, 
          currentValue: newVal, 
          isCompleted: reachedTarget 
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

  const handleGenerateVision = async (id: string, title: string) => {
    const url = await generateVisionImage(title);
    if (url) {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, visionImageUrl: url } : g));
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
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

  const goalSummary = {
    total: goals.length,
    completed: goals.filter(g => g.isCompleted).length,
  };

  const nextLevelXp = stats.level * 100;
  const xpPercentage = (stats.xp / nextLevelXp) * 100;

  return (
    <div className="min-h-screen pb-24 bg-orange-50/30">
      <header className="bg-orange-50 pt-12 pb-24 px-6 border-b border-orange-100">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-orange-900">Vision 2026</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded">NÍVEL {stats.level}</div>
                <div className="w-32 bg-orange-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-600 h-full" style={{ width: `${xpPercentage}%` }}></div>
                </div>
                <span className="text-[10px] text-orange-800 font-bold">{stats.xp}/{nextLevelXp} XP</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-orange-600">{goalSummary.completed}/{goalSummary.total}</div>
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
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Mentor IA</span>
              </div>
              {motivation.length > 80 && (
                <button onClick={() => setIsMotivationExpanded(!isMotivationExpanded)} className="text-[10px] font-bold uppercase text-orange-500 hover:text-orange-700">
                  {isMotivationExpanded ? 'Recolher' : 'Ver tudo'}
                </button>
              )}
            </div>
            <p className={`text-gray-700 italic font-medium leading-relaxed ${isMotivationExpanded ? '' : 'line-clamp-2'}`}>
              "{motivation}"
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 -mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Prioridades</h2>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 active:scale-95"
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
            <h3 className="text-lg font-black text-orange-900 mb-4">{editingGoalId ? 'Editar Meta' : 'Nova Meta'}</h3>
            <form onSubmit={addOrUpdateGoal}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Título</label>
                  <input autoFocus type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: Aprender Alemão" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Prazo (Opcional)</label>
                  <input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Tipo</label>
                  <select value={newType} onChange={(e) => setNewType(e.target.value as GoalType)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none">
                    <option value={GoalType.SIMPLE}>Tarefa Única</option>
                    <option value={GoalType.NUMERIC}>Contador de Dias</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Categoria</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as Category)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none">
                    {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                {newType === GoalType.NUMERIC && (
                  <div>
                    <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Objetivo (Total)</label>
                    <input type="number" value={newTarget} onChange={(e) => setNewTarget(Number(e.target.value))} min="1" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none" />
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-orange-600 text-white font-black py-3 rounded-xl hover:bg-orange-700 shadow-md">
                  {editingGoalId ? 'Salvar Alterações' : 'Criar Meta (+XP)'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-1">
          {goals.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-orange-100">
              <div className="text-6xl mb-4 opacity-50">🏆</div>
              <h3 className="text-xl font-black text-gray-800">Pronto para subir de nível?</h3>
              <p className="text-gray-500 mt-2">Crie sua primeira meta para ganhar XP.</p>
            </div>
          ) : (
            goals.map((goal, index) => (
              <GoalItem 
                key={goal.id} goal={goal} index={index}
                onToggle={toggleGoal} onIncrement={incrementGoal} onDelete={deleteGoal} onEdit={handleEdit}
                onGenerateVision={handleGenerateVision}
                onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDrop}
              />
            ))
          )}
        </div>
      </main>

      <footer className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none">
        <div className="bg-orange-900/90 text-white backdrop-blur shadow-2xl px-6 py-3 rounded-full pointer-events-auto flex items-center gap-3 border border-orange-800/50">
          <span className="text-xs font-black uppercase tracking-widest">
            {stats.level >= 10 ? 'MESTRE DE 2026 🔥' : `Nível ${stats.level} - Explorador`}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
