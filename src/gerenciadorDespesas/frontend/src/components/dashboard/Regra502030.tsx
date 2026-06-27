import { Car, Plane, ShieldCheck } from 'lucide-react';
import { useAuthSettings } from '../../contexts/AuthSettingsContext.tsx';

interface RuleData {
  valorGasto: number;
  percentualReal: number;
  percentualMeta: number;
}

interface Regra502030Props {
  necessidades: RuleData;
  desejos: RuleData;
  reserva: RuleData;
}

export const Regra502030 = ({ necessidades, desejos, reserva }: Regra502030Props) => {
  const { formatCurrency } = useAuthSettings();
  const goals = [
    {
      label: 'Necessidades',
      description: 'Moradia, alimentação e transporte',
      data: necessidades,
      icon: ShieldCheck,
      color: '#22c55e',
    },
    {
      label: 'Desejos',
      description: 'Lazer, compras e experiências',
      data: desejos,
      icon: Plane,
      color: '#4f67ff',
    },
    {
      label: 'Reserva',
      description: 'Emergência e investimentos',
      data: reserva,
      icon: Car,
      color: '#facc15',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/80 p-5 shadow-sm dark:shadow-2xl dark:shadow-black/20">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Metas financeiras</h3>
        <span className="rounded-lg bg-slate-100 dark:bg-white/5 px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">50-30-20</span>
      </div>

      <div className="space-y-5">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const progress = goal.data.percentualMeta
            ? Math.min((goal.data.percentualReal / goal.data.percentualMeta) * 100, 100)
            : 0;

          const isNeeds = goal.label === 'Necessidades';
          const isWants = goal.label === 'Desejos';
          const isSavings = goal.label === 'Reserva';
          
          let alertMsg = '';
          let isAlert = false;
          
          if (isNeeds && goal.data.percentualReal > 50) {
            alertMsg = 'Acima do limite (50%)';
            isAlert = true;
          } else if (isWants && goal.data.percentualReal > 30) {
            alertMsg = 'Acima do limite (30%)';
            isAlert = true;
          } else if (isSavings && goal.data.percentualReal < 20 && goal.data.percentualReal > 0) {
            alertMsg = 'Abaixo da meta (20%)';
            isAlert = true;
          }

          const barColor = isAlert && !isSavings ? '#ef4444' : goal.color;

          return (
            <div 
              key={goal.label} 
              className={`border-b border-slate-100 dark:border-white/10 pb-5 last:border-0 last:pb-0 p-3 rounded-xl transition-all duration-300 ${isAlert ? 'bg-red-500/5 border border-red-500/20 shadow-lg shadow-red-500/5' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full"
                  style={{ 
                    backgroundColor: isAlert && !isSavings ? '#ef444418' : `${goal.color}18`, 
                    color: isAlert && !isSavings ? '#ef4444' : goal.color 
                  }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {goal.label}
                        {isAlert && (
                          <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${isSavings ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                            {alertMsg}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{goal.description}</p>
                    </div>
                    <span className={`text-sm font-semibold ${isAlert && !isSavings ? 'text-red-500 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {goal.data.percentualReal.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: barColor,
                        boxShadow: isAlert && !isSavings ? '0 0 10px #ef444488' : `0 0 10px ${goal.color}55`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {formatCurrency(goal.data.valorGasto)} de uma meta de {goal.data.percentualMeta}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
