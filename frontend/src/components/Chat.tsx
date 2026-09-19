import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MoreVertical, Bot, Send, Mic, Camera, Volume2, CheckCheck, Leaf, AlertTriangle, Square, Loader2, Globe, Sparkles, Radio } from 'lucide-react';
import { generateSpeech, transcribeAudio } from '../services/gemini';
import { runAgentOrchestrator, AgentResult } from '../services/agentService';
import { AgentStepsDisplay } from './AgentStepsDisplay';
import { Language } from '../types';
import { useConnectivity } from '../services/connectivity';
import { chatWithModelRouter, subscribeToModelStatus, ModelStatus } from '../services/gemma';
import { LiveAudioChat } from './LiveAudioChat';
import { AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  text: string;
  time: string;
  isAlternative?: boolean;
  agentResult?: AgentResult;
}

interface ChatProps {
  onBack: () => void;
  language: Language;
  onToggleLanguage: (lang?: Language) => void;
}

export const Chat: React.FC<ChatProps> = ({ onBack, language, onToggleLanguage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const isOnline = useConnectivity();
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    model: 'gemini',
    isFallback: false,
    isOnline: isOnline
  });

  useEffect(() => {
    const unsubscribe = subscribeToModelStatus((status) => {
      setModelStatus(status);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length <= 1) {
        return [
          {
            role: 'model',
            text: language === 'hi' 
              ? "नमस्ते! 🙏 मैं आपका एग्रोकेयर सहायक हूं। मैं खेती, फसल की बीमारियों और मंडी के भाव जानने में आपकी कैसे मदद कर सकता हूं?" 
              : language === 'kn'
              ? "ನಮಸ್ಕಾರ! 🙏 ನಾನು ನಿಮ್ಮ ಅಗ್ರೋಕೇರ್ ಸಹಾಯಕ. ಕೃಷಿ, ಬೆಳೆ ರೋಗಗಳು ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳ ಬಗ್ಗೆ ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?"
              : "Namaste! 🙏 I'm your AgroCare assistant. How can I help you today with farming advice, crop diseases, or market prices?",
            time: '10:30 AM'
          }
        ];
      }
      return prev;
    });
  }, [language]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLiveAudioOpen, setIsLiveAudioOpen] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);
  const [loadingAudioIndex, setLoadingAudioIndex] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const currentAudioRequestRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const initialInputRef = useRef<string>('');

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.stop();
        } catch (e) {}
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleMicClick = async () => {
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        setIsLoading(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            try {
              const base64Audio = reader.result as string;
              const text = await transcribeAudio(base64Audio, mimeType, language);
              if (text && text.trim()) {
                setInputText(prev => prev ? `${prev} ${text.trim()}` : text.trim());
              }
            } catch (error) {
              console.warn("Transcription API error on client:", error);
            } finally {
              setIsLoading(false);
            }
          };
        } catch (error) {
          console.error("Transcription error:", error);
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access is required to use voice input.");
      
      // Fallback to Web Speech API if MediaRecorder fails (e.g. some browser permissions)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        initialInputRef.current = inputText;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
          }
          const newText = initialInputRef.current ? `${initialInputRef.current} ${fullTranscript}` : fullTranscript;
          setInputText(newText);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        try { recognition.start(); } catch(e) { setIsListening(false); }
      }
    }
  };

  const handlePlayAudio = async (text: string, index: number) => {
    // If clicking the currently playing or loading audio, stop it
    if (playingAudioIndex === index || loadingAudioIndex === index) {
      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.stop();
        } catch (e) {}
        audioSourceRef.current = null;
      }
      setPlayingAudioIndex(null);
      setLoadingAudioIndex(null);
      currentAudioRequestRef.current = null;
      return;
    }

    // Stop any currently playing audio
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {}
      audioSourceRef.current = null;
    }
    setPlayingAudioIndex(null);

    try {
      setLoadingAudioIndex(index);
      
      // Generate a unique ID for this request to handle race conditions
      const requestId = Date.now();
      currentAudioRequestRef.current = requestId;
      
      const base64Audio = await generateSpeech(text);
      
      // If the user clicked stop or started another audio while this was loading
      if (currentAudioRequestRef.current !== requestId) {
        return;
      }
      
      setLoadingAudioIndex(null);
      
      if (base64Audio) {
        setPlayingAudioIndex(index);
        
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
        }
        
        const audioCtx = audioContextRef.current;
        
        // Decode base64 to binary string
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Convert to 16-bit PCM
        const int16Array = new Int16Array(bytes.buffer);
        
        // Create audio buffer
        const audioBuffer = audioCtx.createBuffer(1, int16Array.length, 24000);
        const channelData = audioBuffer.getChannelData(0);
        
        // Convert Int16 to Float32 (-1.0 to 1.0)
        for (let i = 0; i < int16Array.length; i++) {
          channelData[i] = int16Array[i] / 32768.0;
        }
        
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        
        source.onended = () => {
          if (currentAudioRequestRef.current === requestId) {
            setPlayingAudioIndex(null);
            audioSourceRef.current = null;
            currentAudioRequestRef.current = null;
          }
        };
        
        audioSourceRef.current = source;
        source.start();
      } else {
        throw new Error("No audio data returned from speech generator");
      }
    } catch (error) {
      console.warn("Failed to play Gemini TTS audio, falling back to browser SpeechSynthesis:", error);
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          if (language === 'hi') {
            utterance.lang = 'hi-IN';
          } else if (language === 'kn') {
            utterance.lang = 'kn-IN';
          } else {
            utterance.lang = 'en-IN';
          }
          utterance.onend = () => {
            setPlayingAudioIndex(null);
            setLoadingAudioIndex(null);
          };
          utterance.onerror = () => {
            setPlayingAudioIndex(null);
            setLoadingAudioIndex(null);
          };
          setPlayingAudioIndex(index);
          setLoadingAudioIndex(null);
          window.speechSynthesis.speak(utterance);
        } else {
          setLoadingAudioIndex(null);
          setPlayingAudioIndex(null);
        }
      } catch (synthErr) {
        console.error("Browser speech synthesis fallback failed too:", synthErr);
        setLoadingAudioIndex(null);
        setPlayingAudioIndex(null);
      }
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      role: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const isAgentRequest = /plan|spray|weather|itk|scheme|supplier|fertilizer|dose|treatment|fungicide|blight|pest/i.test(userMessage.text);

      if (isAgentRequest) {
        try {
          const agentPlan = await runAgentOrchestrator({
            message: userMessage.text,
            crop: 'Tomato',
            location: 'Karnataka, India',
            language
          });

          const botMessage: Message = {
            role: 'model',
            text: agentPlan.reasoning_summary || "Here is your multi-step evidence-based agricultural action plan:",
            agentResult: agentPlan,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setMessages(prev => [...prev, botMessage]);
          return;
        } catch (agentErr) {
          console.warn("Agent orchestrator chat fallback:", agentErr);
        }
      }

      const history = messages
        .filter((m, i) => !(i === 0 && m.role === 'model'))
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      const response = await chatWithModelRouter(inputText, history, language, sessionId);
      
      const botMessage: Message = {
        role: 'model',
        text: response || "I'm sorry, I couldn't process that.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        role: 'model',
        text: language === 'hi' 
          ? "माफ़ कीजिये, अभी कोई समस्या आ रही है। कृपया कुछ देर बाद फिर से प्रयास करें।" 
          : language === 'kn'
          ? "ಕ್ಷಮಿಸಿ, ಸಂಪರ್ಕಿಸಲು ತೊಂದರೆಯಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ."
          : "I'm sorry, I'm having trouble connecting right now. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F0F2F5] relative shadow-xl overflow-hidden">
      <header className="bg-primary-dark text-white px-4 py-3 flex items-center shadow-md z-10 shrink-0 pt-20">
        <button onClick={onBack} className="mr-3 p-1 rounded-full hover:bg-primary transition">
          <ArrowLeft size={28} />
        </button>
        <div className="flex items-center flex-1">
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary-dark font-bold border-2 border-white overflow-hidden">
              <Bot size={24} />
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 ${isOnline ? 'bg-green-400' : 'bg-amber-400'} border-2 border-primary-dark rounded-full`}></div>
          </div>
          <div className="ml-3">
            <h1 className="font-bold text-lg leading-tight">AgroCare Bot</h1>
            <p className="text-green-100 text-xs flex items-center flex-wrap gap-x-2 gap-y-1">
              <span className={`inline-block w-1.5 h-1.5 ${isOnline ? 'bg-green-300' : 'bg-amber-300'} rounded-full`}></span>
              <span>{isOnline ? 'Online' : 'Offline'}</span>
              <span className="opacity-50">•</span>
              <span className="font-semibold bg-white/15 px-1.5 py-0.5 rounded text-[10px] tracking-wide uppercase">
                {modelStatus.model === 'gemini' 
                  ? 'Gemini Cloud' 
                  : modelStatus.isFallback 
                    ? 'Gemma Fallback' 
                    : 'Gemma Edge'}
              </span>
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsLiveAudioOpen(true)}
          className="p-2 mr-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition flex items-center justify-center gap-1 text-xs font-bold border border-emerald-400/30"
          title="Start Live Voice API Conversation (gemini-3.1-flash-live-preview)"
        >
          <Radio size={18} className="animate-pulse text-emerald-400" />
          <span className="hidden sm:inline">Live Voice</span>
        </button>
        <button onClick={() => onToggleLanguage()} className="p-2 mr-1 rounded-full hover:bg-primary transition flex items-center justify-center" aria-label="Toggle Language">
          <Globe size={24} />
        </button>
        <button className="p-2 rounded-full hover:bg-primary transition">
          <MoreVertical size={24} />
        </button>
      </header>

      {(!isOnline || modelStatus.model === 'gemma') && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-800 px-4 py-2 text-xs font-bold flex items-center justify-between animate-fadeIn z-10">
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-amber-600 animate-pulse shrink-0" />
            <span>
              {!isOnline 
                ? "Offline Resilience Mode — Running Gemma Edge on Device" 
                : "Gemini Quota Limited — Auto fell back to local Gemma Edge"}
            </span>
          </div>
          <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded tracking-wider uppercase font-semibold shrink-0 ml-2">
            {modelStatus.isFallback ? 'FAILOVER' : 'OFFLINE'}
          </span>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar pb-32">
        <div className="flex justify-center">
          <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Today</span>
        </div>

        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 bg-primary-dark rounded-full flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                <Bot size={18} />
              </div>
            )}
            <div className={`${msg.role === 'user' ? 'mr-2' : 'ml-2'} max-w-[85%]`}>
              <div className={`p-4 rounded-2xl shadow-sm text-earth border ${
                msg.role === 'user' 
                  ? 'bg-[#dcf8c6] rounded-tr-none border-green-100' 
                  : 'bg-white rounded-tl-none border-gray-100'
              }`}>
                {msg.isAlternative && (
                  <p className="text-base leading-relaxed font-bold text-green-800 mb-2 flex items-center">
                    <Leaf size={18} className="mr-1" /> Organic Alternative
                  </p>
                )}
                <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                {msg.agentResult && (
                  <div className="mt-3">
                    <AgentStepsDisplay result={msg.agentResult} />
                  </div>
                )}
                {msg.role === 'model' && (
                  <button 
                    onClick={() => handlePlayAudio(msg.text, i)}
                    className="mt-2 flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition-colors"
                  >
                    {playingAudioIndex === i ? (
                      <><Square size={16} className="fill-current" /> Stop</>
                    ) : loadingAudioIndex === i ? (
                      <><Loader2 size={16} className="animate-spin" /> Loading...</>
                    ) : (
                      <><Volume2 size={16} /> Listen</>
                    )}
                  </button>
                )}
              </div>
              <span className={`text-[10px] text-gray-500 mt-1 block flex items-center gap-1 ${msg.role === 'user' ? 'justify-end' : 'ml-1'}`}>
                {msg.time}
                {msg.role === 'user' && <CheckCheck size={14} className="text-blue-500" />}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start">
            <div className="w-8 h-8 bg-primary-dark rounded-full flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
              <Bot size={18} />
            </div>
            <div className="ml-2 bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <footer className="absolute bottom-0 w-full bg-white border-t border-gray-200 px-3 py-3 z-20 pb-8">
        <div className="flex items-end gap-2">
          <button 
            onClick={handleMicClick}
            className={`p-3 rounded-full shadow-lg transition flex-shrink-0 mb-1 ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-primary text-white hover:bg-primary-dark active:scale-95'
            }`}
          >
            {isListening ? <Square size={24} className="fill-current" /> : <Mic size={24} />}
          </button>
          <div className="flex-1 bg-gray-100 rounded-3xl flex items-center px-4 py-2 border border-gray-200 focus-within:border-primary focus-within:bg-white transition mb-1">
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              className="w-full bg-transparent border-none focus:ring-0 p-0 text-base resize-none text-gray-800 placeholder-gray-500 max-h-24 overflow-y-auto" 
              placeholder={language === 'hi' ? "हिंदी में पूछें..." : language === 'kn' ? "ಕನ್ನಡದಲ್ಲಿ ಕೇಳಿ..." : "Ask in English..."} 
              rows={1}
            />
            <button className="text-gray-400 hover:text-primary ml-2 transition">
              <Camera size={24} />
            </button>
          </div>
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={`p-3 rounded-full transition flex-shrink-0 mb-1 ${
              inputText.trim() && !isLoading ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            <Send size={24} />
          </button>
        </div>
        <div className="text-center mt-2">
          <p className="text-[10px] text-gray-400">AgroCare AI can make mistakes. Consult an expert for critical issues.</p>
        </div>
      </footer>

      {/* Live Audio Chat Modal (gemini-3.1-flash-live-preview) */}
      <AnimatePresence>
        {isLiveAudioOpen && (
          <LiveAudioChat 
            diagnosis={null} 
            onClose={() => setIsLiveAudioOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
