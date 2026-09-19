import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Scan, 
  Target, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  Maximize2,
  Crosshair,
  Layers,
  Leaf
} from 'lucide-react';

interface FoliageBiometricHUDProps {
  isScanning?: boolean;
  cropLabel?: string;
  detectedLesionsCount?: number;
  className?: string;
  showTelemetry?: boolean;
}

export const FoliageBiometricHUD: React.FC<FoliageBiometricHUDProps> = ({
  isScanning = true,
  cropLabel = 'Leaf Foliage',
  detectedLesionsCount = 3,
  className = '',
  showTelemetry = true
}) => {
  const [chlorophyllIndex, setChlorophyllIndex] = useState(79.4);
  const [spectralVariance, setSpectralVariance] = useState(0.84);
  const [focusLocked, setFocusLocked] = useState(true);

  // Subtle telemetry jitter to simulate real optical sensor streaming
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setChlorophyllIndex(prev => +(prev + (Math.random() * 0.8 - 0.4)).toFixed(1));
      setSpectralVariance(prev => +(prev + (Math.random() * 0.04 - 0.02)).toFixed(2));
    }, 1200);
    return () => clearInterval(interval);
  }, [isScanning]);

  return (
    <div className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}>
      {/* Dynamic Laser Sweep Line */}
      {isScanning && (
        <motion.div
          animate={{
            top: ['4%', '92%', '4%'],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute left-4 right-4 h-0.5 z-20"
        >
          {/* Main Laser Core */}
          <div className="w-full h-full bg-gradient-to-r from-transparent via-[#52B788] to-transparent shadow-[0_0_12px_#52B788,0_0_24px_#2D6A4F]" />
          {/* Laser Trailing Aura */}
          <div className="w-full h-8 -mt-8 bg-gradient-to-t from-[#52B788]/20 to-transparent blur-xs pointer-events-none" />
        </motion.div>
      )}

      {/* Viewfinder Target Framing Box */}
      <div className="absolute inset-8 sm:inset-14 flex items-center justify-center">
        <div className="relative w-full h-full max-w-sm max-h-[380px] rounded-3xl border border-white/20">
          
          {/* Precision Corner Reticles */}
          {/* Top-Left */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-3 border-l-3 border-[#52B788] rounded-tl-xl" />
          {/* Top-Right */}
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-3 border-r-3 border-[#52B788] rounded-tr-xl" />
          {/* Bottom-Left */}
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-3 border-l-3 border-[#52B788] rounded-bl-xl" />
          {/* Bottom-Right */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-3 border-r-3 border-[#52B788] rounded-br-xl" />

          {/* Central Optical Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={isScanning ? { rotate: [0, 90, 180, 270, 360] } : { rotate: 0 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full border border-dashed border-[#52B788]/40 flex items-center justify-center"
            >
              <div className="w-8 h-8 rounded-full border border-[#52B788]/70 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#52B788] animate-ping" />
              </div>
            </motion.div>
          </div>

          {/* Target Lesion Micro-Markers (Simulated pathology bounding points) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1/4 left-1/3 w-6 h-6 border border-amber-400/80 rounded-md flex items-center justify-center"
          >
            <span className="text-[8px] font-mono font-bold text-amber-300 absolute -top-3.5 -left-1 bg-black/60 px-1 rounded">
              P-1
            </span>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: 0.3 }}
            className="absolute bottom-1/3 right-1/4 w-7 h-7 border border-amber-400/80 rounded-md flex items-center justify-center"
          >
            <span className="text-[8px] font-mono font-bold text-amber-300 absolute -bottom-3.5 -right-1 bg-black/60 px-1 rounded">
              P-2
            </span>
          </motion.div>

          {/* Floating Live Telemetry Overlay in Reticle */}
          {showTelemetry && (
            <>
              {/* Top HUD Stats */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/90">
                <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#52B788] animate-pulse" />
                  <span className="tracking-wider uppercase font-semibold">Optical Lock</span>
                </div>
                <div className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-emerald-300 font-bold">
                  {cropLabel}
                </div>
              </div>

              {/* Bottom HUD Sensors */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/90">
                <div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                  <Leaf size={11} className="text-[#52B788]" />
                  <span>CHL: {chlorophyllIndex}%</span>
                </div>
                <div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                  <Activity size={11} className="text-amber-400" />
                  <span>VAR: {spectralVariance}σ</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#52b788_1px,transparent_1px),linear-gradient(to_bottom,#52b788_1px,transparent_1px)] bg-[size:32px_32px]"
      />
    </div>
  );
};

export default FoliageBiometricHUD;
