import { LayoutDashboard, History, User, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { displayName } from '../lib/supabase.js';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'history', label: 'Historial', Icon: History },
  { id: 'profile', label: 'Perfil', Icon: User },
];

export default function Navigation({ active, onChange }) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-56 bg-dark-700 border-r border-white/[0.06] z-40 px-4 py-8">
        <div className="mb-10 px-2">
          <div className="flex items-center gap-2.5 mb-1">
            <Wallet size={18} style={{ color: '#00ff88' }} />
            <span className="text-white font-light tracking-[0.2em] text-sm">GASTOLENS</span>
          </div>
          <p className="text-white/25 text-[10px] tracking-wider pl-7">Control financiero</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-white/[0.06] text-white'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
                }`}
              >
                <Icon size={16} style={isActive ? { color: '#00ff88', filter: 'drop-shadow(0 0 6px #00ff88aa)' } : {}} />
                <span className={isActive ? 'text-white/90' : ''}>{label}</span>
                {isActive && <span className="ml-auto w-1 h-1 rounded-full bg-neon-green shadow-neon-green" />}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        {user && (
          <div className="border-t border-white/[0.06] pt-4 mt-4">
            <div className="flex items-center gap-2.5 px-2 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium flex-shrink-0"
                style={{ background: 'rgba(0,255,136,0.12)', color: '#00ff88' }}
              >
                {displayName(user)[0].toUpperCase()}
              </div>
              <span className="text-white/60 text-xs truncate">{displayName(user)}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 text-xs"
            >
              <LogOut size={13} />
              Cerrar sesión
            </button>
          </div>
        )}
      </aside>

      {/* Mobile bottom bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-700/95 backdrop-blur border-t border-white/[0.06] safe-area-inset-bottom">
        <div className="flex">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all duration-200 active:scale-95"
              >
                <Icon
                  size={20}
                  style={
                    isActive
                      ? { color: '#00ff88', filter: 'drop-shadow(0 0 5px #00ff88cc)' }
                      : { color: 'rgba(255,255,255,0.35)' }
                  }
                />
                <span className={`text-[10px] tracking-wider font-light ${isActive ? 'text-white/80' : 'text-white/30'}`}>
                  {label.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
