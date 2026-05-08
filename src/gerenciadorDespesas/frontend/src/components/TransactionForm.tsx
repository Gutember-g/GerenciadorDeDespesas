import React, { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Calendar, CreditCard, Layers, Tag, X } from 'lucide-react';
import { accountAPI, categoryAPI, transactionAPI } from '../services/api';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TransactionForm({ isOpen, onClose, onSuccess }: TransactionFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [formattedAmount, setFormattedAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [installments, setInstallments] = useState(1);
  const [type, setType] = useState<'DEBITO' | 'CREDITO'>('DEBITO');

  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = categories.filter((cat) => cat.type === (type === 'CREDITO' ? 'INCOME' : 'EXPENSE'));

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    const selectedCategory = filteredCategories.find((cat) => cat.id.toString() === categoryId);
    if (!selectedCategory) {
      setCategoryId(filteredCategories[0]?.id?.toString() || '');
    }
  }, [type, categories]);

  const fetchData = async () => {
    try {
      setLoadingOptions(true);
      setError(null);
      const [accs, cats] = await Promise.all([
        accountAPI.getAccounts(),
        categoryAPI.getCategories(),
      ]);

      setAccounts(accs);
      setCategories(cats);

      setAccountId(accs[0]?.id?.toString() || '');
      const initialCategories = cats.filter((cat: any) => cat.type === (type === 'CREDITO' ? 'INCOME' : 'EXPENSE'));
      setCategoryId(initialCategories[0]?.id?.toString() || cats[0]?.id?.toString() || '');
    } catch (err) {
      console.error('Erro ao carregar dados do formulário', err);
      setError('Falha ao carregar contas e categorias. Verifique se o backend está rodando e se você está logado.');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleBlurAmount = () => {
    const value = parseFloat(amount);
    if (!isNaN(value)) {
      setFormattedAmount(value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    } else {
      setFormattedAmount('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!description || !amount || !date || !accountId || !categoryId) {
      setError('Todos os campos são obrigatórios.');
      setLoading(false);
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      setError('O valor deve ser maior que zero.');
      setLoading(false);
      return;
    }

    if (installments < 1 || installments > 48) {
      setError('O número de parcelas deve ser entre 1 e 48.');
      setLoading(false);
      return;
    }

    try {
      await transactionAPI.createTransaction({
        descricao: description,
        valorTotal: numAmount,
        dataPrimeiraParcela: date,
        numeroParcelas: installments,
        tipo: type,
        contaId: parseInt(accountId, 10),
        categoriaId: parseInt(categoryId, 10),
      });
      onSuccess();
      onClose();
      setDescription('');
      setAmount('');
      setFormattedAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setInstallments(1);
      setType('DEBITO');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar transação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />

      <div className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform border-l border-white/10 bg-[#081321] shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#081321]/90 p-6 backdrop-blur-xl">
            <div>
              <h2 className="text-xl font-bold text-white">Nova Transação</h2>
              <p className="text-sm text-slate-400">Preencha os dados abaixo</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto p-6">
            {error && (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('DEBITO')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 transition-all ${type === 'DEBITO' ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'}`}
              >
                <ArrowDownCircle className="h-5 w-5" />
                <span className="font-medium">Débito</span>
              </button>
              <button
                type="button"
                onClick={() => setType('CREDITO')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 transition-all ${type === 'CREDITO' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'}`}
              >
                <ArrowUpCircle className="h-5 w-5" />
                <span className="font-medium">Crédito</span>
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-slate-300">Descrição</label>
              <input
                id="description"
                required
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0d1828] px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                placeholder="Ex: Supermercado Mensal"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium text-slate-300">Valor Total</label>
              <div className="relative">
                <input
                  id="amount"
                  required
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onBlur={handleBlurAmount}
                  className="w-full rounded-xl border border-white/10 bg-[#0d1828] px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                  placeholder="0,00"
                />
                {formattedAmount && (
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    {formattedAmount}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="date" className="flex items-center text-sm font-medium text-slate-300">
                  <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                  Data
                </label>
                <input
                  id="date"
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0d1828] px-4 py-3 text-white outline-none transition-colors [color-scheme:dark] focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="installments" className="flex items-center text-sm font-medium text-slate-300">
                  <Layers className="mr-2 h-4 w-4 text-slate-400" />
                  Parcelas
                </label>
                <input
                  id="installments"
                  required
                  type="number"
                  min="1"
                  max="48"
                  value={installments}
                  onChange={(e) => setInstallments(parseInt(e.target.value, 10))}
                  className="w-full rounded-xl border border-white/10 bg-[#0d1828] px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="account" className="flex items-center text-sm font-medium text-slate-300">
                <CreditCard className="mr-2 h-4 w-4 text-slate-400" />
                Conta
              </label>
              <select
                id="account"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                disabled={loadingOptions || accounts.length === 0}
                className="w-full rounded-xl border border-white/10 bg-[#0d1828] px-4 py-3 text-white outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus:border-blue-500"
              >
                {loadingOptions && <option value="">Carregando contas...</option>}
                {!loadingOptions && accounts.length === 0 && <option value="">Nenhuma conta encontrada</option>}
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="flex items-center text-sm font-medium text-slate-300">
                <Tag className="mr-2 h-4 w-4 text-slate-400" />
                Categoria
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loadingOptions || filteredCategories.length === 0}
                className="w-full rounded-xl border border-white/10 bg-[#0d1828] px-4 py-3 text-white outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus:border-blue-500"
              >
                {loadingOptions && <option value="">Carregando categorias...</option>}
                {!loadingOptions && filteredCategories.length === 0 && <option value="">Nenhuma categoria encontrada</option>}
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </form>

          <div className="border-t border-white/10 bg-[#081321]/90 p-6 backdrop-blur-xl">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-slate-300 transition-colors hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || loadingOptions}
                className="flex-[2] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:brightness-110 disabled:opacity-60"
              >
                {loading ? 'Salvando...' : 'Salvar Transação'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
