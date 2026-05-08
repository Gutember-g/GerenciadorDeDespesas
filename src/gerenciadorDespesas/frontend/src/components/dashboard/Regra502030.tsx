import { Car, Plane, ShieldCheck } from 'lucide-react';

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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const Regra502030 = ({ necessidades, desejos, reserva }: Regra502030Props) => {
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
    <div className="rounded-xl border border-white/10 bg-[#0d1828]/80 p-5 shadow-2xl shadow-black/20">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Metas financeiras</h3>
        <span className="rounded-lg bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">50-30-20</span>
      </div>

      <div className="space-y-5">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const progress = goal.data.percentualMeta
            ? Math.min((goal.data.percentualReal / goal.data.percentualMeta) * 100, 100)
            : 0;

          return (
            <div key={goal.label} className="border-b border-white/10 pb-5 last:border-0 last:pb-0">
              <div className="flex items-center gap-4">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full"
                  style={{ backgroundColor: `${goal.color}18`, color: goal.color }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-100">{goal.label}</p>
                      <p className="text-xs text-slate-500">{goal.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-200">{goal.data.percentualReal.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: goal.color,
                        boxShadow: `0 0 20px ${goal.color}55`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
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
