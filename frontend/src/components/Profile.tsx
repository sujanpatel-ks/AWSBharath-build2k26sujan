import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, MapPin, Edit3, Globe, Save, X, Phone, Droplets, Sprout, History, ExternalLink, Loader2, Info, WifiOff, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { useAuth } from '../AuthProvider';
import { toast } from 'sonner';
import { LanguageSelector } from './LanguageSelector';

interface ProfileProps {
  onBack: () => void;
  language: Language;
  onToggleLanguage: (lang?: Language) => void;
}

const INITIAL_DATA = {
  name: 'Ramesh Kumar',
  address: 'Karnataka, India',
  phone: '+91 98765 43210',
  size: '5 Acres',
  crops: 'Tomato, Corn, Potato',
  soilType: 'Red Loamy',
  irrigation: 'Drip Irrigation'
};

const settingsTranslations = {
  en: {
    title: "Settings & Profile",
    subtitle: "Manage your farm details, language & offline mode",
    editProfile: "Edit Farm Profile",
    saveSuccess: "Farm profile updated successfully",
    offlineTitle: "Offline Support Active",
    offlineDesc: "AgroCare is fully optimized for rural regions. All core diagnostic logic, weather summary advice, and historical scans are stored locally on your device and will sync when internet is connected.",
    notifications: "Notification Reminders",
    pestAlerts: "Pest & Outbreak Alerts",
    mandiReminders: "Mandi Price Alerts",
    soilAlerts: "Soil Watering Reminders",
    supportTitle: "Farmer Support Helpline",
    supportDesc: "Need assistance? Chat directly with an expert via WhatsApp or call us.",
    callUs: "Call Helpline",
    farmDetails: "Farm Profile Details",
    irrigationType: "Irrigation Method",
    soilTypeLabel: "Soil Type",
    cropTypes: "Crops Cultivated",
    farmSize: "Farm Size"
  },
  hi: {
    title: "सेटिंग्स और प्रोफ़ाइल",
    subtitle: "अपने खेत का विवरण, भाषा और ऑफ़लाइन मोड प्रबंधित करें",
    editProfile: "खेत प्रोफ़ाइल संपादित करें",
    saveSuccess: "खेत प्रोफ़ाइल सफलतापूर्वक अपडेट की गई",
    offlineTitle: "ऑफ़लाइन सहायता सक्रिय है",
    offlineDesc: "एग्रोकेयर ग्रामीण क्षेत्रों के लिए पूरी तरह से अनुकूलित है। सभी मुख्य नैदानिक तर्क, मौसम सलाह और ऐतिहासिक स्कैन आपके डिवाइस पर स्थानीय रूप से संग्रहीत किए जाते हैं और इंटरनेट कनेक्ट होने पर सिंक हो जाएंगे।",
    notifications: "अधिसूचना अनुस्मारक",
    pestAlerts: "कीट और प्रकोप अलर्ट",
    mandiReminders: "मंडी भाव अलर्ट",
    soilAlerts: "मिट्टी में पानी देने का अनुस्मारक",
    supportTitle: "किसान सहायता हेल्पलाइन",
    supportDesc: "सहायता चाहिए? सीधे व्हाट्सएप पर विशेषज्ञ से बात करें या हमें कॉल करें।",
    callUs: "हेल्पलाइन कॉल करें",
    farmDetails: "खेत प्रोफ़ाइल विवरण",
    irrigationType: "सिंचाई विधि",
    soilTypeLabel: "मिट्टी का प्रकार",
    cropTypes: "उगाई जाने वाली फसलें",
    farmSize: "खेत का आकार"
  },
  kn: {
    title: "ಸಂಯೋಜನೆಗಳು ಮತ್ತು ಪ್ರೊಫೈಲ್",
    subtitle: "ನಿಮ್ಮ ಫಾರ್ಮ್ ವಿವರಗಳು, ಭಾಷೆ ಮತ್ತು ಆಫ್‌ಲೈನ್ ಮೋಡ್ ನಿರ್ವಹಿಸಿ",
    editProfile: "ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ",
    saveSuccess: "ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ",
    offlineTitle: "ಆಫ್‌ಲೈನ್ ಬೆಂಬಲ ಸಕ್ರಿಯವಾಗಿದೆ",
    offlineDesc: "ಅಗ್ರೋಕೇರ್ ಗ್ರಾಮೀಣ ಪ್ರದೇಶಗಳಿಗೆ ಸಂಪೂರ್ಣವಾಗಿ ಹೊಂದುವಂತೆ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ. ಎಲ್ಲಾ ರೋಗನಿರ್ಣಯ ವಿಧಾನಗಳು, ಹವಾಮಾನ ಸಲಹೆಗಳು ಮತ್ತು ಇತಿಹಾಸದ ಸ್ಕ್ಯಾನ್‌ಗಳನ್ನು ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿಯೇ ಉಳಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕಗೊಂಡಾಗ ಸಿಂಕ್ ಆಗುತ್ತದೆ.",
    notifications: "ಅಧಿಸೂಚನೆಗಳು",
    pestAlerts: "ಕೀಟ ಮತ್ತು ರೋಗ ಬಾಧೆ ಎಚ್ಚರಿಕೆಗಳು",
    mandiReminders: "ಮಂಡಿ ದರಗಳ ಎಚ್ಚರಿಕೆಗಳು",
    soilAlerts: "ಮಣ್ಣಿನ ತೇವಾಂಶ ಜ್ಞಾಪನೆಗಳು",
    supportTitle: "ರೈತ ಸಹಾಯವಾಣಿ",
    supportDesc: "ಸಹಾಯ ಬೇಕೇ? ವಾಟ್ಸಾಪ್ ಮೂಲಕ ನೇರವಾಗಿ ತಜ್ಞರೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ ಅಥವಾ ನಮಗೆ ಕರೆ ಮಾಡಿ.",
    callUs: "ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ",
    farmDetails: "ಫಾರ್ಮ್ ವಿವರಗಳು",
    irrigationType: "ನೀರಾವರಿ ಪದ್ಧತಿ",
    soilTypeLabel: "ಮಣ್ಣಿನ ವಿಧ",
    cropTypes: "ಬೆಳೆಯುವ ಬೆಳೆಗಳು",
    farmSize: "ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ"
  }
};

export const Profile: React.FC<ProfileProps> = ({ onBack, language, onToggleLanguage }) => {
  const { signOut, user } = useAuth();
  const t = settingsTranslations[language] || settingsTranslations.en;

  const [isEditing, setIsEditing] = useState(false);
  const [savedData, setSavedData] = useState(INITIAL_DATA);
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(false);

  // Notification states
  const [pestAlerts, setPestAlerts] = useState(true);
  const [mandiReminders, setMandiReminders] = useState(true);
  const [soilAlerts, setSoilAlerts] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedData = localStorage.getItem('agrocare_profile');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setSavedData(parsedData);
          setFormData(parsedData);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem('agrocare_profile', JSON.stringify(formData));
      setSavedData(formData);
      setIsEditing(false);
      toast.success(t.saveSuccess);
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(savedData);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFBF9] p-6 pb-28">
      {/* Header */}
      <div className="mb-8 pt-6">
        <h1 className="text-2xl font-black text-earth tracking-tight">{t.title}</h1>
        <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">{t.subtitle}</p>
      </div>

      <div className="space-y-6">
        {/* Offline Mode Sync Status Banner */}
        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-[24px] flex items-start gap-4">
          <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 text-primary">
            <WifiOff size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>{t.offlineTitle}</span>
              <span className="bg-primary/20 text-primary text-[8px] px-2 py-0.5 rounded-full font-black">ACTIVE</span>
            </h3>
            <p className="text-xs text-emerald-700/90 font-medium leading-relaxed mt-1.5">{t.offlineDesc}</p>
          </div>
        </div>

        {/* Global Language Toggle Selector inside Settings */}
        <div className="bg-white p-5 rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100/80 flex flex-col gap-4">
          <h3 className="text-xs font-black text-earth uppercase tracking-widest flex items-center gap-2">
            <Globe size={15} className="text-primary" />
            <span>App Language Selection</span>
          </h3>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-semibold">Change translation:</span>
            <LanguageSelector />
          </div>
        </div>

        {/* Farmer Profile Card & Form */}
        <div className="bg-white p-5 rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100/80">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-earth uppercase tracking-widest flex items-center gap-2">
              <User size={15} className="text-primary" />
              <span>{t.farmDetails}</span>
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-black px-3.5 py-2 rounded-xl transition-all"
                style={{ minHeight: '40px' }}
              >
                <Edit3 size={14} />
                <span>{t.editProfile}</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="p-2 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-xl transition-all"
                  style={{ minHeight: '40px', minWidth: '40px' }}
                >
                  <X size={16} />
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary-dark text-white text-xs font-black px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                  style={{ minHeight: '40px' }}
                >
                  {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Save size={14} />}
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="space-y-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Farmer Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-[#F8F9FA] border-gray-100 rounded-xl px-3.5 py-3 text-sm font-semibold text-earth focus:border-green-300 focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-[#F8F9FA] border-gray-100 rounded-xl px-3.5 py-3 text-sm font-semibold text-earth focus:border-green-300 focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t.farmSize}</label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="bg-[#F8F9FA] border-gray-100 rounded-xl px-3.5 py-3 text-sm font-semibold text-earth focus:border-green-300 focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t.cropTypes}</label>
                  <input
                    type="text"
                    name="crops"
                    value={formData.crops}
                    onChange={handleChange}
                    className="bg-[#F8F9FA] border-gray-100 rounded-xl px-3.5 py-3 text-sm font-semibold text-earth focus:border-green-300 focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t.soilTypeLabel}</label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleChange}
                    className="bg-[#F8F9FA] border-gray-100 rounded-xl px-3.5 py-3 text-sm font-semibold text-earth focus:border-green-300 focus:bg-white"
                  >
                    <option value="Red Loamy">Red Loamy</option>
                    <option value="Black Cotton">Black Cotton</option>
                    <option value="Clayey">Clayey</option>
                    <option value="Alluvial">Alluvial</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t.irrigationType}</label>
                  <select
                    name="irrigation"
                    value={formData.irrigation}
                    onChange={handleChange}
                    className="bg-[#F8F9FA] border-gray-100 rounded-xl px-3.5 py-3 text-sm font-semibold text-earth focus:border-green-300 focus:bg-white"
                  >
                    <option value="Drip Irrigation">Drip Irrigation</option>
                    <option value="Sprinkler Irrigation">Sprinkler Irrigation</option>
                    <option value="Overhead Rain Irrigation">Overhead Rain Irrigation</option>
                    <option value="Manual Manual">Manual Watering</option>
                  </select>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-4 py-3 border-b border-gray-50">
                  <div className="w-10 h-10 bg-[#F4F6F2] rounded-xl flex items-center justify-center text-primary shrink-0">
                    <User size={18} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Farmer Name</span>
                    <p className="text-sm font-bold text-earth mt-0.5">{savedData.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-3 border-b border-gray-50">
                  <div className="w-10 h-10 bg-[#F4F6F2] rounded-xl flex items-center justify-center text-primary shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Phone Number</span>
                    <p className="text-sm font-bold text-earth mt-0.5">{savedData.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-3 border-b border-gray-50">
                  <div className="w-10 h-10 bg-[#F4F6F2] rounded-xl flex items-center justify-center text-primary shrink-0">
                    <Sprout size={18} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">{t.farmSize} & Crops</span>
                    <p className="text-sm font-bold text-earth mt-0.5">{savedData.size} • {savedData.crops}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-3">
                  <div className="w-10 h-10 bg-[#F4F6F2] rounded-xl flex items-center justify-center text-primary shrink-0">
                    <Droplets size={18} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">{t.soilTypeLabel} & {t.irrigationType}</span>
                    <p className="text-sm font-bold text-earth mt-0.5">{savedData.soilType} • {savedData.irrigation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notification Reminders */}
        <div className="bg-white p-5 rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100/80 space-y-4">
          <h3 className="text-xs font-black text-earth uppercase tracking-widest flex items-center gap-2">
            <Bell size={15} className="text-primary" />
            <span>{t.notifications}</span>
          </h3>

          <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
            <div>
              <h4 className="text-xs font-bold text-earth">{t.pestAlerts}</h4>
              <p className="text-[10px] text-gray-400 font-medium">Real-time alerts for local outbreaks</p>
            </div>
            <button
              onClick={() => setPestAlerts(!pestAlerts)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 cursor-pointer ${pestAlerts ? 'bg-primary' : 'bg-gray-200'}`}
              style={{ minHeight: '32px', minWidth: '48px' }}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${pestAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
            <div>
              <h4 className="text-xs font-bold text-earth">{t.mandiReminders}</h4>
              <p className="text-[10px] text-gray-400 font-medium">Daily local market rates reminder</p>
            </div>
            <button
              onClick={() => setMandiReminders(!mandiReminders)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 cursor-pointer ${mandiReminders ? 'bg-primary' : 'bg-gray-200'}`}
              style={{ minHeight: '32px', minWidth: '48px' }}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${mandiReminders ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex justify-between items-center py-2.5">
            <div>
              <h4 className="text-xs font-bold text-earth">{t.soilAlerts}</h4>
              <p className="text-[10px] text-gray-400 font-medium">Drip irrigation water logs advice</p>
            </div>
            <button
              onClick={() => setSoilAlerts(!soilAlerts)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 cursor-pointer ${soilAlerts ? 'bg-primary' : 'bg-gray-200'}`}
              style={{ minHeight: '32px', minWidth: '48px' }}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${soilAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Farmer Support and Helpline Card */}
        <div className="bg-white p-5 rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100/80 flex flex-col gap-4">
          <div className="flex gap-3.5 items-start">
            <div className="w-11 h-11 bg-green-50 rounded-2xl flex items-center justify-center shrink-0 text-green-600 border border-green-100">
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 className="text-xs font-black text-earth uppercase tracking-widest">{t.supportTitle}</h3>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed mt-1">{t.supportDesc}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3.5 mt-1">
            <a
              href="tel:+9118001801551"
              className="bg-[#F4F6F2] hover:bg-[#EBEEE8] text-[#2E7D32] text-xs font-black py-3.5 rounded-2xl flex items-center justify-center gap-1.5 transition-colors border border-green-100"
              style={{ minHeight: '48px' }}
            >
              <Phone size={14} />
              <span>{t.callUs}</span>
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32] text-xs font-black py-3.5 rounded-2xl flex items-center justify-center gap-1.5 transition-colors border border-green-100"
              style={{ minHeight: '48px' }}
            >
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>

        {/* Log Out */}
        <button
          onClick={signOut}
          className="w-full bg-red-50 hover:bg-red-100/80 text-red-600 font-black text-xs py-4 rounded-[20px] transition-all flex items-center justify-center gap-2 border border-red-100/50"
          style={{ minHeight: '48px' }}
        >
          <LogOut size={16} />
          <span>Log Out Account</span>
        </button>

      </div>
    </div>
  );
};
