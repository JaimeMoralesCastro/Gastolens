import { useState } from 'react';
import { Wallet, Trash2, LogOut, User, Clock, ShieldCheck, Pencil, Check, X, Sparkles, Eye, EyeOff } from 'lucide-react';
import { displayName, supabase } from './lib/supabase.js';
import Navigation from './components/Navigation.jsx';
import BalanceCards from './components/BalanceCards.jsx';
import ExpenseInput from './components/ExpenseInput.jsx';
import Charts from './components/Charts.jsx';
import ExpenseHistory from './components/ExpenseHistory.jsx';
import ExpenseDetail from './components/ExpenseDetail.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import { useExpenses } from './hooks/useExpenses.js';
import { useAuth } from './contexts/AuthContext.jsx';
import { validateApiKey } from './utils/geminiClassifier.js';
import { CATEGORIES } from './utils/categoryConfig.js';
import { formatDate, formatTime, formatCurrency } from './utils/dateHelpers.js';
import ImportBank from './components/ImportBank.jsx';

export default function App() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [selectedExpense, setSelectedExpense] = useState(null);

  if (!user) return <AuthScreen />;

  return (
    <AppInner
      tab={tab}
      setTab={setTab}
      selectedExpense={selectedExpense}
      setSelectedExpense={setSelectedExpense}
      logout={logout}
      user={user}
    />
  );
}

function AppInner({ tab, setTab, selectedExpense, setSelectedExpense, logout, user }) {
  const { expenses, addExpense, deleteExpense, dbError, todayTotal, weekTotal, monthTotal } = useExpenses(user.id);

  return (
    <div className="min-h-screen min-h-dvh bg-black text-white antialiased">
      <Navigation active={tab} onChange={setTab} />

      {dbError && (
        <div className="lg:ml-56 px-4 pt-safe">
          <div className="max-w-5xl mx-auto mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2">
            <span className="text-red-400 text-xs leading-relaxed">
              ⚠️ <strong>Error de base de datos:</strong> {dbError}
              <br />
              <span className="text-red-400/70">Puede que la tabla de gastos no esté creada en Supabase. Revisa el SQL Editor.</span>
            </span>
          </div>
        </div>
      )}
      <main className="lg:ml-56 pb-24 lg:pb-8 pt-safe">
        {/* Dashboard */}
        {tab === 'dashboard' && (
          <div className="max-w-5xl mx-auto px-4 pt-6 lg:px-8 lg:pt-8">
            <header className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Wallet size={15} style={{ color: '#00ff88' }} />
                  <h1 className="text-sm tracking-[0.25em] font-light text-white/80">GASTOLENS</h1>
                </div>
                <p className="text-[10px] text-white/25 tracking-wider pl-6">Control financiero personal</p>
              </div>
              <span className="text-[10px] text-white/20 tracking-wider hidden sm:block">
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </header>

            <div className="lg:grid lg:grid-cols-5 lg:gap-8">
              <div className="lg:col-span-2 flex flex-col gap-5">
                <BalanceCards today={todayTotal} week={weekTotal} month={monthTotal} />
                <ExpenseInput onAdd={addExpense} />
              </div>
              <div className="lg:col-span-3 mt-5 lg:mt-0">
                <Charts expenses={expenses} />
              </div>
            </div>

            {expenses.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase">Últimos registros</p>
                  <button onClick={() => setTab('history')} className="text-[10px] tracking-wider text-neon-cyan/60 hover:text-neon-cyan transition-colors">
                    VER TODO →
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  {expenses.slice(0, 5).map(e => (
                    <RecentRow key={e.id} expense={e} onDelete={deleteExpense} onSelect={setSelectedExpense} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Historial */}
        {tab === 'history' && (
          <div className="max-w-3xl mx-auto px-4 pt-6 lg:px-8 lg:pt-8">
            <header className="mb-6">
              <h1 className="text-sm tracking-[0.25em] font-light text-white/80">HISTORIAL</h1>
              <p className="text-[10px] text-white/25 tracking-wider mt-0.5">Registro y análisis de gastos</p>
            </header>
            <ExpenseHistory expenses={expenses} onDelete={deleteExpense} onSelect={setSelectedExpense} />
          </div>
        )}

        {/* Perfil */}
        {tab === 'profile' && (
          <ProfileTab user={user} logout={logout} expenses={expenses} addExpense={addExpense} />
        )}
      </main>

      {/* Modal de detalle */}
      {selectedExpense && (
        <ExpenseDetail
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onDelete={id => { deleteExpense(id); setSelectedExpense(null); }}
        />
      )}
    </div>
  );
}

function GeminiKeySection() {
  const [key, setKey]         = useState(localStorage.getItem('gemini_api_key') ?? '');
  const [show, setShow]       = useState(false);
  const [status, setStatus]   = useState(key ? 'saved' : 'idle'); // idle | checking | ok | error | saved
  const [editing, setEditing] = useState(!key);

  const save = async () => {
    const trimmed = key.trim();
    if (!trimmed) return;
    setStatus('checking');
    const ok = await validateApiKey(trimmed);
    if (ok) {
      localStorage.setItem('gemini_api_key', trimmed);
      setStatus('saved');
      setEditing(false);
    } else {
      setStatus('error');
    }
  };

  const remove = () => {
    localStorage.removeItem('gemini_api_key');
    setKey('');
    setStatus('idle');
    setEditing(true);
  };

  return (
    <div className="bg-dark-700 border border-white/[0.06] rounded-xl px-4 py-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={13} style={{ color: '#a855f7' }} />
        <p className="text-white/30 text-[10px] tracking-widest uppercase">Gemini AI — Categorización automática</p>
        {status === 'saved' && !editing && (
          <span className="ml-auto text-[10px] tracking-wider" style={{ color: '#00ff88' }}>● Activo</span>
        )}
      </div>

      {!editing && status === 'saved' ? (
        <div className="flex items-center justify-between">
          <p className="text-white/35 text-xs">API key configurada correctamente</p>
          <button onClick={() => setEditing(true)} className="text-[10px] tracking-wider text-white/25 hover:text-white/60 transition-colors">
            Cambiar
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={key}
              onChange={e => { setKey(e.target.value); setStatus('idle'); }}
              placeholder="AIza..."
              className="w-full bg-dark-600 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-white/25 pr-10"
              style={{ caretColor: '#a855f7', fontFamily: 'monospace' }}
            />
            <button onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60">
              {show ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>
          {status === 'error' && (
            <p className="text-red-400/70 text-[10px]">API key inválida. Comprueba que es correcta en Google AI Studio.</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={!key.trim() || status === 'checking'}
              className="flex-1 py-2 rounded-lg text-[10px] tracking-widest uppercase transition-all disabled:opacity-30"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#a855f7' }}
            >
              {status === 'checking' ? 'Verificando…' : 'Guardar'}
            </button>
            {localStorage.getItem('gemini_api_key') && (
              <button onClick={remove} className="px-3 py-2 rounded-lg border border-red-500/20 text-red-400/50 hover:text-red-400 text-[10px] transition-colors">
                Eliminar
              </button>
            )}
          </div>
          <p className="text-white/15 text-[10px] leading-relaxed">
            Obtén tu API key gratis en <span className="text-white/30">aistudio.google.com</span> → Get API key. Se guarda solo en este dispositivo.
          </p>
        </div>
      )}
    </div>
  );
}

function RecentRow({ expense, onDelete, onSelect }) {
  const { id, description, category, amount, date } = expense;
  const catData = CATEGORIES[category];
  const color = catData?.color ?? '#6b7280';

  return (
    <div
      className="group flex items-center gap-3 bg-dark-700 border border-white/[0.05] hover:border-white/[0.12] rounded-xl px-4 py-3 transition-all duration-200 cursor-pointer active:scale-[0.99]"
      onClick={() => onSelect(expense)}
    >
      <span className="text-lg flex-shrink-0">{catData?.icon ?? '📦'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white/75 text-xs truncate">{description}</p>
        <p className="text-white/25 text-[10px] mt-0.5">{formatDate(date)}</p>
      </div>
      <span className="text-sm font-light tabular-nums flex-shrink-0" style={{ color, textShadow: `0 0 6px ${color}55` }}>
        {formatCurrency(amount)}
      </span>
    </div>
  );
}

function ProfileTab({ user, logout, expenses, addExpense }) {
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName]         = useState('');
  const [savingName, setSavingName]   = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const startEdit = () => {
    setNewName(displayName(user));
    setEditingName(true);
    setNameSuccess(false);
  };

  const saveName = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setSavingName(true);
    await supabase.auth.updateUser({ data: { display_name: trimmed } });
    setSavingName(false);
    setEditingName(false);
    setNameSuccess(true);
    setTimeout(() => setNameSuccess(false), 2500);
  };

  const cancelEdit = () => { setEditingName(false); setNewName(''); };

  return (
    <div className="max-w-md mx-auto px-4 pt-6 lg:px-8 lg:pt-8">
      <header className="mb-6">
        <h1 className="text-sm tracking-[0.25em] font-light text-white/80">PERFIL</h1>
        <p className="text-[10px] text-white/25 tracking-wider mt-0.5">Tu cuenta</p>
      </header>

      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-light"
          style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', color: '#00ff88', textShadow: '0 0 12px rgba(0,255,136,0.6)' }}
        >
          {displayName(user)[0].toUpperCase()}
        </div>
        <div className="flex flex-col items-center gap-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') cancelEdit(); }}
                maxLength={30}
                className="bg-dark-600 border border-neon-cyan/30 rounded-lg px-3 py-1.5 text-sm text-white/85 focus:outline-none focus:border-neon-cyan/60 text-center w-40 transition-all"
                style={{ caretColor: '#00d4ff' }}
              />
              <button
                onClick={saveName}
                disabled={savingName || !newName.trim()}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-neon-green/30 text-neon-green/70 hover:text-neon-green hover:border-neon-green/50 disabled:opacity-30 transition-colors"
              >
                {savingName ? <span className="w-3 h-3 border border-neon-green/40 border-t-neon-green rounded-full animate-spin" /> : <Check size={12} />}
              </button>
              <button
                onClick={cancelEdit}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-white/30 hover:text-white/60 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-white/85 text-base font-light tracking-wide">{displayName(user)}</p>
              <button
                onClick={startEdit}
                className="text-white/20 hover:text-white/50 transition-colors"
                title="Cambiar nombre de usuario"
              >
                <Pencil size={12} />
              </button>
            </div>
          )}
          {nameSuccess && (
            <p className="text-[10px] tracking-wider animate-fade-in" style={{ color: '#00ff88' }}>✓ Nombre actualizado</p>
          )}
          <p className="text-white/25 text-[10px] tracking-wider">{user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-dark-700 border border-white/[0.06] rounded-xl p-4">
          <p className="text-white/30 text-[10px] tracking-widest uppercase mb-1.5">Gastos totales</p>
          <p className="text-lg font-light tabular-nums" style={{ color: '#00ff88', textShadow: '0 0 10px rgba(0,255,136,0.4)' }}>
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="bg-dark-700 border border-white/[0.06] rounded-xl p-4">
          <p className="text-white/30 text-[10px] tracking-widest uppercase mb-1.5">Registros</p>
          <p className="text-lg font-light tabular-nums" style={{ color: '#00d4ff', textShadow: '0 0 10px rgba(0,212,255,0.4)' }}>
            {expenses.length}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-dark-700 border border-white/[0.06] rounded-xl divide-y divide-white/[0.05] mb-4">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Clock size={14} className="text-white/25 flex-shrink-0" />
          <div>
            <p className="text-white/35 text-[10px] tracking-wider uppercase">Cuenta creada</p>
            <p className="text-white/65 text-xs mt-0.5">{joinDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <ShieldCheck size={14} className="text-white/25 flex-shrink-0" />
          <div>
            <p className="text-white/35 text-[10px] tracking-wider uppercase">Privacidad</p>
            <p className="text-white/65 text-xs mt-0.5">Datos cifrados y guardados en la nube</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <User size={14} className="text-white/25 flex-shrink-0" />
          <div>
            <p className="text-white/35 text-[10px] tracking-wider uppercase">Tipo de cuenta</p>
            <p className="text-white/65 text-xs mt-0.5">Cloud · Sincronización activa</p>
          </div>
        </div>
      </div>

      {/* Gemini AI */}
      <GeminiKeySection />

      {/* Importar extracto */}
      <div className="bg-dark-700 border border-white/[0.06] rounded-xl px-4 py-4 mb-4">
        <p className="text-white/30 text-[10px] tracking-widest uppercase mb-3">Importar extracto bancario</p>
        <ImportBank onImport={addExpense} existingExpenses={expenses} />
      </div>

      {/* Próximamente */}
      <div className="bg-dark-700 border border-white/[0.06] rounded-xl px-4 py-4 mb-6">
        <p className="text-white/20 text-[10px] tracking-widest uppercase mb-2">Próximamente</p>
        <div className="flex flex-col gap-1.5">
          {['Exportar datos a CSV/PDF', 'Presupuestos por categoría', 'Sincronización en la nube', 'Metas de ahorro'].map(item => (
            <div key={item} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-white/15" />
              <span className="text-white/25 text-xs">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400/70 hover:text-red-400 hover:border-red-500/35 hover:bg-red-500/8 transition-all duration-200 active:scale-[0.98] text-sm tracking-wider"
      >
        <LogOut size={14} />
        Cerrar sesión
      </button>
    </div>
  );
}
