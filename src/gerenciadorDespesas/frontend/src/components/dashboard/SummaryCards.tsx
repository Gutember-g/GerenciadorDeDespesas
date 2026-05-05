import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface SummaryCardsProps {
  income: number;
  expense: number;
  balance: number;
}

export const SummaryCards = ({ income, expense, balance }: SummaryCardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-400 font-medium">Receitas</h3>
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        </div>
        <p className="text-3xl font-bold text-emerald-400">{formatCurrency(income)}</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-400 font-medium">Despesas</h3>
          <TrendingDown className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-3xl font-bold text-red-400">{formatCurrency(expense)}</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-400 font-medium">Saldo</h3>
          <Wallet className="w-5 h-5 text-blue-400" />
        </div>
        <p className={`text-3xl font-bold ${balance >= 0 ? 'text-slate-100' : 'text-red-400'}`}>
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  );
};
