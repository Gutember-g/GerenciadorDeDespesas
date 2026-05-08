interface CategoryItem {
  nome: string;
  valor: number;
}

interface TopCategoriasProps {
  categorias: CategoryItem[];
  total?: number;
}

const colors = ['#ff3d57', '#4f67ff', '#8b5cf6', '#22c55e', '#facc15', '#06b6d4'];

export const TopCategorias = ({ categorias, total = 0 }: TopCategoriasProps) => {
  const top6 = categorias.slice(0, 6);
  const totalCategorias = total || top6.reduce((sum, cat) => sum + cat.valor, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const gradient = top6.length
    ? `conic-gradient(${top6
        .map((cat, index) => {
          const start = top6.slice(0, index).reduce((sum, item) => sum + item.valor, 0);
          const end = start + cat.valor;
          const startPct = totalCategorias ? (start / totalCategorias) * 100 : 0;
          const endPct = totalCategorias ? (end / totalCategorias) * 100 : 0;
          return `${colors[index % colors.length]} ${startPct}% ${endPct}%`;
        })
        .join(', ')})`
    : 'conic-gradient(#1e293b 0% 100%)';

  return (
    <div className="h-full rounded-xl border border-white/10 bg-[#0d1828]/80 p-5 shadow-2xl shadow-black/20">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gastos por categoria</h3>
        <button className="text-xs font-medium text-slate-400 transition hover:text-white">Ver todas</button>
      </div>

      {top6.length > 0 ? (
        <div className="grid items-center gap-6 sm:grid-cols-[170px_1fr]">
          <div className="relative mx-auto h-40 w-40 rounded-full" style={{ background: gradient }}>
            <div className="absolute inset-10 rounded-full bg-[#0d1828]" />
          </div>

          <div className="space-y-3">
            {top6.map((cat, index) => (
              <div key={`${cat.nome}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="truncate text-slate-300">{cat.nome}</span>
                </div>
                <span className="shrink-0 font-medium text-slate-200">{formatCurrency(cat.valor)}</span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-4 text-right text-sm">
              <span className="text-slate-400">Total: </span>
              <span className="font-bold text-white">{formatCurrency(totalCategorias)}</span>
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
