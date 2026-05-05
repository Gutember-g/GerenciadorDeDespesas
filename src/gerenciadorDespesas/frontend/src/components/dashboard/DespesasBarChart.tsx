import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DespesasBarChartProps {
  totalReceitas: number;
  necessidades: { valorGasto: number; percentualMeta: number };
  desejos: { valorGasto: number; percentualMeta: number };
  reserva: { valorGasto: number; percentualMeta: number };
}

export const DespesasBarChart = ({ totalReceitas, necessidades, desejos, reserva }: DespesasBarChartProps) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
                label += ': ';
            }
            if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
            }
            return label;
          }
        },
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
        },
      },
      y: {
        grid: {
          color: '#334155',
        },
        ticks: {
          color: '#94a3b8',
          callback: function(value: any) {
            return new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(value);
          },
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
        label: 'Gasto Real',
        data: [necessidades.valorGasto, desejos.valorGasto, reserva.valorGasto],
        backgroundColor: [
          '#378ADD', // Necessidades
          '#EF9F27', // Desejos
          '#639922', // Reserva
        ],
        borderRadius: 4,
      },
      {
        label: 'Meta',
        data: [metaNecessidades, metaDesejos, metaReserva],
        backgroundColor: [
          'rgba(55, 138, 221, 0.35)',
          'rgba(239, 159, 39, 0.35)',
          'rgba(99, 153, 34, 0.35)',
        ],
        borderColor: [
            '#378ADD',
            '#EF9F27',
            '#639922',
        ],
        borderWidth: 1,
        borderDash: [5, 5],
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-6">Comparativo de Gastos</h3>
      <div className="h-64">
        <Bar options={options} data={data} />
      </div>
      <div className="flex justify-center space-x-8 mt-6">
          <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-slate-500 rounded-sm"></div>
              <span className="text-sm text-slate-400">Gasto real</span>
          </div>
          <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border border-dashed border-slate-500 rounded-sm bg-slate-500/20"></div>
              <span className="text-sm text-slate-400">Meta</span>
          </div>
      </div>
    </div>
  );
};
