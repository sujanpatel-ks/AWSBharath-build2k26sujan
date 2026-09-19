import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, 
  Globe, 
  Bell, 
  Menu, 
  X, 
  ChevronDown, 
  Check, 
  Sparkles,
  Search,
  Activity,
  CloudSun,
  MessageSquare,
  MapPin,
  CalendarCheck
} from 'lucide-react';
import { DemoRequestModal } from './DemoRequestModal';

const topNavTranslations = {
  en: {
    dashboard: "Dashboard",
    suppliers: "Fertilizer Stores",
    diagnose: "Diagnose",
    weather: "Weather",
    chat: "Advisory",
    language: "Language",
    alertsTitle: "Hyper-Local Alerts",
    newAlerts: "new",
    alert1Title: "Tomato Blight Alert",
    alert1Desc: "High humidity advisory in Tumkur taluk.",
    alert2Title: "Mandi Rate Surge",
    alert2Desc: "Onion prices up +8% at APMC Yard.",
    connected: "Connected",
    pwaOnline: "PWA Online",
    farmerProfile: "Farmer Profile"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    suppliers: "खाद व दवा की दुकानें",
    diagnose: "फसल निदान",
    weather: "मौसम",
    chat: "कृषि सलाह",
    language: "भाषा",
    alertsTitle: "स्थानीय कृषि अलर्ट",
    newAlerts: "नया",
    alert1Title: "टमाटर झुलसा रोग चेतावनी",
    alert1Desc: "तुमकुर क्षेत्र में उच्च आर्द्रता संबंधी कृषि सलाह।",
    alert2Title: "मंडी भाव में उछाल",
    alert2Desc: "एपीएमसी यार्ड में प्याज के दामों में +8% की वृद्धि।",
    connected: "कनेक्टेड",
    pwaOnline: "ऑनलाइन सक्रिय",
    farmerProfile: "किसान प्रोफाइल"
  },
  kn: {
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    suppliers: "ಗೊಬ್ಬರ ಮತ್ತು ಔಷಧ ಮಳಿಗೆಗಳು",
    diagnose: "ಬೆಳೆ ರೋಗನಿರ್ಣಯ",
    weather: "ಹವಾಮಾನ",
    chat: "ಕೃಷಿ ಸಲಹೆ",
    language: "ಭಾಷೆ",
    alertsTitle: "ಸ್ಥಳೀಯ ಕೃಷಿ ಎಚ್ಚರಿಕೆಗಳು",
    newAlerts: "ಹೊಸ",
    alert1Title: "ಟೊಮ್ಯಾಟೊ ರೋಗ ಎಚ್ಚರಿಕೆ",
    alert1Desc: "ತುಮಕೂರು ತಾಲೂಕಿನಲ್ಲಿ ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆಯ ಮುನ್ನೆಚ್ಚರಿಕೆ.",
    alert2Title: "ಮಾರುಕಟ್ಟೆ ದರ ಹೆಚ್ಚಳ",
    alert2Desc: "ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಈರುಳ್ಳಿ ಬೆಲೆ +8% ಹೆಚ್ಚಳ.",
    connected: "ಸಂಪರ್ಕಿಸಲಾಗಿದೆ",
    pwaOnline: "ಆನ್‌ಲೈನ್ ಸಕ್ರಿಯ",
    farmerProfile: "ರೈತರ ಪ್ರೊಫೈಲ್"
  },
  ta: {
    dashboard: "டாஷ்போர்டு",
    suppliers: "உரக் கடைகள்",
    diagnose: "பயிர் நோய் கண்டறிதல்",
    weather: "வானிலை",
    chat: "வேளாண் ஆலோசனை",
    language: "மொழி",
    alertsTitle: "உள்ளூர் எச்சரிக்கைகள்",
    newAlerts: "புதியது",
    alert1Title: "தக்காளி நோய் எச்சரிக்கை",
    alert1Desc: "தும்கூர் பகுதியில் அதிக ஈரப்பத ஆலோசனை.",
    alert2Title: "சந்தை விலை உயர்வு",
    alert2Desc: "வெங்காய விலை +8% உயர்ந்துள்ளது.",
    connected: "இணைக்கப்பட்டுள்ளது",
    pwaOnline: "ஆன்லைன் தயார்",
    farmerProfile: "விவசாயி சுயவிவரம்"
  },
  te: {
    dashboard: "డాష్‌బోర్డ్",
    suppliers: "ఎరువుల దుకాణాలు",
    diagnose: "పంట వ్యాధి నిర్ధారణ",
    weather: "వాతావరణం",
    chat: "వ్యవసాయ సలహా",
    language: "భాష",
    alertsTitle: "స్థానిక హెచ్చరికలు",
    newAlerts: "కొత్తది",
    alert1Title: "టమాట తెగులు హెచ్చరిక",
    alert1Desc: "తుమకూరు తాలూకాలో అధిక తేమ హెచ్చరిక.",
    alert2Title: "మార్కెట్ ధరల పెరుగుదల",
    alert2Desc: "ఉల్లిపాయ ధరలు +8% పెరిగాయి.",
    connected: "కనెక్ట్ చేయబడింది",
    pwaOnline: "ఆన్‌లైన్ సిద్ధం",
    farmerProfile: "రైతు ప్రొఫైల్"
  },
  mr: {
    dashboard: "डॅशबोर्ड",
    suppliers: "खत व औषध दुकाने",
    diagnose: "पीक रोगनिदान",
    weather: "हवामान",
    chat: "कृषी सल्ला",
    language: "भाषा",
    alertsTitle: "स्थानिक कृषी सूचना",
    newAlerts: "नवीन",
    alert1Title: "टोमॅटो करपा रोग सूचना",
    alert1Desc: "तुमकूर तालुक्यात हवेत जास्त आर्द्रता सल्ला.",
    alert2Title: "मंडी भाव वाढ",
    alert2Desc: "कांद्याचे भाव एपीएमसी मध्ये +8% वाढले.",
    connected: "कनेक्टेड",
    pwaOnline: "ऑनलाइन सज्ज",
    farmerProfile: "शेतकरी प्रोफाइल"
  }
};

/**
 * Custom inline scroll listener hook for sticky glassmorphism header
 */
export function useScrollEffect(threshold = 10) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
}

export const TopNav = ({
  activeTab = 'dashboard',
  onNavigate = (screen) => {},
  currentLanguage = 'en',
  onLanguageChange = (lang) => {},
  unreadCount = 2,
  user = { name: 'Ramesh Patel', village: 'Tumkur', avatar: null }
}) => {
  const isScrolled = useScrollEffect(10);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const langRef = useRef(null);
  const notifRef = useRef(null);

  const t = topNavTranslations[currentLanguage] || topNavTranslations.en;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { id: 'dashboard', label: t.dashboard, icon: Activity },
    { id: 'suppliers', label: t.suppliers, icon: MapPin },
    { id: 'diagnose', label: t.diagnose, icon: Sparkles },
    { id: 'weather', label: t.weather, icon: CloudSun },
    { id: 'chat', label: t.chat, icon: MessageSquare }
  ];

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिंदी', short: 'HI' },
    { code: 'kn', label: 'ಕನ್ನಡ', short: 'KN' },
    { code: 'ta', label: 'தமிழ்', short: 'TA' },
    { code: 'te', label: 'తెలుగు', short: 'TE' },
    { code: 'mr', label: 'मराठी', short: 'MR' }
  ];

  const activeLangObj = languages.find(l => l.code === currentLanguage) || languages[0];

  const handleNavClick = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-md border-b border-[#E8EDE6] shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
          : 'bg-[#FAFAF8] border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 h-16 md:h-18 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Wordmark */}
        <div 
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group"
          role="button"
          tabIndex={0}
        >
          <img 
            src="/app-icon.svg" 
            alt="AgroCare Solution App Icon" 
            className="w-9 h-9 rounded-full shadow-xs object-contain group-hover:scale-105 transition-transform shrink-0 bg-white" 
            referrerPolicy="no-referrer"
          />
          <div className="flex items-center gap-1.5">
            <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg md:text-xl text-[#2D6A4F] tracking-tight">
              AgroCare
            </span>
            <span className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-xs md:text-sm text-[#52B788] tracking-wider uppercase bg-[#D8F3DC]/70 px-1.5 py-0.5 rounded-md">
              AI
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`relative px-3.5 py-2 text-sm transition-all duration-150 rounded-lg cursor-pointer font-['Inter',sans-serif] ${
                  isActive
                    ? 'text-[#2D6A4F] font-semibold'
                    : 'text-[#6B7280] hover:text-[#1A1A1A] font-normal hover:bg-[#E8EDE6]/40'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2.5px] bg-[#2D6A4F] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions (Language Selector, Notification, User Profile) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Language Selector Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E8EDE6] bg-white text-[#1A1A1A] hover:bg-[#FAFAF8] text-xs font-['Inter',sans-serif] font-medium transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer"
              aria-expanded={langDropdownOpen}
              aria-label="Change language"
            >
              <Globe size={15} className="text-[#52B788]" />
              <span className="font-semibold text-xs text-[#2D6A4F]">{activeLangObj.short}</span>
              <ChevronDown size={13} className={`text-[#9CA3AF] transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E8EDE6] py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] uppercase font-semibold text-[#9CA3AF] tracking-wider">
                  {t.language}
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-['Inter',sans-serif] flex items-center justify-between transition-colors cursor-pointer ${
                      currentLanguage === lang.code
                        ? 'bg-[#D8F3DC]/50 text-[#2D6A4F] font-semibold'
                        : 'text-[#1A1A1A] hover:bg-[#FAFAF8]'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {currentLanguage === lang.code && <Check size={14} className="text-[#2D6A4F]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-9 h-9 rounded-xl border border-[#E8EDE6] bg-white hover:bg-[#FAFAF8] text-[#6B7280] hover:text-[#1A1A1A] flex items-center justify-center relative transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer"
              aria-label="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#52B788] rounded-full ring-2 ring-white" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E8EDE6] p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E8EDE6]">
                  <span className="text-xs font-semibold text-[#1A1A1A]">{t.alertsTitle}</span>
                  <span className="text-[10px] bg-[#D8F3DC] text-[#2D6A4F] px-1.5 py-0.5 rounded-full font-semibold">{unreadCount} {t.newAlerts}</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-[#FAFAF8] border border-[#E8EDE6]/60">
                    <p className="font-semibold text-[#1A1A1A]">{t.alert1Title}</p>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">{t.alert1Desc}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FAFAF8] border border-[#E8EDE6]/60">
                    <p className="font-semibold text-[#1A1A1A]">{t.alert2Title}</p>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">{t.alert2Desc}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Request Demo CTA (Desktop) */}
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D6A4F] text-white hover:bg-[#1B4332] text-xs font-['Inter',sans-serif] font-semibold transition-all shadow-xs cursor-pointer"
            aria-label="Request Live Demo"
          >
            <CalendarCheck size={14} className="text-emerald-300" />
            <span>Book Demo</span>
          </button>

          {/* User Avatar with Live Online Dot */}
          <div 
            onClick={() => handleNavClick('profile')}
            className="flex items-center gap-2 pl-1 cursor-pointer group"
            role="button"
            tabIndex={0}
            title={t.farmerProfile}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-[#E8EDE6] text-[#2D6A4F] flex items-center justify-center font-bold text-xs border border-[#E8EDE6] group-hover:border-[#52B788] transition-colors">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <span>RP</span>
                )}
              </div>
              {/* Online Indicator Dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#52B788] rounded-full border-2 border-white" />
            </div>
          </div>

          {/* Mobile Hamburger Button (< md) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-xl border border-[#E8EDE6] bg-white text-[#1A1A1A] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E8EDE6] px-5 py-4 space-y-3 shadow-md animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-['Inter',sans-serif] transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#D8F3DC] text-[#2D6A4F] font-semibold'
                      : 'bg-[#FAFAF8] text-[#6B7280] hover:text-[#1A1A1A]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-[#2D6A4F]' : 'text-[#9CA3AF]'} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#E8EDE6] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsDemoModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-semibold hover:bg-[#1B4332] transition-colors"
            >
              <CalendarCheck size={15} className="text-emerald-300" />
              <span>Request Guided AI Demo</span>
            </button>
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
                {t.connected}: {user.village || 'Tumkur, KA'}
              </span>
              <span className="text-[11px] font-medium text-[#2D6A4F] bg-[#D8F3DC] px-2 py-0.5 rounded-full">
                {t.pwaOnline}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Demo Request Modal */}
      <DemoRequestModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </header>
  );
};

export default TopNav;
