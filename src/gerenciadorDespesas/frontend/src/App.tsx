import { useState } from 'react';
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
import { LoginPage } from './components/LoginPage';
import { MesProvider } from './contexts/MesContext';
import { authAPI } from './services/api';

type ActiveTab = 'dashboard' | 'transactions';

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions' as const, label: 'Transações', icon: ReceiptText },
];

const disabledNavItems = [
  { label: 'Categorias', icon: WalletCards },
  { label: 'Metas', icon: Target },
  { label: 'Cartões', icon: CreditCard },
  { label: 'Relatórios', icon: ChartNoAxesColumnIncreasing },
  { label: 'Configurações', icon: Settings },
];

function App() {
  const [user, setUser] = useState<{ nome?: string; email?: string } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    return <LoginPage onLogin={setUser} />;
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
                    onClick={() => setActiveTab(item.id)}
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

              {disabledNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 rounded-xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 to-blue-500/10 p-4">
              <div className="mb-4 grid h-9 w-9 place-items-center rounded-full bg-amber-400/20 text-amber-300">
                <WalletCards className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">Seja Premium</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Tenha relatórios avançados e metas inteligentes.
              </p>
              <button className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20">
                Assinar agora
              </button>
            </div>

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
                    placeholder="Buscar transações, categorias..."
                  />
                </label>

                <div className="ml-auto flex items-center gap-3">
                  <button className="hidden h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:text-white md:grid">
                    <Moon className="h-5 w-5" />
                  </button>
                  <button className="relative hidden h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:text-white md:grid">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      3
                    </span>
                  </button>
                  <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 md:flex">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-200 to-orange-500 text-slate-950">
                      <User className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-200">{user.nome || 'Usuário'}</span>
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
              ) : (
                <TransactionList refreshTrigger={refreshTrigger} />
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

        <div className="fixed bottom-0 left-0 z-30 grid w-full grid-cols-4 border-t border-white/10 bg-[#081321]/95 px-4 pb-3 pt-2 backdrop-blur-xl lg:hidden">
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
          <button className="flex flex-col items-center gap-1 text-[11px] text-slate-500">
            <Target className="h-5 w-5" />
            <span>Metas</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[11px] text-slate-500">
            <User className="h-5 w-5" />
            <span>Perfil</span>
          </button>
        </div>
      </div>
    </MesProvider>
  );
}

export default App;
