import React, { useState, useRef, useEffect } from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, UploadCloud, X, Image as ImageIcon } from 'lucide-react';

// --- Neon Button ---
interface NeonButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const NeonButton: React.FC<NeonButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "relative px-6 py-3 font-bold text-sm tracking-wide rounded-md transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group";
  
  const variants = {
    primary: "bg-transparent text-white border-2 border-[#A020F0] hover:bg-[#A020F0]/10 shadow-[0_0_10px_rgba(160,32,240,0.3)] hover:shadow-[0_0_20px_rgba(160,32,240,0.6)]",
    secondary: "bg-white text-black hover:bg-gray-200 border-2 border-white",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === 'primary' && (
        <div className="absolute inset-0 -z-0 bg-gradient-to-r from-[#A020F0] to-[#C71585] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      )}
    </motion.button>
  );
};

// --- Glow Card ---
interface GlowCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  selected?: boolean;
  children?: React.ReactNode;
}

export const GlowCard: React.FC<GlowCardProps> = ({ children, className = '', selected, ...props }) => {
  return (
    <motion.div
      className={`
        relative bg-black border rounded-xl p-6 transition-all duration-300
        ${selected 
          ? 'border-[#A020F0] shadow-[0_0_30px_rgba(160,32,240,0.25)]' 
          : 'border-white/10 hover:border-[#A020F0]/50 hover:shadow-[0_0_15px_rgba(160,32,240,0.15)]'
        }
        ${className}
      `}
      {...props}
    >
      {children}
      {selected && (
        <motion.div 
          layoutId="card-glow"
          className="absolute inset-0 rounded-xl border-2 border-[#A020F0] pointer-events-none"
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
};

// --- Neon Input ---
interface NeonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const NeonInput: React.FC<NeonInputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</label>}
      <input
        className={`
          w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white
          focus:outline-none focus:border-[#A020F0] focus:ring-1 focus:ring-[#A020F0]
          placeholder-gray-600 transition-all duration-300
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

// --- Neon Autocomplete ---
interface AutocompleteOption {
  label: string;
  value: string;
  icon?: string;
}

interface NeonAutocompleteProps {
  label: string;
  placeholder?: string;
  options: AutocompleteOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const NeonAutocomplete: React.FC<NeonAutocompleteProps> = ({ 
  label, 
  placeholder, 
  options, 
  value, 
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selected = options.find(opt => opt.value === value);
    if (selected) {
        setSearchTerm(selected.label);
    } else {
        setSearchTerm(value || '');
    }
  }, [value, options]);

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: AutocompleteOption) => {
    onChange(option.value);
    setSearchTerm(option.label);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setSearchTerm(newVal);
    onChange(newVal);
    setIsOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`flex flex-col gap-2 w-full relative ${className}`} ref={containerRef}>
      {label && <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</label>}
      
      <div className="relative">
        <input
            type="text"
            className={`
            w-full bg-black/50 border border-white/20 rounded-lg pl-4 pr-10 py-3 text-white
            focus:outline-none focus:border-[#A020F0] focus:ring-1 focus:ring-[#A020F0]
            placeholder-gray-600 transition-all duration-300
            `}
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
        />
        <ChevronDown 
            size={16} 
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      <AnimatePresence>
        {isOpen && filteredOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-[#333] rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar z-50"
          >
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option)}
                className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-[#A020F0]/10 hover:text-white flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2">
                    {option.icon && <span className="text-lg">{option.icon}</span>}
                    <span>{option.label}</span>
                </div>
                {value === option.value && <Check size={14} className="text-[#A020F0]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Neon Image Upload ---
interface NeonImageUploadProps {
  value: string | null;
  onChange: (base64: string | null) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const NeonImageUpload: React.FC<NeonImageUploadProps> = ({ value, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem (PNG, JPG).');
        return;
      }
      const base64 = await fileToBase64(file);
      onChange(base64);
    }
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-white font-bold"><ImageIcon size={18} /> Imagem de Referência (Opcional)</label>
      
      <div
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDrop={() => setIsDragging(false)}
        className={`
          relative w-full p-6 border-2 border-dashed rounded-xl transition-colors
          ${isDragging ? 'border-[#A020F0] bg-[#A020F0]/10' : 'border-white/20'}
        `}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="flex flex-col items-center justify-center text-center text-gray-400 pointer-events-none">
          <UploadCloud size={32} className="mb-2" />
          <p className="font-semibold">Arraste uma imagem ou <span className="text-[#A020F0]">clique para carregar</span></p>
          <p className="text-xs mt-1">Envie um print ou design para a IA analisar</p>
        </div>
      </div>

      <AnimatePresence>
        {value && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative w-full max-w-xs mx-auto overflow-hidden"
          >
            <p className="text-xs text-gray-500 mb-2 font-bold uppercase text-center">Preview:</p>
            <div className="relative group">
              <img src={value} alt="Preview da imagem de referência" className="w-full h-auto rounded-lg border border-white/10 shadow-lg" />
              <button
                onClick={() => onChange(null)}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};