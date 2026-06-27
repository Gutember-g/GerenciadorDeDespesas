import { useState, useEffect } from 'react';
import {
  Bell,
  ChartNoAxesColumnIncreasing,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  ReceiptText,
  Search,
  Settings,
  Target,
  User,
  WalletCards,
  Sun,
  Loader2,
} from 'lucide-react';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Dashboard } from './components/Dashboard';
import { Reports } from './components/Reports';
import { LoginPage } from './components/LoginPage';
import { CategoriesPage } from './components/CategoriesPage';
import { GoalsPage } from './components/GoalsPage';
import { CardsPage } from './components/CardsPage';
import { SettingsPage } from './components/SettingsPage';
import { MesProvider } from './contexts/MesContext';
import { categoryAPI, transactionAPI } from './services/api';
import { useAuthSettings } from './contexts/AuthSettingsContext.tsx';

type ActiveTab = 'dashboard' | 'transactions' | 'reports' | 'categories' | 'goals' | 'cards' | 'settings';

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions' as const, label: 'Transações', icon: ReceiptText },
  { id: 'reports' as const, label: 'Relatórios', icon: ChartNoAxesColumnIncreasing },
  { id: 'categories' as const, label: 'Categorias', icon: WalletCards },
  { id: 'goals' as const, label: 'Metas', icon: Target },
  { id: 'cards' as const, label: 'Cartões', icon: CreditCard },
  { id: 'settings' as const, label: 'Configurações', icon: Settings },
];

function App() {
  const { user, theme, currency, notifications: userNotifications, logout, updateUserPreferences, loading } = useAuthSettings();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Global search & dropdown states
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    goals: any[];
    categories: any[];
    transactions: any[];
  }>({ goals: [], categories: [], transactions: [] });
  const [isSearching, setIsSearching] = useState(false);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Real system notifications state
  const [notifications, setNotifications] = useState<any[]>([]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Perform search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ goals: [], categories: [], transactions: [] });
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      try {
        // 1. Search goals
        const storedGoals = localStorage.getItem('financontrol_goals');
        const goalsList = storedGoals ? JSON.parse(storedGoals) : [];
        const matchedGoals = goalsList.filter((g: any) => 
          g.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // 2. Search categories
        let matchedCategories = [];
        try {
          const categoriesList = await categoryAPI.getCategories();
          matchedCategories = categoriesList.filter((c: any) => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } catch (e) {
          console.error("Error searching categories", e);
        }

        // 3. Search transactions (global search)
        let matchedTransactions = [];
        try {
          matchedTransactions = await transactionAPI.getTransactions(undefined, undefined, searchQuery);
        } catch (e) {
          console.error("Error searching transactions", e);
        }

        setSearchResults({
          goals: matchedGoals,
          categories: matchedCategories,
          transactions: matchedTransactions
        });
      } catch (err) {
        console.error("Global search error", err);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [searchQuery]);

  // Dynamic Notifications Generator
  const generateDynamicNotifications = async () => {
    const storedCards = localStorage.getItem('financontrol_cards');
    const cardsList = storedCards ? JSON.parse(storedCards) : [];
    
    const storedGoals = localStorage.getItem('financontrol_goals');
    const goalsList = storedGoals ? JSON.parse(storedGoals) : [];

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const diaAtual = today.getDate();

    const newNotifications: any[] = [];

    // 1. Fatura a vencer (dueDay - diaAtual === 3)
    cardsList.forEach((card: any) => {
      const diff = card.dueDay - diaAtual;
      if (diff === 3) {
        newNotifications.push({
          id: `card-due-${card.id}-${card.dueDay}-${currentYear}-${currentMonth}`,
          text: `Vencimento de fatura: sua fatura ${card.name} vence em 3 dias.`,
          type: 'info',
          time: 'Hoje'
        });
      }
    });

    // 2. Meta atingida (currentAmount >= targetAmount)
    goalsList.forEach((goal: any) => {
      if (goal.currentAmount >= goal.targetAmount) {
        newNotifications.push({
          id: `goal-reached-${goal.id}`,
          text: `Meta atingida! Parabéns, você atingiu a meta ${goal.name}.`,
          type: 'success',
          time: 'Hoje'
        });
      }
    });

    // 3 & 4. Transaction-based alerts
    try {
      const transactions = await transactionAPI.getTransactions(currentMonth, currentYear);
      
      // Rule 3: High transaction (> 1000)
      transactions.forEach((tx: any) => {
        if (tx.amount > 1000 && tx.type === 'EXPENSE') {
          newNotifications.push({
            id: `high-tx-${tx.id}`,
            text: `Transação alta detectada: compra de R$ ${tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} em ${tx.description}.`,
            type: 'warning',
            time: 'Hoje'
          });
        }
      });

      // Rule 4: High total expenses (> 5000)
      const totalExpenses = transactions
        .filter((tx: any) => tx.type === 'EXPENSE')
        .reduce((sum: number, tx: any) => sum + tx.amount, 0);

      if (totalExpenses > 5000) {
        newNotifications.push({
          id: `high-expenses-${currentYear}-${currentMonth}`,
          text: `Gastos elevados: o total de despesas deste mês (R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) ultrapassou R$ 5.000,00.`,
          type: 'warning',
          time: 'Hoje'
        });
      }
    } catch (err) {
      console.error("Error generating transaction notifications", err);
    }

    const readIds = JSON.parse(localStorage.getItem('financontrol_read_notifications') || '[]');
    const clearedIds = JSON.parse(localStorage.getItem('financontrol_cleared_notifications') || '[]');
    
    const finalNotifications = newNotifications
      .filter(n => !clearedIds.includes(n.id))
      .map((n, idx) => ({
        id: idx + 1,
        keyId: n.id,
        text: n.text,
        type: n.type,
        read: readIds.includes(n.id),
        time: n.time
      }));

    setNotifications(finalNotifications);
  };

  useEffect(() => {
    if (user) {
      generateDynamicNotifications();
    }
  }, [refreshTrigger, activeTab, user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markNotificationAsRead = (id: number) => {
    const target = notifications.find(n => n.id === id);
    if (target && target.keyId) {
      const readIds = JSON.parse(localStorage.getItem('financontrol_read_notifications') || '[]');
      if (!readIds.includes(target.keyId)) {
        readIds.push(target.keyId);
        localStorage.setItem('financontrol_read_notifications', JSON.stringify(readIds));
      }
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    const readIds = JSON.parse(localStorage.getItem('financontrol_read_notifications') || '[]');
    notifications.forEach(n => {
      if (n.keyId && !readIds.includes(n.keyId)) {
        readIds.push(n.keyId);
      }
    });
    localStorage.setItem('financontrol_read_notifications', JSON.stringify(readIds));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    const clearedIds = JSON.parse(localStorage.getItem('financontrol_cleared_notifications') || '[]');
    notifications.forEach(n => {
      if (n.keyId && !clearedIds.includes(n.keyId)) {
        clearedIds.push(n.keyId);
      }
    });
    localStorage.setItem('financontrol_cleared_notifications', JSON.stringify(clearedIds));
    setNotifications([]);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative') && !target.closest('input')) {
        setIsNotificationOpen(false);
        setIsUserMenuOpen(false);
        setSearchInput('');
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setActiveTab('dashboard');
    }
  };

  if (loading) {
    return (
      <div className="grid h-screen place-items-center bg-slate-50 dark:bg-[#07111f]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const userInitial = user.nome ? user.nome.charAt(0).toUpperCase() : '';

  return (
    <MesProvider>
      <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#07111f] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-150">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(55,138,221,0.06),transparent_28%),radial-gradient(circle_at_78%_8%,rgba(139,92,246,0.05),transparent_24%),linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(241,245,249,1)_45%,rgba(226,232,240,1)_100%)] dark:bg-[radial-gradient(circle_at_18%_10%,rgba(55,138,221,0.18),transparent_28%),radial-gradient(circle_at_78%_8%,rgba(139,92,246,0.14),transparent_24%),linear-gradient(180deg,#07111f_0%,#081323_45%,#050b14_100%)]" />

        <TransactionForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            triggerRefresh();
          }}
        />

        <div className="relative flex min-h-screen">
          <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#081321]/90 px-5 py-6 backdrop-blur-xl">
            <div className="mb-10 flex items-center gap-3 px-1">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25">
                <ChartNoAxesColumnIncreasing className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Finan<span className="text-blue-500">Control</span>
              </h1>
            </div>

            <nav className="flex-1 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSearchInput('');
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-600/20'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-white/5 hover:text-red-600 dark:hover:text-red-300"
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </button>
          </aside>

          <main className="flex-1 pb-24 lg:pb-10">
            <div className="sticky top-0 z-30 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#07111f]/80 px-4 py-4 backdrop-blur-xl md:px-8 lg:px-10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 lg:hidden">
                  <button className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300">
                    <Menu className="h-5 w-5" />
                  </button>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    Finan<span className="text-blue-500">Control</span>
                  </h1>
                </div>

                <label className="relative hidden w-full max-w-md md:block">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    className="h-12 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828] pl-12 pr-4 text-sm text-slate-800 dark:text-slate-200 outline-none transition focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
                    placeholder="Buscar transações, categorias, metas..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setSearchInput('');
                        setSearchQuery('');
                      }
                    }}
                  />
                  {searchQuery.trim() !== '' && (
                    <div className="absolute left-0 right-0 mt-2 z-50 rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0f1a2a] p-4 shadow-2xl max-h-[400px] overflow-y-auto">
                      {isSearching ? (
                        <div className="flex items-center justify-center py-6 text-sm text-slate-400">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-400 mr-2" />
                          Buscando...
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {searchResults.goals.length > 0 && (
                            <div>
                              <h5 className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-2">Metas</h5>
                              <div className="space-y-1">
                                {searchResults.goals.map((g: any) => (
                                  <div 
                                    key={g.id} 
                                    onClick={() => {
                                      setActiveTab('goals');
                                      setSearchInput('');
                                      setSearchQuery('');
                                    }}
                                    className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                                  >
                                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{g.name}</span>
                                    <span className="text-[11px] text-slate-500">R$ {g.currentAmount} / R$ {g.targetAmount}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {searchResults.categories.length > 0 && (
                            <div>
                              <h5 className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Categorias</h5>
                              <div className="space-y-1">
                                {searchResults.categories.map((c: any) => (
                                  <div 
                                    key={c.id} 
                                    onClick={() => {
                                      setActiveTab('categories');
                                      setSearchInput('');
                                      setSearchQuery('');
                                    }}
                                    className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                                  >
                                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{c.name}</span>
                                    <span className="text-[10px] rounded px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">{c.budgetRuleType}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {searchResults.transactions.length > 0 && (
                            <div>
                              <h5 className="text-[11px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-2">Transações</h5>
                              <div className="space-y-1">
                                {searchResults.transactions.map((t: any) => (
                                  <div 
                                    key={t.id} 
                                    onClick={() => {
                                      setActiveTab('transactions');
                                      setSearchInput('');
                                      setSearchQuery('');
                                    }}
                                    className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                                  >
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{t.description}</span>
                                      <span className="text-[10px] text-slate-500">{t.date}</span>
                                    </div>
                                    <span className={`text-xs font-semibold ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                                      {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {searchResults.goals.length === 0 && searchResults.categories.length === 0 && searchResults.transactions.length === 0 && (
                            <div className="text-center py-6 text-xs text-slate-500">
                              Nenhum resultado encontrado.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </label>

                <div className="ml-auto flex items-center gap-3">
                  <button 
                    onClick={() => updateUserPreferences(theme === 'dark' ? 'light' : 'dark', currency, userNotifications)}
                    className="hidden h-11 w-11 place-items-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 transition hover:text-black dark:hover:text-white md:grid"
                  >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>

                  {/* NOTIFICATION DROP-DOWN */}
                  <div className="relative">
                    <button 
                      onClick={() => {
                        setIsNotificationOpen(!isNotificationOpen);
                        setIsUserMenuOpen(false);
                      }}
                      className="relative hidden h-11 w-11 place-items-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 transition hover:text-black dark:hover:text-white md:grid"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute right-2 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {isNotificationOpen && (
                      <div className="absolute right-0 mt-2 z-55 w-80 rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0f1a2a] p-4 shadow-2xl animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2 mb-2">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Notificações</h4>
                          {unreadCount > 0 && (
                            <button 
                              onClick={markAllNotificationsAsRead}
                              className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                              Marcar como lidas
                            </button>
                          )}
                        </div>
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-4">Nenhuma notificação.</p>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                            {notifications.map((n) => (
                              <div 
                                key={n.id} 
                                onClick={() => markNotificationAsRead(n.id)}
                                className={`pt-2 flex flex-col cursor-pointer transition ${n.read ? 'opacity-40' : 'opacity-100 hover:bg-slate-50 dark:hover:bg-white/5 rounded px-1.5 py-1'}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`h-1.5 w-1.5 rounded-full ${n.read ? 'bg-transparent' : 'bg-blue-500'}`} />
                                  <span className="text-[10px] text-slate-500">{n.time}</span>
                                </div>
                                <p className="text-xs text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">{n.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {notifications.length > 0 && (
                          <div className="mt-3 border-t border-slate-100 dark:border-white/5 pt-2 flex justify-center">
                            <button 
                              onClick={clearNotifications}
                              className="text-[10px] text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-semibold"
                            >
                              Limpar todas
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* USER MENU DROP-DOWN */}
                  <div className="relative">
                    <div 
                      onClick={() => {
                        setIsUserMenuOpen(!isUserMenuOpen);
                        setIsNotificationOpen(false);
                      }}
                      className="hidden items-center gap-3 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-1 pl-1 pr-3 md:flex cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <div className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${user.avatarColor || 'from-amber-200 to-orange-500'} text-slate-950 font-bold text-xs`}>
                        {userInitial || <User className="h-5 w-5" />}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.nome || 'Usuário'}</span>
                    </div>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 z-55 w-48 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0f1a2a] p-2 shadow-2xl animate-in fade-in duration-200">
                        <button
                          onClick={() => {
                            setActiveTab('settings');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <User className="h-4 w-4 text-blue-500" />
                          <span>Meu Perfil</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('settings');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <Settings className="h-4 w-4 text-indigo-500" />
                          <span>Configurações</span>
                        </button>
                        <hr className="border-slate-100 dark:border-white/5 my-1" />
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sair (Logout)</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 sm:flex"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Nova transação</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 lg:px-10">
              {activeTab === 'dashboard' ? (
                <Dashboard theme={theme} refreshTrigger={refreshTrigger} userName={user.nome} />
              ) : activeTab === 'transactions' ? (
                <TransactionList refreshTrigger={refreshTrigger} globalSearch={searchQuery} />
              ) : activeTab === 'reports' ? (
                <Reports refreshTrigger={refreshTrigger} />
              ) : activeTab === 'categories' ? (
                <CategoriesPage searchQuery={searchQuery} />
              ) : activeTab === 'goals' ? (
                <GoalsPage searchQuery={searchQuery} />
              ) : activeTab === 'cards' ? (
                <CardsPage searchQuery={searchQuery} />
              ) : (
                <SettingsPage />
              )}
            </div>
          </main>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="fixed bottom-8 left-1/2 z-40 grid h-16 w-16 -translate-x-1/2 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 text-white shadow-2xl shadow-blue-600/40 lg:hidden"
        >
          <Plus className="h-7 w-7" />
        </button>

        <div className="fixed bottom-0 left-0 z-30 grid w-full grid-cols-5 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#081321]/95 px-4 pb-3 pt-2 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 text-[11px] ${activeTab === 'dashboard' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <Home className="h-5 w-5" />
            <span>Início</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center gap-1 text-[11px] ${activeTab === 'transactions' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <ReceiptText className="h-5 w-5" />
            <span>Transações</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center gap-1 text-[11px] ${activeTab === 'reports' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <ChartNoAxesColumnIncreasing className="h-5 w-5" />
            <span>Relatórios</span>
          </button>
          <button 
            onClick={() => setActiveTab('goals')}
            className={`flex flex-col items-center gap-1 text-[11px] ${activeTab === 'goals' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <Target className="h-5 w-5" />
            <span>Metas</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 text-[11px] ${activeTab === 'settings' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <User className="h-5 w-5" />
            <span>Perfil</span>
          </button>
        </div>
      </div>
    </MesProvider>
  );
}

export default App;
