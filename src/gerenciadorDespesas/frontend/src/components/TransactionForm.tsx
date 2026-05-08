import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, Tag, Layers, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { transactionAPI, accountAPI, categoryAPI } from '../services/api';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [accs, cats] = await Promise.all([
        accountAPI.getAccounts(),
        categoryAPI.getCategories()
      ]);
      setAccounts(accs);
      setCategories(cats);

      if (accs.length > 0) setAccountId(accs[0].id.toString());
      if (cats.length > 0) setCategoryId(cats[0].id.toString());
    } catch (err) {
      console.error("Erro ao carregar dados do formulário", err);
      setError("Falha ao carregar contas e categorias.");
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

    // Client-side validation
    if (!description || !amount || !date || !accountId || !categoryId) {
        setError("Todos os campos são obrigatórios.");
        setLoading(false);
        return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
        setError("O valor deve ser maior que zero.");
        setLoading(false);
        return;
    }

    if (installments < 1 || installments > 48) {
        setError("O número de parcelas deve ser entre 1 e 48.");
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
        contaId: parseInt(accountId),
        categoriaId: parseInt(categoryId)
      });
      onSuccess();
      onClose();
      // Reset form
      setDescription('');
      setAmount('');
      setFormattedAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setInstallments(1);
      setType('DEBITO');
    } catch (err: any) {
      setError(err.message || "Erro ao salvar transação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
            <div>
                <h2 className="text-xl font-bold text-white">Nova Transação</h2>
                <p className="text-sm text-slate-400">Preencha os dados abaixo</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-sm animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            {/* Type Toggle */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => setType('DEBITO')}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl border transition-all ${type === 'DEBITO' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                    <ArrowDownCircle className="w-5 h-5" />
                    <span className="font-medium">Débito</span>
                </button>
                <button
                    type="button"
                    onClick={() => setType('CREDITO')}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl border transition-all ${type === 'CREDITO' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                    <ArrowUpCircle className="w-5 h-5" />
                    <span className="font-medium">Crédito</span>
                </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-slate-300">Descrição</label>
              <div className="relative">
                <input
                  id="description"
                  required
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Ex: Supermercado Mensal"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium text-slate-300">Valor Total</label>
              <div className="relative">
                <input
                  id="amount"
                  required
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  onBlur={handleBlurAmount}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
                  placeholder="0,00"
                />
                {formattedAmount && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
                        {formattedAmount}
                    </div>
                )}
              </div>
            </div>

            {/* Date and Installments */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium text-slate-300 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        Data
                    </label>
                    <input
                        id="date"
                        required
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors [color-scheme:dark]"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="installments" className="text-sm font-medium text-slate-300 flex items-center">
                        <Layers className="w-4 h-4 mr-2 text-slate-400" />
                        Parcelas
                    </label>
                    <input
                        id="installments"
                        required
                        type="number"
                        min="1" max="48"
                        value={installments}
                        onChange={e => setInstallments(parseInt(e.target.value, 10))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>
            </div>

            {/* Account */}
            <div className="space-y-2">
              <label htmlFor="account" className="text-sm font-medium text-slate-300 flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-slate-400" />
                Conta
              </label>
              <select
                id="account"
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
              >
                {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-slate-300 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-slate-400" />
                Categoria
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
              >
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
            <div className="flex space-x-3">
                <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors border border-slate-700"
                >
                Cancelar
                </button>
                <button
                onClick={handleSubmit}
                disabled={loading}
                className={`flex-[2] py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center`}
                >
                {loading ? (
                    <div className="w-6 h-6 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
                ) : (
                    'Salvar Transação'
                )}
                </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
