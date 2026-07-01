import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, TrendingDown, Layers, ArrowUpRight, Percent, Calendar, Loader2 } from 'lucide-react';
import { transactionAPI } from '../services/api';
import { useMes } from '../contexts/MesContext';
import { useAuthSettings } from '../contexts/AuthSettingsContext.tsx';

interface SubCategoryGroup {
  name: string;
  total: number;
  color: string;
  count: number;
}

interface ParentCategoryGroup {
  name: string;
  total: number;
  color: string;
  percentageOfExpenses: number;
  subcategories: SubCategoryGroup[];
}

export function Reports({ refreshTrigger }: { refreshTrigger?: number }) {
  const { formatCurrency } = useAuthSettings();
  const { mesAtivo, nextMonth, prevMonth } = useMes();
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState<ParentCategoryGroup[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const formatMonth = () => {
    return new Date(mesAtivo.year, mesAtivo.month - 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  };

  const processTransactions = useCallback((txList: any[]) => {
    const expenses = txList.filter((tx) => tx.type === 'EXPENSE');
    const totalExp = expenses.reduce((sum, tx) => sum + tx.amount, 0);
    setTotalExpenses(totalExp);

    // Grouping structure
    const groups: { [key: string]: { total: number; color: string; subs: { [key: string]: SubCategoryGroup } } } = {
      'Necessidades': { total: 0, color: '#22c55e', subs: {} },
      'Desejos': { total: 0, color: '#3b82f6', subs: {} },
      'Prioridades financeiras': { total: 0, color: '#eab308', subs: {} }
    };

    expenses.forEach((tx) => {
      // Get parent category name (inferred in backend or default mapping)
      const parentName = tx.categoria || tx.parentCategory || 'Necessidades';
      
      // Get subcategory details
      const subName = tx.subcategoria || (tx.category ? tx.category.name : 'Outros');
      const subColor = tx.category ? tx.category.color : '#64748b';

      if (!groups[parentName]) {
        groups[parentName] = { total: 0, color: '#6366f1', subs: {} };
      }

      groups[parentName].total += tx.amount;

      if (!groups[parentName].subs[subName]) {
        groups[parentName].subs[subName] = {
          name: subName,
          total: 0,
          color: subColor,
          count: 0
        };
      }

      groups[parentName].subs[subName].total += tx.amount;
      groups[parentName].subs[subName].count += 1;
    });

    const result: ParentCategoryGroup[] = Object.keys(groups).map((parentName) => {
      const g = groups[parentName];
      const subsArray = Object.values(g.subs).sort((a, b) => b.total - a.total);
      const pct = totalExp > 0 ? (g.total / totalExp) * 100 : 0;

      return {
        name: parentName,
        total: g.total,
        color: g.color,
        percentageOfExpenses: pct,
        subcategories: subsArray
      };
    }).sort((a, b) => b.total - a.total);

    setGroupedData(result);
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await transactionAPI.getTransactions(mesAtivo.month, mesAtivo.year);
      processTransactions(data);
    } catch (error) {
      console.error('Erro ao buscar transações nos relatórios', error);
    } finally {
      setLoading(false);
    }
  }, [mesAtivo, processTransactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshTrigger]);

  if (loading) {
    return (
      <div className="grid h-64 place-items-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Month Selector */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/80 p-4 shadow-sm dark:shadow-2xl dark:shadow-black/20 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            Relatório de Despesas Hierárquicas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Distribuição detalhada por Categoria Pai e Subcategoria</p>
        </div>

        <div className="flex items-center space-x-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#07111f] p-1 self-start lg:self-auto">
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
      </div>

      {totalExpenses === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/80 px-6 py-20 text-center shadow-sm dark:shadow-xl">
          <div className="mb-4 rounded-full bg-slate-100 dark:bg-white/5 p-4">
            <Calendar className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-slate-800 dark:text-slate-200">Nenhum lançamento no período</h3>
          <p className="mx-auto max-w-xs text-slate-500 dark:text-slate-400 text-sm">
            Não há despesas registradas para {formatMonth()}. Adicione uma nova transação de saída para ver o relatório.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.8fr]">
          {/* Summary Column */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/80 p-5 shadow-sm dark:shadow-xl">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Despesas</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(totalExpenses)}</span>
                <span className="rounded bg-red-500/10 px-2 py-0.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" /> Saídas
                </span>
              </div>
            </div>

            {/* Distribution Graph Card */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/80 p-5 shadow-sm dark:shadow-xl space-y-4">
              <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">Distribuição Consolidada</h3>
              <div className="h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5 flex">
                {groupedData.map((group) => (
                  group.percentageOfExpenses > 0 && (
                    <div
                      key={group.name}
                      style={{
                        width: `${group.percentageOfExpenses}%`,
                        backgroundColor: group.color
                      }}
                      title={`${group.name}: ${group.percentageOfExpenses.toFixed(1)}%`}
                    />
                  )
                ))}
              </div>

              <div className="space-y-3 pt-2">
                {groupedData.map((group) => (
                  <div key={group.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: group.color }} />
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{group.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(group.total)}</span>
                      <span className="text-slate-400 dark:text-slate-500 ml-2">({group.percentageOfExpenses.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grouped Details Column */}
          <div className="space-y-6">
            {groupedData.map((group) => (
              <div
                key={group.name}
                className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/80 shadow-sm dark:shadow-xl"
              >
                {/* Parent Category Header */}
                <div
                  className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c1624]"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-4 w-4 rounded-full" style={{ backgroundColor: group.color }} />
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{group.name}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(group.total)}</p>
                      <p className="text-[10px] text-slate-500">Total do grupo</p>
                    </div>
                    <div className="rounded bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Percent className="h-3.5 w-3.5" />
                      {group.percentageOfExpenses.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Subcategories list */}
                {group.subcategories.length === 0 ? (
                  <div className="px-6 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    Nenhuma subcategoria registrada neste grupo para o mês.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {group.subcategories.map((sub) => {
                      const shareOfParent = group.total > 0 ? (sub.total / group.total) * 100 : 0;
                      return (
                        <div key={sub.name} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{sub.name}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500">{sub.count} lançamento(s)</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{shareOfParent.toFixed(0)}% do grupo</p>
                              <div className="mt-1 h-1.5 w-20 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${shareOfParent}%`, backgroundColor: sub.color }} />
                              </div>
                            </div>
                            <div className="text-right min-w-[90px]">
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatCurrency(sub.total)}</p>
                              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 text-[9px] text-slate-500 dark:text-slate-400">
                                <ArrowUpRight className="mr-0.5 h-2 w-2" /> Share: {(sub.total / totalExpenses * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
