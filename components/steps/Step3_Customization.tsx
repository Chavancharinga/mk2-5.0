import React, { useState } from 'react';
import { NeonButton, GlowCard, NeonInput, NeonImageUpload } from '../ui/NeonComponents';
import { WizardState, VisualStyle, FEATURES_LIST } from '../../types';
import { Check, Palette, Layout, Plus, Trash2, Settings, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  data: WizardState;
  updateData: (updates: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3_Customization: React.FC<Props> = ({ data, updateData, onNext, onBack }) => {
  const [newFeature, setNewFeature] = useState('');

  const toggleFeature = (feature: string) => {
    const current = data.customization.features;
    if (current.includes(feature)) {
      updateData({ 
        customization: { ...data.customization, features: current.filter(f => f !== feature) } 
      });
    } else {
      updateData({ 
        customization: { ...data.customization, features: [...current, feature] } 
      });
    }
  };

  const addCustomFeature = () => {
    if (newFeature.trim() && !data.customization.features.includes(newFeature.trim())) {
      updateData({
        customization: {
          ...data.customization,
          features: [...data.customization.features, newFeature.trim()]
        }
      });
      setNewFeature('');
    }
  };
  
  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...data.customization.colors];
    newColors[index] = newColor;
    updateData({ customization: { ...data.customization, colors: newColors } });
  };

  const addColor = () => {
    updateData({ customization: { ...data.customization, colors: [...data.customization.colors, '#CCCCCC'] } });
  };

  const removeColor = (index: number) => {
    if (data.customization.colors.length <= 1) return; // Prevent removing all colors
    updateData({ customization: { ...data.customization, colors: data.customization.colors.filter((_, i) => i !== index) } });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Identidade do Site</h2>
        <p className="text-gray-400">Personalize o visual e as funcionalidades.</p>
      </div>

      <div className="space-y-6">
        {/* Dynamic Colors */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-white font-bold"><Palette size={18} /> Paleta de Cores</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {data.customization.colors.map((color, index) => (
              <div key={index} className="relative group">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="w-full h-16 rounded-lg cursor-pointer bg-transparent border-none p-0"
                />
                <span className="absolute bottom-2 left-2 text-xs font-mono text-white bg-black/50 px-1 rounded pointer-events-none">{color.toUpperCase()}</span>
                {data.customization.colors.length > 1 && (
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

        {/* Image Upload */}
        <div className="pt-4 border-t border-white/10">
          <NeonImageUpload 
            value={data.referenceImage}
            onChange={(base64) => updateData({ referenceImage: base64 })}
          />
        </div>

        {/* Style */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-white font-bold"><Layout size={18} /> Estilo Visual</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(VisualStyle).map((style) => (
              <GlowCard
                key={style}
                selected={data.customization.style === style}
                onClick={() => updateData({ customization: { ...data.customization, style: style as VisualStyle } })}
                className="py-3 px-4 cursor-pointer text-center text-sm font-medium"
              >
                {style}
              </GlowCard>
            ))}
          </div>
        </div>

        {/* Slogan */}
         <div className="space-y-3">
           <NeonInput 
             label="Slogan / Frase de Efeito"
             placeholder="Ex: O melhor corte da região"
             value={data.customization.tagline}
             onChange={(e) => updateData({ customization: { ...data.customization, tagline: e.target.value } })}
           />
         </div>

        {/* Features */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-white font-bold"><Settings size={18} /> Funcionalidades</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FEATURES_LIST.map((feature) => (
              <div 
                key={feature}
                onClick={() => toggleFeature(feature)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${data.customization.features.includes(feature) ? 'border-[#A020F0] bg-[#A020F0]/10' : 'border-white/10 hover:bg-white/5'}`}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${data.customization.features.includes(feature) ? 'bg-[#A020F0] border-[#A020F0]' : 'border-gray-500'}`}>
                  {data.customization.features.includes(feature) && <Check size={12} className="text-white" />}
                </div>
                <span className={data.customization.features.includes(feature) ? 'text-white' : 'text-gray-400'}>{feature}</span>
              </div>
            ))}
          </div>
          
          {/* Custom Feature Input */}
          <div className="pt-4 border-t border-white/10 mt-4">
            <div className="flex gap-2">
                <NeonInput
                    placeholder="Adicionar outra funcionalidade..."
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomFeature()}
                />
                <NeonButton onClick={addCustomFeature} variant="secondary" className="px-4">
                    <Plus size={18} />
                </NeonButton>
            </div>
            <div className="flex flex-wrap gap-2 pt-3">
              <AnimatePresence>
                {data.customization.features.filter(f => !FEATURES_LIST.includes(f)).map(feature => (
                    <motion.div
                        key={feature}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex items-center gap-2 bg-[#A020F0]/20 border border-[#A020F0]/50 px-3 py-1.5 rounded-full"
                    >
                        <span className="text-sm text-white font-medium">{feature}</span>
                        <button onClick={() => toggleFeature(feature)} className="text-[#A020F0] hover:text-white">
                            <Trash2 size={14} />
                        </button>
                    </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-between">
        <NeonButton onClick={onBack} variant="ghost">Voltar</NeonButton>
        <NeonButton onClick={onNext} className="group">
          <span className="flex items-center gap-2">
            Gerar Prompt com IA
            <Sparkles size={18} className="group-hover:text-yellow-300 transition-colors" />
          </span>
        </NeonButton>
      </div>
    </div>
  );
};