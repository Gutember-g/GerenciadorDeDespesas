import { useEffect, useState, useCallback, useRef } from 'react';
import { transactionAPI } from '../services/api';
import { TrendingUp, TrendingDown, Clock, Search, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useMes } from '../contexts/MesContext';

export function TransactionList({ refreshTrigger }: { refreshTrigger?: number }) {
  const { mesAtivo, nextMonth, prevMonth } = useMes();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await transactionAPI.getTransactions(mesAtivo.month, mesAtivo.year, debouncedSearch);
      setTransactions(data);
    } catch (error) {
      console.error("Erro ao buscar transacoes", error);
    } finally {
      setLoading(false);
    }
  }, [mesAtivo, debouncedSearch]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const formatMonth = () => {
    return new Date(mesAtivo.year, mesAtivo.month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  // Filtrar por tipo (Crédito/Débito) no frontend
  const filteredTransactions = transactions.filter(tx => {
    if (filterType === 'ALL') return true;
    return tx.type === filterType;
  });

  // Agrupar por data
  const groupedTransactions = filteredTransactions.reduce((acc: any, tx: any) => {
    const dateObj = new Date(tx.date);
    const dateKey = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

    if (!acc[dateKey]) {
      acc[dateKey] = {
        transactions: [],
        total: 0
      };
    }

    acc[dateKey].transactions.push(tx);
    acc[dateKey].total += (tx.type === 'INCOME' ? tx.amount : -tx.amount);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
    // Note: this sorting assumes transactions from the same month
    const dayA = parseInt(a.split(' ')[0]);
    const dayB = parseInt(b.split(' ')[0]);
    return dayB - dayA;
  });

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 font-medium min-w-[140px] text-center capitalize text-sm">{formatMonth()}</span>
          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 items-center max-w-md relative">
          <Search className="absolute left-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 p-1 hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterType === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType('INCOME')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterType === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Crédito
          </button>
          <button
            onClick={() => setFilterType('EXPENSE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterType === 'EXPENSE' ? 'bg-red-500/10 text-red-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Débito
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-800">
            <h3 className="text-xl font-semibold">Extrato Detalhado</h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
             <div className="bg-slate-800/50 p-4 rounded-full mb-4">
                <Filter className="w-8 h-8 text-slate-500" />
             </div>
             <h3 className="text-lg font-medium text-slate-200 mb-1">Nenhuma transação encontrada</h3>
             <p className="text-slate-400 max-w-xs mx-auto">
                Tente ajustar os filtros ou busque por outro termo para encontrar o que procura.
             </p>
             {(search || filterType !== 'ALL') && (
                <button
                  onClick={() => { setSearch(''); setFilterType('ALL'); }}
                  className="mt-6 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                >
                  Limpar todos os filtros
                </button>
             )}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {sortedDates.map(date => (
              <div key={date} className="animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="bg-slate-800/30 px-6 py-3 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{date}</span>
                  <span className={`text-xs font-bold ${groupedTransactions[date].total >= 0 ? 'text-emerald-500/80' : 'text-slate-400'}`}>
                    {groupedTransactions[date].total >= 0 ? '+' : ''} R$ {groupedTransactions[date].total.toFixed(2)}
                  </span>
                </div>

                <div className="divide-y divide-slate-800/30">
                  {groupedTransactions[date].transactions.map((tx: any) => {
                    const isIncome = tx.type === 'INCOME';
                    const dateObj = new Date(tx.date);
                    const isFuture = new Date() < dateObj;

                    return (
                      <div key={tx.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/20 transition-colors group">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-400'} group-hover:scale-110 transition-transform`}>
                            {isIncome ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-slate-200">{tx.description}</p>
                              {isFuture && (
                                <span className="inline-flex items-center text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                  <Clock className="w-3 h-3 mr-1" /> Futura
                                </span>
                              )}
                            </div>
                            <div className="flex items-center mt-0.5">
                               {tx.category && (
                                 <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${tx.category.color}15`, color: tx.category.color }}>
                                    {tx.category.name}
                                 </span>
                               )}
                               <span className="text-[10px] text-slate-500 ml-2">ID: #{tx.id}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${isIncome ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {isIncome ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Liquidado</p>
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
