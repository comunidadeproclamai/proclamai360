import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
// Em ambiente seguro de backend idealmente usamos a Service Role Key, 
// mas para simplicidade manteremos a key atual se service role não estiver disponível.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('Variáveis do Supabase ausentes no backend.');
}

export const supabaseServer = createClient(supabaseUrl || '', serviceRoleKey || '', {
  auth: { persistSession: false }
});
