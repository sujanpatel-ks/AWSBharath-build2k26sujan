import React from 'react';
import { 
  Sparkles, 
  FlaskConical, 
  Leaf, 
  AlertCircle, 
  Droplets, 
  Info, 
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { NutrientDeficiency } from '../../lib/nutrientDeficiency';
import { Language } from '../../types';

interface DeficiencyCardProps {
  deficiency: NutrientDeficiency;
  language: Language;
  onSaveToCalendar?: (task: any) => void;
}

export const DeficiencyCard: React.FC<DeficiencyCardProps> = ({
  deficiency,
  language,
  onSaveToCalendar
}) => {
  const isHindi = language === 'hi';
  const isKannada = language === 'kn';

  const title = isHindi ? deficiency.nameHi : (isKannada ? deficiency.nameKn : deficiency.nutrient);

  return (
    <div id={`deficiency-card-${deficiency.id}`} className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/20 dark:to-zinc-900 p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-100 dark:border-amber-900/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white font-black text-xl flex items-center justify-center shadow-md">
            {deficiency.symbol}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Nutrient Deficiency ({deficiency.category})
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {title}
            </h3>
          </div>
        </div>

        <div className="text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
          Target leaf zone: <span className="font-semibold capitalize text-zinc-800 dark:text-zinc-200">{deficiency.leafLocation.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Diagnostic Symptom Checklist */}
      <div className="mt-4">
        <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          Key Diagnostic Symptoms
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {deficiency.keySymptoms.map((symptom, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300 bg-white/70 dark:bg-zinc-800/70 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>{symptom}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Diagnostic Tip */}
      <div className="mt-3 p-3 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Field Pathology Marker: </span>
          <span>{deficiency.diagnosticTip}</span>
        </div>
      </div>

      {/* Two Columns: Organic Bio-Fertilizer vs Chemical Fertilizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {/* Organic Option */}
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="p-1 rounded-md bg-emerald-600 text-white">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Recommended Organic Remedy
              </span>
              <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {deficiency.organicRemedy.name}
              </h5>
            </div>
          </div>

          <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">Dosage: </span>
              <span>{deficiency.organicRemedy.dosage}</span>
            </div>
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">Application: </span>
              <span>{deficiency.organicRemedy.method}</span>
            </div>
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">Timing: </span>
              <span>{deficiency.organicRemedy.timing}</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 pt-1.5 border-t border-emerald-200/60 dark:border-emerald-900/50">
              💡 {deficiency.organicRemedy.preparationNotes}
            </p>
          </div>
        </div>

        {/* Chemical / Synthetic Fertilizer Option */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="p-1 rounded-md bg-blue-600 text-white">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Targeted Chemical Fertilizer
              </span>
              <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {deficiency.chemicalRemedy.name}
              </h5>
            </div>
          </div>

          <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">Dosage: </span>
              <span>{deficiency.chemicalRemedy.dosage}</span>
            </div>
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">Application: </span>
              <span>{deficiency.chemicalRemedy.method}</span>
            </div>
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">Timing: </span>
              <span>{deficiency.chemicalRemedy.timing}</span>
            </div>
            <p className="text-[11px] text-blue-800 dark:text-blue-300/90 pt-1.5 border-t border-blue-200/60 dark:border-blue-900/50">
              ⚠️ {deficiency.chemicalRemedy.safetyNotes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
