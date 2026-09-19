import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, MapPin, Navigation, Compass, Search, ExternalLink, 
  Clock, Star, Phone, ShieldCheck, CornerDownRight, RotateCw, 
  Car, Truck, AlertCircle, CheckCircle2, Sparkles, Send, Loader2,
  Store, Warehouse, Building2, Beaker, ChevronRight, Layers, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import { 
  queryGoogleMapsAgent, 
  MapsPlace, 
  MapsRoute, 
  MapsAgentResponse,
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsSearchUrl
} from '../services/mapsAgentService';

interface GoogleMapsAgentProps {
  onBack: () => void;
  language: Language;
  initialQuery?: string;
  initialOrigin?: string;
  initialDestination?: string;
}

export const GoogleMapsAgent: React.FC<GoogleMapsAgentProps> = ({
  onBack,
  language,
  initialQuery = '',
  initialOrigin = '',
  initialDestination = ''
}) => {
  const { latitude, longitude, loading: geoLoading, error: geoError } = useGeolocation();

  // Active Tab: 'agent' (AI Chat & Search) | 'places' (Browse Places) | 'routes' (Route Planner)
  const [activeTab, setActiveTab] = useState<'agent' | 'places' | 'routes'>(
    initialOrigin && initialDestination ? 'routes' : 'agent'
  );

  // Search & input states
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [originInput, setOriginInput] = useState(initialOrigin || 'Tumakuru');
  const [destInput, setDestInput] = useState(initialDestination || 'Yeshwanthpur APMC Yard, Bengaluru');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Agent State
  const [isLoading, setIsLoading] = useState(false);
  const [agentResponse, setAgentResponse] = useState<MapsAgentResponse | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<MapsPlace | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // User location fallback coordinates (Karnataka centroid / Tumakuru)
  const userLat = latitude || 13.3409;
  const userLng = longitude || 77.1010;

  // Auto-run initial query or load default recommendations on mount
  useEffect(() => {
    handleRunQuery(initialQuery || (initialOrigin && initialDestination ? `Route from ${initialOrigin} to ${initialDestination}` : 'Find nearest APMC mandis and seed stores'));
  }, []);

  const handleRunQuery = async (queryText: string, customOrigin?: string, customDest?: string) => {
    if (!queryText.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await queryGoogleMapsAgent({
        message: queryText,
        lat: userLat,
        lng: userLng,
        language,
        mode: activeTab === 'places' ? 'places' : activeTab === 'routes' ? 'routes' : 'all',
        origin: customOrigin || originInput,
        destination: customDest || destInput
      });

      setAgentResponse(response);
      if (response.places.length > 0) {
        setSelectedPlace(response.places[0]);
      }
    } catch (err: any) {
      console.error("Maps Agent error:", err);
      setErrorMsg(err?.message || "Failed to load Google Maps data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanRoute = () => {
    if (!originInput.trim() || !destInput.trim()) return;
    const query = `Provide driving directions, distance in km, travel duration, highways, and route steps from ${originInput} to ${destInput} for agricultural transit.`;
    handleRunQuery(query, originInput, destInput);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    let prompt = '';
    switch (category) {
      case 'mandi':
        prompt = 'Find APMC mandis and vegetable market yards near my location with operational auction hours';
        break;
      case 'supplier':
        prompt = 'Find certified agricultural input suppliers, seed stores, and fertilizer dealers near me';
        break;
      case 'cold_storage':
        prompt = 'Find cold storage warehouses and agricultural logistics facilities near me';
        break;
      case 'kvk':
        prompt = 'Find Krishi Vigyan Kendras (KVK) and agricultural university research stations';
        break;
      case 'soil_lab':
        prompt = 'Find certified soil testing laboratories and government agriculture testing centers';
        break;
      default:
        prompt = 'Find agricultural places, mandis, and input stores near me';
    }
    setSearchQuery(prompt);
    handleRunQuery(prompt);
  };

  // Quick Preset Prompts
  const quickPrompts = [
    { label: '🌾 APMC Mandis & Markets', query: 'Find nearest APMC Mandis and market yards with auction times' },
    { label: '🛣️ Route: Tumakuru to Yeshwanthpur', query: 'Route from Tumakuru to Yeshwanthpur APMC Bangalore with distance and travel time' },
    { label: '🌱 Certified Seed & Fertilizer Dealers', query: 'Find certified fertilizer and seed input shops near me' },
    { label: '❄️ Cold Storage Facilities', query: 'Find cold storage facilities for storing vegetables and potatoes' },
    { label: '🧪 Krishi Vigyan Kendra & Soil Labs', query: 'Find nearest Krishi Vigyan Kendra (KVK) and soil testing lab' },
  ];

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'mandi':
        return <Store size={18} className="text-[#003527]" />;
      case 'cold_storage':
        return <Warehouse size={18} className="text-blue-600" />;
      case 'kvk':
        return <Building2 size={18} className="text-amber-700" />;
      case 'soil_lab':
        return <Beaker size={18} className="text-purple-600" />;
      default:
        return <Store size={18} className="text-emerald-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#191C1D] flex flex-col font-['Inter']">
      
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-30 bg-[#003527] text-white shadow-md pt-4 pb-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all cursor-pointer text-white"
              aria-label="Back"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-[#b0f0d6] text-[#003527]">
                  <Compass size={18} strokeWidth={2.5} />
                </div>
                <h1 className="text-lg sm:text-xl font-black font-['Hanken_Grotesk'] tracking-tight">
                  Google Maps Agent
                </h1>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#b0f0d6]/20 text-[#b0f0d6] border border-[#b0f0d6]/30">
                  Real-Time Maps
                </span>
              </div>
              <p className="text-xs text-[#b0f0d6]/80 font-medium">
                Live Places, Route Guidance & APMC Mandi Directions
              </p>
            </div>
          </div>

          {/* GPS Location status pill */}
          <div className="flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/90">
            <MapPin size={14} className="text-[#b0f0d6] animate-pulse" />
            <span className="hidden md:inline">Location:</span>
            <span className="text-[#b0f0d6] truncate max-w-[120px] sm:max-w-[160px]">
              {latitude ? `${latitude.toFixed(3)}, ${longitude?.toFixed(3)}` : 'Karnataka (Auto-GPS)'}
            </span>
          </div>
        </div>

        {/* MODE NAVIGATION TABS */}
        <div className="max-w-6xl mx-auto mt-4 flex items-center gap-2 border-b border-white/15 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('agent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'agent'
                ? 'bg-white text-[#003527] shadow-sm'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <Sparkles size={16} />
            AI Maps Assistant
          </button>

          <button
            onClick={() => setActiveTab('places')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'places'
                ? 'bg-white text-[#003527] shadow-sm'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <Store size={16} />
            Agricultural Places & Mandis
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'routes'
                ? 'bg-white text-[#003527] shadow-sm'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <Navigation size={16} />
            Routes & Directions
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6">

        {/* 1. QUERY & SEARCH BAR */}
        <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200/80">
          {activeTab === 'routes' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Navigation size={14} className="text-[#003527]" />
                  Route & Travel Directions Planner
                </span>
                <span className="text-[11px] text-gray-500 font-medium">Google Maps Powered</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Origin (Starting Point / Village / Town):
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={originInput}
                      onChange={(e) => setOriginInput(e.target.value)}
                      placeholder="e.g. Tumakuru, Mandya, Kolar, Current Location"
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#003527] focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Destination (Mandi / Warehouse / Supplier):
                  </label>
                  <div className="relative">
                    <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                    <input
                      type="text"
                      value={destInput}
                      onChange={(e) => setDestInput(e.target.value)}
                      placeholder="e.g. Yeshwanthpur APMC Yard, Tumakuru Mandi, Cold Storage Nelamangala"
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#003527] focus:outline-hidden transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Truck size={15} className="text-gray-400" />
                  <span>Optimized for farm produce transit & heavy commercial vehicles</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={buildGoogleMapsDirectionsUrl(originInput, destInput)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <ExternalLink size={14} />
                    Open in Maps App
                  </a>
                  <button
                    onClick={handlePlanRoute}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#003527] hover:bg-[#064e3b] shadow-xs cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                    Calculate Route & Steps
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative flex items-center">
                <Search size={18} className="absolute left-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunQuery(searchQuery)}
                  placeholder={
                    activeTab === 'places'
                      ? "Search APMC mandis, seed shops, fertilizer stores, cold storage..."
                      : "Ask Google Maps Agent (e.g., 'Find nearest APMC mandis', 'Directions to Yeshwanthpur')"
                  }
                  className="w-full pl-10 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#003527] focus:outline-hidden transition-all"
                />
                <button
                  onClick={() => handleRunQuery(searchQuery)}
                  disabled={isLoading || !searchQuery.trim()}
                  className="absolute right-2 px-4 py-1.5 bg-[#003527] hover:bg-[#064e3b] text-white rounded-lg text-xs font-bold cursor-pointer transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-2xs"
                >
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Search</span>
                </button>
              </div>

              {/* QUICK CATEGORY PILLS */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                <span className="text-gray-400 font-semibold shrink-0">Quick Filter:</span>
                {[
                  { id: 'all', label: 'All Agri Places' },
                  { id: 'mandi', label: '🌾 APMC Mandis' },
                  { id: 'supplier', label: '🌱 Seed & Fertilizer Stores' },
                  { id: 'cold_storage', label: '❄️ Cold Storage' },
                  { id: 'kvk', label: '🏛️ KVK Centers' },
                  { id: 'soil_lab', label: '🧪 Soil Testing Labs' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleCategoryFilter(item.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === item.id
                        ? 'bg-[#003527] text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUICK PROMPT CHIPS */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
            <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 shrink-0">
              <Sparkles size={12} className="text-[#003527]" /> Suggestions:
            </span>
            {quickPrompts.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setSearchQuery(item.query);
                  handleRunQuery(item.query);
                }}
                className="text-xs text-gray-600 bg-gray-50 hover:bg-emerald-50/80 hover:text-[#003527] border border-gray-200/60 rounded-lg px-2.5 py-1 transition-colors cursor-pointer text-left"
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* LOADING INDICATOR */}
        {isLoading && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-3 border-emerald-100 border-t-[#003527] animate-spin flex items-center justify-center"></div>
              <Compass size={20} className="absolute inset-0 m-auto text-[#003527] animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Querying Real-Time Google Maps Data...</p>
              <p className="text-xs text-gray-500 mt-1">Grounding verified agricultural places, highways & driving directions</p>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-800 text-sm">
            <AlertCircle size={20} className="shrink-0 text-rose-600" />
            <div className="flex-1">{errorMsg}</div>
            <button
              onClick={() => handleRunQuery(searchQuery || 'Find nearest APMC mandis')}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* 2. AGENT RESULTS SECTION */}
        {agentResponse && !isLoading && (
          <div className="space-y-6">

            {/* ROUTE SUMMARY CARD (IF ROUTES PRESENT) */}
            {agentResponse.routes && agentResponse.routes.length > 0 && (
              <section className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl p-5 border border-emerald-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#003527] text-white">
                      <Navigation size={18} />
                    </div>
                    <h2 className="text-base font-black text-gray-900 font-['Hanken_Grotesk']">
                      Grounded Travel Route & Directions
                    </h2>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-[#003527]">
                    Live Google Directions
                  </span>
                </div>

                {agentResponse.routes.map((route, idx) => (
                  <div key={idx} className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-gray-200">
                      <div>
                        <span className="text-[11px] font-semibold text-gray-400 block uppercase">Distance</span>
                        <span className="text-base font-black text-gray-900">{route.distance}</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-gray-400 block uppercase">Est. Duration</span>
                        <span className="text-base font-black text-[#003527]">{route.duration}</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-gray-400 block uppercase">Key Highway</span>
                        <span className="text-xs font-bold text-gray-800 truncate block">{route.highway || 'NH 48'}</span>
                      </div>
                      <div className="flex items-center justify-end">
                        <a
                          href={route.directionsUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#003527] hover:bg-[#064e3b] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                        >
                          <Navigation size={14} />
                          Start Navigation
                        </a>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed bg-white/60 p-3 rounded-xl border border-gray-100">
                      {route.summary}
                    </p>

                    {/* TURN-BY-TURN WAYPOINTS */}
                    {route.steps && route.steps.length > 0 && (
                      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                          Step-by-Step Waypoint Guidance:
                        </span>
                        <div className="space-y-2">
                          {route.steps.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2.5 text-xs text-gray-700">
                              <div className="w-5 h-5 rounded-full bg-emerald-50 text-[#003527] font-bold flex items-center justify-center shrink-0 border border-emerald-200 text-[11px]">
                                {sIdx + 1}
                              </div>
                              <span className="leading-snug mt-0.5">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* AI AGENT ADVISORY & INSIGHTS TEXT */}
            <section className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[#003527]" />
                  <h3 className="text-sm font-bold text-gray-900 font-['Hanken_Grotesk']">
                    Google Maps Grounded Intelligence
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-gray-400">
                  Model: Gemini 3 Flash with Google Maps Tool
                </span>
              </div>

              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed text-xs sm:text-sm whitespace-pre-line">
                {agentResponse.text}
              </div>
            </section>

            {/* 3. GROUNDED PLACES & FACILITIES GRID */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-gray-900 font-['Hanken_Grotesk'] flex items-center gap-2">
                    <MapPin size={18} className="text-[#003527]" />
                    Verified Agricultural Places ({agentResponse.places?.length || 0})
                  </h3>
                  <p className="text-xs text-gray-500">
                    Sourced and grounded directly from real-time Google Maps data
                  </p>
                </div>
                <a
                  href={buildGoogleMapsSearchUrl(searchQuery || 'APMC mandi fertilizer stores near me')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#003527] hover:underline flex items-center gap-1"
                >
                  <span>Explore full map</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agentResponse.places && agentResponse.places.map((place) => (
                  <div
                    key={place.id}
                    className="bg-white hover:bg-emerald-50/20 rounded-2xl p-4 border border-gray-200 hover:border-emerald-300 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-white border border-gray-200 shrink-0 mt-0.5">
                            {getCategoryIcon(place.category)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#003527] transition-colors leading-snug">
                              {place.title}
                            </h4>
                            {place.address && (
                              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                {place.address}
                              </p>
                            )}
                          </div>
                        </div>

                        {place.rating && (
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-amber-800 text-xs font-bold shrink-0">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            <span>{place.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {place.reviewSnippet && (
                        <p className="text-xs text-gray-600 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100 italic line-clamp-2">
                          "{place.reviewSnippet}"
                        </p>
                      )}

                      {place.openStatus && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                          <Clock size={13} />
                          <span>{place.openStatus}</span>
                        </div>
                      )}
                    </div>

                    {/* ACTION BUTTONS (MANDATORY GROUNDING LINKS) */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      {place.uri ? (
                        <a
                          href={place.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-[#003527] transition-colors"
                        >
                          <ExternalLink size={13} />
                          <span>View on Google Maps</span>
                        </a>
                      ) : (
                        <a
                          href={buildGoogleMapsSearchUrl(place.title)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-[#003527] transition-colors"
                        >
                          <ExternalLink size={13} />
                          <span>Google Search</span>
                        </a>
                      )}

                      <a
                        href={place.directionsUri || buildGoogleMapsDirectionsUrl(originInput || 'Current Location', place.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#003527] hover:bg-[#064e3b] shadow-2xs transition-all active:scale-95"
                      >
                        <Navigation size={13} />
                        <span>Get Directions</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* 4. FOOTER COMPLIANCE & ATTRIBUTION */}
        <footer className="pt-6 pb-8 border-t border-gray-200/60 text-center text-xs text-gray-500 space-y-2">
          <p className="flex items-center justify-center gap-1.5">
            <Globe size={14} className="text-[#003527]" />
            <span>Connected to real-time Google Maps data via Google AI Studio</span>
          </p>
          <p className="text-[11px] text-gray-400">
            Internal attribution ID: <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">gmp_mcp_codeassist_v1_aistudio</code>
          </p>
        </footer>

      </main>
    </div>
  );
};
