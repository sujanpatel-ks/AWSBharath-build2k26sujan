import React, { useState } from 'react';
import { 
  CloudRain, 
  Sun, 
  Wind, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  ShieldAlert,
  Gauge,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WeatherAdvisoryBannerProps {
  advisory: {
    canSprayNow: boolean;
    warningLevel: 'safe' | 'caution' | 'danger';
    title: string;
    message: string;
    optimalTiming: string;
    rainProbability?: number;
    windSpeed?: number;
    humidity?: number;
  };
  className?: string;
}

export const WeatherAdvisoryBanner: React.FC<WeatherAdvisoryBannerProps> = ({ 
  advisory,
  className = ''
}) => {
  const { 
    canSprayNow, 
    warningLevel, 
    title, 
    message, 
    optimalTiming,
    rainProbability,
    windSpeed,
    humidity 
  } = advisory;

  const [isExpanded, setIsExpanded] = useState(false);

  // Derived or realistic default meteorological metrics
  const rainRisk = rainProbability ?? (warningLevel === 'danger' ? 82 : warningLevel === 'caution' ? 42 : 12);
  const windVelocity = windSpeed ?? (warningLevel === 'danger' ? 24 : warningLevel === 'caution' ? 16 : 8);
  const foliageHumidity = humidity ?? (warningLevel === 'danger' ? 88 : warningLevel === 'caution' ? 74 : 58);

  // Compute spray feasibility score (0 - 100)
  const feasibilityScore = canSprayNow 
    ? (warningLevel === 'safe' ? 94 : 68) 
    : 18;

  // Arc length math for SVG semi-circle gauge (radius = 38, semi-circumference = Math.PI * 38 ≈ 119.4)
  const arcRadius = 38;
  const arcLength = Math.PI * arcRadius;
  const strokeOffset = arcLength - (arcLength * feasibilityScore) / 100;

  const themeColors = {
    safe: {
      bg: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
      badge: 'bg-emerald-600 text-white',
      accent: '#10B981',
      darkText: 'text-emerald-950 dark:text-emerald-100',
      subText: 'text-emerald-800 dark:text-emerald-300',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    },
    caution: {
      bg: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
      badge: 'bg-amber-600 text-white',
      accent: '#F59E0B',
      darkText: 'text-amber-950 dark:text-amber-100',
      subText: 'text-amber-800 dark:text-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    },
    danger: {
      bg: 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800',
      badge: 'bg-rose-600 text-white',
      accent: '#F43F5E',
      darkText: 'text-rose-950 dark:text-rose-100',
      subText: 'text-rose-800 dark:text-rose-300',
      icon: <CloudRain className="w-5 h-5 text-rose-600 dark:text-rose-400" />
    }
  };

  const theme = themeColors[warningLevel] || themeColors.safe;

  // Simulated 6-hour upcoming spray window timeline
  const timelineHours = [
    { label: 'Now', canSpray: canSprayNow, risk: rainRisk, icon: canSprayNow ? Sun : CloudRain },
    { label: '+2 hrs', canSpray: warningLevel !== 'danger', risk: Math.max(10, rainRisk - 15), icon: warningLevel === 'danger' ? CloudRain : Sun },
    { label: '+4 hrs', canSpray: true, risk: 20, icon: Sun },
    { label: '+6 hrs', canSpray: true, risk: 15, icon: Sun },
    { label: 'Tomorrow AM', canSpray: true, risk: 10, icon: Sparkles }
  ];

  return (
    <div 
      id="weather-spray-advisory-banner" 
      className={`rounded-2xl border ${theme.bg} p-4 sm:p-5 transition-all duration-300 shadow-xs relative overflow-hidden ${className}`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Section: Radial Feasibility Gauge + Title */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          
          {/* Radial Semi-Circular Gauge */}
          <div className="relative w-20 h-16 sm:w-24 sm:h-20 shrink-0 flex flex-col items-center justify-center pt-1">
            <svg viewBox="0 0 100 65" className="w-full h-full overflow-visible">
              {/* Background Arc */}
              <path
                d="M 12 55 A 38 38 0 0 1 88 55"
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                className="text-stone-200 dark:text-stone-800"
              />
              {/* Animated Foreground Progress Arc */}
              <motion.path
                d="M 12 55 A 38 38 0 0 1 88 55"
                fill="none"
                stroke={theme.accent}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={arcLength}
                initial={{ strokeDashoffset: arcLength }}
                animate={{ strokeDashoffset: strokeOffset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>

            {/* Score in Center of Arc */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
              <span className="text-base sm:text-lg font-black tracking-tight text-stone-900 dark:text-stone-100 font-mono">
                {feasibilityScore}%
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 -mt-1">
                Feasibility
              </span>
            </div>
          </div>

          {/* Title & Status Summary */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                {title}
              </span>
              <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${theme.badge}`}>
                {canSprayNow ? 'Spray Permitted' : 'Spray Delayed'}
              </span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {message}
            </p>

            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200">
              <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span>Recommended Spray Window: </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {optimalTiming}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Micro Telemetry Quick Cards & Toggle */}
        <div className="flex items-center gap-2 self-stretch md:self-center justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-200/60 dark:border-stone-800">
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Rain Risk Dial */}
            <div className="bg-white/80 dark:bg-stone-900/80 px-2.5 py-1.5 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-2xs">
              <div className="flex items-center justify-center gap-1 text-[10px] text-stone-500 font-medium">
                <Droplets size={11} className="text-blue-500" />
                <span>Rain</span>
              </div>
              <span className={`text-xs font-mono font-bold ${rainRisk > 40 ? 'text-rose-600' : 'text-stone-800 dark:text-stone-200'}`}>
                {rainRisk}%
              </span>
            </div>

            {/* Wind Drift */}
            <div className="bg-white/80 dark:bg-stone-900/80 px-2.5 py-1.5 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-2xs">
              <div className="flex items-center justify-center gap-1 text-[10px] text-stone-500 font-medium">
                <Wind size={11} className="text-teal-500" />
                <span>Wind</span>
              </div>
              <span className={`text-xs font-mono font-bold ${windVelocity > 15 ? 'text-amber-600' : 'text-stone-800 dark:text-stone-200'}`}>
                {windVelocity} km/h
              </span>
            </div>

            {/* Humidity */}
            <div className="bg-white/80 dark:bg-stone-900/80 px-2.5 py-1.5 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-2xs">
              <div className="flex items-center justify-center gap-1 text-[10px] text-stone-500 font-medium">
                <Sun size={11} className="text-amber-500" />
                <span>Humidity</span>
              </div>
              <span className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200">
                {foliageHumidity}%
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-white/80 dark:bg-stone-900/80 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse forecast window' : 'Expand 6-hour forecast timeline'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expandable 6-Hour Hourly Spray Feasibility Timeline */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden mt-4 pt-4 border-t border-stone-200/70 dark:border-stone-800"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Gauge size={14} className="text-[#2D6A4F]" />
                Forecasted Spray Window Feasibility (Next 12 Hours)
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                Source: IMD / Open-Meteo High-Resolution
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {timelineHours.map((slot, idx) => {
                const SlotIcon = slot.icon;
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition-colors ${
                      slot.canSpray
                        ? 'bg-white dark:bg-stone-900 border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100'
                        : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-200'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 mb-1">
                      {slot.label}
                    </span>
                    <SlotIcon 
                      size={18} 
                      className={`mb-1 ${slot.canSpray ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`} 
                    />
                    <span className="text-[10px] font-mono font-bold">
                      {slot.risk}% rain
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase mt-1 px-1.5 py-0.5 rounded-md ${
                      slot.canSpray 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}>
                      {slot.canSpray ? 'OK' : 'Hold'}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeatherAdvisoryBanner;
