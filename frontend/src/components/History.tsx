import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ChevronRight, Award, Trash2, Loader2, Calendar, FileDown, Sprout, Search, Inbox, AlertOctagon, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthProvider';
import { Language } from '../types';
import { toast } from 'sonner';
import { getAuthHeaders } from '../firebase';

interface HistoryProps {
  language: Language;
  onSelectScan: (scan: any) => void;
  onNavigate: (screen: any) => void;
}

const historyTranslations = {
  en: {
    title: "Diagnosis History",
    subtitle: "Track your past crop diagnoses",
    searchPlaceholder: "Search crops or diseases...",
    noScans: "No Diagnosis History Yet",
    noScansDesc: "Scan an affected crop leaf to diagnose diseases and track them here.",
    confidence: "Confidence Match",
    deleteSuccess: "Diagnosis deleted successfully",
    loading: "Loading scan history...",
    allCrops: "All Crops",
    severityFilter: "Severity",
    allSeverities: "All Severities"
  },
  hi: {
    title: "निदान इतिहास",
    subtitle: "अपने पिछले फसल निदान को ट्रैक करें",
    searchPlaceholder: "फसलों या बीमारियों की खोज करें...",
    noScans: "अभी तक कोई इतिहास नहीं",
    noScansDesc: "बीमारियों का निदान करने और उन्हें यहाँ ट्रैक करने के लिए फसल के पत्ते को स्कैन करें।",
    confidence: "विश्वास मिलान",
    deleteSuccess: "निदान सफलतापूर्वक हटा दिया गया",
    loading: "इतिहास लोड हो रहा है...",
    allCrops: "सभी फसलें",
    severityFilter: "गंभीरता",
    allSeverities: "सभी गंभीरताएं"
  },
  kn: {
    title: "ರೋಗನಿರ್ಣಯದ ಇತಿಹಾಸ",
    subtitle: "ನಿಮ್ಮ ಹಿಂದಿನ ಬೆಳೆ ರೋಗನಿರ್ಣಯಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    searchPlaceholder: "ಬೆಳೆ ಅಥವಾ ರೋಗಗಳನ್ನು ಹುಡುಕಿ...",
    noScans: "ಇನ್ನೂ ಯಾವುದೇ ಇತಿಹಾಸವಿಲ್ಲ",
    noScansDesc: "ರೋಗಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲು ಮತ್ತು ಅವುಗಳನ್ನು ಇಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಬೆಳೆಯ ಎಲೆಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
    confidence: "ವಿಶ್ವಾಸಾರ್ಹತೆ ಹೊಂದಾಣಿಕೆ",
    deleteSuccess: "ರೋಗನಿರ್ಣಯವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ",
    loading: "ಇತಿಹಾಸ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    allCrops: "ಎಲ್ಲಾ ಬೆಳೆಗಳು",
    severityFilter: "ತೀವ್ರತೆ",
    allSeverities: "ಎಲ್ಲಾ ತೀವ್ರತೆಗಳು"
  }
};

export const History: React.FC<HistoryProps> = ({ language, onSelectScan, onNavigate }) => {
  const { user } = useAuth();
  const t = historyTranslations[language] || historyTranslations.en;
  
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/diagnoses', { headers: await getAuthHeaders() });
        if (!response.ok) throw new Error(`Diagnosis history request failed: ${response.status}`);
        const payload = await response.json();
        setScans(Array.isArray(payload.data) ? payload.data : []);
      } catch (error) {
        console.warn("Failed to fetch diagnoses history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent card select trigger
    if (!user) return;
    try {
      const response = await fetch(`/api/diagnoses/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
      setScans(prev => prev.filter(scan => scan.id !== id));
      toast.success(t.deleteSuccess);
    } catch (error) {
      console.error("Failed to delete scan:", error);
      toast.error("Failed to delete diagnosis record.");
    }
  };

  const filteredScans = scans.filter(scan => {
    const term = searchTerm.toLowerCase();
    const diseaseName = scan.disease || scan.diseaseName || '';
    const matchesSearch = 
      scan.crop?.toLowerCase().includes(term) ||
      diseaseName.toLowerCase().includes(term) ||
      scan.diseaseHi?.toLowerCase().includes(term) ||
      scan.diseaseKn?.toLowerCase().includes(term);

    const matchesSeverity = severityFilter === 'All' || scan.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFBF9] p-6">
      {/* Header */}
      <div className="mb-8 pt-6">
        <h1 className="text-2xl font-black text-earth tracking-tight">{t.title}</h1>
        <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">{t.subtitle}</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative flex items-center bg-white rounded-2xl p-2 border border-gray-100 shadow-sm">
          <Search size={18} className="text-gray-400 ml-2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 text-gray-700 placeholder-gray-400"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['All', 'High', 'Medium', 'Low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border whitespace-nowrap transition-all ${
                severityFilter === sev
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-gray-500 border-gray-100'
              }`}
              style={{ minHeight: '40px' }}
            >
              {sev === 'All' ? t.allSeverities : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <Loader2 size={36} className="text-primary animate-spin mb-4" />
          <p className="text-sm font-semibold text-gray-500">{t.loading}</p>
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-6">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
            <Inbox size={36} />
          </div>
          <h3 className="text-lg font-black text-earth mb-2">{t.noScans}</h3>
          <p className="text-xs text-gray-400 font-semibold max-w-xs leading-relaxed mb-6">{t.noScansDesc}</p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-primary hover:bg-primary-dark text-white text-xs font-black px-6 py-3 rounded-2xl shadow-md transition-all active:scale-95"
            style={{ minHeight: '48px' }}
          >
            Go to Scanner
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredScans.map((scan) => {
              const formattedDate = scan.timestamp ? new Date(scan.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'Recent Scan';

              const severityColor = 
                scan.severity === 'High' ? 'bg-red-50 text-red-700 border-red-100' :
                scan.severity === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                'bg-blue-50 text-blue-700 border-blue-100';

              return (
                <motion.div
                  key={scan.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => onSelectScan(scan)}
                  className="bg-white p-4 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] active:scale-98 transition-all"
                >
                  {/* Thumbnail */}
                  {scan.imageUrl ? (
                    <img
                      src={scan.imageUrl}
                      alt={scan.crop}
                      className="w-16 h-16 rounded-2xl object-cover border border-gray-50 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center shrink-0 border border-green-100 text-primary">
                      <Sprout size={24} />
                    </div>
                  )}

                  {/* Card Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{scan.crop}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {formattedDate}
                      </span>
                    </div>
                    
                    <h3 className="text-base font-black text-earth truncate">
                      {language === 'hi' && scan.diseaseHi ? scan.diseaseHi :
                       language === 'kn' && scan.diseaseKn ? scan.diseaseKn :
                       scan.disease}
                    </h3>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${severityColor}`}>
                        {scan.severity}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        Match: <span className="text-primary">{scan.confidence}%</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDelete(e, scan.id)}
                      className="p-2 text-gray-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                      style={{ minHeight: '40px', minWidth: '40px' }}
                      aria-label="Delete diagnosis record"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
