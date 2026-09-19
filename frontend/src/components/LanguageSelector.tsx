import React, { useState, useRef, useEffect } from 'react';
import i18n from '../i18n';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
];

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
  currentLanguage?: Language;
  onLanguageChange?: (code: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  compact = false, 
  className = '',
  currentLanguage: propLanguage,
  onLanguageChange: propOnChange
}) => {
  const [currentCode, setCurrentCode] = useState<string>(() => {
    return propLanguage || (i18n.language?.split('-')[0] || 'en');
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (propLanguage) {
      setCurrentCode(propLanguage);
    }
  }, [propLanguage]);

  useEffect(() => {
    const handleLangChanged = (lng: string) => {
      const shortCode = lng?.split('-')[0] || 'en';
      setCurrentCode(shortCode);
    };

    i18n.on('languageChanged', handleLangChanged);
    return () => {
      i18n.off('languageChanged', handleLangChanged);
    };
  }, []);

  const activeLanguageObj = languages.find(l => l.code === currentCode) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (code: string) => {
    i18n.changeLanguage(code);
    setCurrentCode(code);
    if (propOnChange) {
      propOnChange(code);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-3 sm:px-3.5 bg-white hover:bg-[#edeeef] text-[#191c1d] rounded-2xl border border-[#bfc9c3]/40 shadow-2xs transition-all flex items-center gap-2 cursor-pointer select-none active:scale-98"
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Globe size={16} className="text-[#003527] shrink-0" />
        <span className="text-xs font-bold text-[#191c1d] tracking-tight">
          {activeLanguageObj.native}
        </span>
        <ChevronDown 
          size={14} 
          className={`text-[#404944] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-[#bfc9c3]/40 p-1.5 z-[100] overflow-hidden"
          >
            <div className="px-3 py-1.5 border-b border-[#bfc9c3]/20 mb-1">
              <span className="text-[10px] font-extrabold text-[#404944] uppercase tracking-wider">
                Language / भाषा
              </span>
            </div>
            <div className="space-y-0.5 max-h-60 overflow-y-auto">
              {languages.map((lang) => {
                const isSelected = activeLanguageObj.code === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-[#003527]/10 text-[#003527] font-bold' 
                        : 'text-[#191c1d] hover:bg-[#f3f4f5] font-medium'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{lang.native}</span>
                      <span className="text-[10px] text-[#404944]">{lang.name}</span>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-[#003527] stroke-[3]" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

