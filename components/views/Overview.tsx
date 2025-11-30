
import React, { useEffect, useState } from 'react';
import { GlowCard, NeonButton } from '../ui/NeonComponents';
import { TrendingUp, Users, DollarSign, Globe, ArrowRight, Loader2, MessageSquare, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface Props {
  onNavigate: (view: 'generator') => void;
  session: Session;
}

export const Overview: React.FC<Props> = ({ onNavigate, session }) => {
  const [siteCount, setSiteCount] = useState(0);
  const [pitchCount, setPitchCount] = useState(0);
  const [recentSites, setRecentSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user name from metadata or fallback to email name
  const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch sites count
        const { count: sites } = await supabase
          .from('generated_sites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id);
        
        if (sites !== null) setSiteCount(sites);

        // Fetch pitches count
        const { count: pitches } = await supabase
          .from('generated_pitches')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id);
        
        if (pitches !== null) setPitchCount(pitches);

        // Fetch recent sites
        const { data } = await supabase
          .from('generated_sites')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (data) setRecentSites(data);

      } catch (error) {
        console.error('Erro ao buscar stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session.user.id]);

  const handleOpenTutorial = () => {
    // Abre uma busca relevante no YouTube sobre como vender sites
    window.open('https://www.youtube.com/results?search_query=como+vender+sites+para+negocios+locais', '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Bem-vindo, <span className="text-[#A020F0]">{userName}</span></h1>
          <p className="text-gray-400">Aqui está o resumo da sua operação hoje.</p>
        </div>
        <NeonButton onClick={() => onNavigate('generator')}>
          Novo Projeto <ArrowRight size={16} />
        </NeonButton>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Sites Gerados', value: loading ? '...' : siteCount.toString(), icon: Globe, color: '#A020F0' },
          { label: 'Pitches Criados', value: loading ? '...' : pitchCount.toString(), icon: MessageSquare, color: '#00BFFF' }, 
          { label: 'Taxa de Conversão', value: '18%', icon: TrendingUp, color: '#00FF7F' }, // Mockado por enquanto
          { label: 'Potencial (Mês)', value: `€ ${(siteCount * 200).toLocaleString()}`, icon: DollarSign, color: '#FFD700' },
        ].map((stat, i) => (
          <GlowCard key={i} className="flex flex-col gap-2 bg-[#111]">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase">{stat.label}</span>
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <span className="text-2xl font-bold text-white">{stat.value}</span>
          </GlowCard>
        ))}
      </div>

      {/* Recent Activity / Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-white font-bold text-lg">Últimos Projetos Gerados</h3>
          <div className="bg-[#111] border border-white/10 rounded-xl p-4 space-y-3 min-h-[200px]">
             {loading ? (
               <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#A020F0]" /></div>
             ) : recentSites.length === 0 ? (
               <div className="text-gray-500 text-center py-10 text-sm">Nenhum site gerado ainda. Comece agora!</div>
             ) : (
               recentSites.map((item, i) => (
                 <div key={item.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-b border-white/5 last:border-0">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded bg-[#A020F0]/20 flex items-center justify-center text-[#A020F0] font-bold text-xs">
                       AI
                     </div>
                     <div>
                       <h4 className="text-white font-medium text-sm">{item.business_name}</h4>
                       <p className="text-gray-500 text-xs">
                         {new Date(item.created_at).toLocaleDateString()} - {item.city}
                       </p>
                     </div>
                   </div>
                   <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300">Prompt Gerado</span>
                 </div>
               ))
             )}
          </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-white font-bold text-lg">Dicas da IA</h3>
           <GlowCard className="bg-gradient-to-br from-[#A020F0]/20 to-black border-[#A020F0]/30 h-full">
             <h4 className="font-bold text-white mb-2">Aumente suas vendas</h4>
             <p className="text-sm text-gray-400 mb-4">
               Freelancers que enviam um "Pitch Personalizado" junto com o link do preview têm 3x mais chance de fechar negócio.
             </p>
             <NeonButton 
               variant="secondary" 
               fullWidth 
               className="text-xs flex items-center justify-center gap-2"
               onClick={handleOpenTutorial}
             >
               Ver Tutorial <ExternalLink size={12} />
             </NeonButton>
           </GlowCard>
        </div>
      </div>
    </div>
  );
};
