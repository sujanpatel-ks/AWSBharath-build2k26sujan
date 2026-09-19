import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Bell, Search, Mic, MapPin, Wheat, Heart, TrendingUp, TrendingDown, Minus, Store, Filter, X, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { toast } from 'sonner';
import { CropPrice, Language } from '../types';
import { fetchKarnatakaMarketPrices } from '../services/marketApi';
import { useTranslation } from 'react-i18next';
import { ArbitrageAnalyzer } from './ArbitrageAnalyzer';

const WATCHLIST_CROPS = [
  { id: 'w1', name: 'Wheat', nameHi: 'गेहूं', price: 2250, change: 45, changePercent: 2.0, trend: 'up', icon: '🌾' },
  { id: 'w2', name: 'Soybean', nameHi: 'सोयाबीन', price: 4800, change: -120, changePercent: -2.4, trend: 'down', icon: '🫘' },
  { id: 'w3', name: 'Onion', nameHi: 'प्याज', price: 1800, change: 150, changePercent: 9.1, trend: 'up', icon: '🧅' },
  { id: 'w4', name: 'Potato', nameHi: 'आलू', price: 1200, change: 20, changePercent: 1.6, trend: 'up', icon: '🥔' },
];

const ARBITRAGE_OPPORTUNITY = {
  cropName: 'Tomato',
  localMandi: 'Pune APMC',
  localPrice: 1200,
  targetMandi: 'Mumbai Vashi',
  targetPrice: 1800,
  difference: 600,
  distance: '140 km',
  profitMargin: '50%'
};

const getMockHistoricalData = (price: number, trend: string) => {
  const base = price;
  const round = (val: number) => Math.round(val);
  if (trend === 'up') {
    return [
      { day: '6d ago', price: round(base * 0.90) },
      { day: '5d ago', price: round(base * 0.92) },
      { day: '4d ago', price: round(base * 0.91) },
      { day: '3d ago', price: round(base * 0.95) },
      { day: '2d ago', price: round(base * 0.94) },
      { day: 'Yesterday', price: round(base * 0.98) },
      { day: 'Today', price: round(base) }
    ];
  } else if (trend === 'down') {
    return [
      { day: '6d ago', price: round(base * 1.10) },
      { day: '5d ago', price: round(base * 1.08) },
      { day: '4d ago', price: round(base * 1.09) },
      { day: '3d ago', price: round(base * 1.05) },
      { day: '2d ago', price: round(base * 1.06) },
      { day: 'Yesterday', price: round(base * 1.02) },
      { day: 'Today', price: round(base) }
    ];
  } else {
    return [
      { day: '6d ago', price: round(base * 0.99) },
      { day: '5d ago', price: round(base * 1.01) },
      { day: '4d ago', price: round(base * 0.98) },
      { day: '3d ago', price: round(base * 1.02) },
      { day: '2d ago', price: round(base * 0.99) },
      { day: 'Yesterday', price: round(base * 1.01) },
      { day: 'Today', price: round(base) }
    ];
  }
};

interface MarketProps {
  onBack: () => void;
  onSelectCrop: (crop: CropPrice) => void;
  language: Language;
}

type Category = 'All' | 'Grains' | 'Vegetables' | 'Oilseeds' | 'Fruits';
type SortOption = 'price-asc' | 'price-desc' | 'change-desc' | 'change-asc' | 'none';

export const Market: React.FC<MarketProps> = ({ onBack, onSelectCrop, language }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const [showFilters, setShowFilters] = useState(false);
  const [showArbitrageAnalyzer, setShowArbitrageAnalyzer] = useState(false);
  const [crops, setCrops] = useState<CropPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [alerts, setAlerts] = useState<Record<string, { threshold: number, direction: 'above' | 'below' }>>({});
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [selectedCropForAlert, setSelectedCropForAlert] = useState<CropPrice | null>(null);
  const [alertThreshold, setAlertThreshold] = useState<string>('');
  const [alertDirection, setAlertDirection] = useState<'above' | 'below'>('above');

  const categories: Category[] = ['All', 'Grains', 'Vegetables', 'Oilseeds', 'Fruits'];

  const fetchCrops = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchKarnatakaMarketPrices();
      setCrops(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  // Simulate live price updates
  useEffect(() => {
    if (crops.length === 0) return;
    
    const interval = setInterval(() => {
      setCrops(prevCrops => prevCrops.map(crop => {
        // Randomly change price by -1% to +1%
        const changeFactor = 1 + (Math.random() * 0.02 - 0.01);
        const newPrice = Math.round(crop.price * changeFactor);
        const change = newPrice - crop.price;
        const changePercent = Number(((change / crop.price) * 100).toFixed(1));
        
        return {
          ...crop,
          price: newPrice,
          change: crop.change + change,
          changePercent: Number((crop.changePercent + changePercent).toFixed(1)),
          trend: change > 0 ? 'up' : change < 0 ? 'down' : crop.trend
        };
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [crops.length]);

  // Check alerts
  useEffect(() => {
    crops.forEach(crop => {
      const alert = alerts[crop.id];
      if (alert) {
        if (alert.direction === 'above' && crop.price >= alert.threshold) {
          toast.success(`Price Alert: ${crop.name} has crossed above ₹${alert.threshold}! Current price: ₹${crop.price}`);
          setAlerts(prev => {
            const newAlerts = { ...prev };
            delete newAlerts[crop.id];
            return newAlerts;
          });
        } else if (alert.direction === 'below' && crop.price <= alert.threshold) {
          toast.success(`Price Alert: ${crop.name} has dropped below ₹${alert.threshold}! Current price: ₹${crop.price}`);
          setAlerts(prev => {
            const newAlerts = { ...prev };
            delete newAlerts[crop.id];
            return newAlerts;
          });
        }
      }
    });
  }, [crops, alerts]);

  const handleSetAlert = () => {
    if (!selectedCropForAlert || !alertThreshold) return;
    
    setAlerts(prev => ({
      ...prev,
      [selectedCropForAlert.id]: {
        threshold: Number(alertThreshold),
        direction: alertDirection
      }
    }));
    
    toast.success(`Alert set for ${selectedCropForAlert.name} ${alertDirection} ₹${alertThreshold}`);
    setAlertModalOpen(false);
    setSelectedCropForAlert(null);
    setAlertThreshold('');
  };

  const filteredCrops = useMemo(() => {
    let result = crops.filter((crop) => {
      const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           crop.nameHi.includes(searchQuery);
      const matchesCategory = selectedCategory === 'All' || crop.category === selectedCategory;
      const matchesPrice = crop.price >= priceRange[0] && crop.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    if (sortBy !== 'none') {
      result = [...result].sort((a, b) => {
        switch (sortBy) {
          case 'price-asc': return a.price - b.price;
          case 'price-desc': return b.price - a.price;
          case 'change-desc': return b.changePercent - a.changePercent;
          case 'change-asc': return a.changePercent - b.changePercent;
          default: return 0;
        }
      });
    }

    return result;
  }, [crops, searchQuery, selectedCategory, priceRange, sortBy]);

  return (
    <div className="flex flex-col min-h-screen bg-soil">
      {showArbitrageAnalyzer && (
        <ArbitrageAnalyzer
          language={language}
          onClose={() => setShowArbitrageAnalyzer(false)}
        />
      )}

      {/* Header */}
      <header className="bg-primary-dark text-white px-5 pt-20 pb-6 rounded-b-[24px] shadow-lg z-20 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/20 rounded-full -ml-12 -mb-12 blur-2xl"></div>

        <div className="flex items-center justify-between gap-4 relative z-10">
          <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-black tracking-wide text-white">{t('agro.marketPrice')}</h1>
            <p className="text-[10px] font-bold text-green-200/80 uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
              <MapPin size={10} /> Tumkur, Karnataka, India
            </p>
          </div>
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-primary-dark"></span>
          </button>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="px-4 pt-4 pb-2 bg-soil sticky top-0 z-10">
        {/* Arbitrage Analyzer Trigger */}
        <button
          onClick={() => setShowArbitrageAnalyzer(true)}
          className="w-full bg-white rounded-xl p-3 mb-4 flex items-center justify-between border border-orange-100 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
              <Store size={16} />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-gray-900 leading-tight">Find Best Market</div>
              <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">Analyze Arbitrage</div>
            </div>
          </div>
          <div className="bg-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-white">
            <TrendingUp size={12} />
          </div>
        </button>
        
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input 
              className="block w-full pl-10 pr-10 py-3 bg-soil border-none rounded-xl text-earth placeholder-gray-400 focus:ring-2 focus:ring-primary focus:outline-none shadow-inner" 
              placeholder="Search crops..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-earth"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${showFilters ? 'bg-primary text-white' : 'bg-soil text-earth hover:bg-gray-200'}`}
          >
            <Filter size={20} />
          </button>
        </div>
        
        {showFilters && (
          <div className="mb-4 p-4 bg-soil rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Sort By</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'none', label: 'Default (Clear Sort)' },
                  { id: 'price-desc', label: 'Price: High → Low' },
                  { id: 'price-asc', label: 'Price: Low → High' },
                  { id: 'change-desc', label: 'Gainers (↑ %)' },
                  { id: 'change-asc', label: 'Losers (↓ %)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id as SortOption)}
                    className={`text-xs py-2 px-3 rounded-lg border transition-all font-bold ${
                      sortBy === opt.id 
                        ? 'bg-primary text-white border-primary shadow-md' 
                        : 'bg-white text-earth border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price Range (₹/q)</p>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max="10000" 
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="flex-1 accent-primary h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-bold text-earth min-w-[80px] text-right">Up to ₹{priceRange[1]}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setPriceRange([0, 10000]);
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setSortBy('none');
                }}
                className="text-xs font-bold text-gray-400 hover:text-earth"
              >
                Reset All
              </button>
              <button 
                onClick={() => setShowFilters(false)}
                className="text-xs font-bold text-primary hover:underline"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap border transition-all ${
                selectedCategory === cat 
                  ? 'bg-primary/10 text-primary-dark border-primary/20 font-bold' 
                  : 'bg-soil text-earth border-transparent hover:border-gray-200 font-medium'
              }`}
            >
              {cat === 'All' ? <Wheat size={16} /> : null}
              <span className="text-sm">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"
            />
            <p className="text-gray-500 font-medium">Loading market prices...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-3xl border border-red-100 shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-500 mb-6">We couldn't fetch the latest market prices. Please check your internet connection and try again.</p>
            <button 
              onClick={fetchCrops}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
            >
              <RefreshCw size={18} />
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* NEW: Active Alerts */}
            {Object.keys(alerts).length > 0 && (!searchQuery && selectedCategory === 'All') && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-earth mb-3 flex items-center gap-2">
                  <Bell size={18} className="text-primary" /> Active Price Alerts
                </h2>
                <div className="flex flex-col gap-3">
                  {Object.entries(alerts).map(([cropId, alertData]) => {
                    const alert = alertData as { threshold: number, direction: 'above' | 'below' };
                    const crop = crops.find(c => c.id === cropId) || WATCHLIST_CROPS.find(c => c.id === cropId);
                    if (!crop) return null;
                    return (
                      <div key={cropId} className="bg-white p-3 rounded-xl shadow-sm border border-primary/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{crop.icon}</span>
                          <div>
                            <p className="font-bold text-earth text-sm">{crop.name}</p>
                            <p className="text-xs text-gray-500">Current: ₹{crop.price}/q</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-lg text-xs font-bold ${alert.direction === 'above' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {alert.direction === 'above' ? 'Above' : 'Below'} ₹{alert.threshold}
                          </div>
                          <button 
                            onClick={() => {
                              setAlerts(prev => {
                                const newAlerts = { ...prev };
                                delete newAlerts[cropId];
                                return newAlerts;
                              });
                              toast.success(`Alert removed for ${crop.name}`);
                            }}
                            className="p-1.5 bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NEW: My Watchlist */}
            {(!searchQuery && selectedCategory === 'All') && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-earth mb-3">My Watchlist</h2>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4">
                  {WATCHLIST_CROPS.map(crop => (
                    <div key={crop.id} className="min-w-[170px] bg-white p-4 rounded-2xl shadow-sm border border-gray-100 shrink-0 hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-2xl">{crop.icon}</span>
                          <div className={`flex items-center text-xs font-black px-2 py-0.5 rounded-full ${
                            crop.trend === 'up' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {crop.trend === 'up' ? <TrendingUp size={11} className="mr-0.5" /> : <TrendingDown size={11} className="mr-0.5" />}
                            {crop.changePercent}%
                          </div>
                        </div>
                        <h3 className="font-extrabold text-earth text-sm">{crop.name}</h3>
                        <p className="text-base font-black text-earth mt-0.5">₹{crop.price.toLocaleString()}<span className="text-[11px] font-normal text-gray-400">/q</span></p>
                      </div>

                      {/* Mini Sparkline in Watchlist */}
                      <div className="h-8 w-full mt-2 bg-slate-50/70 rounded-xl p-1 border border-slate-100 overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={1}>
                          <AreaChart data={getMockHistoricalData(crop.price, crop.trend)}>
                            <defs>
                              <linearGradient id={`wl-grad-${crop.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={crop.trend === 'up' ? '#10B981' : '#EF4444'} stopOpacity={0.5}/>
                                <stop offset="100%" stopColor={crop.trend === 'up' ? '#10B981' : '#EF4444'} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <YAxis hide domain={['dataMin - (dataMin * 0.05)', 'dataMax + (dataMax * 0.05)']} />
                            <Area 
                              type="monotone" 
                              dataKey="price" 
                              stroke={crop.trend === 'up' ? '#059669' : '#DC2626'} 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill={`url(#wl-grad-${crop.id})`} 
                              isAnimationActive={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NEW: Arbitrage Opportunities */}
            {(!searchQuery && selectedCategory === 'All') && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-earth mb-3">Arbitrage Opportunities</h2>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 relative overflow-hidden shadow-md">
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl uppercase tracking-wider shadow-sm">
                    Smart Insight
                  </div>
                  <div className="flex items-start gap-4 mt-2">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-inner">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 text-base mb-1">Sell {ARBITRAGE_OPPORTUNITY.cropName} in {ARBITRAGE_OPPORTUNITY.targetMandi}</h3>
                      <p className="text-sm text-blue-800 mb-3 leading-snug font-medium">
                        Prices are <span className="font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">+₹{ARBITRAGE_OPPORTUNITY.difference}/q</span> higher than your local mandi ({ARBITRAGE_OPPORTUNITY.localMandi}).
                      </p>
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-900 bg-blue-100/80 inline-flex px-3 py-1.5 rounded-lg border border-blue-200">
                        <span className="flex items-center gap-1"><Store size={12} /> {ARBITRAGE_OPPORTUNITY.distance}</span>
                        <span className="w-1 h-1 rounded-full bg-blue-300"></span>
                        <span className="text-green-700">Est. Profit: {ARBITRAGE_OPPORTUNITY.profitMargin}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-3 mt-2">
              <h2 className="text-lg font-bold text-earth">
                {searchQuery || selectedCategory !== 'All' ? 'Search Results' : 'Trending Crops'} 
                <span className="text-sm font-normal text-gray-500 ml-1">| आज के भाव</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">{filteredCrops.length} items found</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredCrops.length > 0 ? (
                  filteredCrops.map((crop, index) => (
                    <motion.div 
                      layout
                      key={crop.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelectCrop(crop)}
                      className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md border border-gray-200/80 hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                    >
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                      crop.category === 'Grains' ? 'bg-amber-100/80 text-amber-900' : 
                      crop.category === 'Vegetables' ? 'bg-purple-100/80 text-purple-900' : 
                      crop.category === 'Oilseeds' ? 'bg-yellow-100/80 text-yellow-900' : 'bg-orange-100/80 text-orange-900'
                    }`}>
                      <span className="text-2xl">{crop.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-extrabold text-gray-900 group-hover:text-[#003527] transition-colors leading-tight truncate">
                        {crop.name} 
                        <span className="text-xs sm:text-sm font-semibold text-gray-500 ml-1">
                          | {language === 'hi' ? crop.nameHi : language === 'kn' ? crop.nameKn : crop.name}
                        </span>
                      </h3>
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <Store size={12} className="text-[#003527]" />
                          <span className="truncate">{crop.mandi}</span>
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#003527] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            {crop.category}
                          </span>
                          <span className="bg-purple-50 text-purple-700 border border-purple-200/60 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 whitespace-nowrap">
                            🤖 AI: {crop.trend === 'up' ? '+5%' : crop.trend === 'down' ? '-3%' : 'Stable'} next week
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg sm:text-xl font-black text-gray-900">₹{crop.price.toLocaleString()}<span className="text-xs font-medium text-gray-500">/q</span></p>
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold mt-1 shadow-2xs ${
                      crop.trend === 'up' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 
                      crop.trend === 'down' ? 'bg-red-50 text-red-800 border border-red-200' : 
                      'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {crop.trend === 'up' ? <TrendingUp size={12} className="mr-1 text-emerald-600" /> : 
                       crop.trend === 'down' ? <TrendingDown size={12} className="mr-1 text-red-600" /> : 
                       <Minus size={12} className="mr-1" />}
                      {crop.change > 0 ? '+' : ''}₹{Math.abs(crop.change)} ({crop.changePercent}%)
                    </div>
                  </div>
                </div>
                
                <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">7D Trend</span>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        crop.trend === 'up' ? 'text-emerald-800 bg-emerald-50 border border-emerald-200/50' : 
                        crop.trend === 'down' ? 'text-red-800 bg-red-50 border border-red-200/50' : 
                        'text-gray-700 bg-gray-100 border border-gray-200'
                      }`}>
                        {crop.trend === 'up' ? '↗ Bullish' : crop.trend === 'down' ? '↘ Bearish' : '→ Stable'}
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCropForAlert(crop);
                        setAlertModalOpen(true);
                        setAlertThreshold(crop.price.toString());
                      }}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all self-start cursor-pointer active:scale-95 ${
                        alerts[crop.id] 
                          ? 'bg-[#003527] text-white shadow-2xs' 
                          : 'bg-[#F9FAF8] text-gray-700 hover:bg-emerald-50 hover:text-[#003527] border border-gray-200'
                      }`}
                    >
                      <Bell size={11} className={alerts[crop.id] ? 'fill-white' : ''} />
                      <span>{alerts[crop.id] ? 'Alert Set' : 'Set Alert'}</span>
                    </button>
                  </div>

                  {/* Beautified Sparkline Graph */}
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="h-12 w-32 sm:w-36 bg-gradient-to-b from-slate-50/90 to-slate-100/60 hover:from-slate-100/90 hover:to-slate-200/60 p-1.5 rounded-xl border border-slate-200/80 shadow-2xs transition-all relative overflow-hidden shrink-0 group/sparkline"
                  >
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={1}>
                      <AreaChart data={getMockHistoricalData(crop.price, crop.trend)} margin={{ top: 3, right: 2, left: 2, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`colorPrice-${crop.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop 
                              offset="0%" 
                              stopColor={crop.trend === 'up' ? '#10B981' : crop.trend === 'down' ? '#EF4444' : '#6366F1'} 
                              stopOpacity={0.65}
                            />
                            <stop 
                              offset="45%" 
                              stopColor={crop.trend === 'up' ? '#059669' : crop.trend === 'down' ? '#DC2626' : '#4F46E5'} 
                              stopOpacity={0.25}
                            />
                            <stop 
                              offset="100%" 
                              stopColor={crop.trend === 'up' ? '#047857' : crop.trend === 'down' ? '#B91C1C' : '#4338CA'} 
                              stopOpacity={0.0}
                            />
                          </linearGradient>
                          <filter id={`glow-${crop.id}`} x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={crop.trend === 'up' ? '#10B981' : crop.trend === 'down' ? '#EF4444' : '#6366F1'} floodOpacity="0.35"/>
                          </filter>
                        </defs>
                        <YAxis hide domain={['dataMin - (dataMin * 0.06)', 'dataMax + (dataMax * 0.06)']} />
                        <Tooltip 
                          cursor={{ stroke: crop.trend === 'up' ? '#10B981' : '#EF4444', strokeWidth: 1, strokeDasharray: '2 2' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-slate-900/95 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xl border border-white/10 pointer-events-none whitespace-nowrap">
                                  ₹{payload[0].value?.toLocaleString()}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke={crop.trend === 'up' ? '#059669' : crop.trend === 'down' ? '#DC2626' : '#4F46E5'} 
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fillOpacity={1} 
                          fill={`url(#colorPrice-${crop.id})`} 
                          isAnimationActive={false}
                          style={{ filter: `url(#glow-${crop.id})` }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center col-span-full"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-earth">No crops found</h3>
              <p className="text-sm text-gray-500 max-w-[200px]">Try adjusting your search or filters to find what you're looking for.</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setPriceRange([0, 10000]);
                }}
                className="mt-4 text-primary font-bold hover:underline"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
          </AnimatePresence>
          </div>
        </>
        )}

        {/* Sell Smartly Tip */}
        <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 flex gap-4 items-center">
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary-dark flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <h4 className="font-bold text-earth text-sm">Sell Smartly!</h4>
            <p className="text-xs text-gray-600">Prices for Wheat are expected to rise next week. Consider holding.</p>
          </div>
        </div>
      </main>

      {/* Alert Modal */}
      <AnimatePresence>
        {alertModalOpen && selectedCropForAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setAlertModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-earth">Set Price Alert</h3>
                <button 
                  onClick={() => setAlertModalOpen(false)}
                  className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">{selectedCropForAlert.icon}</span>
                  <div>
                    <p className="font-bold text-earth">{selectedCropForAlert.name}</p>
                    <p className="text-sm text-gray-500">Current: ₹{selectedCropForAlert.price}/q</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Alert me when price goes</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setAlertDirection('above')}
                        className={`flex-1 py-2 rounded-xl font-bold border-2 transition-colors ${
                          alertDirection === 'above' 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        Above
                      </button>
                      <button 
                        onClick={() => setAlertDirection('below')}
                        className={`flex-1 py-2 rounded-xl font-bold border-2 transition-colors ${
                          alertDirection === 'below' 
                            ? 'border-red-500 bg-red-50 text-red-600' 
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        Below
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Target Price (₹/q)</label>
                    <input 
                      type="number" 
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold text-earth focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Enter amount..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                {alerts[selectedCropForAlert.id] && (
                  <button 
                    onClick={() => {
                      setAlerts(prev => {
                        const newAlerts = { ...prev };
                        delete newAlerts[selectedCropForAlert.id];
                        return newAlerts;
                      });
                      setAlertModalOpen(false);
                      toast.success(`Alert removed for ${selectedCropForAlert.name}`);
                    }}
                    className="py-3 px-4 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    Remove
                  </button>
                )}
                <button 
                  onClick={handleSetAlert}
                  disabled={!alertThreshold}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Alert
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
