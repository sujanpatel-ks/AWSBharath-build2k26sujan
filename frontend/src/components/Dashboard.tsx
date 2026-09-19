import React, { useState, useEffect, useRef } from 'react';
import { Bell, MapPin, Camera, Upload, Calendar as CalendarIcon, Store, X, Sprout, Users, TrendingUp, Beaker, Landmark, CloudRain, Sun, Wind, Droplets, RefreshCw, Loader2, Info, CheckCircle, AlertTriangle, AlertCircle, Thermometer, ChevronRight, MessageSquare, Sparkles, AlertOctagon, HelpCircle, Settings, Smartphone, Share2, Copy, Check, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUploader } from './FileUploader';
import { Language } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import { useTranslation } from 'react-i18next';
import { Task, Screen } from '../types';
import { TopNav } from './TopNav';
import { HeroSection } from './HeroSection';
import { HeroCard } from './HeroCard';
import { NewHomeDashboard } from './NewHomeDashboard';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
  onFileSelect: (file: File) => void;
  onAddTask?: (task: Omit<Task, 'id' | 'completed'>) => void;
  language: Language;
  onToggleLanguage: (lang?: Language) => void;
  onCameraOpen: () => void;
  lastDiagnosis?: any;
  tasks?: Task[];
  onToggleTask?: (id: string) => void;
}

interface WeatherSummaryData {
  temperature: number;
  humidity: number;
  rainVolume: number;
  rainProbability: number;
  maxRainProbability: number;
  windSpeed: number;
  weatherCode: number;
  summary: string;
  advice: string[];
  farmingIndex: 'Favorable' | 'Caution Required' | 'Hazardous';
}

const tWeather: Record<string, any> = {
  en: {
    weatherTitle: "Weather Summary",
    subtitle: "Precision Farm Forecast",
    temperature: "Temperature",
    rainProbability: "Rain Probability",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    farmingAdvice: "Smart Agro-Advice",
    farmingIndex: "Farming Index",
    favorable: "Favorable",
    caution: "Caution Required",
    hazardous: "Hazardous",
    fetching: "Updating farm forecast...",
    noLocation: "Enable GPS for precise localized advice.",
    retry: "Refresh Weather",
    todayMax: "Today's Max",
    cropsProfile: "Profile Context"
  },
  hi: {
    weatherTitle: "मौसम सारांश",
    subtitle: "सटीक कृषि पूर्वानुमान",
    temperature: "तापमान",
    rainProbability: "बारिश की संभावना",
    humidity: "आर्द्रता (नमी)",
    windSpeed: "हवा की गति",
    farmingAdvice: "कृषि-सलाह",
    farmingIndex: "खेती सूचकांक",
    favorable: "अनुकूल",
    caution: "सावधानी आवश्यक",
    hazardous: "जोखिम भरा",
    fetching: "मौसम अपडेट हो रहा है...",
    noLocation: "सटीक स्थानीय सलाह के लिए जीपीएस चालू करें।",
    retry: "मौसम रीफ्रेश करें",
    todayMax: "आज की अधिकतम",
    cropsProfile: "प्रोफाइल संदर्भ"
  },
  kn: {
    weatherTitle: "ಹವಾಮಾನ ಸಾರಾಂಶ",
    subtitle: "ನಿಖರ ಕೃಷಿ ಮುನ್ಸೂಚನೆ",
    temperature: "ತಾಪಮಾನ",
    rainProbability: "ಮಳೆಯ ಸಾಧ್ಯತೆ",
    humidity: "ಆರ್ದ್ರತೆ",
    windSpeed: "ಗಾಳಿಯ ವೇಗ",
    farmingAdvice: "ಕೃಷಿ ಸಲಹೆ",
    farmingIndex: "ಕೃಷಿ ಸೂಚ್ಯಂಕ",
    favorable: "ಅನುಕೂಲಕರ",
    caution: "ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ",
    hazardous: "ಅಪಾಯಕಾರಿ",
    fetching: "ಹವಾಮಾನ ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ...",
    noLocation: "ನಿಖರವಾದ ಕೃಷಿ ಸಲಹೆಗಾಗಿ ಜಿಪಿಎಸ್ ಸಕ್ರಿಯಗೊಳಿಸಿ.",
    retry: "ಹವಾಮಾನ ಮರುಲೋಡ್ ಮಾಡಿ",
    todayMax: "ಇಂದಿನ ಗರಿಷ್ಠ",
    cropsProfile: "ಪ್ರೊಫೈಲ್ ಮಾಹಿತಿ"
  }
};

const dashboardTranslations: Record<string, any> = {
  en: {
    scanCrop: "Scan Crop",
    scanDesc: "Hold camera over an affected leaf for instant AI diagnosis",
    startScanner: "Tap to Start Camera View",
    uploadLabel: "Upload Crop Photo",
    lastDiagnosisTitle: "Recent Scan Result",
    noScansYet: "No scans recorded yet.",
    viewResult: "View Treatment Details",
    quickTools: "Farming Utilities",
    welcome: "Welcome back!",
    activeDiagnosis: "Diagnose Leaf",
    onlineMode: "Offline Ready",
    highSeverity: "High Severity",
    medSeverity: "Medium Severity",
    lowSeverity: "Low Severity",
    soilHealth: "Soil Health Status",
    goodStatus: "Optimal",
    tapToCapture: "Tap to Capture Diagnosis"
  },
  hi: {
    scanCrop: "फसल स्कैन करें",
    scanDesc: "तुरंत एआई निदान के लिए प्रभावित पत्ते पर कैमरा रखें",
    startScanner: "कैमरा व्यू शुरू करने के लिए टैप करें",
    uploadLabel: "फसल की फोटो अपलोड करें",
    lastDiagnosisTitle: "हालिया स्कैन परिणाम",
    noScansYet: "अभी तक कोई स्कैन नहीं किया गया है।",
    viewResult: "उपचार विवरण देखें",
    quickTools: "कृषि उपयोगिताएँ",
    welcome: "स्वागत है!",
    activeDiagnosis: "पत्ता निदान",
    onlineMode: "ऑफ़लाइन तैयार",
    highSeverity: "उच्च गंभीरता",
    medSeverity: "मध्यम गंभीरता",
    lowSeverity: "निम्न गंभीरता",
    soilHealth: "मिट्टी स्वास्थ्य स्थिति",
    goodStatus: "अनुकूल",
    tapToCapture: "निदान के लिए फोटो लें"
  },
  kn: {
    scanCrop: "ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    scanDesc: "ತ್ವರಿತ AI ರೋಗನಿರ್ಣಯಕ್ಕಾಗಿ ಪೀಡಿತ ಎಲೆಯ ಮೇಲೆ ಕ್ಯಾಮೆರಾ ಹಿಡಿಯಿರಿ",
    startScanner: "ಕ್ಯಾಮೆರಾ ವೀಕ್ಷಣೆ ಪ್ರಾರಂಭಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
    uploadLabel: "ಬೆಳೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    lastDiagnosisTitle: "ಇತ್ತೀಚಿನ ಸ್ಕ್ಯಾನ್ ಫಲಿತಾಂಶ",
    noScansYet: "ಇನ್ನೂ ಯಾವುದೇ ಸ್ಕ್ಯಾನ್‌ಗಳಿಲ್ಲ.",
    viewResult: "ಚಿಕಿತ್ಸೆಯ ವಿವರಗಳನ್ನು ನೋಡಿ",
    quickTools: "ಕೃಷಿ ಉಪಯುಕ್ತತೆಗಳು",
    welcome: "ಸ್ವಾಗತ!",
    activeDiagnosis: "ಎಲೆ ರೋಗ ಪತ್ತೆ",
    onlineMode: "ಆಫ್‌ಲೈನ್ ಸಿದ್ಧವಾಗಿದೆ",
    highSeverity: "ಹೆಚ್ಚಿನ ತೀವ್ರತೆ",
    medSeverity: "ಮಧ್ಯಮ ತೀವ್ರತೆ",
    lowSeverity: "ಕಡಿಮೆ ತೀವ್ರತೆ",
    soilHealth: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಮಾಹಿತಿ",
    goodStatus: "ಉತ್ತಮ",
    tapToCapture: "ರೋಗ ಪತ್ತೆಗೆ ಫೋಟೋ ತೆಗೆಯಿರಿ"
  }
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  onFileSelect, 
  onAddTask, 
  language, 
  onToggleLanguage, 
  onCameraOpen,
  lastDiagnosis,
  tasks,
  onToggleTask
}) => {
  const { t } = useTranslation();
  const dTrans = dashboardTranslations[language] || dashboardTranslations.en;
  
  const { latitude, longitude, loading: locationLoading, error: locationError, requestLocation } = useGeolocation();
  const [locationName, setLocationName] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<{ temp: number, condition: string, icon: React.ReactNode } | null>(null);
  const [weatherSummary, setWeatherSummary] = useState<WeatherSummaryData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [showWeatherCollapse, setShowWeatherCollapse] = useState(false);

  // Share state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const getShareReportText = () => {
    if (!lastDiagnosis) return '';
    const cropName = lastDiagnosis.crop || 'Crop';
    const diseaseName = (language === 'hi' && lastDiagnosis.diseaseHi) ? lastDiagnosis.diseaseHi :
                        (language === 'kn' && lastDiagnosis.diseaseKn) ? lastDiagnosis.diseaseKn :
                        lastDiagnosis.disease || 'Diagnosis';
    const severity = lastDiagnosis.severity || 'Medium';
    const confidence = lastDiagnosis.confidence || 95;
    const adviceText = lastDiagnosis.treatment?.chemical?.[0] || lastDiagnosis.treatment?.organic?.[0] || 'Consult local Krishi Kendra advisor for guidance.';

    return `🌾 *KrishiSewa Crop Health Diagnosis Report*\n\n` +
           `• *Crop:* ${cropName}\n` +
           `• *Diagnosis:* ${diseaseName}\n` +
           `• *Severity:* ${severity}\n` +
           `• *AI Match Confidence:* ${confidence}%\n` +
           `• *Key Treatment:* ${adviceText}\n\n` +
           `📱 *Generated via KrishiSewa Smart Farming Assistant*`;
  };

  const handleNativeShare = async () => {
    const text = getShareReportText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `KrishiSewa Diagnosis: ${lastDiagnosis?.crop || 'Crop'}`,
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.info("Native share dismissed or unavailable:", err);
      }
    } else {
      handleCopyShareText();
    }
  };

  const handleWhatsAppShare = () => {
    const text = getShareReportText();
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTelegramShare = () => {
    const text = getShareReportText();
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
  };

  const handleCopyShareText = async () => {
    const text = getShareReportText();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch (err) {
      console.warn("Clipboard copy failed:", err);
    }
  };

  // Home camera scanner state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [flash, setFlash] = useState(false);

  // Auto-start camera stream if supported on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraLoading(true);
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn("Home camera stream initialization failed:", err);
      setCameraError(err.message || "Camera access denied or unavailable.");
      setCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg');
        setFlash(true);
        setTimeout(() => setFlash(false), 150);
        
        // Convert base64 to file to pass to onFileSelect
        fetch(base64)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "home_scan.jpg", { type: "image/jpeg" });
            onFileSelect(file);
          })
          .catch(err => {
            console.error("Failed to process captured image file:", err);
          });
      }
    }
  };

  const fetchWeather = () => {
    if (latitude && longitude) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then(res => res.json())
        .then(data => {
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.county;
            const state = data.address.state;
            setLocationName(city && state ? `${city}, ${state}` : city || 'Local Farm');
          }
        })
        .catch(() => setLocationName('Local Farm'));

      setWeatherLoading(true);
      fetch('/api/weather-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, language })
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch weather");
          return res.json();
        })
        .then((data: WeatherSummaryData) => {
          setWeatherSummary(data);
          
          let conditionStr = 'Clear';
          if (data.rainProbability > 50) conditionStr = 'Rainy';
          else if (data.humidity > 80) conditionStr = 'Humid';
          else if (data.weatherCode >= 1 && data.weatherCode <= 3) conditionStr = 'Partly Cloudy';
          
          let iconComponent = <Sun size={20} className="text-yellow-400 animate-pulse" />;
          if (data.rainProbability > 50) iconComponent = <CloudRain size={20} className="text-blue-400" />;
          else if (data.weatherCode >= 1 && data.weatherCode <= 3) iconComponent = <Wind size={20} className="text-gray-400" />;

          setWeatherData({
            temp: Math.round(data.temperature),
            condition: conditionStr,
            icon: iconComponent
          });
        })
        .catch(err => {
          console.warn("Weather summary fallback:", err);
          setWeatherData({
            temp: 32,
            condition: 'Partly Cloudy',
            icon: <Sun size={20} className="text-yellow-400" />
          });
        })
        .finally(() => setWeatherLoading(false));
    }
  };

  // Reverse geocoding & Weather fetching
  useEffect(() => {
    fetchWeather();
  }, [latitude, longitude, language]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] select-none">
      <NewHomeDashboard
        onNavigate={onNavigate}
        onFileSelect={onFileSelect}
        onCameraOpen={() => {
          if (onCameraOpen) {
            onCameraOpen();
          } else {
            startCamera();
          }
        }}
        language={language}
        onToggleLanguage={onToggleLanguage}
        locationName={locationLoading ? (tWeather[language]?.fetching || 'GPS Locating...') : locationError ? 'Location Error' : locationName || (language === 'hi' ? 'लुधियाना, पंजाब' : language === 'kn' ? 'ತುಮಕೂರು, ಕರ್ನಾಟಕ' : 'Ludhiana, Punjab')}
        weatherData={weatherData}
        weatherSummary={weatherSummary}
        lastDiagnosis={lastDiagnosis}
        unreadCount={2}
        onRefreshWeather={fetchWeather}
        weatherLoading={weatherLoading}
        tasks={tasks}
        onToggleTask={onToggleTask}
        onAddTask={onAddTask}
      />

      {/* Hidden file input for camera/upload trigger */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onFileSelect(file);
          }
        }}
      />

      {/* Active Camera Viewfinder Overlay when user triggers live camera */}
      {cameraActive && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg aspect-[4/3] bg-neutral-950 rounded-[30px] overflow-hidden shadow-2xl border border-neutral-800 flex flex-col justify-between p-4">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover z-0 rounded-[30px]"
            />

            {/* Viewfinder Target Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
              <div className="w-56 h-56 border-2 border-white/30 rounded-[28px] relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-[12px]"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-[12px]"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-[12px]"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-[12px]"></div>
                
                {/* Scanning line */}
                <motion.div 
                  animate={{ top: ['5%', '95%', '5%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                />
              </div>
            </div>

            {/* Flash effect */}
            <AnimatePresence>
              {flash && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white z-40 rounded-[30px]"
                />
              )}
            </AnimatePresence>

            {/* Header controls inside camera */}
            <div className="relative z-20 w-full flex justify-between items-center">
              <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-md">
                <Sparkles size={13} className="text-emerald-400 animate-pulse" />
                <span>AI Live Scanner</span>
              </div>
              <button 
                onClick={stopCamera}
                className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full border border-white/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-md"
                title="Close Camera"
              >
                <X size={18} />
              </button>
            </div>

            {/* Shutter capture button */}
            <div className="relative z-20 w-full flex flex-col items-center gap-1.5 pb-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCapture}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl active:scale-95 cursor-pointer border-4 border-emerald-500 ring-4 ring-white/30"
              >
                <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-inner">
                  <Camera size={24} />
                </div>
              </motion.button>
              <span className="text-[10px] font-black text-white uppercase bg-black/70 px-3 py-0.5 rounded-full backdrop-blur-md border border-white/10 tracking-wider">
                {dTrans.tapToCapture}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Share Diagnosis Modal */}
      <AnimatePresence>
        {shareModalOpen && lastDiagnosis && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-6 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col gap-5 relative overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary">
                    <Share2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-earth text-base">
                      {language === 'hi' ? 'निदान रिपोर्ट साझा करें' :
                       language === 'kn' ? 'ವರದಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳಿ' :
                       'Share Diagnosis Report'}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {language === 'hi' ? 'सोशल मीडिया और मैसेजिंग ऐप्स पर भेजें' :
                       language === 'kn' ? 'ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ ಮತ್ತು ಮೆಸೇಜಿಂಗ್ ಆ್ಯಪ್‌ಗಳಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ' :
                       'Export to WhatsApp, Telegram or social apps'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-earth transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Diagnosis Summary Preview Card */}
              <div className="bg-gradient-to-br from-emerald-50/80 to-green-50/40 p-4 rounded-2xl border border-emerald-100/80 flex gap-3.5 items-center">
                {lastDiagnosis.imageUrl && (
                  <img
                    src={lastDiagnosis.imageUrl}
                    alt="Scan leaf"
                    className="w-16 h-16 rounded-xl object-cover border border-emerald-200 shrink-0 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest block">{lastDiagnosis.crop || 'Crop'}</span>
                  <h4 className="font-black text-earth text-sm truncate">
                    {language === 'hi' && lastDiagnosis.diseaseHi ? lastDiagnosis.diseaseHi :
                     language === 'kn' && lastDiagnosis.diseaseKn ? lastDiagnosis.diseaseKn :
                     lastDiagnosis.disease}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-primary">
                      {lastDiagnosis.confidence}% Match
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {lastDiagnosis.severity} Severity
                    </span>
                  </div>
                </div>
              </div>

              {/* Share Actions Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* WhatsApp */}
                <button
                  onClick={handleWhatsAppShare}
                  className="p-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <MessageSquare size={18} />
                  <span>WhatsApp</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={handleTelegramShare}
                  className="p-3.5 rounded-2xl bg-[#229ED9] hover:bg-[#1d8cb0] text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Send size={18} />
                  <span>Telegram</span>
                </button>

                {/* Native Share */}
                <button
                  onClick={handleNativeShare}
                  className="p-3.5 rounded-2xl bg-earth hover:bg-neutral-800 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Share2 size={18} />
                  <span>
                    {language === 'hi' ? 'अन्य ऐप्स' :
                     language === 'kn' ? 'ಇತರ ಆ್ಯಪ್‌ಗಳು' :
                     'Share Apps'}
                  </span>
                </button>

                {/* Copy Text */}
                <button
                  onClick={handleCopyShareText}
                  className="p-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-earth font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 border border-gray-200"
                >
                  {copiedToast ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
                  <span>
                    {copiedToast ? (
                      language === 'hi' ? 'कॉपी हो गया!' :
                      language === 'kn' ? 'ಕಾಪಿ ಮಾಡಲಾಗಿದೆ!' :
                      'Copied!'
                    ) : (
                      language === 'hi' ? 'कॉपी करें' :
                      language === 'kn' ? 'ಕಾಪಿ ಮಾಡಿ' :
                      'Copy Text'
                    )}
                  </span>
                </button>
              </div>

              {/* Toast Notification */}
              <AnimatePresence>
                {copiedToast && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CheckCircle size={16} />
                    <span>Report copied to clipboard! Ready to paste & share.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
