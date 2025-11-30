// ATENÇÃO: As chaves de API devem ser fornecidas exclusivamente por meio de variáveis de ambiente.
// Nenhuma chave deve ser hard-coded neste arquivo.

// Helper para ler variáveis de ambiente do Vite de forma segura
const getViteEnv = (key: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key];
  }
  return undefined;
};

export const config = {
  gemini: {
    // A chave do Gemini é tratada de forma especial e lida via process.env.API_KEY no ambiente de execução.
    apiKey: process.env.API_KEY
  },
  googlePlaces: {
    // Lendo a chave do Google Places a partir de variáveis de ambiente do cliente (Vite).
    apiKey: getViteEnv('VITE_GOOGLE_PLACES_API_KEY')
  },
  serpApi: {
    // Lendo a chave da SerpAPI a partir de variáveis de ambiente do cliente (Vite).
    apiKey: getViteEnv('VITE_SERPAPI_KEY')
  },
  supabase: {
    // Lendo as credenciais do Supabase a partir de variáveis de ambiente do cliente (Vite).
    url: getViteEnv('VITE_SUPABASE_URL'),
    anonKey: getViteEnv('VITE_SUPABASE_ANON_KEY')
  }
};
