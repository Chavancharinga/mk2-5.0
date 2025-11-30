import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { GlowCard, NeonButton } from '../ui/NeonComponents';
import { History as HistoryIcon, Globe, MessageSquare, Trash2, Copy, X, Calendar, Loader2, ChevronRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  session: Session;
}

type Tab = 'sites' | 'pitches';

// Helper to safely parse pitch text
const parsePitchText = (text: string): { whatsapp: string; email: string } | null => {
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed.whatsapp === 'string' && typeof parsed.email === 'string') {
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const History: React.FC<Props> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<Tab>('sites');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  // States for delete functionality
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Auto-cancel confirmation after 3 seconds
  useEffect(() => {
    if (!confirmingDeleteId) return;
    const timer = setTimeout(() => setConfirmingDeleteId(null), 3000);
    return () => clearTimeout(timer);
  }, [confirmingDeleteId]);


  // Fetch data from Supabase
  const fetchData = async () => {
    setLoading(true);
    setSelectedItem(null);
    setDeleteError(null);
    try {
      const table = activeTab === 'sites' ? 'generated_sites' : 'generated_pitches';
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      setDeleteError('Falha ao carregar o histórico.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, session.user.id]);

  // Execute deletion from Supabase
  const executeDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingId) return;

    setConfirmingDeleteId(null); // Hide confirmation buttons
    setDeletingId(id);
    setDeleteError(null);

    try {
      const table = activeTab === 'sites' ? 'generated_sites' : 'generated_pitches';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id); // Double check ownership

      if (error) {
        throw error;
      }
      
      setItems(prev => prev.filter(item => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      setDeleteError(`Falha ao excluir: ${error.message}. Verifique as permissões de segurança (RLS) no Supabase.`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  const renderPitchDetail = (item: any) => {
    const parsedPitch = parsePitchText(item.pitch_text);
    if (parsedPitch) {
      return (
        <div className="font-sans text-gray-300 leading-relaxed whitespace-normal text-sm">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-white text-base uppercase tracking-wider">WhatsApp</h4>
            <button onClick={() => handleCopy(parsedPitch.whatsapp)} className="text-xs flex items-center gap-1 text-[#A020F0] hover:text-white"><Copy size={12}/> Copiar</button>
          </div>
          <p className="mb-6 p-3 bg-black/30 rounded-md text-gray-300">{parsedPitch.whatsapp}</p>
          
          <div className="border-t border-white/10 my-4"></div>
          
          <div className="flex justify-between items-center mb-2">
             <h4 className="font-bold text-white text-base uppercase tracking-wider">E-mail</h4>
             <button onClick={() => handleCopy(parsedPitch.email)} className="text-xs flex items-center gap-1 text-[#A020F0] hover:text-white"><Copy size={12}/> Copiar</button>
          </div>
          <p className="p-3 bg-black/30 rounded-md text-gray-300">{parsedPitch.email}</p>
        </div>
      );
    }
    // Fallback for old, non-JSON pitches
    return <div className="font-mono text-sm text-gray-300 whitespace-pre-wrap">{item.pitch_text}</div>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <HistoryIcon className="text-[#A020F0]" /> Histórico de Projetos
          </h1>
          <p className="text-gray-400">Gerencie todos os seus prompts e pitches gerados.</p>
        </div>
        
        <div className="flex bg-[#111] p-1 rounded-lg border border-white/10">
          <button onClick={() => setActiveTab('sites')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'sites' ? 'bg-[#A020F0] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            <Globe size={16} /> Meus Sites
          </button>
          <button onClick={() => setActiveTab('pitches')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'pitches' ? 'bg-[#A020F0] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            <MessageSquare size={16} /> Meus Pitches
          </button>
        </div>
      </div>

      <AnimatePresence>
        {deleteError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg flex items-start gap-2 text-red-200 text-sm"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{deleteError}</span>
            <button onClick={() => setDeleteError(null)} className="ml-auto"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="lg:col-span-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 min-h-[300px] max-h-[calc(100vh-300px)]">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#A020F0]" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-xl">Nenhum histórico encontrado.</div>
          ) : (
            items.map((item) => (
              <div key={item.id} onClick={() => setSelectedItem(item)} className={`group p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${selectedItem?.id === item.id ? 'bg-[#A020F0]/10 border-[#A020F0] shadow-[0_0_15px_rgba(160,32,240,0.15)]' : 'bg-[#111] border-white/10 hover:border-white/30'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-sm truncate pr-6">{item.business_name}</h3>
                  {selectedItem?.id === item.id && <ChevronRight size={16} className="text-[#A020F0]" />}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <span className="bg-white/5 px-2 py-0.5 rounded text-gray-300 border border-white/5">{item.niche}</span>
                  {item.city && item.city !== 'N/A' && <span>• {item.city}</span>}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(item.created_at).toLocaleDateString()}</span>
                  
                  {/* TWO-STEP DELETE BUTTON */}
                  <div className="relative h-6 w-20 flex items-center justify-end">
                    <AnimatePresence>
                      {deletingId === item.id ? (
                        <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute right-0">
                          <Loader2 size={14} className="animate-spin text-gray-400" />
                        </motion.div>
                      ) : confirmingDeleteId === item.id ? (
                        <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute right-0 flex items-center gap-2 bg-red-900/50 border border-red-500/50 p-1 rounded-md">
                          <button onClick={(e) => executeDelete(item.id, e)} className="px-2 text-xs text-red-300 hover:text-white">Confirmar?</button>
                          <button onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(null); }} className="text-gray-400 hover:text-white"><X size={12}/></button>
                        </motion.div>
                      ) : (
                        <motion.button 
                          key="trash"
                          onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(item.id); }} 
                          className="absolute right-0 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-colors opacity-0 group-hover:opacity-100" 
                          title="Excluir"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-2 h-full min-h-[400px]">
          <GlowCard className="h-full bg-[#0A0A0A] flex flex-col relative overflow-hidden">
            {selectedItem ? (
              <>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 shrink-0">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedItem.business_name}</h2>
                    <p className="text-sm text-gray-400">{activeTab === 'sites' ? 'Prompt de Site' : 'Pitch de Vendas'} • {selectedItem.niche}</p>
                  </div>
                  <div className="flex gap-2">
                    {activeTab === 'sites' && (
                      <NeonButton variant="secondary" onClick={() => handleCopy(selectedItem.generated_prompt)} className="px-3 py-1.5 text-xs h-8">
                        <Copy size={14} /> Copiar
                      </NeonButton>
                    )}
                    <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><X size={18} /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/50 rounded-lg p-4 border border-white/5">
                  {activeTab === 'sites' ? (
                    <div className="font-mono text-sm text-gray-300 whitespace-pre-wrap">{selectedItem.generated_prompt}</div>
                  ) : (
                    renderPitchDetail(selectedItem)
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  {activeTab === 'sites' ? <Globe size={32} /> : <MessageSquare size={32} />}
                </div>
                <p>Selecione um item da lista para visualizar os detalhes.</p>
              </div>
            )}
          </GlowCard>
        </div>
      </div>
    </div>
  );
};