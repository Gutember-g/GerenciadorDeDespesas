import React, { useState, useEffect } from 'react';
import { useAuthSettings } from '../contexts/AuthSettingsContext.tsx';
import { 
  User as UserIcon, 
  Settings as SettingsIcon, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  Bell, 
  Globe, 
  ShieldAlert
} from 'lucide-react';

export function SettingsPage() {
  const { 
    user, 
    theme: globalTheme, 
    currency: globalCurrency, 
    notifications: globalNotifications, 
    updateUserProfile, 
    updateUserPreferences, 
    changeUserPassword 
  } = useAuthSettings();

  // Profile state
  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || 'from-amber-200 to-orange-500');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Preference state
  const [currency, setCurrency] = useState<'BRL' | 'USD' | 'EUR'>(globalCurrency);
  const [theme, setTheme] = useState<'light' | 'dark'>(globalTheme);
  const [notifyEmail, setNotifyEmail] = useState(globalNotifications.email);
  const [notifyPush, setNotifyPush] = useState(globalNotifications.push);
  const [prefSuccess, setPrefSuccess] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // Sync inputs with global state when user details load
  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
      setAvatarColor(user.avatarColor);
    }
  }, [user]);

  useEffect(() => {
    setCurrency(globalCurrency);
    setTheme(globalTheme);
    setNotifyEmail(globalNotifications.email);
    setNotifyPush(globalNotifications.push);
  }, [globalCurrency, globalTheme, globalNotifications]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    try {
      await updateUserProfile(nome, email, avatarColor);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Erro ao atualizar perfil.');
    }
  };

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

  const handleSecuritySave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityError('Todos os campos de senha são obrigatórios.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('A nova senha e a confirmação não coincidem.');
      return;
    }

    if (newPassword.length < 8) {
      setSecurityError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    try {
      await changeUserPassword(currentPassword, newPassword);
      setSecuritySuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setSecurityError(err instanceof Error ? err.message : 'Erro ao alterar senha. Verifique se a senha atual está correta.');
    }
  };

  const avatarColors = [
    { name: 'Laranja Quente', value: 'from-amber-200 to-orange-500' },
    { name: 'Azul Cósmico', value: 'from-cyan-400 to-blue-600' },
    { name: 'Roxo Elétrico', value: 'from-fuchsia-500 to-purple-800' },
    { name: 'Esmeralda', value: 'from-emerald-400 to-teal-600' },
    { name: 'Fogo Místico', value: 'from-pink-500 to-red-600' }
  ];

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-300">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Configurações</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gerencie suas informações de perfil, preferências de exibição e segurança da sua conta.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Side menu guide */}
        <div className="space-y-2">
          <a href="#perfil" className="flex items-center gap-3 rounded-xl bg-slate-100 dark:bg-white/5 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white transition hover:bg-slate-200 dark:hover:bg-white/10">
            <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Dados do Perfil</span>
          </a>
          <a href="#preferencias" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white">
            <SettingsIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Preferências</span>
          </a>
          <a href="#seguranca" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white">
            <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Segurança da Conta</span>
          </a>
        </div>

        {/* Form sections */}
        <div className="md:col-span-2 space-y-8">
          
          {/* PROFILE SECTION */}
          <section id="perfil" className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/60 p-6 shadow-xl backdrop-blur-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <span>Dados de Perfil</span>
            </h3>

            {profileSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" />
                <span>Perfil atualizado com sucesso!</span>
              </div>
            )}

            {profileError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-650 dark:text-red-300">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className={`grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br ${avatarColor} text-slate-950 font-bold text-2xl shadow-lg`}>
                  {(nome || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estilo do Avatar</label>
                  <div className="flex flex-wrap gap-2">
                    {avatarColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setAvatarColor(color.value)}
                        className={`h-7 w-7 rounded-lg bg-gradient-to-br ${color.value} border-2 transition ${
                          avatarColor === color.value ? 'border-slate-800 dark:border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                  <input
                    required
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#07111f] px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#07111f] px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:brightness-110"
                >
                  Salvar Perfil
                </button>
              </div>
            </form>
          </section>

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
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#07111f] px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
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
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#07111f] px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
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
                      className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-500 focus:ring-blue-500 accent-blue-500 w-4 h-4"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Receber alertas de vencimento por e-mail</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyPush}
                      onChange={(e) => setNotifyPush(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-500 focus:ring-blue-500 accent-blue-500 w-4 h-4"
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

          {/* SECURITY SECTION */}
          <section id="seguranca" className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1828]/60 p-6 shadow-xl backdrop-blur-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              <span>Segurança da Conta</span>
            </h3>

            {securitySuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" />
                <span>Senha alterada com sucesso!</span>
              </div>
            )}

            {securityError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-650 dark:text-red-300">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{securityError}</span>
              </div>
            )}

            <form onSubmit={handleSecuritySave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha Atual</label>
                <div className="relative">
                  <input
                    required
                    type={showPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#07111f] px-4 py-3 pr-10 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nova Senha</label>
                  <input
                    required
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#07111f] px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmar Nova Senha</label>
                  <input
                    required
                    type={showPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#07111f] px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:brightness-110"
                >
                  Alterar Senha
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
