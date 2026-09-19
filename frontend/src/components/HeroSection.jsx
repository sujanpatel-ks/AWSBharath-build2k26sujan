import React from 'react';
import { 
  MapPin, 
  CloudSun, 
  ArrowRight, 
  MessageSquareText, 
  Sparkles,
  Sprout,
  ShieldAlert
} from 'lucide-react';
import { HeroCard } from './HeroCard';

const heroSectionTranslations = {
  en: {
    eyebrow: "AI-Powered Crop Intelligence",
    headline: "Diagnose. Protect. Grow.",
    subheadline: "Real-time AI diagnostics for your crops — in your language, from your field.",
    scanCrop: "Scan Your Crop",
    viewAdvisory: "View Advisory",
    gpsLocating: "GPS Locating...",
    locationError: "Location Error",
    defaultLocation: "Tumkur, Karnataka",
    partlyCloudy: "Partly Cloudy",
    clear: "Clear",
    rainy: "Rainy",
    humid: "Humid"
  },
  hi: {
    eyebrow: "एआई-संचालित फसल बुद्धिमत्ता",
    headline: "निदान करें। रक्षा करें। समृद्ध बनें।",
    subheadline: "आपकी फसलों के लिए रियल-टाइम एआई निदान — आपकी भाषा में, आपके खेत से।",
    scanCrop: "अपनी फसल स्कैन करें",
    viewAdvisory: "कृषि सलाह देखें",
    gpsLocating: "जीपीएस स्थान खोज रहे हैं...",
    locationError: "स्थान त्रुटि",
    defaultLocation: "तुमकुर, कर्नाटक",
    partlyCloudy: "आंशिक बादल",
    clear: "साफ मौसम",
    rainy: "बारिश",
    humid: "आर्द्र"
  },
  kn: {
    eyebrow: "AI-ಚಾಲಿತ ಬೆಳೆ ರೋಗ ಪತ್ತೆ ಬುದ್ಧಿಮತ್ತೆ",
    headline: "ರೋಗ ಪತ್ತೆ ಮಾಡಿ. ಬೆಳೆ ರಕ್ಷಿಸಿ. ಬೆಳೆಯಿರಿ.",
    subheadline: "ನಿಮ್ಮ ಬೆಳೆಗಳಿಗೆ ನೈಜ-ಸಮಯದ AI ರೋಗನಿರ್ಣಯ — ನಿಮ್ಮದೇ ಭಾಷೆಯಲ್ಲಿ, ನಿಮ್ಮ ಜಮೀನಿನಿಂದ.",
    scanCrop: "ನಿಮ್ಮ ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    viewAdvisory: "ಕೃಷಿ ಸಲಹೆ ನೋಡಿ",
    gpsLocating: "ಜಿಪಿಎಸ್ ಹುಡುಕಲಾಗುತ್ತಿದೆ...",
    locationError: "ಸ್ಥಳ ದೋಷ",
    defaultLocation: "ತುಮಕೂರು, ಕರ್ನಾಟಕ",
    partlyCloudy: "ಭಾಗಶಃ ಮೋಡ",
    clear: "ಸ್ವಚ್ಛ ಹವಾಮಾನ",
    rainy: "ಮಳೆ",
    humid: "ಆರ್ದ್ರ"
  },
  ta: {
    eyebrow: "AI பயிர் நுண்ணறிவு",
    headline: "கண்டறியுங்கள். பாதுகாக்கவும். வளருங்கள்.",
    subheadline: "உங்கள் பயிர்களுக்கான நிகழ்நேர AI நோய் கண்டறிதல் — உங்கள் மொழியில், உங்கள் வயலிலிருந்து.",
    scanCrop: "பயிரை ஸ்கேன் செய்யவும்",
    viewAdvisory: "ஆலோசனை பார்க்கவும்",
    gpsLocating: "ஜிபிஎஸ் தேடுகிறது...",
    locationError: "இருப்பிடப் பிழை",
    defaultLocation: "தும்கூர், கர்நாடகா",
    partlyCloudy: "பகுதி மேகமூட்டம்",
    clear: "தெளிவான வானிலை",
    rainy: "மழை",
    humid: "ஈரப்பதம்"
  },
  te: {
    eyebrow: "AI పంట మేధస్సు",
    headline: "నిర్ధారించండి. రక్షించండి. ఎదగండి.",
    subheadline: "మీ పంటలకు రియల్-టైమ్ AI రోగ నిర్ధారణ — మీ భాషలోనే, మీ పొలం నుంచే.",
    scanCrop: "మీ పంటను స్కాన్ చేయండి",
    viewAdvisory: "సలహా చూడండి",
    gpsLocating: "జీపీఎస్ శోధిస్తోంది...",
    locationError: "స్థాన లోపం",
    defaultLocation: "తుమకూరు, కర్ణాటక",
    partlyCloudy: "పాక్షికంగా మేఘావృతం",
    clear: "స్పష్టమైన ఆకాశం",
    rainy: "వర్షం",
    humid: "తేమ"
  },
  mr: {
    eyebrow: "एआय-चालित पीक बुद्धिमत्ता",
    headline: "निदान करा. रक्षण करा. समृद्ध व्हा.",
    subheadline: "आपल्या पिकांसाठी रिअल-टाइम एआय निदान — आपल्या भाषेत, आपल्या शेतातून.",
    scanCrop: "पीक स्कॅन करा",
    viewAdvisory: "सल्ला पहा",
    gpsLocating: "जीपीएस शोधत आहे...",
    locationError: "स्थान त्रुटी",
    defaultLocation: "तुमकूर, कर्नाटक",
    partlyCloudy: "अंशतः ढगाळ",
    clear: "स्वच्छ हवामान",
    rainy: "पाऊस",
    humid: "दमट"
  }
};

export const HeroSection = ({
  language = 'en',
  location,
  weather,
  onScanCrop = () => {},
  onViewAdvisory = () => {},
  onNewScan = () => {},
  onViewReport = () => {},
  lastDiagnosis = null
}) => {
  const t = heroSectionTranslations[language] || heroSectionTranslations.en;

  const displayLocation = location || t.defaultLocation;
  const displayWeather = weather || (language === 'hi' ? '28°C, आंशिक बादल' : language === 'kn' ? '28°C, ಭಾಗಶಃ ಮೋಡ' : '28°C, Partly Cloudy');

  return (
    <section className="w-full bg-[#FAFAF8] border-b border-[#E8EDE6]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-10 md:py-14">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10 lg:gap-14">
          
          {/* Left Column (60% width on desktop) */}
          <div className="w-full lg:w-[60%] flex flex-col items-start space-y-6">
            
            {/* Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D8F3DC] text-[#2D6A4F] text-sm font-medium font-['Inter',sans-serif]">
              <span role="img" aria-label="leaf" className="text-sm">🌿</span>
              <span>{t.eyebrow}</span>
            </div>

            {/* H1 Headline */}
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-3xl sm:text-4xl md:text-5xl lg:text-[48px] text-[#1A1A1A] tracking-tight leading-[1.15]">
              {t.headline}
            </h1>

            {/* Subheadline */}
            <p className="font-['Inter',sans-serif] font-normal text-base sm:text-lg text-[#6B7280] max-w-[480px] leading-relaxed">
              {t.subheadline}
            </p>

            {/* Location + Weather Row (Plain inline metadata, no containers) */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#9CA3AF] font-['Inter',sans-serif]">
              <div className="inline-flex items-center gap-1.5 text-[#6B7280]">
                <MapPin size={15} className="text-[#52B788]" />
                <span>{displayLocation}</span>
              </div>
              
              <span className="text-[#9CA3AF] select-none">·</span>

              <div className="inline-flex items-center gap-1.5 text-[#6B7280]">
                <CloudSun size={15} className="text-[#52B788]" />
                <span>{displayWeather}</span>
              </div>
            </div>

            {/* CTA Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2 w-full sm:w-auto">
              <button
                onClick={onScanCrop}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2D6A4F] hover:bg-[#24563f] text-white text-sm font-semibold font-['Inter',sans-serif] transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <span>{t.scanCrop}</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={onViewAdvisory}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#E8EDE6] bg-white hover:bg-[#FAFAF8] text-[#1A1A1A] text-sm font-medium font-['Inter',sans-serif] transition-all duration-150 cursor-pointer active:scale-[0.98]"
              >
                <MessageSquareText size={16} className="text-[#6B7280]" />
                <span>{t.viewAdvisory}</span>
              </button>
            </div>

          </div>

          {/* Right Column (40% width on desktop) */}
          <div className="w-full lg:w-[40%] flex justify-center lg:justify-end">
            <HeroCard 
              language={language}
              score={lastDiagnosis ? (100 - (lastDiagnosis.severity === 'High' ? 45 : lastDiagnosis.severity === 'Medium' ? 25 : 10)) : 84}
              cropName={lastDiagnosis ? (lastDiagnosis.crop || 'Tomato') : undefined}
              diagnosis={lastDiagnosis ? (language === 'hi' && lastDiagnosis.diseaseHi ? lastDiagnosis.diseaseHi : language === 'kn' && lastDiagnosis.diseaseKn ? lastDiagnosis.diseaseKn : lastDiagnosis.disease) : undefined}
              confidence={lastDiagnosis ? `${lastDiagnosis.confidence}%` : '98.4%'}
              scanTime={lastDiagnosis ? (language === 'hi' ? 'अभी-अभी' : language === 'kn' ? 'ಈಗಷ್ಟೇ' : 'Just now') : undefined}
              onNewScan={onNewScan || onScanCrop}
              onViewDetails={onViewReport}
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
