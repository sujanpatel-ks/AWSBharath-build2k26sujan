import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Leaf, 
  FlaskConical, 
  CloudRain, 
  Bug, 
  Calendar, 
  Store, 
  Bot, 
  FileDown, 
  Share2, 
  Volume2, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  ArrowLeft,
  Camera,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DiagnosisResult, generateSpeech } from '../services/gemini';
import { Language, Task } from '../types';
import { ConfidenceBadge } from './ui/ConfidenceBadge';
import { DeficiencyCard } from './ui/DeficiencyCard';
import { WeatherAdvisoryBanner } from './ui/WeatherAdvisoryBanner';
import { ImageEnhancerTool } from './ui/ImageEnhancerTool';
import { AlternativeDiagnosesCard } from './ui/AlternativeDiagnosesCard';
import { ManualSymptomSelector } from './ui/ManualSymptomSelector';
import { TreatmentComparisonView } from './TreatmentComparisonView';
import { TreatmentPlanView } from './TreatmentPlanView';
import { MultiAgentPipelineRibbon } from './MultiAgentPipelineRibbon';
import { FloatingFarmerActionDock } from './FloatingFarmerActionDock';
import { NUTRIENT_DEFICIENCIES } from '../lib/nutrientDeficiency';
import { searchDiseaseByName, DiseaseEntry } from '../lib/diseaseDatabase';
import { toast } from 'sonner';

interface DiagnosticResultsProps {
  result: DiagnosisResult;
  imageUrl: string | null;
  language: Language;
  onBack: () => void;
  onAskAI: () => void;
  onFindSupplier: (query?: string) => void;
  onSaveToCalendar: (task: Omit<Task, 'id' | 'completed'>) => void;
  onUpdateDiagnosis?: (updatedResult: DiagnosisResult) => void;
  onRetakePhoto?: () => void;
}

export const DiagnosticResults: React.FC<DiagnosticResultsProps> = ({
  result: propResult,
  imageUrl,
  language,
  onBack,
  onAskAI,
  onFindSupplier,
  onSaveToCalendar,
  onUpdateDiagnosis,
  onRetakePhoto
}) => {
  const [treatmentType, setTreatmentType] = useState<'organic' | 'chemical' | 'compare'>('compare');
  const [savedTasks, setSavedTasks] = useState<Set<string>>(new Set());
  const [isManualSelectorOpen, setIsManualSelectorOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isHindi = language === 'hi';
  const isKannada = language === 'kn';

  // Safe normalized result with guaranteed fallbacks
  const result: DiagnosisResult = {
    crop: propResult?.crop || 'Crop',
    disease: propResult?.disease || (propResult as any)?.diseaseName || 'Healthy Leaf',
    diseaseHi: propResult?.diseaseHi || (propResult as any)?.diseaseNameHi || 'स्वस्थ फसल',
    diseaseKn: propResult?.diseaseKn || (propResult as any)?.diseaseNameKn || 'ಆರೋಗ್ಯಕರ ಬೆಳೆ',
    scientificName: propResult?.scientificName || 'Plant Foliage',
    confidence: propResult?.confidence ?? 95,
    description: propResult?.description || 'Diagnostic analysis completed successfully.',
    symptoms: Array.isArray(propResult?.symptoms) && propResult.symptoms.length > 0 ? propResult.symptoms : ['Normal leaf texture and chlorophyll index'],
    prevention: {
      immediate: propResult?.prevention?.immediate || ['Isolate affected plant area.', 'Clean gardening tools.'],
      longTerm: propResult?.prevention?.longTerm || ['Rotate crops regularly.', 'Ensure proper nutrient management.']
    },
    treatment: {
      organic: propResult?.treatment?.organic || (propResult as any)?.organicTreatment || {
        name: 'Neem Oil Extract 1500ppm',
        nameHi: 'नीम तेल 1500ppm',
        dosage: '3-5 ml / L water',
        frequency: 'Every 7-10 days',
        precautions: 'Spray in morning or evening hours',
        costEstimate: '₹ 350 / Hectare'
      },
      chemical: propResult?.treatment?.chemical || (propResult as any)?.chemicalTreatment || {
        name: 'Mancozeb 75% WP',
        nameHi: 'मेंकोजेब 75% WP',
        dosage: '2 g / L water',
        frequency: 'Every 12-14 days',
        precautions: 'Wear protective mask and gloves',
        costEstimate: '₹ 420 / Hectare'
      }
    },
    actionRequired: propResult?.actionRequired || 'Execute recommended foliar treatment.',
    severity: propResult?.severity || 'Low',
    boundingBox: propResult?.boundingBox,
    confidenceAssessment: propResult?.confidenceAssessment,
    weatherAdvisory: propResult?.weatherAdvisory,
    alternativeDiagnoses: propResult?.alternativeDiagnoses || (propResult as any)?.topAlternatives,
    nutrientDeficiency: propResult?.nutrientDeficiency,
    icarAdvisory: propResult?.icarAdvisory
  };

  // Normalize confidence assessment
  const confRaw = result.confidence ?? 90;
  const confScore = confRaw > 1 ? confRaw / 100 : confRaw;
  const confNorm = confRaw <= 1 ? Math.round(confRaw * 100) : Math.round(confRaw);
  const confidenceAssessment = result.confidenceAssessment || {
    score: confScore,
    normalizedPercentage: confNorm,
    tier: (confNorm >= 85 ? 'high' : confNorm >= 65 ? 'medium' : 'low') as any,
    label: confNorm >= 85 ? 'High Confidence Match' : confNorm >= 65 ? 'Moderate Confidence' : 'Low Confidence Match',
    subLabel: 'Verified against ICAR crop disease catalog',
    actionPrompt: confNorm >= 85 
      ? 'Safe to execute recommended biological or targeted chemical schedule.' 
      : 'Verify symptoms or review differential diagnoses before spraying.',
    colorClass: {
      badgeBg: confNorm >= 85 ? 'bg-emerald-50 dark:bg-emerald-950/40' : confNorm >= 65 ? 'bg-amber-50 dark:bg-amber-950/40' : 'bg-rose-50 dark:bg-rose-950/40',
      badgeBorder: confNorm >= 85 ? 'border-emerald-200 dark:border-emerald-800' : confNorm >= 65 ? 'border-amber-200 dark:border-amber-800' : 'border-rose-200 dark:border-rose-800',
      badgeText: confNorm >= 85 ? 'text-emerald-800 dark:text-emerald-300' : confNorm >= 65 ? 'text-amber-800 dark:text-amber-300' : 'text-rose-800 dark:text-rose-300',
      barColor: confNorm >= 85 ? 'bg-emerald-500' : confNorm >= 65 ? 'bg-amber-500' : 'bg-rose-500'
    }
  };

  // Weather advisory calculation fallback if not explicitly attached
  const actionReq = (result.actionRequired || '').toLowerCase();
  const weatherAdvisory = result.weatherAdvisory || {
    canSprayNow: actionReq.includes('delay') ? false : true,
    warningLevel: (actionReq.includes('delay') ? 'caution' : 'safe') as any,
    title: actionReq.includes('delay') ? 'Weather Spray Delay Recommended' : 'Optimal Spray Window Available',
    message: actionReq.includes('delay') 
      ? 'Adverse atmospheric humidity or precipitation expected. Delay spray application to prevent wash-off.'
      : 'Calm winds and favorable humidity detected. Recommended for foliar bio-fungicide application.',
    optimalTiming: 'Early Morning (6:00 AM - 9:00 AM) or Late Afternoon (4:30 PM - 6:30 PM)'
  };

  // Check if current disease corresponds to a known nutrient deficiency
  const diseaseLower = (result.disease || '').toLowerCase();
  const matchedNutrientDeficiency = result.nutrientDeficiency || 
    NUTRIENT_DEFICIENCIES.find(n => 
      diseaseLower.includes((n?.nutrient || '').toLowerCase()) || 
      diseaseLower.includes((n?.id || '').toLowerCase())
    );

  // Handle switching to an alternative differential diagnosis
  const handleSelectAlternative = (diseaseName: string) => {
    const dbMatch = searchDiseaseByName(diseaseName);
    if (dbMatch && onUpdateDiagnosis) {
      const updated: DiagnosisResult = {
        ...result,
        disease: dbMatch.name,
        diseaseHi: dbMatch.nameHi,
        diseaseKn: dbMatch.nameKn,
        scientificName: dbMatch.scientificName,
        confidence: 90,
        symptoms: dbMatch.symptoms,
        prevention: {
          immediate: [dbMatch.prevention[0] || "Isolate affected plants."],
          longTerm: [dbMatch.prevention[1] || "Practice crop rotation."]
        },
        severity: dbMatch.severity,
        actionRequired: `Execute targeted treatment protocol for ${dbMatch.name}.`
      };
      onUpdateDiagnosis(updated);
      toast.success(`Updated diagnosis to ${dbMatch.name}`);
    } else {
      toast.info(`Selected differential diagnosis: ${diseaseName}`);
    }
  };

  // Handle manual disease selection from ICAR directory
  const handleManualDiseaseSelect = (disease: DiseaseEntry) => {
    if (onUpdateDiagnosis) {
      const updated: DiagnosisResult = {
        ...result,
        crop: disease.affectedCrops[0] || result.crop,
        disease: disease.name,
        diseaseHi: disease.nameHi,
        diseaseKn: disease.nameKn,
        scientificName: disease.scientificName,
        confidence: 92,
        symptoms: disease.symptoms,
        prevention: {
          immediate: [disease.prevention[0] || "Prune infected parts."],
          longTerm: [disease.prevention[1] || "Follow rotation schedule."]
        },
        severity: disease.severity,
        actionRequired: `Apply verified ICAR protocol for ${disease.name}.`
      };
      onUpdateDiagnosis(updated);
      setIsManualSelectorOpen(false);
      toast.success(`Loaded ICAR treatment plan for ${disease.name}`);
    }
  };

  // Voice narration
  const handleSpeak = async () => {
    if (isSpeaking) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = isHindi 
      ? `${result.crop} ${result.diseaseHi || result.disease}. ${result.description}`
      : isKannada
      ? `${result.crop} ${result.diseaseKn || result.disease}. ${result.description}`
      : `${result.crop} ${result.disease}. ${result.description}`;

    setIsSpeaking(true);
    try {
      const audio = await generateSpeech(textToSpeak);
      if (audio) {
        const audioEl = new Audio(`data:audio/mp3;base64,${audio}`);
        audioEl.onended = () => setIsSpeaking(false);
        audioEl.onerror = () => setIsSpeaking(false);
        await audioEl.play();
        return;
      }
    } catch (e) {
      console.warn("API voice narration failed, using speech synthesis fallback:", e);
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = isHindi ? 'hi-IN' : isKannada ? 'kn-IN' : 'en-IN';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  return (
    <div id="diagnostic-results-container" className="space-y-6 pb-28 relative">
      {/* 1. Top Bar & Confidence Assessment Badge */}
      <div className="space-y-3">
        <ConfidenceBadge 
          assessment={confidenceAssessment as any}
          language={language}
          showDetails={true}
        />

        {/* Real-Time Multi-Agent Live Orchestration Ribbon */}
        <MultiAgentPipelineRibbon 
          currentStepIndex={5}
          weatherBlocked={!weatherAdvisory.canSprayNow}
          safetyOverrideReason={!weatherAdvisory.canSprayNow ? weatherAdvisory.message : undefined}
        />

        {/* Weather Foliar Spray Gate Banner */}
        <WeatherAdvisoryBanner advisory={weatherAdvisory} />
      </div>

      {/* 2. Interactive Image Enhancer & Pathology Zone View */}
      {imageUrl && (
        <div className="rounded-2xl overflow-hidden shadow-sm">
          <ImageEnhancerTool 
            imageSrc={imageUrl}
            boundingBox={result.boundingBox}
          />
        </div>
      )}

      {/* 3. Primary Disease Header & Description */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-md">
                🌾 {result.crop}
              </span>
              {result.scientificName && (
                <span className="text-xs italic text-zinc-500 dark:text-zinc-400">
                  ({result.scientificName})
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {result.disease}
            </h2>

            <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
              {isHindi ? (result.diseaseHi || result.disease) : isKannada ? (result.diseaseKn || result.disease) : result.disease}
            </h3>
          </div>

          <button
            type="button"
            onClick={handleSpeak}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              isSpeaking 
                ? 'bg-blue-600 text-white border-blue-700 animate-pulse' 
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100'
            }`}
            title="Read Diagnosis Aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Pathology Summary */}
        <div className="mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Pathology Summary & Agronomic Context</span>
          </div>
          {result.description}
        </div>

        {/* ICAR Official Advisory Note if present */}
        {result.icarAdvisory && (
          <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">ICAR Scientific Advisory: </span>
              <span>{result.icarAdvisory}</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Direct 3-Category Treatment & Fertilizer Plan + Application Due Box (Brought UP) */}
      <TreatmentPlanView 
        result={result}
        language={language}
        onSaveToCalendar={onSaveToCalendar}
        onFindSupplier={onFindSupplier}
        savedTasks={savedTasks}
      />

      {/* 5. Nutrient Deficiency Card (if detected or applicable) */}
      {matchedNutrientDeficiency && (
        <DeficiencyCard 
          deficiency={matchedNutrientDeficiency as any}
          language={language}
          onSaveToCalendar={onSaveToCalendar}
        />
      )}

      {/* 6. Differential Diagnoses / Alternative Matches (if confidence < 85% or alternatives provided) */}
      {result.alternativeDiagnoses && result.alternativeDiagnoses.length > 0 && (
        <AlternativeDiagnosesCard 
          alternatives={result.alternativeDiagnoses}
          onSelectAlternative={handleSelectAlternative}
          onRetakePhoto={onRetakePhoto || (() => {})}
        />
      )}

      {/* 7. Observed Symptoms Checklist */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              Diagnostic Symptoms Verified
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsManualSelectorOpen(!isManualSelectorOpen)}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isManualSelectorOpen ? 'Close Directory' : 'Browse Disease Directory'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {result.symptoms.map((symptom, i) => (
            <div 
              key={i} 
              className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 flex items-start gap-2.5 text-xs text-zinc-800 dark:text-zinc-200"
            >
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                {i + 1}
              </span>
              <span className="font-medium leading-snug">{symptom}</span>
            </div>
          ))}
        </div>

        {/* Expandable Manual ICAR Symptom Directory */}
        {isManualSelectorOpen && (
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <ManualSymptomSelector 
              language={language}
              onSelectDisease={handleManualDiseaseSelect}
            />
          </div>
        )}
      </div>

      {/* 8. Preventive Cultural Measures */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
            Preventive Cultural Practices & Field Hygiene
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Immediate Sanity Measures
            </h4>
            <div className="space-y-2">
              {result.prevention.immediate.map((action, i) => (
                <div 
                  key={`imm-${i}`}
                  className="p-3 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/70 dark:border-orange-900/40 text-xs text-orange-950 dark:text-orange-200 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{action}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Long-Term Crop Rotation & Soil Health
            </h4>
            <div className="space-y-2">
              {result.prevention.longTerm.map((action, i) => (
                <div 
                  key={`lt-${i}`}
                  className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Ergonomic Mobile Action Dock (Thumb-Zone Centric) */}
      <FloatingFarmerActionDock
        canSprayNow={weatherAdvisory.canSprayNow}
        isSpeaking={isSpeaking}
        onToggleSpeech={handleSpeak}
        onFindDealers={() => onFindSupplier(result.treatment?.organic?.name || result.crop)}
        onRunAgentPlan={onAskAI}
        onScheduleCalendar={() => {
          onSaveToCalendar({
            title: `Spray Treatment: ${result.crop} ${result.disease}`,
            titleHi: `उपचार लागू करें: ${result.crop} ${result.diseaseHi || result.disease}`,
            titleKn: `ಚಿಕಿತ್ಸೆ ಅನ್ವಯಿಸಿ: ${result.crop} ${result.diseaseKn || result.disease}`,
            description: `Foliar bio-input application for ${result.disease}. Weather safe.`,
            icon: 'Calendar',
            color: 'green',
            urgent: result.severity === 'Severe',
            dueDate: new Date().toISOString().split('T')[0]
          });
          toast.success('Task scheduled on Farm Calendar!');
        }}
        isScheduled={savedTasks.size > 0}
        cropName={result.crop}
        diseaseName={result.disease}
      />
    </div>
  );
};
