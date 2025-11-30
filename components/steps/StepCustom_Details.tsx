import React, { useState } from 'react';
import { NeonInput, NeonButton, NeonImageUpload } from '../ui/NeonComponents';
import { WizardState } from '../../types';
import { Plus, Trash2, Palette, Settings, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  data: WizardState;
  updateData: (updates: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepCustom_Details: React.FC<Props> = ({ data, updateData, onNext, onBack }) => {
  const [newFeature, setNewFeature] = useState('');
  
  const isFormValid = (data.customProjectName?.length || 0) > 3 && (data.customProjectDescription?.length || 0) > 10;

  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...data.customColors];
    newColors[index] = newColor;
    updateData({ customColors: newColors });
  };

  const addColor = () => {
    updateData({ customColors: [...data.customColors, '#CCCCCC'] });
  };

  const removeColor = (index: number) => {
    if (data.customColors.length <= 1) return; // Prevent removing all colors
    updateData({ customColors: data.customColors.filter((_, i) => i !== index) });
  };
  
  const addFeature = () => {
    if (newFeature.trim() && !data.customFeatures.includes(newFeature.trim())) {
      updateData({ customFeatures: [...data.customFeatures, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    updateData({ customFeatures: data.customFeatures.filter(f => f !== feature) });
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-white">Configure seu Site Personalizado</h2>
        <p className="text-gray-400 mt-2">Descreva sua ideia, defina as cores e adicione as funcionalidades que precisa.</p>
      </div>

      <div className="space-y-6">
        <NeonInput
          label="Nome do Projeto"
          placeholder="Ex: Meu Portfólio de Fotografia"
          value={data.customProjectName}
          onChange={(e) => updateData({ customProjectName: e.target.value })}
        />
        <div>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Descreva sua ideia</label>
            <textarea
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#A020F0] focus:ring-1 focus:ring-[#A020F0] placeholder-gray-600 transition-all duration-300 min-h-[150px] resize-y"
                placeholder="Ex: Quero um site minimalista para mostrar minhas fotos de paisagens. Precisa de uma galeria, uma página 'Sobre mim' e um formulário de contato."
                value={data.customProjectDescription}
                onChange={(e) => updateData({ customProjectDescription: e.target.value })}
            />
        </div>
      </div>

      {/* Image Upload */}
      <div className="pt-4 border-t border-white/10">
        <NeonImageUpload
            value={data.referenceImage}
            onChange={(base64) => updateData({ referenceImage: base64 })}
        />
      </div>

      {/* Dynamic Colors */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-white font-bold text-lg">
          <Palette size={20} className="text-[#A020F0]" />
          Paleta de Cores
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {data.customColors.map((color, index) => (
            <div key={index} className="relative group">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                className="w-full h-16 rounded-lg cursor-pointer bg-transparent border-none p-0"
              />
              <span className="absolute bottom-2 left-2 text-xs font-mono text-white bg-black/50 px-1 rounded pointer-events-none">{color.toUpperCase()}</span>
              {data.customColors.length > 1 && (
                <button 
                  onClick={() => removeColor(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
          <button 
            onClick={addColor}
            className="w-full h-16 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#A020F0] transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Dynamic Features */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-white font-bold text-lg">
          <Settings size={20} className="text-[#A020F0]" />
          Funcionalidades
        </label>
        <div className="flex gap-2">
            <NeonInput
                placeholder="Ex: Sistema de Login, Blog, Galeria..."
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addFeature()}
            />
            <NeonButton onClick={addFeature} variant="secondary" className="px-4">
                <Plus size={18} />
            </NeonButton>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <AnimatePresence>
            {data.customFeatures.map(feature => (
                <motion.div
                    key={feature}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex items-center gap-2 bg-[#A020F0]/20 border border-[#A020F0]/50 px-3 py-1.5 rounded-full"
                >
                    <span className="text-sm text-white font-medium">{feature}</span>
                    <button onClick={() => removeFeature(feature)} className="text-[#A020F0] hover:text-white">
                        <X size={14} />
                    </button>
                </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>


      <div className="pt-6 flex justify-between border-t border-white/10">
        <NeonButton onClick={onBack} variant="ghost">Voltar</NeonButton>
        <NeonButton
          onClick={onNext}
          disabled={!isFormValid}
          className={!isFormValid ? 'opacity-50 cursor-not-allowed group' : 'group'}
        >
          <span className="flex items-center gap-2">
            Gerar Prompt com IA
            <Sparkles size={18} className="group-hover:text-yellow-300 transition-colors" />
          </span>
        </NeonButton>
      </div>
    </div>
  );
};