import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Droplets, Leaf, Beaker, Sprout, AlertCircle, CheckCircle2, Loader2, Info, Sparkles, MessageSquare, Send, X, Globe, HelpCircle, PackageCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { analyzeSoil, SoilData, SoilAnalysisResult } from '../services/gemini';
import { chatWithModelRouter, subscribeToModelStatus, ModelStatus } from '../services/gemma';
import { useConnectivity } from '../services/connectivity';
import { getProductDetails } from '../utils/productImages';

interface SoilAnalysisProps {
  onBack: () => void;
  language: Language;
}

export const SoilAnalysis: React.FC<SoilAnalysisProps> = ({ onBack, language }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoilAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<SoilData>({
    n: 50,
    p: 30,
    k: 40,
    ph: 6.5,
    type: 'Loam',
    moisture: 40,
  });

  const isOnline = useConnectivity();
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    model: 'gemini',
    isFallback: false,
    isOnline: isOnline
  });

  // States for Fertilizer AI Assistant
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswering, setAiAnswering] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [activeCropContext, setActiveCropContext] = useState<string | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const assistantRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToModelStatus((status) => {
      setModelStatus(status);
    });
    return unsubscribe;
  }, []);

  const handleAskFertilizerAI = async (questionText: string) => {
    if (!questionText.trim() || !result) return;
    
    setAiAnswering(true);
    setAiError(null);
    setAiResponse(null);
    setAssistantOpen(true);
    
    // Auto-scroll to the assistant panel
    setTimeout(() => {
      assistantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    const contextPrompt = `
[SOIL TEST REPORT CONTEXT]
- Soil Type: ${formData.type}
- pH Level: ${formData.ph}
- Nitrogen (N): ${formData.n} ppm
- Phosphorus (P): ${formData.p} ppm
- Potassium (K): ${formData.k} ppm
- Moisture: ${formData.moisture}%
- Overall Status: ${result.status}
- Suitable Crops: ${result.suitableCrops.join(', ')}

[USER QUESTION]
${activeCropContext ? `Regarding crop "${activeCropContext}": ` : ''}${questionText}

Please provide concise, practical, action-oriented, and direct agricultural advice regarding this fertilizer question or the crops listed. Keep it under 4 paragraphs. Answer in ${language === 'hi' ? 'Hindi' : language === 'kn' ? 'Kannada' : 'English'}.
`;

    try {
      const answer = await chatWithModelRouter(contextPrompt, [], language);
      setAiResponse(answer);
    } catch (err: any) {
      console.error("Fertilizer AI inquiry failed:", err);
      setAiError("Unable to get an answer at the moment. Please try again.");
    } finally {
      setAiAnswering(false);
    }
  };

  const t = {
    title: {
      en: "Ask AgroCare AI about Fertilizer",
      hi: "खाद के बारे में एआई से पूछें",
      kn: "ಗೊಬ್ಬರದ ಬಗ್ಗೆ ಎಐ ಬಳಿ ಕೇಳಿ"
    },
    subtitle: {
      en: "Ask questions about crop nutrition, organic alternatives, or application methods.",
      hi: "फसल पोषण, जैविक विकल्पों या उपयोग के तरीकों के बारे में सवाल पूछें।",
      kn: "ಬೆಳೆ ಪೋಷಣೆ, ಸಾವಯವ ಪರ್ಯಾಯಗಳು ಅಥವಾ ಬಳಸುವ ವಿಧಾನಗಳ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ."
    },
    inputPlaceholder: {
      en: "Ask about organic compost, urea, dosage...",
      hi: "जैविक खाद, यूरिया, मात्रा आदि के बारे में पूछें...",
      kn: "ಸಾವಯವ ಗೊಬ್ಬರ, ಯೂರಿಯಾ, ಪ್ರಮಾಣದ ಬಗ್ಗೆ ಕೇಳಿ..."
    },
    askButton: {
      en: "Ask AI",
      hi: "पूछें",
      kn: "ಕೇಳಿ"
    },
    presetOrganic: {
      en: "What is a natural alternative to chemical fertilizers?",
      hi: "रासायनिक उर्वरकों का प्राकृतिक विकल्प क्या है?",
      kn: "ರಾಸಾಯನಿಕ ಗೊಬ್ಬರಗಳಿಗೆ ನೈಸರ್ಗಿಕ ಪರ್ಯಾಯ ಯಾವುದು?"
    },
    presetHowTo: {
      en: "How do I naturally balance high/low soil pH?",
      hi: "मिट्टी के पीएच (pH) को प्राकृतिक रूप से कैसे संतुलित करें?",
      kn: "ಮಣ್ಣಿನ ಪಿಎಚ್ (pH) ಅನ್ನು ನೈಸರ್ಗಿಕವಾಗಿ ಸಮತೋಲನಗೊಳಿಸುವುದು ಹೇಗೆ?"
    },
    presetTiming: {
      en: "Should I apply fertilizer before or after sowing?",
      hi: "बुवाई से पहले या बाद में खाद का प्रयोग करना चाहिए?",
      kn: "ಬಿತ್ತನೆಗೆ ಮುಂಚಿತವಾಗಿ ಅಥವಾ ನಂತರ ಗೊಬ್ಬರವನ್ನು ಹಾಕಬೇಕೇ?"
    },
    activeContext: {
      en: "Focusing on",
      hi: "ध्यान केंद्रित",
      kn: "ಗಮನ"
    },
    clearContext: {
      en: "Clear",
      hi: "हटाएं",
      kn: "ಅಳಿಸಿ"
    },
    answering: {
      en: "AI is thinking...",
      hi: "एआई सोच रहा है...",
      kn: "ಎಐ ಯೋಚಿಸುತ್ತಿದೆ..."
    },
    geminiCloud: {
      en: "Gemini Cloud Active",
      hi: "जेमिनी क्लाउड सक्रिय",
      kn: "ಜಮಿನಿ ಕ್ಲೌಡ್ ಸಕ್ರಿಯ"
    },
    gemmaEdge: {
      en: "Gemma Edge Active (Offline)",
      hi: "जेम्मा एआई सक्रिय (ऑफ़लाइन)",
      kn: "ಜೆಮ್ಮಾ ಎಐ ಸಕ್ರಿಯ (ಆಫ್‌ಲೈನ್)"
    }
  };

  const soilTypes = ['Sandy', 'Clay', 'Loam', 'Silt', 'Peaty', 'Chalky'];

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeSoil(formData);
      setResult(analysis);
    } catch (err) {
      console.error("Soil analysis failed:", err);
      setError("Failed to analyze soil data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'Good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full overflow-x-hidden shadow-2xl">
      {/* Header */}
      <header className="flex items-center px-5 pt-20 pb-4 bg-white sticky top-0 z-20 shadow-sm">
        <button onClick={onBack} className="bg-[#E8F5E9] p-2.5 rounded-2xl text-[#1B5E20] shadow-sm mr-4">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight text-earth">Soil Analysis</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Test & Recommendations</p>
        </div>
      </header>

      <main className="flex-1 p-5 overflow-y-auto pb-24 lg:p-8">
        <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10"
            >
              <div className="space-y-6">
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                <h2 className="text-lg font-black text-earth mb-4 flex items-center gap-2">
                  <Beaker className="text-[#1B5E20]" size={20} />
                  Enter Soil Data
                </h2>
                
                <div className="space-y-5">
                  {/* NPK Inputs */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Nitrogen (N)</label>
                      <input 
                        type="number" 
                        value={formData.n}
                        onChange={(e) => setFormData({...formData, n: Number(e.target.value)})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-earth focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Phosphorus (P)</label>
                      <input 
                        type="number" 
                        value={formData.p}
                        onChange={(e) => setFormData({...formData, p: Number(e.target.value)})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-earth focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Potassium (K)</label>
                      <input 
                        type="number" 
                        value={formData.k}
                        onChange={(e) => setFormData({...formData, k: Number(e.target.value)})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-earth focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                      />
                    </div>
                  </div>

                  {/* pH & Moisture */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">pH Level</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" 
                          min="0" max="14" step="0.1"
                          value={formData.ph}
                          onChange={(e) => setFormData({...formData, ph: Number(e.target.value)})}
                          className="w-full accent-[#1B5E20]"
                        />
                        <span className="text-sm font-black text-earth w-8">{formData.ph}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Moisture (%)</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" 
                          min="0" max="100" step="1"
                          value={formData.moisture}
                          onChange={(e) => setFormData({...formData, moisture: Number(e.target.value)})}
                          className="w-full accent-blue-500"
                        />
                        <span className="text-sm font-black text-earth w-8">{formData.moisture}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Soil Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">Soil Type</label>
                    <div className="flex flex-wrap gap-2">
                      {soilTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => setFormData({...formData, type})}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            formData.type === type 
                              ? 'bg-[#1B5E20] text-white shadow-md' 
                              : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full mt-6 bg-[#1B5E20] text-white font-black py-4 rounded-2xl shadow-lg shadow-green-900/20 hover:bg-[#144d18] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Analyzing Soil...
                    </>
                  ) : (
                    <>
                      <Leaf size={20} />
                      Analyze Soil
                    </>
                  )}
                </button>
              </div>
              
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex gap-3">
                <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
                <p className="text-xs text-blue-800 font-medium leading-relaxed">
                  Enter the values from your latest soil test report. If you don't have exact numbers, you can estimate or use a basic home testing kit.
                </p>
              </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10"
            >
              <div className="space-y-4">
              {/* Overall Status */}
              <div className={`p-6 rounded-[32px] border-2 ${getStatusColor(result.status)}`}>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-sm font-black uppercase tracking-widest opacity-80">Overall Health</h2>
                  {result.status === 'Excellent' || result.status === 'Good' ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <AlertCircle size={24} />
                  )}
                </div>
                <p className="text-4xl font-black tracking-tight">{result.status}</p>
              </div>

              {/* Analysis Cards */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Beaker size={16} className="text-purple-500" />
                    pH Analysis
                  </h3>
                  <p className="text-earth font-medium text-sm leading-relaxed">{result.phAnalysis}</p>
                </div>

                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Leaf size={16} className="text-green-500" />
                    NPK Analysis
                  </h3>
                  <p className="text-earth font-medium text-sm leading-relaxed">{result.npkAnalysis}</p>
                </div>

                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Droplets size={16} className="text-blue-500" />
                    Fertilizer Advice
                  </h3>
                  <p className="text-earth font-medium text-sm leading-relaxed">{result.fertilizerAdvice}</p>
                </div>
              </div>
              </div>
              <div className="space-y-4">

              {/* Recommendations */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Action Plan</h3>
                <ul className="space-y-3">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-earth font-medium leading-relaxed">{rec}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suitable Crops */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Sprout size={16} className="text-[#1B5E20]" />
                  Suitable Crops
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.suitableCrops.map((crop, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-[#E8F5E9] text-[#1B5E20] rounded-lg text-sm font-bold border border-[#A5D6A7]">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>

              {/* Crop Fertilizer Recommendations */}
              {result.cropFertilizerRecommendations && result.cropFertilizerRecommendations.length > 0 && (
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Droplets size={16} className="text-blue-500" />
                      Crop-Specific Fertilizer Guide
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                      <PackageCheck size={12} /> Real Product Pack
                    </span>
                  </h3>
                  <div className="space-y-4">
                    {result.cropFertilizerRecommendations.map((rec, idx) => {
                      const prod = getProductDetails(rec.type, rec.type.toLowerCase().includes('compost') || rec.type.toLowerCase().includes('organic'));
                      return (
                        <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-4">
                          <div className="shrink-0 self-center sm:self-start">
                            <img 
                              src={prod.imageUrl} 
                              alt={rec.type}
                              className="w-20 h-20 rounded-xl object-cover ring-1 ring-gray-200 shadow-xs"
                              referrerPolicy="no-referrer"
                            />
                            <span className="block text-center text-[9px] font-bold text-gray-500 mt-1">
                              {prod.packagingSize}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h4 className="font-black text-earth text-base">{rec.crop}</h4>
                                <p className="text-xs font-bold text-emerald-800">{rec.type} ({prod.brand})</p>
                              </div>
                              <button
                                onClick={() => {
                                  setActiveCropContext(rec.crop);
                                  handleAskFertilizerAI(language === 'hi' ? `${rec.crop} के लिए जैविक खाद और छिड़काव की सर्वोत्तम विधि क्या है?` : language === 'kn' ? `${rec.crop} ಬೆಳೆಗೆ ಸಾವಯವ ಗೊಬ್ಬರ ಮತ್ತು ಉತ್ತಮ ಸಿಂಪರಣಾ ವಿಧಾನ ಯಾವುದು?` : `What is the best organic substitute and application technique for ${rec.crop}?`);
                                }}
                                className="text-xs font-bold text-[#1B5E20] hover:text-[#144d18] flex items-center gap-1 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-all border border-green-100"
                              >
                                <Sparkles size={11} className="animate-pulse" />
                                {language === 'hi' ? 'पूछें' : language === 'kn' ? 'ಕೇಳಿ' : 'Ask AI'}
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                                <span className="block text-[9px] font-black text-blue-500 uppercase tracking-widest">Qty / Acre</span>
                                <span className="block text-blue-900 font-bold text-xs">{rec.quantityPerAcre}</span>
                              </div>
                              <div className="bg-green-50 p-2.5 rounded-xl border border-green-100">
                                <span className="block text-[9px] font-black text-green-600 uppercase tracking-widest">Frequency</span>
                                <span className="block text-green-900 font-bold text-xs">{rec.frequency}</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-2 font-medium">
                              <span className="font-bold text-gray-700">Method: </span>{rec.applicationMethod}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Interactive Fertilizer Assistant */}
              <div ref={assistantRef} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-50 rounded-xl text-[#1B5E20]">
                      <Sparkles size={20} className="animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-earth tracking-tight">
                        {t.title[language]}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {modelStatus.model === 'gemini' ? t.geminiCloud[language] : t.gemmaEdge[language]}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs font-bold bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                    <span className="text-gray-500 uppercase text-[9px] tracking-wider">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  {t.subtitle[language]}
                </p>

                {/* Preset Suggestions */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {/* If there is active crop context, show context badge */}
                    {activeCropContext && (
                      <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-black px-2.5 py-1.5 rounded-xl border border-green-200">
                        <Leaf size={12} />
                        {t.activeContext[language]}: {activeCropContext}
                        <button 
                          onClick={() => setActiveCropContext(null)} 
                          className="hover:bg-green-200/50 p-0.5 rounded-full text-green-900 ml-1"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}

                    <button
                      onClick={() => handleAskFertilizerAI(activeCropContext ? (language === 'hi' ? `${activeCropContext} के लिए प्राकृतिक/जैविक खाद का उपयोग कैसे करें?` : language === 'kn' ? `${activeCropContext} ಬೆಳೆಗೆ ಸಾವಯವ ಗೊಬ್ಬರವನ್ನು ಹೇಗೆ ಬಳಸುವುದು?` : `How do I apply organic fertilizers for ${activeCropContext}?`) : t.presetOrganic[language])}
                      className="text-xs text-gray-600 hover:text-earth bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-xl font-bold transition-all text-left"
                    >
                      {activeCropContext 
                        ? (language === 'hi' ? `${activeCropContext} के लिए जैविक खाद कैसे उपयोग करें?` : language === 'kn' ? `${activeCropContext} ಸಾವಯವ ಗೊಬ್ಬರ ಬಳಕೆ ಹೇಗೆ?` : `How to apply organic for ${activeCropContext}?`)
                        : t.presetOrganic[language]}
                    </button>

                    <button
                      onClick={() => handleAskFertilizerAI(activeCropContext ? (language === 'hi' ? `क्या ${activeCropContext} के लिए नीमअस्त्र और नीम तेल सुरक्षित है?` : language === 'kn' ? `${activeCropContext} ಬೆಳೆಗೆ ಬೇವಿನ ಕಷಾಯ ಸುರಕ್ಷಿತವೇ?` : `Is neem extract safe for ${activeCropContext}?`) : t.presetHowTo[language])}
                      className="text-xs text-gray-600 hover:text-earth bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-xl font-bold transition-all text-left"
                    >
                      {activeCropContext 
                        ? (language === 'hi' ? `${activeCropContext} के लिए नीमअस्त्र सुरक्षित है?` : language === 'kn' ? `${activeCropContext} ಬೆಳೆಗೆ ಬೇವಿನ ಕಷಾಯ ಬಳಸಬಹುದೇ?` : `Is neem cake safe for ${activeCropContext}?`)
                        : t.presetHowTo[language]}
                    </button>

                    <button
                      onClick={() => handleAskFertilizerAI(t.presetTiming[language])}
                      className="text-xs text-gray-600 hover:text-earth bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-xl font-bold transition-all text-left"
                    >
                      {t.presetTiming[language]}
                    </button>
                  </div>
                </div>

                {/* AI Loading & Response Pane */}
                <AnimatePresence mode="wait">
                  {aiAnswering && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-[#E8F5E9] p-4 rounded-2xl border border-[#A5D6A7] flex items-center gap-3"
                    >
                      <Loader2 className="animate-spin text-[#1B5E20]" size={18} />
                      <span className="text-xs font-black text-[#1B5E20]">{t.answering[language]}</span>
                    </motion.div>
                  )}

                  {aiResponse && !aiAnswering && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 relative"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
                        <span className="text-[10px] font-black text-[#1B5E20] uppercase tracking-widest flex items-center gap-1">
                          <Sparkles size={12} />
                          AgroCare AI Advisor
                        </span>
                        <button 
                          onClick={() => setAiResponse(null)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200/50 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="text-sm text-earth font-medium leading-relaxed whitespace-pre-line prose max-w-none">
                        {aiResponse}
                      </div>
                    </motion.div>
                  )}

                  {aiError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100"
                    >
                      <AlertCircle size={14} />
                      {aiError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Custom Question Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskFertilizerAI(aiQuestion);
                    setAiQuestion('');
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder={t.inputPlaceholder[language]}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-earth focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20] placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={!aiQuestion.trim() || aiAnswering}
                    className="bg-[#1B5E20] text-white p-2.5 rounded-xl hover:bg-[#144d18] transition-all disabled:opacity-50 flex items-center justify-center shrink-0 shadow-md shadow-green-900/10"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>

              <button
                onClick={() => setResult(null)}
                className="w-full mt-4 bg-white text-earth border-2 border-gray-200 font-black py-4 rounded-2xl hover:bg-gray-50 transition-all"
              >
                Test Another Sample
              </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
