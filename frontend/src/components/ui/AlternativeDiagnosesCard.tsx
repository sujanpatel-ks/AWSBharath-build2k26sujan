import React from 'react';
import { HelpCircle, ArrowRight, Camera, Check } from 'lucide-react';
import { searchDiseaseByName } from '../../lib/diseaseDatabase';

interface AlternativeDiagnosesCardProps {
  alternatives: Array<{
    diseaseName: string;
    probability: number;
    keyDistinction: string;
  }>;
  onSelectAlternative: (diseaseName: string) => void;
  onRetakePhoto: () => void;
}

export const AlternativeDiagnosesCard: React.FC<AlternativeDiagnosesCardProps> = ({
  alternatives,
  onSelectAlternative,
  onRetakePhoto
}) => {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div id="alternative-diagnoses-card" className="rounded-2xl border border-orange-200 dark:border-orange-900/60 bg-gradient-to-b from-orange-50/60 to-white dark:from-orange-950/20 dark:to-zinc-900 p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-orange-100 dark:border-orange-900/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-orange-500 text-white">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Differential Diagnosis & Top Alternatives
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Visual symptoms share traits with multiple conditions. Confirm your field observation:
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRetakePhoto}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-xs font-semibold border border-orange-300 dark:border-orange-700 flex items-center gap-1.5 transition-colors"
        >
          <Camera className="w-3.5 h-3.5" />
          Retake Photo
        </button>
      </div>

      <div className="mt-3 space-y-2.5">
        {alternatives.map((alt, idx) => {
          const probPercent = Math.round(alt.probability * 100);
          const dbEntry = searchDiseaseByName(alt.diseaseName);

          return (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-orange-400 dark:hover:border-orange-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {alt.diseaseName}
                  </span>
                  {dbEntry?.scientificName && (
                    <span className="text-xs italic text-zinc-500">
                      ({dbEntry.scientificName})
                    </span>
                  )}
                  <span className="px-2 py-0.5 text-[11px] font-extrabold rounded-full bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200 ml-auto sm:ml-0">
                    {probPercent}% Match
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  🔍 <span className="font-semibold">Diagnostic Marker: </span>{alt.keyDistinction}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelectAlternative(alt.diseaseName)}
                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 self-end sm:self-center transition-colors shrink-0"
              >
                <span>Select & Update Plan</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
