import { Layers, CalendarDays, Wallet } from 'lucide-react';

interface InstallmentPurchase {
  name: string;
  installmentAmount: number;
  currentInstallment: number;
  totalInstallments: number;
  remainingBalance: number;
  projection: number[];
}

interface ComprasParceladasProps {
  compras: InstallmentPurchase[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const ComprasParceladas = ({ compras }: ComprasParceladasProps) => {
  // Calculate projections total
  const projectionTotals = [0, 0, 0];
  compras.forEach((c) => {
    if (c.projection && c.projection.length >= 3) {
      projectionTotals[0] += c.projection[0];
      projectionTotals[1] += c.projection[1];
      projectionTotals[2] += c.projection[2];
    }
  });

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1828]/80 p-5 shadow-2xl shadow-black/20 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-400" />
          Compras Parceladas Ativas
        </h3>
        <span className="rounded bg-indigo-500/10 px-2.5 py-0.5 text-xs text-indigo-300 font-semibold">
          {compras.length} Ativas
        </span>
      </div>

      {compras.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          Nenhuma compra parcelada ativa para este mês.
        </div>
      ) : (
        <div className="space-y-6">
          {/* List of installment purchases */}
          <div className="max-h-60 overflow-y-auto divide-y divide-white/5 space-y-4 pr-1">
            {compras.map((compra, index) => (
              <div key={index} className="flex items-center justify-between pt-4 first:pt-0">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">{compra.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300 font-semibold">
                      Parcela {compra.currentInstallment}/{compra.totalInstallments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Wallet className="h-3 w-3" />
                      Devedor: {formatCurrency(compra.remainingBalance)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-slate-100">{formatCurrency(compra.installmentAmount)}</p>
                  <p className="text-[10px] text-slate-500">Valor mensal</p>
                </div>
              </div>
            ))}
          </div>

          {/* Projections Card */}
          <div className="border-t border-white/5 pt-4 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-indigo-400" />
              Projeção de impacto nas próximas faturas
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {['Fatura M+1', 'Fatura M+2', 'Fatura M+3'].map((label, i) => (
                <div key={i} className="rounded-lg bg-white/5 p-2.5 text-center">
                  <p className="text-[10px] text-slate-400 font-medium">{label}</p>
                  <p className="text-xs font-bold text-slate-200 mt-1">{formatCurrency(projectionTotals[i])}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
