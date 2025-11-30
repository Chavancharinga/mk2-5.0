
import React, { useState, useRef, useEffect } from 'react';
import { Box, LogOut, User, ChevronDown, Settings } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  session: Session | null;
  onLogout: () => void;
  onLogin: () => void;
  onSettingsClick?: () => void;
  userName?: string;
  avatarUrl?: string;
}

export const Header: React.FC<Props> = ({ session, onLogout, onLogin, onSettingsClick, userName, avatarUrl }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dados do usuário
  const displayName = userName || session?.user.user_metadata?.full_name || 'Usuário';
  const userInitials = displayName ? displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'US';
  const userEmail = session?.user.email;
  const displayAvatarUrl = avatarUrl || session?.user.user_metadata?.avatar_url;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-6 md:px-12">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
        <div className="relative group">
          <Box className="text-[#A020F0] w-8 h-8 transition-transform group-hover:rotate-12 duration-500" />
          <div className="absolute inset-0 bg-[#A020F0] blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
        </div>
        <span className="text-xl font-bold tracking-tighter text-white">MK2 <span className="text-[#A020F0]">AI</span></span>
      </div>

      {/* User Area */}
      <div className="relative" ref={menuRef}>
        {session ? (
          <div>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 hover:bg-white/5 py-1.5 px-3 rounded-full transition-colors border border-transparent hover:border-white/10"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">{displayName}</p>
                <p className="text-[10px] text-gray-400">{userEmail}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#A020F0] to-[#C71585] p-0.5 shadow-[0_0_10px_rgba(160,32,240,0.4)]">
                 <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                    {displayAvatarUrl ? (
                        <img src={displayAvatarUrl} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-white text-xs font-bold">{userInitials}</span>
                    )}
                 </div>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-white/10 sm:hidden">
                    <p className="text-sm font-bold text-white">{displayName}</p>
                    <p className="text-xs text-gray-400">{userEmail}</p>
                  </div>
                  
                  <div className="p-2">
                    <button 
                      onClick={() => {
                        if (onSettingsClick) onSettingsClick();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                    >
                      <Settings size={16} /> Configurações
                    </button>
                    <div className="h-px bg-white/10 my-1 mx-2" />
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                    >
                      <LogOut size={16} /> Sair da Conta
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button 
            onClick={onLogin}
            className="flex items-center gap-2 text-sm font-bold text-white hover:text-[#A020F0] transition-colors px-4 py-2"
          >
            <User size={18} />
            Entrar
          </button>
        )}
      </div>
    </header>
  );
};
