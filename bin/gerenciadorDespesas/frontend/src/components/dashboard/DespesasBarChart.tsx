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
  theme?: 'light' | 'dark';
  currentMonthName: string;
  prevMonthName: string;
  currentData: {
    necessidades: number;
    desejos: number;
    reserva: number;
  };
  prevData: {
    necessidades: number;
    desejos: number;
    reserva: number;
  };
  onChartClick?: () => void;
}

export const DespesasBarChart = ({ currentMonthName, prevMonthName, currentData, prevData, theme = 'dark', onChartClick }: DespesasBarChartProps) => {
  const isDark = theme === 'dark';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_event: any, elements: any) => {
      if (elements && elements.length > 0) {
        onChartClick?.();
      }
    },
    onHover: (_event: any, chartElement: any) => {
      if (_event && _event.native && _event.native.target) {
        _event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: isDark ? '#94a3b8' : '#64748b',
          boxWidth: 12,
          padding: 10,
        }
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

  const data = {
    labels,
    datasets: [
      {
        label: currentMonthName,
        data: [currentData.necessidades, currentData.desejos, currentData.reserva],
        backgroundColor: '#3b82f6',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: prevMonthName,
        data: [prevData.necessidades, prevData.desejos, prevData.reserva],
        backgroundColor: isDark ? '#475569' : '#cbd5e1',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div 
      onClick={() => onChartClick?.()}
      className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/80 p-5 shadow-sm dark:shadow-2xl dark:shadow-black/20 cursor-pointer transition-all hover:scale-[1.005] hover:border-blue-500 dark:hover:border-blue-500"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Comparativo de gastos</h3>
        <span className="rounded-lg bg-slate-100 dark:bg-white/5 px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          Mês atual x Mês anterior
        </span>
      </div>
      <div className="h-72">
        <Bar options={options} data={data} />
      </div>
    </div>
  );
};
