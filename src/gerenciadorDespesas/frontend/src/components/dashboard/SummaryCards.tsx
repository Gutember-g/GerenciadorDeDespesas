import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from 'lucide-react';
import { useAuthSettings } from '../../contexts/AuthSettingsContext.tsx';

interface SummaryCardsProps {
  income: number;
  expense: number;
  faturaPrevistaCartao?: number;
  saldoReservaEmergencia?: number;
}

const Sparkline = ({ color }: { color: string }) => (
  <div className="mt-5 flex h-10 items-end gap-1 opacity-80">
    {[32, 48, 44, 62, 70, 54, 42, 50, 76, 84, 72, 68, 82, 96].map((height, index) => (
      <span
        key={index}
        className="w-full rounded-t-full"
        style={{
          height: `${height}%`,
          background: `linear-gradient(180deg, ${color}, transparent)`,
        }}
      />
    ))}
  </div>
);

export const SummaryCards = ({ income, expense, faturaPrevistaCartao = 0, saldoReservaEmergencia = 0 }: SummaryCardsProps) => {
  const { formatCurrency } = useAuthSettings();
  const cards = [
    {
      label: 'Renda líquida do mês',
      value: income,
      icon: Wallet,
      accent: '#10b981',
      tone: 'from-emerald-500/18 to-cyan-500/5',
      note: 'Total de receitas no período',
      valueClass: 'text-slate-900 dark:text-white',
    },
    {
      label: 'Gastos totais',
      value: expense,
      icon: ArrowUpRight,
      accent: '#ef4444',
      tone: 'from-red-500/18 to-rose-500/5',
      note: 'Total de despesas no período',
      valueClass: 'text-slate-900 dark:text-white',
    },
    {
      label: 'Fatura prevista do cartão',
      value: faturaPrevistaCartao,
      icon: ArrowDownRight,
      accent: '#3b82f6',
      tone: 'from-blue-500/18 to-indigo-500/5',
      note: 'Gastos acumulados no crédito',
      valueClass: 'text-slate-900 dark:text-white',
    },
    {
      label: 'Reserva de emergência',
      value: saldoReservaEmergencia,
      icon: PiggyBank,
      accent: '#d97706',
      tone: 'from-yellow-500/18 to-amber-500/5',
      note: 'Saldo total acumulado',
      valueClass: 'text-slate-900 dark:text-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.label}
            className={`relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/50 bg-gradient-to-br ${card.tone} p-5 shadow-2xl shadow-slate-100/50 dark:shadow-black/20`}
          >
            <div
              className="absolute -right-8 -top-10 h-28 w-28 rounded-full blur-3xl"
              style={{ backgroundColor: `${card.accent}30` }}
            />
            <div className="relative flex items-center gap-4">
              <div
                className="grid h-12 w-12 place-items-center rounded-full shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${card.accent}, ${card.accent}99)`,
                  boxShadow: `0 14px 30px ${card.accent}25`,
                }}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-300">{card.label}</p>
                <p className={`mt-1 text-2xl font-bold tracking-tight ${card.valueClass}`}>
                  {formatCurrency(card.value)}
                </p>
              </div>
            </div>
            <p className="relative mt-4 text-xs text-slate-500 dark:text-slate-400">
              <span style={{ color: card.accent }}>{card.note.split(' ')[0]}</span>{' '}
              {card.note.split(' ').slice(1).join(' ')}
            </p>
            <Sparkline color={card.accent} />
          </article>
        );
      })}
    </div>
  );
};
