import { useState, useEffect, useCallback } from 'react';

const KARNATAKA_CENTROID = {
  latitude: 15.3173,
  longitude: 75.7139
};

export interface GeolocationResult {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  refetch: () => void;
  requestLocation: () => void;
}

export function useGeolocation(): GeolocationResult {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const fetchLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLatitude(KARNATAKA_CENTROID.latitude);
      setLongitude(KARNATAKA_CENTROID.longitude);
      setIsFallback(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy: acc } = position.coords;
        setLatitude(lat);
        setLongitude(lng);
        setAccuracy(acc || 0);
        setError(null);
        setIsFallback(false);
        setLoading(false);
      },
      (err) => {
        let message = 'Unable to retrieve your location.';
        if (err.code === 1) {
          message = 'Location permission was denied. Please allow location access in your browser settings.';
        } else if (err.code === 2) {
          message = 'Location position unavailable. GPS signal could not be acquired.';
        } else if (err.code === 3) {
          message = 'GPS request timed out. Retrying or using fallback.';
        }
        
        console.warn('GPS Geolocation error:', message, err);
        setError(message);
        setLatitude(KARNATAKA_CENTROID.latitude);
        setLongitude(KARNATAKA_CENTROID.longitude);
        setAccuracy(null);
        setIsFallback(true);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0
      }
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    latitude,
    longitude,
    accuracy,
    loading,
    error,
    isFallback,
    refetch: fetchLocation,
    requestLocation: fetchLocation
  };
}
