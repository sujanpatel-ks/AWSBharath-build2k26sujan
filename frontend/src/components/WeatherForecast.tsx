import React, { useState } from 'react';
import { CloudRain, Sun, Cloud, Wind, Thermometer, Info, ChevronRight, Calendar, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { ForecastDay } from '../services/gemini';
import { Task } from '../types';

interface WeatherForecastProps {
  forecast: ForecastDay[];
  loading: boolean;
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
}

export const WeatherForecast: React.FC<WeatherForecastProps> = ({ forecast, loading, onAddTask }) => {
  const [addedTasks, setAddedTasks] = useState<Set<number>>(new Set());

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('sun') || c.includes('clear')) return <Sun className="text-yellow-500" size={24} />;
    if (c.includes('cloud')) return <Cloud className="text-gray-400" size={24} />;
    if (c.includes('rain')) return <CloudRain className="text-blue-500" size={24} />;
    if (c.includes('wind')) return <Wind className="text-blue-300" size={24} />;
    return <Sun className="text-yellow-500" size={24} />;
  };

  const handleAddTaskClick = (day: ForecastDay, index: number) => {
    const taskTitle = day.rainChance > 50 ? 'Prepare for rain' : `Weather Task: ${day.day}`;
    onAddTask({
      title: taskTitle,
      titleHi: day.rainChance > 50 ? 'बारिश की तैयारी करें' : `मौसम कार्य: ${day.day}`,
      titleKn: day.rainChance > 50 ? 'ಮಳೆಗೆ ಸಿದ್ಧರಾಗಿ' : `ಹವಾಮಾನ ಕಾರ್ಯ: ${day.day}`,
      description: day.advice,
      icon: day.rainChance > 50 ? 'CloudRain' : 'Sun',
      color: day.rainChance > 50 ? 'blue' : 'yellow',
    });
    setAddedTasks(prev => new Set(prev).add(index));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-3 w-full bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!forecast || forecast.length === 0) return null;

  return (
    <section className="px-5 mb-10">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-black text-earth tracking-tight">Weather Forecast</h2>
        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <Info size={12} />
          <span>5-Day Outlook</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {forecast.map((day, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 group hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  {getWeatherIcon(day.condition)}
                </div>
                <div>
                  <p className="font-black text-earth text-lg leading-none">{day.day}</p>
                  <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">{day.condition}</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-lg font-black text-earth">{day.tempMax}°</span>
                  <span className="text-sm font-bold text-gray-400">{day.tempMin}°</span>
                </div>
                <div className="flex items-center gap-1 justify-end mt-1">
                  <CloudRain size={12} className="text-blue-400" />
                  <span className="text-[10px] font-bold text-blue-500">{day.rainChance}% Rain</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-1 bg-green-50/50 rounded-2xl p-3 border border-green-100/50 flex items-start gap-3">
                <div className="bg-green-100 p-1.5 rounded-lg text-green-700 shrink-0">
                  <Info size={14} />
                </div>
                <p className="text-xs text-green-800 font-medium leading-relaxed">
                  {day.advice}
                </p>
              </div>
              <button 
                onClick={() => handleAddTaskClick(day, i)}
                disabled={addedTasks.has(i)}
                className={`mt-1 p-3 rounded-2xl transition-all shadow-sm ${
                  addedTasks.has(i) 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-white text-primary border border-gray-100 hover:bg-primary hover:text-white'
                }`}
                title="Add to Calendar"
              >
                {addedTasks.has(i) ? <Check size={18} /> : <Calendar size={18} />}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
