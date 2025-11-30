
import { Business, NicheType } from '../types';
import { config } from '../config';

// Mapeamento de nicho para termos de busca
const NICHE_TO_SEARCH_TERM: Record<string, string> = {
    [NicheType.BARBER]: 'Barbearia',
    [NicheType.MARKET]: 'Supermercado',
    [NicheType.SALON]: 'Cabeleireiro',
    [NicheType.GYM]: 'Ginásio',
    [NicheType.RESTAURANT]: 'Restaurante',
    [NicheType.MECHANIC]: 'Oficina automóvel',
    [NicheType.PET_SHOP]: 'Loja de animais',
    [NicheType.DENTIST]: 'Clínica dentária',
    [NicheType.OTHER]: ''
};

// Helper para normalizar texto
const normalizeText = (text: string) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export const searchSerpAPI = async (
    city: string,
    country: string,
    niche: string,
    lat: number,
    lng: number
): Promise<Business[]> => {
    try {
        const apiKey = config.serpApi.apiKey;
        const searchTerm = NICHE_TO_SEARCH_TERM[niche] || niche;
        
        // MUDANÇA: Query mais específica incluindo a cidade explicitamente no texto de busca
        // Isso ajuda o motor do Google Maps a focar na região certa
        const query = `${searchTerm} em ${city}`;
        
        // Parâmetro ll ainda ajuda a dar o contexto geográfico
        const ll = `@${lat},${lng},14z`;

        const apiUrl = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(query)}&ll=${encodeURIComponent(ll)}&type=search&hl=pt&gl=${country === 'Portugal' ? 'pt' : 'br'}&api_key=${apiKey}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;

        console.log(`Fallback: Searching SerpAPI via Proxy for: ${query}`);

        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`SerpAPI Proxy Error: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.error) {
            console.error('SerpAPI Error:', data.error);
            return [];
        }

        if (!data.local_results || data.local_results.length === 0) {
            console.warn('SerpAPI returned no results.');
            return [];
        }

        let businesses: Business[] = data.local_results.map((place: any) => ({
            id: `serp-${place.place_id || place.data_id}`,
            name: place.title,
            address: place.address || 'Endereço não disponível',
            lat: place.gps_coordinates?.latitude || lat,
            lng: place.gps_coordinates?.longitude || lng,
            phone: place.phone,
            rating: place.rating || 4.5,
            reviews: place.reviews || 10,
            image: place.thumbnail
        }));

        // FILTRO ESTRITO DE CIDADE
        // Remove qualquer resultado cujo endereço não contenha o nome da cidade solicitada
        const normalizedCity = normalizeText(city);
        const originalCount = businesses.length;
        
        businesses = businesses.filter(b => {
            const normalizedAddress = normalizeText(b.address);
            return normalizedAddress.includes(normalizedCity);
        });

        console.log(`SerpAPI: ${originalCount} raw results -> ${businesses.length} filtered results for ${city}`);

        return businesses;

    } catch (error) {
        console.error('Critical error in searchSerpAPI:', error);
        return [];
    }
};
