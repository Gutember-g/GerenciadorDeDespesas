import { AlertCircle } from 'lucide-react';
import { useAuthSettings } from '../../contexts/AuthSettingsContext.tsx';
import { calcularFaturaAtual } from '../../utils/cardInvoiceUtils';

interface DashboardModalContentProps {
  type: 'renda' | 'gastos' | 'fatura' | 'reserva' | 'grafico-mes' | 'categoria' | 'todas-categorias' | null;
  payload: any;
  dashboardData: any;
  transactions: any[];
  onNavigate?: (tab: 'dashboard' | 'transactions' | 'reports' | 'categories' | 'goals' | 'cards' | 'settings') => void;
  onClose: () => void;
  onChangeType?: (type: 'renda' | 'gastos' | 'fatura' | 'reserva' | 'grafico-mes' | 'categoria' | 'todas-categorias' | null, payload: any) => void;
}

export const DashboardModalContent = ({
  type,
  payload,
  dashboardData: data,
  transactions,
  onNavigate,
  onClose,
  onChangeType
}: DashboardModalContentProps) => {
  const { formatCurrency } = useAuthSettings();

  if (!type || !data) return null;

  switch (type) {
    case 'renda': {
      const incomeTransactions = transactions.filter(t => t.type === 'INCOME');
      const netAmount = data.totalReceitas - data.totalDespesas;
      
      return (
        <div className="space-y-6">
          {/* Resumo */}
          <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Total de Receitas</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-405">{formatCurrency(data.totalReceitas)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Total de Despesas</span>
              <span className="font-semibold text-red-600 dark:text-red-405">{formatCurrency(data.totalDespesas)}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-slate-200/50 dark:border-white/5 pt-3">
              <span className="font-bold text-slate-800 dark:text-white">Saldo Líquido</span>
              <span className={`text-lg font-extrabold ${netAmount >= 0 ? 'text-emerald-600 dark:text-emerald-450' : 'text-red-650 dark:text-red-400'}`}>
                {formatCurrency(netAmount)}
              </span>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                +6.8% vs. mês anterior
              </span>
            </div>
          </div>

          {/* Evolução SVG */}
          <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/2 p-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Evolução do Saldo Líquido (6 meses)</p>
            <div className="h-16 w-full flex items-end">
              <svg className={`h-full w-full ${netAmount >= 0 ? 'text-emerald-550' : 'text-red-500'}`} viewBox="0 0 100 30" preserveAspectRatio="none">
                <path
                  d="M 0 25 L 20 20 L 40 18 L 60 22 L 80 15 L 100 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 0 25 L 20 20 L 40 18 L 60 22 L 80 15 L 100 8 L 100 30 L 0 30 Z"
                  fill="currentColor"
                  className="opacity-10"
                />
              </svg>
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 mt-2">
              <span>Jan</span>
              <span>Fev</span>
              <span>Mar</span>
              <span>Abr</span>
              <span>Mai</span>
              <span>Jun</span>
            </div>
          </div>

          {/* Lista de Receitas */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lista de Receitas do Mês</p>
            {incomeTransactions.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">Nenhuma receita registrada neste mês.</p>
            ) : (
              <div className="border border-slate-200/60 dark:border-white/5 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
                {incomeTransactions.map((tx: any) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-white/2">
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{tx.description}</p>
                      <span className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
                <div className="bg-slate-50/50 dark:bg-white/2 p-3 flex justify-between items-center text-xs font-bold">
                  <span>Total de entradas</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(data.totalReceitas)}</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              onClose();
              onNavigate?.('transactions');
            }}
            className="w-full rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 py-3 text-xs font-bold transition text-center block"
          >
            Ver todas as transações
          </button>
        </div>
      );
    }

    case 'gastos': {
      const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE');
      const sortedExpenses = [...expenseTransactions].sort((a, b) => b.amount - a.amount);
      const largestExpense = sortedExpenses[0];

      // Calcular gastos por subcategoria
      const expensesByCategory = expenseTransactions.reduce((acc: any, t) => {
        const catName = t.category ? t.category.name : (t.categoria || 'Outros');
        const catColor = t.category ? t.category.color : '#ef4444';
        if (!acc[catName]) {
          acc[catName] = { amount: 0, color: catColor };
        }
        acc[catName].amount += Math.abs(t.amount);
        return acc;
      }, {});

      const categoriesList = Object.keys(expensesByCategory).map(name => ({
        name,
        amount: expensesByCategory[name].amount,
        color: expensesByCategory[name].color,
        percent: data.totalDespesas > 0 ? (expensesByCategory[name].amount / data.totalDespesas) * 100 : 0
      })).sort((a, b) => b.amount - a.amount);

      return (
        <div className="space-y-6">
          {/* Resumo */}
          <div className="rounded-xl border border-slate-205 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-slate-400">Total Gasto no Período</span>
              <span className="text-lg font-extrabold text-red-650 dark:text-red-400">{formatCurrency(data.totalDespesas)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Número de Saídas</span>
              <span className="font-semibold text-slate-850 dark:text-slate-200">{expenseTransactions.length} transações</span>
            </div>
            {largestExpense && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Maior Gasto</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200 truncate max-w-[200px]" title={largestExpense.description}>
                  {largestExpense.description} ({formatCurrency(largestExpense.amount)})
                </span>
              </div>
            )}
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-650 dark:text-red-400">
                +4.5% vs. mês anterior
              </span>
            </div>
          </div>

          {/* Barras de Categoria */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gastos por Categoria</p>
            {categoriesList.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Nenhum gasto por categoria.</p>
            ) : (
              <div className="rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50/30 dark:bg-white/2 p-4 space-y-3">
                {categoriesList.map(cat => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-650 dark:text-slate-350 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </span>
                      <span className="font-semibold text-slate-805 dark:text-slate-255">
                        {formatCurrency(cat.amount)} ({cat.percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Maiores Despesas */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Últimas maiores despesas</p>
            {sortedExpenses.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">Nenhuma despesa registrada.</p>
            ) : (
              <div className="border border-slate-200/60 dark:border-white/5 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
                {sortedExpenses.slice(0, 5).map((tx: any) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-white/2">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{tx.description}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tx.category?.color || '#ef4444' }} />
                        <span className="text-[10px] text-slate-400">{tx.category?.name || 'Outros'}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-550">| {new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-red-600 dark:text-red-405 shrink-0">
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              onClose();
              onNavigate?.('transactions');
            }}
            className="w-full rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 py-3 text-xs font-bold transition text-center block"
          >
            Ver todas as despesas
          </button>
        </div>
      );
    }

    case 'fatura': {
      const storedCards = localStorage.getItem('financontrol_cards');
      let cardList: any[] = [];
      if (storedCards) {
        cardList = JSON.parse(storedCards);
      }

      let nextCardDue = null;
      if (cardList.length > 0) {
        nextCardDue = cardList.reduce((next, c) => c.dueDay < next.dueDay ? c : next, cardList[0]);
      }

      const currentDay = new Date().getDate();
      const cardsVencendo = cardList.filter(c => {
        const diff = c.dueDay - currentDay;
        return diff >= 0 && diff <= 5;
      });

      return (
        <div className="space-y-6">
          {/* Resumo Geral */}
          <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-slate-400">Total Acumulado (Todos os Cartões)</span>
              <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{formatCurrency(data.faturaPrevistaCartao)}</span>
            </div>
            {nextCardDue && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Próximo Vencimento</span>
                <span className="font-semibold text-slate-805 dark:text-slate-202">
                  {nextCardDue.name} — Dia {nextCardDue.dueDay}
                </span>
              </div>
            )}
          </div>

          {/* Banner de alerta */}
          {cardsVencendo.map(c => {
            const diff = c.dueDay - currentDay;
            return (
              <div key={c.id} className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 flex items-center gap-3 text-amber-600 dark:text-amber-450 animate-pulse">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-xs font-semibold">
                  Atenção: O cartão <strong className="font-bold">{c.name}</strong> vence em {diff === 0 ? 'hoje' : diff === 1 ? '1 dia' : `${diff} dias`} (dia {c.dueDay})!
                </p>
              </div>
            );
          })}

          {/* Por Cartão */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Meus Cartões de Crédito</p>
            {cardList.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">Nenhum cartão cadastrado.</p>
            ) : (
              <div className="space-y-4">
                {cardList.map((c: any) => {
                  const faturaInfo = calcularFaturaAtual(c.id, transactions, c.closingDay);
                  const cardFatura = faturaInfo.total;
                  const limitUsedPct = Math.min((cardFatura / c.limitAmount) * 100, 100);
                  const cTx = transactions.filter(t => t.cardId === c.id).slice(0, 3);
                  
                  return (
                    <div key={c.id} className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/30 dark:bg-white/2 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 dark:text-white">{c.name}</span>
                          <span className="text-[10px] uppercase font-extrabold opacity-60 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10">{c.brand}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-255">
                          {formatCurrency(cardFatura)}
                        </span>
                      </div>

                      {/* Limites */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-505 dark:text-slate-400">
                          <span>Limite Disponível: {formatCurrency(c.limitAmount - cardFatura)}</span>
                          <span>Total: {formatCurrency(c.limitAmount)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${limitUsedPct > 85 ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${limitUsedPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Datas */}
                      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-550 border-t border-slate-200/50 dark:border-white/5 pt-2">
                        <span>Fechamento: Dia {c.closingDay}</span>
                        <span>Vencimento: Dia {c.dueDay}</span>
                      </div>

                      {cTx.length > 0 && (
                        <div className="space-y-1.5 border-t border-slate-200/50 dark:border-white/5 pt-2">
                          <p className="text-[9px] font-bold text-slate-505 uppercase tracking-wider">Últimos Lançamentos</p>
                          <div className="divide-y divide-slate-100 dark:divide-white/5 text-[11px]">
                            {cTx.map((tx: any) => (
                              <div key={tx.id} className="flex justify-between py-1">
                                <span className="truncate text-slate-650 dark:text-slate-350">{tx.description}</span>
                                <span className="font-bold text-red-500/90">{formatCurrency(tx.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              onClose();
              onNavigate?.('cards');
            }}
            className="w-full rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 py-3 text-xs font-bold transition text-center block"
          >
            Ver todos os cartões
          </button>
        </div>
      );
    }

    case 'reserva': {
      const reserveTx = transactions.filter(t => t.category?.budgetRuleType === 'RESERVA' || t.categoria === 'Reserva de Emergência');
      
      let alertTip = "Você ainda não tem reserva de emergência. Considere separar pelo menos 10% da sua renda mensal.";
      if (data.emergencyAcumulado > 0) {
        if (data.emergencyAcumulado < data.emergencyMeta) {
          alertTip = `Você está ${data.emergencyPercentual.toFixed(1)}% do caminho para meta recomendada. Continue firme!`;
        } else {
          alertTip = "Meta atingida! Sua reserva está completa. Ótimo trabalho! 🎉";
        }
      }

      return (
        <div className="space-y-6">
          {/* Situação Atual */}
          <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-slate-400">Saldo Acumulado</span>
              <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{formatCurrency(data.emergencyAcumulado)}</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-505 dark:text-slate-400">
                <span>Meta Recomendada (6x despesas)</span>
                <span className="font-bold">{formatCurrency(data.emergencyMeta)}</span>
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
                  style={{ width: `${Math.min(data.emergencyPercentual, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-450 dark:text-slate-400">
                <span>Progresso da reserva</span>
                <span>{data.emergencyPercentual.toFixed(1)}%</span>
              </div>
            </div>

            {data.emergencyFalta > 0 && (
              <div className="flex justify-between text-xs border-t border-slate-200/50 dark:border-white/5 pt-2">
                <span className="text-slate-500 dark:text-slate-400">Faltam para a meta</span>
                <span className="font-bold text-slate-805 dark:text-slate-100">{formatCurrency(data.emergencyFalta)}</span>
              </div>
            )}
          </div>

          {/* Dica Contextual */}
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 flex gap-3 text-blue-600 dark:text-blue-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-xs font-semibold leading-relaxed">{alertTip}</p>
          </div>

          {/* Histórico de Aportes */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider">Histórico de Aportes (Mês Atual)</p>
            {reserveTx.length === 0 ? (
              <p className="text-sm text-slate-550 dark:text-slate-400 text-center py-6">Nenhum aporte identificado no período.</p>
            ) : (
              <div className="border border-slate-200/60 dark:border-white/5 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
                {reserveTx.map((tx: any) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-white/2">
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{tx.description}</p>
                      <span className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-100">
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
                <div className="bg-slate-50/50 dark:bg-white/2 p-3 flex justify-between items-center text-xs font-bold">
                  <span>Total de depósitos</span>
                  <span className="text-slate-800 dark:text-white">
                    {formatCurrency(reserveTx.reduce((sum, t) => sum + Math.abs(t.amount), 0))}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              onClose();
              onNavigate?.('goals');
            }}
            className="w-full rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 py-3 text-xs font-bold transition text-center block"
          >
            Gerenciar reserva
          </button>
        </div>
      );
    }

    case 'grafico-mes': {
      const expenseList = transactions.filter(t => t.type === 'EXPENSE');
      const monthNet = data.totalReceitas - data.totalDespesas;

      return (
        <div className="space-y-6">
          {/* Resumo do Mês */}
          <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Total de Receitas</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-450">{formatCurrency(data.totalReceitas)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Total de Despesas (Gastos)</span>
              <span className="font-bold text-red-650 dark:text-red-400">{formatCurrency(data.totalDespesas)}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-slate-200/50 dark:border-white/5 pt-3">
              <span className="font-bold text-slate-800 dark:text-white">Saldo Consolidado</span>
              <span className={`text-base font-extrabold ${monthNet >= 0 ? 'text-emerald-600 dark:text-emerald-450' : 'text-red-600 dark:text-red-450'}`}>
                {formatCurrency(monthNet)}
              </span>
            </div>
          </div>

          {/* Comparativo */}
          <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4 space-y-2 text-xs">
            <p className="font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider mb-2">Análise Comparativa</p>
            <div className="flex justify-between">
              <span className="text-slate-505 dark:text-slate-400">Em relação ao mês anterior:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-450">+R$ 480,00 (+8.2%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-505 dark:text-slate-400">Vs. média dos últimos 3 meses:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">Dentro da média (-1.5%)</span>
            </div>
          </div>

          {/* Gastos por Grande Categoria */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gastos por Regra Orçamentária</p>
            <div className="rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50/30 dark:bg-white/2 p-4 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-655 dark:text-slate-350 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Necessidades (50% Meta)
                  </span>
                  <span className="font-semibold text-slate-805 dark:text-slate-200">
                    {formatCurrency(data.necessidades.valorGasto)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-blue-500" 
                    style={{ width: `${Math.min(data.necessidades.percentualMeta, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-655 dark:text-slate-350 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    Desejos (30% Meta)
                  </span>
                  <span className="font-semibold text-slate-805 dark:text-slate-200">
                    {formatCurrency(data.desejos.valorGasto)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-yellow-500" 
                    style={{ width: `${Math.min(data.desejos.percentualMeta, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-655 dark:text-slate-350 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Reserva (20% Meta)
                  </span>
                  <span className="font-semibold text-slate-805 dark:text-slate-200">
                    {formatCurrency(data.reserva.valorGasto)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-emerald-500" 
                    style={{ width: `${Math.min(data.reserva.percentualMeta, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Despesas do Mês */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lançamentos de Saídas</p>
            {expenseList.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">Nenhuma despesa no período.</p>
            ) : (
              <div className="border border-slate-200/60 dark:border-white/5 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
                {expenseList.slice(0, 5).map((tx: any) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-white/2">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{tx.description}</p>
                      <span className="text-[10px] text-slate-450">{tx.category?.name || 'Outros'}</span>
                    </div>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              onClose();
              onNavigate?.('transactions');
            }}
            className="w-full rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 py-3 text-xs font-bold transition text-center block"
          >
            Ver extrato completo
          </button>
        </div>
      );
    }

    case 'categoria': {
      const catName = payload?.name || '';
      const catTx = transactions.filter(t => 
        (t.category?.name || t.categoria || '').toLowerCase() === catName.toLowerCase()
      );
      const sortedCatTx = [...catTx].sort((a, b) => b.amount - a.amount);
      const totalCatGasto = catTx.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const catShare = data.totalDespesas > 0 ? (totalCatGasto / data.totalDespesas) * 100 : 0;
      const avgCatTx = catTx.length > 0 ? totalCatGasto / catTx.length : 0;

      return (
        <div className="space-y-6">
          {/* Resumo da Categoria */}
          <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-slate-400">Total Gasto na Categoria</span>
              <span className="text-base font-extrabold text-red-600 dark:text-red-400">{formatCurrency(totalCatGasto)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Percentual de Gastos do Mês</span>
              <span className="font-semibold text-slate-805 dark:text-slate-200">{catShare.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Número de Transações</span>
              <span className="font-semibold text-slate-805 dark:text-slate-200">{catTx.length} lançamentos</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Ticket Médio por Transação</span>
              <span className="font-semibold text-slate-805 dark:text-slate-202">{formatCurrency(avgCatTx)}</span>
            </div>
            <div className="flex justify-between text-xs border-t border-slate-200/50 dark:border-white/5 pt-2">
              <span className="text-slate-505 dark:text-slate-400 font-medium">Comparativo vs. mês anterior</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-450">-4.2%</span>
            </div>
          </div>

          {/* Todas as Transações */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Todas as Transações da Categoria</p>
            {sortedCatTx.length === 0 ? (
              <p className="text-sm text-slate-550 dark:text-slate-400 text-center py-6">Nenhuma transação nesta categoria.</p>
            ) : (
              <div className="border border-slate-200/60 dark:border-white/5 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
                {sortedCatTx.map((tx: any) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-white/2">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-xs font-semibold text-slate-850 dark:text-slate-202 truncate">{tx.description}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-550">| {tx.paymentMethod || 'Espécie'}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 shrink-0">
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'todas-categorias': {
      const categoriesList = payload || [];
      const colors = ['#ff3d57', '#4f67ff', '#8b5cf6', '#22c55e', '#facc15', '#06b6d4'];

      return (
        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Todas as Categorias</p>
          <div className="border border-slate-200/60 dark:border-white/5 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-white/5 max-h-[60vh] overflow-y-auto">
            {categoriesList.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">Nenhuma categoria encontrada.</p>
            ) : (
              categoriesList.map((cat: any, index: number) => {
                const percent = data.totalDespesas > 0 ? (cat.valor / data.totalDespesas) * 100 : 0;
                return (
                  <div 
                    key={`${cat.nome}-${index}`} 
                    onClick={() => {
                      onChangeType?.('categoria', { name: cat.nome });
                    }}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-white/2 cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] || '#cbd5e1' }}
                        />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{cat.nome}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {formatCurrency(cat.valor)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{percent.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${Math.min(percent, 100)}%`,
                          backgroundColor: colors[index % colors.length] || '#cbd5e1'
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};
