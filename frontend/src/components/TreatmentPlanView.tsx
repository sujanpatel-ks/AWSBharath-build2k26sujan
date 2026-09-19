import React, { useState } from 'react';
import { 
  Leaf, 
  FlaskConical, 
  Zap, 
  Clock, 
  Calendar, 
  Store, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Check, 
  MapPin, 
  Navigation, 
  ChevronRight,
  Info,
  Droplets,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';
import { DiagnosisResult, TreatmentDetails } from '../services/gemini';
import { Language, Task } from '../types';
import { toast } from 'sonner';

interface TreatmentPlanViewProps {
  result: DiagnosisResult;
  language: Language;
  onSaveToCalendar: (task: Omit<Task, 'id' | 'completed'>) => void;
  onFindSupplier: (query?: string) => void;
  savedTasks: Set<string>;
}

export const TreatmentPlanView: React.FC<TreatmentPlanViewProps> = ({
  result,
  language,
  onSaveToCalendar,
  onFindSupplier,
  savedTasks
}) => {
  const [areaSize, setAreaSize] = useState<'1acre' | '1ha' | '5acres'>('1acre');

  const isHindi = language === 'hi';
  const isKannada = language === 'kn';

  // Area calculation multipliers
  const areaMultiplier = areaSize === '1acre' ? 1 : areaSize === '1ha' ? 2.47 : 5;
  const areaLabel = areaSize === '1acre' 
    ? (isHindi ? '1 एकड़' : isKannada ? '1 ಎಕರೆ' : '1 Acre') 
    : areaSize === '1ha' 
    ? (isHindi ? '1 हेक्टेयर (2.47 एकड़)' : isKannada ? '1 ಹೆಕ್ಟೇರ್ (2.47 ಎಕರೆ)' : '1 Hectare (2.47 Acres)') 
    : (isHindi ? '5 एकड़' : isKannada ? '5 ಎಕರೆ' : '5 Acres');

  // Extract organic, chemical, and inorganic treatments
  const organic: TreatmentDetails = result?.treatment?.organic || (result as any)?.organicTreatment || {
    name: 'Neem Oil 10,000 PPM / Botanical Bio-Fungicide',
    nameHi: 'नीम तेल 10,000 PPM / जैविक फफूंदनाशक',
    nameKn: 'ಬೇವಿನ ಎಣ್ಣೆ 10,000 PPM / ಜೈವಿಕ ಶಿಲೀಂಧ್ರನಾಶಕ',
    dosage: '3-5 ml per liter water + 1g soap emulsifier',
    frequency: 'Apply in morning (6:00 AM – 9:00 AM)',
    precautions: '100% Honeybee and pollinator safe; 0-day harvest interval',
    costEstimate: '₹ 280 - ₹ 350 / acre',
    modeOfAction: 'Contact bio-antifungal and antifeedant action (ITK Certified)',
    fertilizerCategory: 'Organic Base',
    whereToFetch: {
      storeType: 'Certified Bio-Agri & Organic Input Kendra',
      recommendedShop: 'Sri Lakshmi Bio-Agri & Natural Inputs',
      searchQuery: 'Organic Bio Fertilizer Neem Oil Trichoderma',
      distance: '1.2 km away',
      category: 'Bio-Organic'
    }
  };

  const chemical: TreatmentDetails = result?.treatment?.chemical || (result as any)?.chemicalTreatment || {
    name: 'Mancozeb 75% WP / Systemic Curative Formulation',
    nameHi: 'मेंकोजेब 75% WP / रासायनिक फफूंदनाशक',
    nameKn: 'ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP / ರಾಸಾಯನಿಕ ಶಿಲೀಂಧ್ರನಾಶಕ',
    dosage: '2.0 g per liter water (200 L / acre spray volume)',
    frequency: '2 sprays spaced 12-14 days apart',
    precautions: 'Wear protective mask & rubber gloves; 14-day pre-harvest interval (PHI)',
    costEstimate: '₹ 420 - ₹ 540 / acre',
    modeOfAction: 'Multi-site protective inhibitor for fast disease knockdown',
    fertilizerCategory: 'Chemical Base',
    whereToFetch: {
      storeType: 'Licensed Plant Protection & Chemical Stockist',
      recommendedShop: 'Vikas Agro Chemicals & Seed Center',
      searchQuery: 'Crop Protection Pesticides Fungicides',
      distance: '2.8 km away',
      category: 'Chemical Stockist'
    }
  };

  const inorganic: TreatmentDetails = result?.treatment?.inorganic || (result as any)?.inorganicTreatment || {
    name: 'Copper Oxychloride 50% WP (Mineral Base) + 19:19:19 NPK Foliar',
    nameHi: 'कॉपर ऑक्सीक्लोराइड 50% WP (खनिज आधार) + 19:19:19 एनपीके',
    nameKn: 'ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ 50% WP (ಖನಿಜ ಮೂಲ) + 19:19:19 NPK',
    dosage: '2.5 g COC + 5.0 g NPK per liter water',
    frequency: '2 applications at 10-12 day interval',
    precautions: 'Do not tank mix with acidic pesticides; spray in cool hours',
    costEstimate: '₹ 380 - ₹ 490 / acre',
    modeOfAction: 'Cupric mineral ions denature fungal membranes while NPK restores cellular vitality',
    fertilizerCategory: 'Inorganic Base',
    whereToFetch: {
      storeType: 'Government Fertilizer Depot & IFFCO / PACS Center',
      recommendedShop: 'Kisan Suvidha IFFCO Fertilizer Depot',
      searchQuery: 'Water Soluble NPK Micronutrient Fertilizer Depot',
      distance: '1.8 km away',
      category: 'Fertilizer Depot'
    }
  };

  // Helper for numeric cost calculations
  const parseCost = (costStr: string, fallback: number): number => {
    if (!costStr) return fallback;
    const match = costStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : fallback;
  };

  const orgBaseCost = parseCost(organic.costEstimate, 300);
  const chemBaseCost = parseCost(chemical.costEstimate, 480);
  const inorgBaseCost = parseCost(inorganic.costEstimate, 420);

  // Application due info
  const applicationDue = result.applicationDue || {
    dueDate: isHindi ? 'कल सुबह' : isKannada ? 'ನಾಳೆ ಬೆಳಗ್ಗೆ' : 'Tomorrow Morning',
    dueWindow: '6:00 AM – 9:00 AM',
    recommendedTiming: isHindi 
      ? 'अनुकूल मौसम • बारिश और तेज हवा का कोई खतरा नहीं' 
      : isKannada 
      ? 'ಅನುಕೂಲಕರ ವಾತಾವರಣ • ಮಳೆ ಮತ್ತು ಗಾಳಿಯ ಅಪಾಯವಿಲ್ಲ' 
      : 'Optimal Spray Window • Zero rain washout risk & calm wind (<5 km/h)',
    nextRoundDue: isHindi ? 'राउंड 2 नियत: 7-10 दिनों में' : isKannada ? '2ನೇ ಕಂತು: 7-10 ದಿನಗಳಲ್ಲಿ' : 'Round 2 Due: In 7–10 days',
    priority: 'Within 24-48 Hours',
    weatherSafe: result.weatherAdvisory?.canSprayNow ?? true
  };

  const handleScheduleDue = () => {
    onSaveToCalendar({
      title: `${result.crop} Spray: ${organic.name}`,
      titleHi: `${result.crop} स्प्रे: ${organic.nameHi || organic.name}`,
      titleKn: `${result.crop} ಸಿಂಪರಣೆ: ${organic.nameKn || organic.name}`,
      description: `Scheduled application for ${result.disease}. Timing: ${applicationDue.dueWindow}. Dosage: ${organic.dosage}.`,
      icon: 'Clock',
      color: 'emerald'
    });
    toast.success(isHindi ? 'दवा छिड़काव कार्य कैलेंडर में जोड़ दिया गया!' : isKannada ? 'ಸಿಂಪರಣೆ ಕಾರ್ಯವನ್ನು ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ!' : 'Spray schedule added to Farm Due Calendar for tomorrow!');
  };

  return (
    <div id="direct-treatment-plan-section" className="space-y-6">
      {/* 1. APPLICATION DUE SCHEDULE & TIMING BOX (The user's requested Due Box) */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-900 text-white rounded-2xl lg:rounded-3xl p-5 sm:p-6 shadow-md border border-emerald-700/40 relative overflow-hidden">
        {/* Background glow & accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                <span>{isHindi ? 'आवेदन नियत समय (Application Due)' : isKannada ? 'ಸಿಂಪರಣೆ ದಿನಾಂಕ (Due Window)' : 'Application Due Schedule'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-200 text-xs font-bold">
                <CheckCircle2 className="w-3 h-3 text-teal-400" />
                <span>{applicationDue.dueWindow}</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{applicationDue.dueDate}</span>
              <span className="text-sm font-normal text-emerald-200/80">({applicationDue.dueWindow})</span>
            </h3>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              {applicationDue.recommendedTiming}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-emerald-200/70">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>{applicationDue.nextRoundDue}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isHindi ? 'फसल सुरक्षा प्राथमिकता: उच्च' : isKannada ? 'ಬೆಳೆ ರಕ್ಷಣೆ ಆದ್ಯತೆ: ಹೆಚ್ಚು' : 'Crop Protection Priority: High'}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
            <button
              type="button"
              onClick={handleScheduleDue}
              disabled={savedTasks.has('due-schedule')}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-75"
            >
              <Calendar className="w-4 h-4 text-zinc-950" />
              <span>{savedTasks.has('due-schedule') ? (isHindi ? 'कैलेंडर में निर्धारित है' : isKannada ? 'ಕ್ಯಾಲೆಂಡರ್‌ನಲ್ಲಿದೆ' : 'Scheduled in Calendar') : (isHindi ? 'नियत कार्य कैलेंडर में जोड़ें' : isKannada ? 'ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ' : 'Set Due Date Reminder')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DIRECT 3-CATEGORY TREATMENT & FERTILIZER PLAN HEADER & ACRE CALCULATOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
              {isHindi ? 'अनुशंसित उपचार एवं खाद योजना' : isKannada ? 'ಶಿಫಾರಸು ಮಾಡಿದ ಚಿಕಿತ್ಸೆ ಮತ್ತು ರಸಗೊಬ್ಬರ ಯೋಜನೆ' : 'Direct Treatment & Fertilizer Recommendations'}
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {isHindi 
              ? 'जैविक, रासायनिक एवं अकार्बनिक (खनिज) खाद की सीधी जानकारी और प्राप्ति स्थान' 
              : isKannada 
              ? 'ಜೈವಿಕ, ರಾಸಾಯನಿಕ ಮತ್ತು ಖನಿಜ ರಸಗೊಬ್ಬರಗಳ ನೇರ ವಿವರ ಹಾಗೂ ಪಡೆಯುವ ಸ್ಥಳ' 
              : 'Direct view of Organic, Chemical, and Inorganic / Mineral base fertilizers with store pickup locations'}
          </p>
        </div>

        {/* Farm Area Selector */}
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shrink-0">
          {(['1acre', '1ha', '5acres'] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setAreaSize(size)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                areaSize === size 
                  ? 'bg-white dark:bg-zinc-700 text-emerald-700 dark:text-emerald-300 shadow-xs' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              {size === '1acre' ? '1 Acre' : size === '1ha' ? '1 Hectare' : '5 Acres'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. THE 3 DIRECT FERTILIZER & TREATMENT CARDS (Organic Base, Chemical Base, Inorganic Base) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* CARD 1: 🌿 ORGANIC BASE FERTILIZER & BIO-CARE */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl lg:rounded-3xl border-2 border-emerald-200 dark:border-emerald-800/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isHindi ? '1. जैविक खाद एवं उपचार' : isKannada ? '1. ಸಾವಯವ ರಸಗೊಬ್ಬರ' : '1. Organic Base Fertilizer'}</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">
                {isHindi ? '0-दिन प्रतीक्षा' : '0-Day PHI'}
              </span>
            </div>

            {/* Product Name */}
            <div>
              <h4 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                {organic.name}
              </h4>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                {isHindi ? (organic.nameHi || organic.name) : isKannada ? (organic.nameKn || organic.name) : 'Botanical & Microbial Bio-Formulation'}
              </p>
            </div>

            {/* Dosage & Specifications */}
            <div className="space-y-2.5 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <div className="font-bold text-emerald-900 dark:text-emerald-200 mb-0.5 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isHindi ? 'मात्रा एवं विधि (Dosage):' : isKannada ? 'ಪ್ರಮಾಣ ಮತ್ತು ವಿಧಾನ:' : 'Dosage & Application:'}</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                  {organic.dosage}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <div className="font-bold text-zinc-800 dark:text-zinc-200 mb-0.5">
                  {isHindi ? 'छिड़काव समय एवं आवृत्ति:' : isKannada ? 'ಸಿಂಪರಣೆ ಸಮಯ:' : 'Spray Timing & Frequency:'}
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {organic.frequency}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <div className="font-bold text-zinc-800 dark:text-zinc-200 mb-0.5">
                  {isHindi ? 'जैविक लाभ एवं सुरक्षा:' : isKannada ? 'ಸಾವಯವ ಪ್ರಯೋಜನ:' : 'Eco-Benefits & Safety:'}
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {organic.precautions}
                </p>
              </div>

              {/* Estimated Cost */}
              <div className="flex items-center justify-between text-xs px-1 pt-1 font-bold text-zinc-700 dark:text-zinc-300">
                <span>{isHindi ? `अनुमानित लागत (${areaLabel}):` : `Estimated Cost (${areaLabel}):`}</span>
                <span className="text-emerald-700 dark:text-emerald-400 text-sm font-black">
                  ₹ {Math.round(orgBaseCost * areaMultiplier)}
                </span>
              </div>
            </div>
          </div>

          {/* WHERE TO FETCH SECTION & ACTION BUTTONS */}
          <div className="mt-5 pt-4 border-t border-emerald-100 dark:border-emerald-800/60 space-y-3">
            <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                <span className="flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isHindi ? 'कहाँ से प्राप्त करें (Where to Fetch):' : isKannada ? 'ಎಲ್ಲಿ ಪಡೆಯಬೇಕು:' : 'Where to Fetch:'}</span>
                </span>
                <span className="text-[10px] bg-emerald-200/60 dark:bg-emerald-900 px-1.5 py-0.5 rounded font-bold">
                  {organic.whereToFetch?.distance || '1.2 km away'}
                </span>
              </div>
              <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                {organic.whereToFetch?.recommendedShop || 'Sri Lakshmi Bio-Agri & Natural Inputs'}
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                {organic.whereToFetch?.storeType || 'Certified Bio-Agri & Organic Input Kendra'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onFindSupplier(organic.whereToFetch?.searchQuery || 'Organic Bio Fertilizer Neem Oil')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{isHindi ? 'दुकान खोजें' : isKannada ? 'ಅಂಗಡಿ ಹುಡುಕಿ' : 'Find Bio Store'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSaveToCalendar({
                    title: `Apply Organic: ${organic.name}`,
                    titleHi: `जैविक छिड़काव: ${organic.nameHi || organic.name}`,
                    titleKn: `ಸಾವಯವ ಸಿಂಪರಣೆ: ${organic.nameKn || organic.name}`,
                    description: `Dosage: ${organic.dosage}. Frequency: ${organic.frequency}`,
                    icon: 'Leaf',
                    color: 'emerald'
                  });
                  toast.success(isHindi ? 'जैविक उपचार कार्य तालिका में जोड़ा गया' : 'Added Organic schedule to calendar');
                }}
                className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Schedule in Calendar"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: 🧪 CHEMICAL BASE TREATMENT (FAST KNOCKDOWN) */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl lg:rounded-3xl border-2 border-blue-200 dark:border-blue-800/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-black uppercase tracking-wider">
                <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                <span>{isHindi ? '2. रासायनिक फफूंदनाशक' : isKannada ? '2. ರಾಸಾಯನಿಕ ಕೀಟನಾಶಕ' : '2. Chemical Base Treatment'}</span>
              </span>
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                {isHindi ? '24-48 घंटे तेज़ असर' : 'Fast Knockdown'}
              </span>
            </div>

            {/* Product Name */}
            <div>
              <h4 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                {chemical.name}
              </h4>
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mt-1">
                {isHindi ? (chemical.nameHi || chemical.name) : isKannada ? (chemical.nameKn || chemical.name) : 'Synthetic Active Molecule'}
              </p>
            </div>

            {/* Dosage & Specifications */}
            <div className="space-y-2.5 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                <div className="font-bold text-blue-900 dark:text-blue-200 mb-0.5 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isHindi ? 'मात्रा एवं विधि (Dosage):' : isKannada ? 'ಪ್ರಮಾಣ ಮತ್ತು ವಿಧಾನ:' : 'Dosage & Application:'}</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                  {chemical.dosage}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <div className="font-bold text-zinc-800 dark:text-zinc-200 mb-0.5">
                  {isHindi ? 'आवृत्ति एवं अंतराल:' : isKannada ? 'ಅಂತರ ಮತ್ತು ಆವರ್ತನ:' : 'Application Interval:'}
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {chemical.frequency}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <div className="font-bold text-zinc-800 dark:text-zinc-200 mb-0.5">
                  {isHindi ? 'सुरक्षा एवं कटाई पूर्व प्रतीक्षा:' : isKannada ? 'ಸುರಕ್ಷತೆ ಮತ್ತು ನಿರೀಕ್ಷಣೆ:' : 'Safety & Pre-Harvest Interval (PHI):'}
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {chemical.precautions}
                </p>
              </div>

              {/* Estimated Cost */}
              <div className="flex items-center justify-between text-xs px-1 pt-1 font-bold text-zinc-700 dark:text-zinc-300">
                <span>{isHindi ? `अनुमानित लागत (${areaLabel}):` : `Estimated Cost (${areaLabel}):`}</span>
                <span className="text-blue-700 dark:text-blue-400 text-sm font-black">
                  ₹ {Math.round(chemBaseCost * areaMultiplier)}
                </span>
              </div>
            </div>
          </div>

          {/* WHERE TO FETCH SECTION & ACTION BUTTONS */}
          <div className="mt-5 pt-4 border-t border-blue-100 dark:border-blue-800/60 space-y-3">
            <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between text-[11px] font-bold text-blue-900 dark:text-blue-300 mb-1">
                <span className="flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isHindi ? 'कहाँ से प्राप्त करें (Where to Fetch):' : isKannada ? 'ಎಲ್ಲಿ ಪಡೆಯಬೇಕು:' : 'Where to Fetch:'}</span>
                </span>
                <span className="text-[10px] bg-blue-200/60 dark:bg-blue-900 px-1.5 py-0.5 rounded font-bold">
                  {chemical.whereToFetch?.distance || '2.8 km away'}
                </span>
              </div>
              <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                {chemical.whereToFetch?.recommendedShop || 'Vikas Agro Chemicals & Seed Center'}
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                {chemical.whereToFetch?.storeType || 'Licensed Crop Protection & Chemical Stockist'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onFindSupplier(chemical.whereToFetch?.searchQuery || 'Crop Protection Fungicide Mancozeb')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{isHindi ? 'दुकान खोजें' : isKannada ? 'ಅಂಗಡಿ ಹುಡುಕಿ' : 'Find Chemical Store'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSaveToCalendar({
                    title: `Apply Chemical: ${chemical.name}`,
                    titleHi: `रासायनिक छिड़काव: ${chemical.nameHi || chemical.name}`,
                    titleKn: `ರಾಸಾಯನಿಕ ಸಿಂಪರಣೆ: ${chemical.nameKn || chemical.name}`,
                    description: `Dosage: ${chemical.dosage}. Frequency: ${chemical.frequency}`,
                    icon: 'FlaskConical',
                    color: 'blue'
                  });
                  toast.success(isHindi ? 'रासायनिक उपचार कार्य तालिका में जोड़ा गया' : 'Added Chemical schedule to calendar');
                }}
                className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors cursor-pointer"
                title="Schedule in Calendar"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 3: ⚡ INORGANIC / MINERAL BASE FERTILIZER & MICRONUTRIENTS */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl lg:rounded-3xl border-2 border-amber-200 dark:border-amber-800/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-4">
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>{isHindi ? '3. अकार्बनिक/खनिज खाद' : isKannada ? '3. ಖನಿಜ ರಸಗೊಬ್ಬರ' : '3. Inorganic / Mineral Base'}</span>
              </span>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">
                {isHindi ? 'पोषक पुनर्प्राप्ति' : 'Nutrient Shield'}
              </span>
            </div>

            {/* Product Name */}
            <div>
              <h4 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                {inorganic.name}
              </h4>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-1">
                {isHindi ? (inorganic.nameHi || inorganic.name) : isKannada ? (inorganic.nameKn || inorganic.name) : 'Mineral Salt & Micronutrient Complex'}
              </p>
            </div>

            {/* Dosage & Specifications */}
            <div className="space-y-2.5 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                <div className="font-bold text-amber-900 dark:text-amber-200 mb-0.5 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isHindi ? 'मात्रा एवं प्रयोग दर:' : isKannada ? 'ಪ್ರಮಾಣ ಮತ್ತು ದರ:' : 'Dosage & Application Rate:'}</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                  {inorganic.dosage}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <div className="font-bold text-zinc-800 dark:text-zinc-200 mb-0.5">
                  {isHindi ? 'कार्यप्रणाली (Mineral Action):' : isKannada ? 'ಖನಿಜ ಕ್ರಿಯೆ:' : 'Mineral Cell Action:'}
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {inorganic.modeOfAction || 'Provides mineral ions to strengthen plant cuticle and restore photosynthesis.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <div className="font-bold text-zinc-800 dark:text-zinc-200 mb-0.5">
                  {isHindi ? 'सुरक्षा एवं सावधानी:' : isKannada ? 'ಮುನ್ನೆಚ್ಚರಿಕೆ:' : 'Safety & Precaution:'}
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {inorganic.precautions}
                </p>
              </div>

              {/* Estimated Cost */}
              <div className="flex items-center justify-between text-xs px-1 pt-1 font-bold text-zinc-700 dark:text-zinc-300">
                <span>{isHindi ? `अनुमानित लागत (${areaLabel}):` : `Estimated Cost (${areaLabel}):`}</span>
                <span className="text-amber-700 dark:text-amber-400 text-sm font-black">
                  ₹ {Math.round(inorgBaseCost * areaMultiplier)}
                </span>
              </div>
            </div>
          </div>

          {/* WHERE TO FETCH SECTION & ACTION BUTTONS */}
          <div className="mt-5 pt-4 border-t border-amber-100 dark:border-amber-800/60 space-y-3">
            <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1">
                <span className="flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isHindi ? 'कहाँ से प्राप्त करें (Where to Fetch):' : isKannada ? 'ಎಲ್ಲಿ ಪಡೆಯಬೇಕು:' : 'Where to Fetch:'}</span>
                </span>
                <span className="text-[10px] bg-amber-200/60 dark:bg-amber-900 px-1.5 py-0.5 rounded font-bold">
                  {inorganic.whereToFetch?.distance || '1.8 km away'}
                </span>
              </div>
              <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                {inorganic.whereToFetch?.recommendedShop || 'Kisan Suvidha IFFCO Fertilizer Depot'}
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                {inorganic.whereToFetch?.storeType || 'Government Fertilizer Depot & IFFCO / PACS Center'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onFindSupplier(inorganic.whereToFetch?.searchQuery || 'NPK Micronutrient Fertilizer Depot IFFCO')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{isHindi ? 'डिपो खोजें' : isKannada ? 'ಡಿಪೋ ಹುಡುಕಿ' : 'Find Fertilizer Depot'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSaveToCalendar({
                    title: `Apply Inorganic: ${inorganic.name}`,
                    titleHi: `खनिज खाद छिड़काव: ${inorganic.nameHi || inorganic.name}`,
                    titleKn: `ಖನಿಜ ಸಿಂಪರಣೆ: ${inorganic.nameKn || inorganic.name}`,
                    description: `Dosage: ${inorganic.dosage}. Frequency: ${inorganic.frequency}`,
                    icon: 'Zap',
                    color: 'amber'
                  });
                  toast.success(isHindi ? 'खनिज खाद उपचार कार्य तालिका में जोड़ा गया' : 'Added Inorganic schedule to calendar');
                }}
                className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                title="Schedule in Calendar"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
