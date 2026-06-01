import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Wallet, Eye, EyeOff, UserPlus, LogIn, AlertCircle, MailCheck, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase.js';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode]         = useState('login'); // 'login' | 'register' | 'confirm'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [resent, setResent]     = useState(false);

  const isRegister = mode === 'register';

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (isRegister && password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const { needsConfirmation } = await register(email, password);
        if (needsConfirmation) setMode('confirm');
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResent(false);
    await supabase.auth.resend({ type: 'signup', email });
    setResent(true);
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
    setPassword('');
    setConfirm('');
  };

  // ── Pantalla de confirmación de email ──────────────────────────────────────
  if (mode === 'confirm') {
    return (
      <div className="min-h-screen min-h-dvh bg-black flex flex-col items-center justify-center px-5 pt-safe">
        <div className="w-full max-w-sm flex flex-col items-center gap-8 text-center">

          {/* Icono animado con anillos */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-32 h-32 rounded-full animate-ping opacity-10"
              style={{ border: '1px solid #00d4ff' }} />
            <div className="absolute w-40 h-40 rounded-full animate-ping opacity-5"
              style={{ border: '1px solid #00d4ff', animationDelay: '0.4s' }} />
            <div
              className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{
                background: 'rgba(0,212,255,0.07)',
                border: '1px solid rgba(0,212,255,0.3)',
                boxShadow: '0 0 40px rgba(0,212,255,0.15), 0 0 80px rgba(0,212,255,0.06)',
              }}
            >
              <MailCheck size={42} style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 14px #00d4ffcc)' }} />
            </div>
          </div>

          {/* Título */}
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-white/90 text-lg font-light tracking-[0.25em] uppercase">
              Revisa tu email
            </h1>
            <div className="w-16 h-px" style={{ background: 'linear-gradient(to right, transparent, #00d4ff88, transparent)' }} />
            <p className="text-white/40 text-sm leading-relaxed">
              Hemos enviado un enlace de verificación a
            </p>
            <span
              className="text-sm font-light px-4 py-1.5 rounded-full"
              style={{
                color: '#00d4ff',
                background: 'rgba(0,212,255,0.07)',
                border: '1px solid rgba(0,212,255,0.2)',
                textShadow: '0 0 10px rgba(0,212,255,0.5)',
              }}
            >
              {email}
            </span>
          </div>

          {/* Pasos */}
          <div className="w-full bg-dark-700 border border-white/[0.06] rounded-2xl p-5">
            <p className="text-white/25 text-[10px] tracking-[0.2em] uppercase mb-4 text-left">Pasos a seguir</p>
            <div className="flex flex-col gap-3">
              {[
                { emoji: '📬', text: 'Abre el email que acabas de recibir' },
                { emoji: '🔗', text: 'Pulsa el botón "Confirmar email"' },
                { emoji: '✅', text: 'Vuelve aquí e inicia sesión' },
              ].map(({ emoji, text }, i) => (
                <div key={i} className="flex items-center gap-3 text-left">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                    style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}
                  >
                    {emoji}
                  </div>
                  <p className="text-white/55 text-xs">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reenviar */}
          <button
            onClick={handleResend}
            disabled={resent}
            className="flex items-center gap-2 text-xs transition-colors disabled:opacity-40"
            style={{ color: resent ? '#00ff88' : 'rgba(255,255,255,0.3)' }}
          >
            <RefreshCw size={12} className={resent ? '' : 'opacity-60'} />
            {resent ? '✓ Email reenviado' : '¿No lo recibes? · Reenviar email'}
          </button>

          {/* Volver */}
          <button
            onClick={() => { setMode('login'); setPassword(''); setConfirm(''); }}
            className="w-full py-3 rounded-xl border text-xs tracking-widest font-light transition-all duration-200 active:scale-[0.98]"
            style={{
              borderColor: 'rgba(0,255,136,0.25)',
              background: 'rgba(0,255,136,0.04)',
              color: '#00ff88',
            }}
          >
            VOLVER AL INICIO DE SESIÓN
          </button>

        </div>
      </div>
    );
  }

  // ── Login / Register ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen min-h-dvh bg-black flex flex-col items-center justify-center px-5 pt-safe">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center border border-neon-green/20"
          style={{ background: 'rgba(0,255,136,0.05)', boxShadow: '0 0 30px rgba(0,255,136,0.08)' }}
        >
          <Wallet size={28} style={{ color: '#00ff88', filter: 'drop-shadow(0 0 8px #00ff88aa)' }} />
        </div>
        <div className="text-center">
          <h1 className="text-base tracking-[0.3em] font-light text-white/85">GASTOLENS</h1>
          <p className="text-[10px] text-white/25 tracking-wider mt-0.5">Control financiero personal</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-dark-700 border border-white/[0.07] rounded-2xl p-6">
        <h2 className="text-white/70 text-sm font-light tracking-wider mb-6">
          {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-white/30 text-[10px] tracking-widest uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              required
              className="bg-dark-600 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/85 placeholder-white/20 focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/10 transition-all"
              style={{ caretColor: '#00d4ff' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-white/30 text-[10px] tracking-widest uppercase">Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
                className="w-full bg-dark-600 border border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-sm text-white/85 placeholder-white/20 focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/10 transition-all"
                style={{ caretColor: '#00d4ff' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div className="flex flex-col gap-1.5">
              <label className="text-white/30 text-[10px] tracking-widest uppercase">Confirmar contraseña</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                required
                className="bg-dark-600 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/85 placeholder-white/20 focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/10 transition-all"
                style={{ caretColor: '#00d4ff' }}
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/5 border border-red-500/20 rounded-xl animate-fade-in">
              <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-xs">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 mt-1 rounded-xl border text-sm font-light tracking-wider transition-all duration-200 active:scale-[0.98] disabled:opacity-40"
            style={{ borderColor: 'rgba(0,212,255,0.35)', background: 'rgba(0,212,255,0.06)', color: '#00d4ff' }}
          >
            {loading
              ? <span className="w-4 h-4 border border-neon-cyan/40 border-t-neon-cyan rounded-full animate-spin" />
              : isRegister
                ? <><UserPlus size={14} /> CREAR CUENTA</>
                : <><LogIn size={14} /> ENTRAR</>
            }
          </button>
        </form>

        <div className="flex items-center justify-center mt-5 gap-1.5">
          <span className="text-white/25 text-xs">
            {isRegister ? '¿Ya tienes cuenta?' : '¿Primera vez?'}
          </span>
          <button onClick={switchMode} className="text-xs tracking-wider transition-colors" style={{ color: '#00ff88' }}>
            {isRegister ? 'Inicia sesión' : 'Crea una cuenta'}
          </button>
        </div>
      </div>

      <p className="text-white/15 text-[10px] tracking-wider mt-8 text-center max-w-xs">
        Tus datos se guardan de forma segura y privada.
      </p>
    </div>
  );
}
