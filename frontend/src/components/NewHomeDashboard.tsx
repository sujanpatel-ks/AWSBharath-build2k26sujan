import React, { useState } from 'react';
import { 
  MapPin, 
  Sun, 
  CloudSun, 
  CloudRain, 
  CloudLightning, 
  Wind, 
  Droplets, 
  Thermometer, 
  ShieldAlert, 
  CheckCircle, 
  ChevronRight, 
  Brain, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  Camera, 
  Upload, 
  Search, 
  Bell, 
  User, 
  TrendingUp, 
  Store, 
  Beaker, 
  Landmark, 
  Users, 
  MessageSquare, 
  RefreshCw, 
  Share2, 
  Check, 
  X,
  Bug,
  AlertTriangle,
  Compass,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, Language, Task } from '../types';
import { WeatherSummary } from './WeatherSummary';
import { TaskSpeechReminder } from './TaskSpeechReminder';
import { LanguageSelector } from './LanguageSelector';
import { TestimonialsCarousel } from './TestimonialsCarousel';
import { SensorTelemetryCard } from './SensorTelemetryCard';

interface NewHomeDashboardProps {
  onNavigate: (screen: Screen) => void;
  onFileSelect: (file: File) => void;
  onCameraOpen: () => void;
  language: Language;
  onToggleLanguage: (lang?: Language) => void;
  locationName: string | null;
  weatherData: { temp: number; condition: string; icon: React.ReactNode } | null;
  weatherSummary: any | null;
  lastDiagnosis?: any;
  unreadCount?: number;
  onRefreshWeather?: () => void;
  weatherLoading?: boolean;
  tasks?: Task[];
  onToggleTask?: (id: string) => void;
  onAddTask?: (task: Omit<Task, 'id' | 'completed'>) => void;
}

const homeTranslations = {
  en: {
    dashboardTitle: "Dashboard",
    locationFallback: "Ludhiana, Punjab",
    partlyCloudy: "Partly Cloudy",
    humidity: "Humidity",
    wind: "Wind",
    uvIndex: "UV Index",
    sprayRiskTitle: "Spray Risk: Low",
    sprayRiskDesc: "Optimal conditions for spraying organic protocols today. Wind speeds are stable.",
    forecastTitle: "7-Day Forecast",
    detailed: "Detailed",
    today: "Today",
    tomorrow: "Tomorrow",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",
    smartAdvisories: "Smart Advisories",
    advisory1Tag: "UPCOMING WEATHER",
    advisory1Title: "Heavy Rain Alert",
    advisory1Desc: "Significant rainfall expected in 48 hours. Suggest completing any planned nutrient treatments today to avoid runoff.",
    advisory2Tag: "CROP HEALTH RISK",
    advisory2Title: "High Humidity Alert",
    advisory2Desc: "Elevated humidity levels (65%+) may increase fungal risk. Closely monitor tomato and pepper crops in Sector B.",
    saveAdvisory: "Save Advisory",
    saved: "Saved",
    aiScanTitle: "AI Crop Diagnostic Doctor",
    aiScanDesc: "Scan leaf photo or choose image for instant pest & disease analysis",
    startScanner: "Tap to Scan Leaf",
    uploadPhoto: "Upload Crop Photo",
    quickServices: "Quick Farming Services",
    mandiRates: "Mandi Rates",
    inputStores: "Certified Stores",
    soilAnalysis: "Soil Health",
    govtSchemes: "Govt Schemes",
    communityForum: "Krishi Community",
    askAi: "Ask AI Advisor",
    recentDiagnosis: "Recent Scan Result",
    viewDetails: "View Treatment Details",
    shareReport: "Share Report",
    searchPlaceholder: "Search crops, mandis, treatments..."
  },
  hi: {
    dashboardTitle: "डैशबोर्ड",
    locationFallback: "लुधियाना, पंजाब",
    partlyCloudy: "आंशिक बादल",
    humidity: "नमी",
    wind: "हवा",
    uvIndex: "यूवी इंडेक्स",
    sprayRiskTitle: "छिड़काव जोखिम: कम",
    sprayRiskDesc: "आज जैविक कीटनाशक और पोषण छिड़काव के लिए अनुकूल मौसम है। हवा की गति स्थिर है।",
    forecastTitle: "7-दिवसीय मौसम पूर्वानुमान",
    detailed: "विस्तृत",
    today: "आज",
    tomorrow: "कल",
    wed: "बुध",
    thu: "गुरु",
    fri: "शुक्र",
    sat: "शनि",
    sun: "रवि",
    smartAdvisories: "स्मार्ट कृषि सलाह",
    advisory1Tag: "आगामी मौसम चेतावनी",
    advisory1Title: "भारी बारिश की चेतावनी",
    advisory1Desc: "अगले 48 घंटों में भारी बारिश की संभावना है। पोषक तत्वों का छिड़काव आज ही पूरा कर लें ताकि दवा बह न जाए।",
    advisory2Tag: "फसल स्वास्थ्य जोखिम",
    advisory2Title: "उच्च आर्द्रता चेतावनी",
    advisory2Desc: "हवा में 65%+ नमी के कारण फफूंद (फंगल) रोग का खतरा बढ़ सकता है। टमाटर और मिर्च की फसलों की निगरानी करें।",
    saveAdvisory: "सलाह सहेजें",
    saved: "सहेजा गया",
    aiScanTitle: "एआई फसल रोग डॉक्टर",
    aiScanDesc: "पत्ती की फोटो खींचें या अपलोड करके तुरंत बीमारी का पता लगाएं",
    startScanner: "पत्ती स्कैन करें",
    uploadPhoto: "फोटो अपलोड करें",
    quickServices: "त्वरित कृषि सेवाएं",
    mandiRates: "मंडी भाव",
    inputStores: "खाद-दवा दुकानें",
    soilAnalysis: "मिट्टी स्वास्थ्य",
    govtSchemes: "सरकारी योजनाएं",
    communityForum: "किसान चौपाल",
    askAi: "एआई सलाहकार से पूछें",
    recentDiagnosis: "हालिया स्कैन परिणाम",
    viewDetails: "उपचार विवरण देखें",
    shareReport: "रिपोर्ट साझा करें",
    searchPlaceholder: "फसल, मंडी, दवा खोजें..."
  },
  kn: {
    dashboardTitle: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    locationFallback: "ತುಮಕೂರು, ಕರ್ನಾಟಕ",
    partlyCloudy: "ಭಾಗಶಃ ಮೋಡ",
    humidity: "ಆರ್ದ್ರತೆ",
    wind: "ಗಾಳಿ",
    uvIndex: "ಯುವಿ ಸೂಚ್ಯಂಕ",
    sprayRiskTitle: "ಸಿಂಪಡಣೆ ಅಪಾಯ: ಕಡಿಮೆ",
    sprayRiskDesc: "ಇಂದು ಜೈವಿಕ ಔಷಧ ಸಿಂಪಡಣೆಗೆ ಸೂಕ್ತ ಹವಾಮಾನವಿದೆ. ಗಾಳಿಯ ವೇಗ ಸ್ಥಿರವಾಗಿದೆ.",
    forecastTitle: "7-ದಿನಗಳ ಮುನ್ಸೂಚನೆ",
    detailed: "ವಿವರಣೆ",
    today: "ಇಂದು",
    tomorrow: "ನಾಳೆ",
    wed: "ಬುಧ",
    thu: "ಗುರು",
    fri: "ಶುಕ್ರ",
    sat: "ಶನಿ",
    sun: "ಭಾನು",
    smartAdvisories: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಲಹೆಗಳು",
    advisory1Tag: "ಮಳೆ ಮುನ್ಸೂಚನೆ",
    advisory1Title: "ಭಾರೀ ಮಳೆ ಎಚ್ಚರಿಕೆ",
    advisory1Desc: "ಮುಂದಿನ 48 ಗಂಟೆಗಳಲ್ಲಿ ಭಾರೀ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ. ರಸಗೊಬ್ಬರ ಮತ್ತು ಔಷಧ ಸಿಂಪಡಣೆಯನ್ನು ಇಂದೇ ಪೂರ್ಣಗೊಳಿಸಿ.",
    advisory2Tag: "ಬೆಳೆ ರೋಗ ಅಪಾಯ",
    advisory2Title: "ಹೆಚ್ಚಿನ ತೇವಾಂಶ ಎಚ್ಚರಿಕೆ",
    advisory2Desc: "ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆ (65%+) ಶಿಲೀಂಧ್ರ ರೋಗದ ಅಪಾಯವನ್ನು ಹೆಚ್ಚಿಸಬಹುದು. ಟೊಮೆಟೊ ಮತ್ತು ಮೆಣಸಿನಕಾಯಿ ಬೆಳೆಗಳನ್ನು ಗಮನಿಸಿ.",
    saveAdvisory: "ಸಲಹೆ ಉಳಿಸಿ",
    saved: "ಉಳಿಸಲಾಗಿದೆ",
    aiScanTitle: "AI ಬೆಳೆ ರೋಗ ತಜ್ಞ",
    aiScanDesc: "ರೋಗ ಪತ್ತೆಗಾಗಿ ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    startScanner: "ಎಲೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    uploadPhoto: "ಫೋಟೋ ಅಪ್‌ಲೋಡ್",
    quickServices: "ತ್ವರಿತ ಕೃಷಿ ಸೇವೆಗಳು",
    mandiRates: "ಮಾರುಕಟ್ಟೆ ದರ",
    inputStores: "ಗೊಬ್ಬರ ಮಳಿಗೆಗಳು",
    soilAnalysis: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ",
    govtSchemes: "ಸರ್ಕಾರಿ ಯೋಜನೆ",
    communityForum: "ರೈತ ವೇದಿಕೆ",
    askAi: "AI ಸಲಹೆಗಾರ",
    recentDiagnosis: "ಇತ್ತೀಚಿನ ರೋಗ ಪತ್ತೆ",
    viewDetails: "ಚಿಕಿತ್ಸಾ ವಿವರಗಳು",
    shareReport: "ವರದಿ ಹಂಚಿಕೊಳ್ಳಿ",
    searchPlaceholder: "ಬೆಳೆ, ಮಾರುಕಟ್ಟೆ, ಔಷಧಿ ಹುಡುಕಿ..."
  }
};

export const NewHomeDashboard: React.FC<NewHomeDashboardProps> = ({
  onNavigate,
  onFileSelect,
  onCameraOpen,
  language,
  onToggleLanguage,
  locationName,
  weatherData,
  weatherSummary,
  lastDiagnosis,
  unreadCount = 2,
  onRefreshWeather,
  weatherLoading = false,
  tasks = [],
  onToggleTask,
  onAddTask
}) => {
  const t = homeTranslations[language] || homeTranslations.en;
  
  // State for saved advisories
  const [savedAdvisory1, setSavedAdvisory1] = useState(false);
  const [savedAdvisory2, setSavedAdvisory2] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 2500);
  };

  const handleSaveToggle = (id: 1 | 2) => {
    if (id === 1) {
      const next = !savedAdvisory1;
      setSavedAdvisory1(next);
      showToast(next ? (language === 'hi' ? 'सलाह सुरक्षित कर ली गई' : language === 'kn' ? 'ಸಲಹೆ ಉಳಿಸಲಾಗಿದೆ' : 'Heavy Rain Advisory Saved') : 'Advisory Removed');
    } else {
      const next = !savedAdvisory2;
      setSavedAdvisory2(next);
      showToast(next ? (language === 'hi' ? 'सलाह सुरक्षित कर ली गई' : language === 'kn' ? 'ಸಲಹೆ ಉಳಿಸಲಾಗಿದೆ' : 'High Humidity Advisory Saved') : 'Advisory Removed');
    }
  };

  // Weather variables
  const currentTemp = weatherData ? weatherData.temp : 32;
  const currentCondition = weatherData ? weatherData.condition : t.partlyCloudy;
  const currentLocation = locationName || t.locationFallback;

  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen text-[#191c1d] pb-28 md:pb-12 font-['Inter',sans-serif]">
      
      {/* 1. TOP HEADER / APP BAR */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#bfc9c3]/30 px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between transition-all shadow-2xs">
        
        {/* Left: Branding & Title */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-2xl bg-[#003527]/10 flex items-center justify-center border border-[#003527]/20 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
          >
            <img 
              src="/app-icon.svg" 
              alt="AgroCare Solution Logo" 
              className="w-full h-full object-contain p-1" 
              referrerPolicy="no-referrer" 
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-['Hanken_Grotesk'] text-lg sm:text-xl font-bold text-[#003527] tracking-tight leading-none">
                AgroCare Pro AI
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#003527]/10 text-[#003527] uppercase tracking-wider">
                Enterprise
              </span>
            </div>
            <span className="text-xs font-semibold text-[#404944] mt-0.5 font-['Inter']">
              {t.dashboardTitle}
            </span>
          </div>
        </div>

        {/* Right: Actions (Search, LanguageSelector, Notification, Avatar) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Search Button */}
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-10 h-10 rounded-2xl bg-white hover:bg-[#edeeef] text-[#191c1d] flex items-center justify-center border border-[#bfc9c3]/40 shadow-2xs transition-all cursor-pointer"
            aria-label="Search"
          >
            <Search size={17} />
          </button>

          {/* Integrated SaaS Language Selector Dropdown */}
          <LanguageSelector 
            currentLanguage={language} 
            onLanguageChange={(code) => onToggleLanguage(code as Language)} 
          />

          {/* Notifications Button with popover */}
          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-10 h-10 rounded-2xl bg-white hover:bg-[#edeeef] text-[#191c1d] flex items-center justify-center border border-[#bfc9c3]/40 shadow-2xs transition-all cursor-pointer relative"
              aria-label="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full ring-2 ring-white" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-[#bfc9c3]/40 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#bfc9c3]/30">
                  <span className="text-xs font-bold text-[#191c1d]">{t.smartAdvisories}</span>
                  <span className="text-[10px] bg-[#003527]/10 text-[#003527] px-2 py-0.5 rounded-full font-bold">2 New</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#f3f4f5] border-l-4 border-[#ffdbcc]">
                    <p className="font-bold text-[#191c1d]">{t.advisory1Title}</p>
                    <p className="text-[11px] text-[#404944] mt-0.5 line-clamp-2">{t.advisory1Desc}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#f3f4f5] border-l-4 border-[#f9bd22]">
                    <p className="font-bold text-[#191c1d]">{t.advisory2Title}</p>
                    <p className="text-[11px] text-[#404944] mt-0.5 line-clamp-2">{t.advisory2Desc}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <button 
            onClick={() => onNavigate('profile')}
            className="w-10 h-10 rounded-2xl bg-[#003527] text-white flex items-center justify-center shadow-2xs border border-[#b0f0d6]/30 cursor-pointer hover:opacity-90 transition-opacity"
            aria-label="Profile"
          >
            <User size={17} />
          </button>
        </div>
      </header>

      {/* Quick Search Overlay (if opened) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 sm:px-6 md:px-10 py-3 bg-white border-b border-[#bfc9c3]/30 shadow-sm flex items-center gap-3"
          >
            <Search size={18} className="text-[#404944]" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onNavigate('market');
                }
              }}
              placeholder={t.searchPlaceholder}
              autoFocus
              className="flex-1 bg-transparent text-sm font-medium outline-none text-[#191c1d] placeholder:text-[#404944]/60"
            />
            <button 
              onClick={() => setSearchOpen(false)}
              className="p-1 rounded-full text-[#404944] hover:bg-[#edeeef]"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-4 space-y-4">
        
        {/* 1. TOP MINIMIZED WEATHER SUMMARY (Temp, Wind Speed, Humidity) */}
        <WeatherSummary
          weatherData={weatherSummary}
          locationName={currentLocation}
          language={language}
          onRefresh={onRefreshWeather}
          loading={weatherLoading}
        />
        <SensorTelemetryCard language={language} />

        {/* 2. TOP AI CROP SCANNER & CAMERA TRIGGER CARD */}
        <section 
          id="ai-scanner-section" 
          className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,53,39,0.06)] border border-[#003527]/15 ring-1 ring-[#003527]/10 relative overflow-hidden group"
        >
          {/* Ambient background glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#b0f0d6]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-[#b0f0d6]/30 transition-all duration-700" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-['Hanken_Grotesk'] text-lg sm:text-xl font-bold text-[#191c1d] tracking-tight leading-tight">
                    {t.aiScanTitle}
                  </h2>
                  <span className="hidden sm:inline-flex bg-[#003527]/10 text-[#003527] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Core AI Doctor
                  </span>
                </div>
                <p className="text-xs text-[#404944] mt-0.5 max-w-xl">
                  {t.aiScanDesc}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCameraOpen}
              className="bg-[#003527] hover:bg-[#064e3b] text-white font-bold text-sm py-3.5 px-5 rounded-2xl shadow-md shadow-[#003527]/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer min-h-[48px]"
            >
              <Camera size={18} className="text-[#b0f0d6]" />
              <span>{t.startScanner}</span>
            </motion.button>

            <label className="bg-[#f3f4f5] hover:bg-[#e7e9ea] text-[#191c1d] font-bold text-sm py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-[#bfc9c3]/40 shadow-2xs min-h-[48px]">
              <Upload size={18} className="text-[#003527]" />
              <span>{t.uploadPhoto}</span>
              <input 
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFileSelect(f);
                }}
              />
            </label>
          </div>

          {/* Quick Demo Test Samples */}
          <div className="relative z-10 mt-3.5 pt-3 border-t border-[#bfc9c3]/20 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-[#404944] uppercase tracking-wider">
              Instant Samples:
            </span>
            {[
              { label: "🌴 Coconut Bud Rot", crop: "Coconut" },
              { label: "🌾 Rice Blast", crop: "Rice" },
              { label: "🍅 Tomato Leaf Curl", crop: "Tomato" }
            ].map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const canvas = document.createElement('canvas');
                  canvas.width = 400;
                  canvas.height = 400;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    const grad = ctx.createLinearGradient(0, 0, 400, 400);
                    grad.addColorStop(0, '#003527');
                    grad.addColorStop(1, '#52b788');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, 400, 400);
                    canvas.toBlob((blob) => {
                      if (blob) {
                        const file = new File([blob], `${sample.crop.toLowerCase()}_sample.jpg`, { type: 'image/jpeg' });
                        onFileSelect(file);
                      }
                    }, 'image/jpeg');
                  }
                }}
                className="bg-[#f3f4f5] hover:bg-[#003527] hover:text-white text-[#191c1d] text-[11px] font-medium px-2.5 py-1 rounded-lg border border-[#bfc9c3]/30 transition-colors cursor-pointer"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </section>

        {/* RECENT SCAN RESULT (IF RECORDED) */}
        {lastDiagnosis && (
          <section id="last-diagnosis-card" className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xs border border-[#bfc9c3]/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-['Hanken_Grotesk'] text-sm sm:text-base font-bold text-[#191c1d]">
                {t.recentDiagnosis}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#003527]/10 text-[#003527]">
                {lastDiagnosis.confidence || 95}% Match
              </span>
            </div>

            <div 
              onClick={() => onNavigate('diagnosis')}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#f3f4f5] hover:bg-[#edeeef] cursor-pointer transition-colors"
            >
              {lastDiagnosis.imageUrl && (
                <img 
                  src={lastDiagnosis.imageUrl} 
                  alt="Last leaf scan" 
                  className="w-14 h-14 rounded-lg object-cover ring-1 ring-[#bfc9c3]/40 shrink-0"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-[#003527] uppercase">
                  {lastDiagnosis.crop || 'Crop'}
                </span>
                <h4 className="text-sm font-bold text-[#191c1d] truncate">
                  {lastDiagnosis.disease}
                </h4>
                <p className="text-xs text-[#404944] truncate mt-0.5">
                  Click to view step-by-step organic & chemical treatments
                </p>
              </div>
              <ChevronRight size={16} className="text-[#003527] shrink-0" />
            </div>
          </section>
        )}
        
        {/* TASK REMINDER NOTIFICATION BANNER (BROWSER SPEECH SYNTHESIS) */}
        <TaskSpeechReminder
          tasks={tasks}
          onToggleTask={onToggleTask || (() => {})}
          onAddTask={onAddTask}
          onNavigate={onNavigate}
          language={language}
        />

        {/* 3. SMART ADVISORIES & SPRAY STATUS (CONCISE & POLISHED) */}
        <section id="smart-advisories" className="space-y-3 pt-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#003527]/10 text-[#003527] flex items-center justify-center">
                <Brain size={17} />
              </div>
              <div>
                <h3 className="font-['Hanken_Grotesk'] text-base sm:text-lg font-bold text-[#191c1d] tracking-tight leading-tight">
                  {t.smartAdvisories}
                </h3>
                <p className="text-[11px] text-[#404944] font-medium hidden sm:block">
                  AI environmental monitoring & timing alerts
                </p>
              </div>
            </div>
            <span className="bg-emerald-50 text-[#003527] text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-200/80 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Optimal Spray Window
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Advisory 1: Weather Protection */}
            <div className="bg-white rounded-2xl p-4 sm:p-4.5 shadow-xs border border-orange-200/70 hover:border-orange-300 transition-all flex flex-col justify-between group">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-100/80 text-[#944a23] flex items-center justify-center shadow-2xs">
                      <Droplets size={14} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#944a23] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/50">
                      {t.advisory1Tag}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">48h Forecast</span>
                </div>

                <h4 className="font-['Hanken_Grotesk'] text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#003527] transition-colors leading-snug">
                  {t.advisory1Title}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {t.advisory1Desc}
                </p>
              </div>

              <div className="pt-3.5 mt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveToggle(1)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    savedAdvisory1 
                      ? 'bg-[#003527] text-white shadow-2xs' 
                      : 'bg-[#F9FAF8] hover:bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                >
                  {savedAdvisory1 ? <BookmarkCheck size={13} /> : <Bookmark size={13} className="text-gray-500" />}
                  <span>{savedAdvisory1 ? t.saved : t.saveAdvisory}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => onNavigate('chat')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#003527] hover:text-[#064e3b] px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  <span>Ask AI</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Advisory 2: Moisture Advisory */}
            <div className="bg-white rounded-2xl p-4 sm:p-4.5 shadow-xs border border-amber-200/70 hover:border-amber-300 transition-all flex flex-col justify-between group">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100/80 text-[#854d0e] flex items-center justify-center shadow-2xs">
                      <AlertTriangle size={14} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#854d0e] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                      {t.advisory2Tag}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">Humidity &gt;65%</span>
                </div>

                <h4 className="font-['Hanken_Grotesk'] text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#003527] transition-colors leading-snug">
                  {t.advisory2Title}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {t.advisory2Desc}
                </p>
              </div>

              <div className="pt-3.5 mt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveToggle(2)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    savedAdvisory2 
                      ? 'bg-[#003527] text-white shadow-2xs' 
                      : 'bg-[#F9FAF8] hover:bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                >
                  {savedAdvisory2 ? <BookmarkCheck size={13} /> : <Bookmark size={13} className="text-gray-500" />}
                  <span>{savedAdvisory2 ? t.saved : t.saveAdvisory}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => onNavigate('chat')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#003527] hover:text-[#064e3b] px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  <span>Ask AI</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. QUICK FARMING SERVICES GRID */}
        <section id="quick-services-section" className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="font-['Hanken_Grotesk'] text-base sm:text-lg font-bold text-[#191c1d] tracking-tight">
              {t.quickServices}
            </h3>
            <span className="text-xs text-gray-500 font-medium">Quick Access</span>
          </div>

          {/* Google Maps Agent Feature Banner */}
          <div 
            id="home-google-maps-agent-card"
            onClick={() => onNavigate('maps-agent')}
            className="mb-3 bg-gradient-to-r from-[#003527] via-[#064e3b] to-[#0a5c45] hover:from-[#032b20] hover:to-[#084d3a] text-white p-4 rounded-2xl shadow-xs border border-[#003527]/30 flex items-center justify-between gap-3 cursor-pointer group transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/15 text-[#b0f0d6] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                <Compass size={24} strokeWidth={2.4} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white font-['Hanken_Grotesk']">
                    Google Maps Agent
                  </h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#b0f0d6]/20 text-[#b0f0d6] border border-[#b0f0d6]/30">
                    Real-Time Maps
                  </span>
                </div>
                <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                  Grounded APMC mandis, seed stores, cold storage & highway routes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#b0f0d6] shrink-0 bg-white/10 px-3 py-1.5 rounded-xl group-hover:bg-white/20 transition-colors">
              <span className="hidden sm:inline">Explore</span>
              <Navigation size={14} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            {/* 1. Mandi Rates */}
            <button
              type="button"
              onClick={() => onNavigate('market')}
              className="bg-white hover:bg-emerald-50/40 p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 hover:border-emerald-300 shadow-2xs hover:shadow-xs flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group active:scale-98"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#003527] group-hover:bg-[#003527] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                <TrendingUp size={19} strokeWidth={2.4} />
              </div>
              <span className="text-xs font-bold text-gray-900 group-hover:text-[#003527] transition-colors">{t.mandiRates}</span>
            </button>

            {/* 2. Certified Input Stores */}
            <button
              type="button"
              onClick={() => onNavigate('suppliers')}
              className="bg-white hover:bg-orange-50/40 p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 hover:border-orange-300 shadow-2xs hover:shadow-xs flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group active:scale-98"
            >
              <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#944a23] group-hover:bg-[#944a23] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                <Store size={19} strokeWidth={2.4} />
              </div>
              <span className="text-xs font-bold text-gray-900 group-hover:text-[#944a23] transition-colors">{t.inputStores}</span>
            </button>

            {/* 3. Soil Health */}
            <button
              type="button"
              onClick={() => onNavigate('soil-analysis')}
              className="bg-white hover:bg-amber-50/40 p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 hover:border-amber-300 shadow-2xs hover:shadow-xs flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group active:scale-98"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#854d0e] group-hover:bg-[#854d0e] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                <Beaker size={19} strokeWidth={2.4} />
              </div>
              <span className="text-xs font-bold text-gray-900 group-hover:text-[#854d0e] transition-colors">{t.soilAnalysis}</span>
            </button>

            {/* 4. Govt Schemes */}
            <button
              type="button"
              onClick={() => onNavigate('scheme-finder')}
              className="bg-white hover:bg-emerald-50/40 p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 hover:border-emerald-300 shadow-2xs hover:shadow-xs flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group active:scale-98"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#003527] group-hover:bg-[#003527] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                <Landmark size={19} strokeWidth={2.4} />
              </div>
              <span className="text-xs font-bold text-gray-900 group-hover:text-[#003527] transition-colors">{t.govtSchemes}</span>
            </button>

            {/* 5. Krishi Community */}
            <button
              type="button"
              onClick={() => onNavigate('community')}
              className="bg-white hover:bg-orange-50/40 p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 hover:border-orange-300 shadow-2xs hover:shadow-xs flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group active:scale-98"
            >
              <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#944a23] group-hover:bg-[#944a23] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                <Users size={19} strokeWidth={2.4} />
              </div>
              <span className="text-xs font-bold text-gray-900 group-hover:text-[#944a23] transition-colors">{t.communityForum}</span>
            </button>

            {/* 6. Ask AI Advisor */}
            <button
              type="button"
              onClick={() => onNavigate('chat')}
              className="bg-[#003527] hover:bg-[#064e3b] text-white p-3.5 sm:p-4 rounded-2xl shadow-xs flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer active:scale-98 group"
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 text-[#b0f0d6] group-hover:scale-105 flex items-center justify-center transition-transform">
                <MessageSquare size={19} strokeWidth={2.4} />
              </div>
              <span className="text-xs font-bold text-white">{t.askAi}</span>
            </button>

          </div>
        </section>

        {/* VERIFIED FARMER TESTIMONIALS (INFINITE SCROLL) */}
        <section id="testimonials-section">
          <TestimonialsCarousel />
        </section>

      </main>

      {/* Floating Save Toast */}
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#191c1d] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 pointer-events-none"
          >
            <Check size={14} className="text-[#b0f0d6]" />
            <span>{savedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
