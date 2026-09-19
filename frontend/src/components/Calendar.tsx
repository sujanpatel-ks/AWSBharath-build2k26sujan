import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Calendar as CalendarIcon, ChevronRight, Droplets, Bug, Sprout, Camera, Info, Loader2, AlertTriangle, Volume2, Pause, Play, Square, Mic, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TASKS, RECOMMENDED_CROPS } from '../constants';
import { Task, Language } from '../types';
import { getRealTimeWeather, WeatherData, getWeatherForecast, ForecastDay } from '../services/gemini';
import { useGeolocation } from '../hooks/useGeolocation';
import { WeatherForecast } from './WeatherForecast';
import { speechService } from '../services/speechSynthesisService';
import { VoiceTaskModal } from './VoiceTaskModal';

interface CalendarProps {
  onBack: () => void;
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onToggleUrgentTask?: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  language: Language;
}

export const Calendar: React.FC<CalendarProps> = ({ onBack, tasks, onToggleTask, onToggleUrgentTask, onAddTask, language }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'urgent' | 'normal'>('all');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const { latitude, longitude, loading: locationLoading, error: locationError } = useGeolocation();

  const handleSpeakAllUrgent = () => {
    const urgentTasks = tasks.filter(t => !t.completed && t.urgent);
    if (urgentTasks.length === 0) {
      const allPending = tasks.filter(t => !t.completed);
      const textToSpeak = allPending.length > 0
        ? speechService.formatUrgentTasksSpeechText(allPending, language)
        : (language === 'hi' ? 'सभी कार्य पूर्ण हो चुके हैं!' : language === 'kn' ? 'ಎಲ್ಲಾ ಕಾರ್ಯಗಳು ಮುಗಿದಿವೆ!' : 'All farm tasks are completed! Great work.');
      speechService.speak(textToSpeak, language, {
        onStart: () => { setIsSpeaking(true); setIsPaused(false); },
        onEnd: () => { setIsSpeaking(false); setIsPaused(false); },
        onError: () => { setIsSpeaking(false); setIsPaused(false); }
      });
      return;
    }

    const textToSpeak = speechService.formatUrgentTasksSpeechText(urgentTasks, language);
    speechService.speak(textToSpeak, language, {
      onStart: () => { setIsSpeaking(true); setIsPaused(false); },
      onEnd: () => { setIsSpeaking(false); setIsPaused(false); },
      onError: () => { setIsSpeaking(false); setIsPaused(false); },
      onPause: () => setIsPaused(true),
      onResume: () => setIsPaused(false)
    });
  };

  const handleSpeakSingleTask = (task: Task) => {
    const taskTitle = language === 'hi' ? task.titleHi : language === 'kn' ? task.titleKn : task.title;
    const text = language === 'hi' 
      ? `कार्य: ${taskTitle}। ${task.description}। स्थिति: ${task.completed ? 'पूर्ण' : 'लंबित'}। ${task.urgent ? 'यह एक ज़रूरी कार्य है।' : ''}`
      : language === 'kn'
        ? `ಕಾರ್ಯ: ${taskTitle}. ${task.description}. ಸ್ಥಿತಿ: ${task.completed ? 'ಪೂರ್ಣಗೊಂಡಿದೆ' : 'ಬಾಕಿ ಇದೆ'}. ${task.urgent ? 'ಇದು ತುರ್ತು ಕಾರ್ಯವಾಗಿದೆ.' : ''}`
        : `Task: ${task.title}. ${task.description}. Status: ${task.completed ? 'Completed' : 'Pending'}. ${task.urgent ? 'This is marked as urgent.' : ''}`;

    speechService.speak(text, language, {
      onStart: () => { setIsSpeaking(true); setIsPaused(false); },
      onEnd: () => { setIsSpeaking(false); setIsPaused(false); },
      onError: () => { setIsSpeaking(false); setIsPaused(false); }
    });
  };

  const handleStopSpeech = () => {
    speechService.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  useEffect(() => {
    if (latitude && longitude) {
      const fetchWeather = async () => {
        try {
          const [current, forecastData] = await Promise.all([
            getRealTimeWeather(latitude, longitude),
            getWeatherForecast(latitude, longitude)
          ]);
          setWeather(current);
          setForecast(forecastData);
        } catch (error) {
          console.error("Weather fetch failed:", error);
        } finally {
          setWeatherLoading(false);
          setForecastLoading(false);
        }
      };
      fetchWeather();
    } else if (!locationLoading && locationError) {
      setWeatherLoading(false);
      setForecastLoading(false);
    }
  }, [latitude, longitude, locationLoading, locationError]);

  const filteredTasks = tasks.filter(task => {
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'completed' ? task.completed : !task.completed);
    const urgencyMatch = urgencyFilter === 'all' || 
      (urgencyFilter === 'urgent' ? task.urgent : !task.urgent);
    return statusMatch && urgencyMatch;
  });

  const currentMonth = new Date().toLocaleString('default', { month: 'short' });
  const months = [];
  for (let i = -2; i <= 2; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    months.push({
      name: d.toLocaleString('default', { month: 'short' }),
      day: String(d.getDate()).padStart(2, '0')
    });
  }

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('sun') || c.includes('clear')) return '☀️';
    if (c.includes('cloud')) return '☁️';
    if (c.includes('rain')) return '🌧️';
    if (c.includes('storm')) return '⛈️';
    return '☀️';
  };

  return (
    <div className="flex flex-col min-h-screen bg-white w-full overflow-x-hidden shadow-2xl">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-20 pb-4 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="bg-[#E8F5E9] p-2.5 rounded-2xl text-[#1B5E20] shadow-sm">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight text-earth">AgroCare AI</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Smart Farming Assistant</p>
          </div>
        </div>
        <button className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 text-earth hover:bg-gray-100 transition-colors border border-gray-100 shadow-sm">
          <Bell size={22} />
        </button>
      </header>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 p-5 pb-32">
        <div className="space-y-6">
          {/* Weather Widget */}
          <div>
            <div className="bg-white rounded-[32px] p-6 shadow-xl border-[6px] border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-50 to-transparent opacity-50"></div>
              
              {weatherLoading ? (
                <div className="flex items-center justify-center py-4 gap-3">
                  <Loader2 className="animate-spin text-[#1B5E20]" size={24} />
                  <span className="text-sm font-bold text-gray-400">Updating weather...</span>
                </div>
              ) : (
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                      {weather ? weather.location : 'Pune, India'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-earth tracking-tighter">
                        {weather ? Math.round(weather.temp) : '28'}°C
                      </span>
                      <span className="text-sm font-bold text-gray-400">
                        {weather ? weather.condition : 'Sunny'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className="text-5xl drop-shadow-md">
                      {weather ? getWeatherIcon(weather.condition) : '☀️'}
                    </span>
                    <span className="text-[10px] font-black text-[#1B5E20] bg-[#E8F5E9] px-3 py-1.5 rounded-full border border-[#A5D6A7] shadow-sm uppercase tracking-wider">
                      Good for Sowing
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Weather Forecast */}
          <WeatherForecast forecast={forecast} loading={forecastLoading} onAddTask={onAddTask} />

          {/* Month Selector */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-earth tracking-tight">
                Select Month <span className="text-sm font-bold text-gray-400 ml-1">/ {language === 'hi' ? 'महीना चुनें' : language === 'kn' ? 'ತಿಂಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'Select Month'}</span>
              </h2>
              <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                <CalendarIcon size={20} />
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {months.map((m, i) => (
                <button 
                  key={m.name}
                  className={`flex flex-col items-center justify-center min-w-[4.5rem] h-20 rounded-[24px] border-2 transition-all shrink-0 ${
                    m.name === currentMonth 
                      ? 'bg-[#1B5E20] text-white border-[#1B5E20] shadow-xl shadow-green-900/20 scale-105' 
                      : 'border-gray-100 bg-gray-50 text-gray-400'
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${m.name === currentMonth ? 'text-green-200' : 'text-gray-400'}`}>{m.name}</span>
                  <span className={`text-xl font-black ${m.name === currentMonth ? 'text-white' : 'text-gray-300'}`}>{m.day}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recommended Crops */}
          <div>
            <h2 className="text-lg font-black text-earth tracking-tight mb-4">
              Recommended Crops <span className="block text-sm font-bold text-gray-400 tracking-normal">{language === 'hi' ? 'इस महीने के लिए सर्वश्रेष्ठ फसलें' : language === 'kn' ? 'ಈ ತಿಂಗಳ ಅತ್ಯುತ್ತಮ ಬೆಳೆಗಳು' : 'Best crops for this month'}</span>
            </h2>
            <div className="flex flex-col gap-4">
              {RECOMMENDED_CROPS.map((crop, index) => (
                <motion.div 
                  key={crop.id} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex items-center bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className={`absolute right-0 top-0 w-32 h-full bg-gradient-to-l ${crop.color === 'orange' ? 'from-orange-50' : 'from-yellow-50'} to-transparent opacity-60`}></div>
                  <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mr-4 shrink-0 shadow-inner ${crop.color === 'orange' ? 'bg-orange-100' : 'bg-yellow-100'}`}>
                    <span className="text-3xl">{crop.icon}</span>
                  </div>
                  <div className="flex-1 relative z-10 w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black text-lg text-earth leading-tight">
                          {crop.name} 
                          <span className="text-xs font-bold text-gray-400 ml-1">
                            ({language === 'hi' ? crop.nameHi : language === 'kn' ? crop.nameKn : crop.name})
                          </span>
                        </h3>
                        <p className={`text-[10px] font-black uppercase tracking-wider mt-1.5 px-2 py-0.5 rounded-md inline-block ${crop.color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-yellow-50 text-yellow-600'}`}>{crop.status}</p>
                      </div>
                      <ChevronRight className="text-gray-300" size={20} />
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-4">
                      <div className="flex items-start gap-2">
                        <div className="bg-gray-50 p-1.5 rounded-lg text-gray-400 mt-0.5">
                          <Sprout size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest">Planting</span>
                          <span className="text-xs font-bold text-earth">{crop.planting}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="bg-gray-50 p-1.5 rounded-lg text-gray-400 mt-0.5">
                          <CalendarIcon size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest">Harvest</span>
                          <span className="text-xs font-bold text-earth">{crop.harvest}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-[9px] uppercase font-black text-[#1B5E20] bg-[#E8F5E9] px-2 py-0.5 rounded tracking-widest inline-flex items-center gap-1 mb-1.5">
                        Action for {currentMonth}
                      </span>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        {language === 'hi' ? crop.actionHi : language === 'kn' ? crop.actionKn : crop.actionEn}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-black text-earth tracking-tight flex items-center gap-2">
                <span>Tasks for Today</span>
                {tasks.some(t => !t.completed && t.urgent) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200 animate-pulse">
                    Urgent Pending
                  </span>
                )}
              </h2>
              <span className="text-xs font-bold text-gray-400">
                {language === 'hi' ? 'आज के कार्य' : language === 'kn' ? 'ಇಂದಿನ ಕೆಲಸಗಳು' : "Today's farm tasks"}
              </span>
            </div>

            {/* Voice Audio Readout & Voice Note Actions */}
            <div className="flex items-center gap-2">
              {/* Add Voice Note Button */}
              <button
                onClick={() => {
                  handleStopSpeech();
                  setIsVoiceModalOpen(true);
                }}
                className="px-3 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                title="Add task via voice"
              >
                <Mic size={14} />
                <span>{language === 'hi' ? 'वॉइस नोट' : language === 'kn' ? 'ಧ್ವನಿ ನೋಟ್' : 'Voice Note'}</span>
              </button>

              {!isSpeaking ? (
                <button 
                  onClick={handleSpeakAllUrgent}
                  className="px-3.5 py-2 rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-black shadow-md shadow-green-900/15 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                  title="Read aloud urgent tasks"
                >
                  <Volume2 size={15} />
                  <span>{language === 'hi' ? 'ज़रूरी कार्य सुनें' : language === 'kn' ? 'ತುರ್ತು ಕಾರ್ಯ ಆಲಿಸಿ' : 'Hear Urgent Tasks'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-emerald-950 text-white px-3 py-1.5 rounded-2xl shadow-md border border-emerald-500/30">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{isPaused ? 'Paused' : 'Speaking...'}</span>
                  </span>
                  <button
                    onClick={isPaused ? () => { speechService.resume(); setIsPaused(false); } : () => { speechService.pause(); setIsPaused(true); }}
                    className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer ml-1"
                    title={isPaused ? "Resume" : "Pause"}
                  >
                    {isPaused ? <Play size={13} className="fill-current" /> : <Pause size={13} />}
                  </button>
                  <button
                    onClick={handleStopSpeech}
                    className="p-1 rounded-lg hover:bg-white/20 text-red-300 hover:text-red-200 cursor-pointer"
                    title="Stop Voice"
                  >
                    <Square size={13} className="fill-current" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* New Filter Options */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter by Status</span>
              <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl w-fit">
                {(['all', 'completed', 'incomplete'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                      statusFilter === s ? 'bg-white text-[#1B5E20] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter by Urgency</span>
              <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl w-fit">
                {(['all', 'urgent', 'normal'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUrgencyFilter(u)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                      urgencyFilter === u ? 'bg-white text-[#1B5E20] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, index) => (
                <motion.div 
                  layout
                  key={task.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-start p-5 rounded-[28px] border transition-all group ${task.urgent ? 'border-l-[6px] border-l-red-500 bg-red-50/30' : 'border-gray-100 bg-white shadow-sm'}`}
                >
                  <label className="relative flex items-center justify-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => onToggleTask(task.id)}
                      className="w-6 h-6 rounded-lg border-2 border-gray-200 text-[#1B5E20] focus:ring-[#1B5E20] transition-all cursor-pointer"
                    />
                    {task.completed && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute pointer-events-none"
                      >
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </motion.div>
                    )}
                  </label>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className={`p-2 rounded-xl shadow-sm transition-transform group-active:scale-90 ${
                        task.color === 'blue' ? 'bg-blue-100 text-blue-600' : 
                        task.color === 'red' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {task.icon === 'Droplets' ? <Droplets size={18} /> : 
                         task.icon === 'Bug' ? <Bug size={18} /> : 
                         task.icon === 'ShieldCheck' ? <Info size={18} /> : <Sprout size={18} />}
                      </div>
                      <span className={`text-base font-black text-earth tracking-tight transition-all ${task.completed ? 'line-through opacity-40' : ''}`}>
                        {language === 'hi' ? task.titleHi : language === 'kn' ? task.titleKn : task.title}
                      </span>
                    </div>
                    <p className={`text-xs text-gray-500 leading-relaxed transition-all ${task.completed ? 'opacity-40' : ''}`}>{task.description}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 ml-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeakSingleTask(task);
                      }}
                      className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-earth border border-gray-200 transition-colors shadow-xs"
                      title="Read this task aloud"
                    >
                      <Volume2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleUrgentTask) onToggleUrgentTask(task.id);
                      }}
                      className={`text-[10px] px-2.5 py-1.5 rounded-lg font-black uppercase tracking-widest shadow-sm transition-colors border flex items-center gap-1 ${
                        task.urgent 
                          ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' 
                          : 'bg-white text-gray-400 border-gray-200 hover:text-red-500 hover:border-red-200'
                      }`}
                      title={task.urgent ? "Remove Urgent" : "Mark Urgent"}
                    >
                      <AlertTriangle size={12} className={task.urgent ? "text-white" : "text-gray-400"} />
                      Urgent
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-400">No tasks match your filters</p>
                <button 
                  onClick={() => { setStatusFilter('all'); setUrgencyFilter('all'); }}
                  className="mt-4 text-xs font-black text-primary underline"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Voice Task Recording Modal */}
      {onAddTask && (
        <VoiceTaskModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onAddTask={onAddTask}
          language={language}
        />
      )}
    </div>
  );
};
