import { CreditCard, Wallet, Percent, Tags } from 'lucide-react';

interface MeiosPagamentoProps {
  totalCredito: number;
  totalDebitoPixEspecie: number;
  totalParcelados: number;
  categoriaMaisPesada: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const MeiosPagamento = ({
  totalCredito,
  totalDebitoPixEspecie,
  totalParcelados,
  categoriaMaisPesada
}: MeiosPagamentoProps) => {
  const total = totalCredito + totalDebitoPixEspecie;
  const pctCredito = total > 0 ? (totalCredito / total) * 100 : 0;
  const pctDebitoPix = total > 0 ? (totalDebitoPixEspecie / total) * 100 : 0;
  const pctParcelados = totalCredito > 0 ? (totalParcelados / totalCredito) * 100 : 0;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/80 p-5 shadow-sm dark:shadow-2xl dark:shadow-black/20 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          Meios de Pagamento
        </h3>
        <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">Mensal</span>
      </div>

      <div className="space-y-4">
        {/* Progress Share bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Crédito ({pctCredito.toFixed(0)}%)</span>
            <span>Débito, Pix & Espécie ({pctDebitoPix.toFixed(0)}%)</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex">
            {pctCredito > 0 && <div className="h-full bg-blue-500" style={{ width: `${pctCredito}%` }} />}
            {pctDebitoPix > 0 && <div className="h-full bg-emerald-500" style={{ width: `${pctDebitoPix}%` }} />}
          </div>
        </div>

        {/* Detailed indicators */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-transparent p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Cartão de Crédito</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(totalCredito)}</p>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-transparent p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Pix / Débito / Espécie</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(totalDebitoPixEspecie)}</p>
            </div>
          </div>
        </div>

        {/* Share of installments */}
        <div className="border-t border-slate-100 dark:border-white/5 pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Percent className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              Parcelados na fatura
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatCurrency(totalParcelados)} ({pctParcelados.toFixed(0)}% da fatura)
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pctParcelados}%` }} />
          </div>
        </div>

        {/* Top Card Category */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4 text-xs">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Tags className="h-4 w-4 text-rose-500 dark:text-rose-400" />
            Maior gasto no cartão
          </span>
          <span className="font-bold text-rose-600 dark:text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded">
            {categoriaMaisPesada}
          </span>
        </div>
      </div>
    </div>
  );
};
