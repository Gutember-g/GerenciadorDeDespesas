import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Filter, Search, TrendingDown, TrendingUp, X, Edit2, Trash2, AlertCircle, Check, Calendar, CreditCard, Tag, ChevronDown, AlertTriangle } from 'lucide-react';
import { transactionAPI, accountAPI, categoryAPI } from '../services/api';
import { useMes } from '../contexts/MesContext';
import { useAuthSettings } from '../contexts/AuthSettingsContext.tsx';

export function TransactionList({ 
  refreshTrigger, 
  globalSearch = '',
  onRefresh
}: { 
  refreshTrigger?: number; 
  globalSearch?: string;
  onRefresh?: () => void;
}) {
  const { formatCurrency } = useAuthSettings();
  const { mesAtivo, nextMonth, prevMonth } = useMes();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(globalSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(globalSearch);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editType, setEditType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editAccountId, setEditAccountId] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [editStatus, setEditStatus] = useState<'RECEIVED' | 'PENDING'>('RECEIVED');
  const [editAllFuture, setEditAllFuture] = useState(false);

  // Category select inside modal states
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // Cards select inside modal states
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState('');

  // Delete states
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<any | null>(null);
  const [deleteFutureOption, setDeleteFutureOption] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleStartEdit = async (tx: any) => {
    setEditingTransaction(tx);
    setEditDescription(tx.description || '');
    const initialAmountValue = tx.type === 'EXPENSE' ? -tx.amount : tx.amount;
    setEditAmount(initialAmountValue.toString());
    setEditDate(tx.date || '');
    setEditType(tx.type || 'EXPENSE');
    setEditCategoryId(tx.category?.id?.toString() || '');
    setEditAccountId(tx.account?.id?.toString() || '');
    setEditPaymentMethod(tx.paymentMethod || 'DEBITO');
    setEditStatus(tx.status || 'RECEIVED');
    setSelectedCardId(tx.cardId?.toString() || '');
    setEditAllFuture(false);
    setShowCategoryDropdown(false);
    setCategorySearch('');
    setIsEditModalOpen(true);

    try {
      const storedCards = localStorage.getItem('financontrol_cards');
      if (storedCards) {
        setCards(JSON.parse(storedCards));
      }

      if (accounts.length === 0 || categories.length === 0) {
        const [accs, cats] = await Promise.all([
          accountAPI.getAccounts(),
          categoryAPI.getCategories()
        ]);
        setAccounts(accs);
        setCategories(cats);
      }
    } catch (err) {
      console.error("Erro ao carregar dados para edição", err);
    }
  };

  const handleAmountChange = (val: string) => {
    setEditAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      if (num < 0) {
        setEditType('EXPENSE');
      } else if (num > 0) {
        setEditType('INCOME');
      }
    }
  };

  const handleTypeChange = (newType: 'INCOME' | 'EXPENSE') => {
    setEditType(newType);
    const num = parseFloat(editAmount);
    if (!isNaN(num)) {
      if (newType === 'EXPENSE' && num > 0) {
        setEditAmount((-num).toString());
      } else if (newType === 'INCOME' && num < 0) {
        setEditAmount(Math.abs(num).toString());
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    try {
      const parsedAmount = parseFloat(editAmount);
      if (isNaN(parsedAmount)) {
        showToast('Por favor, insira um valor válido.', 'error');
        return;
      }

      const isExpense = parsedAmount < 0;
      const requestAmount = Math.abs(parsedAmount);
      const requestType = isExpense ? 'DEBITO' : 'CREDITO';

      if (requestAmount <= 0) {
        showToast('O valor deve ser diferente de zero.', 'error');
        return;
      }

      if (!editDescription.trim()) {
        showToast('A descrição é obrigatória.', 'error');
        return;
      }

      if (!editAccountId) {
        showToast('Selecione uma conta.', 'error');
        return;
      }

      if (!editCategoryId) {
        showToast('Selecione uma subcategoria.', 'error');
        return;
      }

      const dto = {
        descricao: editDescription,
        valorTotal: requestAmount,
        dataPrimeiraParcela: editDate,
        numeroParcelas: editingTransaction.totalInstallments || 1,
        tipo: requestType,
        contaId: parseInt(editAccountId, 10),
        categoriaId: parseInt(editCategoryId, 10),
        meioPagamento: editPaymentMethod,
        status: editStatus,
        cardId: editPaymentMethod === 'CREDITO' ? parseInt(selectedCardId, 10) : null
      };

      await transactionAPI.updateTransaction(editingTransaction.id, dto, editAllFuture);
      
      showToast('Transação atualizada com sucesso!', 'success');
      setIsEditModalOpen(false);
      fetchTransactions();
      onRefresh?.();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erro ao atualizar transação.', 'error');
    }
  };

  const handleStartDelete = (tx: any) => {
    setDeletingTransaction(tx);
    setDeleteFutureOption(false);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTransaction) return;

    try {
      await transactionAPI.deleteTransaction(deletingTransaction.id, deleteFutureOption);
      showToast('Transação excluída com sucesso!', 'success');
      setIsDeleteConfirmOpen(false);
      fetchTransactions();
      onRefresh?.();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erro ao excluir transação.', 'error');
    }
  };

  // Category filtering for select inside modal
  const filteredCategories = categories.filter((cat) => cat.type === (editType === 'INCOME' ? 'INCOME' : 'EXPENSE'));
  const searchLower = categorySearch.toLowerCase();
  const searchedCategories = filteredCategories.filter(cat => 
    cat.name.toLowerCase().includes(searchLower)
  );

  const groupedCategories = searchedCategories.reduce((groups: { [key: string]: any[] }, cat) => {
    let parent = cat.budgetRuleType || 'Necessidades';
    if (parent === 'ESSENTIAL') parent = 'Necessidades';
    if (parent === 'WANTS') parent = 'Desejos';
    if (parent === 'SAVINGS') parent = 'Prioridades financeiras';
    
    if (!groups[parent]) {
      groups[parent] = [];
    }
    groups[parent].push(cat);
    return groups;
  }, {});

  useEffect(() => {
    const selectedCategory = categories.find((cat) => cat.id.toString() === editCategoryId);
    const filtered = categories.filter((cat) => cat.type === (editType === 'INCOME' ? 'INCOME' : 'EXPENSE'));
    if (selectedCategory && selectedCategory.type !== (editType === 'INCOME' ? 'INCOME' : 'EXPENSE')) {
      setEditCategoryId(filtered[0]?.id?.toString() || '');
    }
  }, [editType, categories]);

  useEffect(() => {
    if (!showCategoryDropdown) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.edit-category-select-container')) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showCategoryDropdown]);

  useEffect(() => {
    setSearch(globalSearch);
  }, [globalSearch]);
  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search]);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await transactionAPI.getTransactions(mesAtivo.month, mesAtivo.year, debouncedSearch);
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao buscar transações', error);
    } finally {
      setLoading(false);
    }
  }, [mesAtivo, debouncedSearch]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshTrigger]);

  const formatMonth = () => {
    return new Date(mesAtivo.year, mesAtivo.month - 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'ALL') return true;
    return tx.type === filterType;
  });

  const groupedTransactions = filteredTransactions.reduce((acc: any, tx: any) => {
    const [y, m, d] = tx.date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dateKey = dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
    });

    if (!acc[dateKey]) {
      acc[dateKey] = { transactions: [], total: 0 };
    }

    acc[dateKey].transactions.push(tx);
    acc[dateKey].total += tx.type === 'INCOME' ? tx.amount : -tx.amount;
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
    const dayA = parseInt(a.split(' ')[0], 10);
    const dayB = parseInt(b.split(' ')[0], 10);
    return dayB - dayA;
  });

  if (loading) {
    return (
      <div className="grid h-64 place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500/25 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/80 p-4 shadow-sm dark:shadow-2xl dark:shadow-black/20 lg:flex-row lg:items-center">
        <div className="flex items-center space-x-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#07111f] p-1">
          <button
            onClick={prevMonth}
            className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-[140px] px-4 text-center text-sm font-semibold capitalize text-slate-800 dark:text-slate-200">{formatMonth()}</span>
          <button
            onClick={nextMonth}
            className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex flex-1 items-center lg:max-w-md">
          <Search className="absolute left-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#07111f] py-2 pl-10 pr-10 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#07111f] p-1">
          {[
            ['ALL', 'Todos'],
            ['INCOME', 'Entrada'],
            ['EXPENSE', 'Saída'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilterType(value as 'ALL' | 'INCOME' | 'EXPENSE')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filterType === value
                  ? value === 'INCOME'
                    ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
                    : value === 'EXPENSE'
                      ? 'bg-red-500/10 text-red-500 dark:text-red-400'
                      : 'bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/80 shadow-sm dark:shadow-2xl dark:shadow-black/20">
        <div className="border-b border-slate-200 dark:border-white/10 p-6 bg-slate-50/50 dark:bg-[#081321]/20">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Extrato detalhado</h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 rounded-full bg-slate-100 dark:bg-white/5 p-4">
              <Filter className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-slate-800 dark:text-slate-200">Nenhuma transação encontrada</h3>
            <p className="mx-auto max-w-xs text-slate-500 dark:text-slate-400 text-sm">
              Tente ajustar os filtros ou busque por outro termo para encontrar o que procura.
            </p>
            {(search || filterType !== 'ALL') && (
              <button
                onClick={() => {
                  setSearch('');
                  setFilterType('ALL');
                }}
                className="mt-6 text-sm font-semibold text-blue-500 dark:text-blue-400 transition-colors hover:text-blue-600 dark:hover:text-blue-300"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {sortedDates.map((date) => (
              <div key={date}>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-white/5 px-6 py-3 border-y border-slate-200 dark:border-white/5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{date}</span>
                  <span className={`text-xs font-bold ${groupedTransactions[date].total >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {groupedTransactions[date].total >= 0 ? '+' : '-'} {formatCurrency(Math.abs(groupedTransactions[date].total))}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {groupedTransactions[date].transactions.map((tx: any) => {
                    const isIncome = tx.type === 'INCOME';
                    const [y, m, d] = tx.date.split('-').map(Number);
                    const dateObj = new Date(y, m - 1, d);
                    const isFuture = new Date() < dateObj;

                    return (
                      <div key={tx.id} className="group flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className={`rounded-lg p-2 ${isIncome ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'bg-red-500/10 text-red-500 dark:text-red-400'} transition-transform group-hover:scale-110`}>
                            {isIncome ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{tx.description}</p>
                              {isFuture && (
                                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-300">
                                  <Clock className="mr-1 h-3 w-3" /> Futura
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              {tx.category && (
                                <span
                                  className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                                  style={{ backgroundColor: `${tx.category.color}18`, color: tx.category.color }}
                                >
                                  {tx.category.name}
                                </span>
                              )}
                              {(tx.categoria || tx.parentCategory) && (
                                <span className="rounded bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                  {tx.categoria || tx.parentCategory}
                                </span>
                              )}
                              {tx.meioPagamento && (
                                <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-300">
                                  {tx.meioPagamento}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">ID: #{tx.id}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pl-4 shrink-0">
                          <div className="text-right">
                            <p className={`text-sm font-bold ${isIncome ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                              {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                            </p>
                            <p className={`mt-0.5 text-[10px] ${tx.status === 'PENDING' ? 'text-amber-500 dark:text-amber-405 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                              {tx.status === 'PENDING' ? 'Pendente' : 'Liquidado'}
                            </p>
                          </div>
                          
                          {/* Botões de Ação discretos */}
                          <div className="flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => handleStartEdit(tx)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStartDelete(tx)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FLOATING TOAST FEEDBACK */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-55 flex items-center gap-2 rounded-xl border p-4 text-sm shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
        }`}>
          {toast.type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteConfirmOpen && deletingTransaction && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm overflow-hidden bg-white dark:bg-[#081321] border border-slate-200 dark:border-white/10 p-6 shadow-2xl rounded-2xl transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-red-500/10 p-3 text-red-500">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">Excluir transação?</h3>
              
              {deletingTransaction.isInstallment && deletingTransaction.installmentGroupId ? (
                <div className="w-full space-y-4 my-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Esta transação faz parte de uma compra parcelada (Parcela {deletingTransaction.currentInstallment} de {deletingTransaction.totalInstallments}). Como deseja prosseguir?
                  </p>
                  <div className="flex flex-col gap-2 text-left">
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                      <input 
                        type="radio" 
                        name="deleteOption" 
                        checked={!deleteFutureOption}
                        onChange={() => setDeleteFutureOption(false)}
                        className="text-red-500 focus:ring-red-500 focus:ring-offset-0"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Apenas esta parcela</p>
                        <p className="text-[10px] text-slate-400">Exclui apenas o registro do mês correspondente</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-55 dark:bg-white/5 p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                      <input 
                        type="radio" 
                        name="deleteOption" 
                        checked={deleteFutureOption}
                        onChange={() => setDeleteFutureOption(true)}
                        className="text-red-500 focus:ring-red-500 focus:ring-offset-0"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Esta e todas as futuras</p>
                        <p className="text-[10px] text-slate-400">Remove esta parcela e todas as subsequentes desta compra</p>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <p className="my-4 text-sm text-slate-500 dark:text-slate-400">
                  Tem certeza que deseja excluir a transação <strong>"{deletingTransaction.description}"</strong>? Essa ação não pode ser desfeita.
                </p>
              )}

              <div className="flex w-full gap-3 mt-2">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 px-4 py-3 text-sm font-semibold text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TRANSACTION MODAL */}
      {isEditModalOpen && editingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsEditModalOpen(false)}>
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden bg-white dark:bg-[#081321] border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl transform transition-all scale-100 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 dark:border-white/10 bg-white/95 dark:bg-[#081321]/95 p-6 backdrop-blur-xl">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editar Transação</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Altere as informações necessárias</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSaveEdit} className="flex-1 space-y-5 overflow-y-auto p-6">
              
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleTypeChange('EXPENSE')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 transition-all ${editType === 'EXPENSE' ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300'}`}
                >
                  <TrendingDown className="h-5 w-5" />
                  <span className="font-medium">Saída</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('INCOME')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 transition-all ${editType === 'INCOME' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300'}`}
                >
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Entrada</span>
                </button>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Descrição</label>
                <input
                  required
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-slate-800 dark:text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="Ex: Supermercado"
                />
              </div>

              {/* Amount (Positive/Negative) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Valor Total
                </label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-slate-800 dark:text-white outline-none focus:border-blue-500 transition-colors"
                    placeholder="0,00"
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-550">
                  * Dica: valores negativos indicam Saídas (ex: -50) e positivos Entradas (ex: 50).
                </p>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-350">
                  <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                  Data
                </label>
                <input
                  required
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-slate-800 dark:text-white outline-none [color-scheme:light] dark:[color-scheme:dark] focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Account select */}
              <div className="space-y-1.5">
                <label className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-350">
                  <CreditCard className="mr-2 h-4 w-4 text-slate-400" />
                  Conta
                </label>
                <select
                  value={editAccountId}
                  onChange={(e) => setEditAccountId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-slate-800 dark:text-white outline-none focus:border-blue-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                >
                  <option value="">Selecione uma conta...</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Meio de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['PIX', 'Pix'],
                    ['DEBITO', 'Débito'],
                    ['CREDITO', 'Crédito'],
                    ['DINHEIRO', 'Espécie'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setEditPaymentMethod(value)}
                      className={`rounded-xl border p-2.5 text-xs font-semibold transition-all text-center ${editPaymentMethod === value ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card selector */}
              {(editPaymentMethod === 'CREDITO' || (editingTransaction && editingTransaction.totalInstallments > 1)) && (
                <div className="space-y-1.5">
                  <label className="flex items-center text-sm font-medium text-slate-650 dark:text-slate-300">
                    <CreditCard className="mr-2 h-4 w-4 text-slate-400" />
                    Selecione o Cartão
                  </label>
                  <select
                    value={selectedCardId}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-slate-800 dark:text-white outline-none focus:border-blue-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                  >
                    <option value="">Selecione um cartão...</option>
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.brand})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category Select inside Edit Modal */}
              <div className="space-y-1.5 edit-category-select-container relative">
                <label className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-350">
                  <Tag className="mr-2 h-4 w-4 text-slate-400" />
                  Subcategoria
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-slate-55 dark:bg-[#0d1828] px-4 py-3 text-left text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  >
                    {(() => {
                      const selected = categories.find(c => c.id.toString() === editCategoryId);
                      if (selected) {
                        return (
                          <span className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selected.color }} />
                            {selected.name}
                          </span>
                        );
                      }
                      return <span className="text-slate-450 text-sm">Selecione uma subcategoria...</span>;
                    })()}
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {showCategoryDropdown && (
                    <div className="absolute left-0 z-55 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0f1a2a] p-2 shadow-2xl shadow-slate-250/20 dark:shadow-black/70 animate-in fade-in duration-200">
                      <div className="relative mb-2 flex items-center p-1">
                        <Search className="absolute left-3 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Buscar subcategoria..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#07111f] py-1.5 pl-9 pr-3 text-xs text-slate-800 dark:text-white outline-none focus:border-blue-500"
                        />
                      </div>

                      {Object.keys(groupedCategories).length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-500">
                          Nenhuma subcategoria encontrada
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {Object.keys(groupedCategories).map((parentName) => {
                            const groupColor = parentName === 'Necessidades' ? 'text-emerald-600 dark:text-emerald-400' : parentName === 'Desejos' ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-yellow-450';
                            return (
                              <div key={parentName} className="space-y-1">
                                <div className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${groupColor}`}>
                                  {parentName}
                                </div>
                                <div className="space-y-0.5 pl-1">
                                  {groupedCategories[parentName].map((cat) => {
                                    const isSelected = cat.id.toString() === editCategoryId;
                                    return (
                                      <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => {
                                          setEditCategoryId(cat.id.toString());
                                          setShowCategoryDropdown(false);
                                          setCategorySearch('');
                                        }}
                                        className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-xs transition-colors ${isSelected ? 'bg-blue-500/10 text-blue-600 dark:text-blue-300' : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                      >
                                        <span className="flex items-center gap-2">
                                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                          {cat.name}
                                        </span>
                                        {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Status</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setEditStatus('RECEIVED')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 transition-all text-xs font-semibold ${editStatus === 'RECEIVED' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-slate-200 dark:border-white/10 bg-slate-55 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300'}`}
                  >
                    <Check className="h-4 w-4" />
                    <span>Pago/Recebido</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus('PENDING')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 transition-all text-xs font-semibold ${editStatus === 'PENDING' ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-white/10 bg-slate-55 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300'}`}
                  >
                    <Clock className="h-4 w-4" />
                    <span>Pendente</span>
                  </button>
                </div>
              </div>

              {/* Recurrence Option (editAllFuture) */}
              {editingTransaction.isInstallment && editingTransaction.installmentGroupId && (
                <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-955/15 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editAllFuture}
                      onChange={(e) => setEditAllFuture(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 dark:border-white/10 bg-white dark:bg-[#07111f] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Alterar parcelas futuras?</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Se marcado, as alterações serão aplicadas a esta parcela (Parcela {editingTransaction.currentInstallment}) e a todas as futuras.
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-slate-100 dark:border-white/10 bg-white/95 dark:bg-[#081321]/95 p-6 backdrop-blur-xl flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 px-4 py-3 text-sm font-semibold text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-[2] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:brightness-110"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
