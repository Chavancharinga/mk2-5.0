import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NeonButton, GlowCard } from '../ui/NeonComponents';
import { WizardState } from '../../types';
import { generateSuperPrompt } from '../../services/geminiService';
import { Copy, ExternalLink, RefreshCw, CheckCircle, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface Props {
  data: WizardState;
  onReset: () => void;
  session?: Session;
  onBack?: () => void;
}

export const Step4_Generation: React.FC<Props> = ({ data, onReset, session, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const genAndSave = async () => {
      setLoading(true);
      const result = await generateSuperPrompt(data);
      setPrompt(result);
      
      // Salvar no Supabase se houver sessão
      if (session) {
        try {
          const isCustom = data.mode === 'custom';
          await supabase.from('generated_sites').insert({
            user_id: session.user.id,
            business_name: isCustom ? data.customProjectName : (data.selectedBusiness?.name || 'Negócio sem nome'),
            niche: isCustom ? 'Projeto Personalizado' : (data.niche === 'Outro' ? data.customNiche : data.niche),
            city: isCustom ? 'N/A' : data.location.city,
            wizard_state: data,
            generated_prompt: result
          });
          setSaved(true);
        } catch (error) {
          console.error('Erro ao salvar no Supabase:', error);
        }
      }

      setLoading(false);
    };
    genAndSave();
  }, [data, session]); // Adicionado dependências

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLovable = () => {
    window.open('https://lovable.dev/', '_blank');
  };

  const handleOpenSkipAI = () => {
    window.open('https://skip.ai/', '_blank');
  };
  
  const handleOpenGllmAI = () => {
    window.open('https://www.gllm.ai/', '_blank');
  };

  const isCustomMode = data.mode === 'custom';
  const displayColors = isCustomMode ? data.customColors : data.customization.colors;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-6">
        <div className="relative w-24 h-24">
          <motion.div 
            className="absolute inset-0 border-4 border-[#A020F0] rounded-full border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-2 border-4 border-[#C71585] rounded-full border-b-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Construindo Prompt e Salvando...</h2>
          <p className="text-gray-400">A IA está analisando seu projeto.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle size={32} className="text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white">Tudo Pronto!</h2>
        <p className="text-gray-400">
          Seu super prompt foi gerado {saved && 'e salvo no seu histórico'}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold">Prompt Gerado</h3>
            <div className="flex gap-2">
              {saved && <span className="text-green-400 text-xs flex items-center gap-1"><Save size={12}/> Salvo</span>}
              <button 
                onClick={handleCopy}
                className="text-[#A020F0] text-sm hover:text-white flex items-center gap-1"
              >
                {copied ? 'Copiado!' : <><Copy size={14} /> Copiar</>}
              </button>
            </div>
          </div>
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4 h-[400px] overflow-y-auto text-sm text-gray-300 font-mono custom-scrollbar relative group">
             {prompt}
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-6 flex flex-col justify-between">
          <GlowCard className="flex-1 flex flex-col items-center justify-center text-center space-y-4 bg-[#111]">
            <h3 className="text-xl font-bold text-white">Preview das Cores</h3>
            <div className="w-full h-40 rounded-lg flex items-center justify-center relative overflow-hidden">
               <div 
                 className="absolute inset-0 opacity-20"
                 style={{ background: `linear-gradient(45deg, ${displayColors[0]}, ${displayColors[1] || displayColors[0]})`}}
               />
               <div className="bg-black/80 p-6 rounded border border-white/10 max-w-[200px] z-10">
                  <div className="h-2 w-20 bg-white/20 mb-2 rounded" />
                  <div className="h-2 w-32 bg-white/10 mb-4 rounded" />
                  <button 
                    className="px-4 py-1 text-xs rounded font-bold"
                    style={{ 
                      border: `1px solid ${displayColors[0]}`, 
                      color: displayColors[0] 
                    }}
                  >
                    Button
                  </button>
               </div>
            </div>
            <p className="text-sm text-gray-400">
              Cores: <span className="text-white">{displayColors.join(', ')}</span>
            </p>
          </GlowCard>

          <div className="space-y-3">
             <NeonButton onClick={handleOpenLovable} fullWidth className="py-3"> 
               Abrir Lovable.dev <ExternalLink size={18} />
             </NeonButton>
             <div className="grid grid-cols-2 gap-2">
                <NeonButton onClick={handleOpenSkipAI} fullWidth variant="secondary" className="text-xs py-2"> 
                  Abrir Skip AI <ExternalLink size={14} />
                </NeonButton>
                <NeonButton onClick={handleOpenGllmAI} fullWidth variant="secondary" className="text-xs py-2"> 
                  Abrir Gllm AI <ExternalLink size={14} />
                </NeonButton>
             </div>
             <div className="flex gap-2">
                {onBack && (
                    <NeonButton onClick={onBack} variant="ghost" className="flex-1">
                        <ArrowLeft size={18} /> Voltar para Editar
                    </NeonButton>
                )}
                <NeonButton onClick={onReset} variant="ghost" className="flex-1">
                    <RefreshCw size={18} /> Criar Outro Projeto
                </NeonButton>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};