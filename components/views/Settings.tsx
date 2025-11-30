
import React, { useState, useEffect } from 'react';
import { NeonInput, NeonButton, GlowCard } from '../ui/NeonComponents';
import { supabase } from '../../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { User, Lock, Save, Loader2, CheckCircle, AlertCircle, Camera, UploadCloud } from 'lucide-react';

interface Props {
  session: Session;
}

export const Settings: React.FC<Props> = ({ session }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: session.user.email || '',
    avatarUrl: '',
    password: '',
    confirmPassword: ''
  });

  // 1. Buscar dados reais do banco de dados (tabela profiles) ao montar
  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setFormData(prev => ({
            ...prev,
            fullName: data.full_name || session.user.user_metadata?.full_name || '',
            avatarUrl: data.avatar_url || session.user.user_metadata?.avatar_url || ''
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [session]);

  // 2. Lógica de Upload de Imagem
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setErrorMsg('');

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Selecione uma imagem para fazer upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload para o bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setFormData(prev => ({ ...prev, avatarUrl: data.publicUrl }));
      setSuccessMsg('Imagem carregada! Clique em "Salvar Alterações" para confirmar.');

    } catch (error: any) {
      setErrorMsg(error.message || 'Erro no upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const updates: any = {
        data: {
          full_name: formData.fullName,
          avatar_url: formData.avatarUrl
        }
      };

      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("As senhas não coincidem.");
        }
        updates.password = formData.password;
      }

      // 1. Atualizar Auth User (Para manter a sessão sincronizada)
      const { error: authError } = await supabase.auth.updateUser(updates);
      if (authError) throw authError;

      // 2. Atualizar Tabela Public Profiles (Banco de Dados)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          full_name: formData.fullName,
          avatar_url: formData.avatarUrl,
          email: formData.email, // Garantir que email esteja salvo
          updated_at: new Date().toISOString()
        });
      
      if (profileError) throw profileError;

      setSuccessMsg('Perfil atualizado com sucesso!');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      
    } catch (error: any) {
      setErrorMsg(error.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <User className="text-[#A020F0]" /> Configurações do Perfil
        </h1>
        <p className="text-gray-400">Gerencie suas informações pessoais e segurança.</p>
      </div>

      <GlowCard className="bg-[#111] p-8">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          
          {/* Avatar Upload Section */}
          <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#A020F0] to-[#C71585] p-1 shadow-[0_0_20px_rgba(160,32,240,0.3)]">
                <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center relative">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {formData.fullName?.substring(0,2).toUpperCase() || 'US'}
                    </span>
                  )}
                  
                  {/* Overlay de Loading ou Hover */}
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {uploading ? (
                      <Loader2 className="animate-spin text-white" size={24} />
                    ) : (
                      <>
                        <Camera className="text-white mb-1" size={24} />
                        <span className="text-[10px] text-white font-bold uppercase">Alterar</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
              
              {/* Hidden File Input */}
              <input 
                type="file" 
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h3 className="text-white font-bold text-lg">{formData.fullName || 'Seu Nome'}</h3>
              <p className="text-gray-400 text-sm">{formData.email}</p>
              <div className="pt-2">
                <label 
                  htmlFor="avatar-upload"
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 cursor-pointer transition-colors
                    ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <UploadCloud size={16} />
                  {uploading ? 'Enviando...' : 'Carregar nova foto'}
                </label>
                <p className="text-xs text-gray-500 mt-2">Recomendado: 400x400px (JPG, PNG)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NeonInput 
              label="Nome Completo"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Seu nome"
            />
            
            <div className="opacity-60 cursor-not-allowed">
              <NeonInput 
                label="E-mail (Não editável)"
                value={formData.email}
                readOnly
                onChange={() => {}}
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 mt-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Lock size={16} className="text-[#A020F0]" /> Alterar Senha
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NeonInput 
                type="password"
                label="Nova Senha"
                placeholder="Deixe em branco para manter"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <NeonInput 
                type="password"
                label="Confirmar Senha"
                placeholder="Repita a nova senha"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 flex items-center gap-2 text-green-200 text-sm animate-in slide-in-from-top-2">
              <CheckCircle size={16} /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-2 text-red-200 text-sm animate-in slide-in-from-top-2">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <NeonButton type="submit" disabled={loading || uploading} className="px-8">
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Salvando...</span>
              ) : (
                <span className="flex items-center gap-2"><Save size={18} /> Salvar Alterações</span>
              )}
            </NeonButton>
          </div>

        </form>
      </GlowCard>
    </div>
  );
};
