import React, { useEffect, useState } from 'react';
import { 
  Target, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Award
} from 'lucide-react';

interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  type: 'EMERGENCY' | 'TRAVEL' | 'OTHER';
  status: 'IN_PROGRESS' | 'COMPLETED';
}

const initialMockGoals: Goal[] = [
  {
    id: 1,
    name: 'Reserva de Emergência',
    targetAmount: 12000,
    currentAmount: 6000,
    deadline: '2026-12-31',
    type: 'EMERGENCY',
    status: 'IN_PROGRESS'
  },
  {
    id: 2,
    name: 'Viagem de Férias',
    targetAmount: 5000,
    currentAmount: 5000,
    deadline: '2026-08-15',
    type: 'TRAVEL',
    status: 'COMPLETED'
  },
  {
    id: 3,
    name: 'Troca de Carro',
    targetAmount: 45000,
    currentAmount: 18000,
    deadline: '2027-06-30',
    type: 'OTHER',
    status: 'IN_PROGRESS'
  }
];

interface GoalsPageProps {
  searchQuery: string;
}

export function GoalsPage({ searchQuery }: GoalsPageProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT' | 'DELETE'>('CREATE');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formTargetAmount, setFormTargetAmount] = useState('');
  const [formCurrentAmount, setFormCurrentAmount] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formType, setFormType] = useState<'EMERGENCY' | 'TRAVEL' | 'OTHER'>('EMERGENCY');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadGoals = () => {
    setLoading(true);
    const stored = localStorage.getItem('financontrol_goals');
    if (stored) {
      setGoals(JSON.parse(stored));
    } else {
      localStorage.setItem('financontrol_goals', JSON.stringify(initialMockGoals));
      setGoals(initialMockGoals);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const saveGoalsList = (updatedGoals: Goal[]) => {
    localStorage.setItem('financontrol_goals', JSON.stringify(updatedGoals));
    setGoals(updatedGoals);
  };

  const openCreateModal = () => {
    setModalMode('CREATE');
    setFormName('');
    setFormTargetAmount('');
    setFormCurrentAmount('0');
    setFormDeadline(new Date().toISOString().split('T')[0]);
    setFormType('EMERGENCY');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (goal: Goal) => {
    setModalMode('EDIT');
    setSelectedGoal(goal);
    setFormName(goal.name);
    setFormTargetAmount(goal.targetAmount.toString());
    setFormCurrentAmount(goal.currentAmount.toString());
    setFormDeadline(goal.deadline);
    setFormType(goal.type);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (goal: Goal) => {
    setModalMode('DELETE');
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTargetAmount || !formDeadline) {
      setErrorMessage('Todos os campos obrigatórios devem ser preenchidos.');
      return;
    }

    const targetNum = parseFloat(formTargetAmount);
    const currentNum = parseFloat(formCurrentAmount || '0');

    if (isNaN(targetNum) || targetNum <= 0) {
      setErrorMessage('O valor alvo deve ser um número maior que zero.');
      return;
    }
    if (isNaN(currentNum) || currentNum < 0) {
      setErrorMessage('O valor atual não pode ser negativo.');
      return;
    }

    const isCompleted = currentNum >= targetNum;

    if (modalMode === 'CREATE') {
      const newGoal: Goal = {
        id: Date.now(),
        name: formName,
        targetAmount: targetNum,
        currentAmount: currentNum,
        deadline: formDeadline,
        type: formType,
        status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS'
      };
      saveGoalsList([...goals, newGoal]);
    } else if (modalMode === 'EDIT' && selectedGoal) {
      const updated = goals.map(g => {
        if (g.id === selectedGoal.id) {
          return {
            ...g,
            name: formName,
            targetAmount: targetNum,
            currentAmount: currentNum,
            deadline: formDeadline,
            type: formType,
            status: isCompleted ? ('COMPLETED' as const) : ('IN_PROGRESS' as const)
          };
        }
        return g;
      });
      saveGoalsList(updated);
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!selectedGoal) return;
    const filtered = goals.filter(g => g.id !== selectedGoal.id);
    saveGoalsList(filtered);
    setIsModalOpen(false);
  };

  const handleMarkAsCompleted = (goal: Goal) => {
    const updated = goals.map(g => {
      if (g.id === goal.id) {
        return {
          ...g,
          currentAmount: g.targetAmount,
          status: 'COMPLETED' as const
        };
      }
      return g;
    });
    saveGoalsList(updated);
  };

  const filteredGoals = goals.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Metas Financeiras</h2>
          <p className="mt-1 text-sm text-slate-400">
            Acompanhe o andamento dos seus objetivos de curto, médio e longo prazo.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110"
        >
          <Plus className="h-5 w-5" />
          <span>Nova Meta</span>
        </button>
      </div>

      {loading ? (
        <div className="grid h-64 place-items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-400" />
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/80 px-6 py-20 text-center shadow-sm dark:shadow-2xl">
          <div className="mb-4 rounded-full bg-slate-100 dark:bg-white/5 p-4">
            <Target className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-slate-800 dark:text-slate-200">Nenhuma meta encontrada</h3>
          <p className="mx-auto max-w-xs text-sm text-slate-550 dark:text-slate-400">
            Crie sua primeira meta financeira para começar a poupar com propósito.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGoals.map((goal) => {
            const percent = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            const isCompleted = goal.status === 'COMPLETED' || percent >= 100;
            const deadlineDate = new Date(goal.deadline + 'T00:00:00');
            const isOverdue = !isCompleted && new Date() > deadlineDate;

            return (
              <div 
                key={goal.id} 
                className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/60 p-6 shadow-xl backdrop-blur-sm transition hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-[#0d1828]/95"
              >
                {/* Decorative background glow for completed goals */}
                {isCompleted && (
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/5 blur-3xl" />
                )}

                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        goal.type === 'EMERGENCY' 
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                          : goal.type === 'TRAVEL' 
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                            : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      }`}>
                        {goal.type === 'EMERGENCY' ? 'Reserva' : goal.type === 'TRAVEL' ? 'Viagem' : 'Objetivo'}
                      </span>
                      <h3 className="mt-2 text-lg font-bold text-slate-800 dark:text-white leading-tight">{goal.name}</h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(goal)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(goal)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Info */}
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Acumulado</span>
                      <span>Alvo</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-extrabold text-blue-650 dark:text-blue-400">
                        R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Progresso</span>
                      <span className={`font-bold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-650 dark:text-blue-400'}`}>
                        {percent}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer status / Action */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
                  <span className={`flex items-center gap-1 text-xs ${
                    isCompleted 
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold' 
                      : isOverdue 
                        ? 'text-red-500 dark:text-red-400 font-semibold' 
                        : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {isCompleted ? (
                      <>
                        <Award className="h-4 w-4" />
                        <span>Concluída!</span>
                      </>
                    ) : isOverdue ? (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        <span>Vencida em {deadlineDate.toLocaleDateString('pt-BR')}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4" />
                        <span>Prazo: {deadlineDate.toLocaleDateString('pt-BR')}</span>
                      </>
                    )}
                  </span>

                  {!isCompleted && (
                    <button
                      onClick={() => handleMarkAsCompleted(goal)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-650 dark:text-emerald-400 transition hover:bg-emerald-500/20"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Concluir</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (modalMode === 'CREATE' || modalMode === 'EDIT') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#081321] p-6 shadow-2xl animate-in scale-in duration-200"
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {modalMode === 'CREATE' ? 'Criar Meta Financeira' : 'Editar Meta'}
            </h3>

            {errorMessage && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-650 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-655 dark:text-slate-300 mb-1">Nome do Objetivo</label>
                <input
                  required
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Compra de Imóvel, Viagem para Europa"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-655 dark:text-slate-300 mb-1">Valor Alvo (R$)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formTargetAmount}
                    onChange={(e) => setFormTargetAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-655 dark:text-slate-300 mb-1">Valor Atual Salvo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formCurrentAmount}
                    onChange={(e) => setFormCurrentAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-655 dark:text-slate-300 mb-1">Prazo Alvo</label>
                  <input
                    required
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-655 dark:text-slate-300 mb-1">Tipo de Meta</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="EMERGENCY">Reserva de Emergência</option>
                    <option value="TRAVEL">Viagem / Férias</option>
                    <option value="OTHER">Outros Objetivos</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 py-3 text-sm text-slate-555 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:brightness-110"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isModalOpen && modalMode === 'DELETE' && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#081321] p-6 shadow-2xl animate-in scale-in duration-200"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Excluir Meta</h3>
            <p className="text-sm text-slate-550 dark:text-slate-400 mb-6">
              Tem certeza que deseja excluir a meta <strong className="text-slate-800 dark:text-slate-200">{selectedGoal.name}</strong>?
              Os dados guardados para esta meta serão permanentemente excluídos.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 py-3 text-sm text-slate-555 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-500 transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
