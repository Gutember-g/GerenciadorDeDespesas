import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryItem {
  nome: string;
  valor: number;
}

interface TopCategoriasProps {
  categorias: CategoryItem[];
  total?: number;
  theme?: 'light' | 'dark';
  onCategoryClick?: (categoryName: string) => void;
  onVerTodasClick?: () => void;
}

const colors = ['#ff3d57', '#4f67ff', '#8b5cf6', '#22c55e', '#facc15', '#06b6d4'];

export const TopCategorias = ({ 
  categorias, 
  total = 0, 
  theme = 'dark', 
  onCategoryClick,
  onVerTodasClick
}: TopCategoriasProps) => {
  const top6 = categorias.slice(0, 6);
  const totalCategorias = total || top6.reduce((sum, cat) => sum + cat.valor, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const doughnutData = {
    labels: top6.map(c => c.nome),
    datasets: [
      {
        data: top6.map(c => c.valor),
        backgroundColor: colors.slice(0, top6.length),
        borderWidth: theme === 'dark' ? 2 : 1,
        borderColor: theme === 'dark' ? '#0d1828' : '#ffffff',
        hoverOffset: 6,
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const val = context.raw || 0;
            return ' ' + formatCurrency(val);
          }
        },
        backgroundColor: theme === 'dark' ? '#0d1828' : '#ffffff',
        titleColor: theme === 'dark' ? '#f8fafc' : '#0f172a',
        bodyColor: theme === 'dark' ? '#cbd5e1' : '#475569',
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
        borderWidth: 1,
        padding: 8,
        cornerRadius: 6,
      }
    },
    onClick: (_event: any, elements: any) => {
      if (elements && elements.length > 0) {
        const index = elements[0].index;
        const clickedCat = top6[index];
        if (clickedCat) {
          onCategoryClick?.(clickedCat.nome);
        }
      }
    }
  };

  return (
    <div className="h-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/80 p-5 shadow-sm dark:shadow-2xl dark:shadow-black/20 transition-all hover:scale-[1.005] hover:border-blue-500 dark:hover:border-blue-500">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Gastos por categoria</h3>
        <button 
          onClick={onVerTodasClick}
          className="text-xs font-medium text-slate-500 dark:text-slate-400 transition hover:text-slate-900 dark:hover:text-white"
        >
          Ver todas
        </button>
      </div>

      {top6.length > 0 ? (
        <div className="grid items-center gap-6 sm:grid-cols-[170px_1fr]">
          <div className="relative mx-auto h-40 w-40">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>

          <div className="space-y-3">
            {top6.map((cat, index) => (
              <div 
                key={`${cat.nome}-${index}`} 
                onClick={() => onCategoryClick?.(cat.nome)}
                className="flex items-center justify-between gap-3 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 p-1 rounded-md transition"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="truncate text-slate-600 dark:text-slate-300">{cat.nome}</span>
                </div>
                <span className="shrink-0 font-medium text-slate-800 dark:text-slate-200">{formatCurrency(cat.valor)}</span>
              </div>
            ))}
            <div className="border-t border-slate-100 dark:border-white/10 pt-4 text-right text-sm">
              <span className="text-slate-505 dark:text-slate-400">Total: </span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totalCategorias)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid h-56 place-items-center text-center text-sm text-slate-500">
          Nenhuma despesa este mês
        </div>
      )}
    </div>
  );
};
