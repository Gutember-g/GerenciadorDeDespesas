import { ShoppingBag } from 'lucide-react';

interface CategoryItem {
  nome: string;
  valor: number;
}

interface TopCategoriasProps {
  categorias: CategoryItem[];
}

export const TopCategorias = ({ categorias }: TopCategoriasProps) => {
  const top5 = categorias.slice(0, 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-6">Maiores Gastos</h3>
      {top5.length > 0 ? (
        <div className="space-y-4">
          {top5.map((cat, index) => (
            <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-lg transition-colors group">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/50 transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="font-medium text-slate-300">{cat.nome}</span>
              </div>
              <span className="font-bold text-slate-100">{formatCurrency(cat.valor)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-slate-500 italic">
          <p>Nenhuma despesa este mês</p>
        </div>
      )}
    </div>
  );
};
