import React, { useState, useEffect } from 'react';
import { GoogleFertilizerMap } from './GoogleFertilizerMap';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Phone, LocateFixed, Layers, Maximize2, Sparkles, MapPin, Globe } from 'lucide-react';

// Fix Leaflet's broken default icon (bundler issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom user location pulsing blue icon for Leaflet fallback
const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-user-location-marker',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(37, 99, 235, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 16px; height: 16px; border-radius: 50%; background: #2563EB; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Custom shop pin generator for Leaflet fallback
const createShopPinIcon = (type, availability, isSelected, index = 0) => {
  let color = '#F59E0B'; // Default yellow for both
  let symbol = '🌾';

  if (availability === 'unavailable') {
    color = '#6B7280'; // Gray
    symbol = '✖';
  } else if (type === 'organic') {
    color = '#10B981'; // Green
    symbol = '🌿';
  } else if (type === 'chemical') {
    color = '#2563EB'; // Blue
    symbol = '🧪';
  } else {
    color = '#D97706'; // Yellow/Amber
    symbol = '🌾';
  }

  const ringStyle = isSelected 
    ? `box-shadow: 0 0 0 4px #2D6A4F, 0 8px 16px rgba(0,0,0,0.35); transform: scale(1.18); z-index: 1000;` 
    : `box-shadow: 0 3px 8px rgba(0,0,0,0.25);`;

  const staggerDelay = Math.min(index * 0.08, 0.9);
  const animationStyle = isSelected
    ? 'animation: markerContinuousBounce 1.5s ease-in-out infinite; transform-origin: bottom center;'
    : `animation: markerDropBounce 0.8s cubic-bezier(0.25, 1, 0.5, 1) ${staggerDelay}s both; transform-origin: bottom center;`;

  return L.divIcon({
    className: `custom-shop-pin ${isSelected ? 'is-selected' : ''}`,
    html: `
      <div style="position: relative; width: 36px; height: 42px; display: flex; flex-direction: column; align-items: center; cursor: pointer; ${animationStyle}">
        <div style="width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: ${color}; border: 2.5px solid #ffffff; ${ringStyle} display: flex; align-items: center; justify-content: center;">
          <span style="transform: rotate(45deg); font-size: 13px; line-height: 1;">${symbol}</span>
        </div>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 40],
    popupAnchor: [0, -38]
  });
};

const LeafletMapController = ({ userLat, userLng, selectedShop, centerTrigger }) => {
  const map = useMap();
  const prevSelectedIdRef = React.useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (centerTrigger > 0 && userLat && userLng) {
      map.flyTo([userLat, userLng], 13, { duration: 1.2 });
    }
  }, [centerTrigger, userLat, userLng, map]);

  useEffect(() => {
    if (selectedShop && selectedShop.lat && selectedShop.lng) {
      if (prevSelectedIdRef.current !== selectedShop.id) {
        prevSelectedIdRef.current = selectedShop.id;
        map.flyTo([selectedShop.lat, selectedShop.lng], 14, { duration: 1.0 });
      }
    }
  }, [selectedShop, map]);

  return null;
};

export const FertilizerMap = ({
  userLat = 15.3173,
  userLng = 75.7139,
  shops = [],
  selectedShop = null,
  filterSummary = '',
  onShopSelect = () => {},
  onCenterOnMe = () => {},
  radiusKm = 100
}) => {
  const googleApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '').trim();
  const hasValidGoogleKey = Boolean(
    googleApiKey && 
    googleApiKey.length >= 20 && 
    googleApiKey.startsWith('AIza') &&
    !googleApiKey.includes('YOUR_') &&
    !googleApiKey.includes('PLACEHOLDER')
  );

  const [useGoogleMaps, setUseGoogleMaps] = useState(hasValidGoogleKey);
  const [centerTrigger, setCenterTrigger] = useState(0);

  // Sync state if key changes
  useEffect(() => {
    setUseGoogleMaps(hasValidGoogleKey);
  }, [hasValidGoogleKey]);

  const handleCenterClick = () => {
    setCenterTrigger((prev) => prev + 1);
    onCenterOnMe();
  };

  // Render Google Maps API view when key is configured and valid
  if (useGoogleMaps && hasValidGoogleKey) {
    return (
      <div className="relative w-full h-full min-h-[240px] sm:min-h-[280px]">
        <GoogleFertilizerMap
          userLat={userLat}
          userLng={userLng}
          shops={shops}
          selectedShop={selectedShop}
          filterSummary={filterSummary}
          onShopSelect={onShopSelect}
          onCenterOnMe={onCenterOnMe}
          radiusKm={radiusKm}
          onError={(err) => {
            console.warn('[FertilizerMap] Falling back to Leaflet OpenStreetMap view due to:', err);
            setUseGoogleMaps(false);
          }}
        />
      </div>
    );
  }

  // OpenStreetMap / Leaflet Fallback View
  return (
    <div className="relative w-full h-full min-h-[220px] sm:min-h-[280px] bg-slate-100 overflow-hidden">
      <MapContainer
        center={[userLat || 15.3173, userLng || 75.7139]}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', minHeight: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LeafletMapController
          userLat={userLat}
          userLng={userLng}
          selectedShop={selectedShop}
          centerTrigger={centerTrigger}
        />

        {userLat && userLng && (
          <Marker position={[userLat, userLng]} icon={createUserIcon()}>
            <Popup>
              <div className="p-1 text-center font-sans">
                <div className="font-bold text-xs text-blue-800">Your Location</div>
                <div className="text-[10px] text-gray-500">Center for Distance Calculations</div>
              </div>
            </Popup>
          </Marker>
        )}

        {shops.map((shop, index) => {
          const isSelected = selectedShop && selectedShop.id === shop.id;
          const pinIcon = createShopPinIcon(shop.type, shop.availability, isSelected, index);
          const distanceDisplay = typeof shop.distance === 'number'
            ? `${shop.distance.toFixed(1)} km away`
            : shop.distance ? `${shop.distance} km away` : '';

          return (
            <Marker
              key={shop.id}
              position={[shop.lat, shop.lng]}
              icon={pinIcon}
              eventHandlers={{
                click: () => onShopSelect(shop)
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px] max-w-[240px] font-sans">
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        shop.type === 'organic'
                          ? 'bg-emerald-100 text-emerald-800'
                          : shop.type === 'chemical'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {shop.type === 'organic'
                        ? 'Organic'
                        : shop.type === 'chemical'
                        ? 'Chemical'
                        : 'Organic & Chem'}
                    </span>
                    {distanceDisplay && (
                      <span className="text-[10px] font-bold text-gray-600">
                        {distanceDisplay}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-xs text-gray-900 leading-tight mb-1">
                    {shop.name}
                  </h4>

                  <p className="text-[11px] text-gray-600 mb-2 leading-normal">
                    {shop.address}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#2D6A4F] hover:bg-[#1B5E20] text-white text-[11px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 no-underline text-center"
                    >
                      <Navigation size={12} />
                      <span>Directions</span>
                    </a>
                    {shop.website && (
                      <a
                        href={shop.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-50 hover:bg-emerald-100 text-[#2D6A4F] text-[11px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 no-underline"
                        title="Visit Website"
                      >
                        <Globe size={12} />
                        <span>Site</span>
                      </a>
                    )}
                    {shop.phone && (
                      <a
                        href={`tel:${shop.phone}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-bold py-1.5 px-2.5 rounded-lg flex items-center justify-center no-underline"
                      >
                        <Phone size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {filterSummary && (
        <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-gray-200/80 text-[10px] sm:text-xs font-bold text-gray-800 flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#2D6A4F]"></span>
          <span>{filterSummary}</span>
        </div>
      )}

      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-[400]">
        <button
          type="button"
          onClick={handleCenterClick}
          style={{ touchAction: 'manipulation' }}
          className="min-w-[44px] min-h-[44px] w-11 h-11 sm:w-12 sm:h-12 bg-white hover:bg-emerald-50 text-gray-800 rounded-2xl shadow-xl border border-gray-200 flex items-center justify-center transition-all active:scale-95 cursor-pointer group"
          title="Center on My GPS"
          aria-label="Locate Me"
        >
          <LocateFixed size={22} className="text-[#2D6A4F] group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Status indicator */}
      <div className="absolute bottom-2 left-3 z-[400] bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-gray-200/60 text-[9px] font-semibold text-gray-600 flex items-center gap-1 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>OpenStreetMap • {shops.length} verified dealers</span>
      </div>
    </div>
  );
};
