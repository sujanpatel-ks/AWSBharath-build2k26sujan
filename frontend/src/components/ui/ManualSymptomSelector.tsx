import React, { useState } from 'react';
import { Search, ChevronDown, Check, BookOpen, AlertCircle } from 'lucide-react';
import { DISEASE_DATABASE, DiseaseEntry } from '../../lib/diseaseDatabase';
import { Language } from '../../types';

interface ManualSymptomSelectorProps {
  language: Language;
  onSelectDisease: (disease: DiseaseEntry) => void;
}

export const ManualSymptomSelector: React.FC<ManualSymptomSelectorProps> = ({
  language,
  onSelectDisease
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('all');

  const allCrops = Array.from(
    new Set(DISEASE_DATABASE.flatMap(d => d.affectedCrops))
  ).sort();

  const filteredDiseases = DISEASE_DATABASE.filter(d => {
    const matchesCrop = selectedCrop === 'all' || d.affectedCrops.includes(selectedCrop);
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCrop;

    const matchesName = 
      d.name.toLowerCase().includes(q) ||
      d.scientificName.toLowerCase().includes(q) ||
      d.nameHi.toLowerCase().includes(q) ||
      d.symptoms.some(s => s.toLowerCase().includes(q));

    return matchesCrop && matchesName;
  });

  return (
    <div id="manual-symptom-selector" className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
      <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="p-2 rounded-lg bg-emerald-600 text-white">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Manual Symptom & Disease Directory (ICAR Certified)
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Select your crop and observed symptoms to load verified treatment plans:
          </p>
        </div>
      </div>

      {/* Search and Crop Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symptoms (e.g., target rings, yellow veins, rust, borers)..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Crops ({allCrops.length})</option>
          {allCrops.map(crop => (
            <option key={crop} value={crop}>{crop}</option>
          ))}
        </select>
      </div>

      {/* Disease List */}
      <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {filteredDiseases.map((disease) => {
          const title = language === 'hi' ? disease.nameHi : (language === 'kn' ? disease.nameKn : disease.name);

          return (
            <div
              key={disease.id}
              onClick={() => onSelectDisease(disease)}
              className="pt-2 pb-2 px-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors flex items-start justify-between gap-3 group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {title}
                  </span>
                  <span className="text-[11px] italic text-zinc-400 hidden sm:inline">
                    ({disease.scientificName})
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {disease.affectedCrops.join(', ')}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                  {disease.symptoms.join(' • ')}
                </p>
              </div>

              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 group-hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 group-hover:text-white text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-colors shrink-0 mt-0.5"
              >
                Apply Plan
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
