import React, { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Calendar, CreditCard, Layers, Tag, X, Plus, ChevronDown, Check, Search } from 'lucide-react';
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
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO'>('PIX');

  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState('Necessidades');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
  const [newCategoryError, setNewCategoryError] = useState<string | null>(null);
  const [creatingCategory, setCreatingCategory] = useState(false);

  const filteredCategories = categories.filter((cat) => cat.type === (type === 'CREDITO' ? 'INCOME' : 'EXPENSE'));

  useEffect(() => {
    if (!showCategoryDropdown) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.category-select-container')) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showCategoryDropdown]);

  const searchLower = categorySearch.toLowerCase();
  const searchedCategories = filteredCategories.filter(cat => 
    cat.name.toLowerCase().includes(searchLower)
  );

  const groupedCategories = searchedCategories.reduce((groups: { [key: string]: any[] }, cat) => {
    let parent = cat.budgetRuleType || 'Necessidades';
    if (parent === 'ESSENTIAL') parent = 'Necessidades';
    if (parent === 'WANTS') parent = 'Desejos';
    if (parent === 'SAVINGS') parent = 'Prioridades financeiras';
    
    if (!groups[parent]) {
      groups[parent] = [];
    }
    groups[parent].push(cat);
    return groups;
  }, {});

  const handleCreateCategory = async (e: React.MouseEvent) => {
    e.preventDefault();
    setCreatingCategory(true);
    setNewCategoryError(null);

    if (!newCategoryName.trim()) {
      setNewCategoryError('O nome da subcategoria é obrigatório.');
      setCreatingCategory(false);
      return;
    }

    try {
      const newCat = await categoryAPI.createCategory({
        name: newCategoryName,
        type: type === 'CREDITO' ? 'INCOME' : 'EXPENSE',
        budgetRuleType: newCategoryParent,
        color: newCategoryColor
      });

      setCategories([...categories, newCat]);
      setCategoryId(newCat.id.toString());
      setNewCategoryName('');
      setShowNewCategoryForm(false);
    } catch (err: any) {
      setNewCategoryError(err.message || 'Erro ao criar subcategoria');
    } finally {
      setCreatingCategory(false);
    }
  };

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
        meioPagamento: installments > 1 ? 'CREDITO' : paymentMethod,
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
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'pointer-events-none opacity-0'}`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md overflow-hidden transform border border-white/10 bg-[#081321] shadow-2xl rounded-2xl transition-all duration-300 ease-in-out ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="flex max-h-[85vh] flex-col">
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

            {installments === 1 && (
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <CreditCard className="mr-2 h-4 w-4 text-slate-400" />
                  Meio de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['PIX', 'Pix'],
                    ['DEBITO', 'Débito'],
                    ['CREDITO', 'Crédito'],
                    ['DINHEIRO', 'Espécie'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPaymentMethod(value as any)}
                      className={`rounded-xl border p-2.5 text-xs font-semibold transition-all text-center ${paymentMethod === value ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 category-select-container relative">
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <Tag className="mr-2 h-4 w-4 text-slate-400" />
                  Subcategoria
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                  className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-400 transition-colors hover:bg-blue-500/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nova Subcategoria
                </button>
              </div>

              {/* Formulário para Nova Subcategoria (Regra 6) */}
              {showNewCategoryForm && (
                <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-4 animate-in fade-in duration-300">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">Nova Subcategoria Customizada</h4>
                  {newCategoryError && (
                    <div className="rounded bg-red-500/10 p-2 text-[11px] text-red-300">
                      {newCategoryError}
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Nome da Subcategoria</label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Ex: Cinema, Dentista, Pet"
                      className="w-full rounded-lg border border-white/10 bg-[#07111f] px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Categoria Pai</label>
                    <select
                      value={newCategoryParent}
                      onChange={(e) => setNewCategoryParent(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#07111f] px-3 py-2 text-xs text-white outline-none [color-scheme:dark] focus:border-blue-500"
                    >
                      <option value="Necessidades">Necessidades</option>
                      <option value="Desejos">Desejos</option>
                      <option value="Prioridades financeiras">Prioridades financeiras</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 block">Cor de Destaque</label>
                    <div className="flex flex-wrap gap-2">
                      {['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4', '#eab308'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewCategoryColor(c)}
                          className={`h-6 w-6 rounded-full border-2 transition-transform ${newCategoryColor === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryForm(false)}
                      className="flex-1 rounded bg-white/5 py-1.5 text-xs text-slate-300 hover:bg-white/10"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={creatingCategory}
                      onClick={handleCreateCategory}
                      className="flex-1 rounded bg-blue-600 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                    >
                      {creatingCategory ? 'Criando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Seletor Customizado com Busca e Agrupamento (Regras 1, 2 e 5) */}
              <div className="relative">
                <button
                  type="button"
                  disabled={loadingOptions || filteredCategories.length === 0}
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#0d1828] px-4 py-3 text-left text-white outline-none transition-colors focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {(() => {
                    const selected = filteredCategories.find(c => c.id.toString() === categoryId);
                    if (loadingOptions) return <span className="text-slate-400 text-sm">Carregando categorias...</span>;
                    if (selected) {
                      return (
                        <span className="flex items-center gap-2 text-sm text-slate-200">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selected.color }} />
                          {selected.name}
                        </span>
                      );
                    }
                    return <span className="text-slate-400 text-sm">Selecione uma subcategoria...</span>;
                  })()}
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {/* Painel do Dropdown */}
                {showCategoryDropdown && (
                  <div className="absolute left-0 z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-white/15 bg-[#0f1a2a] p-2 shadow-2xl shadow-black/80 animate-in fade-in duration-200">
                    <div className="relative mb-2 flex items-center p-1">
                      <Search className="absolute left-3 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Buscar subcategoria..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#07111f] py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    {Object.keys(groupedCategories).length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-500">
                        Nenhuma subcategoria encontrada
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {Object.keys(groupedCategories).map((parentName) => {
                          const groupColor = parentName === 'Necessidades' ? 'text-emerald-400' : parentName === 'Desejos' ? 'text-blue-400' : 'text-yellow-400';
                          return (
                            <div key={parentName} className="space-y-1">
                              <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${groupColor}`}>
                                {parentName}
                              </div>
                              <div className="space-y-0.5 pl-1">
                                {groupedCategories[parentName].map((cat) => {
                                  const isSelected = cat.id.toString() === categoryId;
                                  return (
                                    <button
                                      key={cat.id}
                                      type="button"
                                      onClick={() => {
                                        setCategoryId(cat.id.toString());
                                        setShowCategoryDropdown(false);
                                        setCategorySearch('');
                                      }}
                                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${isSelected ? 'bg-blue-600/20 text-blue-300' : 'text-slate-300 hover:bg-white/5'}`}
                                    >
                                      <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                        {cat.name}
                                      </span>
                                      {isSelected && <Check className="h-3.5 w-3.5 text-blue-400" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
    </div>
  );
}
