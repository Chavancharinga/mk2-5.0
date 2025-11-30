
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonInput, GlowCard, NeonButton, NeonAutocomplete } from '../ui/NeonComponents';
import { NicheType, WizardState } from '../../types';
import { Scissors, ShoppingCart, Activity, Coffee, Wrench, Dog, Stethoscope, Briefcase, MapPin, Loader2 } from 'lucide-react';

interface Props {
  data: WizardState;
  updateData: (updates: Partial<WizardState>) => void;
  onNext: () => void;
}

const NICHE_ICONS: Record<NicheType, React.ReactNode> = {
  [NicheType.BARBER]: <Scissors />,
  [NicheType.MARKET]: <ShoppingCart />,
  [NicheType.SALON]: <Scissors className="rotate-90" />,
  [NicheType.GYM]: <Activity />,
  [NicheType.RESTAURANT]: <Coffee />,
  [NicheType.MECHANIC]: <Wrench />,
  [NicheType.PET_SHOP]: <Dog />,
  [NicheType.DENTIST]: <Stethoscope />,
  [NicheType.OTHER]: <Briefcase />,
};

const COUNTRIES = [
  { label: 'Portugal', value: 'Portugal', icon: '🇵🇹' },
  { label: 'Brasil', value: 'Brasil', icon: '🇧🇷' },
  { label: 'Estados Unidos', value: 'United States', icon: '🇺🇸' },
  { label: 'Reino Unido', value: 'United Kingdom', icon: '🇬🇧' },
  { label: 'Espanha', value: 'Spain', icon: '🇪🇸' },
  { label: 'França', value: 'France', icon: '🇫🇷' },
  { label: 'Angola', value: 'Angola', icon: '🇦🇴' },
  { label: 'Moçambique', value: 'Mozambique', icon: '🇲🇿' },
];

// Dados Mockados para Autocomplete (Focados em Portugal/Brasil para Demo)
const DISTRICTS_DATA: Record<string, string[]> = {
  'Portugal': [
    'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra', 'Évora', 
    'Faro', 'Guarda', 'Leiria', 'Lisboa', 'Portalegre', 'Porto', 'Santarém', 
    'Setúbal', 'Viana do Castelo', 'Vila Real', 'Viseu', 'Açores', 'Madeira'
  ],
  'Brasil': [
    'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 
    'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 
    'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 
    'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 
    'São Paulo', 'Sergipe', 'Tocantins'
  ]
};

const CITIES_DATA: Record<string, string[]> = {
  // Portugal - Coimbra
  'Coimbra': ['Coimbra', 'Cantanhede', 'Figueira da Foz', 'Montemor-o-Velho', 'Lousã', 'Condeixa-a-Nova', 'Mealhada', 'Oliveira do Hospital'],
  // Portugal - Lisboa
  'Lisboa': ['Lisboa', 'Sintra', 'Cascais', 'Oeiras', 'Amadora', 'Odivelas', 'Loures', 'Mafra'],
  // Portugal - Porto
  'Porto': ['Porto', 'Vila Nova de Gaia', 'Matosinhos', 'Gondomar', 'Maia', 'Póvoa de Varzim'],
  
  // Brasil - SP
  'São Paulo': ['São Paulo', 'Campinas', 'Guarulhos', 'Santos', 'São Bernardo do Campo', 'Osasco', 'Ribeirão Preto'],
  // Brasil - RJ
  'Rio de Janeiro': ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu', 'Petrópolis', 'Cabo Frio']
};

export const Step1_Location: React.FC<Props> = ({ data, updateData, onNext }) => {
  const [isLocating, setIsLocating] = useState(false);

  const isFormValid = 
    data.location.city.length > 2 && 
    data.location.country.length > 2 &&
    data.location.district.length > 2 &&
    (data.niche !== NicheType.OTHER || (data.niche === NicheType.OTHER && data.customNiche.length > 2));

  // Get Districts based on selected Country
  const availableDistricts = useMemo(() => {
    const country = data.location.country;
    const list = DISTRICTS_DATA[country] || [];
    return list.map(d => ({ label: d, value: d }));
  }, [data.location.country]);

  // Get Cities based on selected District (Simple mapping for demo)
  const availableCities = useMemo(() => {
    const district = data.location.district;
    // Tenta encontrar cidades exatas para o distrito, ou retorna lista vazia permitindo digitação
    const list = CITIES_DATA[district] || [];
    return list.map(c => ({ label: c, value: c }));
  }, [data.location.district]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada pelo seu navegador.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse Geocoding via Nominatim with CORS Proxy
          const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1&accept-language=pt-BR`;
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
          
          const response = await fetch(proxyUrl);
          
          if (!response.ok) throw new Error('Falha na resposta da API');
          
          const data = await response.json();
          const address = data.address;

          if (address) {
            const country = address.country || '';
            // Mapeamento flexível para Estado/Distrito dependendo do país
            const district = address.state || address.region || address.county || '';
            const city = address.city || address.town || address.village || address.municipality || '';

            updateData({
              location: {
                country,
                district,
                city
              }
            });
          } else {
             throw new Error('Endereço não encontrado');
          }
        } catch (error) {
          console.error("Erro ao obter localização:", error);
          alert("Não foi possível detectar o endereço automaticamente. Verifique sua conexão.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Erro de permissão ou GPS:", error);
        setIsLocating(false);
        alert("Permissão de localização negada ou erro no GPS.");
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Onde é o seu negócio?</h2>
        <p className="text-gray-400">Precisamos da localização exata (País, Estado/Distrito e Cidade) para encontrar dados reais.</p>
        
        <button 
          onClick={handleUseLocation}
          disabled={isLocating}
          className="flex items-center gap-2 text-[#A020F0] text-sm font-medium hover:text-[#C71585] transition-colors mt-2 focus:outline-none"
        >
          {isLocating ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <MapPin size={16} />
          )}
          {isLocating ? "Detectando..." : "Usar minha localização atual"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Country */}
        <NeonAutocomplete 
          label="País" 
          placeholder="Digite ou selecione (Ex: Portugal)" 
          options={COUNTRIES}
          value={data.location.country}
          onChange={(val) => {
            // Se mudar o país, limpar distrito e cidade
            updateData({ location: { country: val, district: '', city: '' } });
          }}
        />

        {/* District (Dependent on Country) */}
        <NeonAutocomplete 
          label="Estado / Distrito" 
          placeholder="Ex: Coimbra" 
          options={availableDistricts}
          value={data.location.district}
          onChange={(val) => updateData({ location: { ...data.location, district: val } })}
        />

        {/* City (Dependent on District) */}
        <NeonAutocomplete 
          label="Cidade" 
          placeholder="Ex: Cantanhede" 
          options={availableCities}
          value={data.location.city}
          onChange={(val) => updateData({ location: { ...data.location, city: val } })}
          className="md:col-span-2"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Qual é o seu nicho?</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.values(NicheType).map((niche) => (
            <GlowCard
              key={niche}
              selected={data.niche === niche}
              onClick={() => updateData({ niche: niche as NicheType })}
              className="cursor-pointer flex flex-col items-center justify-center gap-3 py-6 hover:bg-white/5"
            >
              <div className={`text-2xl ${data.niche === niche ? 'text-[#A020F0]' : 'text-gray-400'}`}>
                {NICHE_ICONS[niche as NicheType]}
              </div>
              <span className={`text-sm font-medium ${data.niche === niche ? 'text-white' : 'text-gray-400'}`}>
                {niche}
              </span>
            </GlowCard>
          ))}
        </div>
        
        {/* Custom Niche Input - appears only when "Other" is selected */}
        <AnimatePresence>
          {data.niche === NicheType.OTHER && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <NeonInput 
                label="Qual o seu ramo de atuação?" 
                placeholder="Ex: Shopping, Papelaria, Contabilidade..." 
                value={data.customNiche}
                onChange={(e) => updateData({ customNiche: e.target.value })}
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-4 flex justify-end">
        <NeonButton 
          onClick={onNext} 
          disabled={!isFormValid}
          className={!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}
        >
          Buscar Negócios Reais
        </NeonButton>
      </div>
    </div>
  );
};
