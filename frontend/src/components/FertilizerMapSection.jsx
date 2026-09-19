import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowLeft, MapPin, AlertCircle, RefreshCw, Sparkles, Navigation, 
  ShoppingBag, CheckCircle2, ShieldCheck, LocateFixed, ChevronUp, ChevronDown, Maximize2, Minimize2,
  LayoutGrid, Map as MapIcon, Split
} from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { FERTILIZER_SHOPS, KARNATAKA_CENTROID } from '../data/fertilizerShops';
import { getShopOperatingStatus } from '../data/operatingHours';
import { FertilizerMap } from './FertilizerMap';
import { FertilizerFilters } from './FertilizerFilters';
import { FertilizerShopCard } from './FertilizerShopCard';

// Haversine distance calculator in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const FertilizerMapSection = ({
  onBack = () => {},
  initialSearch = '',
  language = 'en'
}) => {
  const { 
    latitude, 
    longitude, 
    accuracy, 
    loading: geoLoading, 
    error: gpsError, 
    isFallback, 
    refetch 
  } = useGeolocation();

  // Active filter state
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'organic' | 'chemical' | 'both'
  const [inStockOnly, setInStockOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [radius, setRadius] = useState(100); // default 100km to show Karnataka shops nicely
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);

  // View Mode: 'split' (50/50 Map & List) | 'list' (100% Stores List) | 'map' (100% Map)
  const [viewMode, setViewMode] = useState('split');

  const cardRefs = useRef({});

  // Reset filters handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setInStockOnly(false);
    setOpenNowOnly(false);
    setRadius(500);
    setSelectedProduct('');
  };

  // Compute distances and filter shops
  const processedShops = useMemo(() => {
    const userLat = latitude || KARNATAKA_CENTROID.lat;
    const userLng = longitude || KARNATAKA_CENTROID.lng;

    // 1. Calculate distance for every shop
    let list = FERTILIZER_SHOPS.map((shop) => {
      const dist = calculateDistanceKm(userLat, userLng, shop.lat, shop.lng);
      return {
        ...shop,
        distance: dist
      };
    });

    // 2. Filter by search query (name, address, product, district)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => {
        const matchName = s.name.toLowerCase().includes(q);
        const matchAddr = s.address.toLowerCase().includes(q);
        const matchDist = s.district && s.district.toLowerCase().includes(q);
        const matchProd = s.products && s.products.some((p) => p.toLowerCase().includes(q));
        return matchName || matchAddr || matchDist || matchProd;
      });
    }

    // 3. Filter by type (organic, chemical, both)
    if (selectedType !== 'all') {
      list = list.filter((s) => s.type === selectedType);
    }

    // 4. Filter by stock availability
    if (inStockOnly) {
      list = list.filter((s) => s.availability === 'available');
    }

    // 5. Filter by open status
    if (openNowOnly) {
      list = list.filter((s) => getShopOperatingStatus(s).isOpen);
    }

    // 6. Filter by radius
    if (radius && radius < 500) {
      list = list.filter((s) => s.distance <= radius);
    }

    // 7. Filter by specific selected product
    if (selectedProduct) {
      const prodQ = selectedProduct.toLowerCase();
      list = list.filter((s) => 
        s.products && s.products.some((p) => p.toLowerCase().includes(prodQ))
      );
    }

    // 8. Sorting: Available first -> then by distance ascending
    const sorted = list.sort((a, b) => {
      const stockOrder = { available: 0, low_stock: 1, unavailable: 2 };
      const stockDiff = (stockOrder[a.availability] ?? 2) - (stockOrder[b.availability] ?? 2);
      if (stockDiff !== 0) return stockDiff;
      return a.distance - b.distance;
    });

    return sorted;
  }, [latitude, longitude, searchQuery, selectedType, inStockOnly, openNowOnly, radius, selectedProduct]);

  // Active filter summary string for the map overlay badge
  const filterSummary = useMemo(() => {
    const parts = [];
    if (selectedType === 'organic') parts.push('🌿 Organic');
    else if (selectedType === 'chemical') parts.push('🧪 Chemical');
    else if (selectedType === 'both') parts.push('🌾 Both');
    
    if (inStockOnly) parts.push('In Stock');
    if (openNowOnly) parts.push('Open Now');
    if (selectedProduct) parts.push(selectedProduct);
    
    if (radius < 500) parts.push(`${radius}km`);
    else parts.push('Statewide');
    
    return parts.join(' • ');
  }, [selectedType, inStockOnly, openNowOnly, selectedProduct, radius]);

  // Scroll card into view when selected on map
  useEffect(() => {
    if (selectedShop && cardRefs.current[selectedShop.id]) {
      cardRefs.current[selectedShop.id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedShop]);

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-full bg-[#FAFAF8] text-gray-900 overflow-x-hidden overflow-y-hidden select-none">
      {/* Top Header with Back, Title, GPS Status and View Mode Switcher */}
      <header className="bg-white border-b border-[#E8EDE6] px-3 py-2 sm:px-5 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 z-30 shadow-xs">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              style={{ touchAction: 'manipulation' }}
              className="p-2 -ml-1 rounded-full hover:bg-gray-100 active:bg-gray-200 text-gray-700 transition-colors cursor-pointer shrink-0 min-w-[38px] min-h-[38px] flex items-center justify-center"
              aria-label="Go Back"
            >
              <ArrowLeft size={20} className="sm:w-[22px] sm:h-[22px]" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-gray-900 leading-tight truncate">
                Nearby Agro Suppliers
              </h1>
              <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium truncate">
                {processedShops.length} Stores Available • {processedShops.filter((s) => s.availability === 'available').length} In Stock
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 sm:hidden">
            {geoLoading ? (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full animate-pulse">
                GPS...
              </span>
            ) : isFallback ? (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Karnataka
              </span>
            ) : (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                GPS Ready
              </span>
            )}
            <button
              type="button"
              onClick={refetch}
              className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
              title="Refresh GPS"
            >
              <RefreshCw size={14} className={geoLoading ? 'animate-spin text-[#2D6A4F]' : ''} />
            </button>
          </div>
        </div>

        {/* View Mode Switcher: 50/50 Split | Stores Only | Map Only */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className="bg-[#F0F4EE] p-0.5 rounded-xl flex items-center border border-[#E0E8DC]">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              style={{ touchAction: 'manipulation' }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-[#2D6A4F] text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
              }`}
              title="50/50 Split View (Map & Stores)"
            >
              <Split size={13} />
              <span>50/50 Split</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{ touchAction: 'manipulation' }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#2D6A4F] text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
              }`}
              title="Stores List View"
            >
              <LayoutGrid size={13} />
              <span>Stores ({processedShops.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('map')}
              style={{ touchAction: 'manipulation' }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-[#2D6A4F] text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
              }`}
              title="Full Map View"
            >
              <MapIcon size={13} />
              <span>Map</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            {geoLoading ? (
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full animate-pulse">
                GPS...
              </span>
            ) : isFallback ? (
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                Karnataka
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                GPS Ready
              </span>
            )}
            <button
              type="button"
              onClick={refetch}
              className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
              title="Refresh GPS"
            >
              <RefreshCw size={15} className={geoLoading ? 'animate-spin text-[#2D6A4F]' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* Prominent GPS Warning Banner */}
      {gpsError && (
        <div className="shrink-0 px-3 sm:px-5 py-1.5 bg-red-50 border-b border-red-200 text-red-700 text-xs flex items-center justify-between z-20">
          <span className="truncate mr-2">⚠️ {gpsError}</span>
          <button onClick={refetch} className="underline font-bold text-xs shrink-0 cursor-pointer">Retry GPS</button>
        </div>
      )}

      {/* Main Dual-Pane / 50-50 Split Layout */}
      <main className="flex-1 min-h-0 w-full max-w-full flex flex-col md:flex-row overflow-hidden relative p-0 md:p-3 lg:p-4 md:gap-3">
        
        {/* MAP PANEL:
            - Split mode: 50% width on desktop, 48% height on mobile.
            - List mode: Hidden or collapsed preview.
            - Map mode: 100% width & height.
        */}
        <div className={`transition-all duration-300 overflow-hidden relative z-10 bg-slate-100 md:rounded-2xl md:border md:border-[#E8EDE6] shadow-none md:shadow-xs ${
          viewMode === 'map'
            ? 'w-full h-full flex-1'
            : viewMode === 'list'
            ? 'hidden'
            : 'w-full md:w-1/2 shrink-0 md:shrink h-[46vh] sm:h-[48vh] md:h-full flex flex-col'
        }`}>
          <FertilizerMap
            userLat={latitude || KARNATAKA_CENTROID.lat}
            userLng={longitude || KARNATAKA_CENTROID.lng}
            shops={processedShops}
            selectedShop={selectedShop}
            filterSummary={filterSummary}
            radiusKm={radius}
            onShopSelect={(shop) => setSelectedShop(shop)}
            onCenterOnMe={refetch}
          />
        </div>

        {/* LIST & FILTER PANEL:
            - Split mode: 50% width on desktop, 52-54% height on mobile.
            - List mode: 100% width & height for spacious store browsing.
            - Map mode: Collapsed floating bar.
        */}
        <div className={`flex flex-col min-h-0 bg-white md:rounded-2xl border-t md:border border-[#E8EDE6] shadow-sm overflow-hidden z-20 transition-all duration-300 ${
          viewMode === 'map'
            ? 'absolute bottom-2 left-2 right-2 md:left-auto md:right-4 md:w-96 max-h-[38vh] rounded-2xl border border-emerald-300 shadow-2xl bg-white'
            : viewMode === 'list'
            ? 'w-full h-full flex-1'
            : 'w-full md:w-1/2 flex-1 h-[54vh] sm:h-[52vh] md:h-full min-h-0'
        }`}>
          
          {/* Filters component: Clean Search, Radius & Horizontal Chips */}
          <FertilizerFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            inStockOnly={inStockOnly}
            onInStockToggle={() => setInStockOnly((prev) => !prev)}
            openNowOnly={openNowOnly}
            onOpenNowToggle={() => setOpenNowOnly((prev) => !prev)}
            radius={radius}
            onRadiusChange={setRadius}
            selectedProduct={selectedProduct}
            onProductSelect={setSelectedProduct}
            totalCount={processedShops.length}
            inStockCount={processedShops.filter((s) => s.availability === 'available').length}
            onReset={handleResetFilters}
          />

          {/* Scrollable Shop Cards List: Full visibility, bold shop names, prominent action buttons */}
          <div 
            className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-4 space-y-3 bg-[#FAFBF9]"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '120px' // Generous bottom padding so cards & buttons are never covered by any overlays
            }}
          >
            {processedShops.length === 0 ? (
              <div className="text-center py-8 sm:py-12 px-3 sm:px-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#2D6A4F] flex items-center justify-center mx-auto border border-emerald-100 shadow-2xs">
                  <MapPin size={22} />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
                  0 Shops Match Filters
                </h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  Try changing radius to Statewide, clearing keywords, or selecting All Types.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{ touchAction: 'manipulation' }}
                  className="min-h-[44px] px-4 py-2 bg-[#2D6A4F] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1B5E20] transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              processedShops.map((shop) => (
                <div 
                  key={shop.id} 
                  ref={(el) => (cardRefs.current[shop.id] = el)}
                  className="w-full max-w-full transition-all duration-200"
                >
                  <FertilizerShopCard
                    shop={shop}
                    isSelected={selectedShop?.id === shop.id}
                    onSelect={(s) => setSelectedShop(s)}
                    userLocation={{ lat: latitude, lng: longitude }}
                    onBackToHome={onBack}
                    onBack={onBack}
                  />
                </div>
              ))
            )}
          </div>

          {/* Bottom Summary Bar */}
          <div className="p-2 sm:p-2.5 bg-white border-t border-[#E8EDE6] text-xs text-gray-600 flex items-center justify-between shrink-0 select-none">
            <span className="font-semibold text-gray-800 flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="truncate">{processedShops.filter((s) => s.availability === 'available').length} Available In Stock</span>
            </span>
            <span className="text-[11px] text-[#2D6A4F] font-bold bg-[#D8F3DC] px-2 py-0.5 rounded-full shrink-0">
              {processedShops.length} Shops Found
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

