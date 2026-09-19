import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Zap, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FoliageBiometricHUD } from './FoliageBiometricHUD';

interface CameraDiagnosisProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export const CameraDiagnosis: React.FC<CameraDiagnosisProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isNativeCameraOpen, setIsNativeCameraOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const handleNativeCameraMessage = (event: MessageEvent) => {
      if (typeof event.data !== 'string') return;

      try {
        const message = JSON.parse(event.data);
        if (message?.type === 'AGROCARE_NATIVE_CAMERA_RESULT' && typeof message.dataUrl === 'string') {
          setFlash(true);
          setTimeout(() => setFlash(false), 150);
          setTimeout(() => onCapture(message.dataUrl), 200);
          setIsNativeCameraOpen(false);
        }

        if (message?.type === 'AGROCARE_NATIVE_CAMERA_CANCELLED') {
          setIsNativeCameraOpen(false);
          setError('Camera was closed. Try again or upload a crop photo instead.');
        }
      } catch {
        // Ignore messages that do not belong to the native camera bridge.
      }
    };

    window.addEventListener('message', handleNativeCameraMessage);
    document.addEventListener('message', handleNativeCameraMessage as EventListener);
    startCamera();
    return () => {
      window.removeEventListener('message', handleNativeCameraMessage);
      document.removeEventListener('message', handleNativeCameraMessage as EventListener);
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError(null);

    // Expo Go's WebView does not expose the browser getUserMedia API.
    // The native wrapper handles camera access and returns a captured image.
    if (window.ReactNativeWebView?.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'AGROCARE_OPEN_NATIVE_CAMERA' }));
      setIsNativeCameraOpen(true);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported in this browser. Upload a crop photo instead.');
      return;
    }

    try {
      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
      } catch (cameraError) {
        const errorName = cameraError instanceof DOMException ? cameraError.name : '';
        if (!['NotFoundError', 'OverconstrainedError'].includes(errorName)) {
          throw cameraError;
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (err) {
      console.error('Camera initialization failed:', err);
      const errorName = err instanceof DOMException ? err.name : '';
      setError(
        errorName === 'NotAllowedError' || errorName === 'SecurityError'
          ? 'Camera permission is blocked. Allow camera access in your browser settings or upload a crop photo instead.'
          : 'Camera is unavailable right now. Upload a crop photo instead.',
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg');
        setFlash(true);
        setTimeout(() => setFlash(false), 150);
        
        // Give a small delay for the flash effect
        setTimeout(() => {
          onCapture(base64);
          stopCamera();
        }, 200);
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onCapture(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {isNativeCameraOpen ? (
          <div className="text-white text-center p-6">
            <p className="mb-2 font-semibold">Opening your phone camera…</p>
            <p className="text-sm text-white/70">Allow camera access when Expo Go asks.</p>
          </div>
        ) : error ? (
          <div className="text-white text-center p-6">
            <p className="mb-4">{error}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={startCamera} className="px-6 py-2 bg-white text-black rounded-full font-bold">Try again</button>
              <button onClick={() => uploadInputRef.current?.click()} className="px-6 py-2 bg-emerald-400 text-black rounded-full font-bold">Upload photo</button>
              <button onClick={onClose} className="px-6 py-2 bg-white/20 text-white rounded-full font-bold">Close</button>
            </div>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}

        {/* Advanced Foliage Biometric HUD Scanner with Laser Reticle Sweep */}
        <FoliageBiometricHUD isScanning={isActive} cropLabel="Foliar Target" showTelemetry={true} />

        {/* Flash Effect */}
        <AnimatePresence>
          {flash && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white z-50"
            />
          )}
        </AnimatePresence>

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={onClose} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white">
            <X size={24} />
          </button>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
            <Zap size={16} className="text-yellow-400" />
            <span className="text-white text-xs font-bold uppercase tracking-wider">AI Scanner Active</span>
          </div>
          <button onClick={startCamera} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white">
            <RefreshCw size={24} />
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-10 flex justify-center items-center bg-gradient-to-t from-black/50 to-transparent">
          <button 
            onClick={capturePhoto}
            disabled={!isActive}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 bg-white rounded-full group-hover:scale-90 transition-transform" />
          </button>
        </div>
      </div>

      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
