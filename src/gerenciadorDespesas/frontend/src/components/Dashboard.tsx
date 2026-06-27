import { useEffect, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { dashboardAPI, transactionAPI } from '../services/api';
import { useMes } from '../contexts/MesContext';
import { SummaryCards } from './dashboard/SummaryCards';
import { Regra502030 } from './dashboard/Regra502030';
import { DespesasBarChart } from './dashboard/DespesasBarChart';
import { TopCategorias } from './dashboard/TopCategorias';
import { MeiosPagamento } from './dashboard/MeiosPagamento';
import { ComprasParceladas } from './dashboard/ComprasParceladas';
import { EmergencyFund } from './dashboard/EmergencyFund';
import { DashboardModal } from './DashboardModal';
import { DashboardModalContent } from './dashboard/DashboardModalContent';

interface DashboardProps {
  refreshTrigger?: number;
  userName?: string;
  theme?: 'light' | 'dark';
  onNavigate?: (tab: 'dashboard' | 'transactions' | 'reports' | 'categories' | 'goals' | 'cards' | 'settings') => void;
}

export const Dashboard = ({ refreshTrigger, userName, theme = 'dark', onNavigate }: DashboardProps) => {
  const { mesAtivo, nextMonth, prevMonth } = useMes();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard Detail Modal States
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'renda' | 'gastos' | 'fatura' | 'reserva' | 'grafico-mes' | 'categoria' | null;
    payload: any;
  }>({
    isOpen: false,
    type: null,
    payload: null
  });
  const [modalTransactions, setModalTransactions] = useState<any[]>([]);
  const [loadingModalData, setLoadingModalData] = useState(false);

  const fetchModalTransactions = async (monthNum: number, yearNum: number) => {
    try {
      setLoadingModalData(true);
      const list = await transactionAPI.getTransactions(monthNum, yearNum);
      setModalTransactions(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingModalData(false);
    }
  };

  useEffect(() => {
    if (modalState.isOpen) {
      fetchModalTransactions(mesAtivo.month, mesAtivo.year);
    } else {
      setModalTransactions([]);
    }
  }, [modalState.isOpen, mesAtivo]);

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
        <p className="text-slate-500 dark:text-slate-400">Carregando suas finanças...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 text-center shadow-sm">
        <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
        <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">Ops! Algo deu errado</h3>
        <p className="mb-6 text-slate-500 dark:text-slate-400">{error}</p>
        <button
          onClick={fetchSummary}
          className="rounded-xl bg-slate-100 dark:bg-white/10 px-4 py-2 text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-200 dark:hover:bg-white/15"
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
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-slate-900 dark:text-white">Olá, {userName || 'Usuário'}!</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Aqui está o resumo das suas finanças em <span className="capitalize">{formatMonth()}</span>.
          </p>
        </div>

        <div className="flex w-fit items-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-1 shadow-sm">
          <button
            onClick={prevMonth}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-[150px] px-4 text-center text-sm font-semibold capitalize text-slate-800 dark:text-slate-200">
            {formatMonth()}
          </span>
          <button
            onClick={nextMonth}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {loading && (
        <div className="fixed right-8 top-24 z-50 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828] p-3 shadow-xl">
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
        </div>
      )}

      <SummaryCards
        income={data.totalReceitas}
        expense={data.totalDespesas}
        faturaPrevistaCartao={data.faturaPrevistaCartao}
        saldoReservaEmergencia={data.saldoReservaEmergencia}
        onCardClick={(type) => setModalState({ isOpen: true, type, payload: null })}
      />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
        <DespesasBarChart
          theme={theme}
          totalReceitas={data.totalReceitas}
          necessidades={data.necessidades}
          desejos={data.desejos}
          reserva={data.reserva}
          onChartClick={() => setModalState({ isOpen: true, type: 'grafico-mes', payload: null })}
        />
        <TopCategorias 
          theme={theme} 
          categorias={allCategories} 
          total={data.totalDespesas} 
          onCategoryClick={(catName) => setModalState({ isOpen: true, type: 'categoria', payload: { name: catName } })}
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
        <MeiosPagamento
          totalCredito={data.totalCreditoMes}
          totalDebitoPixEspecie={data.totalDebitoPixEspecieMes}
          totalParcelados={data.totalParceladosFatura}
          categoriaMaisPesada={data.categoriaMaisPesadaCartao}
        />
        <ComprasParceladas compras={data.comprasParceladas || []} />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
        <Regra502030 necessidades={data.necessidades} desejos={data.desejos} reserva={data.reserva} />
        <EmergencyFund
          meta={data.emergencyMeta}
          acumulado={data.emergencyAcumulado}
          falta={data.emergencyFalta}
          percentual={data.emergencyPercentual}
          aporteMensal={data.emergencyAporteMensal}
          prazoEstimado={data.emergencyPrazoEstimado}
          onClick={() => setModalState({ isOpen: true, type: 'reserva', payload: null })}
        />
      </section>

      {/* DASHBOARD DETAILS MODAL */}
      <DashboardModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, type: null, payload: null })}
        title={
          modalState.type === 'renda' ? `Renda líquida — ${formatMonth()}` :
          modalState.type === 'gastos' ? `Gastos totais — ${formatMonth()}` :
          modalState.type === 'fatura' ? `Fatura prevista — ${formatMonth()}` :
          modalState.type === 'reserva' ? 'Reserva de emergência' :
          modalState.type === 'grafico-mes' ? `Gastos em ${formatMonth()}` :
          modalState.type === 'categoria' ? `${modalState.payload?.name || 'Categoria'} — ${formatMonth()}` :
          'Detalhes'
        }
      >
        {loadingModalData ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <DashboardModalContent
            type={modalState.type}
            payload={modalState.payload}
            dashboardData={data}
            transactions={modalTransactions}
            onNavigate={onNavigate}
            onClose={() => setModalState({ isOpen: false, type: null, payload: null })}
          />
        )}
      </DashboardModal>
    </div>
  );
};
