
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NeonInput, NeonButton, GlowCard, NeonAutocomplete } from '../ui/NeonComponents';
import { generateSalesPitch } from '../../services/geminiService';
import { MessageSquare, Copy, Wand2, Send, Save } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface Props {
  session?: Session;
}

export const PitchGenerator: React.FC<Props> = ({ session }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    niche: '',
    city: '',
    tone: 'Profissional e Direto'
  });
  const [generatedPitch, setGeneratedPitch] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    if (!formData.businessName || !formData.niche) return;
    setLoading(true);
    setSaved(false);
    
    const result = await generateSalesPitch(formData.businessName, formData.niche, formData.city, formData.tone);
    setGeneratedPitch(result);
    
    // Salvar no Supabase
    if (session) {
        try {
            await supabase.from('generated_pitches').insert({
                user_id: session.user.id,
                business_name: formData.businessName,
                niche: formData.niche,
                city: formData.city,
                tone: formData.tone,
                pitch_text: result
            });
            setSaved(true);
        } catch (error) {
            console.error("Erro ao salvar pitch:", error);
        }
    }
    
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <MessageSquare className="text-[#A020F0]" /> Gerador de Pitch
        </h1>
        <p className="text-gray-400">Crie mensagens de abordagem irresistíveis para vender seus sites.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          <GlowCard className="bg-[#111] space-y-4">
            <h3 className="text-white font-bold border-b border-white/10 pb-2 mb-4">Dados do Cliente</h3>
            
            <NeonInput 
              label="Nome do Negócio" 
              placeholder="Ex: Barbearia do Zé"
              value={formData.businessName}
              onChange={(e) => setFormData({...formData, businessName: e.target.value})}
            />
            
            <NeonInput 
              label="Nicho de Atuação" 
              placeholder="Ex: Barbearia"
              value={formData.niche}
              onChange={(e) => setFormData({...formData, niche: e.target.value})}
            />
            
            <NeonInput 
              label="Cidade (Opcional)" 
              placeholder="Ex: Lisboa"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
            />
            
            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Tom de Voz</label>
              <div className="grid grid-cols-3 gap-2">
                {['Profissional', 'Amigável', 'Agressivo'].map(tone => (
                  <button
                    key={tone}
                    onClick={() => setFormData({...formData, tone})}
                    className={`
                      py-2 px-1 text-xs rounded border transition-colors
                      ${formData.tone === tone 
                        ? 'bg-[#A020F0]/20 border-[#A020F0] text-white' 
                        : 'border-white/10 text-gray-500 hover:bg-white/5'}
                    `}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <NeonButton 
              fullWidth 
              onClick={handleGenerate} 
              disabled={loading || !formData.businessName}
              className="mt-4"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Wand2 className="animate-spin" size={16} /> Criando Mágica...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Wand2 size={16} /> Gerar Mensagem
                </span>
              )}
            </NeonButton>
          </GlowCard>
        </div>

        {/* Result */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <h3 className="text-white font-bold flex items-center gap-2">
               Mensagem Gerada
               {saved && <span className="text-xs text-green-400 font-normal flex items-center gap-1"><Save size={10} /> Salvo</span>}
             </h3>
             {generatedPitch && (
               <button onClick={handleCopy} className="text-[#A020F0] text-sm flex items-center gap-1 hover:text-white transition-colors">
                 {copied ? 'Copiado!' : <><Copy size={14} /> Copiar Texto</>}
               </button>
             )}
          </div>
          
          <div className="relative h-full min-h-[400px]">
            <div className={`
              absolute inset-0 bg-[#0A0A0A] border border-white/10 rounded-xl p-6 
              text-gray-300 whitespace-pre-wrap leading-relaxed custom-scrollbar overflow-y-auto
              ${!generatedPitch ? 'flex items-center justify-center text-center' : ''}
            `}>
              {generatedPitch ? (
                generatedPitch
              ) : (
                <div className="text-gray-600 space-y-2">
                  <Send size={48} className="mx-auto opacity-20" />
                  <p>Preencha os dados ao lado para gerar sua mensagem de vendas personalizada.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
