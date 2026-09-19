import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { ConfidenceAssessment } from '../../lib/confidenceHandler';
import { Language } from '../../types';

interface ConfidenceBadgeProps {
  assessment: ConfidenceAssessment;
  language: Language;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  assessment,
  language,
  size = 'md',
  showDetails = true
}) => {
  const { normalizedPercentage, tier, colorClass, label, subLabel, actionPrompt } = assessment;

  const getTierIcon = () => {
    switch (tier) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'high':
        return <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'low':
        return <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'uncertain':
      default:
        return <HelpCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
    }
  };

  const getTranslatedTierLabel = () => {
    if (language === 'hi') {
      if (tier === 'healthy') return `स्वस्थ फसल (${normalizedPercentage}%)`;
      if (tier === 'high') return `उच्च विश्वसनीयता (${normalizedPercentage}%)`;
      if (tier === 'medium') return `मध्यम विश्वसनीयता (${normalizedPercentage}%)`;
      if (tier === 'low') return `कम विश्वसनीयता (${normalizedPercentage}%)`;
      return `पुनः फोटो लें / अपर्याप्त (<60%)`;
    }
    if (language === 'kn') {
      if (tier === 'healthy') return `ಆರೋಗ್ಯಕರ ಬೆಳೆ (${normalizedPercentage}%)`;
      if (tier === 'high') return `ಉನ್ನತ ವಿಶ್ವಾಸಾರ್ಹತೆ (${normalizedPercentage}%)`;
      if (tier === 'medium') return `ಮಧ್ಯಮ ವಿಶ್ವಾಸಾರ್ಹತೆ (${normalizedPercentage}%)`;
      if (tier === 'low') return `ಕಡಿಮೆ ವಿಶ್ವಾಸಾರ್ಹತೆ (${normalizedPercentage}%)`;
      return `ಮತ್ತೆ ಫೋಟೋ ತೆಗೆಯಿರಿ (<60%)`;
    }
    return `${label} (${normalizedPercentage}%)`;
  };

  return (
    <div id="confidence-badge-root" className={`rounded-xl border p-3 sm:p-4 ${colorClass.badgeBg} ${colorClass.badgeBorder} transition-all duration-200 shadow-sm`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/80 dark:bg-zinc-900/80 shadow-xs">
            {getTierIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-sm sm:text-base ${colorClass.badgeText}`}>
                {getTranslatedTierLabel()}
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-white/90 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                ICAR Verified
              </span>
            </div>
            {showDetails && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-1">
                {subLabel}
              </p>
            )}
          </div>
        </div>

        {/* Circular / Bar meter */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className={`text-lg sm:text-xl font-extrabold ${colorClass.badgeText}`}>
              {normalizedPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Confidence progress bar */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full mt-2.5 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${colorClass.barColor}`}
          style={{ width: `${normalizedPercentage}%` }}
        />
      </div>

      {showDetails && (
        <div className="mt-2.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 shrink-0">Agronomic Protocol:</span>
          <span>{actionPrompt}</span>
        </div>
      )}
    </div>
  );
};
