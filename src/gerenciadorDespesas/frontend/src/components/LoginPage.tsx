import { useState } from 'react';
import type { FormEvent } from 'react';
import { ChartNoAxesColumnIncreasing, Loader2, Lock, Mail } from 'lucide-react';
import { authAPI } from '../services/api';

interface LoginPageProps {
  onLogin: (user: { nome?: string; email?: string }) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('admin@gerenciasaas.com');
  const [senha, setSenha] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await authAPI.login(email, senha);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#07111f] px-4 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(55,138,221,0.22),transparent_28%),radial-gradient(circle_at_78%_8%,rgba(139,92,246,0.18),transparent_24%),linear-gradient(180deg,#07111f_0%,#081323_45%,#050b14_100%)]" />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1828]/90 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl"
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25">
            <ChartNoAxesColumnIncreasing className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Finan<span className="text-blue-400">Control</span>
            </h1>
            <p className="text-sm text-slate-400">Entre para acessar seu painel.</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">E-mail</span>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#07111f] pl-12 pr-4 text-sm text-white outline-none transition focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Senha</span>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#07111f] pl-12 pr-4 text-sm text-white outline-none transition focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10"
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

        <p className="mt-5 text-center text-xs text-slate-500">
          Usuário de teste: admin@gerenciasaas.com / admin123
        </p>
      </form>
    </div>
  );
}
