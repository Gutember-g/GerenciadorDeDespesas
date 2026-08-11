import React, { useEffect, useState, useCallback } from 'react';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  ArrowUpCircle,
  ArrowDownCircle,
  X,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { useAuthSettings } from '../contexts/AuthSettingsContext.tsx';
import { goalAPI } from '../services/api';

interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  type: 'EMERGENCY' | 'TRAVEL' | 'OTHER';
  status: 'IN_PROGRESS' | 'COMPLETED';
}

interface GoalTransaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: string; // INCOME or EXPENSE
}

interface GoalsPageProps {
  searchQuery: string;
}

export function GoalsPage({ searchQuery }: GoalsPageProps) {
  const { formatCurrency } = useAuthSettings();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CRUD Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT' | 'DELETE'>('CREATE');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Detail Modal State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailGoal, setDetailGoal] = useState<Goal | null>(null);
  const [goalTransactions, setGoalTransactions] = useState<GoalTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formTargetAmount, setFormTargetAmount] = useState('');
  const [formCurrentAmount, setFormCurrentAmount] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formType, setFormType] = useState<'EMERGENCY' | 'TRAVEL' | 'OTHER'>('EMERGENCY');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await goalAPI.getGoals();
      setGoals(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

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
    setFormDeadline(goal.deadline || new Date().toISOString().split('T')[0]);
    setFormType(goal.type);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (goal: Goal) => {
    setModalMode('DELETE');
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const openDetailModal = async (goal: Goal) => {
    setDetailGoal(goal);
    setIsDetailOpen(true);
    setLoadingTransactions(true);
    setGoalTransactions([]);
    try {
      const txs = await goalAPI.getGoalTransactions(goal.id);
      setGoalTransactions(txs);
    } catch {
      setGoalTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
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

    const payload = {
      name: formName,
      targetAmount: targetNum,
      currentAmount: currentNum,
      type: formType,
      deadline: formDeadline,
    };

    try {
      setSaving(true);
      if (modalMode === 'CREATE') {
        await goalAPI.createGoal(payload);
      } else if (modalMode === 'EDIT' && selectedGoal) {
        await goalAPI.updateGoal(selectedGoal.id, payload);
      }
      await loadGoals();
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar meta');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGoal) return;
    try {
      setSaving(true);
      await goalAPI.deleteGoal(selectedGoal.id);
      await loadGoals();
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao excluir meta');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsCompleted = async (goal: Goal, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await goalAPI.markAsCompleted(goal.id);
      await loadGoals();
    } catch {
      // silent fail
    }
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

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">
          {error}
        </div>
      )}

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
          <p className="mx-auto max-w-xs text-sm text-slate-500 dark:text-slate-400">
            Crie sua primeira meta financeira para começar a poupar com propósito.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGoals.map((goal) => {
            const percent = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            const isCompleted = goal.status === 'COMPLETED' || percent >= 100;
            const deadlineDate = goal.deadline ? new Date(goal.deadline + 'T00:00:00') : null;
            const isOverdue = deadlineDate ? (!isCompleted && new Date() > deadlineDate) : false;

            return (
              <div
                key={goal.id}
                onClick={() => openDetailModal(goal)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/60 p-6 shadow-xl backdrop-blur-sm transition cursor-pointer hover:border-blue-400/60 dark:hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-[#0d1828]/95 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                {/* Completed glow */}
                {isCompleted && (
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/5 blur-3xl" />
                )}

                {/* Click hint */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-4 w-4 text-blue-400" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-12">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        goal.type === 'EMERGENCY'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : goal.type === 'TRAVEL'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      }`}>
                        {goal.type === 'EMERGENCY' ? 'Reserva' : goal.type === 'TRAVEL' ? 'Viagem' : 'Objetivo'}
                      </span>
                      <h3 className="mt-2 text-lg font-bold text-slate-800 dark:text-white leading-tight truncate">{goal.name}</h3>
                    </div>

                    <div className="absolute top-4 right-10 flex items-center gap-1 opacity-100 group-hover:opacity-0 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(goal); }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openDeleteModal(goal); }}
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
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {formatCurrency(goal.targetAmount)}
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

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
                  <span className={`flex items-center gap-1 text-xs ${
                    isCompleted
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : isOverdue
                        ? 'text-red-500 dark:text-red-400 font-semibold'
                        : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {isCompleted ? (
                      <><Award className="h-4 w-4" /><span>Concluída!</span></>
                    ) : isOverdue ? (
                      <><AlertCircle className="h-4 w-4" /><span>Vencida em {deadlineDate?.toLocaleDateString('pt-BR')}</span></>
                    ) : (
                      <><Clock className="h-4 w-4" /><span>Prazo: {deadlineDate?.toLocaleDateString('pt-BR') ?? '—'}</span></>
                    )}
                  </span>

                  {!isCompleted && (
                    <button
                      onClick={(e) => handleMarkAsCompleted(goal, e)}
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

      {/* ───── DETAIL MODAL ───── */}
      {isDetailOpen && detailGoal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsDetailOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#081321] shadow-2xl animate-in scale-in duration-200 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="relative flex items-start justify-between border-b border-slate-100 dark:border-white/10 p-6 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 dark:from-blue-600/10 dark:to-indigo-600/10">
              <div className="flex-1 min-w-0 pr-8">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold mb-2 ${
                  detailGoal.type === 'EMERGENCY'
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                    : detailGoal.type === 'TRAVEL'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                }`}>
                  {detailGoal.type === 'EMERGENCY' ? 'Reserva' : detailGoal.type === 'TRAVEL' ? 'Viagem' : 'Objetivo'}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{detailGoal.name}</h3>

                {/* Progress summary */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{formatCurrency(detailGoal.currentAmount)}</span>
                    <span className="text-slate-500 dark:text-slate-400">de {formatCurrency(detailGoal.targetAmount)}</span>
                  </div>
                  {(() => {
                    const pct = Math.min(Math.round((detailGoal.currentAmount / detailGoal.targetAmount) * 100), 100);
                    const done = detailGoal.status === 'COMPLETED' || pct >= 100;
                    return (
                      <div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${done ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500 mt-0.5">
                          <span>Progresso</span>
                          <span className={`font-bold ${done ? 'text-emerald-500' : 'text-blue-500'}`}>{pct}%</span>
                        </div>
                      </div>
                    );
                  })()}
                  {detailGoal.deadline && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>Prazo: {new Date(detailGoal.deadline + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Transactions list */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-slate-400" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Histórico de Movimentações</h4>
              </div>

              {loadingTransactions ? (
                <div className="flex items-center justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-400" />
                </div>
              ) : goalTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 rounded-full bg-slate-100 dark:bg-white/5 p-4">
                    <Target className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Nenhuma movimentação registrada ainda</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Vincule transações a esta meta para ver o histórico</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {goalTransactions.map((tx) => {
                    const isIncome = tx.type === 'INCOME';
                    const txDate = new Date(tx.date + 'T00:00:00');
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 px-4 py-3 transition hover:bg-slate-100 dark:hover:bg-white/10"
                      >
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${isIncome ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                          {isIncome
                            ? <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                            : <ArrowDownCircle className="h-4 w-4 text-red-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{tx.description}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{txDate.toLocaleDateString('pt-BR')}</p>
                        </div>
                        <span className={`text-sm font-bold flex-shrink-0 ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───── CREATE & EDIT MODAL ───── */}
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
                  disabled={saving}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : 'Salvar Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───── DELETE CONFIRMATION MODAL ───── */}
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

            {errorMessage && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

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
                disabled={saving}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-500 transition disabled:opacity-60"
              >
                {saving ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
