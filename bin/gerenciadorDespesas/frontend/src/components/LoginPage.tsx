import { useState } from 'react';
import type { FormEvent } from 'react';
import { ChartNoAxesColumnIncreasing, Loader2, Lock, Mail } from 'lucide-react';
import { useAuthSettings } from '../contexts/AuthSettingsContext.tsx';

export function LoginPage() {
  const { login } = useAuthSettings();
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('financontrol_last_login_email') || 'admin@gerenciasaas.com';
  });
  const [senha, setSenha] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, senha);
      // Salva o email do último login para pré-preencher no próximo
      localStorage.setItem('financontrol_last_login_email', email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-50 dark:bg-[#07111f] px-4 text-slate-800 dark:text-slate-100 transition-colors duration-150">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(55,138,221,0.06),transparent_28%),radial-gradient(circle_at_78%_8%,rgba(139,92,246,0.05),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_45%,#e2e8f0_100%)] dark:bg-[radial-gradient(circle_at_18%_10%,rgba(55,138,221,0.22),transparent_28%),radial-gradient(circle_at_78%_8%,rgba(139,92,246,0.18),transparent_24%),linear-gradient(180deg,#07111f_0%,#081323_45%,#050b14_100%)]" />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0d1828]/90 p-8 shadow-2xl shadow-black/5 dark:shadow-black/30 backdrop-blur-xl"
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25">
            <ChartNoAxesColumnIncreasing className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Finan<span className="text-blue-500 dark:text-blue-400">Control</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Entre para acessar seu painel.</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">E-mail</span>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#07111f] pl-12 pr-4 text-sm text-slate-800 dark:text-white outline-none transition focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Senha</span>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#07111f] pl-12 pr-4 text-sm text-slate-800 dark:text-white outline-none transition focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10"
                required
              />
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
          Usuário de teste: admin@gerenciasaas.com / admin123
        </p>
      </form>
    </div>
  );
}
