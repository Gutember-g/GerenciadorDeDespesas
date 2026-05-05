import React, { useEffect, useState } from 'react';
import { transactionAPI } from '../services/api';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

export function TransactionList({ userId }: { userId: number }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await transactionAPI.getTransactionsByUser(userId);
        // Ordenar por data decrescente (mais nova no topo)
        data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(data);
      } catch (error) {
        console.error("Erro ao buscar transacoes", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm overflow-x-auto">
      <h3 className="text-xl font-semibold mb-6">Extrato Completo</h3>
      
      {transactions.length === 0 ? (
        <p className="text-slate-400 text-center py-10">Você ainda não tem transações geradas.</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-sm">
              <th className="pb-3 font-medium">Data</th>
              <th className="pb-3 font-medium">Descrição</th>
              <th className="pb-3 font-medium">Categoria</th>
              <th className="pb-3 font-medium text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx: any) => {
              const isIncome = tx.type === 'INCOME';
              const dateObj = new Date(tx.date);
              // Avoid timezone glitches
              const dateString = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR');
              
              const isFuture = new Date() < dateObj;

              return (
                <tr key={tx.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 text-slate-300 text-sm">
                    {dateString}
                    {isFuture && <span className="ml-2 inline-flex items-center text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3 mr-1" /> Futura</span>}
                  </td>
                  <td className="py-4 text-slate-200">
                    {tx.description}
                  </td>
                  <td className="py-4 text-slate-400 text-sm">
                    {tx.category ? (
                       <span 
                         className="px-2 py-1 rounded-md" 
                         style={{ backgroundColor: `${tx.category.color}20`, color: tx.category.color }}
                       >
                         {tx.category.name}
                       </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className={`py-4 text-right font-medium flex items-center justify-end space-x-1 ${isIncome ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {isIncome ? <TrendingUp className="w-4 h-4 mr-1 text-emerald-400" /> : <TrendingDown className="w-4 h-4 mr-1 text-slate-500" />}
                    <span>R$ {tx.amount.toFixed(2)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
