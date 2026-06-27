import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

interface DespesasBarChartProps {
  totalReceitas: number;
  necessidades: { valorGasto: number; percentualMeta: number };
  desejos: { valorGasto: number; percentualMeta: number };
  reserva: { valorGasto: number; percentualMeta: number };
  theme?: 'light' | 'dark';
}

export const DespesasBarChart = ({ totalReceitas, necessidades, desejos, reserva, theme = 'dark' }: DespesasBarChartProps) => {
  const isDark = theme === 'dark';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(context.parsed.y);
            }
            return label;
          },
        },
        backgroundColor: isDark ? '#0d1828' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#475569',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(148, 163, 184, 0.12)',
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          callback: function (value: any) {
            return new Intl.NumberFormat('pt-BR', {
              notation: 'compact',
              compactDisplay: 'short',
            }).format(value);
          },
        },
        border: {
          display: false,
        },
      },
    },
  };

  const labels = ['Necessidades', 'Desejos', 'Reserva'];
  const metaNecessidades = (necessidades.percentualMeta / 100) * totalReceitas;
  const metaDesejos = (desejos.percentualMeta / 100) * totalReceitas;
  const metaReserva = (reserva.percentualMeta / 100) * totalReceitas;

  const data = {
    labels,
    datasets: [
      {
        label: 'Gasto real',
        data: [necessidades.valorGasto, desejos.valorGasto, reserva.valorGasto],
        backgroundColor: ['#378ADD', '#EF9F27', '#22C55E'],
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Meta',
        data: [metaNecessidades, metaDesejos, metaReserva],
        backgroundColor: ['rgba(55, 138, 221, 0.22)', 'rgba(239, 159, 39, 0.22)', 'rgba(34, 197, 94, 0.22)'],
        borderColor: ['#378ADD', '#EF9F27', '#22C55E'],
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/80 p-5 shadow-sm dark:shadow-2xl dark:shadow-black/20">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Comparativo de gastos</h3>
        <span className="rounded-lg bg-slate-100 dark:bg-white/5 px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          Mês atual
        </span>
      </div>
      <div className="h-72">
        <Bar options={options} data={data} />
      </div>
      <div className="mt-5 flex justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-blue-500" />
          <span>Gasto real</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-dashed border-blue-400 dark:border-blue-300 bg-blue-500/20" />
          <span>Meta</span>
        </div>
      </div>
    </div>
  );
};
