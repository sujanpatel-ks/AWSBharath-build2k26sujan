import React, { useState } from 'react';
import { WifiOff, ShieldCheck, RefreshCw, Layers, ChevronRight, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useConnectivity } from '../services/connectivity';
import { Language } from '../types';

interface OfflineBannerProps {
  language: Language;
  onOpenOfflineLibrary?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ language, onOpenOfflineLibrary }) => {
  const isOnline = useConnectivity();
  const [dismissed, setDismissed] = useState(false);

  // If online or manually dismissed during this session, don't show
  if (isOnline || dismissed) {
    return null;
  }

  const translations = {
    en: {
      title: "Offline Mode Active",
      subtitle: "ServiceWorker persistence enabled. Diagnosis Dashboard, treatment dosages, and past scans are cached and available offline.",
      libraryBtn: "Offline Guides",
      dismiss: "Dismiss"
    },
    hi: {
      title: "ऑफ़लाइन मोड सक्रिय",
      subtitle: "सर्विस वर्कर सक्रिय है। फसल निदान डैशबोर्ड, उपचार खुराक और पुराने रिकॉर्ड बिना इंटरनेट के उपलब्ध हैं।",
      libraryBtn: "ऑफ़लाइन गाइड",
      dismiss: "हटाएं"
    },
    kn: {
      title: "ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ",
      subtitle: "ಸರ್ವಿಸ್ ವರ್ಕರ್ ಆನ್‌ ಆಗಿದೆ. ರೋಗನಿರ್ಣಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಮತ್ತು ಚಿಕಿತ್ಸೆ ಮಾಹಿತಿ ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆ ಲಭ್ಯವಿದೆ.",
      libraryBtn: "ಆಫ್‌ಲೈನ್ ಗೈಡ್‌ಗಳು",
      dismiss: "ಮುಚ್ಚಿ"
    }
  };

  const t = translations[language] || translations.en;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-amber-50 px-4 py-2.5 shadow-md flex items-center justify-between gap-3 border-b border-amber-700/50 z-40 sticky top-0"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-amber-700/60 border border-amber-600/60 flex items-center justify-center shrink-0">
            <WifiOff size={16} className="text-amber-200 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wide uppercase text-amber-200 flex items-center gap-1">
                {t.title}
              </span>
              <span className="bg-amber-700/80 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-600/40 hidden sm:inline-flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-300" /> Cached
              </span>
            </div>
            <p className="text-[11px] text-amber-100/90 font-medium truncate sm:whitespace-normal">
              {t.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenOfflineLibrary && (
            <button
              onClick={onOpenOfflineLibrary}
              className="bg-amber-700 hover:bg-amber-600 active:scale-95 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-amber-500/60 shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <Layers size={13} className="text-amber-200" />
              <span className="hidden xs:inline">{t.libraryBtn}</span>
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            title={t.dismiss}
            className="text-amber-200 hover:text-white p-1 rounded-lg hover:bg-amber-700/50 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
