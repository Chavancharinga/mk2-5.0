
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { NeonButton, GlowCard, NeonInput } from '../ui/NeonComponents';
import { WizardState, Business, NicheType } from '../../types';
import { searchRealBusinesses } from '../../services/geminiService';
import { MapPin, Star, Plus, RefreshCw, AlertCircle, List } from 'lucide-react';
import * as L from 'leaflet';

// Icon definition
const customIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#A020F0" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
`;

interface Props {
  data: WizardState;
  updateData: (updates: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Busca coordenadas reais da cidade para centrar o mapa
const getCoordinatesFromOSM = async (city: string, district: string, country: string) => {
  try {
    let query = `${city}, ${district}, ${country}`;
    const apiUrl1 = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=pt-BR`;
    const proxyUrl1 = `https://corsproxy.io/?${encodeURIComponent(apiUrl1)}`;
    
    let response = await fetch(proxyUrl1);
    let result = await response.json();

    if (result && result.length > 0) {
      return { lat: parseFloat(result[0].lat), lng: parseFloat(result[0].lon) };
    }
    
    // Fallback: busca menos específica
    query = `${city}, ${country}`;
    const apiUrl2 = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=pt-BR`;
    const proxyUrl2 = `https://corsproxy.io/?${encodeURIComponent(apiUrl2)}`;

    response = await fetch(proxyUrl2);
    result = await response.json();

    if (result && result.length > 0) {
       return { lat: parseFloat(result[0].lat), lng: parseFloat(result[0].lon) };
    }
  } catch (e) {
    console.error("Erro geocoding OSM:", e);
  }
  return null;
};

export const Step2_Business: React.FC<Props> = ({ data, updateData, onNext, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [customBusinessName, setCustomBusinessName] = useState('');
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // 1. Busca Dados
  useEffect(() => {
    let isMounted = true;

    const initStep = async () => {
      setLoading(true);
      
      // Tenta buscar centro da cidade
      let coords = await getCoordinatesFromOSM(data.location.city, data.location.district, data.location.country);
      
      if (isMounted) {
        if (coords) setMapCenter(coords);
        
        // Busca negócios na API
        const searchTerm = data.niche === NicheType.OTHER ? data.customNiche : data.niche;
        const results = await searchRealBusinesses(
          data.location.city, 
          data.location.district, 
          data.location.country, 
          searchTerm,
          coords?.lat,
          coords?.lng
        );
        
        // Fallback Crítico: Se o OSM falhou mas a busca de negócios trouxe resultados com GPS,
        // usamos o primeiro negócio para centrar o mapa. Isso evita a tela preta.
        if (!coords && results.length > 0 && results[0].lat && results[0].lng) {
            const fallbackCoords = { lat: results[0].lat!, lng: results[0].lng! };
            setMapCenter(fallbackCoords);
        } else if (!coords) {
            // Fallback final para não quebrar o Leaflet (Centro de Portugal aprox)
            setMapCenter({ lat: 39.5, lng: -8.0 });
        }
        
        setBusinesses(results);
        setLoading(false);
      }
    };

    initStep();
    return () => { isMounted = false; };
  }, [data.location.city, data.location.district, data.location.country, data.niche, data.customNiche]);

  // 2. Inicializa e Gerencia o Mapa
  useEffect(() => {
    if (!mapContainerRef.current || !mapCenter) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        center: [mapCenter.lat, mapCenter.lng],
        zoom: 13
      });
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([mapCenter.lat, mapCenter.lng], 13);
    }

    // Force resize to prevent grey screen
    const fixMapRender = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    // Múltiplos triggers
    setTimeout(fixMapRender, 100);
    setTimeout(fixMapRender, 500);
    setTimeout(fixMapRender, 1000);
    
    // Observer
    resizeObserverRef.current = new ResizeObserver(() => {
      fixMapRender();
    });
    resizeObserverRef.current.observe(mapContainerRef.current);

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [mapCenter]); // Re-run when mapCenter changes

  // Trigger resize when businesses load to ensure map is visible
  useEffect(() => {
    if (!loading && mapInstanceRef.current) {
        setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
        setTimeout(() => mapInstanceRef.current?.invalidateSize(), 500);
    }
  }, [loading, businesses]);

  // 3. Renderiza Marcadores
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    const selectedPinIcon = L.divIcon({
      html: `
        <div style="display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 10px #A020F0); transform: scale(1.2) translateY(-10px);">
           ${customIcon}
        </div>
      `,
      className: 'custom-map-marker-selected',
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    const markers: L.Layer[] = [];

    businesses.forEach(biz => {
      if (biz.lat && biz.lng) {
        const isSelected = data.selectedBusiness?.id === biz.id;
        let layer: L.Layer;

        if (isSelected) {
            layer = L.marker([biz.lat, biz.lng], {
                icon: selectedPinIcon,
                zIndexOffset: 1000
            });
        } else {
            layer = L.circleMarker([biz.lat, biz.lng], {
                radius: 6,
                fillColor: '#111',
                color: '#A020F0',
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.8
            });
        }

        layer.on('click', () => handleSelect(biz));
        
        layer.bindTooltip(biz.name, {
            permanent: false,
            direction: 'top',
            offset: isSelected ? [0, -40] : [0, -10],
            className: 'custom-map-tooltip'
        });

        layer.on('mouseover', function(e) {
            if (!isSelected) {
                (e.target as L.CircleMarker).setStyle({ fillColor: '#A020F0', radius: 8, fillOpacity: 1 });
                this.openTooltip();
            }
        });
        layer.on('mouseout', function(e) {
            if (!isSelected) {
                (e.target as L.CircleMarker).setStyle({ fillColor: '#111', radius: 6, fillOpacity: 0.8 });
                this.closeTooltip();
            }
        });

        layer.addTo(layerGroup);
        markers.push(layer);
      }
    });

    // Auto-fit bounds se houver marcadores
    if (markers.length > 0 && mapInstanceRef.current) {
        const group = L.featureGroup(markers as any);
        try {
            mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 15 });
        } catch(e) {}
    }

  }, [businesses, data.selectedBusiness]);

  const handleSelect = (business: Business) => {
    updateData({ selectedBusiness: business });
    if (mapInstanceRef.current && business.lat && business.lng) {
        mapInstanceRef.current.flyTo([business.lat, business.lng], 16, { animate: true, duration: 1 });
    }
  };

  const handleCreateCustom = () => {
    if (!customBusinessName) return;
    const newBusiness: Business = {
      id: 'custom-' + Date.now(),
      name: customBusinessName,
      address: `${data.location.city}, ${data.location.district}, ${data.location.country}`,
      phone: '',
      rating: 5.0,
      reviews: 0,
      lat: mapCenter?.lat,
      lng: mapCenter?.lng
    };
    updateData({ selectedBusiness: newBusiness });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-16 h-16 border-4 border-[#A020F0] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 animate-pulse text-center">
          Mapeando <span className="text-white font-bold">{data.location.city}</span>...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="space-y-1 shrink-0">
        <h2 className="text-3xl font-bold text-white">Selecione seu Negócio</h2>
        <p className="text-gray-400">Encontramos estes locais na região de <span className="text-[#A020F0]">{data.location.city}</span>.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Lista de Negócios */}
        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar lg:h-full lg:max-h-[500px] pr-2 order-2 lg:order-1 max-h-[400px]">
           {businesses.length === 0 && (
             <div className="flex flex-col items-center justify-center py-10 bg-white/5 rounded-xl border border-white/10 text-center p-6">
               <AlertCircle className="text-gray-500 mb-3" size={32} />
               <p className="font-bold text-white mb-1">Nenhum local encontrado automaticamente</p>
               <p className="text-sm text-gray-400 mb-2">
                 Não encontramos "{data.niche}" listado nesta região.
               </p>
               <p className="text-xs text-[#A020F0]">Adicione manualmente abaixo.</p>
             </div>
           )}
           {businesses.map((business, index) => (
            <motion.div
              key={business.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlowCard 
                selected={data.selectedBusiness?.id === business.id}
                onClick={() => handleSelect(business)}
                className="cursor-pointer flex items-center gap-3 p-3 text-left group overflow-hidden"
              >
                 <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-white text-base leading-tight mb-1 group-hover:text-[#A020F0] transition-colors truncate">
                     {business.name}
                   </h3>
                   <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                     <MapPin size={12} className="shrink-0 text-[#A020F0]" />
                     <span className="break-words line-clamp-2">{business.address}</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                       <Star size={10} fill="currentColor" /> {business.rating}
                     </span>
                     <span className="text-xs text-gray-600">({business.reviews} reviews)</span>
                   </div>
                 </div>
                 {data.selectedBusiness?.id === business.id && (
                    <div className="w-2 h-2 rounded-full bg-[#A020F0] shadow-[0_0_10px_#A020F0] shrink-0" />
                 )}
              </GlowCard>
            </motion.div>
          ))}

          <div className="mt-2 pt-4 border-t border-white/10">
            <p className="text-gray-400 mb-2 text-xs uppercase font-bold tracking-wider">
               {businesses.length === 0 ? "Adicionar Manualmente" : "Não encontrou?"}
            </p>
            <div className="flex gap-2">
              <NeonInput 
                placeholder="Nome do seu negócio" 
                value={customBusinessName}
                onChange={(e) => setCustomBusinessName(e.target.value)}
                className="py-2 text-sm"
              />
              <NeonButton onClick={handleCreateCustom} disabled={!customBusinessName} variant="secondary" className="py-2 px-3">
                <Plus size={16} />
              </NeonButton>
            </div>
          </div>
        </div>

        {/* Mapa Interativo */}
        {/* Usando Key para forçar recriação do componente quando o centro muda, evitando erros de renderização */}
        <div className="relative rounded-xl overflow-hidden border border-white/20 h-[300px] lg:h-[500px] bg-[#111] shadow-2xl order-1 lg:order-2 group z-0">
          <div 
            key={`${mapCenter?.lat}-${mapCenter?.lng}`}
            ref={mapContainerRef} 
            className="absolute inset-0 z-0 bg-[#050505] w-full h-full" 
          />
          
          {!data.selectedBusiness && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 border border-[#A020F0]/50 px-4 py-2 rounded-full text-xs text-white z-[400] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
               Selecione um ponto no mapa
            </div>
          )}
        </div>
      </div>

      <div className="pt-8 pb-2 flex justify-between shrink-0">
        <NeonButton onClick={onBack} variant="ghost">Voltar</NeonButton>
        <NeonButton 
          onClick={onNext} 
          disabled={!data.selectedBusiness}
          className={!data.selectedBusiness ? 'opacity-50 cursor-not-allowed' : ''}
        >
          Continuar
        </NeonButton>
      </div>
    </div>
  );
};
