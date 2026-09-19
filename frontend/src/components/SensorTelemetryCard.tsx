import React, { useEffect, useState } from 'react';
import { Battery, Droplets, RefreshCw, Thermometer, Wifi, WifiOff } from 'lucide-react';
import { SensorTelemetry, fetchSensorTelemetry } from '../services/sensorService';
import { Language } from '../types';

interface SensorTelemetryCardProps {
  language: Language;
}

interface SensorLabels {
  title: string;
  live: string;
  offline: string;
  moisture: string;
  canopy: string;
  battery: string;
  retry: string;
}

const labels: Partial<Record<Language, SensorLabels>> = {
  en: { title: 'Field IoT Telemetry', live: 'Live gateway', offline: 'Gateway unavailable', moisture: 'Soil moisture', canopy: 'Canopy temp', battery: 'Battery', retry: 'Retry' },
  hi: { title: 'खेत IoT टेलीमेट्री', live: 'लाइव गेटवे', offline: 'गेटवे उपलब्ध नहीं', moisture: 'मिट्टी की नमी', canopy: 'पत्ती तापमान', battery: 'बैटरी', retry: 'पुनः प्रयास' },
  kn: { title: 'ಹೊಲದ IoT ಟೆಲಿಮೆಟ್ರಿ', live: 'ಲೈವ್ ಗೇಟ್‌ವೇ', offline: 'ಗೇಟ್‌ವೇ ಲಭ್ಯವಿಲ್ಲ', moisture: 'ಮಣ್ಣಿನ ತೇವಾಂಶ', canopy: 'ಎಲೆ ತಾಪಮಾನ', battery: 'ಬ್ಯಾಟರಿ', retry: 'ಮರುಪ್ರಯತ್ನ' },
};

export const SensorTelemetryCard: React.FC<SensorTelemetryCardProps> = ({ language }) => {
  const [telemetry, setTelemetry] = useState<SensorTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const t = labels[language] || labels.en;

  const loadTelemetry = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      setTelemetry(await fetchSensorTelemetry(signal));
      setError(false);
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) setError(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void loadTelemetry(controller.signal);
    const interval = window.setInterval(() => void loadTelemetry(), 60_000);
    return () => { controller.abort(); window.clearInterval(interval); };
  }, []);

  const isOffline = error || telemetry?.status === 'offline';
  return (
    <section aria-labelledby="iot-telemetry-title" className="rounded-2xl border border-[#bfc9c3]/40 bg-white p-4 shadow-2xs">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {isOffline ? <WifiOff size={17} className="text-amber-600" /> : <Wifi size={17} className="text-[#2D6A4F]" />}
          <h3 id="iot-telemetry-title" className="font-bold text-sm text-[#191c1d]">{t.title}</h3>
        </div>
        <button type="button" onClick={() => void loadTelemetry()} disabled={loading} aria-label={t.retry} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      {loading && !telemetry ? <p className="text-xs text-gray-500">{t.live}…</p> : isOffline ? <p className="text-xs text-amber-700">{t.offline}. {t.retry}.</p> : (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-xl bg-blue-50 p-2"><Droplets size={14} className="text-blue-600 mb-1" /><span className="block text-gray-500">{t.moisture}</span><strong>{telemetry?.soilMoisturePercent.toFixed(0)}%</strong></div>
          <div className="rounded-xl bg-orange-50 p-2"><Thermometer size={14} className="text-orange-600 mb-1" /><span className="block text-gray-500">{t.canopy}</span><strong>{telemetry?.canopyTemperatureC.toFixed(1)}°C</strong></div>
          <div className="rounded-xl bg-emerald-50 p-2"><Battery size={14} className="text-emerald-700 mb-1" /><span className="block text-gray-500">{t.battery}</span><strong>{telemetry?.batteryLevelPercent.toFixed(0)}%</strong></div>
        </div>
      )}
    </section>
  );
};
