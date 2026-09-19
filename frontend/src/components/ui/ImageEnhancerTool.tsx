import React, { useState } from 'react';
import { Sliders, Sun, Contrast, Wand2, RefreshCw, Eye } from 'lucide-react';

interface ImageEnhancerToolProps {
  imageSrc: string;
  onEnhancedImageChange?: (enhancedDataUrl: string) => void;
  boundingBox?: [number, number, number, number];
}

export const ImageEnhancerTool: React.FC<ImageEnhancerToolProps> = ({
  imageSrc,
  onEnhancedImageChange,
  boundingBox
}) => {
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [sharpness, setSharpness] = useState<number>(100);
  const [showBoundingBox, setShowBoundingBox] = useState<boolean>(true);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);

  const applyAutoEnhance = () => {
    setIsEnhancing(true);
    setBrightness(112);
    setContrast(120);
    setSharpness(125);
    setTimeout(() => {
      setIsEnhancing(false);
    }, 300);
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSharpness(100);
  };

  const filterStyle: React.CSSProperties = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${sharpness}%)`,
    transition: 'filter 0.2s ease-out'
  };

  return (
    <div id="image-enhancer-tool" className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950">
      {/* Image Preview Canvas */}
      <div className="relative aspect-4/3 sm:aspect-16/10 w-full overflow-hidden flex items-center justify-center bg-black/40">
        <img
          src={imageSrc}
          alt="Crop Diagnostic Target"
          style={filterStyle}
          className="w-full h-full object-contain"
          crossOrigin="anonymous"
        />

        {/* Bounding Box Overlay if coordinates provided */}
        {showBoundingBox && boundingBox && boundingBox.length === 4 && (
          <div
            className="absolute border-2 border-emerald-400 bg-emerald-500/15 rounded-lg shadow-sm animate-pulse pointer-events-none"
            style={{
              top: `${(boundingBox[0] / 1000) * 100}%`,
              left: `${(boundingBox[1] / 1000) * 100}%`,
              height: `${((boundingBox[2] - boundingBox[0]) / 1000) * 100}%`,
              width: `${((boundingBox[3] - boundingBox[1]) / 1000) * 100}%`,
            }}
          >
            <span className="absolute -top-6 left-0 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
              Detected Pathology Zone
            </span>
          </div>
        )}

        {/* Bounding box toggle button */}
        {boundingBox && (
          <button
            type="button"
            onClick={() => setShowBoundingBox(!showBoundingBox)}
            className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 border border-white/20 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            {showBoundingBox ? 'Hide Zone' : 'Show Zone'}
          </button>
        )}
      </div>

      {/* Enhancement Controls Bar */}
      <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-300">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={applyAutoEnhance}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5" />
            {isEnhancing ? 'Optimizing...' : 'Field Auto-Enhance'}
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Reset
          </button>
        </div>

        <div className="flex items-center gap-3 text-zinc-400">
          <span className="text-[11px] hidden sm:inline">Visual Filter:</span>
          <div className="flex items-center gap-1.5">
            <Sun className="w-3 h-3" />
            <span className="text-[11px]">{brightness}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Contrast className="w-3 h-3" />
            <span className="text-[11px]">{contrast}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
