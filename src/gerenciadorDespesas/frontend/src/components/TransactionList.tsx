import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Filter, Search, TrendingDown, TrendingUp, X } from 'lucide-react';
import { transactionAPI } from '../services/api';
import { useMes } from '../contexts/MesContext';
import { useAuthSettings } from '../contexts/AuthSettingsContext.tsx';

export function TransactionList({ refreshTrigger, globalSearch = '' }: { refreshTrigger?: number; globalSearch?: string }) {
  const { formatCurrency } = useAuthSettings();
  const { mesAtivo, nextMonth, prevMonth } = useMes();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(globalSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(globalSearch);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

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
                        <div className="shrink-0 pl-4 text-right">
                          <p className={`text-sm font-bold ${isIncome ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                            {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">Liquidado</p>
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
    </div>
  );
}
