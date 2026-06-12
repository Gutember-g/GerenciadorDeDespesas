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
import { authAPI } from './services/api';

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
  interface UserProfile {
    nome?: string;
    email?: string;
    avatarColor?: string;
  }

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Global search & dropdown states
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Real system notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Aviso de limite: seus gastos em Desejos atingiram 85% do limite.', type: 'warning', read: false, time: 'Há 10 min' },
    { id: 2, text: 'Vencimento de fatura: sua fatura XP Visa vence em 3 dias.', type: 'info', read: false, time: 'Há 1 hora' },
    { id: 3, text: 'Meta atingida! Parabéns, você atingiu a meta Reserva de Emergência.', type: 'success', read: false, time: 'Há 2 horas' }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    if (!isNotificationOpen && !isUserMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        setIsNotificationOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isNotificationOpen, isUserMenuOpen]);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
      setActiveTab('dashboard');
    }
  };

  if (!user) {
    return <LoginPage onLogin={(loggedUser) => setUser({ ...loggedUser, avatarColor: 'from-amber-200 to-orange-500' })} />;
  }

  return (
    <MesProvider>
      <div className="min-h-screen overflow-x-hidden bg-[#07111f] text-slate-100 font-sans">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(55,138,221,0.18),transparent_28%),radial-gradient(circle_at_78%_8%,rgba(139,92,246,0.14),transparent_24%),linear-gradient(180deg,#07111f_0%,#081323_45%,#050b14_100%)]" />

        <TransactionForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            triggerRefresh();
            setActiveTab('dashboard');
          }}
        />

        <div className="relative flex min-h-screen">
          <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-white/10 bg-[#081321]/90 px-5 py-6 backdrop-blur-xl">
            <div className="mb-10 flex items-center gap-3 px-1">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25">
                <ChartNoAxesColumnIncreasing className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Finan<span className="text-blue-400">Control</span>
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
                      setSearchQuery(''); // reset search when changing tabs
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-600/20'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
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
              className="mt-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-red-300"
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </button>
          </aside>

          <main className="flex-1 pb-24 lg:pb-10">
            <div className="sticky top-0 z-30 border-b border-white/10 bg-[#07111f]/80 px-4 py-4 backdrop-blur-xl md:px-8 lg:px-10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 lg:hidden">
                  <button className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300">
                    <Menu className="h-5 w-5" />
                  </button>
                  <h1 className="text-xl font-bold">
                    Finan<span className="text-blue-400">Control</span>
                  </h1>
                </div>

                <label className="relative hidden w-full max-w-md md:block">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#0d1828] pl-12 pr-4 text-sm text-slate-200 outline-none transition focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
                    placeholder="Buscar transações, categorias, metas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </label>

                <div className="ml-auto flex items-center gap-3">
                  <button className="hidden h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:text-white md:grid">
                    <Moon className="h-5 w-5" />
                  </button>

                  {/* NOTIFICATION DROP-DOWN */}
                  <div className="relative">
                    <button 
                      onClick={() => {
                        setIsNotificationOpen(!isNotificationOpen);
                        setIsUserMenuOpen(false);
                      }}
                      className="relative hidden h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:text-white md:grid"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute right-2 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {isNotificationOpen && (
                      <div className="absolute right-0 mt-2 z-55 w-80 rounded-2xl border border-white/15 bg-[#0f1a2a] p-4 shadow-2xl shadow-black/85 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                          <h4 className="text-sm font-bold text-white">Notificações</h4>
                          {unreadCount > 0 && (
                            <button 
                              onClick={markAllNotificationsAsRead}
                              className="text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Marcar como lidas
                            </button>
                          )}
                        </div>
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-4">Nenhuma notificação.</p>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-white/5">
                            {notifications.map((n) => (
                              <div 
                                key={n.id} 
                                onClick={() => markNotificationAsRead(n.id)}
                                className={`pt-2 flex flex-col cursor-pointer transition ${n.read ? 'opacity-40' : 'opacity-100 hover:bg-white/5 rounded px-1.5 py-1'}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`h-1.5 w-1.5 rounded-full ${n.read ? 'bg-transparent' : 'bg-blue-400'}`} />
                                  <span className="text-[10px] text-slate-500">{n.time}</span>
                                </div>
                                <p className="text-xs text-slate-200 mt-1 leading-relaxed">{n.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {notifications.length > 0 && (
                          <div className="mt-3 border-t border-white/5 pt-2 flex justify-center">
                            <button 
                              onClick={clearNotifications}
                              className="text-[10px] text-red-400 hover:text-red-300 font-semibold"
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
                      className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 md:flex cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${user.avatarColor || 'from-amber-200 to-orange-500'} text-slate-950 font-bold text-xs`}>
                        {user.nome ? user.nome.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                      </div>
                      <span className="text-sm font-medium text-slate-200">{user.nome || 'Usuário'}</span>
                    </div>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 z-55 w-48 rounded-xl border border-white/15 bg-[#0f1a2a] p-2 shadow-2xl shadow-black/80 animate-in fade-in duration-200">
                        <button
                          onClick={() => {
                            setActiveTab('settings');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <User className="h-4 w-4 text-blue-400" />
                          <span>Meu Perfil</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('settings');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <Settings className="h-4 w-4 text-indigo-400" />
                          <span>Configurações</span>
                        </button>
                        <hr className="border-white/5 my-1" />
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
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
                <Dashboard refreshTrigger={refreshTrigger} />
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
                <SettingsPage user={user} onUpdateUser={(updated) => setUser({ ...user, ...updated })} />
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

        <div className="fixed bottom-0 left-0 z-30 grid w-full grid-cols-5 border-t border-white/10 bg-[#081321]/95 px-4 pb-3 pt-2 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 text-[11px] ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-500'}`}
          >
            <Home className="h-5 w-5" />
            <span>Início</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center gap-1 text-[11px] ${activeTab === 'transactions' ? 'text-white' : 'text-slate-500'}`}
          >
            <ReceiptText className="h-5 w-5" />
            <span>Transações</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center gap-1 text-[11px] ${activeTab === 'reports' ? 'text-white' : 'text-slate-500'}`}
          >
            <ChartNoAxesColumnIncreasing className="h-5 w-5" />
            <span>Relatórios</span>
          </button>
          <button 
            onClick={() => setActiveTab('goals')}
            className={`flex flex-col items-center gap-1 text-[11px] ${activeTab === 'goals' ? 'text-white' : 'text-slate-500'}`}
          >
            <Target className="h-5 w-5" />
            <span>Metas</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 text-[11px] ${activeTab === 'settings' ? 'text-white' : 'text-slate-500'}`}
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
