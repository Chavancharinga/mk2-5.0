
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Wand2, MessageSquare, LogOut, Menu, X, User, History as HistoryIcon } from 'lucide-react';
import { Overview } from './views/Overview';
import { Wizard } from './Wizard';
import { PitchGenerator } from './views/PitchGenerator';
import { Settings } from './views/Settings';
import { History } from './views/History';
import { Session } from '@supabase/supabase-js';

export type ViewType = 'overview' | 'generator' | 'pitch' | 'settings' | 'history';

interface Props {
  onLogout: () => void;
  session: Session;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Dashboard: React.FC<Props> = ({ onLogout, session, currentView, onViewChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const MENU_ITEMS = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'generator', label: 'Gerar Prompt', icon: Wand2 },
    { id: 'pitch', label: 'Pitch de Vendas', icon: MessageSquare },
    { id: 'history', label: 'Histórico', icon: HistoryIcon },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'overview': return <Overview onNavigate={(v) => onViewChange(v)} session={session} />;
      case 'generator': return <Wizard session={session} />;
      case 'pitch': return <PitchGenerator session={session} />;
      case 'settings': return <Settings session={session} />;
      case 'history': return <History session={session} />;
      default: return <Overview onNavigate={(v) => onViewChange(v)} session={session} />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] relative bg-transparent">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed bottom-4 right-4 z-50 md:hidden bg-[#A020F0] text-white p-4 rounded-full shadow-lg border-2 border-white"
      >
        {isMobileMenuOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar - FIXED POSITION */}
      <motion.aside 
        className={`
          fixed top-16 left-0 bottom-0 w-64 bg-black/95 backdrop-blur-xl border-r border-white/10 
          flex flex-col z-40
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="p-6">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Menu Principal</div>
          <nav className="space-y-2">
            {MENU_ITEMS.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id as ViewType);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300
                    ${isActive 
                      ? 'bg-[#A020F0]/10 text-white border border-[#A020F0]/50 shadow-[0_0_15px_rgba(160,32,240,0.2)]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
                  `}
                >
                  <item.icon size={18} className={isActive ? 'text-[#A020F0]' : ''} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="md:ml-64 flex-1 p-6 md:p-10 min-h-[calc(100vh-64px)] relative">
         <AnimatePresence mode="wait">
           <motion.div
             key={currentView}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             transition={{ duration: 0.2 }}
             className="h-full"
           >
             {renderView()}
           </motion.div>
         </AnimatePresence>
      </main>
    </div>
  );
};
