import React from 'react';
import { motion } from 'framer-motion';
import { NeonButton } from './ui/NeonComponents';
import { ArrowRight } from 'lucide-react';

interface Props {
  onStart: () => void;
}

export const Hero: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative pt-16">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#A020F0] rounded-full blur-[120px] opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl z-10 space-y-6"
      >
        <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#A020F0] text-xs font-bold tracking-widest uppercase mb-4">
          Beta Público
        </span>
        
        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
          Sites profissionais em <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A020F0] to-[#C71585]">
            5 minutos com IA
          </span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Barbearias, mercados, salões... escolha seu nicho e cidade. Nossa IA analisa o mercado local e gera o prompt perfeito para seu site completo.
        </p>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <NeonButton onClick={onStart} className="px-8 py-4 text-lg">
            Começar Agora - Grátis <ArrowRight size={20} />
          </NeonButton>
          <p className="text-gray-500 text-sm mt-2 sm:mt-0">Sem cartão de crédito • Deploy imediato</p>
        </div>
      </motion.div>
      
      {/* Floating 3D Elements Mockup */}
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.5, duration: 1 }}
         className="mt-20 w-full max-w-5xl h-[300px] relative perspective-1000 hidden md:block"
      >
         <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[10%] top-0 bg-[#111] border border-gray-800 p-4 rounded-xl shadow-2xl w-64 rotate-y-12 transform-style-3d"
         >
           <div className="h-4 w-1/2 bg-gray-700 rounded mb-2" />
           <div className="h-24 bg-[#A020F0]/20 rounded mb-2" />
           <div className="space-y-2">
             <div className="h-2 bg-gray-800 rounded w-full" />
             <div className="h-2 bg-gray-800 rounded w-2/3" />
           </div>
         </motion.div>

         <motion.div 
            animate={{ y: [0, -30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute right-[10%] top-10 bg-[#111] border border-gray-800 p-4 rounded-xl shadow-2xl w-64 -rotate-y-12 z-0"
         >
           <div className="flex gap-2 mb-4">
             <div className="w-8 h-8 rounded-full bg-gray-700" />
             <div className="flex-1">
                <div className="h-3 bg-gray-700 rounded w-20 mb-1" />
                <div className="h-2 bg-gray-800 rounded w-12" />
             </div>
           </div>
           <div className="h-20 bg-[#C71585]/20 rounded" />
         </motion.div>
      </motion.div>
    </div>
  );
};
