import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  CloudRain, 
  Sun, 
  Leaf, 
  Store, 
  Award, 
  ChevronRight, 
  ExternalLink, 
  Phone, 
  Sparkles, 
  Cpu, 
  Clock, 
  Info,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MultiAgentPipelineRibbon } from './MultiAgentPipelineRibbon';

export const AgentStepsDisplay = ({ result = null, isRunning = false, traceSteps = [] }) => {
  const [showTrace, setShowTrace] = useState(true);

  if (isRunning) {
    return (
      <div className="space-y-3 my-4">
        {/* Dynamic Multi-Agent Live Progress Ribbon */}
        <MultiAgentPipelineRibbon isRunning={true} />

        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 text-emerald-100 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-200 text-sm sm:text-base flex items-center gap-2">
                <Cpu size={18} className="text-emerald-400" />
                AgroCare Orchestrator Active
              </h4>
              <p className="text-xs text-emerald-300/80">Gemini 2.0 Flash executing Sentinel & Tool safety gates...</p>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-200/90 bg-emerald-900/30 p-2.5 rounded-xl border border-emerald-700/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Running Sentinel pre-check & risk telemetry...</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-200/90 bg-emerald-900/30 p-2.5 rounded-xl border border-emerald-700/30">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span>Evaluating localized precipitation & spray weather safety gate...</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-200/90 bg-emerald-900/30 p-2.5 rounded-xl border border-emerald-700/30">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Querying ICAR Indigenous Technical Knowledge (ITK) repository...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const {
    status,
    crop,
    issue,
    risk_level,
    confidence,
    evidence,
    reasoning_summary,
    recommended_actions,
    weather_gate,
    itk,
    supplier,
    scheme,
    escalation,
    agent_trace
  } = result;

  const displayTrace = (agent_trace && agent_trace.length > 0) ? agent_trace : traceSteps;

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'high':
        return <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"><AlertTriangle size={12} /> High Risk</span>;
      case 'medium':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"><Info size={12} /> Moderate Risk</span>;
      default:
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"><CheckCircle2 size={12} /> Low Risk</span>;
    }
  };

  return (
    <div className="space-y-4 my-4">
      {/* Real-Time Multi-Agent Live Orchestration Ribbon */}
      <MultiAgentPipelineRibbon 
        currentStepIndex={5}
        agentTrace={displayTrace}
        weatherBlocked={weather_gate?.blocked}
        safetyOverrideReason={weather_gate?.reason}
      />

      {/* Real-time Agent Trace Banner */}
      {displayTrace && displayTrace.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl overflow-hidden shadow-md">
          <button
            type="button"
            onClick={() => setShowTrace(!showTrace)}
            className="w-full px-4 py-3 bg-slate-800/60 hover:bg-slate-800 text-left flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-emerald-400" />
              <span className="text-xs sm:text-sm font-semibold text-slate-200">
                Agentic Execution Trace ({displayTrace.length} Steps Executed)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{showTrace ? 'Hide Trace' : 'View Full Trace'}</span>
              <ChevronDown size={14} className={`transform transition-transform ${showTrace ? 'rotate-180' : ''}`} />
            </div>
          </button>

          <AnimatePresence>
            {showTrace && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 space-y-2 border-t border-slate-800 bg-slate-950/60"
              >
                {displayTrace.map((step, idx) => (
                  <div 
                    key={step.stepId || idx}
                    className="flex items-start gap-2.5 text-xs text-slate-300 p-2 rounded-lg bg-slate-900/50 border border-slate-800"
                  >
                    {step.status === 'blocked' ? (
                      <span className="text-red-400 font-bold shrink-0 mt-0.5">🛑</span>
                    ) : step.status === 'escalated' ? (
                      <span className="text-purple-400 font-bold shrink-0 mt-0.5">⚠️</span>
                    ) : step.status === 'warning' ? (
                      <span className="text-amber-400 font-bold shrink-0 mt-0.5">⚡</span>
                    ) : (
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-200">{step.label}</p>
                      {step.toolName && (
                        <p className="text-[11px] text-slate-400 font-mono">Tool: {step.toolName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Main Action Plan Card */}
      <div className="bg-white dark:bg-slate-900 border border-[#E8EDE6] dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-5 text-slate-800 dark:text-slate-100">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-gray-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-100 dark:bg-emerald-950 text-[#2D6A4F] dark:text-emerald-300 font-bold text-xs px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                AgroCare Action Plan
              </span>
              {getRiskBadge(risk_level)}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#1B4332] dark:text-emerald-200">
              {crop}: {issue}
            </h3>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-500 dark:text-slate-400 block">Confidence Score</span>
            <span className="text-base sm:text-lg font-extrabold text-[#2D6A4F] dark:text-emerald-400">
              {Math.round((confidence > 1 ? confidence : confidence * 100))}%
            </span>
          </div>
        </div>

        {/* Reasoning Summary */}
        {reasoning_summary && (
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 sm:p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
            <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
              <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" />
              Agentic Synthesis & Strategy:
            </p>
            {reasoning_summary}
          </div>
        )}

        {/* Weather Safety Gate Status (Deterministic Check) */}
        {weather_gate && (
          <div className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 ${
            weather_gate.blocked 
              ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40 text-red-900 dark:text-red-200'
              : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-200'
          }`}>
            {weather_gate.blocked ? (
              <CloudRain size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            ) : (
              <Sun size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold flex items-center gap-2">
                Weather Safety Gate: {weather_gate.blocked ? 'Foliar Spray Suspended' : 'Clear Spray Conditions'}
              </p>
              <p className="mt-0.5">{weather_gate.reason}</p>
              {weather_gate.recommended_window && (
                <p className="mt-1 font-semibold text-[11px] sm:text-xs">
                  Recommended Safe Window: {weather_gate.recommended_window}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Human Expert Escalation Banner */}
        {escalation && escalation.required && (
          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 p-4 rounded-2xl text-purple-900 dark:text-purple-200 text-xs sm:text-sm space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-800 dark:text-purple-300">
              <UserCheck size={18} className="text-purple-600 dark:text-purple-400" />
              <span>KVK Agronomist Escalation Triggered</span>
              {escalation.ticketId && (
                <span className="font-mono text-[10px] bg-purple-200/60 dark:bg-purple-900/60 px-2 py-0.5 rounded ml-auto">
                  {escalation.ticketId}
                </span>
              )}
            </div>
            <p>{escalation.reason || 'Diagnostic confidence requires expert agronomist validation to prevent crop loss.'}</p>
            {escalation.questions_for_expert && escalation.questions_for_expert.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-purple-800/90 dark:text-purple-300/90 text-xs pl-1">
                {escalation.questions_for_expert.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Recommended Actions Steps */}
        {recommended_actions && recommended_actions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Clock size={16} className="text-[#2D6A4F]" />
              Sequential Field Action Steps
            </h4>

            <div className="space-y-2.5">
              {recommended_actions.map((act) => (
                <div 
                  key={act.step}
                  className="bg-gray-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 flex items-start gap-3 text-xs sm:text-sm"
                >
                  <span className="w-6 h-6 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {act.step}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-gray-900 dark:text-slate-100">{act.action}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                        act.type === 'itk' 
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : act.type === 'chemical'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}>
                        {act.type}
                      </span>
                    </div>
                    {act.timing && (
                      <p className="text-gray-500 dark:text-slate-400 text-xs">
                        <strong className="text-gray-700 dark:text-slate-300">Timing:</strong> {act.timing}
                      </p>
                    )}
                    {act.notes && (
                      <p className="text-gray-600 dark:text-slate-300 text-xs mt-0.5">{act.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ICAR ITK Practices */}
        {itk && itk.length > 0 && (
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/30 space-y-2">
            <h4 className="font-bold text-xs sm:text-sm text-[#1B4332] dark:text-emerald-300 flex items-center gap-1.5">
              <Leaf size={16} className="text-emerald-600" />
              ICAR Indigenous Technical Knowledge (ITK) Validated Remedy
            </h4>
            {itk.map((item, idx) => (
              <div key={idx} className="text-xs sm:text-sm space-y-1">
                <p className="font-bold text-emerald-950 dark:text-emerald-200">{item.practice}</p>
                {item.preparation && (
                  <p className="text-emerald-800 dark:text-emerald-300 text-xs">{item.preparation}</p>
                )}
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Source: {item.source}</p>
              </div>
            ))}
          </div>
        )}

        {/* Input Center & Scheme Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {supplier && (
            <div className="p-3.5 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Store size={14} className="text-[#2D6A4F]" />
                  {supplier.name || 'Nearby Input Dealer'}
                </span>
                {supplier.distance && (
                  <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">{supplier.distance}</span>
                )}
              </div>
              <div className="flex items-center gap-3 pt-1">
                {supplier.mapsUrl && (
                  <a 
                    href={supplier.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#2D6A4F] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Directions</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                {supplier.phone && (
                  <a 
                    href={`tel:${supplier.phone}`}
                    className="text-gray-600 dark:text-slate-300 hover:underline flex items-center gap-1"
                  >
                    <Phone size={12} />
                    <span>Call Shop</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {scheme && (
            <div className="p-3.5 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 text-xs space-y-1.5">
              <span className="font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                <Award size={14} className="text-amber-600" />
                {scheme.name || 'Government Scheme Protection'}
              </span>
              <p className="text-gray-600 dark:text-slate-300 text-xs">{scheme.benefit || 'Eligible for agricultural subsidies & insurance.'}</p>
              {scheme.portal && (
                <a 
                  href={`https://${scheme.portal}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-700 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1 pt-0.5"
                >
                  <span>Portal: {scheme.portal}</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
