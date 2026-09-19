import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, HelpCircle, X, Check, AlertCircle, Compass, Radio } from 'lucide-react';
import { Screen, Language } from '../types';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { LiveAudioChat } from './LiveAudioChat';

interface VoiceNavigationProps {
  currentLanguage: Language;
  onNavigate: (screen: Screen) => void;
  onCameraOpen: () => void;
  activeScreen?: Screen;
}

// Commands translation dictionary for user guidance
const COMMANDS_GUIDE = {
  en: [
    { cmd: '"Go to home" / "Go home"', desc: 'Navigate to Dashboard' },
    { cmd: '"Go to market" / "Mandi prices"', desc: 'Check agricultural mandi rates' },
    { cmd: '"Start diagnosis" / "Scan crop"', desc: 'Launch camera disease scanner' },
    { cmd: '"Open chat" / "Talk to AI"', desc: 'Chat with AgroCare Assistant' },
    { cmd: '"Soil analysis" / "Check soil"', desc: 'View soil diagnostic details' },
    { cmd: '"Find suppliers" / "Nearby stores"', desc: 'Locate certified input shops' },
    { cmd: '"View calendar" / "My tasks"', desc: 'Check crop calendar & reminders' },
    { cmd: '"Government schemes" / "Yojana"', desc: 'Search beneficial subsidy schemes' },
    { cmd: '"My profile" / "Profile"', desc: 'View your profile & farm settings' }
  ],
  hi: [
    { cmd: '"घर जाओ" / "होम"', desc: 'मुख्य डैशबोर्ड पर जाएं' },
    { cmd: '"बाजार जाओ" / "मंडी भाव"', desc: 'कृषि मंडी दरें देखें' },
    { cmd: '"फसल जांच" / "स्कैन"', desc: 'कैमरा रोग स्कैनर चालू करें' },
    { cmd: '"चैट खोलें" / "सलाहकार"', desc: 'एग्रोकेयर सहायक से बात करें' },
    { cmd: '"मिट्टी की जांच" / "मृदा"', desc: 'मिट्टी निदान विवरण देखें' },
    { cmd: '"व्यापारी खोजें" / "दुकान"', desc: 'प्रमाणित इनपुट दुकानों का पता लगाएं' },
    { cmd: '"कैलेंडर देखें" / "कार्य"', desc: 'फसल कैलेंडर और अनुस्मारक देखें' },
    { cmd: '"सरकारी योजना" / "योजना"', desc: 'सरकारी सब्सिडी योजनाएं खोजें' },
    { cmd: '"मेरा प्रोफ़ाइल" / "प्रोफ़ाइल"', desc: 'अपनी प्रोफ़ाइल और फ़ार्म सेटिंग देखें' }
  ],
  kn: [
    { cmd: '"ಮನೆಗೆ ಹೋಗು" / "ಮುಖಪುಟ"', desc: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ನ್ಯಾವಿಗೇಟ್ ಮಾಡಿ' },
    { cmd: '"ಮಾರುಕಟ್ಟೆಗೆ ಹೋಗು" / "ಬೆಲೆಗಳು"', desc: 'ಮಂಡಿ ದರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ' },
    { cmd: '"ರೋಗ ಪತ್ತೆ ಹಚ್ಚಿ" / "ಸ್ಕ್ಯಾನ್"', desc: 'ಕ್ಯಾಮೆರಾ ರೋಗ ಪತ್ತೆ ಸ್ಕ್ಯಾನರ್ ಪ್ರಾರಂಭಿಸಿ' },
    { cmd: '"ಚಾಟ್ ತೆರೆಯಿರಿ" / "ಚಾಟ್"', desc: 'ಚಾಟ್ ಅಸಿಸ್ಟೆಂಟ್ ಜೊತೆ ಮಾತನಾಡಿ' },
    { cmd: '"ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ" / "ಮಣ್ಣು"', desc: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಮಾಹಿತಿ ನೋಡಿ' },
    { cmd: '"ಸರಬರಾಜುದಾರರನ್ನು ಹುಡುಕು"', desc: 'ಹತ್ತಿರದ ಪ್ರಮಾಣೀಕೃತ ಮಳಿಗೆಗಳನ್ನು ಹುಡುಕಿ' },
    { cmd: '"ಕ್ಯಾಲೆಂಡರ್" / "ವೇಳಾಪಟ್ಟಿ"', desc: 'ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್ ಮತ್ತು ಕಾರ್ಯಗಳನ್ನು ಪರಿಶೀಲಿಸಿ' },
    { cmd: '"ಯೋಜನೆಗಳು" / "ಸರ್ಕಾರದ ಯೋಜನೆ"', desc: 'ಅನುಕೂಲಕರ ಸಬ್ಸಿಡಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ' },
    { cmd: '"ನನ್ನ ಪ್ರೊಫೈಲ್" / "ಪ್ರೊಫೈಲ್"', desc: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ವೀಕ್ಷಿಸಿ' }
  ]
};

const NAV_SOUNDS = {
  success: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav',
  error: 'https://assets.mixkit.co/active_storage/sfx/2513/2513-84.wav',
  listening: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav'
};

export const VoiceNavigation: React.FC<VoiceNavigationProps> = ({ currentLanguage, onNavigate, onCameraOpen, activeScreen }) => {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recognizedCommand, setRecognizedCommand] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(activeScreen === 'suppliers');

  const recognitionRef = useRef<any>(null);

  // Auto minimize floating mic if in suppliers screen to avoid blocking shop cards & buttons
  useEffect(() => {
    if (activeScreen === 'suppliers') {
      setIsMinimized(true);
    } else {
      setIsMinimized(false);
    }
  }, [activeScreen]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Set correct lang locale code
    if (currentLanguage === 'hi') {
      recognition.lang = 'hi-IN';
    } else if (currentLanguage === 'kn') {
      recognition.lang = 'kn-IN';
    } else {
      recognition.lang = 'en-IN'; // Indian English pronunciation is best suited
    }

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setRecognizedCommand(null);
      playFeedbackSound('listening');
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript.toLowerCase().trim();
      setTranscript(speechToText);
      processVoiceCommand(speechToText);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech Recognition Error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error('Microphone permission denied. Please allow microphine access.');
      } else if (event.error === 'no-speech') {
        toast.error('No speech detected. Please speak clearly.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [currentLanguage]);

  const playFeedbackSound = (type: 'success' | 'error' | 'listening') => {
    try {
      const audio = new Audio(NAV_SOUNDS[type]);
      audio.volume = 0.25;
      audio.play().catch(() => {
        // Safe catch for browsers blocking autoplay before user interaction
      });
    } catch (e) {
      // Safe fallback
    }
  };

  const speakConfirmation = (message: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(message);
      if (currentLanguage === 'hi') {
        utterance.lang = 'hi-IN';
      } else if (currentLanguage === 'kn') {
        utterance.lang = 'kn-IN';
      } else {
        utterance.lang = 'en-IN';
      }
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processVoiceCommand = (text: string) => {
    // Normalization helper
    const matches = (keywords: string[]) => {
      return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    };

    // Screens matching logic
    // 1. Home / Dashboard
    if (matches(['home', 'go home', 'dashboard', 'house', 'मुख्य पृष्ठ', 'डैशबोर्ड', 'घर जाओ', 'होम', 'ಮುಖಪುಟ', 'ಮನೆಗೆ', 'ಮನೆ'])) {
      triggerNavigation('home', 'Navigating to Home Dashboard', 'मुख्य डैशबोर्ड पर जा रहे हैं', 'ಮುಖಪುಟಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದೇವೆ');
      return;
    }

    // 2. Market / Mandi
    if (matches(['market', 'mandi', 'price', 'rates', 'मंडी', 'बाजार', 'बाज़ार', 'ಬೆಲೆಗಳು', 'ಮಾರುಕಟ್ಟೆ', 'ಮಂಡಿ'])) {
      triggerNavigation('market', 'Opening Crop Market Rates', 'फसल मंडी भाव खोल रहे हैं', 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ');
      return;
    }

    // 3. Scan / Diagnosis
    if (matches(['scan', 'diagnose', 'diagnosis', 'camera', 'disease', 'रोग', 'जांच', 'स्कैन', 'ರೋಗ ಪತ್ತೆ', 'ಕ್ಯಾಮೆರಾ', 'ರೋಗ ಪತ್ತೆ ಹಚ್ಚಿ'])) {
      // Trigger camera directly or go to diagnosis
      triggerNavigation('scan', 'Launching AI Crop Scanner', 'फसल रोग स्कैनर चालू कर रहे हैं', 'ಬೆಳೆ ರೋಗ ಪತ್ತೆ ಸ್ಕ್ಯಾನರ್ ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ');
      // Delay camera launch slightly to let sound/TTS complete
      setTimeout(() => {
        onCameraOpen();
      }, 800);
      return;
    }

    // 4. Chat Assistant
    if (matches(['chat', 'ask ai', 'advisor', 'assistant', 'talk to', 'सलाहकार', 'चैट', 'ಮಾರ್ಗದರ್ಶನ', 'ಚಾಟ್'])) {
      triggerNavigation('chat', 'Opening AgroCare Chat Assistant', 'एग्रोकेयर चैट सहायक खोल रहे हैं', 'ಚಾಟ್ ಸಹಾಯಕವನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ');
      return;
    }

    // 5. Soil Analysis
    if (matches(['soil', 'check soil', 'mridha', 'mridā', 'मिट्टी', 'मृदा', 'ಮಣ್ಣಿನ', 'ಮಣ್ಣು'])) {
      triggerNavigation('soil-analysis', 'Opening Soil Diagnostics', 'मिट्टी परीक्षण निदान खोल रहे हैं', 'ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ');
      return;
    }

    // 6. Suppliers / Nearby Input Shops
    if (matches(['supplier', 'dealer', 'store', 'shop', 'व्यापारी', 'दुकान', 'सप्लायर', 'ಸರಬರಾಜು', 'ಅಂಗಡಿ'])) {
      triggerNavigation('suppliers', 'Finding Nearby Certified Suppliers', 'नजदीकी प्रमाणित बीज-खाद की दुकानें खोज रहे हैं', 'ಹತ್ತಿರದ ಸರಬರಾಜುದಾರರನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ');
      return;
    }

    // 7. Calendar / Tasks
    if (matches(['calendar', 'tasks', 'schedule', 'reminders', 'कैलेंडर', 'कार्य', 'ಶೆಡ್ಯೂಲ್', 'ಕ್ಯಾಲೆಂಡರ್', 'ವೇಳಾಪಟ್ಟಿ'])) {
      triggerNavigation('calendar', 'Viewing Crop Calendar & Tasks', 'फसल कैलेंडर और कार्य सूची खोल रहे हैं', 'ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್ ಮತ್ತು ವೇಳಾಪಟ್ಟಿ ವೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ');
      return;
    }

    // 8. Government Schemes
    if (matches(['scheme', 'government', 'yojana', 'योजना', 'सरकारी योजना', 'ಯೋಜನೆಗಳು', 'ಸರ್ಕಾರದ ಯೋಜನೆ'])) {
      triggerNavigation('scheme-finder', 'Launching Government Subsidy Scheme Finder', 'सरकारी योजना खोजक टूल खोल रहे हैं', 'ಸರ್ಕಾರದ ಸಬ್ಸಿಡಿ ಯೋಜನೆಗಳ ಮಾಹಿತಿ');
      return;
    }

    // 9. Profile / Farm Configuration
    if (matches(['profile', 'account', 'farm profile', 'मेरा प्रोफ़ाइल', 'प्रोफ़ाइल', 'ಪ್ರೊಫೈಲ್', 'ನನ್ನ ಪ್ರೊಫೈಲ್'])) {
      triggerNavigation('profile', 'Opening Farm Profile', 'आपकी प्रोफ़ाइल खोल रहे हैं', 'ನನ್ನ ಪ್ರೊಫೈಲ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ');
      return;
    }

    // No command matched
    playFeedbackSound('error');
    setRecognizedCommand('unmatched');
    const failMsgs = {
      en: "Sorry, I didn't recognize that command. Try 'Go to market' or 'Start diagnosis'.",
      hi: "क्षमा करें, मैं वह कमांड समझ नहीं पाया। 'बाजार जाओ' या 'फसल जांच' बोलें।",
      kn: "ಕ್ಷಮಿಸಿ, ಕಮಾಂಡ್ ಅರ್ಥವಾಗಲಿಲ್ಲ. 'ಮಾರುಕಟ್ಟೆಗೆ ಹೋಗು' ಅಥವಾ 'ಸ್ಕ್ಯಾನ್' ಎಂದು ಹೇಳಿ."
    };
    toast.error(failMsgs[currentLanguage] || failMsgs.en, {
      icon: <AlertCircle className="text-red-500" />
    });
    speakConfirmation(failMsgs[currentLanguage] || failMsgs.en);
  };

  const triggerNavigation = (screen: Screen, enMsg: string, hiMsg: string, knMsg: string) => {
    playFeedbackSound('success');
    setRecognizedCommand(screen);

    const tMsg = currentLanguage === 'hi' ? hiMsg : currentLanguage === 'kn' ? knMsg : enMsg;
    toast.success(tMsg, {
      icon: <Check className="text-emerald-500 animate-bounce" />
    });
    speakConfirmation(tMsg);
    onNavigate(screen);
  };

  const toggleListening = () => {
    if (!speechSupported) {
      toast.error('Voice Assistant not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        recognitionRef.current?.stop();
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 150);
      }
    }
  };

  return (
    <>
      {/* Floating Microphone Widget */}
      <div className={`fixed z-[40] pointer-events-auto transition-all duration-300 ${
        activeScreen === 'suppliers'
          ? 'bottom-3 right-3 sm:bottom-4 sm:right-4'
          : 'bottom-20 right-4 sm:bottom-24 sm:right-6'
      } flex flex-col items-end gap-2`}>
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="bg-earth/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 border border-emerald-800 text-white max-w-[260px]"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <p className="text-xs font-medium tracking-wide">
                {currentLanguage === 'hi' ? 'सुन रहा हूँ... बोलें' : currentLanguage === 'kn' ? 'ಕೇಳುತ್ತಿದ್ದೇನೆ... ಹೇಳಿ' : 'Listening... speak now'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {isMinimized && activeScreen === 'suppliers' ? (
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-full shadow-lg border border-emerald-200">
            <button
              onClick={toggleListening}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer ${
                isListening ? 'bg-emerald-500 animate-pulse' : 'bg-primary hover:bg-primary-dark'
              }`}
              title="Voice Assistant"
            >
              <Mic size={16} />
            </button>
            <button
              onClick={() => setShowLiveChat(true)}
              className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
              title="Live Voice AI"
            >
              <Radio size={15} />
            </button>
            <button
              onClick={() => setIsMinimized(false)}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold cursor-pointer"
              title="Expand Voice Controls"
            >
              +
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-full shadow-xl border border-gray-200/80">
            {/* Live Voice API Button */}
            <button
              onClick={() => setShowLiveChat(true)}
              className="h-9 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 rounded-full flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-90 font-bold text-xs cursor-pointer"
              title="Start Live Voice API Session (gemini-3.1-flash-live-preview)"
            >
              <Radio size={14} className="animate-pulse text-emerald-200" />
              <span className="text-[11px]">Live AI</span>
            </button>

            {/* Help Button */}
            <button
              onClick={() => setShowHelp(true)}
              className="w-8 h-8 bg-gray-50 hover:bg-gray-100 text-earth border border-gray-200 rounded-full flex items-center justify-center shadow-xs transition-all active:scale-90 cursor-pointer"
              title="Voice Commands Guide"
            >
              <HelpCircle size={15} />
            </button>

            {activeScreen === 'suppliers' && (
              <button
                onClick={() => setIsMinimized(true)}
                className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer"
                title="Minimize voice controls"
              >
                –
              </button>
            )}

            {/* Interactive Mic Toggle */}
            <button
              onClick={toggleListening}
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg relative transition-all active:scale-95 cursor-pointer ${
                isListening
                  ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-primary text-white hover:bg-primary-dark shadow-[0_4px_15px_rgba(46,125,50,0.35)]'
              }`}
            >
              {isListening ? (
                <>
                  <span className="absolute -inset-1.5 bg-emerald-500/20 rounded-full animate-ping pointer-events-none" />
                  <Mic size={18} className="relative z-10" />
                </>
              ) : (
                <Mic size={18} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Voice Recognition Feedback Screen HUD Indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/10 backdrop-blur-[1px] pointer-events-none flex items-center justify-center"
          >
            <div className="text-center p-8 bg-white/95 rounded-3xl shadow-2xl max-w-sm pointer-events-auto border border-emerald-50 relative">
              <Compass size={40} className="mx-auto text-primary animate-spin-slow mb-4" />
              <h2 className="text-lg font-bold text-earth">
                {currentLanguage === 'hi' ? 'स्मार्ट वॉयस असिस्टेंट' : currentLanguage === 'kn' ? 'ಸ್ಮಾರ್ಟ್ ಧ್ವನಿ ಸಹಾಯಕ' : 'Hands-Free Voice Navigation'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {currentLanguage === 'hi' ? 'मंडी भाव, फसल जांच, मिट्टी परीक्षण, या चैट बोलें' : currentLanguage === 'kn' ? 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು, ಬೆಳೆ ಸ್ಕ್ಯಾನ್, ಮಣ್ಣು ಪರೀಕ್ಷೆ ಎಂದು ಹೇಳಿ' : 'Say "Go to market", "Scan crop", "Open chat", or "Check soil"'}
              </p>
              {transcript && (
                <div className="mt-4 p-3 bg-soil/50 rounded-2xl border border-earth/10">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Recognized Audio</span>
                  <p className="text-earth font-black text-base mt-1">"{transcript}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal Guide */}
      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100"
            >
              <div className="p-6 bg-earth text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Mic size={22} className="text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">Hands-Free Commands</h3>
                    <p className="text-xs text-emerald-100">Control AgroCare AI using your voice</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                <p className="text-sm text-gray-500 font-medium">
                  Tap the microphine button, wait for the sound feedback, and say any of the following commands clearly in your selected language:
                </p>

                <div className="space-y-3">
                  {(COMMANDS_GUIDE[currentLanguage] || COMMANDS_GUIDE.en).map((guide, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-soil/40 rounded-2xl border border-earth/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 hover:bg-soil/70 transition-colors"
                    >
                      <span className="font-mono text-xs font-bold text-primary tracking-tight">
                        {guide.cmd}
                      </span>
                      <span className="text-xs font-semibold text-earth/80">
                        {guide.desc}
                      </span>
                    </div>
                  ))}
                </div>

                {!speechSupported && (
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3 mt-4">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                    <div>
                      <h4 className="text-xs font-bold text-red-800">Speech API Not Supported</h4>
                      <p className="text-[11px] text-red-600 mt-0.5">
                        Your browser doesn't natively support Web Speech. Please switch to Google Chrome, Microsoft Edge, or Safari on Mobile/Desktop for the best experience.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowHelp(false)}
                  className="bg-earth text-white font-bold px-6 py-3 rounded-xl hover:bg-earth-dark transition-all text-sm shadow-md"
                >
                  Got It, Start Speaking
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Audio Chat Modal (gemini-3.1-flash-live-preview) */}
      <AnimatePresence>
        {showLiveChat && (
          <LiveAudioChat 
            diagnosis={null} 
            onClose={() => setShowLiveChat(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};
