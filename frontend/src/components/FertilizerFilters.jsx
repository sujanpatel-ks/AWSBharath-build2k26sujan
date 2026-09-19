import React from 'react';
import { Search, X, SlidersHorizontal, Check, RefreshCw } from 'lucide-react';

export const FertilizerFilters = ({
  searchQuery = '',
  onSearchChange = () => {},
  selectedType = 'all', // 'all' | 'organic' | 'chemical' | 'both'
  onTypeChange = () => {},
  inStockOnly = false,
  onInStockToggle = () => {},
  openNowOnly = false,
  onOpenNowToggle = () => {},
  radius = 50, // in km (5, 10, 25, 50, 100, 500)
  onRadiusChange = () => {},
  selectedProduct = '',
  onProductSelect = () => {},
  totalCount = 0,
  inStockCount = 0,
  onReset = () => {}
}) => {
  const types = [
    { id: 'all', label: 'All Types' },
    { id: 'organic', label: '🌿 Organic' },
    { id: 'chemical', label: '🧪 Chemical' },
    { id: 'both', label: '🌾 Both' }
  ];

  const radiusOptions = [
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: 25, label: '25 km' },
    { value: 50, label: '50 km' },
    { value: 100, label: '100 km' },
    { value: 500, label: 'Statewide' }
  ];

  const popularProducts = ['Seeds', 'Tools', 'Mancozeb', 'Neem Cake', 'Urea', 'DAP', 'Vermicompost'];

  const hasActiveFilters = searchQuery || selectedType !== 'all' || inStockOnly || openNowOnly || radius < 500 || selectedProduct;

  return (
    <div className="bg-white border-b border-[#E8EDE6] p-3 sm:p-3.5 space-y-2 shrink-0">
      {/* Prominent Shop Count & Radius Header Banner */}
      <div className="flex items-center justify-between bg-emerald-50/90 border border-emerald-200/80 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="text-xs sm:text-sm font-black text-[#1B4332] truncate">
            {totalCount} {totalCount === 1 ? 'Shop Found' : 'Shops Available'}
          </span>
          {inStockCount > 0 && (
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-white/90 border border-emerald-200 px-1.5 sm:px-2 py-0.5 rounded-full hidden xs:inline shrink-0">
              {inStockCount} In Stock
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              style={{ touchAction: 'manipulation' }}
              className="text-[10px] sm:text-[11px] font-bold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200 px-2 sm:px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            >
              <RefreshCw size={10} />
              <span>Reset</span>
            </button>
          )}
          <span className="text-[10px] sm:text-[11px] font-bold text-[#2D6A4F] bg-white border border-emerald-200/80 px-2 py-1 rounded-lg shrink-0">
            {radius === 500 ? 'Statewide' : `${radius}km`}
          </span>
        </div>
      </div>

      {/* Search Input + Radius Select in a single unified responsive row */}
      <div className="flex items-center gap-2">
        {/* Search Box */}
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search shops, products, town..."
            className="w-full bg-[#F8FAF6] border border-[#E8EDE6] rounded-xl pl-8 sm:pl-8.5 pr-7 sm:pr-8 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              style={{ touchAction: 'manipulation' }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Radius Dropdown */}
        <select
          value={radius}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          style={{ touchAction: 'manipulation' }}
          className="bg-[#F8FAF6] border border-[#E8EDE6] text-gray-800 text-xs font-semibold rounded-xl px-2 sm:px-2.5 py-2 focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] cursor-pointer shrink-0"
        >
          {radiusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Chips: Horizontally scrollable single row, touch-friendly, never wrapped */}
      <div 
        className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1 select-none"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
      >
        {/* Type selector pills */}
        {types.map((t) => {
          const isActive = selectedType === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTypeChange(t.id)}
              style={{ touchAction: 'manipulation' }}
              className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#2D6A4F] text-white shadow-xs'
                  : 'bg-white border border-[#E8EDE6] text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          );
        })}

        <div className="w-[1px] h-3.5 bg-gray-200 shrink-0 mx-0.5"></div>

        {/* In Stock Toggle */}
        <button
          type="button"
          onClick={onInStockToggle}
          style={{ touchAction: 'manipulation' }}
          className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5 ${
            inStockOnly
              ? 'bg-[#2D6A4F] text-white shadow-xs'
              : 'bg-white border border-[#E8EDE6] text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${inStockOnly ? 'bg-emerald-300' : 'bg-emerald-500'}`}></span>
          <span>In Stock</span>
        </button>

        {/* Open Now Toggle */}
        <button
          type="button"
          onClick={onOpenNowToggle}
          style={{ touchAction: 'manipulation' }}
          className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5 ${
            openNowOnly
              ? 'bg-[#2D6A4F] text-white shadow-xs'
              : 'bg-white border border-[#E8EDE6] text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${openNowOnly ? 'bg-emerald-300' : 'bg-blue-500'}`}></span>
          <span>Open Now</span>
        </button>

        {/* Quick Product Chips */}
        {popularProducts.map((prod) => {
          const isActive = selectedProduct.toLowerCase() === prod.toLowerCase();
          return (
            <button
              key={prod}
              type="button"
              onClick={() => onProductSelect(isActive ? '' : prod)}
              style={{ touchAction: 'manipulation' }}
              className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-emerald-700 text-white font-bold'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
              }`}
            >
              {prod}
            </button>
          );
        })}
      </div>
    </div>
  );
};
