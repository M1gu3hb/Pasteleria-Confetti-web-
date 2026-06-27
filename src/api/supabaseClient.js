import { createClient } from '@supabase/supabase-js';

// Web pública de Confetti: MISMO Supabase del POS, con la ANON key + RLS.
// La anon key es pública por diseño (va en el bundle); la seguridad la da la RLS.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Falla temprano y claro (validar en los límites del sistema).
  console.error('[supabase] Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env');
}

// SIN login: la web nunca abre sesión. persistSession:false → siempre anon.
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
