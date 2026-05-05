import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, Activity, Target, Menu, LayoutDashboard, CreditCard, LogOut, Plus } from 'lucide-react';
import { dashboardAPI } from './services/api';
import { TransactionModal } from './components/TransactionModal';
import { TransactionList } from './components/TransactionList';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6'];

function App() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions'>('dashboard');

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getSummary(1); // User 1 for MVP
      
      const ruleMap = data.rule503020 || { essential: 0, wants: 0, savings: 0 };
      const ruleArray = [
        { name: 'Essenciais', value: parseFloat(ruleMap.essential?.toFixed(1)) || 0 },
        { name: 'Lazer', value: parseFloat(ruleMap.wants?.toFixed(1)) || 0 },
        { name: 'Poupança', value: parseFloat(ruleMap.savings?.toFixed(1)) || 0 },
      ];
      
      data.rule503020Array = ruleArray;
      setSummary(data);
    } catch (error) {
      console.error("Erro ao buscar dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
        fetchSummary();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
            if (activeTab === 'dashboard') fetchSummary();
            // If on transactions tab, it's cool if they handle their own refetch or we just switch
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
          <div>
            <h2 className="text-3xl font-semibold">Olá, Usuário 👋</h2>
            <p className="text-slate-400 mt-1">Aqui está o seu {activeTab === 'dashboard' ? 'resumo financeiro' : 'extrato detalhado'}.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="hidden sm:flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Transação</span>
          </button>
        </header>

        {activeTab === 'dashboard' && (
            loading ? (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
            ) : summary ? (
            <>
                {/* Top Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 font-medium">Saldo Atual</h3>
                    <Wallet className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-3xl font-bold">R$ {summary.balance?.toFixed(2) || '0.00'}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 font-medium">Receitas (Mês)</h3>
                    <Activity className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-3xl font-bold text-emerald-400">+R$ {summary.incomeThisMonth?.toFixed(2) || '0.00'}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 font-medium">Despesas (Mês)</h3>
                    <Wallet className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-3xl font-bold text-red-400">-R$ {summary.expensesThisMonth?.toFixed(2) || '0.00'}</p>
                </div>
                </div>

                {/* Charts & 50-30-20 Rule */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-6 flex justify-between items-center">
                    Regra 50-30-20
                    <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded-md">Consumo do Mês</span>
                    </h3>
                    <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={summary.rule503020Array}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {summary.rule503020Array.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
                            itemStyle={{ color: '#f1f5f9' }}
                        />
                        </PieChart>
                    </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center space-x-6 mt-4">
                    {summary.rule503020Array.map((entry: any, index: number) => {
                        const isWarning = entry.name === 'Essenciais' && entry.value > 50;
                        return (
                            <div key={index} className="flex flex-col items-center">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                <span className="text-sm font-medium text-slate-200">{entry.name}</span>
                            </div>
                            <span className={`text-sm mt-1 ${isWarning ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                                {entry.value}%
                            </span>
                            </div>
                        )
                    })}
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-6">Dicas Inteligentes</h3>
                    <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 hover:bg-slate-800/50 rounded-lg transition-colors border border-dashed border-slate-700/50">
                        <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                            💡
                        </div>
                        <div>
                            <p className="font-medium text-slate-300">As parcelas cadastradas através do modal já aparecem automaticamente no seus próximos meses.</p>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </>
            ) : (
            <div className="flex h-64 items-center justify-center text-slate-400">
                Nenhum dado financeiro encontrado. Comece adicionando transações.
            </div>
            )
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
                <TransactionList userId={1} />
            </div>
        )}

      </main>

      {/* Mobile Fab */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20 flex items-center justify-center text-slate-950 z-40"
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
  );
}

export default App;
