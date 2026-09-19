import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, CloudRain, Sun, Cloud, Wind, Star, MessageSquare, Info, Store, Filter, ChevronDown, MapPin, Sprout, Calendar, Clock, Sparkles, CheckCircle2, Activity, Layers, Droplets, Phone, Navigation, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, ReferenceLine } from 'recharts';
import { CropPrice, Language } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import { getWeatherData, WeatherData } from '../services/weatherService';
import { SUPPLIERS } from '../constants';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon
const markerIcon2x = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const markerIcon = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const markerShadow = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const supplierIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map centering
const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

interface CropDetailsProps {
  crop: CropPrice;
  onBack: () => void;
  language: Language;
  onFindSuppliers: () => void;
}

// Calculate distance between two coordinates in km
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const CropDetails: React.FC<CropDetailsProps> = ({ crop, onBack, language, onFindSuppliers }) => {
  const [sortBy, setSortBy] = useState<'recency' | 'rating'>('recency');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const { latitude, longitude } = useGeolocation();

  useEffect(() => {
    if (latitude && longitude) {
      getWeatherData(latitude, longitude).then(setWeather).catch(console.error);
    }
  }, [latitude, longitude]);

  // Generate deterministic supplier locations based on user location
  const mapSuppliers = useMemo(() => {
    if (!latitude || !longitude) return [];
    
    return SUPPLIERS.map((s, i) => {
      const pseudoRandom1 = Math.sin(i * 12.9898) * 43758.5453;
      const pseudoRandom2 = Math.cos(i * 78.233) * 43758.5453;
      const offsetLat = (pseudoRandom1 - Math.floor(pseudoRandom1) - 0.5) * 0.05;
      const offsetLng = (pseudoRandom2 - Math.floor(pseudoRandom2) - 0.5) * 0.05;
      
      const lat = s.lat || latitude + offsetLat;
      const lng = s.lng || longitude + offsetLng;
      const actualDistance = getDistanceKm(latitude, longitude, lat, lng).toFixed(1);
      return { ...s, lat, lng, distance: `${actualDistance} km` };
    });
  }, [latitude, longitude]);

  // Mock historical data
  const historicalData = [
    { date: 'Feb 18', price: crop.price - 100 },
    { date: 'Feb 19', price: crop.price - 50 },
    { date: 'Feb 20', price: crop.price - 80 },
    { date: 'Feb 21', price: crop.price + 20 },
    { date: 'Feb 22', price: crop.price - 10 },
    { date: 'Feb 23', price: crop.price + 40 },
    { date: 'Feb 24', price: crop.price },
  ];

  const initialReviews = [
    { id: 1, author: 'Rajesh K.', rating: 5, comment: 'Great prices this week at Azadpur Mandi. Quality was excellent.', date: '1d ago', timestamp: Date.now() - 86400000 },
    { id: 2, author: 'Suresh M.', rating: 4, comment: 'Prices are stable. Expecting a slight dip next week due to high supply.', date: '3d ago', timestamp: Date.now() - 86400000 * 3 },
    { id: 3, author: 'Amit P.', rating: 3, comment: 'Average quality arriving. Make sure to sort before selling.', date: '1w ago', timestamp: Date.now() - 86400000 * 7 },
    { id: 4, author: 'Vijay S.', rating: 5, comment: 'Very high demand for this crop right now. Sold my stock easily.', date: '2h ago', timestamp: Date.now() - 7200000 },
    { id: 5, author: 'Deepak R.', rating: 2, comment: 'Mandi was overcrowded and management was poor today.', date: '5d ago', timestamp: Date.now() - 86400000 * 5 },
  ];

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...initialReviews];
    if (filterRating !== 'all') {
      result = result.filter(r => r.rating === filterRating);
    }
    result.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.timestamp - a.timestamp;
    });
    return result;
  }, [sortBy, filterRating]);

  // Projected crop growth stages dataset based on historical benchmark data
  const [growthMetricView, setGrowthMetricView] = useState<'growth' | 'moisture'>('growth');

  const growthTimelineData = useMemo(() => {
    const isVegetable = ['Tomato', 'Onion', 'Potato', 'Garlic', 'Chilli'].some(c => crop.name.toLowerCase().includes(c.toLowerCase()));
    const isPaddy = ['Rice', 'Paddy'].some(c => crop.name.toLowerCase().includes(c.toLowerCase()));
    
    if (isPaddy) {
      return [
        { stage: 'Day 10', shortStage: 'Sowing', projected: 14, historical: 12, moistureNeed: 40, phaseStatus: 'completed', advisory: 'Seedling germination & nursery bed prep.' },
        { stage: 'Day 25', shortStage: 'Transplant', projected: 30, historical: 28, moistureNeed: 85, phaseStatus: 'completed', advisory: 'Maintain 3-5cm standing water in fields.' },
        { stage: 'Day 45', shortStage: 'Tillering', projected: 55, historical: 52, moistureNeed: 90, phaseStatus: 'current', advisory: 'Top dress Nitrogen (Urea) & monitor for leaf folder.' },
        { stage: 'Day 70', shortStage: 'Panicle Init', projected: 76, historical: 72, moistureNeed: 75, phaseStatus: 'upcoming', advisory: 'Apply Potash fertilizer; critical moisture phase.' },
        { stage: 'Day 95', shortStage: 'Flowering', projected: 90, historical: 88, moistureNeed: 60, phaseStatus: 'upcoming', advisory: 'Monitor for neck blast & grain discoloration.' },
        { stage: 'Day 120', shortStage: 'Maturity', projected: 100, historical: 100, moistureNeed: 20, phaseStatus: 'upcoming', advisory: 'Drain field 10 days prior to harvesting.' },
      ];
    } else if (isVegetable) {
      return [
        { stage: 'Day 7', shortStage: 'Germination', projected: 15, historical: 12, moistureNeed: 50, phaseStatus: 'completed', advisory: 'Keep nursery bed moist & pest-free.' },
        { stage: 'Day 20', shortStage: 'Transplant', projected: 32, historical: 30, moistureNeed: 70, phaseStatus: 'completed', advisory: 'Apply root starter & install support stakes.' },
        { stage: 'Day 40', shortStage: 'Vegetative', projected: 60, historical: 56, moistureNeed: 80, phaseStatus: 'current', advisory: 'Prune suckers & spray Micronutrient foliar mix.' },
        { stage: 'Day 60', shortStage: 'Fruit Set', projected: 82, historical: 78, moistureNeed: 75, phaseStatus: 'upcoming', advisory: 'Spray Calcium-Boron to prevent blossom rot.' },
        { stage: 'Day 80', shortStage: 'Expansion', projected: 94, historical: 92, moistureNeed: 65, phaseStatus: 'upcoming', advisory: 'Ensure uniform irrigation to avoid fruit cracking.' },
        { stage: 'Day 100', shortStage: 'Harvest', projected: 100, historical: 100, moistureNeed: 35, phaseStatus: 'upcoming', advisory: 'Pick fruits at color turn stage for shelf life.' },
      ];
    } else {
      return [
        { stage: 'Day 12', shortStage: 'Germination', projected: 16, historical: 15, moistureNeed: 45, phaseStatus: 'completed', advisory: 'Ensure uniform seed depth & light irrigation.' },
        { stage: 'Day 30', shortStage: 'Crown Root', projected: 38, historical: 34, moistureNeed: 75, phaseStatus: 'completed', advisory: 'First irrigation at CRI stage; apply split Nitrogen.' },
        { stage: 'Day 55', shortStage: 'Booting', projected: 64, historical: 60, moistureNeed: 85, phaseStatus: 'current', advisory: 'Apply Zinc & Sulfur if deficiency spotted.' },
        { stage: 'Day 80', shortStage: 'Heading', projected: 84, historical: 81, moistureNeed: 70, phaseStatus: 'upcoming', advisory: 'Watch out for yellow rust or aphid infestation.' },
        { stage: 'Day 105', shortStage: 'Dough Stage', projected: 95, historical: 93, moistureNeed: 50, phaseStatus: 'upcoming', advisory: 'Final terminal irrigation before grain hardening.' },
        { stage: 'Day 125', shortStage: 'Maturity', projected: 100, historical: 100, moistureNeed: 15, phaseStatus: 'upcoming', advisory: 'Harvest when grain moisture drops to ~14%.' },
      ];
    }
  }, [crop.name]);

  const CustomGrowthTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-emerald-100 text-xs space-y-2 min-w-[200px]">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-1.5">
            <span className="font-extrabold text-earth text-sm">{data.stage} • {data.shortStage}</span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
              data.phaseStatus === 'completed' ? 'bg-emerald-100 text-emerald-800' :
              data.phaseStatus === 'current' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
              'bg-gray-100 text-gray-600'
            }`}>
              {data.phaseStatus.toUpperCase()}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-emerald-700 font-bold">
              <span>Projected Growth:</span>
              <span className="font-black text-sm">{data.projected}%</span>
            </div>
            <div className="flex justify-between items-center text-indigo-600 font-semibold">
              <span>Historical Avg:</span>
              <span>{data.historical}%</span>
            </div>
            <div className="flex justify-between items-center text-sky-600 font-medium">
              <span>Water & Nutrient Demand:</span>
              <span>{data.moistureNeed}%</span>
            </div>
          </div>
          {data.advisory && (
            <div className="mt-1 pt-1.5 border-t border-gray-100 text-[11px] text-gray-600 font-medium flex items-start gap-1">
              <Sparkles size={12} className="text-amber-500 shrink-0 mt-0.5" />
              <span>{data.advisory}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-soil">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 pt-12 pb-4 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full bg-soil text-earth hover:bg-gray-200 transition-colors cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black tracking-tight text-earth">
              {language === 'hi' ? crop.nameHi : language === 'kn' ? crop.nameKn : crop.name} Details
            </h1>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{crop.category}</p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 3 }}
            className="w-12 h-12 bg-soil rounded-2xl flex items-center justify-center text-2xl shadow-2xs"
          >
            {crop.icon}
          </motion.div>
        </div>
      </motion.header>

      <main className="flex-1 p-5 pb-32 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Current Price Card */}
            <motion.section 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="bg-white rounded-[40px] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Current Price</p>
                    <div className="flex items-baseline gap-2">
                      <motion.span 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="text-5xl font-black text-earth"
                      >
                        ₹{crop.price.toLocaleString()}
                      </motion.span>
                      <span className="text-lg font-bold text-gray-400">/q</span>
                    </div>
                  </div>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35, delay: 0.2 }}
                    className={`flex items-center px-3 py-1.5 rounded-full text-xs font-black shadow-sm ${
                      crop.trend === 'up' ? 'bg-green-500 text-white' : 
                      crop.trend === 'down' ? 'bg-red-500 text-white' : 
                      'bg-gray-500 text-white'
                    }`}
                  >
                    {crop.trend === 'up' ? <TrendingUp size={14} className="mr-1" /> : 
                     crop.trend === 'down' ? <TrendingDown size={14} className="mr-1" /> : 
                     <Minus size={14} className="mr-1" />}
                    {crop.changePercent}%
                  </motion.div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <Store size={16} className="text-primary" />
                  <span>Latest update from {crop.mandi}</span>
                </div>
              </div>
            </motion.section>

            {/* In-Depth Information */}
            <section>
              <h2 className="text-xl font-black text-earth tracking-tight mb-5 px-2">Crop Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Soil Type', value: 'Loamy, Well-drained' },
                  { label: 'Water Needs', value: 'Moderate (400-600mm)' },
                  { label: 'Growth Stage', value: 'Vegetative' },
                  { label: 'Est. Yield', value: '20-25 q/acre' },
                ].map((info, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 + idx * 0.06 }}
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md"
                  >
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{info.label}</p>
                    <p className="text-sm font-black text-earth">{info.value}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Projected Crop Growth Stages (Recharts LineChart) */}
            <motion.section 
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
              className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Sprout size={18} />
                    </div>
                    <h2 className="text-lg font-black text-earth tracking-tight">Projected Growth Stages</h2>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    AI growth curve based on multi-season historical benchmarks
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-soil p-1 rounded-2xl border border-gray-200/80 self-start sm:self-auto">
                  <button
                    onClick={() => setGrowthMetricView('growth')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      growthMetricView === 'growth'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-earth'
                    }`}
                  >
                    Growth %
                  </button>
                  <button
                    onClick={() => setGrowthMetricView('moisture')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      growthMetricView === 'moisture'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-earth'
                    }`}
                  >
                    Water Need %
                  </button>
                </div>
              </div>

              {/* Quick Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-emerald-50/60 rounded-2xl p-3 border border-emerald-100/80"
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800/70 block">Current Stage</span>
                  <span className="text-xs font-extrabold text-emerald-950 block mt-0.5 truncate">
                    {growthTimelineData.find(d => d.phaseStatus === 'current')?.shortStage || 'Tillering'}
                  </span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                  className="bg-indigo-50/60 rounded-2xl p-3 border border-indigo-100/80"
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800/70 block">Est. Maturity</span>
                  <span className="text-xs font-extrabold text-indigo-950 block mt-0.5 truncate">
                    {growthTimelineData[growthTimelineData.length - 1]?.stage}
                  </span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="bg-amber-50/60 rounded-2xl p-3 border border-amber-100/80"
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800/70 block">Crop Health Vigor</span>
                  <span className="text-xs font-extrabold text-amber-950 block mt-0.5 flex items-center gap-1">
                    <Activity size={12} className="text-amber-600" /> 96% Optimal
                  </span>
                </motion.div>
              </div>

              {/* Recharts LineChart */}
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={1}>
                  <LineChart data={growthTimelineData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="shortStage" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#4B5563' }} 
                      dy={8}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#9CA3AF' }}
                      domain={[0, 100]}
                      unit="%"
                    />
                    <Tooltip content={<CustomGrowthTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      height={32} 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', fontWeight: 700 }}
                    />
                    
                    {growthMetricView === 'growth' ? (
                      <>
                        <Line 
                          type="monotone" 
                          dataKey="projected" 
                          name="Projected Growth (%)" 
                          stroke="#059669" 
                          strokeWidth={3.5} 
                          dot={{ r: 5, fill: '#059669', strokeWidth: 2, stroke: '#FFFFFF' }}
                          activeDot={{ r: 8, strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="historical" 
                          name="Historical Benchmark (%)" 
                          stroke="#4F46E5" 
                          strokeWidth={2} 
                          strokeDasharray="4 4"
                          dot={{ r: 4, fill: '#4F46E5' }}
                        />
                      </>
                    ) : (
                      <Line 
                        type="monotone" 
                        dataKey="moistureNeed" 
                        name="Water & Irrigation Demand (%)" 
                        stroke="#0284C7" 
                        strokeWidth={3} 
                        dot={{ r: 5, fill: '#0284C7', strokeWidth: 2, stroke: '#FFFFFF' }}
                        activeDot={{ r: 7 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Horizontal Timeline Milestone Pills */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Stage Breakdown & Advisories</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {growthTimelineData.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + idx * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      className={`p-2.5 rounded-2xl border transition-all ${
                        item.phaseStatus === 'current'
                          ? 'bg-amber-50/80 border-amber-200 text-earth shadow-2xs'
                          : item.phaseStatus === 'completed'
                          ? 'bg-emerald-50/40 border-emerald-100 text-gray-700'
                          : 'bg-gray-50/60 border-gray-100 text-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold flex items-center gap-1.5">
                          {item.phaseStatus === 'completed' ? (
                            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          ) : item.phaseStatus === 'current' ? (
                            <Clock size={13} className="text-amber-600 shrink-0 animate-pulse" />
                          ) : (
                            <Calendar size={13} className="text-gray-400 shrink-0" />
                          )}
                          {item.stage}: {item.shortStage}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/80 border border-gray-200/60">
                          {item.projected}% Progress
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 font-medium mt-1 leading-snug">
                        {item.advisory}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          </div>

          <div className="space-y-8">
            {/* Price History Chart */}
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <div className="flex justify-between items-center mb-5 px-2">
                <h2 className="text-xl font-black text-earth tracking-tight">Price History</h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-full">7D</span>
                  <span className="px-3 py-1 bg-white text-gray-400 text-[10px] font-black rounded-full border border-gray-100">1M</span>
                </div>
              </div>
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={1}>
                  <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.45}/>
                        <stop offset="50%" stopColor="#059669" stopOpacity={0.15}/>
                        <stop offset="100%" stopColor="#047857" stopOpacity={0.0}/>
                      </linearGradient>
                      <filter id="priceGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#10B981" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }} 
                      dy={10}
                    />
                    <YAxis 
                      hide 
                      domain={['dataMin - 60', 'dataMax + 60']} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: '1px solid rgba(16, 185, 129, 0.2)', 
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)',
                        padding: '10px 14px',
                      }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString()}/q`, 'Mandi Price']}
                      labelStyle={{ fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#059669" 
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                      style={{ filter: 'url(#priceGlow)' }}
                      dot={{ r: 4, fill: '#059669', stroke: '#FFFFFF', strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: '#10B981', stroke: '#FFFFFF', strokeWidth: 2.5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.section>

            {/* Weather Impact */}
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
            >
          <h2 className="text-xl font-black text-earth tracking-tight mb-5 px-2">Weather & Market Impact</h2>
          
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 px-2 -mx-2">
            {[
              { title: 'Rainfall', value: weather ? `${weather.rain} mm` : 'Loading...', bg: 'bg-blue-50', border: 'border-blue-100', iconBg: 'bg-blue-100', iconColor: 'text-blue-500', titleColor: 'text-blue-900', valColor: 'text-blue-700/80', Icon: CloudRain },
              { title: 'Temperature', value: weather ? `${weather.temperature}°C` : 'Loading...', bg: 'bg-orange-50', border: 'border-orange-100', iconBg: 'bg-orange-100', iconColor: 'text-orange-500', titleColor: 'text-orange-900', valColor: 'text-orange-700/80', Icon: Sun },
              { title: 'Wind', value: weather ? `${weather.windSpeed} km/h` : 'Loading...', bg: 'bg-teal-50', border: 'border-teal-100', iconBg: 'bg-teal-100', iconColor: 'text-teal-600', titleColor: 'text-teal-900', valColor: 'text-teal-700/80', Icon: Wind }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.2 + idx * 0.08 }}
                whileHover={{ scale: 1.03 }}
                className={`min-w-[140px] ${item.bg} rounded-3xl p-5 border ${item.border} flex flex-col items-center text-center shrink-0 shadow-2xs`}
              >
                <div className={`w-12 h-12 ${item.iconBg} ${item.iconColor} rounded-full flex items-center justify-center mb-3`}>
                  <item.Icon size={24} />
                </div>
                <h3 className={`font-black ${item.titleColor} text-sm mb-1`}>{item.title}</h3>
                <p className={`text-xs ${item.valColor} font-medium`}>{item.value}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28 }}
            className="bg-[#1B5E20] rounded-[32px] p-6 text-white relative overflow-hidden mt-2 shadow-lg shadow-emerald-950/10"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-base font-black">Market Prediction</h3>
              </div>
              <p className="text-sm text-green-100/80 font-medium leading-relaxed mb-5">
                Upcoming rain may temporarily slow down arrivals at {crop.mandi}, potentially pushing prices up by 2-3%.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-2xl p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-200/60 mb-1">Supply Risk</p>
                  <p className="text-sm font-black">Medium</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-200/60 mb-1">Price Outlook</p>
                  <p className="text-sm font-black text-green-400">Bullish</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Supplier Map */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22 }}
        >
          <div className="flex justify-between items-center mb-5 px-2">
            <h2 className="text-xl font-black text-earth tracking-tight">Nearby Suppliers</h2>
            <button 
              onClick={onFindSuppliers}
              className="text-primary text-xs font-black uppercase tracking-widest flex items-center hover:underline cursor-pointer"
            >
              View All <ChevronDown size={14} className="ml-1 -rotate-90" />
            </button>
          </div>
          <div className="bg-white rounded-[32px] p-2 shadow-sm border border-gray-100 overflow-hidden h-64 relative">
            {latitude && longitude ? (
              <MapContainer 
                center={[latitude, longitude]} 
                zoom={12} 
                style={{ height: '100%', width: '100%', borderRadius: '24px', zIndex: 10 }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <ChangeView center={[latitude, longitude]} zoom={12} />
                
                {/* User Location */}
                <Marker position={[latitude, longitude]} icon={userIcon}>
                  <Popup className="rounded-xl">
                    <div className="font-bold text-center">Your Location</div>
                  </Popup>
                </Marker>

                {/* Suppliers */}
                {mapSuppliers.map((supplier) => (
                  <Marker 
                    key={supplier.id} 
                    position={[supplier.lat!, supplier.lng!]} 
                    icon={supplierIcon}
                  >
                    <Popup className="rounded-xl">
                      <div className="p-1.5 min-w-[170px]">
                        <h3 className="font-black text-earth text-sm">{supplier.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{supplier.distance} away</p>
                        <div className="flex items-center gap-1 mt-1 mb-2">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold">{supplier.rating}</span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
                          <a
                            id={`crop-supplier-call-${supplier.id}`}
                            href={`tel:${supplier.phone || '+91-9876543210'}`}
                            className="flex-1 flex items-center justify-center gap-1 bg-[#2D6A4F] hover:bg-[#1B5E20] text-white text-xs font-bold py-1.5 px-2 rounded-lg shadow-xs transition-colors no-underline"
                          >
                            <Phone size={12} />
                            <span>Call</span>
                          </a>
                          {supplier.website && (
                            <a
                              id={`crop-supplier-website-${supplier.id}`}
                              href={supplier.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-50 hover:bg-emerald-100 text-[#2D6A4F] text-xs font-bold py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1 no-underline"
                              title="Visit Website"
                            >
                              <Globe size={12} />
                              <span>Site</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="h-full w-full bg-gray-50 rounded-[24px] flex flex-col items-center justify-center text-gray-400">
                <MapPin size={32} className="mb-2 opacity-50" />
                <p className="text-sm font-bold">Locating nearby suppliers...</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Farmer Reviews */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.26 }}
        >
          <div className="flex justify-between items-center mb-5 px-2">
            <h2 className="text-xl font-black text-earth tracking-tight">Farmer Insights</h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-100'}`}
              >
                <Filter size={18} />
              </button>
              <button className="text-primary text-xs font-black uppercase tracking-widest flex items-center hover:underline cursor-pointer">
                Write Review <MessageSquare size={14} className="ml-1" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Sort By</p>
                    <div className="flex gap-2">
                      {[
                        { id: 'recency', label: 'Newest' },
                        { id: 'rating', label: 'Top Rated' }
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setSortBy(option.id as any)}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${sortBy === option.id ? 'bg-primary text-white' : 'bg-soil text-earth'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Filter by Rating</p>
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                      <button
                        onClick={() => setFilterRating('all')}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${filterRating === 'all' ? 'bg-primary text-white' : 'bg-soil text-earth'}`}
                      >
                        All Ratings
                      </button>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setFilterRating(rating)}
                          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer ${filterRating === rating ? 'bg-primary text-white' : 'bg-soil text-earth'}`}
                        >
                          {rating} <Star size={10} fill={filterRating === rating ? "white" : "currentColor"} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {filteredAndSortedReviews.length > 0 ? (
              filteredAndSortedReviews.map((review, idx) => (
                <motion.div 
                  layout
                  key={review.id} 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-soil rounded-full flex items-center justify-center font-black text-earth">
                        {review.author[0]}
                      </div>
                      <div>
                        <p className="font-black text-earth text-sm leading-none">{review.author}</p>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{review.date}</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    "{review.comment}"
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="bg-white rounded-[28px] p-10 text-center border border-dashed border-gray-200">
                <p className="text-sm font-bold text-gray-400">No reviews match your filters.</p>
                <button 
                  onClick={() => { setFilterRating('all'); setSortBy('recency'); }}
                  className="mt-2 text-primary text-xs font-black uppercase tracking-widest cursor-pointer hover:underline"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </motion.section>
        </div>
        </div>
      </main>
    </div>
  );
};
