import React from 'react';
import { GlowCard } from '../ui/NeonComponents';
import { Building, Sparkles } from 'lucide-react';

interface Props {
  updateData: (updates: { mode: 'business' | 'custom' }) => void;
  onNext: () => void;
}

export const Step0_ModeSelection: React.FC<Props> = ({ updateData, onNext }) => {
  const handleSelect = (mode: 'business' | 'custom') => {
    updateData({ mode });
    onNext();
  };

  return (
    <div className="text-center space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Que tipo de projeto você quer criar?</h2>
        <p className="text-gray-400 mt-2">Escolha uma opção para começar.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <GlowCard
          onClick={() => handleSelect('business')}
          className="cursor-pointer p-8 flex flex-col items-center gap-4 text-center hover:scale-105 transition-transform"
        >
          <Building className="w-12 h-12 text-[#A020F0]" />
          <h3 className="text-xl font-bold text-white">Negócio Local</h3>
          <p className="text-sm text-gray-400">Gere um site para um negócio físico com base na localização e nicho (Barbearia, Restaurante, etc.).</p>
        </GlowCard>
        <GlowCard
          onClick={() => handleSelect('custom')}
          className="cursor-pointer p-8 flex flex-col items-center gap-4 text-center hover:scale-105 transition-transform"
        >
          <Sparkles className="w-12 h-12 text-[#C71585]" />
          <h3 className="text-xl font-bold text-white">Site Personalizado</h3>
          <p className="text-sm text-gray-400">Crie um prompt para qualquer tipo de site (Portfólio, Blog, SaaS) a partir de uma ideia ou descrição.</p>
        </GlowCard>
      </div>
    </div>
  );
};
