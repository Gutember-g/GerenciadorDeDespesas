import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  income: number;
  expense: number;
  balance: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

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

export const SummaryCards = ({ income, expense, balance }: SummaryCardsProps) => {
  const savings = Math.max(balance, 0);

  const cards = [
    {
      label: 'Saldo atual',
      value: balance,
      icon: Wallet,
      accent: '#19d49b',
      tone: 'from-emerald-500/20 to-cyan-500/5',
      note: '+ 12,5% em relação ao mês anterior',
      valueClass: balance >= 0 ? 'text-white' : 'text-red-300',
    },
    {
      label: 'Receitas',
      value: income,
      icon: ArrowDownRight,
      accent: '#22c55e',
      tone: 'from-emerald-500/18 to-green-500/5',
      note: '+ 8,2% em relação ao mês anterior',
      valueClass: 'text-white',
    },
    {
      label: 'Gastos',
      value: expense,
      icon: ArrowUpRight,
      accent: '#ff3d57',
      tone: 'from-red-500/18 to-rose-500/5',
      note: '+ 15,7% em relação ao mês anterior',
      valueClass: 'text-white',
    },
    {
      label: 'Economia',
      value: savings,
      icon: PiggyBank,
      accent: '#8b5cf6',
      tone: 'from-violet-500/18 to-blue-500/5',
      note: '+ 10,1% em relação ao mês anterior',
      valueClass: 'text-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.label}
            className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${card.tone} p-5 shadow-2xl shadow-black/20`}
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
                <p className="text-sm text-slate-300">{card.label}</p>
                <p className={`mt-1 text-2xl font-bold tracking-tight ${card.valueClass}`}>
                  {formatCurrency(card.value)}
                </p>
              </div>
            </div>
            <p className="relative mt-4 text-xs text-slate-300">
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
