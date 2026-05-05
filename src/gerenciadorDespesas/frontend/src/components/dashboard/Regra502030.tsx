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
  const renderProgressBar = (label: string, data: RuleData, colorClass: string) => {
    const { percentualReal, percentualMeta } = data;

    // Determine bar color based on deviation
    let barColor = colorClass;
    if (percentualReal > percentualMeta * 1.2) {
        barColor = 'bg-red-500';
    } else if (percentualReal > percentualMeta) {
        barColor = 'bg-amber-500';
    }

    return (
      <div className="mb-6 last:mb-0">
        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-sm font-medium text-slate-300">{label}</span>
            <span className="ml-2 text-xs text-slate-500">Meta: {percentualMeta}%</span>
          </div>
          <span className={`text-sm font-bold ${percentualReal > percentualMeta ? 'text-red-400' : 'text-emerald-400'}`}>
            {percentualReal.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(percentualReal, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm h-full">
      <h3 className="text-xl font-semibold mb-6 flex justify-between items-center">
        Regra 50-30-20
        <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded-md">Metas vs Real</span>
      </h3>

      {renderProgressBar('Necessidades', necessidades, 'bg-blue-500')}
      {renderProgressBar('Desejos', desejos, 'bg-amber-500')}
      {renderProgressBar('Reserva', reserva, 'bg-emerald-500')}

      <div className="mt-8 p-4 bg-slate-800/40 rounded-lg border border-slate-700/50">
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="font-bold text-slate-300">Dica:</span> Mantenha suas necessidades abaixo de 50% para garantir saúde financeira a longo prazo.
        </p>
      </div>
    </div>
  );
};
