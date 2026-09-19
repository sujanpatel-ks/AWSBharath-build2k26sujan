import React, { useEffect, useRef, useState, useCallback } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { 
  Navigation, 
  Phone, 
  LocateFixed, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Compass, 
  Store, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  MapPin
} from 'lucide-react';

export interface Shop {
  id: number | string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'organic' | 'chemical' | 'both' | string;
  products?: string[];
  availability: 'available' | 'low_stock' | 'unavailable' | string;
  phone?: string;
  website?: string;
  isOpen?: boolean;
  rating?: number;
  district?: string;
  distance?: number;
}

interface GoogleFertilizerMapProps {
  userLat: number;
  userLng: number;
  shops: Shop[];
  selectedShop: Shop | null;
  filterSummary?: string;
  onShopSelect: (shop: Shop) => void;
  onCenterOnMe: () => void;
  radiusKm?: number;
  onError?: (errorMsg: string) => void;
}

export const GoogleFertilizerMap: React.FC<GoogleFertilizerMapProps> = ({
  userLat,
  userLng,
  shops,
  selectedShop,
  filterSummary = '',
  onShopSelect,
  onCenterOnMe,
  radiusKm = 100,
  onError
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string | number, google.maps.marker.AdvancedMarkerElement | google.maps.Marker>>(new Map());
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null>(null);
  const userCircleRef = useRef<google.maps.Circle | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const isMountedRef = useRef(true);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'hybrid' | 'terrain'>('roadmap');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const rawApiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 
                    (import.meta as any).env?.VITE_GOOGLE_PLACES_API_KEY || 
                    '';
  const apiKey = typeof rawApiKey === 'string' ? rawApiKey.trim() : '';
  const isValidKeyFormat = Boolean(
    apiKey && 
    apiKey.length >= 20 && 
    apiKey.startsWith('AIza') && 
    !apiKey.includes('YOUR_') && 
    !apiKey.includes('PLACEHOLDER')
  );

  // Initialize Google Maps API
  useEffect(() => {
    isMountedRef.current = true;
    let isCancelled = false;

    if (!isValidKeyFormat) {
      const errMsg = 'No valid Google Maps API Key provided. Using OpenStreetMap fallback.';
      setLoadError(errMsg);
      onError?.('InvalidKeyMapError');
      return;
    }

    // Catch global Google Maps auth failure
    const prevAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.warn('[GoogleMaps] Invalid Google Maps API Key detected (gm_authFailure). Falling back to OpenStreetMap.');
      if (isMountedRef.current && !isCancelled) {
        setLoadError('InvalidKeyMapError');
        onError?.('InvalidKeyMapError');
      }
      if (typeof prevAuthFailure === 'function') {
        try {
          prevAuthFailure();
        } catch {
          // ignore
        }
      }
    };

    const initMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        setOptions({
          key: apiKey,
          v: 'weekly'
        });

        await Promise.all([
          importLibrary('maps'),
          importLibrary('marker'),
          importLibrary('places'),
          importLibrary('geometry')
        ]);
        
        if (isCancelled || !mapContainerRef.current || !window.google || !window.google.maps) return;

        // Custom Agricultural Map Styles for high contrast rural readability
        const agroMapStyle: google.maps.MapTypeStyle[] = [
          {
            featureType: 'administrative',
            elementType: 'geometry',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'poi.business',
            elementType: 'geometry',
            stylers: [{ visibility: 'simplified' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry.fill',
            stylers: [{ color: '#c8e6c9' }, { visibility: 'on' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ visibility: 'on' }, { color: '#ffffff' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [{ color: '#ffe082' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry.fill',
            stylers: [{ color: '#b2ebf2' }]
          }
        ];

        const centerPos = {
          lat: userLat || 15.3173,
          lng: userLng || 75.7139
        };

        const map = new google.maps.Map(mapContainerRef.current, {
          center: centerPos,
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
          },
          styles: agroMapStyle,
          clickableIcons: true,
          mapId: 'DEMO_MAP_ID'
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new google.maps.InfoWindow();

        // User radius coverage circle
        if (radiusKm && radiusKm < 500) {
          userCircleRef.current = new google.maps.Circle({
            strokeColor: '#1B4332',
            strokeOpacity: 0.35,
            strokeWeight: 1.5,
            fillColor: '#52B788',
            fillOpacity: 0.08,
            map,
            center: centerPos,
            radius: radiusKm * 1000,
            clickable: false
          });
        }

        setMapLoaded(true);
      } catch (err: any) {
        console.warn('[GoogleMaps] Initialization notice:', err?.message);
        if (!isCancelled && isMountedRef.current) {
          const msg = err?.message || 'Google Maps failed to load';
          setLoadError(msg);
          onError?.(msg);
        }
      }
    };

    initMap();

    return () => {
      isCancelled = true;
      isMountedRef.current = false;
      if (userCircleRef.current) {
        userCircleRef.current.setMap(null);
      }
    };
  }, [apiKey, onError]);

  // Update user marker & circle when GPS coordinates change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google || !window.google.maps) return;

    const centerPos = { lat: userLat, lng: userLng };

    // Update user pulse marker
    if (userMarkerRef.current) {
      if ('setPosition' in userMarkerRef.current) {
        (userMarkerRef.current as google.maps.Marker).setPosition(centerPos);
      } else if ('position' in userMarkerRef.current) {
        (userMarkerRef.current as google.maps.marker.AdvancedMarkerElement).position = centerPos;
      }
    } else {
      const userDiv = document.createElement('div');
      userDiv.className = 'google-user-location-pin';
      userDiv.innerHTML = `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(37, 99, 235, 0.28); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 18px; height: 18px; border-radius: 50%; background: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 3px 8px rgba(0,0,0,0.35);"></div>
        </div>
      `;

      try {
        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          userMarkerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
            map: mapInstanceRef.current,
            position: centerPos,
            title: 'Your Location',
            content: userDiv
          });
        } else {
          userMarkerRef.current = new window.google.maps.Marker({
            position: centerPos,
            map: mapInstanceRef.current,
            title: 'Your Location',
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#2563EB',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2.5
            }
          });
        }
      } catch (e) {
        console.warn('[GoogleMaps] Fallback to standard user marker', e);
      }
    }

    if (userCircleRef.current) {
      userCircleRef.current.setCenter(centerPos);
      if (radiusKm && radiusKm < 500) {
        userCircleRef.current.setRadius(radiusKm * 1000);
        userCircleRef.current.setVisible(true);
      } else {
        userCircleRef.current.setVisible(false);
      }
    }
  }, [mapLoaded, userLat, userLng, radiusKm]);

  // Update shop markers on map
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google || !window.google.maps) return;

    const map = mapInstanceRef.current;
    if (!markersRef.current) {
      markersRef.current = new Map();
    }
    const currentMarkerMap = markersRef.current;
    const currentShopIds = new Set(shops.map(s => String(s.id)));

    // Clean up markers no longer in the list
    for (const [id, marker] of currentMarkerMap.entries()) {
      if (!currentShopIds.has(String(id))) {
        if (marker && 'map' in marker) {
          (marker as any).map = null;
        } else if (marker && 'setMap' in marker) {
          (marker as google.maps.Marker).setMap(null);
        }
        currentMarkerMap.delete(id);
      }
    }

    // Add or update markers for each shop with bounce entrance animation
    shops.forEach((shop, index) => {
      const isSelected = selectedShop?.id === shop.id;
      const existing = currentMarkerMap.get(String(shop.id));

      const isOrganic = shop.type === 'organic';
      const isChemical = shop.type === 'chemical';
      const isUnavailable = shop.availability === 'unavailable';

      const color = isUnavailable 
        ? '#6B7280' 
        : isOrganic 
        ? '#10B981' 
        : isChemical 
        ? '#2563EB' 
        : '#F59E0B';

      const symbol = isUnavailable 
        ? '✖' 
        : isOrganic 
        ? '🌿' 
        : isChemical 
        ? '🧪' 
        : '🌾';

      // Staggered bounce delay for entrance animation
      const staggerDelay = Math.min(index * 0.08, 0.9);

      // Create Custom Marker DOM Element for high visual fidelity with bounce animation
      const pinContainer = document.createElement('div');
      pinContainer.style.cursor = 'pointer';
      pinContainer.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
      pinContainer.style.transform = isSelected ? 'scale(1.22)' : 'scale(1)';
      pinContainer.style.zIndex = isSelected ? '999' : '10';
      pinContainer.style.transformOrigin = 'bottom center';
      
      // Apply drop bounce animation on initial load, or continuous gentle bounce when selected
      if (isSelected) {
        pinContainer.style.animation = 'markerContinuousBounce 1.5s ease-in-out infinite';
      } else {
        pinContainer.style.animation = `markerDropBounce 0.8s cubic-bezier(0.25, 1, 0.5, 1) ${staggerDelay}s both`;
      }

      pinContainer.innerHTML = `
        <div style="position: relative; width: 38px; height: 44px; display: flex; flex-direction: column; align-items: center;">
          <div style="
            width: 34px; 
            height: 34px; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg); 
            background: ${color}; 
            border: 2.5px solid #FFFFFF; 
            box-shadow: ${isSelected ? '0 0 0 4px #1B4332, 0 8px 18px rgba(0,0,0,0.4)' : '0 3px 10px rgba(0,0,0,0.25)'}; 
            display: flex; 
            align-items: center; 
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-size: 14px; line-height: 1; user-select: none;">${symbol}</span>
          </div>
        </div>
      `;

      const createInfoWindowContent = () => {
        const distanceStr = typeof shop.distance === 'number'
          ? `${shop.distance.toFixed(1)} km away`
          : shop.distance ? `${shop.distance} km away` : '';

        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`;

        return `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 4px; max-width: 260px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
              <span style="
                font-size: 10px; 
                font-weight: 700; 
                padding: 2px 8px; 
                border-radius: 9999px; 
                background: ${isOrganic ? '#D8F3DC' : isChemical ? '#DBEAFE' : '#FEF3C7'}; 
                color: ${isOrganic ? '#1B4332' : isChemical ? '#1E40AF' : '#92400E'};
              ">
                ${isOrganic ? '🌿 Organic' : isChemical ? '🧪 Chemical' : '🌾 Organic & Chem'}
              </span>
              ${distanceStr ? `<span style="font-size: 11px; font-weight: 700; color: #4B5563;">${distanceStr}</span>` : ''}
            </div>

            <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 800; color: #111827; line-height: 1.3;">
              ${shop.name}
            </h4>

            <p style="margin: 0 0 8px 0; font-size: 11px; color: #4B5563; line-height: 1.4;">
              ${shop.address}
            </p>

            ${shop.products && shop.products.length > 0 ? `
              <div style="margin-bottom: 10px; font-size: 10px; color: #374151; background: #F3F4F6; padding: 4px 8px; border-radius: 6px;">
                <strong>Stocked:</strong> ${shop.products.slice(0, 4).join(', ')}
              </div>
            ` : ''}

            <div style="display: flex; align-items: center; gap: 6px; padding-top: 6px; border-top: 1px solid #E5E7EB;">
              <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="
                flex: 1;
                background: #1B4332;
                color: #FFFFFF;
                font-size: 11px;
                font-weight: 700;
                padding: 6px 10px;
                border-radius: 8px;
                text-decoration: none;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
              ">
                <span>📍 Directions</span>
              </a>
              ${shop.website ? `
                <a href="${shop.website}" target="_blank" rel="noopener noreferrer" style="
                  background: #D8F3DC;
                  color: #1B4332;
                  font-size: 11px;
                  font-weight: 700;
                  padding: 6px 10px;
                  border-radius: 8px;
                  text-decoration: none;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 4px;
                ">
                  🌐 Site
                </a>
              ` : ''}
              ${shop.phone ? `
                <a href="tel:${shop.phone}" style="
                  background: #F3F4F6;
                  color: #111827;
                  font-size: 11px;
                  font-weight: 700;
                  padding: 6px 10px;
                  border-radius: 8px;
                  text-decoration: none;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  📞 Call
                </a>
              ` : ''}
            </div>
          </div>
        `;
      };

      const handleMarkerClick = () => {
        onShopSelect(shop);
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(createInfoWindowContent());
          if (existing && 'position' in existing) {
            infoWindowRef.current.open(map, existing);
          } else {
            infoWindowRef.current.setPosition({ lat: shop.lat, lng: shop.lng });
            infoWindowRef.current.open(map);
          }
        }
      };

      if (!existing) {
        let markerInstance: any;
        const position = { lat: shop.lat, lng: shop.lng };

        try {
          if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
            markerInstance = new window.google.maps.marker.AdvancedMarkerElement({
              map,
              position,
              title: shop.name,
              content: pinContainer
            });
            markerInstance.addListener('click', handleMarkerClick);
          } else {
            markerInstance = new window.google.maps.Marker({
              position,
              map,
              title: shop.name,
              animation: window.google.maps.Animation.DROP,
              icon: {
                path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: 6,
                fillColor: color,
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2
              }
            });
            markerInstance.addListener('click', handleMarkerClick);
          }
        } catch (e) {
          console.warn('[GoogleMaps] Marker creation error', e);
        }

        if (markerInstance) {
          currentMarkerMap.set(String(shop.id), markerInstance);
        }
      } else {
        // If already exists, update content/selection highlight
        if ('content' in existing) {
          (existing as any).content = pinContainer;
        }
      }
    });
  }, [mapLoaded, shops, selectedShop, onShopSelect]);

  // Pan to selected shop when changed
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !selectedShop || !window.google || !window.google.maps) return;

    const map = mapInstanceRef.current;
    map.panTo({ lat: selectedShop.lat, lng: selectedShop.lng });
    map.setZoom(14);

    const existingMarker = markersRef.current?.get(String(selectedShop.id));
    if (infoWindowRef.current && existingMarker) {
      const isOrganic = selectedShop.type === 'organic';
      const isChemical = selectedShop.type === 'chemical';
      const distanceStr = typeof selectedShop.distance === 'number'
        ? `${selectedShop.distance.toFixed(1)} km away`
        : selectedShop.distance ? `${selectedShop.distance} km away` : '';
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${selectedShop.lat},${selectedShop.lng}`;

      infoWindowRef.current.setContent(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 4px; max-width: 260px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="
              font-size: 10px; 
              font-weight: 700; 
              padding: 2px 8px; 
              border-radius: 9999px; 
              background: ${isOrganic ? '#D8F3DC' : isChemical ? '#DBEAFE' : '#FEF3C7'}; 
              color: ${isOrganic ? '#1B4332' : isChemical ? '#1E40AF' : '#92400E'};
            ">
              ${isOrganic ? '🌿 Organic' : isChemical ? '🧪 Chemical' : '🌾 Organic & Chem'}
            </span>
            ${distanceStr ? `<span style="font-size: 11px; font-weight: 700; color: #4B5563;">${distanceStr}</span>` : ''}
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 800; color: #111827; line-height: 1.3;">
            ${selectedShop.name}
          </h4>
          <p style="margin: 0 0 8px 0; font-size: 11px; color: #4B5563; line-height: 1.4;">
            ${selectedShop.address}
          </p>
          <div style="display: flex; align-items: center; gap: 6px; padding-top: 6px; border-top: 1px solid #E5E7EB;">
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="
              flex: 1;
              background: #1B4332;
              color: #FFFFFF;
              font-size: 11px;
              font-weight: 700;
              padding: 6px 10px;
              border-radius: 8px;
              text-decoration: none;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
            ">
              <span>📍 Directions</span>
            </a>
            ${selectedShop.website ? `
              <a href="${selectedShop.website}" target="_blank" rel="noopener noreferrer" style="
                background: #D8F3DC;
                color: #1B4332;
                font-size: 11px;
                font-weight: 700;
                padding: 6px 10px;
                border-radius: 8px;
                text-decoration: none;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
              ">
                🌐 Site
              </a>
            ` : ''}
            ${selectedShop.phone ? `
              <a href="tel:${selectedShop.phone}" style="
                background: #F3F4F6;
                color: #111827;
                font-size: 11px;
                font-weight: 700;
                padding: 6px 10px;
                border-radius: 8px;
                text-decoration: none;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                📞 Call
              </a>
            ` : ''}
          </div>
        </div>
      `);

      if ('position' in existingMarker) {
        infoWindowRef.current.open(map, existingMarker);
      } else {
        infoWindowRef.current.setPosition({ lat: selectedShop.lat, lng: selectedShop.lng });
        infoWindowRef.current.open(map);
      }
    }
  }, [selectedShop, mapLoaded]);

  // Center on user position
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: userLat, lng: userLng });
      mapInstanceRef.current.setZoom(13);
    }
    onCenterOnMe();
  };

  // Fit all shops in view
  const handleFitBounds = () => {
    if (!mapInstanceRef.current || shops.length === 0 || !window.google || !window.google.maps) return;
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: userLat, lng: userLng });
    shops.forEach(s => bounds.extend({ lat: s.lat, lng: s.lng }));
    mapInstanceRef.current.fitBounds(bounds, 50);
  };

  // Toggle Map Type (Roadmap, Satellite/Hybrid, Terrain)
  const cycleMapType = () => {
    if (!mapInstanceRef.current || !window.google || !window.google.maps) return;
    const nextType: 'roadmap' | 'hybrid' | 'terrain' = 
      mapTypeId === 'roadmap' ? 'hybrid' : mapTypeId === 'hybrid' ? 'terrain' : 'roadmap';
    
    setMapTypeId(nextType);
    if (nextType === 'roadmap') {
      mapInstanceRef.current.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
    } else if (nextType === 'hybrid') {
      mapInstanceRef.current.setMapTypeId(window.google.maps.MapTypeId.HYBRID);
    } else {
      mapInstanceRef.current.setMapTypeId(window.google.maps.MapTypeId.TERRAIN);
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[240px] sm:min-h-[300px] bg-slate-100 overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
    }`}>
      {/* Google Map Container Element */}
      <div 
        ref={mapContainerRef} 
        id="google-maps-supplier-canvas"
        className="w-full h-full min-h-full"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Floating Selected Filter Badge (Top-Left) */}
      {filterSummary && (
        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-gray-200/80 text-[10px] sm:text-xs font-bold text-gray-800 flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#1B4332]"></span>
          <span>{filterSummary}</span>
        </div>
      )}

      {/* Floating Map Legend (Top-Right) */}
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl shadow-md border border-gray-200 text-[9px] sm:text-[10px] font-bold text-gray-700 space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Organic</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span>Chemical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Organic & Chem</span>
        </div>
      </div>

      {/* Map Interactive Control Floating Action Buttons (Bottom-Right) */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 flex flex-col gap-2">
        {/* Fit Bounds / Show All */}
        <button
          type="button"
          onClick={handleFitBounds}
          style={{ touchAction: 'manipulation' }}
          className="w-10 h-10 sm:w-11 sm:h-11 bg-white hover:bg-emerald-50 active:bg-emerald-100 text-gray-800 rounded-xl shadow-lg border border-gray-200 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          title="Fit All Nearby Dealers on Map"
          aria-label="Fit All"
        >
          <Compass size={19} className="text-[#1B4332]" />
        </button>

        {/* Map Type Switcher (Roadmap / Satellite / Terrain) */}
        <button
          type="button"
          onClick={cycleMapType}
          style={{ touchAction: 'manipulation' }}
          className="w-10 h-10 sm:w-11 sm:h-11 bg-white hover:bg-emerald-50 active:bg-emerald-100 text-gray-800 rounded-xl shadow-lg border border-gray-200 flex items-center justify-center transition-transform active:scale-95 cursor-pointer relative"
          title={`Switch Map View (${mapTypeId.toUpperCase()})`}
          aria-label="Map Layer"
        >
          <Layers size={19} className="text-[#1B4332]" />
          <span className="absolute -bottom-1 -right-1 text-[8px] font-black bg-[#1B4332] text-white px-1 rounded-sm uppercase">
            {mapTypeId === 'roadmap' ? 'Map' : mapTypeId === 'hybrid' ? 'Sat' : 'Ter'}
          </span>
        </button>

        {/* Recenter on GPS */}
        <button
          type="button"
          onClick={handleRecenter}
          style={{ touchAction: 'manipulation' }}
          className="w-10 h-10 sm:w-11 sm:h-11 bg-white hover:bg-emerald-50 active:bg-emerald-100 text-gray-800 rounded-xl shadow-lg border border-gray-200 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          title="Center on My Location"
          aria-label="Locate Me"
        >
          <LocateFixed size={20} className="text-[#1B4332]" />
        </button>
      </div>

      {/* Google Maps Attribution & Live Status Pill */}
      <div className="absolute bottom-2 left-3 z-10 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-gray-200/60 text-[9px] font-semibold text-gray-600 flex items-center gap-1 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>Google Maps API • {shops.length} verified dealers</span>
      </div>
    </div>
  );
};
