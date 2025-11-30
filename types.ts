export enum NicheType {
  BARBER = 'Barbearia',
  MARKET = 'Mercado',
  SALON = 'Salão de Beleza',
  GYM = 'Academia',
  RESTAURANT = 'Restaurante',
  MECHANIC = 'Oficina',
  PET_SHOP = 'Pet Shop',
  DENTIST = 'Dentista',
  OTHER = 'Outro'
}

export enum VisualStyle {
  MODERN = 'Moderno',
  CLASSIC = 'Clássico',
  VINTAGE = 'Vintage',
  STREET = 'Street / Urbano',
  MINIMALIST = 'Minimalista',
  IMMERSIVE = '3D / Imersivo'
}

export interface Business {
  id: string;
  name: string;
  address: string;
  rating?: number;
  reviews?: number;
  image?: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

export interface WizardState {
  step: number;
  mode: 'business' | 'custom' | null;
  referenceImage: string | null; // For reference image upload

  // Business flow
  location: {
    city: string;
    district: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  niche: NicheType;
  customNiche: string;
  selectedBusiness: Business | null;
  
  // Custom flow
  customProjectName: string;
  customProjectDescription: string;
  customColors: string[];
  customFeatures: string[];

  // Common (used by Business Flow)
  customization: {
    colors: string[];
    style: VisualStyle;
    features: string[];
    tagline: string;
    customDescription?: string;
  };
  generatedPrompt: string;
}


export const FEATURES_LIST = [
  "Agendamento Online",
  "Catálogo de Serviços",
  "Galeria de Fotos",
  "Botão WhatsApp",
  "Mapa Interativo",
  "Depoimentos Google",
  "Blog / Notícias",
  "Pagamento Pix"
];