import React, { useEffect, useState } from 'react';
import { 
  CreditCard as CardIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar
} from 'lucide-react';

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
}

export function CardsPage({ searchQuery }: CardsPageProps) {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#0d1828]/80 px-6 py-20 text-center shadow-2xl">
          <div className="mb-4 rounded-full bg-white/5 p-4">
            <CardIcon className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-slate-200">Nenhum cartão cadastrado</h3>
          <p className="mx-auto max-w-xs text-sm text-slate-400">
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
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d1828]/60 p-6 shadow-xl backdrop-blur-sm transition hover:border-white/20 hover:bg-[#0d1828]/95"
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
                        R$ {card.currentInvoice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4">
                    <div>
                      <p className="text-xs text-slate-400">Limite Disponível</p>
                      <p className="text-base font-bold text-emerald-400 mt-0.5">
                        R$ {availableLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Limite Total</p>
                      <p className="text-base font-semibold text-slate-200 mt-0.5">
                        R$ {card.limitAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Limit Usage Bar */}
                  <div className="space-y-1">
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
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
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Uso do limite</span>
                      <span className="font-semibold">{usePercent.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Closing vs Due Day Info */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      Fechamento: Dia <strong className="text-slate-300">{card.closingDay}</strong>
                    </span>
                    <span>
                      Vencimento: Dia <strong className="text-slate-300">{card.dueDay}</strong>
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={() => openEditModal(card)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => openDeleteModal(card)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-500/10 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10"
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
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#081321] p-6 shadow-2xl animate-in scale-in duration-200"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              {modalMode === 'CREATE' ? 'Adicionar Cartão de Crédito' : 'Editar Cartão'}
            </h3>

            {errorMessage && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Cartão (Instituição)</label>
                <input
                  required
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Nubank Mastercard, XP Visa"
                  className="w-full rounded-xl border border-white/10 bg-[#0d1828] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Bandeira</label>
                  <select
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-[#0d1828] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Elo">Elo</option>
                    <option value="Amex">American Express</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tema Visual</label>
                  <select
                    value={formColorTheme}
                    onChange={(e) => setFormColorTheme(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-[#0d1828] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
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
                  <label className="block text-sm font-medium text-slate-300 mb-1">Limite Total (R$)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formLimitAmount}
                    onChange={(e) => setFormLimitAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-white/10 bg-[#0d1828] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Fatura Atual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formCurrentInvoice}
                    onChange={(e) => setFormCurrentInvoice(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-white/10 bg-[#0d1828] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Dia do Fechamento</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="31"
                    value={formClosingDay}
                    onChange={(e) => setFormClosingDay(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0d1828] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Dia do Vencimento</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="31"
                    value={formDueDay}
                    onChange={(e) => setFormDueDay(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0d1828] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-white/10 py-3 text-sm text-slate-300 hover:bg-white/5"
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
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#081321] p-6 shadow-2xl animate-in scale-in duration-200"
          >
            <h3 className="text-lg font-bold text-white mb-2">Excluir Cartão</h3>
            <p className="text-sm text-slate-400 mb-6">
              Tem certeza que deseja remover o cartão <strong className="text-slate-200">{selectedCard.name}</strong>?
              Esta ação removerá o limite e o saldo da fatura da sua visão de cartões.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl border border-white/10 py-3 text-sm text-slate-300 hover:bg-white/5"
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
    </div>
  );
}
