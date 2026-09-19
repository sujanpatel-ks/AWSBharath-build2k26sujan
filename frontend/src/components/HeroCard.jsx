import React from 'react';
import { 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Leaf,
  ScanLine,
  AlertTriangle
} from 'lucide-react';

const heroCardTranslations = {
  en: {
    title: "AI Crop Diagnostic Doctor",
    model: "Hyperlocal Vision Model v4.2",
    live: "Live",
    health: "Health",
    optimalCondition: "Optimal Condition",
    attentionRequired: "Attention Required",
    moderateRisk: "Moderate Risk",
    defaultCrop: "Tomato (Solanum lycopersicum)",
    defaultDiagnosis: "Healthy Foliage · No Blight Detected",
    scanTime: "18 mins ago",
    recentScan: "Latest Scan:",
    newScan: "New Scan",
    viewReport: "View Report",
    agronomistVerified: "Agronomist Verified",
    offlineReady: "Offline Ready"
  },
  hi: {
    title: "एआई फसल निदान डॉक्टर",
    model: "हाइपरलोकल विज़न मॉडल v4.2",
    live: "लाइव",
    health: "स्वास्थ्य",
    optimalCondition: "उत्तम स्थिति",
    attentionRequired: "ध्यान देने योग्य",
    moderateRisk: "मध्यम जोखिम",
    defaultCrop: "टमाटर (सोलेनम लाइकोपरसिकम)",
    defaultDiagnosis: "स्वस्थ पत्तियां · कोई झुलसा रोग नहीं",
    scanTime: "18 मिनट पहले",
    recentScan: "नवीनतम स्कैन:",
    newScan: "नया स्कैन",
    viewReport: "रिपोर्ट देखें",
    agronomistVerified: "कृषि वैज्ञानिक सत्यापित",
    offlineReady: "ऑफ़लाइन तैयार"
  },
  kn: {
    title: "AI ಬೆಳೆ ರೋಗನಿರ್ಣಯ ವೈದ್ಯ",
    model: "ಸ್ಥಳೀಯ ವಿಷನ್ ಮಾಡೆಲ್ v4.2",
    live: "ಲೈವ್",
    health: "ಆರೋಗ್ಯ",
    optimalCondition: "ಉತ್ತಮ ಸ್ಥಿತಿ",
    attentionRequired: "ಗಮನ ಅಗತ್ಯ",
    moderateRisk: "ಮಧ್ಯಮ ಅಪಾಯ",
    defaultCrop: "ಟೊಮ್ಯಾಟೊ (ಸೊಲಾನಮ್ ಲೈಕೋಪರ್ಸಿಕಮ್)",
    defaultDiagnosis: "ಆರೋಗ್ಯಕರ ಎಲೆಗಳು · ಯಾವುದೇ ರೋಗ ಪತ್ತೆಯಾಗಿಲ್ಲ",
    scanTime: "18 ನಿಮಿಷಗಳ ಹಿಂದೆ",
    recentScan: "ಇತ್ತೀಚಿನ ಸ್ಕ್ಯಾನ್:",
    newScan: "ಹೊಸ ಸ್ಕ್ಯಾನ್",
    viewReport: "ವರದಿ ನೋಡಿ",
    agronomistVerified: "ಕೃಷಿ ತಜ್ಞರಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
    offlineReady: "ಆಫ್‌ಲೈನ್ ಸಿದ್ಧ"
  },
  ta: {
    title: "AI பயிர் நோய் மருத்துவர்",
    model: "உள்ளூர் விஷன் மாதிரி v4.2",
    live: "நேரலை",
    health: "ஆரோக்கியம்",
    optimalCondition: "சிறந்த நிலை",
    attentionRequired: "கவனம் தேவை",
    moderateRisk: "மிதமான ஆபத்து",
    defaultCrop: "தக்காளி (Solanum lycopersicum)",
    defaultDiagnosis: "ஆரோக்கியமான இலைகள் · நோய் எதுவும் இல்லை",
    scanTime: "18 நிமிடங்களுக்கு முன்பு",
    recentScan: "சமீபத்திய ஸ்கேன்:",
    newScan: "புதிய ஸ்கேன்",
    viewReport: "அறிக்கை பார்க்க",
    agronomistVerified: "விவசாய நிபுணர் சரிபார்த்தது",
    offlineReady: "ஆஃப்லைன் தயார்"
  },
  te: {
    title: "AI పంట వ్యాధి డాక్టర్",
    model: "హైపర్‌లోకల్ విజన్ మోడల్ v4.2",
    live: "లైవ్",
    health: "ఆరోగ్యం",
    optimalCondition: "ఉత్తమ స్థితి",
    attentionRequired: "శ్రద్ధ అవసరం",
    moderateRisk: "మధ్యస్థ ప్రమాదం",
    defaultCrop: "టమాట (Solanum lycopersicum)",
    defaultDiagnosis: "ఆరోగ్యకరమైన ఆకులు · తెగులు లేదు",
    scanTime: "18 నిమిషాల క్రితం",
    recentScan: "తాజా స్కాన్:",
    newScan: "కొత్త స్కాన్",
    viewReport: "నివేదిక చూడండి",
    agronomistVerified: "వ్యవసాయ నిపుణులు ధృవీకరించారు",
    offlineReady: "ఆఫ్‌లైన్ సిద్ధం"
  },
  mr: {
    title: "एआय पीक निदान डॉक्टर",
    model: "स्थानिक व्हिजन मॉडेल v4.2",
    live: "थेट",
    health: "आरोग्य",
    optimalCondition: "उत्कृष्ट स्थिती",
    attentionRequired: "लक्ष देणे गरजेचे",
    moderateRisk: "मध्यम धोका",
    defaultCrop: "टोमॅटो (Solanum lycopersicum)",
    defaultDiagnosis: "निरोगी पाने · कोणताही रोग आढळला नाही",
    scanTime: "18 मिनिटांपूर्वी",
    recentScan: "ताज्या स्कॅन:",
    newScan: "नवीन स्कॅन",
    viewReport: "अहवाल पहा",
    agronomistVerified: "कृषी तज्ज्ञांनी प्रमाणित",
    offlineReady: "ऑफलाइन सज्ज"
  }
};

export const HeroCard = ({
  language = 'en',
  score = 84,
  cropName,
  diagnosis,
  scanTime,
  confidence = "98.4%",
  onNewScan = () => {},
  onViewDetails = () => {}
}) => {
  const t = heroCardTranslations[language] || heroCardTranslations.en;

  const displayCropName = cropName || t.defaultCrop;
  const displayDiagnosis = diagnosis || t.defaultDiagnosis;
  const displayScanTime = scanTime || t.scanTime;

  // SVG Circular progress calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const isHealthy = score >= 70;

  return (
    <div 
      className="w-full bg-white rounded-2xl border border-[#E8EDE6] p-5 sm:p-6 transition-all duration-200 hover:border-[#52B788]/40"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)'
      }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#E8EDE6]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center">
            <Sparkles size={16} className="text-[#2D6A4F]" />
          </div>
          <div>
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm text-[#1A1A1A] tracking-tight">
              {t.title}
            </h3>
            <p className="text-[11px] font-['Inter',sans-serif] text-[#6B7280]">
              {t.model}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-['Inter',sans-serif] font-medium bg-[#D8F3DC] text-[#2D6A4F]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#52B788]" />
          {t.live}
        </span>
      </div>

      {/* Health Score Donut & Quick Metrics */}
      <div className="py-4 flex items-center justify-between gap-4">
        {/* Left: SVG Donut Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#E8EDE6"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Animated/Rendered Progress Arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={isHealthy ? "#52B788" : "#EAB308"}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Centered Score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-[#1A1A1A] leading-none">
              {score}%
            </span>
            <span className="text-[10px] font-['Inter',sans-serif] text-[#6B7280] font-medium mt-0.5">
              {t.health}
            </span>
          </div>
        </div>

        {/* Right: Last Scan Summary Stats */}
        <div className="flex-1 space-y-1.5">
          <div className={`flex items-center gap-1.5 text-xs font-semibold font-['Inter',sans-serif] ${isHealthy ? 'text-[#2D6A4F]' : 'text-amber-700'}`}>
            {isHealthy ? (
              <CheckCircle2 size={15} className="text-[#52B788] shrink-0" />
            ) : (
              <AlertTriangle size={15} className="text-amber-600 shrink-0" />
            )}
            <span>{isHealthy ? t.optimalCondition : t.attentionRequired}</span>
          </div>
          <p className="text-xs font-['Inter',sans-serif] font-medium text-[#1A1A1A] line-clamp-1">
            {displayCropName}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-[#6B7280] font-['Inter',sans-serif]">
            <span className="flex items-center gap-1 text-[#9CA3AF]">
              <Clock size={12} />
              {displayScanTime}
            </span>
            <span className="text-[#2D6A4F] bg-[#D8F3DC]/70 px-1.5 py-0.5 rounded font-medium">
              {confidence}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Scan Snippet / Diagnosis Badge */}
      <div className="bg-[#FAFAF8] border border-[#E8EDE6] rounded-xl p-3 mb-4">
        <div className="flex items-start gap-2">
          <Leaf size={14} className="text-[#52B788] mt-0.5 shrink-0" />
          <div className="text-xs font-['Inter',sans-serif]">
            <span className="text-[#6B7280]">{t.recentScan} </span>
            <span className="font-medium text-[#1A1A1A]">{displayDiagnosis}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onNewScan}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#2D6A4F] hover:bg-[#24563f] text-white text-xs font-semibold font-['Inter',sans-serif] transition-all cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <Camera size={14} />
          <span>{t.newScan}</span>
        </button>

        <button
          onClick={onViewDetails}
          className="w-full flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl border border-[#E8EDE6] bg-white hover:bg-[#FAFAF8] text-[#1A1A1A] text-xs font-medium font-['Inter',sans-serif] transition-all cursor-pointer active:scale-[0.98]"
        >
          <span>{t.viewReport}</span>
          <ArrowRight size={13} className="text-[#6B7280]" />
        </button>
      </div>

      {/* Hyperlocal verification guarantee */}
      <div className="mt-3.5 pt-3 border-t border-[#E8EDE6] flex items-center justify-between text-[11px] text-[#9CA3AF] font-['Inter',sans-serif]">
        <span className="flex items-center gap-1">
          <ShieldCheck size={13} className="text-[#52B788]" />
          {t.agronomistVerified}
        </span>
        <span>{t.offlineReady}</span>
      </div>
    </div>
  );
};

export default HeroCard;
