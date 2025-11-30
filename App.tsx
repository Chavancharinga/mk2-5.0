import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Dashboard, ViewType } from './components/Dashboard';
import { Auth } from './components/Auth';
import { MoleculeBackground } from './components/ui/MolecularBackground';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardView, setDashboardView] = useState<ViewType>('overview');
  // Novo estado para perfil do usuário (persistência visual)
  const [userProfile, setUserProfile] = useState<{name: string, avatar: string} | null>(null);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      setLoading(false);
    });

    // Escutar mudanças de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', userId)
      .single();
    
    if (data) {
      setUserProfile({
        name: data.full_name,
        avatar: data.avatar_url
      });
    }
  };

  const handleStart = () => {
    if (session) {
      setDashboardView('overview');
    } else {
      setShowAuth(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowAuth(false);
    setDashboardView('overview');
    setUserProfile(null);
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-[#A020F0]">Carregando...</div>;
  }

  // FIX: h-screen + overflow-y-auto aqui substitui o scroll do body que foi desativado
  return (
    <div className="h-screen w-full bg-black text-white font-sans selection:bg-[#A020F0] selection:text-white relative overflow-y-auto overflow-x-hidden">
      {/* Background Layer */}
      <MoleculeBackground />
      
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-[1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat brightness-100 contrast-150" />

      {/* Global Header with Profile Menu */}
      <Header 
        session={session} 
        onLogout={handleLogout} 
        onLogin={() => setShowAuth(true)} 
        onSettingsClick={() => setDashboardView('settings')}
        userName={userProfile?.name}
        avatarUrl={userProfile?.avatar}
      />
      
      {/* Content Layer */}
      <div className="relative z-10 pt-16">
        {!session ? (
          !showAuth ? (
            <main className="pb-20 px-4">
               <Hero onStart={handleStart} />
            </main>
          ) : (
            <Auth />
          )
        ) : (
          <Dashboard 
            onLogout={handleLogout} 
            session={session} 
            currentView={dashboardView}
            onViewChange={setDashboardView}
          />
        )}
      </div>
    </div>
  );
}

export default App;