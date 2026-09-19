import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, X, Navigation, Store, Calculator, RefreshCw } from 'lucide-react';
import { Language } from '../types';
import localMarketData from '../data/market_data.json';
import { useGeolocation } from '../hooks/useGeolocation';

interface ArbitrageAnalyzerProps {
  language: Language;
  onClose: () => void;
}

export const ArbitrageAnalyzer: React.FC<ArbitrageAnalyzerProps> = ({ language, onClose }) => {
  const [cropQuery, setCropQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { latitude, longitude, loading: locationLoading } = useGeolocation();
  
  const stateCoordinates: Record<string, {lat: number, lon: number}> = {
    "Karnataka": {lat: 15.3173, lon: 75.7139},
    "Tamil Nadu": {lat: 11.1271, lon: 78.6569},
    "Madhya Pradesh": {lat: 22.9734, lon: 78.6569},
    "Odisha": {lat: 20.9517, lon: 85.0985},
    "Haryana": {lat: 29.0588, lon: 76.0856},
    "Punjab": {lat: 31.1471, lon: 75.3412},
    "Jammu and Kashmir": {lat: 33.7782, lon: 76.5762},
    "Maharashtra": {lat: 19.7515, lon: 75.7139},
    "Gujarat": {lat: 22.2587, lon: 71.1924},
    "Kerala": {lat: 10.8505, lon: 76.2711},
    "Andhra Pradesh": {lat: 15.9129, lon: 79.7400},
    "Telangana": {lat: 18.1124, lon: 79.0193},
    "Uttar Pradesh": {lat: 26.8467, lon: 80.9462},
    "Rajasthan": {lat: 27.0238, lon: 74.2179},
  };

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  }

  const handleAnalyze = () => {
    if (!cropQuery) return;
    setAnalyzing(true);
    
    setTimeout(() => {
      const allRecords = localMarketData.records;
      const matchedRecords = allRecords.filter((r) => 
        r.commodity.toLowerCase().includes(cropQuery.toLowerCase())
      );
      
      const currentLat = latitude || 15.3173; 
      const currentLon = longitude || 75.7139;

      const processed = matchedRecords.map(record => {
        const destCoords = stateCoordinates[record.state] || {lat: 20.5937, lon: 78.9629}; 
        const dist = calculateDistance(currentLat, currentLon, destCoords.lat, destCoords.lon);
        
        const transportCostPerQuintal = dist * 2;
        const localAvg = matchedRecords.reduce((acc, r) => acc + r.modal_price, 0) / (matchedRecords.length || 1);
        const buyPrice = localAvg * 0.8; 
        const netProfitPerQuintal = record.modal_price - buyPrice - transportCostPerQuintal;

        return {
          ...record,
          distance: dist,
          transportCost: transportCostPerQuintal,
          estimatedBuyPrice: buyPrice,
          netProfit: netProfitPerQuintal,
        };
      });

      processed.sort((a, b) => b.modal_price - a.modal_price);
      
      setResults(processed);
      setHasSearched(true);
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
    >
      <motion.div 
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-white w-full sm:max-w-xl sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Calculator size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 leading-tight">Arbitrage Analyzer</h2>
              <p className="text-xs text-gray-500 font-medium">Find the most profitable market</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 bg-gray-50/30">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Crop Name</label>
              <div className="relative flex items-center">
                <Search className="absolute left-4 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={cropQuery}
                  onChange={(e) => setCropQuery(e.target.value)}
                  placeholder="e.g. Potato, Tomato, Soybean..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400 placeholder:font-normal outline-none shadow-sm"
                />
              </div>
            </div>
            
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>Current Location</span>
                {locationLoading && <RefreshCw size={12} className="animate-spin text-orange-500" />}
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-4 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder={latitude ? "Using GPS Location" : "e.g. Karnataka, Tumkur..."}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400 placeholder:font-normal outline-none shadow-sm"
                />
              </div>
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={!cropQuery || analyzing}
              className="w-full bg-earth text-white rounded-xl py-3.5 font-bold shadow-lg shadow-earth/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 hover:bg-[#2b3a24] transition-colors active:scale-[0.98]"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="animate-spin" size={18} /> Analyzing Markets...
                </>
              ) : (
                'Analyze Best Markets'
              )}
            </button>
          </div>

          <div className="flex-1">
            {hasSearched && results.length === 0 && !analyzing && (
              <div className="h-40 flex flex-col items-center justify-center text-center text-gray-500">
                <Store size={32} className="text-gray-300 mb-3" />
                <p className="font-medium text-gray-600">No market data found for "{cropQuery}"</p>
                <p className="text-sm mt-1">Try another crop name.</p>
              </div>
            )}

            {hasSearched && results.length > 0 && !analyzing && (
              <div className="flex flex-col gap-4 pb-10">
                <h3 className="font-black text-gray-900 border-b border-gray-200 pb-2 text-sm uppercase tracking-wide">
                  Top Markets for <span className="text-orange-600 capitalize">{cropQuery}</span>
                </h3>
                
                {results.map((result, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className={`bg-white rounded-2xl overflow-hidden p-5 ${idx === 0 ? 'border border-orange-200 shadow-xl shadow-orange-100/50 relative' : 'border border-gray-100 shadow-sm'}`}
                  >
                    {idx === 0 && (
                      <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-bl-xl">
                        Highest Price
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-5">
                      <div className={idx === 0 ? "pt-1" : ""}>
                        <h4 className="font-black tracking-tight text-gray-900 text-lg flex items-center gap-2">
                          <Store size={18} className={idx === 0 ? "text-orange-500" : "text-gray-400"} />
                          {result.market}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                          {result.district}, {result.state}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-2xl text-earth">₹{result.modal_price}</div>
                        <div className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">per quintal</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-y-4 gap-x-2 text-sm border border-gray-100">
                      <div>
                        <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1 shadow-sm">Est. Distance</div>
                        <div className="font-bold text-gray-700 flex items-center gap-1.5">
                          <Navigation size={14} className="text-indigo-400" />
                          {result.distance} km
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Transport Cost</div>
                        <div className="font-bold text-orange-600">- ₹{result.transportCost}</div>
                      </div>
                      <div className="col-span-2 pt-3 border-t border-gray-200/60 mt-1">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Est. Arbitrage Profit</div>
                          <div className={`font-black text-lg ${result.netProfit > 0 ? 'text-[#1B5E20]' : 'text-gray-600'}`}>
                            {result.netProfit > 0 ? '+' : ''}₹{Math.round(result.netProfit)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
