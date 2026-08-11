import React, { useState, useEffect } from 'react';
import { useAuthSettings } from '../contexts/AuthSettingsContext.tsx';
import { 
  Settings as SettingsIcon, 
  Check, 
  Bell, 
  Globe 
} from 'lucide-react';

export function SettingsPage() {
  const { 
    theme: globalTheme, 
    currency: globalCurrency, 
    notifications: globalNotifications, 
    updateUserPreferences 
  } = useAuthSettings();

  // Preference state
  const [currency, setCurrency] = useState<'BRL' | 'USD' | 'EUR'>(globalCurrency);
  const [theme, setTheme] = useState<'light' | 'dark'>(globalTheme);
  const [notifyEmail, setNotifyEmail] = useState(globalNotifications.email);
  const [notifyPush, setNotifyPush] = useState(globalNotifications.push);
  const [prefSuccess, setPrefSuccess] = useState(false);

  useEffect(() => {
    setCurrency(globalCurrency);
    setTheme(globalTheme);
    setNotifyEmail(globalNotifications.email);
    setNotifyPush(globalNotifications.push);
  }, [globalCurrency, globalTheme, globalNotifications]);

  const handlePrefSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      updateUserPreferences(theme as any, currency as any, { email: notifyEmail, push: notifyPush });
      setPrefSuccess(true);
      setTimeout(() => setPrefSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-300">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Configurações</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Personalize as preferências globais do aplicativo, idioma, moedas e notificações.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Side menu guide */}
        <div className="space-y-2">
          <a href="#preferencias" className="flex items-center gap-3 rounded-xl bg-slate-100 dark:bg-white/5 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white transition hover:bg-slate-200 dark:hover:bg-white/10">
            <SettingsIcon className="h-4 w-4 text-indigo-650 dark:text-indigo-400" />
            <span>Preferências Gerais</span>
          </a>
        </div>

        {/* Form sections */}
        <div className="md:col-span-2 space-y-8">
          {/* PREFERENCES SECTION */}
          <section id="preferencias" className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/60 p-6 shadow-xl backdrop-blur-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              <span>Preferências</span>
            </h3>

            {prefSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" />
                <span>Preferências salvas com sucesso!</span>
              </div>
            )}

            <form onSubmit={handlePrefSave} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span>Moeda Padrão</span>
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as 'BRL' | 'USD' | 'EUR')}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-55 dark:bg-[#07111f] px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="BRL">Real Brasileiro (R$)</option>
                    <option value="USD">Dólar Americano ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tema da Interface</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-55 dark:bg-[#07111f] px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="dark">Tema Escuro (Recomendado)</option>
                    <option value="light">Tema Claro</option>
                  </select>
                </div>
              </div>

              {/* Notification preferences */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                  <Bell className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span>Notificações por canal</span>
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-650 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-500 focus:ring-blue-500 accent-blue-500 w-4 h-4"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Receber alertas de vencimento por e-mail</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyPush}
                      onChange={(e) => setNotifyPush(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-650 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-500 focus:ring-blue-500 accent-blue-500 w-4 h-4"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Ativar notificações do navegador (Push)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:brightness-110"
                >
                  Salvar Preferências
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
