import React, { useEffect, useState } from 'react';
import { 
  CreditCard as CardIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar,
  X,
  Filter,
  PlusCircle
} from 'lucide-react';
import { useAuthSettings } from '../contexts/AuthSettingsContext.tsx';
import { transactionAPI } from '../services/api';

interface CreditCard {
  id: number;
  name: string;
  brand: 'Visa' | 'Mastercard' | 'Elo' | 'Amex';
  limitAmount: number;
  currentInvoice: number;
  closingDay: number;
  dueDay: number;
  colorTheme: 'purple' | 'gold' | 'black' | 'orange' | 'blue';
}

const initialMockCards: CreditCard[] = [
  {
    id: 1,
    name: 'Nubank Ultravioleta',
    brand: 'Mastercard',
    limitAmount: 15000,
    currentInvoice: 2450.90,
    closingDay: 5,
    dueDay: 12,
    colorTheme: 'purple'
  },
  {
    id: 2,
    name: 'XP Visa Infinite',
    brand: 'Visa',
    limitAmount: 30000,
    currentInvoice: 4890.30,
    closingDay: 10,
    dueDay: 17,
    colorTheme: 'gold'
  },
  {
    id: 3,
    name: 'Banco Inter',
    brand: 'Mastercard',
    limitAmount: 10000,
    currentInvoice: 350.00,
    closingDay: 25,
    dueDay: 2,
    colorTheme: 'orange'
  }
];

interface CardsPageProps {
  searchQuery: string;
  onAddTransactionClick?: (cardId: number) => void;
}

export function CardsPage({ searchQuery, onAddTransactionClick }: CardsPageProps) {
  const { formatCurrency } = useAuthSettings();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Card Details Drawer States
  const [selectedCardDetails, setSelectedCardDetails] = useState<CreditCard | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${mm}`;
  });
  const [cardTransactions, setCardTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const fetchCardTransactions = async () => {
    if (!selectedCardDetails) return;
    try {
      setLoadingTransactions(true);
      const [yearStr, monthStr] = selectedMonth.split('-');
      const data = await transactionAPI.getTransactions(parseInt(monthStr, 10), parseInt(yearStr, 10));
      const filtered = data.filter((tx: any) => tx.cardId === selectedCardDetails.id);
      setCardTransactions(filtered);
    } catch (err) {
      console.error("Erro ao buscar transações do cartão", err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (selectedCardDetails) {
      fetchCardTransactions();
    }
  }, [selectedCardDetails, selectedMonth]);

  const formatMonthName = (monthStr: string) => {
    if (!monthStr) return '';
    const [y, m] = monthStr.split('-').map(Number);
    return new Date(y, m - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT' | 'DELETE'>('CREATE');
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState<'Visa' | 'Mastercard' | 'Elo' | 'Amex'>('Visa');
  const [formLimitAmount, setFormLimitAmount] = useState('');
  const [formCurrentInvoice, setFormCurrentInvoice] = useState('');
  const [formClosingDay, setFormClosingDay] = useState('');
  const [formDueDay, setFormDueDay] = useState('');
  const [formColorTheme, setFormColorTheme] = useState<'purple' | 'gold' | 'black' | 'orange' | 'blue'>('purple');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadCards = () => {
    setLoading(true);
    const stored = localStorage.getItem('financontrol_cards');
    if (stored) {
      setCards(JSON.parse(stored));
    } else {
      localStorage.setItem('financontrol_cards', JSON.stringify(initialMockCards));
      setCards(initialMockCards);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCards();
  }, []);

  const saveCardsList = (updatedCards: CreditCard[]) => {
    localStorage.setItem('financontrol_cards', JSON.stringify(updatedCards));
    setCards(updatedCards);
  };

  const openCreateModal = () => {
    setModalMode('CREATE');
    setFormName('');
    setFormBrand('Visa');
    setFormLimitAmount('');
    setFormCurrentInvoice('0');
    setFormClosingDay('5');
    setFormDueDay('12');
    setFormColorTheme('purple');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (card: CreditCard) => {
    setModalMode('EDIT');
    setSelectedCard(card);
    setFormName(card.name);
    setFormBrand(card.brand);
    setFormLimitAmount(card.limitAmount.toString());
    setFormCurrentInvoice(card.currentInvoice.toString());
    setFormClosingDay(card.closingDay.toString());
    setFormDueDay(card.dueDay.toString());
    setFormColorTheme(card.colorTheme);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (card: CreditCard) => {
    setModalMode('DELETE');
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formLimitAmount || !formClosingDay || !formDueDay) {
      setErrorMessage('Todos os campos obrigatórios devem ser preenchidos.');
      return;
    }

    const limitNum = parseFloat(formLimitAmount);
    const invoiceNum = parseFloat(formCurrentInvoice || '0');
    const closingNum = parseInt(formClosingDay, 10);
    const dueNum = parseInt(formDueDay, 10);

    if (isNaN(limitNum) || limitNum <= 0) {
      setErrorMessage('O limite deve ser um número maior que zero.');
      return;
    }
    if (isNaN(invoiceNum) || invoiceNum < 0) {
      setErrorMessage('A fatura atual não pode ser negativa.');
      return;
    }
    if (isNaN(closingNum) || closingNum < 1 || closingNum > 31) {
      setErrorMessage('O dia de fechamento deve ser entre 1 e 31.');
      return;
    }
    if (isNaN(dueNum) || dueNum < 1 || dueNum > 31) {
      setErrorMessage('O dia de vencimento deve ser entre 1 e 31.');
      return;
    }

    if (modalMode === 'CREATE') {
      const newCard: CreditCard = {
        id: Date.now(),
        name: formName,
        brand: formBrand,
        limitAmount: limitNum,
        currentInvoice: invoiceNum,
        closingDay: closingNum,
        dueDay: dueNum,
        colorTheme: formColorTheme
      };
      saveCardsList([...cards, newCard]);
    } else if (modalMode === 'EDIT' && selectedCard) {
      const updated = cards.map(c => {
        if (c.id === selectedCard.id) {
          return {
            ...c,
            name: formName,
            brand: formBrand,
            limitAmount: limitNum,
            currentInvoice: invoiceNum,
            closingDay: closingNum,
            dueDay: dueNum,
            colorTheme: formColorTheme
          };
        }
        return c;
      });
      saveCardsList(updated);
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!selectedCard) return;
    const filtered = cards.filter(c => c.id !== selectedCard.id);
    saveCardsList(filtered);
    setIsModalOpen(false);
  };

  const filteredCards = cards.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'purple':
        return 'from-purple-800 to-indigo-950 border-purple-500/30 text-white';
      case 'gold':
        return 'from-amber-600/90 to-yellow-950 border-amber-500/30 text-white';
      case 'black':
        return 'from-slate-800 to-zinc-950 border-slate-700/50 text-white';
      case 'orange':
        return 'from-orange-600 to-amber-950 border-orange-500/30 text-white';
      case 'blue':
        return 'from-blue-700 to-cyan-950 border-blue-500/30 text-white';
      default:
        return 'from-slate-800 to-slate-950 border-slate-700 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meus Cartões</h2>
          <p className="mt-1 text-sm text-slate-400">
            Acompanhe o limite disponível, o valor das faturas e controle seus vencimentos.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110"
        >
          <Plus className="h-5 w-5" />
          <span>Adicionar Cartão</span>
        </button>
      </div>

      {loading ? (
        <div className="grid h-64 place-items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-400" />
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/80 px-6 py-20 text-center shadow-sm dark:shadow-2xl">
          <div className="mb-4 rounded-full bg-slate-100 dark:bg-white/5 p-4">
            <CardIcon className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-slate-800 dark:text-slate-200">Nenhum cartão cadastrado</h3>
          <p className="mx-auto max-w-xs text-sm text-slate-600 dark:text-slate-400">
            Cadastre seu primeiro cartão de crédito para centralizar suas despesas parceladas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCards.map((card) => {
            const availableLimit = card.limitAmount - card.currentInvoice;
            const usePercent = Math.min((card.currentInvoice / card.limitAmount) * 100, 100);

            return (
              <div 
                key={card.id} 
                onClick={() => setSelectedCardDetails(card)}
                className={`flex flex-col justify-between rounded-2xl border p-6 shadow-xl backdrop-blur-sm cursor-pointer transition ${
                  selectedCardDetails?.id === card.id 
                    ? 'border-blue-500 dark:border-blue-500 shadow-blue-500/10 scale-[1.01] bg-slate-50/50 dark:bg-[#0d1828]/95' 
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/60 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-[#0d1828]/95'
                }`}
              >
                {/* Physical Credit Card Mockup */}
                <div className={`relative w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br p-6 shadow-lg border flex flex-col justify-between overflow-hidden ${getThemeClasses(card.colorTheme)}`}>
                  {/* Decorative background lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[length:40px_40px] opacity-20" />
                  
                  <div className="z-10 flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-white/60">Cartão de Crédito</p>
                      <h4 className="mt-1 text-lg font-bold">{card.name}</h4>
                    </div>
                    <span className="text-base font-extrabold italic uppercase tracking-wider text-white/90">
                      {card.brand}
                    </span>
                  </div>

                  {/* Smart Card Chip & NFC Icon */}
                  <div className="z-10 flex items-center gap-3">
                    <div className="h-8 w-11 rounded-lg bg-gradient-to-br from-yellow-300 to-amber-500 border border-yellow-400/30 shadow-sm" />
                    <svg className="h-5 w-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>

                  <div className="z-10 flex items-end justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-white/50">Fatura Atual</p>
                      <p className="text-lg font-extrabold text-white">
                        {formatCurrency(card.currentInvoice)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-wider text-white/50">Vence Dia</p>
                      <p className="text-sm font-bold">{card.dueDay}</p>
                    </div>
                  </div>
                </div>

                {/* Card Limit Info & Metrics */}
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Limite Disponível</p>
                      <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {formatCurrency(availableLimit)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Limite Total</p>
                      <p className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {formatCurrency(card.limitAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Limit Usage Bar */}
                  <div className="space-y-1">
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          usePercent > 85 
                            ? 'bg-red-500' 
                            : usePercent > 50 
                              ? 'bg-amber-500' 
                              : 'bg-blue-500'
                        }`}
                        style={{ width: `${usePercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Uso do limite</span>
                      <span className="font-semibold">{usePercent.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Closing vs Due Day Info */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      Fechamento: Dia <strong className="text-slate-700 dark:text-slate-300">{card.closingDay}</strong>
                    </span>
                    <span>
                      Vencimento: Dia <strong className="text-slate-700 dark:text-slate-300">{card.dueDay}</strong>
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(card); }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openDeleteModal(card); }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-500/10 py-2 text-xs font-semibold text-red-650 dark:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remover</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (modalMode === 'CREATE' || modalMode === 'EDIT') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#081321] p-6 shadow-2xl animate-in scale-in duration-200"
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {modalMode === 'CREATE' ? 'Adicionar Cartão de Crédito' : 'Editar Cartão'}
            </h3>

            {errorMessage && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-600 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Nome do Cartão (Instituição)</label>
                <input
                  required
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Nubank Mastercard, XP Visa"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Bandeira</label>
                  <select
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Elo">Elo</option>
                    <option value="Amex">American Express</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Tema Visual</label>
                  <select
                    value={formColorTheme}
                    onChange={(e) => setFormColorTheme(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="purple">Roxo (Nubank)</option>
                    <option value="gold">Dourado / Bronze (XP)</option>
                    <option value="black">Preto (Black / Infinite)</option>
                    <option value="orange">Laranja (Inter)</option>
                    <option value="blue">Azul (Corporativo / Itaú)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Limite Total (R$)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formLimitAmount}
                    onChange={(e) => setFormLimitAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Fatura Atual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formCurrentInvoice}
                    onChange={(e) => setFormCurrentInvoice(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Dia do Fechamento</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="31"
                    value={formClosingDay}
                    onChange={(e) => setFormClosingDay(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Dia do Vencimento</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="31"
                    value={formDueDay}
                    onChange={(e) => setFormDueDay(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:brightness-110"
                >
                  Salvar Cartão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isModalOpen && modalMode === 'DELETE' && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#081321] p-6 shadow-2xl animate-in scale-in duration-200"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Excluir Cartão</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Tem certeza que deseja remover o cartão <strong className="text-slate-800 dark:text-slate-200">{selectedCard.name}</strong>?
              Esta ação removerá o limite e o saldo da fatura da sua visão de cartões.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-500 transition"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETALHES DO CARTÃO (DRAWER LATERAL) */}
      {selectedCardDetails && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-40 transition-opacity duration-300 animate-in fade-in"
            onClick={() => setSelectedCardDetails(null)}
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white dark:bg-[#081321]/95 border-l border-slate-200 dark:border-white/10 shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto translate-x-0 flex flex-col">
            
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 dark:border-white/10 bg-white/95 dark:bg-[#081321]/95 p-6 backdrop-blur-xl">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Detalhes do Cartão</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Visão de limites e lançamentos</p>
              </div>
              <button 
                onClick={() => setSelectedCardDetails(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              
              {/* Mini Card Mockup & Metrics */}
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-4 space-y-4">
                
                {/* Physical Card Representation */}
                <div className={`relative w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br p-5 shadow-lg border flex flex-col justify-between overflow-hidden ${getThemeClasses(selectedCardDetails.colorTheme)}`}>
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[length:40px_40px] opacity-15" />
                  <div className="z-10 flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/50">Cartão selecionado</p>
                      <h4 className="mt-0.5 text-base font-bold">{selectedCardDetails.name}</h4>
                    </div>
                    <span className="text-xs font-extrabold italic uppercase tracking-wider text-white/80">
                      {selectedCardDetails.brand}
                    </span>
                  </div>
                  <div className="z-10 flex items-center gap-2">
                    <div className="h-6 w-9 rounded bg-gradient-to-br from-yellow-300 to-amber-500 border border-yellow-400/20 shadow-sm" />
                    <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="z-10 flex items-end justify-between">
                    <div>
                      <p className="text-[8.5px] uppercase tracking-wider text-white/50">Fatura Atual</p>
                      <p className="text-base font-extrabold text-white">
                        {formatCurrency(selectedCardDetails.currentInvoice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8.5px] uppercase tracking-wider text-white/50">Vence Dia</p>
                      <p className="text-xs font-bold">{selectedCardDetails.dueDay}</p>
                    </div>
                  </div>
                </div>

                {/* Limit details */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Limite Disponível</span>
                      <strong className="text-sm text-emerald-600 dark:text-emerald-450 mt-0.5 block">
                        {formatCurrency(selectedCardDetails.limitAmount - selectedCardDetails.currentInvoice)}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 dark:text-slate-400 block">Limite Total</span>
                      <strong className="text-sm text-slate-800 dark:text-slate-200 mt-0.5 block">
                        {formatCurrency(selectedCardDetails.limitAmount)}
                      </strong>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {(() => {
                    const percent = Math.min((selectedCardDetails.currentInvoice / selectedCardDetails.limitAmount) * 100, 100);
                    return (
                      <div className="space-y-1">
                        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              percent > 85 ? 'bg-red-500' : percent > 50 ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                          <span>Uso do Limite</span>
                          <span>{percent.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Dates info */}
                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-white/5 pt-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Fechamento: Dia <strong className="text-slate-700 dark:text-slate-200">{selectedCardDetails.closingDay}</strong>
                    </span>
                    <span>
                      Vencimento: Dia <strong className="text-slate-700 dark:text-slate-200">{selectedCardDetails.dueDay}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Filtro de Período e Resumo */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-250">Gasto Mensal</span>
                <input 
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-3.5 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-blue-500 [color-scheme:light] dark:[color-scheme:dark] transition-colors"
                />
              </div>

              {/* Loading indicator for transactions */}
              {loadingTransactions ? (
                <div className="flex justify-center items-center py-10">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-500" />
                </div>
              ) : (
                <>
                  {/* Resumo do Período */}
                  {(() => {
                    const totalGasto = cardTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
                    return (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Gasto no Período</span>
                          <strong className="text-lg font-bold text-slate-800 dark:text-white mt-1 block">
                            {formatCurrency(totalGasto)}
                          </strong>
                        </div>
                        <div className="rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Transações no Período</span>
                          <strong className="text-lg font-bold text-slate-800 dark:text-white mt-1 block">
                            {cardTransactions.length}
                          </strong>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Gráfico de Categorias */}
                  {cardTransactions.length > 0 && (
                    <div className="space-y-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 block">Gastos por Categoria</span>
                      
                      {(() => {
                        const totalGasto = cardTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
                        const porCategoria = cardTransactions.reduce((acc: any, t) => {
                          const catName = t.category ? t.category.name : (t.categoria || 'Outros');
                          const catColor = t.category ? t.category.color : '#64748b';
                          if (!acc[catName]) {
                            acc[catName] = { amount: 0, color: catColor };
                          }
                          acc[catName].amount += Math.abs(t.amount);
                          return acc;
                        }, {});

                        const categoriasOrdenadas = Object.keys(porCategoria).map(name => ({
                          name,
                          amount: porCategoria[name].amount,
                          color: porCategoria[name].color,
                          percent: totalGasto > 0 ? (porCategoria[name].amount / totalGasto) * 100 : 0
                        })).sort((a, b) => b.amount - a.amount);

                        return (
                          <div className="space-y-3 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4">
                            {categoriasOrdenadas.map(cat => (
                              <div key={cat.name} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-650 dark:text-slate-355 flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                    {cat.name}
                                  </span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {formatCurrency(cat.amount)} ({cat.percent.toFixed(1)}%)
                                  </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full" 
                                    style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Extrato do Cartão */}
                  <div className="space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-455 block">Lançamentos da Fatura</span>
                    
                    {cardTransactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-white/10 py-12 text-center bg-slate-50/10 dark:bg-white/2">
                        <div className="mb-4 rounded-full bg-slate-100 dark:bg-white/5 p-3 text-slate-400">
                          <Filter className="h-6 w-6" />
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Nenhum gasto registrado</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-450 mt-1 max-w-[200px]">
                          Nenhum gasto registrado neste cartão para {formatMonthName(selectedMonth)}.
                        </p>
                        <button
                          onClick={() => onAddTransactionClick?.(selectedCardDetails.id)}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-2 text-[10px] font-bold text-blue-600 dark:text-blue-450 transition hover:bg-blue-500/20"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span>Lançar Gasto neste Cartão</span>
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200/80 dark:divide-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl bg-slate-50/20 dark:bg-white/2 overflow-hidden">
                        {(() => {
                          const groupedTx = cardTransactions.reduce((acc: any, t) => {
                            const [y, m, d] = t.date.split('-').map(Number);
                            const dateKey = new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long'
                            });
                            if (!acc[dateKey]) {
                              acc[dateKey] = [];
                            }
                            acc[dateKey].push(t);
                            return acc;
                          }, {});

                          const sortedDates = Object.keys(groupedTx).sort((a, b) => {
                            const dayA = parseInt(a.split(' ')[0], 10);
                            const dayB = parseInt(b.split(' ')[0], 10);
                            return dayB - dayA;
                          });

                          return sortedDates.map(dateKey => (
                            <div key={dateKey} className="space-y-0.5">
                              <div className="bg-slate-100/50 dark:bg-white/5 px-4 py-2 border-y border-slate-200/40 dark:border-white/5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{dateKey}</span>
                              </div>
                              <div className="divide-y divide-slate-100 dark:divide-white/5">
                                {groupedTx[dateKey].map((tx: any) => {
                                  const catColor = tx.category ? tx.category.color : '#64748b';
                                  const isExpense = tx.type === 'EXPENSE';
                                  return (
                                    <div key={tx.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5">
                                      <div className="min-w-0 flex-1 pr-3">
                                        <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{tx.description}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                                          <span className="text-[10px] text-slate-450 dark:text-slate-400 font-medium">
                                            {tx.category ? tx.category.name : (tx.categoria || 'Outros')}
                                          </span>
                                          <span className="text-[9px] text-slate-400 dark:text-slate-500">ID: #{tx.id}</span>
                                        </div>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <span className={`text-xs font-bold ${isExpense ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                                          {isExpense ? '-' : '+'} {formatCurrency(tx.amount)}
                                        </span>
                                        <span className={`block text-[9px] mt-0.5 ${tx.status === 'PENDING' ? 'text-amber-500 dark:text-amber-400 font-medium animate-pulse' : 'text-slate-400 dark:text-slate-500'}`}>
                                          {tx.status === 'PENDING' ? 'Pendente' : 'Liquidado'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                </>
              )}

            </div>
          </div>
        </>
      )}
    </div>
  );
}
