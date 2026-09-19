import React from 'react';
import { Home, TrendingUp, Store, User, Scan, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { Screen, Language } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  language: Language;
  onCameraOpen: () => void;
}

const translations = {
  en: {
    home: "Home",
    markets: "Markets",
    scanner: "Scan",
    stores: "Stores",
    maps: "Maps",
    profile: "Profile"
  },
  hi: {
    home: "होम",
    markets: "मंडियां",
    scanner: "स्कैन",
    stores: "दुकानें",
    maps: "मैप्स",
    profile: "प्रोफाइल"
  },
  kn: {
    home: "ಮುಖಪುಟ",
    markets: "ಮಾರುಕಟ್ಟೆ",
    scanner: "ಸ್ಕ್ಯಾನ್",
    stores: "ಮಳಿಗೆಗಳು",
    maps: "ನಕ್ಷೆ",
    profile: "ಪ್ರೊಫೈಲ್"
  }
};

export const BottomNav: React.FC<BottomNavProps> = ({ 
  activeScreen, 
  onScreenChange, 
  language,
  onCameraOpen 
}) => {
  const t = translations[language] || translations.en;

  // Map active statuses to highlight correct tabs
  const isHomeActive = activeScreen === 'home';
  const isMarketsActive = activeScreen === 'market' || activeScreen === 'crop-details';
  const isStoresActive = activeScreen === 'suppliers';
  const isMapsActive = activeScreen === 'maps-agent';
  const isProfileActive = activeScreen === 'profile';

  return (
    <>
      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div id="mobile-bottom-nav" className="fixed bottom-0 left-0 w-full z-50 pointer-events-none md:hidden">
        {/* Background container with curved top edge and elevated drop shadow */}
        <div className="bg-white/95 backdrop-blur-xl border-t border-[#bfc9c3]/30 pb-safe pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pointer-events-auto relative">
          
          {/* Inner Nav Grid layout - 5 columns */}
          <div className="grid grid-cols-5 items-center px-3 h-16 relative">
            
            {/* 1. HOME TAB */}
            <button
              onClick={() => onScreenChange('home')}
              className={`flex flex-col items-center justify-center gap-1 h-14 rounded-2xl transition-all duration-200 ${
                isHomeActive ? 'text-[#003527] font-bold' : 'text-[#404944] hover:text-[#191c1d]'
              }`}
              style={{ minHeight: '48px', minWidth: '48px' }}
              aria-label="Home"
            >
              <div className="relative flex items-center justify-center p-1">
                {isHomeActive && (
                  <motion.div 
                    layoutId="mobile-active-bg"
                    className="absolute inset-0 bg-[#003527]/10 rounded-full scale-125"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Home size={22} strokeWidth={isHomeActive ? 2.5 : 1.8} className="relative z-10" />
              </div>
              <span className={`text-[11px] font-['Inter'] transition-all truncate max-w-full ${
                isHomeActive ? 'font-semibold text-[#003527]' : 'font-medium text-[#404944]'
              }`}>
                {t.home}
              </span>
            </button>

            {/* 2. MARKETS TAB */}
            <button
              onClick={() => onScreenChange('market')}
              className={`flex flex-col items-center justify-center gap-1 h-14 rounded-2xl transition-all duration-200 ${
                isMarketsActive ? 'text-[#003527] font-bold' : 'text-[#404944] hover:text-[#191c1d]'
              }`}
              style={{ minHeight: '48px', minWidth: '48px' }}
              aria-label="Markets"
            >
              <div className="relative flex items-center justify-center p-1">
                {isMarketsActive && (
                  <motion.div 
                    layoutId="mobile-active-bg"
                    className="absolute inset-0 bg-[#003527]/10 rounded-full scale-125"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <TrendingUp size={22} strokeWidth={isMarketsActive ? 2.5 : 1.8} className="relative z-10" />
              </div>
              <span className={`text-[11px] font-['Inter'] transition-all truncate max-w-full ${
                isMarketsActive ? 'font-semibold text-[#003527]' : 'font-medium text-[#404944]'
              }`}>
                {t.markets}
              </span>
            </button>

            {/* 3. CENTRAL SCANNER FLOATING ACTION BUTTON */}
            <div className="relative flex justify-center h-full">
              <div className="absolute -top-6 flex flex-col items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={onCameraOpen}
                  className="w-16 h-16 rounded-full bg-[#003527] hover:bg-[#064e3b] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(0,53,39,0.35)] border-4 border-[#f8f9fa] active:scale-95 transition-all cursor-pointer"
                  style={{ minHeight: '48px', minWidth: '48px' }}
                  aria-label="Trigger AI Crop Scanner"
                >
                  <Scan size={28} strokeWidth={2.4} className="text-white" />
                </motion.button>
              </div>
            </div>

            {/* 4. STORES TAB */}
            <button
              onClick={() => onScreenChange('suppliers')}
              className={`flex flex-col items-center justify-center gap-1 h-14 rounded-2xl transition-all duration-200 ${
                isStoresActive ? 'text-[#003527] font-bold' : 'text-[#404944] hover:text-[#191c1d]'
              }`}
              style={{ minHeight: '48px', minWidth: '48px' }}
              aria-label="Stores"
            >
              <div className="relative flex items-center justify-center p-1">
                {isStoresActive && (
                  <motion.div 
                    layoutId="mobile-active-bg"
                    className="absolute inset-0 bg-[#003527]/10 rounded-full scale-125"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Store size={22} strokeWidth={isStoresActive ? 2.5 : 1.8} className="relative z-10" />
              </div>
              <span className={`text-[11px] font-['Inter'] transition-all truncate max-w-full ${
                isStoresActive ? 'font-semibold text-[#003527]' : 'font-medium text-[#404944]'
              }`}>
                {t.stores}
              </span>
            </button>

            {/* 5. PROFILE TAB */}
            <button
              onClick={() => onScreenChange('profile')}
              className={`flex flex-col items-center justify-center gap-1 h-14 rounded-2xl transition-all duration-200 ${
                isProfileActive ? 'text-[#003527] font-bold' : 'text-[#404944] hover:text-[#191c1d]'
              }`}
              style={{ minHeight: '48px', minWidth: '48px' }}
              aria-label="Profile"
            >
              <div className="relative flex items-center justify-center p-1">
                {isProfileActive && (
                  <motion.div 
                    layoutId="mobile-active-bg"
                    className="absolute inset-0 bg-[#003527]/10 rounded-full scale-125"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <User size={22} strokeWidth={isProfileActive ? 2.5 : 1.8} className="relative z-10" />
              </div>
              <span className={`text-[11px] font-['Inter'] transition-all truncate max-w-full ${
                isProfileActive ? 'font-semibold text-[#003527]' : 'font-medium text-[#404944]'
              }`}>
                {t.profile}
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* DESKTOP SIDE NAVIGATION RAIL (LAPTOP OPTIMIZED VERTICAL NAV) */}
      <div 
        id="desktop-side-nav" 
        className="hidden md:flex fixed top-0 left-0 w-24 h-screen z-50 bg-[#f8f9fa] border-r border-[#bfc9c3]/30 flex-col items-center py-6 justify-between shadow-[2px_0_12px_rgba(0,0,0,0.03)] select-none transition-all duration-300"
      >
        {/* Top Logo Branding */}
        <div className="flex flex-col items-center gap-1.5 group cursor-pointer" onClick={() => onScreenChange('home')}>
          <motion.div 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md shadow-[#003527]/10 border border-[#137333]/20 overflow-hidden"
          >
            <img 
              src="/app-icon.svg" 
              alt="AgroCare Solution" 
              className="w-full h-full object-contain p-0.5" 
              referrerPolicy="no-referrer" 
            />
          </motion.div>
          <span className="text-[10px] font-bold tracking-widest text-[#191c1d] uppercase group-hover:text-[#003527] transition-colors font-['Hanken_Grotesk']">
            AgroCare
          </span>
        </div>

        {/* Central Vertical Navigation Tabs */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full px-3 my-4">
          
          {/* 1. Home */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => onScreenChange('home')}
              className={`relative flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl transition-all duration-200 cursor-pointer ${
                isHomeActive 
                  ? 'text-[#003527] bg-[#003527]/10 font-bold shadow-xs border border-[#003527]/20' 
                  : 'text-[#404944] hover:text-[#191c1d] hover:bg-[#edeeef] font-medium'
              }`}
              style={{ minHeight: '48px', minWidth: '48px' }}
              aria-label="Home Dashboard"
            >
              {isHomeActive && (
                <motion.div 
                  layoutId="desktop-active-indicator"
                  className="absolute -left-3 w-1.5 h-8 bg-[#003527] rounded-r-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Home size={22} strokeWidth={isHomeActive ? 2.5 : 2} />
              <span className="text-[10px] tracking-wider mt-0.5 font-['Inter']">{t.home}</span>
            </button>
            <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-[#191c1d] text-white text-xs font-semibold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-lg whitespace-nowrap z-50">
              {t.home} Dashboard
            </div>
          </div>

          {/* 2. Markets */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => onScreenChange('market')}
              className={`relative flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl transition-all duration-200 cursor-pointer ${
                isMarketsActive 
                  ? 'text-[#003527] bg-[#003527]/10 font-bold shadow-xs border border-[#003527]/20' 
                  : 'text-[#404944] hover:text-[#191c1d] hover:bg-[#edeeef] font-medium'
              }`}
              style={{ minHeight: '48px', minWidth: '48px' }}
              aria-label="Mandi Market Rates"
            >
              {isMarketsActive && (
                <motion.div 
                  layoutId="desktop-active-indicator"
                  className="absolute -left-3 w-1.5 h-8 bg-[#003527] rounded-r-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <TrendingUp size={22} strokeWidth={isMarketsActive ? 2.5 : 2} />
              <span className="text-[10px] tracking-wider mt-0.5 font-['Inter']">{t.markets}</span>
            </button>
            <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-[#191c1d] text-white text-xs font-semibold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-lg whitespace-nowrap z-50">
              Mandi Prices & Trends
            </div>
          </div>

          {/* 3. Central AI Scanner Trigger */}
          <div className="relative group w-full flex justify-center my-1">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onCameraOpen}
              className="relative w-16 h-16 rounded-2xl bg-[#003527] hover:bg-[#064e3b] text-white flex flex-col items-center justify-center shadow-lg shadow-[#003527]/30 border border-[#b0f0d6]/30 cursor-pointer transition-all"
              aria-label="Scan Crop or Leaf with AI"
            >
              <Scan size={24} strokeWidth={2.4} />
              <span className="text-[8px] tracking-widest font-bold text-white mt-0.5 font-['Inter']">SCAN</span>
            </motion.button>
            <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-[#191c1d] text-white text-xs font-semibold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-lg whitespace-nowrap z-50">
              AI Crop Leaf Scanner
            </div>
          </div>

          {/* 4. Stores */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => onScreenChange('suppliers')}
              className={`relative flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl transition-all duration-200 cursor-pointer ${
                isStoresActive 
                  ? 'text-[#003527] bg-[#003527]/10 font-bold shadow-xs border border-[#003527]/20' 
                  : 'text-[#404944] hover:text-[#191c1d] hover:bg-[#edeeef] font-medium'
              }`}
              style={{ minHeight: '48px', minWidth: '48px' }}
              aria-label="Input Stores & Dealers"
            >
              {isStoresActive && (
                <motion.div 
                  layoutId="desktop-active-indicator"
                  className="absolute -left-3 w-1.5 h-8 bg-[#003527] rounded-r-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Store size={22} strokeWidth={isStoresActive ? 2.5 : 2} />
              <span className="text-[10px] tracking-wider mt-0.5 font-['Inter']">{t.stores}</span>
            </button>
            <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-[#191c1d] text-white text-xs font-semibold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-lg whitespace-nowrap z-50">
              Certified Fertilizer & Seed Stores
            </div>
          </div>

          {/* 5. Google Maps Agent */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => onScreenChange('maps-agent')}
              className={`relative flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl transition-all duration-200 cursor-pointer ${
                isMapsActive 
                  ? 'text-[#003527] bg-[#003527]/10 font-bold shadow-xs border border-[#003527]/20' 
                  : 'text-[#404944] hover:text-[#191c1d] hover:bg-[#edeeef] font-medium'
              }`}
              style={{ minHeight: '48px', minWidth: '48px' }}
              aria-label="Google Maps Agent"
            >
              {isMapsActive && (
                <motion.div 
                  layoutId="desktop-active-indicator"
                  className="absolute -left-3 w-1.5 h-8 bg-[#003527] rounded-r-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Compass size={22} strokeWidth={isMapsActive ? 2.5 : 2} />
              <span className="text-[10px] tracking-wider mt-0.5 font-['Inter']">{t.maps}</span>
            </button>
            <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-[#191c1d] text-white text-xs font-semibold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-lg whitespace-nowrap z-50">
              Google Maps Agent (Mandis & Routes)
            </div>
          </div>

          {/* 6. Profile */}
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => onScreenChange('profile')}
              className={`relative flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl transition-all duration-200 cursor-pointer ${
                isProfileActive 
                  ? 'text-[#003527] bg-[#003527]/10 font-bold shadow-xs border border-[#003527]/20' 
                  : 'text-[#404944] hover:text-[#191c1d] hover:bg-[#edeeef] font-medium'
              }`}
              style={{ minHeight: '48px', minWidth: '48px' }}
              aria-label="Farmer Profile"
            >
              {isProfileActive && (
                <motion.div 
                  layoutId="desktop-active-indicator"
                  className="absolute -left-3 w-1.5 h-8 bg-[#003527] rounded-r-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <User size={22} strokeWidth={isProfileActive ? 2.5 : 2} />
              <span className="text-[10px] tracking-wider mt-0.5 font-['Inter']">{t.profile}</span>
            </button>
            <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-[#191c1d] text-white text-xs font-semibold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-lg whitespace-nowrap z-50">
              Farm Profile & Settings
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
