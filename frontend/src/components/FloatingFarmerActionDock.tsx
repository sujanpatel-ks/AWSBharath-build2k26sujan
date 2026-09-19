import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  Store, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  ChevronUp, 
  ChevronDown,
  Cpu,
  Share2,
  Check
} from 'lucide-react';

interface FloatingFarmerActionDockProps {
  canSprayNow?: boolean;
  isSpeaking?: boolean;
  onToggleSpeech?: () => void;
  onFindDealers?: () => void;
  onRunAgentPlan?: () => void;
  isAgentRunning?: boolean;
  onScheduleCalendar?: () => void;
  isScheduled?: boolean;
  cropName?: string;
  diseaseName?: string;
  className?: string;
}

export const FloatingFarmerActionDock: React.FC<FloatingFarmerActionDockProps> = ({
  canSprayNow = true,
  isSpeaking = false,
  onToggleSpeech,
  onFindDealers,
  onRunAgentPlan,
  isAgentRunning = false,
  onScheduleCalendar,
  isScheduled = false,
  cropName,
  diseaseName,
  className = ''
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className={`fixed bottom-4 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none flex justify-center ${className}`}>
      <motion.div
        layout
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="pointer-events-auto max-w-lg w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2 sm:p-2.5 flex flex-col gap-2 transition-all"
      >
        {/* Top Mini Header / Status Pill & Collapse Toggle */}
        <div className="flex items-center justify-between px-2 pt-0.5">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              canSprayNow 
                ? 'bg-[#D8F3DC] text-[#003527] dark:bg-emerald-950 dark:text-emerald-300' 
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}>
              {canSprayNow ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
              {canSprayNow ? 'Spray Permitted' : 'Weather Hold'}
            </span>

            {cropName && diseaseName && (
              <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 truncate max-w-[200px] hidden xs:inline">
                {cropName} • {diseaseName}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-md text-[11px] flex items-center gap-0.5"
            title={isMinimized ? 'Expand Quick Action Dock' : 'Minimize Action Dock'}
          >
            {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Primary Action Buttons (Thumb Reachable) */}
        {!isMinimized && (
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {/* 1. Voice Narration */}
            <button
              type="button"
              onClick={onToggleSpeech}
              className={`h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all border cursor-pointer active:scale-95 ${
                isSpeaking
                  ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300'
                  : 'bg-stone-50 hover:bg-blue-50 text-stone-700 dark:text-stone-200 dark:bg-stone-800 border-stone-200 dark:border-stone-700'
              }`}
              title="Listen to Diagnosis Audio"
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} className="text-blue-600 dark:text-blue-400" />}
              <span>{isSpeaking ? 'Pause' : 'Audio'}</span>
            </button>

            {/* 2. Find Licensed Input Dealers */}
            <button
              type="button"
              onClick={onFindDealers}
              className="h-11 rounded-xl bg-stone-50 hover:bg-emerald-50 text-stone-700 dark:text-stone-200 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all cursor-pointer active:scale-95"
              title="Locate Nearby Verified Dealers"
            >
              <Store size={16} className="text-[#2D6A4F] dark:text-emerald-400" />
              <span>Dealers</span>
            </button>

            {/* 3. Schedule Calendar */}
            <button
              type="button"
              onClick={onScheduleCalendar}
              disabled={isScheduled}
              className={`h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all border cursor-pointer active:scale-95 ${
                isScheduled
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 opacity-80'
                  : 'bg-stone-50 hover:bg-emerald-50 text-stone-700 dark:text-stone-200 dark:bg-stone-800 border-stone-200 dark:border-stone-700'
              }`}
              title="Add Task to Farm Calendar"
            >
              {isScheduled ? <Check size={16} className="text-emerald-700" /> : <Calendar size={16} className="text-amber-600 dark:text-amber-400" />}
              <span>{isScheduled ? 'Saved' : 'Calendar'}</span>
            </button>

            {/* 4. Multi-Agent Autonomous Plan CTA */}
            <button
              type="button"
              onClick={onRunAgentPlan}
              disabled={isAgentRunning}
              className="h-11 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white border border-[#2D6A4F] flex flex-col items-center justify-center gap-0.5 text-[10px] font-black transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
              title="Orchestrate 5-Agent Verified Plan"
            >
              <Cpu size={16} className={isAgentRunning ? 'animate-spin' : ''} />
              <span>{isAgentRunning ? 'Running' : 'AI Plan'}</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FloatingFarmerActionDock;
