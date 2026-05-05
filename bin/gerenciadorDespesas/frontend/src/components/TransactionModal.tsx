import React, { useState } from 'react';
import { transactionAPI } from '../services/api';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [isInstallment, setIsInstallment] = useState(false);
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock category for now (normally you'd select this)
      await transactionAPI.createTransaction({
        user: { id: 1 }, 
        description,
        amount: parseFloat(amount),
        type,
        date: new Date().toISOString().split('T')[0],
        isInstallment,
        totalInstallments: isInstallment ? parseInt(installments.toString(), 10) : 1
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert("Erro ao salvar transação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-emerald-400">Nova Transação</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Descrição</label>
            <input 
              required
              type="text" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-accent transition-colors"
              placeholder="Ex: Compra de Notebook"
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-1">Valor Total (R$)</label>
              <input 
                required
                type="number"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-accent transition-colors"
                placeholder="0.00"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-1">Tipo</label>
              <select 
                value={type} onChange={e => setType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-accent transition-colors"
              >
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </select>
            </div>
          </div>

          {type === 'EXPENSE' && (
            <div className="pt-2 border-t border-slate-700/50">
              <label className="flex items-center space-x-3 mb-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isInstallment}
                  onChange={e => setIsInstallment(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 text-accent focus:ring-accent accent-accent w-4 h-4"
                />
                <span className="text-sm text-slate-300">Compra Parcelada?</span>
              </label>

              {isInstallment && (
                <div className="animate-in fade-in slide-in-from-top-4">
                  <label className="block text-sm text-slate-400 mb-1">Número de Parcelas</label>
                  <input 
                    type="number" 
                    min="2" max="60"
                    value={installments}
                    onChange={e => setInstallments(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-accent transition-colors"
                  />
                  <p className="text-xs text-accent mt-2">
                    O sistema dividirá o valor total em {installments} faturas futuras automaticamente.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-accent to-emerald-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity flex items-center shadow-lg shadow-emerald-500/20"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
