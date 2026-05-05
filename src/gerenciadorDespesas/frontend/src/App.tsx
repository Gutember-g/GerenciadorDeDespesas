import { useState } from 'react';
import { Menu, Target, LayoutDashboard, CreditCard, LogOut, Plus } from 'lucide-react';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Dashboard } from './components/Dashboard';
import { MesProvider } from './contexts/MesContext';

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions'>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <MesProvider>
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans overflow-x-hidden">
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
            triggerRefresh();
            setActiveTab('dashboard');
        }} 
      />

      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">GerenciaSaaS</h1>
        <Menu className="w-6 h-6 text-slate-400" />
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen p-6 sticky top-0">
        <h1 className="text-2xl font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">GerenciaSaaS</h1>
        <nav className="flex-1 space-y-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 font-medium p-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'text-emerald-400 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`w-full flex items-center space-x-3 font-medium p-2 rounded-lg transition-colors ${activeTab === 'transactions' ? 'text-emerald-400 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Transações</span>
          </button>
          <button className="w-full flex items-center space-x-3 text-slate-400 hover:text-slate-200 transition-colors p-2 rounded-lg">
            <Target className="w-5 h-5" />
            <span>Metas</span>
          </button>
        </nav>
        <div className="pt-6 border-t border-slate-800">
          <button className="w-full flex items-center space-x-3 text-slate-400 hover:text-red-400 transition-colors p-2 rounded-lg">
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <header className="mb-8 flex justify-between items-center">
          <div className="hidden sm:block">
            <h2 className="text-2xl font-semibold">Olá, Usuário 👋</h2>
            <p className="text-slate-400 mt-1">Bem-vindo ao seu painel financeiro.</p>
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-emerald-500/20 ml-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Transação</span>
          </button>
        </header>

        {activeTab === 'dashboard' ? (
           <Dashboard refreshTrigger={refreshTrigger} />
        ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2">
                <TransactionList refreshTrigger={refreshTrigger} />
            </div>
        )}

      </main>

      {/* Mobile Fab */}
      <button 
        onClick={() => setIsFormOpen(true)}
        className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20 flex items-center justify-center text-slate-950 z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-30">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center ${activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-500'}`}
          >
              <LayoutDashboard className="w-5 h-5 mb-1" />
              <span className="text-[10px]">Início</span>
          </button>
          <button 
             onClick={() => setActiveTab('transactions')}
             className={`flex flex-col items-center ${activeTab === 'transactions' ? 'text-emerald-400' : 'text-slate-500'}`}
          >
              <CreditCard className="w-5 h-5 mb-1" />
              <span className="text-[10px]">Extrato</span>
          </button>
          <button className={`flex flex-col items-center text-slate-500`}>
              <Target className="w-5 h-5 mb-1" />
              <span className="text-[10px]">Metas</span>
          </button>
      </div>

    </div>
    </MesProvider>
  );
}

export default App;
