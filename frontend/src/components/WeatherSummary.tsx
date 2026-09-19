import React, { useState, useEffect, useMemo } from 'react';
import { 
  CloudRain, 
  Sun, 
  Wind, 
  Droplets, 
  AlertTriangle, 
  ShieldAlert, 
  MapPin, 
  RefreshCw, 
  CheckCircle, 
  Info, 
  X, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  CloudSun,
  CloudLightning,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

export interface WeatherDataProps {
  temperature?: number;
  humidity?: number;
  rainVolume?: number;
  rainProbability?: number;
  maxRainProbability?: number;
  windSpeed?: number;
  weatherCode?: number;
  condition?: string;
  summary?: string;
  advice?: string[];
  farmingIndex?: 'Favorable' | 'Caution Required' | 'Hazardous';
  locationName?: string;
}

interface WeatherSummaryProps {
  weatherData?: WeatherDataProps | null;
  locationName?: string | null;
  language?: Language;
  onRefresh?: () => void;
  loading?: boolean;
  className?: string;
}

// Read thresholds from environment variables with sensible defaults
export const getEnvThresholds = () => {
  const rainThreshold = parseFloat(
    (import.meta.env.VITE_WEATHER_RAIN_THRESHOLD_MM as string) ||
    (import.meta.env.VITE_AGROCARE_WEATHER_RAIN_THRESHOLD_MM as string) ||
    (import.meta.env.AGROCARE_WEATHER_RAIN_THRESHOLD_MM as string) ||
    '2.5'
  );

  const windThreshold = parseFloat(
    (import.meta.env.VITE_WEATHER_WIND_THRESHOLD_KPH as string) ||
    (import.meta.env.VITE_AGROCARE_WEATHER_WIND_THRESHOLD_KPH as string) ||
    (import.meta.env.AGROCARE_WEATHER_WIND_THRESHOLD_KPH as string) ||
    '30'
  );

  return {
    rainThresholdMm: isNaN(rainThreshold) ? 2.5 : rainThreshold,
    windThresholdKph: isNaN(windThreshold) ? 30 : windThreshold,
  };
};

const weatherTranslations: Record<string, Record<string, string>> = {
  en: {
    title: "Local Weather Summary",
    subtitle: "Real-time agro-climatic conditions & safety monitor",
    humidity: "Humidity",
    wind: "Wind Speed",
    rainfall: "Rainfall",
    rainChance: "Rain Chance",
    temp: "Temperature",
    safe: "Safe for Spraying",
    caution: "Caution Required",
    hazardous: "Hazardous Conditions",
    refresh: "Refresh Weather",
    thresholdsLabel: "Safety Limits (.env)",
    windAlertTitle: "High Wind Alert Triggered",
    rainAlertTitle: "Heavy Rainfall Alert Triggered",
    dualAlertTitle: "Severe Weather Warning Triggered",
    dismiss: "Dismiss Banner",
    showDetails: "View Safety Recommendations",
    hideDetails: "Hide Details",
    windAlertMsg: "Wind speed ({wind} km/h) exceeds the configured safety threshold of {limit} km/h.",
    rainAlertMsg: "Precipitation ({rain} mm) exceeds the configured safety threshold of {limit} mm.",
    windAdvice: "Postpone chemical / pesticide spraying immediately to prevent hazardous drift. Secure nursery shade nets.",
    rainAdvice: "Avoid foliar nutrient or fungicide application to prevent chemical runoff. Clear drainage channels to prevent waterlogging.",
    dualAdvice: "Cease all spraying and field operations immediately. Safeguard farm equipment and secure open greenhouse structures.",
    simMode: "Simulate Thresholds",
    liveMode: "Live Real-Time Data",
    simWind: "Test High Wind",
    simRain: "Test Heavy Rain",
    simBoth: "Test Dual Thresholds"
  },
  hi: {
    title: "स्थानीय मौसम सारांश",
    subtitle: "वास्तविक समय कृषि-जलवायु स्थिति एवं सुरक्षा चेतावनी",
    humidity: "आर्द्रता (नमी)",
    wind: "हवा की गति",
    rainfall: "वर्षा मात्रा",
    rainChance: "बारिश की संभावना",
    temp: "तापमान",
    safe: "छिड़काव के लिए सुरक्षित",
    caution: "सावधानी आवश्यक",
    hazardous: "जोखिम भरा मौसम",
    refresh: "रीफ्रेश करें",
    thresholdsLabel: "सुरक्षा सीमा (.env)",
    windAlertTitle: "तेज़ हवा चेतावनी सक्रिय",
    rainAlertTitle: "भारी बारिश चेतावनी सक्रिय",
    dualAlertTitle: "गंभीर मौसम चेतावनी सक्रिय",
    dismiss: "हटाएं",
    showDetails: "सुरक्षा सलाह देखें",
    hideDetails: "विवरण छिपाएं",
    windAlertMsg: "हवा की गति ({wind} km/h) सुरक्षा सीमा ({limit} km/h) से अधिक है।",
    rainAlertMsg: "वर्षा की मात्रा ({rain} mm) सुरक्षा सीमा ({limit} mm) से अधिक है।",
    windAdvice: "दवा बहने और उड़ने से रोकने के लिए छिड़काव तुरंत स्थगित करें। नर्सरी सुरक्षा जाली बांधें।",
    rainAdvice: "कीटनाशक व खाद का छिड़काव न करें ताकि दवा धुल न जाए। जलभराव रोकने के लिए जल निकासी साफ़ करें।",
    dualAdvice: "सभी कृषि छिड़काव और खुले कार्य तुरंत रोकें। कृषि उपकरणों को सुरक्षित स्थान पर रखें।",
    simMode: "सिमुलेशन टेस्ट",
    liveMode: "लाइव डेटा",
    simWind: "तेज़ हवा टेस्ट",
    simRain: "भारी बारिश टेस्ट",
    simBoth: "दोनों सीमाएं टेस्ट"
  },
  kn: {
    title: "ಸ್ಥಳೀಯ ಹವಾಮಾನ ಸಾರಾಂಶ",
    subtitle: "ನೈಜ ಸಮಯದ ಕೃಷಿ-ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿ ಮತ್ತು ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ",
    humidity: "ಆರ್ದ್ರತೆ",
    wind: "ಗಾಳಿಯ ವೇಗ",
    rainfall: "ಮಳೆ ಪ್ರಮಾಣ",
    rainChance: "ಮಳೆಯ ಸಾಧ್ಯತೆ",
    temp: "ತಾಪಮಾನ",
    safe: "ಸಿಂಪರಣೆಗೆ ಸೂಕ್ತ",
    caution: "ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ",
    hazardous: "ಅಪಾಯಕಾರಿ ಹವಾಮಾನ",
    refresh: "ನವೀಕರಿಸಿ",
    thresholdsLabel: "ಸುರಕ್ಷತಾ ಮಿತಿಗಳು (.env)",
    windAlertTitle: "ತೀವ್ರ ಗಾಳಿ ಎಚ್ಚರಿಕೆ",
    rainAlertTitle: "ಭಾರೀ ಮಳೆ ಎಚ್ಚರಿಕೆ",
    dualAlertTitle: "ತೀವ್ರ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ",
    dismiss: "ಮುಚ್ಚಿ",
    showDetails: "ಸುರಕ್ಷತಾ ಸಲಹೆಗಳು",
    hideDetails: "ವಿವರ ಮರೆಮಾಡಿ",
    windAlertMsg: "ಗಾಳಿಯ ವೇಗ ({wind} km/h) ಸುರಕ್ಷತಾ ಮಿತಿ ({limit} km/h) ಮೀರಿದೆ.",
    rainAlertMsg: "ಮಳೆಯ ಪ್ರಮಾಣ ({rain} mm) ಸುರಕ್ಷತಾ ಮಿತಿ ({limit} mm) ಮೀರಿದೆ.",
    windAdvice: "ರಾಸಾಯನಿಕ ಸಿಂಪಡಣೆಯನ್ನು ಕೂಡಲೇ ಮುಂದೂಡಿ. ನರ್ಸರಿ ನೆರಳು ಪರದೆಗಳನ್ನು ಭದ್ರಪಡಿಸಿ.",
    rainAdvice: "ಔಷಧ ಕೊಚ್ಚಿಹೋಗುವುದನ್ನು ತಪ್ಪಿಸಲು ಸಿಂಪಡಣೆ ಮಾಡಬೇಡಿ. ಹೊಲದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಚರಂಡಿ ಸ್ವಚ್ಛಗೊಳಿಸಿ.",
    dualAdvice: "ಎಲ್ಲಾ ಕೃಷಿ ಸಿಂಪರಣಾ ಕಾರ್ಯಗಳನ್ನು ತಕ್ಷಣ ನಿಲ್ಲಿಸಿ. ಉಪಕರಣಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿರಿಸಿ.",
    simMode: "ಪರೀಕ್ಷಾರ್ಥ ಅನುಕರಣೆ",
    liveMode: "ಲೈವ್ ಡೇಟಾ",
    simWind: "ತೀವ್ರ ಗಾಳಿ ಪರೀಕ್ಷೆ",
    simRain: "ಭಾರೀ ಮಳೆ ಪರೀಕ್ಷೆ",
    simBoth: "ಎರಡೂ ಮಿತಿ ಪರೀಕ್ಷೆ"
  }
};

export const WeatherSummary: React.FC<WeatherSummaryProps> = ({
  weatherData,
  locationName = "Local Farm",
  language = "en",
  onRefresh,
  loading = false,
  className = ""
}) => {
  const thresholds = useMemo(() => getEnvThresholds(), []);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showAdviceDetails, setShowAdviceDetails] = useState(false);

  const t = weatherTranslations[language] || weatherTranslations.en;

  // Derive effective values
  const currentTemp = weatherData?.temperature ?? 30;
  const currentHumidity = weatherData?.humidity ?? 65;
  const defaultRainVol = weatherData?.rainVolume ?? 0;
  const defaultWindSpeed = weatherData?.windSpeed ?? 12;
  const defaultRainProb = weatherData?.rainProbability ?? 15;

  // Threshold breach detection
  const isWindExceeded = defaultWindSpeed >= thresholds.windThresholdKph;
  const isRainExceeded = defaultRainVol >= thresholds.rainThresholdMm || defaultRainProb >= 80;
  const isDualExceeded = isWindExceeded && isRainExceeded;
  const hasThresholdBreach = isWindExceeded || isRainExceeded;

  const getWeatherIcon = (code?: number) => {
    if (code !== undefined) {
      if (code >= 95) return <CloudLightning size={18} className="text-amber-500" />;
      if (code >= 51 && code <= 67) return <CloudRain size={18} className="text-blue-500" />;
      if (code >= 1 && code <= 3) return <CloudSun size={18} className="text-amber-400" />;
      if (code === 0) return <Sun size={18} className="text-yellow-500" />;
    }
    return <Sun size={18} className="text-yellow-500" />;
  };

  return (
    <div id="weather-summary-component" className={`w-full space-y-2.5 ${className}`}>
      
      {/* Optional Threshold Breach Alert (Compact) */}
      <AnimatePresence>
        {hasThresholdBreach && !bannerDismissed && (
          <motion.div
            id="weather-threshold-alert-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`w-full rounded-2xl p-3 border shadow-sm flex items-center justify-between gap-3 text-xs ${
              isDualExceeded 
                ? 'bg-red-900 text-white border-red-700' 
                : isWindExceeded 
                  ? 'bg-amber-900 text-white border-amber-700' 
                  : 'bg-blue-900 text-white border-blue-700'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-white/20 shrink-0">
                {isDualExceeded ? <ShieldAlert size={16} /> : isWindExceeded ? <Wind size={16} /> : <CloudRain size={16} />}
              </div>
              <div className="truncate">
                <span className="font-bold">
                  {isDualExceeded ? t.dualAlertTitle : isWindExceeded ? t.windAlertTitle : t.rainAlertTitle}:
                </span>{' '}
                <span className="opacity-90">
                  {isWindExceeded ? `${defaultWindSpeed} km/h (>${thresholds.windThresholdKph} limit)` : `${defaultRainVol} mm (>${thresholds.rainThresholdMm} limit)`}
                </span>
              </div>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="p-1 rounded-lg bg-white/15 hover:bg-white/25 text-white shrink-0 cursor-pointer"
              aria-label={t.dismiss}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MINIMIZED TOP WEATHER SUMMARY BAR */}
      <div 
        id="minimized-weather-bar"
        className="w-full bg-white rounded-2xl p-3 sm:p-3.5 border border-[#bfc9c3]/35 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5"
      >
        {/* Left: Location & Condition */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
              {getWeatherIcon(weatherData?.weatherCode)}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#404944] truncate">
                <MapPin size={11} className="text-[#003527] shrink-0" />
                <span className="truncate">{locationName}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                {weatherData?.condition || "Farm Weather"}
              </span>
            </div>
          </div>

          {/* Refresh button on mobile */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="sm:hidden p-1.5 rounded-lg bg-[#f3f4f5] hover:bg-[#e7e9ea] text-[#003527] transition-all cursor-pointer disabled:opacity-50"
              title={t.refresh}
              aria-label={t.refresh}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          )}
        </div>

        {/* Center/Right: 3 Main Metrics (Temperature, Wind Speed, Humidity) */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
          
          {/* 1. Temperature */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#f8f9fa] border border-[#bfc9c3]/20">
            <Sun size={15} className="text-amber-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-[#404944] uppercase tracking-wider leading-none">{t.temp}</span>
              <span className="text-xs sm:text-sm font-black text-[#191c1d] leading-tight">{currentTemp}°C</span>
            </div>
          </div>

          {/* 2. Wind Speed */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${
            isWindExceeded ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-[#f8f9fa] border-[#bfc9c3]/20'
          }`}>
            <Wind size={15} className={isWindExceeded ? 'text-amber-600 animate-pulse shrink-0' : 'text-[#003527] shrink-0'} />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-[#404944] uppercase tracking-wider leading-none">{t.wind}</span>
              <span className="text-xs sm:text-sm font-black text-[#191c1d] leading-tight">{defaultWindSpeed} km/h</span>
            </div>
          </div>

          {/* 3. Humidity */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#f8f9fa] border border-[#bfc9c3]/20">
            <Droplets size={15} className="text-teal-600 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-[#404944] uppercase tracking-wider leading-none">{t.humidity}</span>
              <span className="text-xs sm:text-sm font-black text-[#191c1d] leading-tight">{currentHumidity}%</span>
            </div>
          </div>

          {/* Refresh button on desktop */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="hidden sm:flex p-2 rounded-xl bg-[#003527]/10 hover:bg-[#003527]/20 text-[#003527] transition-all cursor-pointer disabled:opacity-50"
              title={t.refresh}
              aria-label={t.refresh}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          )}

        </div>

      </div>
    </div>
  );
};

export default WeatherSummary;
