import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  X, 
  Sparkles, 
  AlertTriangle, 
  Droplets, 
  Bug, 
  Sprout, 
  ShieldCheck, 
  Calendar as CalendarIcon,
  Loader2,
  Volume2,
  Edit3,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Language } from '../types';
import { speechService } from '../services/speechSynthesisService';

interface VoiceTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  language: Language;
}

export const VoiceTaskModal: React.FC<VoiceTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  language = 'en'
}) => {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'processing' | 'preview'>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Summarized task candidate
  const [summarizedTask, setSummarizedTask] = useState<{
    title: string;
    titleHi: string;
    titleKn: string;
    description: string;
    icon: string;
    color: string;
    urgent: boolean;
    transcript: string;
  } | null>(null);

  const [editableTitle, setEditableTitle] = useState('');
  const [editableDescription, setEditableDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('Sprout');
  const [selectedColor, setSelectedColor] = useState('green');
  const [activeLanguageView, setActiveLanguageView] = useState<Language>(language);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Translations
  const t = {
    en: {
      modalTitle: "Add Task via Voice Note",
      modalSubtitle: "Speak naturally in English, Hindi, or Kannada. AgroCare AI will organize it into a farm task.",
      startRecording: "Tap to Start Recording",
      recordingNow: "Recording Voice Note...",
      stopRecording: "Stop & Analyze with AI",
      reRecord: "Re-record",
      playAudio: "Listen",
      pauseAudio: "Pause",
      processingAudio: "Gemini AI is analyzing your voice note...",
      processingSub: "Transcribing audio, detecting crop terms & urgency...",
      reviewTitle: "AI Task Summary",
      transcriptLabel: "Voice Note Transcript:",
      taskTitleLabel: "Task Title",
      taskDescLabel: "Action Details & Notes",
      urgentBadge: "Mark as Urgent / Priority",
      saveTask: "Add to Farm Tasks",
      cancel: "Cancel",
      samplePrompt: "e.g., 'Check sector 2 tomato crop for leaf curl and spray neem oil today'",
      micDenied: "Microphone permission denied. Please allow microphone access in your browser settings.",
      errorFailed: "Could not process audio. Please try speaking clearly or enter details manually."
    },
    hi: {
      modalTitle: "आवाज़ से नया कार्य जोड़ें",
      modalSubtitle: "हिंदी, अंग्रेज़ी या कन्नड़ में बोलें। AgroCare AI इसे कृषि कार्य में बदल देगा।",
      startRecording: "रिकॉर्डिंग शुरू करने के लिए टैप करें",
      recordingNow: "आवाज़ रिकॉर्ड हो रही है...",
      stopRecording: "रोकें और AI से सारांश बनाएं",
      reRecord: "फिर से रिकॉर्ड करें",
      playAudio: "सुनें",
      pauseAudio: "रोकें",
      processingAudio: "Gemini AI आपकी आवाज़ का विश्लेषण कर रहा है...",
      processingSub: "ऑडियो ट्रांसक्राइब और ज़रूरी कार्य पहचान रहा है...",
      reviewTitle: "AI कार्य सारांश",
      transcriptLabel: "बोली गई आवाज़ का पाठ:",
      taskTitleLabel: "कार्य का शीर्षक",
      taskDescLabel: "कार्य का विवरण व निर्देश",
      urgentBadge: "ज़रूरी / प्राथमिकता कार्य के रूप में चिह्नित करें",
      saveTask: "कार्य सूची में जोड़ें",
      cancel: "रद्द करें",
      samplePrompt: "उदा. 'आज दोपहर टमाटर के खेत में नीम तेल का छिड़काव करना है'",
      micDenied: "माइक्रोफ़ोन अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन चालू करें।",
      errorFailed: "ऑडियो प्रोसेस नहीं हो सका। कृपया दोबारा स्पष्ट रूप से बोलें।"
    },
    kn: {
      modalTitle: "ಧ್ವನಿ ಮೂಲಕ ಕಾರ್ಯ ಸೇರಿಸಿ",
      modalSubtitle: "ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಹಿಂದಿಯಲ್ಲಿ ಮಾತನಾಡಿ. AI ಇದನ್ನು ಕೃಷಿ ಕಾರ್ಯವಾಗಿ ಪರಿವರ್ತಿಸುತ್ತದೆ.",
      startRecording: "ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
      recordingNow: "ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ...",
      stopRecording: "ನಿಲ್ಲಿಸಿ & AI ಸಾರಾಂಶ ಪಡೆಯಿರಿ",
      reRecord: "ಮತ್ತೆ ರೆಕಾರ್ಡ್ ಮಾಡಿ",
      playAudio: "ಕೇಳಿ",
      pauseAudio: "ವಿರಾಮ",
      processingAudio: "Gemini AI ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...",
      processingSub: "ಆಡಿಯೊವನ್ನು ಪಠ್ಯವಾಗಿಸಿ ತುರ್ತು ಕಾರ್ಯ ಗುರುತಿಸಲಾಗುತ್ತಿದೆ...",
      reviewTitle: "AI ಕಾರ್ಯ ಸಾರಾಂಶ",
      transcriptLabel: "ಧ್ವನಿ ಪಠ್ಯ:",
      taskTitleLabel: "ಕಾರ್ಯದ ಹೆಸರು",
      taskDescLabel: "ಕಾರ್ಯದ ವಿವರಣೆ",
      urgentBadge: "ತುರ್ತು ಕಾರ್ಯವೆಂದು ಗುರುತಿಸಿ",
      saveTask: "ಕಾರ್ಯ ಪಟ್ಟಿಗೆ ಸೇರಿಸಿ",
      cancel: "ರದ್ದುಮಾಡಿ",
      samplePrompt: "ಉದಾ: 'ಇಂದು ಟೊಮೆಟೊ ಬೆಳೆಗೆ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಬೇಕು'",
      micDenied: "ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಅನುಮತಿಸಿ.",
      errorFailed: "ಧ್ವನಿ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ."
    }
  }[language] || {
    modalTitle: "Add Task via Voice Note",
    modalSubtitle: "Speak naturally. AgroCare AI will summarize it into an actionable farm task.",
    startRecording: "Tap to Start Recording",
    recordingNow: "Recording Voice Note...",
    stopRecording: "Stop & Analyze with AI",
    reRecord: "Re-record",
    playAudio: "Listen",
    pauseAudio: "Pause",
    processingAudio: "Gemini AI is analyzing your voice note...",
    processingSub: "Transcribing audio, detecting crop terms & urgency...",
    reviewTitle: "AI Task Summary",
    transcriptLabel: "Voice Note Transcript:",
    taskTitleLabel: "Task Title",
    taskDescLabel: "Action Details & Notes",
    urgentBadge: "Mark as Urgent / Priority",
    saveTask: "Add to Farm Tasks",
    cancel: "Cancel",
    samplePrompt: "e.g., 'Inspect wheat field and spray organic fungicide today'",
    micDenied: "Microphone permission denied. Please allow microphone access.",
    errorFailed: "Could not process audio. Please try again."
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRecordingState('idle');
      setRecordingDuration(0);
      setAudioUrl(null);
      setAudioBlob(null);
      setSummarizedTask(null);
      setErrorMessage(null);
      speechService.cancel();
    } else {
      stopRecordingCleanup();
    }
  }, [isOpen]);

  const stopRecordingCleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setIsPlayingAudio(false);
  };

  // Start Recording
  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];
    setRecordingDuration(0);

    try {
      speechService.cancel();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
        else mimeType = '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const blobType = recorder.mimeType || 'audio/webm';
        const finalBlob = new Blob(audioChunksRef.current, { type: blobType });
        setAudioBlob(finalBlob);
        const url = URL.createObjectURL(finalBlob);
        setAudioUrl(url);
        await processAudioWithGemini(finalBlob, blobType);
      };

      recorder.start(250);
      setRecordingState('recording');

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Microphone capture error:", err);
      setErrorMessage(t.micDenied);
      setRecordingState('idle');
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setRecordingState('processing');
      mediaRecorderRef.current.stop();
    }
  };

  // Convert Blob to Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Send audio to backend Gemini endpoint
  const processAudioWithGemini = async (blob: Blob, mimeType: string) => {
    setRecordingState('processing');
    setErrorMessage(null);

    try {
      const base64Data = await blobToBase64(blob);

      const response = await fetch('/api/voice/summarize-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audioBase64: base64Data,
          mimeType: mimeType || 'audio/webm',
          language
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.task) {
        const taskData = result.task;
        setSummarizedTask(taskData);
        
        // Initializing editable fields based on current language
        const initialTitle = language === 'hi' && taskData.titleHi 
          ? taskData.titleHi 
          : language === 'kn' && taskData.titleKn 
            ? taskData.titleKn 
            : taskData.title;

        setEditableTitle(initialTitle || 'New Farm Task');
        setEditableDescription(taskData.description || '');
        setIsUrgent(!!taskData.urgent);
        setSelectedIcon(taskData.icon || 'Sprout');
        setSelectedColor(taskData.color || (taskData.urgent ? 'red' : 'green'));
        setRecordingState('preview');
      } else {
        throw new Error(result.error || "Could not generate task summary");
      }
    } catch (err: any) {
      console.warn("AI Voice Task processing error:", err);
      // Fallback preview
      const fallbackTitle = language === 'hi' ? "खेत का नया कार्य" : language === 'kn' ? "ಹೊಸ ಕೃಷಿ ಕೆಲಸ" : "New Farm Task";
      const fallbackDesc = language === 'hi' ? "आवाज़ से रिकॉर्ड किया गया कार्य। समय पर पूरा करें।" : "Recorded via farm voice note. Complete timely.";
      
      setSummarizedTask({
        title: fallbackTitle,
        titleHi: "खेत का नया कार्य",
        titleKn: "ಹೊಸ ಕೃಷಿ ಕೆಲಸ",
        description: fallbackDesc,
        icon: 'Sprout',
        color: 'green',
        urgent: false,
        transcript: "Voice note recorded."
      });
      setEditableTitle(fallbackTitle);
      setEditableDescription(fallbackDesc);
      setIsUrgent(false);
      setSelectedIcon('Sprout');
      setSelectedColor('green');
      setRecordingState('preview');
    }
  };

  // Toggle Audio Playback
  const togglePlayAudio = () => {
    if (!audioUrl) return;

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlayingAudio(false);
      audioElementRef.current.onerror = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Save Final Task
  const handleSaveTask = () => {
    if (!editableTitle.trim()) return;

    const finalTaskData: Omit<Task, 'id' | 'completed'> = {
      title: summarizedTask?.title || editableTitle,
      titleHi: summarizedTask?.titleHi || editableTitle,
      titleKn: summarizedTask?.titleKn || editableTitle,
      description: editableDescription.trim() || 'Recorded via AgroCare voice note.',
      icon: selectedIcon,
      color: selectedColor,
      urgent: isUrgent,
      transcript: summarizedTask?.transcript || ''
    };

    // Override language specific title
    if (language === 'hi') {
      finalTaskData.titleHi = editableTitle;
    } else if (language === 'kn') {
      finalTaskData.titleKn = editableTitle;
    } else {
      finalTaskData.title = editableTitle;
    }

    onAddTask(finalTaskData);
    onClose();
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white w-full max-w-lg rounded-[32px] p-6 shadow-2xl border border-gray-100 flex flex-col gap-5 relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#1B5E20] shrink-0 shadow-xs">
              <Mic size={24} className={recordingState === 'recording' ? 'animate-pulse text-red-500' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Hanken_Grotesk'] text-lg font-black text-earth">
                  {t.modalTitle}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-[#1B5E20] border border-emerald-200 flex items-center gap-1">
                  <Sparkles size={11} />
                  <span>AI Powered</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-tight mt-0.5">
                {t.modalSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-earth transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Message if any */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* State 1: Idle - Ready to Record */}
        {recordingState === 'idle' && (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            
            {/* Big Mic Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#1B5E20] to-[#2E7D32] text-white flex items-center justify-center shadow-xl shadow-green-900/25 border-4 border-emerald-100 cursor-pointer relative group"
            >
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping pointer-events-none" />
              <Mic size={38} className="transition-transform group-hover:scale-110" />
            </motion.button>

            <h4 className="mt-5 font-black text-earth text-base">
              {t.startRecording}
            </h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
              {t.samplePrompt}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                🗣️ English / हिन्दी / ಕನ್ನಡ
              </span>
              <span className="text-[11px] font-bold text-[#1B5E20] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                ⚡ Auto Urgency Detection
              </span>
            </div>
          </div>
        )}

        {/* State 2: Recording In Progress */}
        {recordingState === 'recording' && (
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center space-y-5">
            {/* Timer & Pulsing Ring */}
            <div className="relative flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-red-500/10 flex items-center justify-center animate-pulse">
                <div className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30">
                  <Mic size={32} className="animate-bounce" />
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-700 font-mono text-sm font-black tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>{formatTime(recordingDuration)}</span>
              </div>
              <p className="text-xs font-bold text-earth mt-2">
                {t.recordingNow}
              </p>
            </div>

            {/* Audio Wave Visualizer Bars */}
            <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-xs bg-gray-50 rounded-2xl p-3 border border-gray-100">
              {[40, 70, 100, 60, 90, 50, 80, 45, 95, 65, 40, 85, 55, 75, 90].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [`${h * 0.3}%`, `${h}%`, `${h * 0.2}%`]
                  }}
                  transition={{
                    duration: 0.5 + (i % 4) * 0.15,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.04
                  }}
                  className="w-1.5 bg-red-500 rounded-full"
                />
              ))}
            </div>

            {/* Stop Action Button */}
            <button
              onClick={stopRecording}
              className="w-full py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all cursor-pointer active:scale-98"
            >
              <Square size={18} className="fill-current" />
              <span>{t.stopRecording}</span>
            </button>
          </div>
        )}

        {/* State 3: AI Processing State */}
        {recordingState === 'processing' && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center border-2 border-emerald-200">
                <Loader2 size={36} className="text-[#1B5E20] animate-spin" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-emerald-950 shadow-md">
                <Sparkles size={14} className="animate-spin" />
              </div>
            </div>

            <div>
              <h4 className="font-black text-earth text-base">
                {t.processingAudio}
              </h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                {t.processingSub}
              </p>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-[#1B5E20] bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 animate-pulse">
              <span>Extracting Action Items & Urgency Gate</span>
            </div>
          </div>
        )}

        {/* State 4: Preview & Edit Summarized Task */}
        {recordingState === 'preview' && (
          <div className="space-y-4">
            
            {/* Audio Playback & Re-record bar */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayAudio}
                  className="px-3 py-1.5 rounded-xl bg-white text-earth hover:bg-gray-100 font-bold text-xs flex items-center gap-1.5 border border-gray-200 shadow-xs cursor-pointer"
                >
                  {isPlayingAudio ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
                  <span>{isPlayingAudio ? t.pauseAudio : t.playAudio}</span>
                </button>
                <span className="text-xs font-mono font-bold text-gray-400">
                  {formatTime(recordingDuration || 4)}
                </span>
              </div>

              <button
                onClick={() => {
                  stopRecordingCleanup();
                  startRecording();
                }}
                className="text-xs font-bold text-gray-500 hover:text-earth flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>{t.reRecord}</span>
              </button>
            </div>

            {/* Transcript Quote */}
            {summarizedTask?.transcript && (
              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs">
                <span className="font-bold text-[#1B5E20] block mb-1 flex items-center gap-1">
                  <Volume2 size={13} />
                  <span>{t.transcriptLabel}</span>
                </span>
                <p className="text-gray-700 italic font-medium leading-relaxed">
                  "{summarizedTask.transcript}"
                </p>
              </div>
            )}

            {/* Editable Form Controls */}
            <div className="space-y-3">
              {/* Task Title */}
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider block mb-1 flex items-center justify-between">
                  <span>{t.taskTitleLabel}</span>
                  <span className="text-gray-400 font-normal lowercase flex items-center gap-1">
                    <Edit3 size={11} /> editable
                  </span>
                </label>
                <input
                  type="text"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 font-bold text-sm text-earth focus:outline-none focus:ring-2 focus:ring-[#1B5E20] bg-white"
                  placeholder="Enter task title..."
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                  {t.taskDescLabel}
                </label>
                <textarea
                  rows={2}
                  value={editableDescription}
                  onChange={(e) => setEditableDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1B5E20] bg-white resize-none"
                  placeholder="Additional notes or action details..."
                />
              </div>

              {/* Urgency & Category Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Urgent Toggle */}
                <button
                  type="button"
                  onClick={() => setIsUrgent(!isUrgent)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isUrgent 
                      ? 'bg-red-50 border-red-300 text-red-700 font-black shadow-xs' 
                      : 'bg-white border-gray-200 text-gray-500 font-bold hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className={isUrgent ? 'text-red-600' : 'text-gray-400'} />
                    <span className="text-xs">{isUrgent ? 'Urgent Priority' : 'Normal Priority'}</span>
                  </div>
                  <span className={`w-3.5 h-3.5 rounded-full border-2 ${isUrgent ? 'bg-red-600 border-red-600' : 'border-gray-300'}`} />
                </button>

                {/* Icon Category Picker */}
                <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-2xl border border-gray-200 justify-around">
                  {[
                    { id: 'Sprout', icon: <Sprout size={16} />, label: 'Crop' },
                    { id: 'Bug', icon: <Bug size={16} />, label: 'Pest' },
                    { id: 'Droplets', icon: <Droplets size={16} />, label: 'Water' },
                    { id: 'ShieldCheck', icon: <ShieldCheck size={16} />, label: 'Care' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedIcon(cat.id)}
                      className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                        selectedIcon === cat.id
                          ? 'bg-[#1B5E20] text-white shadow-xs scale-105'
                          : 'text-gray-400 hover:text-earth'
                      }`}
                      title={cat.label}
                    >
                      {cat.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions: Cancel & Save */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-xs transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveTask}
                disabled={!editableTitle.trim()}
                className="flex-2 py-3 px-4 rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-green-900/20 transition-all cursor-pointer active:scale-98"
              >
                <Check size={16} />
                <span>{t.saveTask}</span>
              </button>
            </div>

          </div>
        )}

      </motion.div>
    </div>
  );
};

export default VoiceTaskModal;
