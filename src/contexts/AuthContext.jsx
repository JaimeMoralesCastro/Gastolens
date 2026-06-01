import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { Wallet } from 'lucide-react';

const AuthContext = createContext(null);

const ERROR_MAP = {
  'Invalid login credentials':            'Email o contraseña incorrectos',
  'User already registered':              'Este email ya está registrado',
  'Email not confirmed':                  'Confirma tu email antes de entrar',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
  'Unable to validate email address: invalid format': 'Introduce un email válido',
};

function translateError(msg) {
  for (const [key, val] of Object.entries(ERROR_MAP)) {
    if (msg?.includes(key)) return val;
  }
  return msg ?? 'Ha ocurrido un error';
}

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: 'https://gastolens.vercel.app' },
    });
    if (error) throw new Error(translateError(error.message));
    // Si session es null → Supabase envió el email de confirmación
    return { needsConfirmation: !data.session };
  };

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(translateError(error.message));
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Wallet size={28} style={{ color: '#00ff88', filter: 'drop-shadow(0 0 10px #00ff88aa)' }} />
          <div className="w-5 h-5 border border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
