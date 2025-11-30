import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardState, NicheType, VisualStyle } from '../types';
import { Step0_ModeSelection } from './steps/Step0_ModeSelection';
import { Step1_Location } from './steps/Step1_Location';
import { StepCustom_Details } from './steps/StepCustom_Details';
import { Step2_Business } from './steps/Step2_Business';
import { Step3_Customization } from './steps/Step3_Customization';
import { Step4_Generation } from './steps/Step4_Generation';
import { Session } from '@supabase/supabase-js';

const INITIAL_STATE: WizardState = {
  step: 0,
  mode: null,
  referenceImage: null,
  location: { city: '', district: '', country: '' },
  niche: NicheType.OTHER,
  customNiche: '',
  selectedBusiness: null,
  customProjectName: '',
  customProjectDescription: '',
  customColors: ['#A020F0', '#FFFFFF'],
  customFeatures: [],
  customization: {
    colors: ['#A020F0', '#C71585'],
    style: VisualStyle.MODERN,
    features: ['Agendamento Online', 'Botão WhatsApp'],
    tagline: ''
  },
  generatedPrompt: ''
};

interface Props {
  session?: Session;
}

export const Wizard: React.FC<Props> = ({ session }) => {
  const [state, setState] = useState<WizardState>(INITIAL_STATE);

  const updateData = (updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (state.step === 1 && state.mode === 'custom') {
      setState(prev => ({ ...prev, step: 4 })); // Pula para a geração
    } else {
      setState(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };
  
  const prevStep = () => {
     // A lógica de voltar do passo 3 para o 2 no modo business
    if (state.step === 3 && state.mode === 'business') {
        setState(prev => ({ ...prev, step: 2 }));
    } else {
        setState(prev => ({ ...prev, step: Math.max(0, prev.step - 1) }));
    }
  };
  
  const reset = () => setState(INITIAL_STATE);

  const renderStep = () => {
    switch (state.step) {
      case 0: return <Step0_ModeSelection updateData={updateData} onNext={nextStep} />;
      case 1: 
        return state.mode === 'business' 
          ? <Step1_Location data={state} updateData={updateData} onNext={nextStep} /> 
          : <StepCustom_Details data={state} updateData={updateData} onNext={nextStep} onBack={() => setState(p => ({...p, step: 0}))} />;
      case 2: 
        return state.mode === 'business' 
          ? <Step2_Business data={state} updateData={updateData} onNext={nextStep} onBack={prevStep} />
          : null; // Skipped in custom mode
      case 3: 
        return state.mode === 'business'
          ? <Step3_Customization data={state} updateData={updateData} onNext={nextStep} onBack={prevStep} />
          : null; // Skipped in custom mode
      case 4: 
        const customOnBack = () => setState(p => ({...p, step: 1}));
        const businessOnBack = () => setState(p => ({...p, step: 3}));
        return <Step4_Generation data={state} onReset={reset} session={session} onBack={state.mode === 'custom' ? customOnBack : businessOnBack} />;
      default: return null;
    }
  };

  // Logic for dynamic progress bar
  const progressSteps = state.mode === 'custom' ? [1, 2] : [1, 2, 3, 4];
  const currentProgressStep = state.step === 0 ? 0 :
    state.mode === 'business' ? state.step :
    state.step === 1 ? 1 :
    state.step === 4 ? 2 : 0;

  return (
    <div className="max-w-4xl mx-auto w-full">
      {state.step > 0 && (
        <div className="mb-8 flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-800 -z-0" />
          {progressSteps.map((s) => {
             const isActive = s <= currentProgressStep;
             return (
               <motion.div 
                 key={s}
                 initial={false}
                 animate={{ 
                   backgroundColor: isActive ? '#A020F0' : '#111',
                   borderColor: isActive ? '#A020F0' : '#333',
                   scale: isActive ? 1.1 : 1
                 }}
                 className="w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 relative"
               >
                 <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>{s}</span>
                 {currentProgressStep === s && (
                   <motion.div 
                     layoutId="step-glow"
                     className="absolute inset-0 rounded-full bg-[#A020F0] blur-md opacity-50"
                   />
                 )}
               </motion.div>
             );
          })}
        </div>
      )}

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={`${state.mode}-${state.step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};