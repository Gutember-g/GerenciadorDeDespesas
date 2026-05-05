import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { SummaryCards } from './dashboard/SummaryCards';
import { Regra502030 } from './dashboard/Regra502030';
import { DespesasBarChart } from './dashboard/DespesasBarChart';
import { TopCategorias } from './dashboard/TopCategorias';

interface DashboardProps {
    refreshTrigger?: number;
}

export const Dashboard = ({ refreshTrigger }: DashboardProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const summary = await dashboardAPI.getSummary(month, year);
      setData(summary);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os dados do dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [currentDate, refreshTrigger]);

  const nextMonth = () => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + 1);
      return next;
    });
  };

  const prevMonth = () => {
    setCurrentDate(prev => {
      const p = new Date(prev);
      p.setMonth(prev.getMonth() - 1);
      return p;
    });
  };

  const formatMonth = () => {
    return currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-slate-400 animate-pulse">Carregando suas finanças...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-xl font-bold text-slate-100 mb-2">Ops! Algo deu errado</h3>
        <p className="text-slate-400 mb-6">{error}</p>
        <button
          onClick={fetchSummary}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const allCategories = [
    ...(data.necessidades.categorias || []),
    ...(data.desejos.categorias || []),
    ...(data.reserva.categorias || [])
  ].sort((a, b) => b.valor - a.valor);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold">Dashboard</h2>
          <p className="text-slate-400 mt-1">Visão geral do seu patrimônio em {formatMonth()}.</p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-center">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 font-medium min-w-[140px] text-center capitalize">{formatMonth()}</span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="fixed top-20 right-10 z-50">
           <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      )}

      <SummaryCards
        income={data.totalReceitas}
        expense={data.totalDespesas}
        balance={data.saldoTotal}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Regra502030
          necessidades={data.necessidades}
          desejos={data.desejos}
          reserva={data.reserva}
        />
        <DespesasBarChart
            totalReceitas={data.totalReceitas}
            necessidades={data.necessidades}
            desejos={data.desejos}
            reserva={data.reserva}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
             <TopCategorias categorias={allCategories} />
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-6 flex flex-col justify-center">
             <h4 className="text-lg font-bold text-emerald-400 mb-2">Saúde Financeira</h4>
             <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Com base nos seus gastos de {formatMonth()}, você destinou <span className="font-bold text-emerald-400">{data.reserva.percentualReal.toFixed(1)}%</span> para sua reserva.
             </p>
             <div className="w-full bg-slate-800/50 rounded-full h-1.5 mb-2">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(data.reserva.percentualReal * 5, 100)}%` }}></div>
             </div>
             <span className="text-[10px] text-slate-500 uppercase tracking-wider">Progresso da meta de investimentos</span>
          </div>
      </div>
    </div>
  );
};
