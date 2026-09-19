import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Volume2, 
  Pause, 
  Play, 
  Square, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Mic,
  RotateCcw,
  Plus,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Language, Screen } from '../types';
import { speechService } from '../services/speechSynthesisService';
import { VoiceTaskModal } from './VoiceTaskModal';

interface TaskSpeechReminderProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask?: (task: Omit<Task, 'id' | 'completed'>) => void;
  onNavigate: (screen: Screen) => void;
  language: Language;
}

const reminderTranslations = {
  en: {
    urgentTitle: "Urgent Farm Tasks",
    actionRequired: "Action Required",
    actionsRequired: "Actions Required",
    pendingSubtitle: "Urgent field tasks requiring immediate attention",
    speakNow: "Listen",
    speaking: "Reading...",
    paused: "Paused",
    resume: "Resume",
    stop: "Stop",
    replay: "Re-read",
    markDone: "Mark Done",
    viewCalendar: "View Calendar",
    addVoiceNote: "Add Voice Note",
    addVoiceNoteShort: "Voice Note",
    dismiss: "Dismiss",
    autoSpeakPref: "Auto-read urgent tasks on open",
    priority: "Urgent"
  },
  hi: {
    urgentTitle: "ज़रूरी कृषि कार्य",
    actionRequired: "तुरंत ध्यान दें",
    actionsRequired: "तुरंत ध्यान दें",
    pendingSubtitle: "खेत के महत्वपूर्ण कार्य जिन पर तुरंत कार्रवाई जरूरी है",
    speakNow: "सुनें",
    speaking: "पढ़ा जा रहा है...",
    paused: "रोका गया",
    resume: "जारी रखें",
    stop: "बंद करें",
    replay: "दोबारा सुनें",
    markDone: "पूर्ण करें",
    viewCalendar: "कैलेंडर देखें",
    addVoiceNote: "आवाज़ से कार्य जोड़ें",
    addVoiceNoteShort: "वॉइस नोट",
    dismiss: "हटाएं",
    autoSpeakPref: "ऐप खोलने पर स्वतः बोलें",
    priority: "ज़रूरी"
  },
  kn: {
    urgentTitle: "ತುರ್ತು ಕೃಷಿ ಕಾರ್ಯಗಳು",
    actionRequired: "ಗಮನ ಅಗತ್ಯವಿದೆ",
    actionsRequired: "ಗಮನ ಅಗತ್ಯವಿದೆ",
    pendingSubtitle: "ತಕ್ಷಣ ಗಮನಹರಿಸಬೇಕಾದ ಪ್ರಮುಖ ಕೃಷಿ ಕೆಲಸಗಳು",
    speakNow: "ಕೇಳಿ",
    speaking: "ಓದಲಾಗುತ್ತಿದೆ...",
    paused: "ವಿರಾಮ",
    resume: "ಮುಂದುವರಿಸಿ",
    stop: "ನಿಲ್ಲಿಸಿ",
    replay: "ಮತ್ತೆ ಕೇಳಿ",
    markDone: "ಮುಗಿದಿದೆ",
    viewCalendar: "ಕ್ಯಾಲೆಂಡರ್ ನೋಡಿ",
    addVoiceNote: "ಧ್ವನಿ ನೋಟ್ ಸೇರಿಸಿ",
    addVoiceNoteShort: "ಧ್ವನಿ ನೋಟ್",
    dismiss: "ಮುಚ್ಚಿ",
    autoSpeakPref: "ಆ್ಯಪ್ ತೆರೆದಾಗ ಓದಿ",
    priority: "ತುರ್ತು"
  }
};

export const TaskSpeechReminder: React.FC<TaskSpeechReminderProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onNavigate,
  language = 'en'
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('agrocare_auto_speak_tasks');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [hasAttemptedAutoPlay, setHasAttemptedAutoPlay] = useState(false);
  const hasSpokenOnMount = useRef(false);

  const t = reminderTranslations[language] || reminderTranslations.en;

  // Filter urgent pending tasks
  const urgentTasks = useMemo(() => {
    return tasks.filter(task => !task.completed && task.urgent);
  }, [tasks]);

  const hasUrgent = urgentTasks.length > 0;

  const toggleAutoSpeak = () => {
    const next = !autoSpeakEnabled;
    setAutoSpeakEnabled(next);
    try {
      localStorage.setItem('agrocare_auto_speak_tasks', JSON.stringify(next));
    } catch (e) {
      console.warn("Could not save auto-speak preference:", e);
    }
  };

  const handleSpeakUrgentTasks = useCallback((customTasks?: Task[]) => {
    const tasksToSpeak = customTasks || urgentTasks;
    if (tasksToSpeak.length === 0) return;

    const speechText = speechService.formatUrgentTasksSpeechText(tasksToSpeak, language);
    if (!speechText) return;

    speechService.speak(speechText, language, {
      onStart: () => {
        setIsSpeaking(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      },
      onError: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      },
      onPause: () => {
        setIsPaused(true);
      },
      onResume: () => {
        setIsPaused(false);
      }
    });
  }, [urgentTasks, language]);

  const handlePause = () => {
    speechService.pause();
    setIsPaused(true);
  };

  const handleResume = () => {
    speechService.resume();
    setIsPaused(false);
  };

  const handleStop = () => {
    speechService.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleOpenVoiceModal = () => {
    handleStop();
    setIsVoiceModalOpen(true);
  };

  // Initial auto-read if enabled
  useEffect(() => {
    if (hasSpokenOnMount.current) return;
    if (!hasUrgent) return;
    if (!autoSpeakEnabled) return;

    hasSpokenOnMount.current = true;
    setHasAttemptedAutoPlay(true);

    const timer = setTimeout(() => {
      handleSpeakUrgentTasks();
    }, 1200);

    return () => clearTimeout(timer);
  }, [hasUrgent, autoSpeakEnabled, handleSpeakUrgentTasks]);

  // Clean up
  useEffect(() => {
    return () => {
      speechService.cancel();
    };
  }, []);

  // If no urgent tasks or dismissed, show clean minimal empty/action state
  if (!hasUrgent || dismissed) {
    return (
      <>
        <div className="w-full flex items-center justify-between p-3.5 sm:p-4 bg-white rounded-2xl border border-[#bfc9c3]/30 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#003527]/10 text-[#003527] flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-[#191c1d] block">
                {language === 'hi' ? 'सभी ज़रूरी कार्य पूरे हैं!' : language === 'kn' ? 'ಎಲ್ಲಾ ತುರ್ತು ಕಾರ್ಯಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ!' : 'All urgent farm tasks clear'}
              </span>
              <span className="text-[11px] text-[#404944]">
                {language === 'hi' ? 'नया कार्य जोड़ने के लिए वॉइस नोट दबाएं' : language === 'kn' ? 'ಹೊಸ ಕಾರ್ಯ ಸೇರಿಸಲು ಧ್ವನಿ ನೋಟ್ ಬಳಸಿ' : 'Add farm tasks via speech or calendar'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenVoiceModal}
              className="h-8 px-3 rounded-xl bg-[#f3f4f5] hover:bg-[#e7e9ea] text-[#003527] font-bold text-xs flex items-center gap-1.5 border border-[#bfc9c3]/40 transition-colors cursor-pointer"
            >
              <Mic size={13} />
              <span>{t.addVoiceNoteShort}</span>
            </button>
            <button
              onClick={() => onNavigate('calendar')}
              className="h-8 px-3 rounded-xl bg-[#003527] hover:bg-[#064e3b] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CalendarIcon size={13} />
              <span className="hidden sm:inline">{t.viewCalendar}</span>
            </button>
          </div>
        </div>

        {onAddTask && (
          <VoiceTaskModal
            isOpen={isVoiceModalOpen}
            onClose={() => setIsVoiceModalOpen(false)}
            onAddTask={onAddTask}
            language={language}
          />
        )}
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          id="task-speech-reminder-banner"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="w-full"
        >
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#bfc9c3]/40 relative overflow-hidden">
            
            {/* Header: Alert Indicator, Title, Badge, Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#bfc9c3]/25">
              
              {/* Left Title & Status */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <AlertTriangle size={20} className="stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-['Hanken_Grotesk'] text-base sm:text-lg font-bold text-[#191c1d] tracking-tight">
                      {t.urgentTitle}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300/60 flex items-center gap-1">
                      <span>{urgentTasks.length}</span>
                      <span>{urgentTasks.length === 1 ? t.actionRequired : t.actionsRequired}</span>
                    </span>
                    {isSpeaking && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#003527] text-[#b0f0d6] flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#b0f0d6] animate-ping" />
                        <span>{isPaused ? t.paused : t.speaking}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#404944] mt-0.5">
                    {t.pendingSubtitle}
                  </p>
                </div>
              </div>

              {/* Right Action Toolbar */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {/* Voice Read Aloud Controls */}
                <div className="flex items-center bg-[#f3f4f5] rounded-2xl p-1 border border-[#bfc9c3]/30 shadow-2xs">
                  {!isSpeaking ? (
                    <button
                      type="button"
                      onClick={() => handleSpeakUrgentTasks()}
                      className="h-8 px-3 rounded-xl bg-[#003527] hover:bg-[#064e3b] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                      title={t.speakNow}
                    >
                      <Volume2 size={14} className="text-[#b0f0d6]" />
                      <span>{t.speakNow}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={isPaused ? handleResume : handlePause}
                        className="h-8 px-2.5 rounded-xl hover:bg-white text-[#191c1d] transition-colors cursor-pointer"
                        title={isPaused ? t.resume : t.paused}
                      >
                        {isPaused ? <Play size={14} className="fill-current" /> : <Pause size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={handleStop}
                        className="h-8 px-2.5 rounded-xl hover:bg-white text-red-600 transition-colors cursor-pointer"
                        title={t.stop}
                      >
                        <Square size={14} className="fill-current" />
                      </button>
                    </>
                  )}
                  {!isSpeaking && (
                    <button
                      type="button"
                      onClick={() => handleSpeakUrgentTasks()}
                      className="h-8 px-2 rounded-xl hover:bg-white text-[#404944] hover:text-[#191c1d] transition-colors cursor-pointer"
                      title={t.replay}
                    >
                      <RotateCcw size={13} />
                    </button>
                  )}
                </div>

                {/* Add Voice Note */}
                <button
                  type="button"
                  onClick={handleOpenVoiceModal}
                  className="h-9 px-3 rounded-2xl bg-[#f3f4f5] hover:bg-[#e7e9ea] text-[#003527] font-bold text-xs flex items-center gap-1.5 border border-[#bfc9c3]/30 transition-colors cursor-pointer"
                  title={t.addVoiceNote}
                >
                  <Mic size={14} />
                  <span className="hidden md:inline">{t.addVoiceNoteShort}</span>
                </button>

                {/* Collapse / Expand */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-9 h-9 rounded-2xl bg-[#f3f4f5] hover:bg-[#e7e9ea] text-[#404944] flex items-center justify-center border border-[#bfc9c3]/30 transition-colors cursor-pointer"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Dismiss */}
                <button
                  type="button"
                  onClick={() => {
                    handleStop();
                    setDismissed(true);
                  }}
                  className="w-9 h-9 rounded-2xl bg-[#f3f4f5] hover:bg-[#e7e9ea] text-[#404944] hover:text-[#ba1a1a] flex items-center justify-center border border-[#bfc9c3]/30 transition-colors cursor-pointer"
                  aria-label={t.dismiss}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Speaking Waveform strip */}
            {isSpeaking && !isPaused && (
              <div className="flex items-center justify-center gap-1.5 py-2 my-2 bg-[#003527]/5 rounded-xl border border-[#003527]/10">
                <span className="text-[11px] font-bold text-[#003527] mr-2 flex items-center gap-1">
                  <Volume2 size={13} />
                  <span>{t.speaking}</span>
                </span>
                {[30, 70, 100, 50, 85, 40, 75, 45, 90, 60, 30].map((height, idx) => (
                  <motion.div
                    key={idx}
                    animate={{
                      height: [`${height * 0.3}%`, `${height}%`, `${height * 0.2}%`]
                    }}
                    transition={{
                      duration: 0.6 + (idx % 3) * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: idx * 0.05
                    }}
                    className="w-1 bg-[#003527] rounded-full h-4"
                  />
                ))}
              </div>
            )}

            {/* Expandable Task Rows */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3.5 space-y-2.5"
                >
                  {urgentTasks.map((task) => {
                    const taskTitle = language === 'hi' && task.titleHi 
                      ? task.titleHi 
                      : language === 'kn' && task.titleKn 
                        ? task.titleKn 
                        : task.title;

                    return (
                      <div
                        key={task.id}
                        className="bg-[#f8f9fa] hover:bg-[#f3f4f5] rounded-2xl p-3 sm:p-3.5 border border-[#bfc9c3]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-extrabold uppercase tracking-wider shrink-0 mt-0.5">
                            {t.priority}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-sm text-[#191c1d] leading-snug">
                              {taskTitle}
                            </h4>
                            {task.description && (
                              <p className="text-xs text-[#404944] leading-relaxed line-clamp-1 mt-0.5">
                                {task.description}
                              </p>
                            )}
                            {task.dueDate && (
                              <span className="text-[10px] font-medium text-[#404944] mt-1 inline-flex items-center gap-1">
                                <CalendarIcon size={11} className="text-[#003527]" />
                                <span>Due: {task.dueDate}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons aligned right */}
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSpeakUrgentTasks([task])}
                            className="w-8 h-8 rounded-xl bg-white hover:bg-[#e7e9ea] text-[#404944] hover:text-[#003527] flex items-center justify-center border border-[#bfc9c3]/40 transition-colors cursor-pointer shadow-2xs"
                            title="Read this task"
                          >
                            <Volume2 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onToggleTask(task.id);
                              if (urgentTasks.length <= 1) {
                                handleStop();
                              }
                            }}
                            className="h-8 px-3.5 rounded-xl bg-[#003527] hover:bg-[#064e3b] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                          >
                            <CheckCircle2 size={14} className="text-[#b0f0d6]" />
                            <span>{t.markDone}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Panel Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-[#bfc9c3]/20">
                    <label className="flex items-center gap-2 cursor-pointer text-[#404944] select-none text-[11px] font-medium hover:text-[#191c1d]">
                      <input
                        type="checkbox"
                        checked={autoSpeakEnabled}
                        onChange={toggleAutoSpeak}
                        className="w-3.5 h-3.5 accent-[#003527] rounded cursor-pointer"
                      />
                      <span>{t.autoSpeakPref}</span>
                    </label>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleOpenVoiceModal}
                        className="font-bold text-[#003527] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>{t.addVoiceNote}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleStop();
                          onNavigate('calendar');
                        }}
                        className="font-bold text-[#003527] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CalendarIcon size={13} />
                        <span>{t.viewCalendar}</span>
                        <ExternalLink size={11} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      {onAddTask && (
        <VoiceTaskModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onAddTask={onAddTask}
          language={language}
        />
      )}
    </>
  );
};

export default TaskSpeechReminder;
