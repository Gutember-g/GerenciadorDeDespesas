import React, { useEffect, useState } from 'react';
import { 
  Tag, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  HelpCircle, 
  ShoppingBag, 
  Landmark, 
  Home, 
  Activity, 
  Car, 
  GraduationCap, 
  Heart, 
  Utensils, 
  Lightbulb
} from 'lucide-react';
import { categoryAPI } from '../services/api';

// Map containing references to Lucide icons
const iconMap: { [key: string]: React.ComponentType<any> } = {
  ShoppingBag,
  Landmark,
  Home,
  Activity,
  Car,
  GraduationCap,
  Heart,
  Utensils,
  Lightbulb,
  HelpCircle
};

const iconOptions = [
  { name: 'ShoppingBag', label: 'Lazer / Compras', icon: ShoppingBag },
  { name: 'Landmark', label: 'Investimento / Finanças', icon: Landmark },
  { name: 'Home', label: 'Moradia / Casa', icon: Home },
  { name: 'Activity', label: 'Saúde', icon: Activity },
  { name: 'Car', label: 'Transporte', icon: Car },
  { name: 'GraduationCap', label: 'Educação', icon: GraduationCap },
  { name: 'Heart', label: 'Cuidados / Doações', icon: Heart },
  { name: 'Utensils', label: 'Alimentação', icon: Utensils },
  { name: 'Lightbulb', label: 'Utilidades / Contas', icon: Lightbulb },
  { name: 'HelpCircle', label: 'Outros', icon: HelpCircle }
];

const colorOptions = [
  '#3b82f6', // Azul
  '#10b981', // Verde
  '#f59e0b', // Laranja
  '#ec4899', // Rosa
  '#8b5cf6', // Roxo
  '#ef4444', // Vermelho
  '#06b6d4', // Ciano
  '#eab308', // Amarelo
  '#14b8a6', // Teal
  '#6366f1'  // Indigo
];

interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  budgetRuleType: string; // "Necessidades", "Desejos", "Prioridades financeiras"
  color: string;
  iconName?: string;
  isSystem?: boolean;
}

interface CategoriesPageProps {
  searchQuery: string;
  refreshTrigger?: number;
}

export function CategoriesPage({ searchQuery }: CategoriesPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT' | 'DELETE'>('CREATE');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [formBudgetRule, setFormBudgetRule] = useState('Necessidades');
  const [formColor, setFormColor] = useState(colorOptions[0]);
  const [formIcon, setFormIcon] = useState('HelpCircle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const backendCats = await categoryAPI.getCategories();

      // Read local storage changes
      const localDeleted = JSON.parse(localStorage.getItem('financontrol_deleted_categories') || '[]');
      const localEdited = JSON.parse(localStorage.getItem('financontrol_edited_categories') || '[]');
      const localCreated = JSON.parse(localStorage.getItem('financontrol_created_categories') || '[]');

      // Clean backend categories types (ensure type is correct)
      let list: Category[] = backendCats.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        type: cat.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
        budgetRuleType: mapBudgetRule(cat.budgetRuleType),
        color: cat.color || '#3b82f6',
        iconName: cat.iconName || getAutoIcon(cat.name),
        isSystem: !!cat.isSystem || cat.name === 'Transferência para Meta' || cat.name === 'Resgate de Meta'
      }));

      // Apply local edits
      list = list.map(cat => {
        const edit = localEdited.find((e: any) => e.id === cat.id);
        if (edit) {
          return { ...cat, ...edit };
        }
        return cat;
      });

      // Apply local creations
      const createdList: Category[] = localCreated.map((c: any) => ({
        ...c,
        iconName: c.iconName || getAutoIcon(c.name)
      }));
      list = [...list, ...createdList];

      // Filter out local deleted
      list = list.filter(cat => !localDeleted.includes(cat.id));

      setCategories(list);
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const mapBudgetRule = (rule: string) => {
    if (!rule) return 'Necessidades';
    if (rule.toUpperCase() === 'ESSENTIAL' || rule === 'Necessidades') return 'Necessidades';
    if (rule.toUpperCase() === 'WANTS' || rule === 'Desejos') return 'Desejos';
    if (rule.toUpperCase() === 'SAVINGS' || rule === 'Prioridades financeiras') return 'Prioridades financeiras';
    return rule;
  };

  const getAutoIcon = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('comida') || n.includes('aliment') || n.includes('restaurante') || n.includes('supermercado')) return 'Utensils';
    if (n.includes('carro') || n.includes('transporte') || n.includes('combustivel') || n.includes('uber')) return 'Car';
    if (n.includes('casa') || n.includes('aluguel') || n.includes('moradia')) return 'Home';
    if (n.includes('saude') || n.includes('medico') || n.includes('farmacia') || n.includes('dentista')) return 'Activity';
    if (n.includes('lazer') || n.includes('cinema') || n.includes('viagem') || n.includes('shopping')) return 'ShoppingBag';
    if (n.includes('educacao') || n.includes('curso') || n.includes('faculdade') || n.includes('livro')) return 'GraduationCap';
    if (n.includes('luz') || n.includes('agua') || n.includes('internet') || n.includes('energia')) return 'Lightbulb';
    if (n.includes('invest') || n.includes('poup') || n.includes('reserva') || n.includes('ações')) return 'Landmark';
    if (n.includes('doacao') || n.includes('presente') || n.includes('amor')) return 'Heart';
    return 'HelpCircle';
  };

  const openCreateModal = () => {
    setModalMode('CREATE');
    setFormName('');
    setFormType(activeTab);
    setFormBudgetRule('Necessidades');
    setFormColor(colorOptions[0]);
    setFormIcon('HelpCircle');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setModalMode('EDIT');
    setSelectedCategory(cat);
    setFormName(cat.name);
    setFormType(cat.type);
    setFormBudgetRule(cat.budgetRuleType);
    setFormColor(cat.color);
    setFormIcon(cat.iconName || 'HelpCircle');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (cat: Category) => {
    setModalMode('DELETE');
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMessage('O nome da categoria é obrigatório.');
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'CREATE') {
        // Create Category via API
        let newCatBackend;
        try {
          newCatBackend = await categoryAPI.createCategory({
            name: formName,
            type: formType,
            budgetRuleType: formBudgetRule,
            color: formColor
          });
        } catch (apiErr) {
          console.warn('Falha na API ao criar categoria. Criando apenas localmente.', apiErr);
        }

        // Store locally if API fails or to save custom properties like iconName
        const localCreated = JSON.parse(localStorage.getItem('financontrol_created_categories') || '[]');
        const newId = newCatBackend?.id || Date.now();
        const newCategoryItem: Category = {
          id: newId,
          name: formName,
          type: formType,
          budgetRuleType: formBudgetRule,
          color: formColor,
          iconName: formIcon
        };

        if (!newCatBackend) {
          localCreated.push(newCategoryItem);
          localStorage.setItem('financontrol_created_categories', JSON.stringify(localCreated));
        } else {
          // If created on backend, save its custom fields to localEdited
          const localEdited = JSON.parse(localStorage.getItem('financontrol_edited_categories') || '[]');
          localEdited.push({ id: newId, iconName: formIcon });
          localStorage.setItem('financontrol_edited_categories', JSON.stringify(localEdited));
        }

      } else if (modalMode === 'EDIT' && selectedCategory) {
        // Save edit locally since backend doesn't have PUT endpoint
        const localEdited = JSON.parse(localStorage.getItem('financontrol_edited_categories') || '[]');
        
        // Remove existing edit if present
        const filtered = localEdited.filter((e: any) => e.id !== selectedCategory.id);
        filtered.push({
          id: selectedCategory.id,
          name: formName,
          type: formType,
          budgetRuleType: formBudgetRule,
          color: formColor,
          iconName: formIcon
        });
        localStorage.setItem('financontrol_edited_categories', JSON.stringify(filtered));
      }

      await loadCategories();
      setIsModalOpen(false);
    } catch (err) {
      setErrorMessage('Erro ao salvar categoria.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!selectedCategory) return;
    
    // Save deletion locally since backend doesn't have DELETE endpoint
    const localDeleted = JSON.parse(localStorage.getItem('financontrol_deleted_categories') || '[]');
    if (!localDeleted.includes(selectedCategory.id)) {
      localDeleted.push(selectedCategory.id);
      localStorage.setItem('financontrol_deleted_categories', JSON.stringify(localDeleted));
    }

    // Clean from local created lists if it was a local category
    const localCreated = JSON.parse(localStorage.getItem('financontrol_created_categories') || '[]');
    const filteredCreated = localCreated.filter((c: any) => c.id !== selectedCategory.id);
    localStorage.setItem('financontrol_created_categories', JSON.stringify(filteredCreated));

    loadCategories();
    setIsModalOpen(false);
  };

  // Filter and search
  const filtered = categories.filter(cat => {
    const matchesTab = cat.type === activeTab;
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cat.budgetRuleType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categorias</h2>
          <p className="mt-1 text-sm text-slate-400">
            Gerencie suas subcategorias para organizar seu orçamento de forma granular.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110"
        >
          <Plus className="h-5 w-5" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-white/10 pb-px">
        <button
          onClick={() => setActiveTab('EXPENSE')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
            activeTab === 'EXPENSE' 
              ? 'border-blue-500 text-blue-400' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownCircle className="h-4 w-4" />
          <span>Despesas</span>
        </button>
        <button
          onClick={() => setActiveTab('INCOME')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
            activeTab === 'INCOME' 
              ? 'border-emerald-500 text-emerald-400' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpCircle className="h-4 w-4" />
          <span>Receitas</span>
        </button>
      </div>

      {loading ? (
        <div className="grid h-64 place-items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/80 px-6 py-20 text-center shadow-sm dark:shadow-2xl">
          <div className="mb-4 rounded-full bg-slate-100 dark:bg-white/5 p-4">
            <Tag className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-slate-800 dark:text-slate-200">Nenhuma categoria encontrada</h3>
          <p className="mx-auto max-w-xs text-sm text-slate-500 dark:text-slate-400">
            Tente criar uma nova categoria ou mude o filtro para encontrar o que precisa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cat) => {
            const IconComponent = iconMap[cat.iconName || 'HelpCircle'] || HelpCircle;
            const isSystemCat = !!cat.isSystem;
            return (
              <div 
                key={cat.id} 
                className="group relative flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/60 p-5 shadow-lg backdrop-blur-sm transition hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-[#0d1828]/95"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{cat.name}</h3>
                      {isSystemCat && (
                        <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          Sistema
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      {cat.type === 'EXPENSE' && (
                        <span className="rounded bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                          {cat.budgetRuleType}
                        </span>
                      )}
                      <span 
                        className="h-2 w-2 rounded-full" 
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                </div>

                {!isSystemCat ? (
                  <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-white/15 hover:text-white"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(cat)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 italic pr-1">Fixo</span>
                )}
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
              {modalMode === 'CREATE' ? 'Criar Categoria' : 'Editar Categoria'}
            </h3>

            {errorMessage && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-600 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-655 dark:text-slate-300 mb-1">Nome da Categoria</label>
                <input
                  required
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Assinaturas, Delivery"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-655 dark:text-slate-300 mb-1">Tipo</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="EXPENSE">Despesa</option>
                    <option value="INCOME">Receita</option>
                  </select>
                </div>

                {formType === 'EXPENSE' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-655 dark:text-slate-300 mb-1">Orçamento Pai</label>
                    <select
                      value={formBudgetRule}
                      onChange={(e) => setFormBudgetRule(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] px-4 py-3 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500"
                    >
                      <option value="Necessidades">Necessidades</option>
                      <option value="Desejos">Desejos</option>
                      <option value="Prioridades financeiras">Prioridades financeiras</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-655 dark:text-slate-300 mb-2">Cor de Destaque</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`h-7 w-7 rounded-full border-2 transition ${
                        formColor === c ? 'border-slate-800 dark:border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-655 dark:text-slate-300 mb-2">Ícone</label>
                <div className="grid grid-cols-5 gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1828] p-3 max-h-40 overflow-y-auto">
                  {iconOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = formIcon === opt.name;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setFormIcon(opt.name)}
                        title={opt.label}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                            : 'border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 py-3 text-sm text-slate-550 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:brightness-110 disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isModalOpen && modalMode === 'DELETE' && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#081321] p-6 shadow-2xl animate-in scale-in duration-200"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Excluir Categoria</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Tem certeza que deseja excluir a categoria <strong className="text-slate-800 dark:text-slate-200">{selectedCategory.name}</strong>?
              Esta ação removerá a categoria da listagem, mas não apagará transações passadas já salvas.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 py-3 text-sm text-slate-550 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-500 transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
