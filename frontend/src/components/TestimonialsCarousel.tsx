import React, { useState } from 'react';
import { Star, Quote, CheckCircle, Sprout, MapPin } from 'lucide-react';

export interface Testimonial {
  id: string;
  farmerName: string;
  village: string;
  state: string;
  crop: string;
  quote: string;
  impact: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    farmerName: 'Ramesh Patel',
    village: 'Tumkur',
    state: 'Karnataka',
    crop: 'Tomato & Capsicum',
    quote: 'AgroCare Sentinel caught Early Blight on my tomato foliage 4 days before it spread. The weather gate told me not to spray before the storm, saving ₹4,500 in wasted fungicide!',
    impact: 'Saved ₹4,500 in input costs & 85% crop saved',
    rating: 5
  },
  {
    id: 't2',
    farmerName: 'Basavaraj Gowda',
    village: 'Mandya',
    state: 'Karnataka',
    crop: 'Paddy (Rice)',
    quote: 'The Kannada voice feature is incredible. I spoke in Kannada about brown planthopper, and within 30 seconds I had neem-oil dosage and nearest verified dealer address.',
    impact: 'Saved 2.5 acres from lodging damage',
    rating: 5
  },
  {
    id: 't3',
    farmerName: 'Lakshmi Devi',
    village: 'Chittoor',
    state: 'Andhra Pradesh',
    crop: 'Groundnut & Chilli',
    quote: 'Mandi Arbitrage showed me that Madanapalle APMC was offering ₹420 more per quintal than my local village middleman. We hired a shared tempo and made ₹18,000 extra profit!',
    impact: '+₹18,000 extra net profit on harvest',
    rating: 5
  },
  {
    id: 't4',
    farmerName: 'Suresh Patil',
    village: 'Kolhapur',
    state: 'Maharashtra',
    crop: 'Sugarcane',
    quote: 'The soil analysis tool prescribed exact potash and bio-fertilizer ratios for our red soil. Our cane girth improved significantly this season.',
    impact: 'Yield increased by 18% per acre',
    rating: 5
  },
  {
    id: 't5',
    farmerName: 'Manjunath K.',
    village: 'Kolar',
    state: 'Karnataka',
    crop: 'Potato',
    quote: 'Late Blight alert came right to my phone when humidity crossed 85%. The local ITK practice combined with organic spray prevented black rot completely.',
    impact: 'Zero chemical residue export harvest',
    rating: 5
  }
];

export const TestimonialsCarousel: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate list to achieve smooth infinite scroll loop
  const displayItems = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div 
      className="w-full my-6 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] font-['Plus_Jakarta_Sans',sans-serif]">
            Verified Field Impact & Testimonials
          </span>
        </div>
        <span className="text-[11px] text-[#6B7280]">
          {isPaused ? 'Paused (hovered)' : 'Hover to pause scroll'}
        </span>
      </div>

      {/* Infinite scrolling viewport */}
      <div className="relative w-full overflow-hidden py-2 mask-[linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div 
          className="flex gap-4 w-max"
          style={{
            animation: 'scrollHorizontal 35s linear infinite',
            animationPlayState: isPaused ? 'paused' : 'running'
          }}
        >
          {displayItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="w-72 sm:w-80 bg-white rounded-2xl p-4.5 border border-[#E8EDE6] shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#52B788] transition-all flex flex-col justify-between shrink-0"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold bg-[#D8F3DC] text-[#2D6A4F] px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle size={10} /> Verified Farmer
                  </span>
                </div>

                <p className="text-xs text-[#374151] leading-relaxed italic mb-3">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-2.5 border-t border-[#F0F4EF] flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-[#1A1A1A] text-xs leading-none">
                    {item.farmerName}
                  </h4>
                  <p className="text-[11px] text-[#6B7280] flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-[#52B788]" />
                    {item.village}, {item.state}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-medium text-[#2D6A4F] flex items-center gap-1">
                    <Sprout size={11} /> {item.crop}
                  </span>
                  <span className="text-[10px] font-bold text-[#1B4332] block">
                    {item.impact}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scrollHorizontal {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default TestimonialsCarousel;
