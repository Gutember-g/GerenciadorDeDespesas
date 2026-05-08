import { useEffect, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { useMes } from '../contexts/MesContext';
import { SummaryCards } from './dashboard/SummaryCards';
import { Regra502030 } from './dashboard/Regra502030';
import { DespesasBarChart } from './dashboard/DespesasBarChart';
import { TopCategorias } from './dashboard/TopCategorias';

interface DashboardProps {
  refreshTrigger?: number;
}

export const Dashboard = ({ refreshTrigger }: DashboardProps) => {
  const { mesAtivo, nextMonth, prevMonth } = useMes();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await dashboardAPI.getSummary(mesAtivo.month, mesAtivo.year);
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
  }, [mesAtivo, refreshTrigger]);

  const formatMonth = () => {
    return new Date(mesAtivo.year, mesAtivo.month - 1).toLocaleString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading && !data) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
        <p className="text-slate-400">Carregando suas finanças...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
        <h3 className="mb-2 text-xl font-bold text-slate-100">Ops! Algo deu errado</h3>
        <p className="mb-6 text-slate-400">{error}</p>
        <button
          onClick={fetchSummary}
          className="rounded-xl bg-white/10 px-4 py-2 text-slate-200 transition-colors hover:bg-white/15"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const allCategories = [
    ...(data.necessidades.categorias || []),
    ...(data.desejos.categorias || []),
    ...(data.reserva.categorias || []),
  ].sort((a, b) => b.valor - a.valor);

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Olá, João!</h2>
          <p className="mt-2 text-sm text-slate-400">
            Aqui está o resumo das suas finanças em <span className="capitalize">{formatMonth()}</span>.
          </p>
        </div>

        <div className="flex w-fit items-center rounded-xl border border-white/10 bg-white/5 p-1">
          <button
            onClick={prevMonth}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-[150px] px-4 text-center text-sm font-semibold capitalize">
            {formatMonth()}
          </span>
          <button
            onClick={nextMonth}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {loading && (
        <div className="fixed right-8 top-24 z-50 rounded-full border border-white/10 bg-[#0d1828] p-3 shadow-xl">
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
        </div>
      )}

      <SummaryCards income={data.totalReceitas} expense={data.totalDespesas} balance={data.saldoTotal} />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
        <DespesasBarChart
          totalReceitas={data.totalReceitas}
          necessidades={data.necessidades}
          desejos={data.desejos}
          reserva={data.reserva}
        />
        <TopCategorias categorias={allCategories} total={data.totalDespesas} />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
        <Regra502030 necessidades={data.necessidades} desejos={data.desejos} reserva={data.reserva} />
        <div className="rounded-xl border border-white/10 bg-[#0d1828]/80 p-5 shadow-2xl shadow-black/20">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Saúde financeira</h3>
              <p className="mt-1 text-sm text-slate-400">Reserva comparada à meta do mês</p>
            </div>
            <span className="rounded-lg bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              {data.reserva.percentualReal.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm leading-6 text-slate-300">
            Em {formatMonth()}, você destinou{' '}
            <span className="font-semibold text-emerald-300">{data.reserva.percentualReal.toFixed(1)}%</span>{' '}
            para reserva. O painel acompanha esse ritmo contra a regra 50-30-20.
          </p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              style={{ width: `${Math.min(data.reserva.percentualReal * 5, 100)}%` }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
