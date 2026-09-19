import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, 
  CloudSun, 
  GitPullRequest, 
  ShieldCheck, 
  Truck, 
  Check, 
  Clock, 
  AlertCircle,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';

export type AgentStepId = 'sentinel' | 'context' | 'planner' | 'safety' | 'executor';

export interface AgentStepMeta {
  id: AgentStepId;
  label: string;
  role: string;
  model: string;
  icon: React.ComponentType<{ size: number; className?: string; strokeWidth?: number }>;
  defaultDetail: string;
  defaultLatency: number;
}

export const AGENT_STEPS: AgentStepMeta[] = [
  { 
    id: 'sentinel', 
    label: 'Vision', 
    role: 'Sentinel Vision Agent', 
    model: 'Gemini 2.0 Flash Vision', 
    icon: Eye, 
    defaultDetail: 'Audited foliage pathology, verified leaf chlorophyll and lesion margins.',
    defaultLatency: 280
  },
  { 
    id: 'context', 
    label: 'Weather', 
    role: 'Context Intelligence', 
    model: 'Open-Meteo & Microclimate Telemetry', 
    icon: CloudSun, 
    defaultDetail: 'Queried localized precipitation risk, wind velocity, and humidity limits.',
    defaultLatency: 140
  },
  { 
    id: 'planner', 
    label: 'ICAR ITK', 
    role: 'Planner Agent', 
    model: 'ICAR Knowledge Repository', 
    icon: GitPullRequest, 
    defaultDetail: 'Retrieved certified indigenous technical knowledge & bio-fungicide ratios.',
    defaultLatency: 320
  },
  { 
    id: 'safety', 
    label: 'Safety Gate', 
    role: 'Deterministic Safety Layer', 
    model: 'CIBRC Safety Rules Engine', 
    icon: ShieldCheck, 
    defaultDetail: 'Enforced spray withholding period & non-action weather hold check.',
    defaultLatency: 85
  },
  { 
    id: 'executor', 
    label: 'Suppliers', 
    role: 'Executor & Licensing GeoAdapter', 
    model: 'APMC & Licensed Dealer Directory', 
    icon: Truck, 
    defaultDetail: 'Matched nearest licensed input dealers and eligible central/state subsidies.',
    defaultLatency: 190
  },
];

interface MultiAgentPipelineRibbonProps {
  currentStepIndex?: number; // 0 to 4 while in progress, 5 for completed
  isRunning?: boolean;
  agentTrace?: Array<{
    stepId?: string;
    label?: string;
    status?: string;
    toolName?: string;
    latencyMs?: number;
  }>;
  weatherBlocked?: boolean;
  safetyOverrideReason?: string;
  onSelectStep?: (stepId: AgentStepId) => void;
  className?: string;
}

export const MultiAgentPipelineRibbon: React.FC<MultiAgentPipelineRibbonProps> = ({
  currentStepIndex: controlledStepIndex,
  isRunning = false,
  agentTrace,
  weatherBlocked = false,
  safetyOverrideReason,
  onSelectStep,
  className = ''
}) => {
  // Animated progression when isRunning is active
  const [internalStepIndex, setInternalStepIndex] = useState<number>(5);
  const [activeDetailStep, setActiveDetailStep] = useState<AgentStepMeta | null>(null);

  useEffect(() => {
    if (isRunning) {
      setInternalStepIndex(0);
      const interval = setInterval(() => {
        setInternalStepIndex(prev => {
          if (prev < 4) return prev + 1;
          return prev;
        });
      }, 700);
      return () => clearInterval(interval);
    } else if (controlledStepIndex !== undefined) {
      setInternalStepIndex(controlledStepIndex);
    } else {
      setInternalStepIndex(5);
    }
  }, [isRunning, controlledStepIndex]);

  const stepIndex = isRunning ? internalStepIndex : (controlledStepIndex ?? 5);
  const isCompleted = stepIndex >= 5;

  // Calculate total latency
  const totalLatencyMs = agentTrace?.reduce((acc, curr) => acc + (curr.latencyMs || 0), 0) || 1015;

  return (
    <div className={`w-full bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-200/90 dark:border-stone-800 shadow-xs select-none transition-all ${className}`}>
      {/* Top Header Bar with Consensus Status & Latency Badge */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#D8F3DC] dark:bg-emerald-950 flex items-center justify-center text-[#003527] dark:text-emerald-300">
            <Sparkles size={15} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 font-['Hanken_Grotesk',sans-serif] leading-tight">
              Multi-Agent Orchestration Pipeline
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Deterministic verification across 5 specialized agronomist agents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isRunning ? (
            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Agent {stepIndex + 1} of 5 Active
            </span>
          ) : isCompleted ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#003527] bg-[#D8F3DC] dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Check size={12} strokeWidth={2.5} />
                Consensus Reached
              </span>
              <span className="hidden sm:flex items-center gap-1 text-[10px] text-stone-400 font-mono">
                <Clock size={11} /> {totalLatencyMs}ms
              </span>
            </div>
          ) : (
            <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
              Step {stepIndex} of 5
            </span>
          )}
        </div>
      </div>

      {/* Progress Ribbon with Connecting Track */}
      <div className="relative pt-2 pb-1 px-2 sm:px-4">
        {/* Background Grey Inactive Track */}
        <div className="absolute top-[26px] left-6 right-6 h-1 bg-stone-100 dark:bg-stone-800 rounded-full -z-0" />

        {/* Dynamic Animated Active Fill Track */}
        <motion.div
          className="absolute top-[26px] left-6 h-1 bg-gradient-to-r from-[#2D6A4F] to-[#52B788] rounded-full -z-0"
          initial={{ width: '0%' }}
          animate={{
            width: isCompleted
              ? 'calc(100% - 48px)'
              : `calc(${Math.min(100, Math.max(0, (stepIndex / 4) * 100))}% - 24px)`
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />

        {/* 5 Step Nodes */}
        <div className="flex items-center justify-between relative z-10">
          {AGENT_STEPS.map((step, idx) => {
            const isDone = isCompleted || stepIndex > idx;
            const isCurrent = isRunning && stepIndex === idx;
            const Icon = step.icon;
            const isSelected = activeDetailStep?.id === step.id;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => {
                  setActiveDetailStep(isSelected ? null : step);
                  onSelectStep?.(step.id);
                }}
              >
                {/* Micro-Spring Circle Indicator */}
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.94 }}
                  animate={{
                    scale: isCurrent ? [1, 1.15, 1] : isSelected ? 1.08 : 1,
                    boxShadow: isCurrent 
                      ? '0 0 16px rgba(82, 183, 136, 0.45)' 
                      : isSelected 
                      ? '0 0 10px rgba(45, 106, 79, 0.3)' 
                      : '0 2px 5px rgba(0,0,0,0.04)'
                  }}
                  transition={{
                    scale: isCurrent ? { repeat: Infinity, duration: 1.3 } : { type: 'spring', stiffness: 450, damping: 25 },
                    duration: 0.25
                  }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isDone
                      ? 'bg-[#003527] border-[#003527] text-white'
                      : isCurrent
                      ? 'bg-white dark:bg-stone-900 border-[#52B788] text-[#2D6A4F] ring-4 ring-[#D8F3DC] dark:ring-emerald-950'
                      : 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 text-stone-400'
                  }`}
                >
                  {isDone ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    >
                      <Check size={16} strokeWidth={2.8} className="text-[#b0f0d6]" />
                    </motion.div>
                  ) : (
                    <Icon size={16} strokeWidth={isCurrent ? 2.4 : 1.8} />
                  )}
                </motion.div>

                {/* Step Label */}
                <span
                  className={`text-[11px] sm:text-xs font-semibold mt-2 tracking-tight transition-colors ${
                    isCurrent
                      ? 'text-[#2D6A4F] dark:text-emerald-400 font-bold'
                      : isDone
                      ? 'text-stone-800 dark:text-stone-200'
                      : 'text-stone-400'
                  }`}
                >
                  {step.label}
                </span>

                {/* Sub-label showing verification status */}
                <span className="hidden sm:block text-[9px] text-stone-400 font-mono mt-0.5">
                  {isDone ? 'verified' : isCurrent ? 'running...' : 'queued'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Gate Alert Banner if Weather/Confidence has blocked foliar spraying */}
      {weatherBlocked && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
          <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold">Safety Gate Intervention: </span>
            <span>
              {safetyOverrideReason || 'Rain runoff risk detected. The safety layer has overriden synthetic spraying and placed a non-action hold.'}
            </span>
          </div>
        </div>
      )}

      {/* Interactive Detail Drawer for Clicked Agent Node */}
      <AnimatePresence>
        {activeDetailStep && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden mt-3 pt-3 border-t border-stone-100 dark:border-stone-800"
          >
            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {activeDetailStep.role}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-mono text-[10px]">
                    {activeDetailStep.model}
                  </span>
                </div>
                <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                  {activeDetailStep.defaultDetail}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className="text-[10px] text-stone-500 font-mono bg-white dark:bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700">
                  Latency: ~{activeDetailStep.defaultLatency}ms
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDetailStep(null)}
                  className="text-stone-400 hover:text-stone-600 text-[11px] px-2 py-1 rounded-md hover:bg-stone-200/50"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiAgentPipelineRibbon;
