import { PiggyBank, Target, Hourglass } from 'lucide-react';
import { useAuthSettings } from '../../contexts/AuthSettingsContext.tsx';

interface EmergencyFundProps {
  meta: number;
  acumulado: number;
  falta: number;
  percentual: number;
  aporteMensal: number;
  prazoEstimado: number;
  onClick?: () => void;
}

export const EmergencyFund = ({
  meta,
  acumulado,
  falta,
  percentual,
  aporteMensal,
  prazoEstimado,
  onClick
}: EmergencyFundProps) => {
  const { formatCurrency } = useAuthSettings();
  return (
    <div 
      onClick={onClick}
      className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/80 p-5 shadow-sm dark:shadow-2xl dark:shadow-black/20 space-y-6 cursor-pointer transition-all hover:scale-[1.005] hover:border-blue-500 dark:hover:border-blue-500"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
          Reserva de Emergência
        </h3>
        <span className="rounded bg-yellow-400/10 px-2.5 py-0.5 text-xs text-yellow-600 dark:text-yellow-300 font-semibold flex items-center gap-1">
          <Target className="h-3.5 w-3.5" /> Meta
        </span>
      </div>

      <div className="space-y-5">
        {/* Progress Bar */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Progresso geral</span>
            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-300">{percentual.toFixed(1)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
              style={{
                width: `${Math.min(percentual, 100)}%`,
                boxShadow: `0 0 15px rgba(234, 179, 8, 0.4)`
              }}
            />
          </div>
        </div>

        {/* Dynamic Meta Calculations */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-transparent p-3">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Meta Total (6x Essencial)</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1 block">{formatCurrency(meta)}</span>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-transparent p-3">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Acumulado</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{formatCurrency(acumulado)}</span>
          </div>
        </div>

        {/* Details and timeframe */}
        <div className="border-t border-slate-100 dark:border-white/5 pt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-550 dark:text-slate-400">Falta para atingir</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(falta)}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-550 dark:text-slate-400">Aporte mensal médio</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(aporteMensal)}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-white/5 pt-3">
            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Hourglass className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              Prazo estimado
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-300">
              {prazoEstimado > 0 ? `${prazoEstimado.toFixed(1)} meses` : 'Meta Atingida! 🎉'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
