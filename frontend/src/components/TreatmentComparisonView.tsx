import React, { useState } from 'react';
import { 
  Leaf, 
  FlaskConical, 
  ArrowRightLeft, 
  TrendingDown, 
  CheckCircle2, 
  Calendar, 
  Store, 
  ZoomIn, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  DollarSign, 
  Layers, 
  Check, 
  Info,
  Droplets,
  HeartHandshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DiagnosisResult, TreatmentDetails } from '../services/gemini';
import { Language, Task } from '../types';
import { getProductDetails } from '../utils/productImages';
import { toast } from 'sonner';
import { TreatmentRechartsComparison } from './TreatmentRechartsComparison';

interface TreatmentComparisonViewProps {
  result: DiagnosisResult;
  language: Language;
  treatmentType: 'organic' | 'chemical' | 'compare';
  onTreatmentTypeChange: (type: 'organic' | 'chemical' | 'compare') => void;
  onSaveToCalendar: (task: Omit<Task, 'id' | 'completed'>) => void;
  onFindSupplier: (query?: string) => void;
  onPreviewImage: (url: string) => void;
  savedTasks: Set<string>;
}

export const TreatmentComparisonView: React.FC<TreatmentComparisonViewProps> = ({
  result,
  language,
  treatmentType,
  onTreatmentTypeChange,
  onSaveToCalendar,
  onFindSupplier,
  onPreviewImage,
  savedTasks
}) => {
  const [areaSize, setAreaSize] = useState<'1acre' | '1ha' | '5acres'>('1ha');

  const organic = result?.treatment?.organic || (result as any)?.organicTreatment || {
    name: 'Neem Oil Extract 1500ppm',
    nameHi: 'नीम तेल स्प्रे',
    dosage: '3-5 ml / L water',
    frequency: 'Every 7-10 days',
    precautions: 'Spray early morning or late afternoon',
    costEstimate: '₹ 350 / Hectare'
  };
  const chemical = result?.treatment?.chemical || (result as any)?.chemicalTreatment || {
    name: 'Mancozeb 75% WP',
    nameHi: 'मेंकोजेब 75% WP',
    dosage: '2 g / L water',
    frequency: 'Every 12-14 days',
    precautions: 'Wear protective mask and gloves',
    costEstimate: '₹ 420 / Hectare'
  };

  const organicProduct = getProductDetails(organic.name, true);
  const chemicalProduct = getProductDetails(chemical.name, false);

  const organicImg = organic.imageUrl || organicProduct.imageUrl;
  const chemicalImg = chemical.imageUrl || chemicalProduct.imageUrl;

  // Extract numeric cost estimates
  const parseCost = (costStr: string, fallback: number): number => {
    if (!costStr) return fallback;
    const match = costStr.match(/\d+([,.]\d+)?/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''));
    }
    return fallback;
  };

  const organicCostPerHa = parseCost(organic.costEstimate, 350);
  const chemicalCostPerHa = parseCost(chemical.costEstimate, 520);

  // Multipliers based on area
  const areaMultiplier = areaSize === '1acre' ? 0.404 : areaSize === '5acres' ? 2.02 : 1;
  const areaLabel = areaSize === '1acre' ? '1 Acre' : areaSize === '5acres' ? '5 Acres' : '1 Hectare (2.47 Acres)';

  const organicTotalCost = Math.round(organicCostPerHa * areaMultiplier);
  const chemicalTotalCost = Math.round(chemicalCostPerHa * areaMultiplier);
  const costDifference = chemicalTotalCost - organicTotalCost;
  const percentSavings = chemicalTotalCost > 0 ? Math.round(((chemicalTotalCost - organicTotalCost) / chemicalTotalCost) * 100) : 0;

  // Max cost for visual proportion bar
  const maxCost = Math.max(organicTotalCost, chemicalTotalCost, 1);
  const organicPercentBar = Math.min(100, Math.round((organicTotalCost / maxCost) * 100));
  const chemicalPercentBar = Math.min(100, Math.round((chemicalTotalCost / maxCost) * 100));

  const translations: Record<Language, any> = {
    en: {
      title: "Treatment Plans & Cost Comparison",
      subtitle: "Side-by-side evaluation of Organic vs. Chemical formulations",
      compareTab: "Side-by-Side Compare",
      organicTab: "Organic Plan",
      chemicalTab: "Chemical Plan",
      costEstimation: "Cost Estimation & Economics",
      savingsBadge: "Organic Eco-Savings",
      saveText: "Save",
      withOrganic: "with Organic Protocol",
      areaSelector: "Calculate for Farm Size:",
      organicProtocol: "Organic Bio-Plan",
      chemicalProtocol: "Fast Chemical Plan",
      brand: "Brand",
      pack: "Pack Size",
      dosage: "Dosage",
      freq: "Frequency",
      actionSpeed: "Action Speed",
      speedOrganic: "5–7 Days (Eco-Balanced)",
      speedChemical: "24–48 Hours (Rapid Knockdown)",
      soilImpact: "Soil & Microbe Impact",
      soilOrganic: "Enriches Soil & 100% Non-Toxic",
      soilChemical: "Fast Eradication • Standard Rotation",
      pollinatorSafety: "Pollinator Safety",
      pollinatorOrganic: "100% Honeybee Safe",
      pollinatorChemical: "Toxic to Bees during spray",
      phiLabel: "Pre-Harvest Interval (PHI)",
      phiOrganic: "0 Days (Immediate harvest)",
      phiChemical: "7–14 Days (Mandatory waiting)",
      resistanceRisk: "Resistance Risk",
      resistanceOrganic: "Very Low (Multi-site bio-mode)",
      resistanceChemical: "Medium (Requires active alternation)",
      recommendedFor: "Best Recommended Scenario",
      recOrganic: "Early/Preventive stage, Export & Sustainable crops",
      recChemical: "Severe outbreak, Emergency rescue & High pest density",
      precaution: "Safety Precaution",
      scheduleBtn: "Add to Calendar",
      scheduledBtn: "Scheduled in Farm Plan",
      supplierBtn: "Find Suppliers",
      matrixTitle: "Comprehensive Treatment Matrix",
      criteria: "Evaluation Criteria",
      organicCol: "🌿 Organic Bio-Treatment",
      chemicalCol: "🧪 Chemical Protocol",
      selectThisPlan: "Select This Plan",
      activePlanBadge: "Current Selected Plan",
      estPerRound: "Estimated Cost per round"
    },
    hi: {
      title: "उपचार योजनाएं और लागत तुलना",
      subtitle: "जैविक बनाम रासायनिक उपचार की आमने-सामने तुलना",
      compareTab: "तुलनात्मक दृश्य (Side-by-Side)",
      organicTab: "जैविक योजना",
      chemicalTab: "रासायनिक योजना",
      costEstimation: "लागत अनुमान एवं बचत",
      savingsBadge: "जैविक बचत लाभ",
      saveText: "बचत करें",
      withOrganic: "जैविक उपचार के साथ",
      areaSelector: "खेत के आकार अनुसार गणना:",
      organicProtocol: "जैविक सुरक्षा प्रोटोकॉल",
      chemicalProtocol: "त्वरित रासायनिक प्रोटोकॉल",
      brand: "ब्रांड",
      pack: "पैकिंग साइज़",
      dosage: "खुराक",
      freq: "छिड़काव आवृत्ति",
      actionSpeed: "असर की गति",
      speedOrganic: "5–7 दिन (प्राकृतिक संतुलन)",
      speedChemical: "24–48 घंटे (त्वरित असर)",
      soilImpact: "मिट्टी और जीवाणु पर प्रभाव",
      soilOrganic: "मिट्टी सुधारक एवं 100% हानिरहित",
      soilChemical: "तेज़ नियंत्रण • फसल चक्र आवश्यक",
      pollinatorSafety: "मधुमक्खी व परागण सुरक्षा",
      pollinatorOrganic: "100% सुरक्षित (मित्र कीट रक्षक)",
      pollinatorChemical: "छिड़काव के समय हानिकारक",
      phiLabel: "फसल तुड़ाई अंतराल (PHI)",
      phiOrganic: "0 दिन (तुरंत तुड़ाई योग्य)",
      phiChemical: "7–14 दिन (अनिवार्य प्रतीक्षा)",
      resistanceRisk: "कीट प्रतिरोध जोखिम",
      resistanceOrganic: "अत्यधिक कम (प्राकृतिक प्रतिरोध)",
      resistanceChemical: "मध्यम (कीटनाशक बदलना जरूरी)",
      recommendedFor: "सर्वोत्तम उपयोग स्थिति",
      recOrganic: "शुरुआती/रोकथाम चरण, निर्यात व जैविक खेती",
      recChemical: "गंभीर प्रकोप, आपातकालीन फसल बचाव",
      precaution: "सुरक्षा सावधानी",
      scheduleBtn: "कैलेंडर में जोड़ें",
      scheduledBtn: "कैलेंडर में निर्धारित",
      supplierBtn: "दुकानदार खोजें",
      matrixTitle: "विस्तृत उपचार तुलना तालिका",
      criteria: "तुलना बिंदु",
      organicCol: "🌿 जैविक उपचार",
      chemicalCol: "🧪 रासायनिक उपचार",
      selectThisPlan: "यह योजना चुनें",
      activePlanBadge: "वर्तमान चयनित योजना",
      estPerRound: "प्रति छिड़काव अनुमानित लागत"
    },
    kn: {
      title: "ಚಿಕಿತ್ಸಾ ಯೋಜನೆಗಳು ಮತ್ತು ವೆಚ್ಚದ ಹೋಲಿಕೆ",
      subtitle: "ಸಾವಯವ ಮತ್ತು ರಾಸಾಯನಿಕ ಸೂತ್ರೀಕರಣಗಳ ನೇರ ಮುಖಾಮುಖಿ ಹೋಲಿಕೆ",
      compareTab: "ಹೋಲಿಕೆ ನೋಟ (Side-by-Side)",
      organicTab: "ಸಾವಯವ ಯೋಜನೆ",
      chemicalTab: "ರಾಸಾಯನಿಕ ಯೋಜನೆ",
      costEstimation: "ವೆಚ್ಚ ಅಂದಾಜು ಮತ್ತು ಉಳಿತಾಯ",
      savingsBadge: "ಸಾವಯವ ಉಳಿತಾಯ",
      saveText: "ಉಳಿಸಿ",
      withOrganic: "ಸಾವಯವ ಪದ್ಧತಿಯೊಂದಿಗೆ",
      areaSelector: "ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣಕ್ಕೆ ಲೆಕ್ಕಹಾಕಿ:",
      organicProtocol: "ಸಾವಯವ ಜೈವಿಕ ಯೋಜನೆ",
      chemicalProtocol: "ತ್ವರಿತ ರಾಸಾಯನಿಕ ಯೋಜನೆ",
      brand: "ಬ್ರ್ಯಾಂಡ್",
      pack: "ಪ್ಯಾಕ್ ಗಾತ್ರ",
      dosage: "ಡೋಸೇಜ್",
      freq: "ಆವರ್ತನ",
      actionSpeed: "ಕ್ರಿಯೆಯ ವೇಗ",
      speedOrganic: "5–7 ದಿನಗಳು (ಪರಿಸರ ಸಮತೋಲನ)",
      speedChemical: "24–48 ಗಂಟೆಗಳು (ತ್ವರಿತ ನಿಯಂತ್ರಣ)",
      soilImpact: "ಮಣ್ಣು ಮತ್ತು ಸೂಕ್ಷ್ಮಜೀವಿಗಳ ಮೇಲಿನ ಪ್ರಭಾವ",
      soilOrganic: "ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಹೆಚ್ಚಿಸುತ್ತದೆ & ಸುರಕ್ಷಿತ",
      soilChemical: "ತ್ವರಿತ ಪರಿಹಾರ • ಬೆಳೆ ಪರಿವರ್ತನೆ ಅಗತ್ಯ",
      pollinatorSafety: "ಪರಾಗಸ್ಪರ್ಶಕ ಹಾಗೂ ಜೇನುನೊಣ ಸುರಕ್ಷತೆ",
      pollinatorOrganic: "100% ಸುರಕ್ಷಿತ (ಸ್ನೇಹಿ ಕೀಟ ರಕ್ಷಕ)",
      pollinatorChemical: "ಸಿಂಪಡಣಾ ಸಮಯದಲ್ಲಿ ಹಾನಿಕಾರಕ",
      phiLabel: "ಕೊಯ್ಲು ಕಾಯುವಿಕೆ ಅವಧಿ (PHI)",
      phiOrganic: "0 ದಿನಗಳು (ತಕ್ಷಣ ಕೊಯ್ಲು ಮಾಡಬಹುದು)",
      phiChemical: "7–14 ದಿನಗಳು (ಕಡ್ಡಾಯ ಕಾಯುವಿಕೆ)",
      resistanceRisk: "ಕೀಟ ನಿರೋಧಕತೆ ಅಪಾಯ",
      resistanceOrganic: "ಅತ್ಯಂತ ಕಡಿಮೆ",
      resistanceChemical: "ಮಧ್ಯಮ (ಔಷಧಿ ಬದಲಾಯಿಸಬೇಕು)",
      recommendedFor: "ಶಿಫಾರಸು ಮಾಡಿದ ಸಂದರ್ಭ",
      recOrganic: "ಆರಂಭಿಕ ಹಂತ, ರಫ್ತು ಮತ್ತು ಸಾವಯವ ಕೃಷಿ",
      recChemical: "ತೀವ್ರ ರೋಗ ಬಾಧೆ, ತುರ್ತು ಬೆಳೆ ಸಂರಕ್ಷಣೆ",
      precaution: "ಮುನ್ನೆಚ್ಚರಿಕೆ",
      scheduleBtn: "ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ",
      scheduledBtn: "ಕ್ಯಾಲೆಂಡರ್‌ನಲ್ಲಿದೆ",
      supplierBtn: "ಮಾರಾಟಗಾರರನ್ನು ಹುಡುಕಿ",
      matrixTitle: "ಸಮಗ್ರ ಚಿಕಿತ್ಸಾ ಹೋಲಿಕೆ ಕೋಷ್ಟಕ",
      criteria: "ಹೋಲಿಕೆಯ ಅಂಶಗಳು",
      organicCol: "🌿 ಸಾವಯವ ಚಿಕಿತ್ಸೆ",
      chemicalCol: "🧪 ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸೆ",
      selectThisPlan: "ಈ ಯೋಜನೆ ಆರಿಸಿ",
      activePlanBadge: "ಆಯ್ಕೆಮಾಡಿದ ಯೋಜನೆ",
      estPerRound: "ಪ್ರತಿ ಸುತ್ತಿನ ಅಂದಾಜು ವೆಚ್ಚ"
    },
    ta: {
      title: "சிகிச்சைத் திட்டங்கள் மற்றும் செலவு ஒப்பீடு",
      subtitle: "இயற்கை மற்றும் ரசாயன சிகிச்சைகளின் நேரடி ஒப்பீடு",
      compareTab: "ஒப்பீட்டுப் பார்வை",
      organicTab: "இயற்கை முறை",
      chemicalTab: "ரசாயன முறை",
      costEstimation: "செலவு மதிப்பீடு மற்றும் சேமிப்பு",
      savingsBadge: "இயற்கை சேமிப்பு",
      saveText: "சேமிக்கவும்",
      withOrganic: "இயற்கை முறை மூலம்",
      areaSelector: "நிலத்தின் பரப்பளவு:",
      organicProtocol: "இயற்கை பாதுகாப்பு முறை",
      chemicalProtocol: "விரைவு ரசாயன முறை",
      brand: "பிராண்ட்",
      pack: "பேக் அளவு",
      dosage: "அளவு (Dosage)",
      freq: "இடைவெளி",
      actionSpeed: "செயல்படும் வேகம்",
      speedOrganic: "5–7 நாட்கள் (சுற்றுச்சூழல் சமநிலை)",
      speedChemical: "24–48 மணிநேரம் (விரைவு கட்டுப்பாடு)",
      soilImpact: "மண் மற்றும் நுண்ணுயிரி தாக்கம்",
      soilOrganic: "மண் வளம் காக்கும் & நஞ்சற்றது",
      soilChemical: "விரைவு கட்டுப்பாடு • மாற்று சுழற்சி தேவை",
      pollinatorSafety: "தேனீ பாதுகாப்பு",
      pollinatorOrganic: "100% தேனீக்களுக்கு பாதுகாப்பானது",
      pollinatorChemical: "தெளிக்கும்போது பாதிப்பு",
      phiLabel: "அறுவடை காத்திருப்பு காலம் (PHI)",
      phiOrganic: "0 நாட்கள் (உடனே அறுவடை செய்யலாம்)",
      phiChemical: "7–14 நாட்கள் (கட்டாய காத்திருப்பு)",
      resistanceRisk: "பூச்சி எதிர்ப்பு ஆபத்து",
      resistanceOrganic: "மிகக் குறைவு",
      resistanceChemical: "நடுத்தரம்",
      recommendedFor: "பரிந்துரைக்கப்பட்ட சூழல்",
      recOrganic: "தொடக்க நிலை, ஏற்றுமதி மற்றும் இயற்கை விவசாயம்",
      recChemical: "தீவிர நோய் தாக்குதல், அவசர பயிர் பாதுகாப்பு",
      precaution: "பாதுகாப்பு எச்சரிக்கை",
      scheduleBtn: "நாள்காட்டியில் சேர்",
      scheduledBtn: "திட்டமிடப்பட்டது",
      supplierBtn: "விற்பனையாளரைக் கண்டுபிடி",
      matrixTitle: "சிகிச்சை ஒப்பீட்டு அட்டவணை",
      criteria: "ஒப்பீட்டுக் காரணிகள்",
      organicCol: "🌿 இயற்கை சிகிச்சை",
      chemicalCol: "🧪 ரசாயன சிகிச்சை",
      selectThisPlan: "இத்திட்டத்தைத் தேர்வுசெய்",
      activePlanBadge: "தேர்ந்தெடுக்கப்பட்ட திட்டம்",
      estPerRound: "சுற்றுக்கான உத்தேச செலவு"
    },
    te: {
      title: "చికిత్స ప్రణాళికలు మరియు ఖర్చు పోలిక",
      subtitle: "సేంద్రీయ మరియు రసాయన చికిత్సల ప్రత్యక్ష పోలిక",
      compareTab: "పోలిక వీక్షణ",
      organicTab: "సేంద్రీయ ప్రణాళిక",
      chemicalTab: "రసాయన ప్రణాళిక",
      costEstimation: "ఖర్చు అంచనా మరియు ఆదా",
      savingsBadge: "సేంద్రీయ ఆదా",
      saveText: "ఆదా చేయండి",
      withOrganic: "సేంద్రీయ విధానంతో",
      areaSelector: "పొలం విస్తీర్ణం లెక్కించండి:",
      organicProtocol: "సేంద్రీయ రక్షణ విధానం",
      chemicalProtocol: "త్వరిత రసాయన విధానం",
      brand: "బ్రాండ్",
      pack: "ప్యాకింగ్ పరిమాణం",
      dosage: "మోతాదు",
      freq: "వినియోగ వ్యవధి",
      actionSpeed: "చర్య వేగం",
      speedOrganic: "5–7 రోజులు (పర్యావరణ సమతుల్యత)",
      speedChemical: "24–48 గంటలు (త్వరిత నియంత్రణ)",
      soilImpact: "నేల మరియు సూక్ష్మజీవుల ప్రభావం",
      soilOrganic: "నేల ఆరోగ్యాన్ని పెంచుతుంది & సురక్షితం",
      soilChemical: "త్వరిత నివారణ • మార్పిడి అవసరం",
      pollinatorSafety: "తేనెటీగల భద్రత",
      pollinatorOrganic: "100% సురక్షితం",
      pollinatorChemical: "పిచికారీ సమయంలో హానికరం",
      phiLabel: "కోత నిరీక్షణ సమయం (PHI)",
      phiOrganic: "0 రోజులు (వెంటనే కోత కోయవచ్చు)",
      phiChemical: "7–14 రోజులు (తప్పనిసరి నిరీక్షణ)",
      resistanceRisk: "పురుగుల నిరోధకత ప్రమాదం",
      resistanceOrganic: "చాలా తక్కువ",
      resistanceChemical: "మధ్యస్థం",
      recommendedFor: "సిఫార్సు చేయబడిన సందర్భం",
      recOrganic: "ప్రారంభ దశ, ఎగుమతి & సేంద్రీయ సాగు",
      recChemical: "తీవ్రమైన తెగులు, అత్యవసర పంట రక్షణ",
      precaution: "ముందస్తు జాగ్రత్త",
      scheduleBtn: "క్యాలెండర్‌కు జోడించు",
      scheduledBtn: "షెడ్యూల్ చేయబడింది",
      supplierBtn: "సరఫరాదారులను కనుగొనండి",
      matrixTitle: "చికిత్స పోలిక పట్టిక",
      criteria: "పోలిక అంశాలు",
      organicCol: "🌿 సేంద్రీయ చికిత్స",
      chemicalCol: "🧪 రసాయన చికిత్స",
      selectThisPlan: "ఈ ప్రణాళికను ఎంచుకోండి",
      activePlanBadge: "ఎంపిక చేసిన ప్రణాళిక",
      estPerRound: "రౌండుకు అంచనా ఖర్చు"
    },
    mr: {
      title: "उपचार योजना व खर्च तुलना",
      subtitle: "सेंद्रिय व रासायनिक उपचार पद्धतींची समोरासमोर तुलना",
      compareTab: "तुलना दृश्य (Side-by-Side)",
      organicTab: "सेंद्रिय योजना",
      chemicalTab: "रासायनिक योजना",
      costEstimation: "खर्च अंदाज व बचत",
      savingsBadge: "सेंद्रिय बचत फायदा",
      saveText: "बचत करा",
      withOrganic: "सेंद्रिय पद्धतीसह",
      areaSelector: "शेताच्या आकारानुसार गणना:",
      organicProtocol: "सेंद्रिय जैविक प्रोटोकॉल",
      chemicalProtocol: "जलद रासायनिक प्रोटोकॉल",
      brand: "ब्रँड",
      pack: "पॅकिंग आकार",
      dosage: "प्रमाण (डोस)",
      freq: "फवारणी वारंवारता",
      actionSpeed: "कार्याची गती",
      speedOrganic: "5–7 दिवस (नैसर्गिक संतुलन)",
      speedChemical: "24–48 तास (जलद नियंत्रण)",
      soilImpact: "माती व सूक्ष्मजीवांवर परिणाम",
      soilOrganic: "जमिनीची सुपीकता वाढवते व सुरक्षित",
      soilChemical: "जलद नियंत्रण • पीक फेरपालट आवश्यक",
      pollinatorSafety: "मधमाश्या व मित्रकीटक सुरक्षा",
      pollinatorOrganic: "100% सुरक्षित",
      pollinatorChemical: "फवारणीवेळी घातक",
      phiLabel: "कापणी प्रतीक्षा कालावधी (PHI)",
      phiOrganic: "0 दिवस (तात्काळ काढणी योग्य)",
      phiChemical: "7–14 दिवस (अनिवार्य प्रतीक्षा)",
      resistanceRisk: "कीटक प्रतिकारशक्ती धोका",
      resistanceOrganic: "अतिशय कमी",
      resistanceChemical: "मध्यम",
      recommendedFor: "शिफारस केलेली परिस्थिती",
      recOrganic: "सुरुवातीचा टप्पा, निर्यात व सेंद्रिय शेती",
      recChemical: "गंभीर प्रादुर्भाव, आपत्कालीन पीक संरक्षण",
      precaution: "सुरक्षा खबरदारी",
      scheduleBtn: "कॅलेंडरमध्ये जोडा",
      scheduledBtn: "कॅलेंडरमध्ये नियोजित",
      supplierBtn: "दुकानदार शोधा",
      matrixTitle: "सविस्तर उपचार तुलना तक्ता",
      criteria: "तुलना मुद्दे",
      organicCol: "🌿 सेंद्रिय उपचार",
      chemicalCol: "🧪 रासायनिक उपचार",
      selectThisPlan: "ही योजना निवडा",
      activePlanBadge: "सध्याची निवडलेली योजना",
      estPerRound: "प्रति फवारणी अंदाजे खर्च"
    }
  };

  const t = translations[language] || translations.en;

  const handleSchedulePlan = (type: 'organic' | 'chemical') => {
    const item = type === 'organic' ? organic : chemical;
    onSaveToCalendar({
      title: `Apply ${item.name}`,
      titleHi: `${type === 'organic' ? 'जैविक' : 'रासायनिक'} उपचार लागू करें`,
      titleKn: `${type === 'organic' ? 'ಸಾವಯವ' : 'ರಾಸಾಯನಿಕ'} ಚಿಕಿತ್ಸೆ ಅನ್ವಯಿಸಿ`,
      description: `Apply ${item.name} (${item.dosage}). Freq: ${item.frequency}. Precautions: ${item.precautions}. Est Cost: ${item.costEstimate}`,
      icon: 'Stethoscope',
      color: type === 'organic' ? 'green' : 'blue'
    });
  };

  return (
    <div id="treatment-comparison-container" className="p-5 sm:p-6 bg-white border border-gray-200/90 rounded-2xl lg:rounded-3xl shadow-xs space-y-6">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h3 className="font-black text-gray-900 text-base sm:text-lg flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
              <ArrowRightLeft size={18} />
            </span>
            <span>{t.title}</span>
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {t.subtitle}
          </p>
        </div>

        {/* View Mode Toggle Controls with Layout Spring */}
        <div className="bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl flex self-start sm:self-auto shrink-0 shadow-inner relative gap-1">
          <button
            id="tab-toggle-compare"
            type="button"
            onClick={() => onTreatmentTypeChange('compare')}
            className={`relative z-10 py-1.5 px-3 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer ${
              treatmentType === 'compare'
                ? 'text-[#003527] dark:text-emerald-300'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            {treatmentType === 'compare' && (
              <motion.div
                layoutId="activeTreatmentSwitcherTab"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                className="absolute inset-0 bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-stone-200/80 dark:border-stone-700 -z-10"
              />
            )}
            <ArrowRightLeft size={13} className={treatmentType === 'compare' ? 'text-[#2D6A4F]' : 'text-stone-400'} />
            <span>{t.compareTab}</span>
          </button>

          <button
            id="tab-toggle-organic"
            type="button"
            onClick={() => onTreatmentTypeChange('organic')}
            className={`relative z-10 py-1.5 px-3 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer ${
              treatmentType === 'organic'
                ? 'text-[#003527] dark:text-emerald-300'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            {treatmentType === 'organic' && (
              <motion.div
                layoutId="activeTreatmentSwitcherTab"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                className="absolute inset-0 bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-emerald-200 dark:border-emerald-800 -z-10"
              />
            )}
            <span>🌿 {t.organicTab}</span>
          </button>

          <button
            id="tab-toggle-chemical"
            type="button"
            onClick={() => onTreatmentTypeChange('chemical')}
            className={`relative z-10 py-1.5 px-3 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer ${
              treatmentType === 'chemical'
                ? 'text-indigo-900 dark:text-indigo-300'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            {treatmentType === 'chemical' && (
              <motion.div
                layoutId="activeTreatmentSwitcherTab"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                className="absolute inset-0 bg-white dark:bg-stone-900 rounded-xl shadow-xs border border-indigo-200 dark:border-indigo-800 -z-10"
              />
            )}
            <span>🧪 {t.chemicalTab}</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Cost Estimation Bar Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-emerald-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-800/60 relative overflow-hidden">
        {/* Background Subtle Wave Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_50%)] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <DollarSign size={12} /> {t.costEstimation}
              </span>
              {percentSavings > 0 && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-emerald-950 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <TrendingDown size={12} /> {t.saveText} {percentSavings}% {t.withOrganic}
                </span>
              )}
            </div>
            <h4 className="font-extrabold text-base sm:text-lg text-white">
              {language === 'hi' ? 'लागत तुलना एवं संभावित आर्थिक बचत' : language === 'kn' ? 'ವೆಚ್ಚ ಹೋಲಿಕೆ ಮತ್ತು ಆರ್ಥಿಕ ಉಳಿತಾಯ' : 'Side-by-Side Cost Economics'}
            </h4>
            <p className="text-xs text-emerald-200/80 font-medium">
              {t.estPerRound} ({areaLabel})
            </p>
          </div>

          {/* Farm Size Area Switcher */}
          <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-xl border border-white/10 shrink-0 self-start md:self-auto">
            <span className="text-[10px] text-emerald-300 font-bold px-2 hidden sm:inline">{t.areaSelector}</span>
            <button
              onClick={() => setAreaSize('1acre')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                areaSize === '1acre' ? 'bg-emerald-500 text-emerald-950 shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              1 Acre
            </button>
            <button
              onClick={() => setAreaSize('1ha')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                areaSize === '1ha' ? 'bg-emerald-500 text-emerald-950 shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              1 Hectare
            </button>
            <button
              onClick={() => setAreaSize('5acres')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                areaSize === '5acres' ? 'bg-emerald-500 text-emerald-950 shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              5 Acres
            </button>
          </div>
        </div>

        {/* Visual Dual Cost Comparison Bars */}
        <div className="mt-4 pt-4 border-t border-emerald-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          
          {/* Organic Cost Meter */}
          <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-700/50 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Leaf size={14} className="text-emerald-400" />
                <span>{t.organicProtocol}</span>
              </span>
              <span className="text-sm sm:text-base font-black text-emerald-200">
                ₹ {organicTotalCost.toLocaleString()}
              </span>
            </div>
            
            <div className="w-full bg-emerald-950/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-emerald-700/40">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${organicPercentBar}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full shadow-xs"
              />
            </div>
            <p className="text-[10px] text-emerald-300/80 mt-1.5 flex items-center justify-between">
              <span>{organic.costEstimate}</span>
              <span className="font-bold text-emerald-300">🌱 Eco Value</span>
            </p>
          </div>

          {/* Chemical Cost Meter */}
          <div className="bg-indigo-950/60 p-3 rounded-xl border border-indigo-700/50 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <FlaskConical size={14} className="text-indigo-400" />
                <span>{t.chemicalProtocol}</span>
              </span>
              <span className="text-sm sm:text-base font-black text-indigo-200">
                ₹ {chemicalTotalCost.toLocaleString()}
              </span>
            </div>
            
            <div className="w-full bg-indigo-950/90 rounded-full h-2.5 overflow-hidden p-0.5 border border-indigo-700/40">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${chemicalPercentBar}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-400 to-indigo-400 rounded-full shadow-xs"
              />
            </div>
            <p className="text-[10px] text-indigo-300/80 mt-1.5 flex items-center justify-between">
              <span>{chemical.costEstimate}</span>
              <span className="font-bold text-amber-300">⚡ Rapid Shock</span>
            </p>
          </div>

        </div>

        {/* Savings Footnote */}
        {costDifference > 0 && (
          <div className="mt-3 text-[11px] font-semibold text-emerald-200 bg-emerald-800/40 px-3 py-1.5 rounded-lg border border-emerald-700/60 flex items-center justify-between">
            <span>
              💡 <strong>{language === 'hi' ? 'आर्थिक लाभ' : language === 'kn' ? 'ಆರ್ಥಿಕ ಲಾಭ' : 'Economic Impact'}:</strong> {language === 'hi' ? `जैविक विधि चुनने पर प्रति स्प्रे ₹ ${costDifference} की सीधी बचत होगी।` : language === 'kn' ? `ಸಾವಯವ ವಿಧಾನದಿಂದ ಪ್ರತಿ ಸಿಂಪಡಣೆಗೆ ₹ ${costDifference} ಉಳಿತಾಯವಾಗುತ್ತದೆ.` : `Choosing organic saves approx ₹ ${costDifference} per treatment spray cycle.`}
            </span>
            <span className="font-mono font-bold text-amber-300 shrink-0 ml-2">
              ~₹{(costDifference * 3).toLocaleString()} / season
            </span>
          </div>
        )}
      </div>

      {/* Recharts Bar Chart Comparison for Cost & Dosage Efficiency */}
      <TreatmentRechartsComparison
        organic={organic}
        chemical={chemical}
        organicCost={organicTotalCost}
        chemicalCost={chemicalTotalCost}
        areaSize={areaSize}
        language={language}
      />

      {/* Side-by-Side Treatment Columns (Visible in 'compare' mode or individual tabs) */}
      <div className={`grid gap-5 ${treatmentType === 'compare' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* Organic Treatment Card */}
        {(treatmentType === 'compare' || treatmentType === 'organic') && (
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={`rounded-2xl p-4 sm:p-5 border transition-all relative flex flex-col justify-between ${
              treatmentType === 'organic'
                ? 'bg-gradient-to-br from-emerald-50/80 via-white to-green-50/40 border-emerald-300 ring-2 ring-emerald-200 shadow-sm'
                : 'bg-emerald-50/40 hover:bg-emerald-50/60 border-emerald-200/90 shadow-2xs'
            }`}
          >
            <div>
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                  <Leaf size={13} className="text-emerald-700" />
                  <span>{t.organicProtocol}</span>
                </span>
                
                <span className="text-xs font-black text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-2xs">
                  Est: {organic.costEstimate}
                </span>
              </div>

              {/* Product Visual & Identity */}
              <div className="flex gap-3.5 items-start">
                <div 
                  className="relative group shrink-0 cursor-pointer"
                  onClick={() => onPreviewImage(organicImg)}
                  title="Click to Zoom Packaging"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1 ring-2 ring-emerald-500/30 shadow-xs overflow-hidden relative">
                    <img 
                      src={organicImg} 
                      alt={organic.name}
                      className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold gap-1 backdrop-blur-[1px]">
                      <ZoomIn size={12} />
                      <span>Zoom</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-black text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
                    {organicProduct.category}
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-gray-900 mt-1 leading-snug">
                    {organic.name}
                  </h4>
                  {organic.nameHi && language !== 'en' && (
                    <p className="text-xs text-gray-600 font-medium mt-0.5">
                      {language === 'hi' ? organic.nameHi : organic.name}
                    </p>
                  )}
                  <p className="text-xs text-emerald-800 font-bold mt-1">
                    {t.brand}: <span className="text-gray-700 font-medium">{organic.brand || organicProduct.brand}</span>
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {t.pack}: {organic.packagingSize || organicProduct.packagingSize}
                  </p>
                </div>
              </div>

              {/* Core Parameters Pill Grid */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                    {t.dosage}
                  </span>
                  <span className="text-xs font-bold text-gray-900 mt-0.5 block leading-tight">
                    {organic.dosage}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                    {t.freq}
                  </span>
                  <span className="text-xs font-bold text-gray-900 mt-0.5 block leading-tight">
                    {organic.frequency}
                  </span>
                </div>
              </div>

              {/* Action Speed & Safety Attributes */}
              <div className="mt-3.5 space-y-2 bg-white/80 p-3 rounded-xl border border-emerald-100/90 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500 font-semibold flex items-center gap-1 text-[11px]">
                    <Clock size={12} className="text-emerald-600" /> {t.actionSpeed}:
                  </span>
                  <span className="font-bold text-emerald-900 text-right text-[11px]">
                    {t.speedOrganic}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500 font-semibold flex items-center gap-1 text-[11px]">
                    <ShieldCheck size={12} className="text-emerald-600" /> {t.soilImpact}:
                  </span>
                  <span className="font-bold text-emerald-900 text-right text-[11px]">
                    {t.soilOrganic}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500 font-semibold flex items-center gap-1 text-[11px]">
                    <Sparkles size={12} className="text-emerald-600" /> {t.pollinatorSafety}:
                  </span>
                  <span className="font-bold text-emerald-700 text-right text-[11px]">
                    {t.pollinatorOrganic}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500 font-semibold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 size={12} className="text-emerald-600" /> {t.phiLabel}:
                  </span>
                  <span className="font-bold text-emerald-800 text-right text-[11px]">
                    {t.phiOrganic}
                  </span>
                </div>
              </div>

              {/* Safety Precaution Note */}
              <div className="mt-3 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-950 leading-relaxed font-medium">
                <strong className="font-black text-emerald-900 block mb-0.5">{t.precaution}:</strong>
                {organic.precautions}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-4 pt-3 border-t border-emerald-200/80 flex items-center gap-2">
              <button
                onClick={() => {
                  handleSchedulePlan('organic');
                  toast.success('Scheduled Organic Treatment in Farm Calendar');
                }}
                disabled={savedTasks.has('treat-organic')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                  savedTasks.has('treat-organic')
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-inner'
                    : 'bg-[#1B5E20] hover:bg-[#144317] text-white border-[#1B5E20] shadow-xs'
                }`}
              >
                {savedTasks.has('treat-organic') ? <Check size={14} /> : <Calendar size={14} />}
                <span>{savedTasks.has('treat-organic') ? t.scheduledBtn : t.scheduleBtn}</span>
              </button>

              <button
                onClick={() => onFindSupplier(organic.name)}
                className="py-2 px-3 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
                title="Find Nearby Organic Fertilizer & Bio-Agro Stores"
              >
                <Store size={14} className="text-emerald-700" />
                <span className="hidden sm:inline">{t.supplierBtn}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Chemical Treatment Card */}
        {(treatmentType === 'compare' || treatmentType === 'chemical') && (
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={`rounded-2xl p-4 sm:p-5 border transition-all relative flex flex-col justify-between ${
              treatmentType === 'chemical'
                ? 'bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/40 border-indigo-300 ring-2 ring-indigo-200 shadow-sm'
                : 'bg-indigo-50/30 hover:bg-indigo-50/50 border-indigo-200/90 shadow-2xs'
            }`}
          >
            <div>
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-indigo-950 bg-indigo-100 border border-indigo-300 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                  <FlaskConical size={13} className="text-indigo-700" />
                  <span>{t.chemicalProtocol}</span>
                </span>
                
                <span className="text-xs font-black text-indigo-900 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200 shadow-2xs">
                  Est: {chemical.costEstimate}
                </span>
              </div>

              {/* Product Visual & Identity */}
              <div className="flex gap-3.5 items-start">
                <div 
                  className="relative group shrink-0 cursor-pointer"
                  onClick={() => onPreviewImage(chemicalImg)}
                  title="Click to Zoom Packaging"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1 ring-2 ring-indigo-500/30 shadow-xs overflow-hidden relative">
                    <img 
                      src={chemicalImg} 
                      alt={chemical.name}
                      className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold gap-1 backdrop-blur-[1px]">
                      <ZoomIn size={12} />
                      <span>Zoom</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-black text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200 uppercase tracking-wider">
                    {chemicalProduct.category}
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-gray-900 mt-1 leading-snug">
                    {chemical.name}
                  </h4>
                  {chemical.nameHi && language !== 'en' && (
                    <p className="text-xs text-gray-600 font-medium mt-0.5">
                      {language === 'hi' ? chemical.nameHi : chemical.name}
                    </p>
                  )}
                  <p className="text-xs text-indigo-900 font-bold mt-1">
                    {t.brand}: <span className="text-gray-700 font-medium">{chemical.brand || chemicalProduct.brand}</span>
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {t.pack}: {chemical.packagingSize || chemicalProduct.packagingSize}
                  </p>
                </div>
              </div>

              {/* Core Parameters Pill Grid */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 block">
                    {t.dosage}
                  </span>
                  <span className="text-xs font-bold text-gray-900 mt-0.5 block leading-tight">
                    {chemical.dosage}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 block">
                    {t.freq}
                  </span>
                  <span className="text-xs font-bold text-gray-900 mt-0.5 block leading-tight">
                    {chemical.frequency}
                  </span>
                </div>
              </div>

              {/* Action Speed & Safety Attributes */}
              <div className="mt-3.5 space-y-2 bg-white/80 p-3 rounded-xl border border-indigo-100/90 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500 font-semibold flex items-center gap-1 text-[11px]">
                    <Clock size={12} className="text-indigo-600" /> {t.actionSpeed}:
                  </span>
                  <span className="font-bold text-indigo-950 text-right text-[11px]">
                    {t.speedChemical}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500 font-semibold flex items-center gap-1 text-[11px]">
                    <ShieldCheck size={12} className="text-indigo-600" /> {t.soilImpact}:
                  </span>
                  <span className="font-bold text-indigo-950 text-right text-[11px]">
                    {t.soilChemical}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500 font-semibold flex items-center gap-1 text-[11px]">
                    <AlertTriangle size={12} className="text-amber-600" /> {t.pollinatorSafety}:
                  </span>
                  <span className="font-bold text-amber-700 text-right text-[11px]">
                    {t.pollinatorChemical}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500 font-semibold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 size={12} className="text-indigo-600" /> {t.phiLabel}:
                  </span>
                  <span className="font-bold text-indigo-900 text-right text-[11px]">
                    {t.phiChemical}
                  </span>
                </div>
              </div>

              {/* Safety Precaution Note */}
              <div className="mt-3 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-950 leading-relaxed font-medium">
                <strong className="font-black text-amber-900 block mb-0.5">{t.precaution}:</strong>
                {chemical.precautions}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-4 pt-3 border-t border-indigo-200/80 flex items-center gap-2">
              <button
                onClick={() => {
                  handleSchedulePlan('chemical');
                  toast.success('Scheduled Chemical Treatment in Farm Calendar');
                }}
                disabled={savedTasks.has('treat-chemical')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                  savedTasks.has('treat-chemical')
                    ? 'bg-indigo-100 text-indigo-800 border-indigo-300 shadow-inner'
                    : 'bg-indigo-900 hover:bg-indigo-950 text-white border-indigo-900 shadow-xs'
                }`}
              >
                {savedTasks.has('treat-chemical') ? <Check size={14} /> : <Calendar size={14} />}
                <span>{savedTasks.has('treat-chemical') ? t.scheduledBtn : t.scheduleBtn}</span>
              </button>

              <button
                onClick={() => onFindSupplier(chemical.name)}
                className="py-2 px-3 bg-white hover:bg-indigo-50 text-indigo-900 font-bold text-xs rounded-xl border border-indigo-300 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
                title="Find Authorized Chemical Agri Dealerships"
              >
                <Store size={14} className="text-indigo-700" />
                <span className="hidden sm:inline">{t.supplierBtn}</span>
              </button>
            </div>
          </motion.div>
        )}

      </div>

      {/* Comprehensive Side-by-Side Evaluation Matrix Table (Shown when in 'compare' view mode) */}
      {treatmentType === 'compare' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 pt-5 border-t border-gray-200/80"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-extrabold text-sm sm:text-base text-gray-900 flex items-center gap-2">
              <Layers size={16} className="text-emerald-700" />
              <span>{t.matrixTitle}</span>
            </h4>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Agronomic Decision Matrix
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/90 border-b border-gray-200 text-gray-700 font-black text-[11px] uppercase tracking-wider">
                  <th className="p-3.5 w-1/3 sm:w-1/4">{t.criteria}</th>
                  <th className="p-3.5 bg-emerald-50/60 text-emerald-950 border-x border-emerald-100 w-1/3 sm:w-3/8">
                    {t.organicCol}
                  </th>
                  <th className="p-3.5 bg-indigo-50/50 text-indigo-950 w-1/3 sm:w-3/8">
                    {t.chemicalCol}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {/* Cost Row */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3.5 font-bold text-gray-900 bg-gray-50/40">
                    💰 {t.costEstimation}
                  </td>
                  <td className="p-3.5 bg-emerald-50/30 text-emerald-950 font-bold border-x border-emerald-100">
                    <span className="text-emerald-800">{organic.costEstimate}</span>
                    <span className="ml-1.5 text-[9px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded font-black">
                      Low Cost
                    </span>
                  </td>
                  <td className="p-3.5 bg-indigo-50/20 text-indigo-950 font-semibold">
                    <span className="text-indigo-900">{chemical.costEstimate}</span>
                  </td>
                </tr>

                {/* Speed of Action */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3.5 font-bold text-gray-900 bg-gray-50/40">
                    ⚡ {t.actionSpeed}
                  </td>
                  <td className="p-3.5 bg-emerald-50/30 text-emerald-900 border-x border-emerald-100 font-medium">
                    {t.speedOrganic}
                  </td>
                  <td className="p-3.5 bg-indigo-50/20 text-indigo-950 font-bold">
                    <span className="text-indigo-900">{t.speedChemical}</span>
                    <span className="ml-1.5 text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-black">
                      Fastest
                    </span>
                  </td>
                </tr>

                {/* Soil & Ecology */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3.5 font-bold text-gray-900 bg-gray-50/40">
                    🌱 {t.soilImpact}
                  </td>
                  <td className="p-3.5 bg-emerald-50/30 text-emerald-900 border-x border-emerald-100 font-medium">
                    {t.soilOrganic}
                  </td>
                  <td className="p-3.5 bg-indigo-50/20 text-indigo-950 font-medium">
                    {t.soilChemical}
                  </td>
                </tr>

                {/* Honeybee / Pollinator */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3.5 font-bold text-gray-900 bg-gray-50/40">
                    🐝 {t.pollinatorSafety}
                  </td>
                  <td className="p-3.5 bg-emerald-50/30 text-emerald-800 border-x border-emerald-100 font-bold">
                    ✅ {t.pollinatorOrganic}
                  </td>
                  <td className="p-3.5 bg-indigo-50/20 text-amber-900 font-semibold">
                    ⚠️ {t.pollinatorChemical}
                  </td>
                </tr>

                {/* Pre-Harvest Interval */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3.5 font-bold text-gray-900 bg-gray-50/40">
                    ⏳ {t.phiLabel}
                  </td>
                  <td className="p-3.5 bg-emerald-50/30 text-emerald-900 border-x border-emerald-100 font-bold">
                    {t.phiOrganic}
                  </td>
                  <td className="p-3.5 bg-indigo-50/20 text-indigo-950 font-medium">
                    {t.phiChemical}
                  </td>
                </tr>

                {/* Pest Resistance Risk */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3.5 font-bold text-gray-900 bg-gray-50/40">
                    🛡️ {t.resistanceRisk}
                  </td>
                  <td className="p-3.5 bg-emerald-50/30 text-emerald-900 border-x border-emerald-100 font-medium">
                    {t.resistanceOrganic}
                  </td>
                  <td className="p-3.5 bg-indigo-50/20 text-indigo-950 font-medium">
                    {t.resistanceChemical}
                  </td>
                </tr>

                {/* Best Recommended Scenario */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3.5 font-bold text-gray-900 bg-gray-50/40">
                    🎯 {t.recommendedFor}
                  </td>
                  <td className="p-3.5 bg-emerald-50/30 text-emerald-950 border-x border-emerald-100 font-semibold leading-relaxed">
                    {t.recOrganic}
                  </td>
                  <td className="p-3.5 bg-indigo-50/20 text-indigo-950 font-semibold leading-relaxed">
                    {t.recChemical}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

    </div>
  );
};
