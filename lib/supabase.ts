
import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL e Anon Key são obrigatórios. Verifique suas variáveis de ambiente ou a configuração no arquivo config.ts.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
