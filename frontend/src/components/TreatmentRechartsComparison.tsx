import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { 
  DollarSign, 
  Droplets, 
  Activity, 
  Sparkles, 
  TrendingDown, 
  Scale, 
  ShieldCheck, 
  Zap, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { TreatmentDetails } from '../services/gemini';
import { Language } from '../types';

interface TreatmentRechartsComparisonProps {
  organic: TreatmentDetails;
  chemical: TreatmentDetails;
  organicCost: number;
  chemicalCost: number;
  areaSize: '1acre' | '1ha' | '5acres';
  language: Language;
}

type ChartMetric = 'cost' | 'dosage' | 'efficiency';

export const TreatmentRechartsComparison: React.FC<TreatmentRechartsComparisonProps> = ({
  organic,
  chemical,
  organicCost,
  chemicalCost,
  areaSize,
  language
}) => {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('cost');

  // Parse dosage values (ml or g per Liter)
  const parseDosageNumber = (dosageStr: string, fallback: number): number => {
    if (!dosageStr) return fallback;
    const matches = dosageStr.match(/\d+(\.\d+)?/g);
    if (matches && matches.length > 0) {
      if (matches.length >= 2 && dosageStr.includes('-')) {
        return (parseFloat(matches[0]) + parseFloat(matches[1])) / 2;
      }
      return parseFloat(matches[0]);
    }
    return fallback;
  };

  const organicDosage = parseDosageNumber(organic.dosage, 3.5);
  const chemicalDosage = parseDosageNumber(chemical.dosage, 1.5);

  // Water requirements based on area size
  // 1 Acre ~ 180 Liters, 1 Hectare ~ 450 Liters, 5 Acres ~ 900 Liters
  const waterLiters = areaSize === '1acre' ? 180 : areaSize === '5acres' ? 900 : 450;
  const areaLabel = areaSize === '1acre' ? '1 Acre' : areaSize === '5acres' ? '5 Acres' : '1 Hectare';

  // Total formulation volume required per round (ml or grams)
  const organicTotalFormulation = Math.round(organicDosage * waterLiters);
  const chemicalTotalFormulation = Math.round(chemicalDosage * waterLiters);

  // Cost per 100L spray mixture (₹)
  const organicCostPer100L = Math.round((organicCost / (waterLiters / 100)));
  const chemicalCostPer100L = Math.round((chemicalCost / (waterLiters / 100)));

  // Full season (3 spray rounds)
  const organicSeasonCost = organicCost * 3;
  const chemicalSeasonCost = chemicalCost * 3;
  const seasonSavings = chemicalSeasonCost - organicSeasonCost;

  // 1. Cost Comparison Dataset
  const costData = [
    {
      category: language === 'hi' ? 'प्रति स्प्रे लागत' : language === 'kn' ? 'ಪ್ರತಿ ಸಿಂಪಡಣಾ ವೆಚ್ಚ' : 'Per Spray Round',
      organic: organicCost,
      chemical: chemicalCost,
      unit: '₹'
    },
    {
      category: language === 'hi' ? '100L घोल लागत' : language === 'kn' ? '100L ದ್ರಾವಣ ವೆಚ್ಚ' : 'Per 100L Tank',
      organic: organicCostPer100L,
      chemical: chemicalCostPer100L,
      unit: '₹'
    },
    {
      category: language === 'hi' ? 'पूरे सीजन (3 राउंड)' : language === 'kn' ? 'ಪೂರ್ಣ ಸೀಸನ್ (3 ಸುತ್ತು)' : 'Full Season (3x)',
      organic: organicSeasonCost,
      chemical: chemicalSeasonCost,
      unit: '₹'
    }
  ];

  // 2. Dosage & Volume Efficiency Dataset
  const dosageData = [
    {
      category: language === 'hi' ? 'डोज़ प्रति लीटर' : language === 'kn' ? 'ಪ್ರತಿ ಲೀಟರ್‌ಗೆ ಡೋಸ್' : 'Dosage Rate (per L)',
      organic: Number(organicDosage.toFixed(1)),
      chemical: Number(chemicalDosage.toFixed(1)),
      unit: 'ml/g per L'
    },
    {
      category: language === 'hi' ? 'कुल आवश्यक मात्रा' : language === 'kn' ? 'ಒಟ್ಟು ಅಗತ್ಯ ಪ್ರಮಾಣ' : 'Total Formulation Volume',
      organic: organicTotalFormulation,
      chemical: chemicalTotalFormulation,
      unit: 'ml / g'
    },
    {
      category: language === 'hi' ? 'घोल लागत दक्षता' : language === 'kn' ? 'ದ್ರಾವಣ ದಕ್ಷತೆ' : 'Tank Mix Cost (100L)',
      organic: organicCostPer100L,
      chemical: chemicalCostPer100L,
      unit: '₹'
    }
  ];

  // 3. Agronomic Efficiency & Safety Score (0-100 scale)
  const efficiencyData = [
    {
      category: language === 'hi' ? 'लागत वहनीयता' : language === 'kn' ? 'ವೆಚ್ಚ ಮಿತವ್ಯಯ' : 'Cost Economy',
      organic: 88,
      chemical: 60,
      unit: 'pts (/100)'
    },
    {
      category: language === 'hi' ? 'पर्यावरण व मधुमक्खी' : language === 'kn' ? 'ಪರಿಸರ & ಜೇನು ಸುರಕ್ಷತೆ' : 'Ecology & Pollinators',
      organic: 98,
      chemical: 38,
      unit: 'pts (/100)'
    },
    {
      category: language === 'hi' ? 'कीट नियंत्रण गति' : language === 'kn' ? 'ನಿಯಂತ್ರಣ ವೇಗ' : 'Knockdown Speed',
      organic: 72,
      chemical: 96,
      unit: 'pts (/100)'
    },
    {
      category: language === 'hi' ? 'अवशेष मुक्ति (PHI)' : language === 'kn' ? 'ಅವಶೇಷ ಮುಕ್ತತೆ' : 'Zero Residue Safety',
      organic: 100,
      chemical: 48,
      unit: 'pts (/100)'
    },
    {
      category: language === 'hi' ? 'मिट्टी उर्वरता लाभ' : language === 'kn' ? 'ಮಣ್ಣಿನ ಫಲವತ್ತತೆ' : 'Soil Microbe Health',
      organic: 94,
      chemical: 42,
      unit: 'pts (/100)'
    }
  ];

  const currentData = activeMetric === 'cost' ? costData : activeMetric === 'dosage' ? dosageData : efficiencyData;

  const translations = {
    en: {
      chartHeading: "Visual Comparison Charts (Recharts)",
      costTab: "Cost & Economics",
      dosageTab: "Dosage & Volume",
      efficiencyTab: "Agronomic Safety Index",
      organicLegend: `🌿 Organic: ${organic.name}`,
      chemicalLegend: `🧪 Chemical: ${chemical.name}`,
      costSummary: `Organic plan delivers approx ₹${Math.abs(chemicalCost - organicCost).toLocaleString()} savings per round on ${areaLabel}.`,
      dosageSummary: `Chemical uses lower concentration (${chemicalDosage} vs ${organicDosage} ml/L), but Organic delivers superior ecological safety and zero chemical residues.`,
      efficiencySummary: `Organic excels in pollinator & soil health (98/100) with zero harvest delay, while Chemical offers rapid shock knock-down (96/100).`,
      togglePrompt: "Interactive metric selector:"
    },
    hi: {
      chartHeading: "तुलनात्मक बार चार्ट विश्लेषण (Recharts)",
      costTab: "लागत एवं अर्थव्यवस्था",
      dosageTab: "खुराक एवं मात्रा",
      efficiencyTab: "सुरक्षा एवं कार्यकुशलता इंडेक्स",
      organicLegend: `🌿 जैविक: ${organic.name}`,
      chemicalLegend: `🧪 रासायनिक: ${chemical.name}`,
      costSummary: `जैविक योजना ${areaLabel} पर प्रति स्प्रे लगभग ₹${Math.abs(chemicalCost - organicCost).toLocaleString()} की बचत देती है।`,
      dosageSummary: `रासायनिक में कम मात्रा (${chemicalDosage} vs ${organicDosage} ml/L) लगती है, परंतु जैविक से 100% रासायनिक अवशेष मुक्ति व मित्र कीट सुरक्षा मिलती है।`,
      efficiencySummary: `जैविक विधि मिट्टी व मधुमक्खी सुरक्षा में अव्वल (98/100) है, वहीं रासायनिक तेजी से कीट नियंत्रण (96/100) करता है।`,
      togglePrompt: "मापदंड चुनें:"
    },
    kn: {
      chartHeading: "ಹೋಲಿಕೆ ಬಾರ್ ಚಾರ್ಟ್ ವಿಶ್ಲೇಷಣೆ (Recharts)",
      costTab: "ವೆಚ್ಚ ಮತ್ತು ಆರ್ಥಿಕತೆ",
      dosageTab: "ಡೋಸೇಜ್ ಮತ್ತು ಪ್ರಮಾಣ",
      efficiencyTab: "ಸುರಕ್ಷತೆ & ದಕ್ಷತೆ ಸೂಚ್ಯಂಕ",
      organicLegend: `🌿 ಸಾವಯವ: ${organic.name}`,
      chemicalLegend: `🧪 ರಾಸಾಯನಿಕ: ${chemical.name}`,
      costSummary: `ಸಾವಯವ ಯೋಜನೆಯು ${areaLabel} ಗೆ ಪ್ರತಿ ಸುತ್ತಿನಲ್ಲಿ ₹${Math.abs(chemicalCost - organicCost).toLocaleString()} ಉಳಿತಾಯ ನೀಡುತ್ತದೆ.`,
      dosageSummary: `ರಾಸಾಯನಿಕದಲ್ಲಿ ಕಡಿಮೆ ಡೋಸೇಜ್ (${chemicalDosage} vs ${organicDosage} ml/L) ಸಾಕು, ಆದರೆ ಸಾವಯವವು ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಮತ್ತು ಶೂನ್ಯ ರಾಸಾಯನಿಕ ಅವಶೇಷ ಖಾತರಿಪಡಿಸುತ್ತದೆ.`,
      efficiencySummary: `ಸಾವಯವವು ಜೇನುನೊಣ ಹಾಗೂ ಮಣ್ಣಿನ ಸೂಕ್ಷ್ಮಜೀವಿಗಳಿಗೆ ಸುರಕ್ಷಿತ (98/100), ರಾಸಾಯನಿಕವು ತ್ವರಿತ ನಿಯಂತ್ರಣ (96/100) ಒದಗಿಸುತ್ತದೆ.`,
      togglePrompt: "ಮಾನದಂಡ ಆಯ್ಕೆಮಾಡಿ:"
    },
    ta: {
      chartHeading: "ஒப்பீட்டு பார் வரைபடம் (Recharts)",
      costTab: "செலவு & பொருளாதாரம்",
      dosageTab: "மருந்து அளவு & கொள்ளளவு",
      efficiencyTab: "பாதுகாப்பு குறியீடு",
      organicLegend: `🌿 இயற்கை: ${organic.name}`,
      chemicalLegend: `🧪 ரசாயனம்: ${chemical.name}`,
      costSummary: `இயற்கை முறை ${areaLabel} நிலத்தில் சுற்றுக்கு சுமார் ₹${Math.abs(chemicalCost - organicCost).toLocaleString()} சேமிக்கிறது.`,
      dosageSummary: `ரசாயனத்தில் குறைந்த அளவு (${chemicalDosage} vs ${organicDosage} ml/L) போதும், ஆனால் இயற்கை முறை நஞ்சற்ற மண் வளத்தை உறுதிசெய்கிறது.`,
      efficiencySummary: `இயற்கை முறை தேனீக்கள் மற்றும் மண்ணிற்கு 98/100 பாதுகாப்பு தருகிறது.`,
      togglePrompt: "மதிப்பீட்டு முறை:"
    },
    te: {
      chartHeading: "పోలిక బార్ చార్ట్ (Recharts)",
      costTab: "ఖర్చు & ఆర్థిక ప్రయోజనం",
      dosageTab: "మోతాదు & పరిమాణం",
      efficiencyTab: "రక్షణ & సామర్థ్య సూచిక",
      organicLegend: `🌿 సేంద్రీయ: ${organic.name}`,
      chemicalLegend: `🧪 రసాయన: ${chemical.name}`,
      costSummary: `సేంద్రీయ పద్ధతి ${areaLabel} పై రౌండుకు ₹${Math.abs(chemicalCost - organicCost).toLocaleString()} ఆదా చేస్తుంది.`,
      dosageSummary: `రసాయనంలో తక్కువ మోతాదు సరిపోతుంది, కానీ సేంద్రీయ పద్ధతి పర్యావరణానికి 100% మేలు చేస్తుంది.`,
      efficiencySummary: `సేంద్రీయ పద్ధతి నేల ఆరోగ్యం & తేనెటీగల రక్షణలో (98/100) ముందంజలో ఉంటుంది.`,
      togglePrompt: "సూచికను ఎంచుకోండి:"
    },
    mr: {
      chartHeading: "तुलनात्मक बार चार्ट (Recharts)",
      costTab: "खर्च व अर्थव्यवस्था",
      dosageTab: "डोस व प्रमाण",
      efficiencyTab: "सुरक्षा व कार्यक्षमता निर्देशांक",
      organicLegend: `🌿 सेंद्रिय: ${organic.name}`,
      chemicalLegend: `🧪 रासायनिक: ${chemical.name}`,
      costSummary: `सेंद्रिय पद्धत ${areaLabel} वर प्रति फवारणी सुमारे ₹${Math.abs(chemicalCost - organicCost).toLocaleString()} बचत देते.`,
      dosageSummary: `रासायनिकमध्ये कमी डोस लागतो, परंतु सेंद्रियमुळे 100% विषमुक्त पीक व मधमाश्यांचे रक्षण होते.`,
      efficiencySummary: `सेंद्रिय पद्धती माती व पर्यावरणासाठी (98/100) अत्यंत सुरक्षित आहे.`,
      togglePrompt: "निकष निवडा:"
    }
  };

  const t = translations[language] || translations.en;

  // Custom Chart Tooltip with high visual polish
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const orgVal = payload.find((p: any) => p.dataKey === 'organic')?.value;
      const chemVal = payload.find((p: any) => p.dataKey === 'chemical')?.value;
      const unit = payload[0]?.payload?.unit || '';

      return (
        <div className="bg-gray-900/95 backdrop-blur-md text-white p-3 rounded-xl border border-gray-700/80 shadow-xl text-xs space-y-2 min-w-[200px] z-50">
          <p className="font-bold text-gray-200 border-b border-gray-700/80 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-gray-400 uppercase font-mono">{unit}</span>
          </p>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Organic</span>
              </span>
              <span className="font-mono font-black text-sm text-emerald-300">
                {unit === '₹' ? `₹ ${orgVal?.toLocaleString()}` : `${orgVal} ${unit}`}
              </span>
            </div>

            <div className="flex items-center justify-between text-indigo-300">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                <span>Chemical</span>
              </span>
              <span className="font-mono font-black text-sm text-indigo-200">
                {unit === '₹' ? `₹ ${chemVal?.toLocaleString()}` : `${chemVal} ${unit}`}
              </span>
            </div>
          </div>

          {activeMetric === 'cost' && chemVal > orgVal && (
            <div className="pt-1 border-t border-gray-700/80 text-[10px] text-amber-300 flex items-center gap-1 font-semibold">
              <TrendingDown size={11} />
              <span>Organic saves ₹{(chemVal - orgVal).toLocaleString()}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-50/70 rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs space-y-4">
      {/* Visual Chart Header & Metric Filter Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-200/80 pb-3">
        <div>
          <h4 className="font-black text-sm sm:text-base text-gray-900 flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
              <Activity size={15} />
            </span>
            <span>{t.chartHeading}</span>
          </h4>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {activeMetric === 'cost' ? t.costSummary : activeMetric === 'dosage' ? t.dosageSummary : t.efficiencySummary}
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-gray-200 shadow-2xs self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveMetric('cost')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
              activeMetric === 'cost'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <DollarSign size={13} />
            <span>{t.costTab}</span>
          </button>

          <button
            onClick={() => setActiveMetric('dosage')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
              activeMetric === 'dosage'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Droplets size={13} />
            <span>{t.dosageTab}</span>
          </button>

          <button
            onClick={() => setActiveMetric('efficiency')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
              activeMetric === 'efficiency'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ShieldCheck size={13} />
            <span>{t.efficiencyTab}</span>
          </button>
        </div>
      </div>

      {/* Recharts Bar Chart Area */}
      <div className="w-full h-64 sm:h-72 bg-white rounded-xl p-2 sm:p-4 border border-gray-200/70 shadow-inner">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={1}>
          <BarChart
            data={currentData}
            margin={{ top: 20, right: 20, left: 0, bottom: 25 }}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="category" 
              tick={{ fontSize: 11, fill: '#4B5563', fontWeight: 600 }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={false}
              interval={0}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => activeMetric === 'cost' ? `₹${value}` : `${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(243, 244, 246, 0.7)' }} />
            <Legend 
              verticalAlign="top" 
              align="right"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 700 }}
              formatter={(value) => (
                <span className={value === 'organic' ? 'text-emerald-800' : 'text-indigo-900'}>
                  {value === 'organic' ? t.organicLegend : t.chemicalLegend}
                </span>
              )}
            />
            <Bar 
              dataKey="organic" 
              name="organic"
              fill="#10B981" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={48}
              animationDuration={800}
            />
            <Bar 
              dataKey="chemical" 
              name="chemical"
              fill="#6366F1" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={48}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Micro-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <div className="bg-white p-3 rounded-xl border border-emerald-200/80 shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
            <DollarSign size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-black text-gray-500 block tracking-wider">
              {language === 'hi' ? 'सीजन बचत' : language === 'kn' ? 'ಸೀಸನ್ ಉಳಿತಾಯ' : 'Season Savings'}
            </span>
            <span className="text-xs font-extrabold text-emerald-800 block truncate">
              ₹{seasonSavings > 0 ? seasonSavings.toLocaleString() : 0} (3 Spray Cycles)
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-blue-200/80 shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700 shrink-0">
            <Droplets size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-black text-gray-500 block tracking-wider">
              {language === 'hi' ? 'घोल पानी' : language === 'kn' ? 'ದ್ರಾವಣ ನೀರು' : 'Spray Water Vol.'}
            </span>
            <span className="text-xs font-extrabold text-gray-900 block truncate">
              {waterLiters} Liters ({areaLabel})
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-purple-200/80 shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-700 shrink-0">
            <CheckCircle2 size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-black text-gray-500 block tracking-wider">
              {language === 'hi' ? 'जैविक सुरक्षा स्कोर' : language === 'kn' ? 'ಸಾವಯವ ಸ್ಕೋರ್' : 'Eco-Safety Index'}
            </span>
            <span className="text-xs font-extrabold text-emerald-700 block truncate">
              98 / 100 (Safe for Bees & Soil)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
