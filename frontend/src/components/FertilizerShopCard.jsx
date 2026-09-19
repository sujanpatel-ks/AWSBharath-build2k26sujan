import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Navigation, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Globe, 
  ChevronDown, 
  ChevronUp, 
  CreditCard, 
  ShieldCheck, 
  Truck, 
  MessageSquare,
  Sparkles,
  Calendar,
  Compass,
  ExternalLink,
  Copy,
  Check,
  Radio,
  LocateFixed,
  RefreshCw,
  Star,
  ThumbsUp,
  BadgeCheck,
  Quote,
  UserCheck,
  Home,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchSupplierRatingData, getSupplierRatingData } from '../data/supplierReviews';
import { getShopOperatingStatus } from '../data/operatingHours';

// Haversine distance calculator in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth's mean radius in km
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

// Clean Star Rating Component with fractional fill support
const StarRating = ({ rating = 5, size = 14, showNumeric = false }) => {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const fillAmount = Math.max(0, Math.min(1, rating - (star - 1)));
        return (
          <span key={star} className="relative inline-block" style={{ width: size, height: size }}>
            <Star
              size={size}
              className="text-amber-200 fill-amber-100/60 stroke-amber-300"
            />
            {fillAmount > 0 && (
              <span
                className="absolute top-0 left-0 overflow-hidden"
                style={{ width: `${fillAmount * 100}%` }}
              >
                <Star
                  size={size}
                  className="text-amber-500 fill-amber-400 stroke-amber-500"
                />
              </span>
            )}
          </span>
        );
      })}
      {showNumeric && (
        <span className="ml-1 text-xs font-black text-amber-900">
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};

export const FertilizerShopCard = ({
  shop,
  isSelected = false,
  onSelect = () => {},
  userLocation = null,
  onBackToHome = null,
  onBack = null,
  onMoreInfo = null
}) => {
  // Real-time Geolocation state
  const [liveLocation, setLiveLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const isMountedRef = useRef(true);

  // Mock Rating & Review Data Source state
  const [ratingData, setRatingData] = useState(() => getSupplierRatingData(shop.id, shop.rating));
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(() => ratingData?.recentReview?.helpfulCount || 15);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);

  // Fetch supplier rating and recent user review from mock rating data source
  useEffect(() => {
    let isMounted = true;
    if (isSelected) {
      setIsLoadingReviews(true);
      fetchSupplierRatingData(shop.id, shop.rating)
        .then((data) => {
          if (isMounted) {
            setRatingData(data);
            setHelpfulCount(data?.recentReview?.helpfulCount || 15);
            setIsLoadingReviews(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsLoadingReviews(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isSelected, shop.id, shop.rating]);

  const handleToggleHelpful = (e) => {
    e.stopPropagation();
    if (hasMarkedHelpful) {
      setHelpfulCount((prev) => Math.max(0, prev - 1));
      setHasMarkedHelpful(false);
    } else {
      setHelpfulCount((prev) => prev + 1);
      setHasMarkedHelpful(true);
    }
  };

  // Fetch real-time device coordinates via Geolocation API
  const fetchLiveDistance = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMountedRef.current) return;
        const { latitude, longitude, accuracy } = position.coords;
        setLiveLocation({
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy || 0),
          timestamp: Date.now()
        });
        setLastUpdated(new Date());
        setIsLocating(false);
      },
      (err) => {
        if (!isMountedRef.current) return;
        let msg = 'Unable to acquire live GPS';
        if (err.code === 1) msg = 'Location permission denied';
        else if (err.code === 2) msg = 'GPS signal unavailable';
        else if (err.code === 3) msg = 'GPS request timed out';
        
        setGeoError(msg);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }, []);

  // Fetch live GPS on mount or when supplier card is selected if userLocation is not provided
  useEffect(() => {
    isMountedRef.current = true;
    if (!userLocation || isSelected) {
      fetchLiveDistance();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [isSelected, userLocation, fetchLiveDistance]);

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'organic':
        return 'bg-[#D8F3DC] text-[#2D6A4F] border-[#B7E4C7]';
      case 'chemical':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'both':
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'organic':
        return 'Organic';
      case 'chemical':
        return 'Chemical';
      case 'both':
      default:
        return 'Organic & Chemical';
    }
  };

  const getAvailabilityInfo = (avail) => {
    switch (avail) {
      case 'available':
        return {
          label: 'In Stock (Ready)',
          dotColor: 'bg-emerald-500',
          textColor: 'text-emerald-700',
          bgColor: 'bg-emerald-50/80 border-emerald-200',
          icon: <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
        };
      case 'low_stock':
        return {
          label: 'Low Stock',
          dotColor: 'bg-amber-500 animate-pulse',
          textColor: 'text-amber-700',
          bgColor: 'bg-amber-50/80 border-amber-200',
          icon: <AlertTriangle size={13} className="text-amber-600 shrink-0" />
        };
      case 'unavailable':
      default:
        return {
          label: 'Out of Stock',
          dotColor: 'bg-gray-400',
          textColor: 'text-gray-500',
          bgColor: 'bg-gray-50 border-gray-200',
          icon: <XCircle size={13} className="text-gray-400 shrink-0" />
        };
    }
  };

  const availability = getAvailabilityInfo(shop.availability);

  // Resolve accurate user coordinates (Live GPS > prop userLocation)
  const userLat = liveLocation?.lat ?? userLocation?.lat ?? userLocation?.latitude;
  const userLng = liveLocation?.lng ?? userLocation?.lng ?? userLocation?.longitude;
  const shopLat = shop.lat ?? shop.latitude;
  const shopLng = shop.lng ?? shop.longitude;

  // Real-time calculated Haversine distance in km
  const calculatedDistance = (userLat != null && userLng != null && shopLat != null && shopLng != null)
    ? calculateDistanceKm(userLat, userLng, shopLat, shopLng)
    : (typeof shop.distance === 'number' ? shop.distance : null);

  const isLive = liveLocation != null;
  const hasExactLocation = userLat != null && userLng != null;

  const formattedDistance = calculatedDistance != null
    ? (calculatedDistance < 0.05
        ? 'Nearby (< 50 m)'
        : calculatedDistance < 1
          ? `${Math.round(calculatedDistance * 1000)} m`
          : `${calculatedDistance.toFixed(1)} km`)
    : (shop.distance ? `${shop.distance} km` : '—');

  // Calculate approximate ETA based on rural/semi-urban speed (35 km/h)
  const etaMinutes = calculatedDistance != null
    ? Math.max(2, Math.round((calculatedDistance / 35) * 60))
    : null;

  const formattedEta = etaMinutes
    ? etaMinutes > 60
      ? `${Math.floor(etaMinutes / 60)}h ${etaMinutes % 60}m`
      : `${etaMinutes} min`
    : null;

  // Real-time directions origin and Google Maps URL with supplier coordinates
  const originLat = userLat;
  const originLng = userLng;

  const effectiveRating = ratingData?.rating || (typeof shop.rating === 'number' ? shop.rating : 4.6);
  const recentReview = ratingData?.recentReview;
  const operatingStatus = getShopOperatingStatus(shop);

  const directionsUrl = (shopLat && shopLng)
    ? (originLat && originLng)
      ? `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${shopLat},${shopLng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${shopLat},${shopLng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.name + ' ' + (shop.address || ''))}`;

  const websiteUrl = shop.website || `https://www.google.com/search?q=${encodeURIComponent(shop.name + ' ' + (shop.district || '') + ' agro inputs dealer website')}`;

  const cleanPhone = (shop.phone || '+91-9876543210').replace(/[^0-9+]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Hello ${shop.name}, I found your store on AgroCare Pro. Is current fertilizer/bio-input stock available for purchase?`)}`;

  const [copiedCoords, setCopiedCoords] = useState(false);

  const handleCopyCoords = (e) => {
    e.stopPropagation();
    if (shop.lat && shop.lng) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(`${shop.lat}, ${shop.lng}`);
        setCopiedCoords(true);
        setTimeout(() => setCopiedCoords(false), 2000);
      }
    }
  };

  const handleDirectionsClick = (e) => {
    e.stopPropagation();
    window.open(directionsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleWebsiteClick = (e) => {
    e.stopPropagation();
    window.open(websiteUrl, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppClick = (e) => {
    e.stopPropagation();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      layout
      whileHover={isSelected ? { scale: 1.05 } : { scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={() => onSelect(shop)}
      role="button"
      tabIndex={0}
      aria-expanded={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(shop);
        }
      }}
      style={{ touchAction: 'manipulation' }}
      className={`w-full max-w-full bg-white rounded-2xl sm:rounded-[24px] p-4 sm:p-5 md:p-6 border transition-all duration-200 cursor-pointer shadow-xs active:bg-amber-50/50 ${
        isSelected
          ? 'border-[#2D6A4F] ring-2 ring-[#2D6A4F]/25 bg-emerald-50/15 shadow-md hover:shadow-2xl hover:ring-[#2D6A4F]/40 relative z-10'
          : 'border-[#E2E8F0] hover:border-emerald-300 hover:shadow-md'
      }`}
    >
      {/* Top Meta: Type Badge + Open Status + Distance & ETA */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className={`text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:py-1 rounded-full border shrink-0 ${getBadgeStyle(shop.type)}`}>
            {getTypeLabel(shop.type)}
          </span>
          {isSelected && (
            <span className="text-[10px] sm:text-[11px] font-bold text-white bg-[#2D6A4F] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 shadow-2xs">
              <CheckCircle2 size={11} className="text-emerald-300" />
              Selected
            </span>
          )}
          {/* Subtle Operating Status Badge */}
          {operatingStatus.isOpen ? (
            <span
              className={`text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shrink-0 border transition-colors ${
                operatingStatus.isClosingSoon
                  ? 'text-amber-800 bg-amber-50/90 border-amber-200/90 shadow-2xs'
                  : 'text-emerald-800 bg-emerald-50/90 border-emerald-200/90 shadow-2xs'
              }`}
              title={operatingStatus.fullStatusDetail}
            >
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    operatingStatus.isClosingSoon ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                    operatingStatus.isClosingSoon ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                ></span>
              </span>
              <span>{operatingStatus.statusText}</span>
              {operatingStatus.badgeSubtext && (
                <span
                  className={`text-[9px] font-medium hidden xs:inline ${
                    operatingStatus.isClosingSoon ? 'text-amber-700' : 'text-emerald-700/80'
                  }`}
                >
                  • {operatingStatus.badgeSubtext}
                </span>
              )}
            </span>
          ) : (
            <span
              className="text-[10px] sm:text-[11px] font-medium text-rose-800 bg-rose-50/80 border border-rose-200/70 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shrink-0 shadow-2xs"
              title={operatingStatus.fullStatusDetail}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></span>
              <span className="font-semibold">{operatingStatus.statusText}</span>
              {operatingStatus.badgeSubtext && (
                <span className="text-[9px] text-rose-700/80 hidden xs:inline">
                  • {operatingStatus.badgeSubtext}
                </span>
              )}
            </span>
          )}
          {isSelected && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${isLocating ? 'bg-amber-500 animate-ping' : 'bg-emerald-600'}`}></span>
              {isLocating ? 'Acquiring GPS...' : isLive ? 'Live GPS Distance' : 'GPS Ready'}
            </span>
          )}
        </div>

        {/* Distance + ETA Badge & Expand Indicator */}
        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          {formattedDistance && (
            <span className={`text-xs sm:text-sm font-black px-2.5 py-0.5 sm:py-1 rounded-lg border flex items-center gap-1 ${
              isLive 
                ? 'text-[#1B4332] bg-[#D8F3DC] border-[#74C69D] shadow-2xs' 
                : 'text-[#2D6A4F] bg-[#D8F3DC]/80 border-[#B7E4C7]/80'
            }`}>
              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>}
              {formattedDistance}
            </span>
          )}
          <div className="flex items-center gap-1">
            {formattedEta && (
              <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-0.5">
                <Clock size={10} className="text-gray-400" />
                ~{formattedEta}
              </span>
            )}
            <span className="text-gray-400 text-xs">
              {isSelected ? <ChevronUp size={14} className="text-[#2D6A4F]" /> : <ChevronDown size={14} />}
            </span>
          </div>
        </div>
      </div>

      {/* Shop Name & Rating & Address */}
      <div className="mb-3 sm:mb-3.5 space-y-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base sm:text-lg font-extrabold text-gray-900 leading-snug break-words group-hover:text-[#2D6A4F] transition-colors">
            {shop.name}
          </h3>
          <div className="inline-flex items-center gap-1.5 bg-amber-50/90 border border-amber-200/80 px-2 py-0.5 rounded-lg shrink-0 shadow-2xs">
            <StarRating rating={effectiveRating} size={13} />
            <span className="text-xs font-black text-amber-950">{effectiveRating.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 flex items-start gap-1.5 leading-relaxed break-words">
          <MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{shop.address}</span>
        </p>
      </div>

      {/* Calculated Distance from User's Current Location Display Container */}
      <div className="mb-3 p-3 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-emerald-50/80 rounded-xl border border-emerald-200/90 flex items-center justify-between gap-2.5 flex-wrap shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Navigation size={15} className="rotate-45" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-gray-600">
                Distance:
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#1B4332] flex items-center gap-1">
                {isLocating ? (
                  <span className="text-xs text-amber-600 animate-pulse font-bold">Acquiring GPS...</span>
                ) : (
                  <>
                    <span>{formattedDistance}</span>
                    <span className="text-[11px] font-medium text-emerald-800">from your location</span>
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium pt-0.5 flex-wrap">
              {formattedEta && (
                <span className="flex items-center gap-0.5 text-emerald-800 font-bold">
                  <Clock size={10} className="text-emerald-700" /> ~{formattedEta} drive
                </span>
              )}
              <span className="text-gray-300">•</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <LocateFixed size={10} className="text-emerald-600" />
                {isLive ? 'Live GPS Sensor' : (hasExactLocation ? 'Current User Location' : 'Regional Centroid')}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDirectionsClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1B4332] bg-white hover:bg-emerald-100/80 active:bg-emerald-200/80 border border-emerald-300 rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer ml-auto shrink-0"
          title="Open Navigation in Google Maps"
        >
          <Compass size={13} className="text-[#2D6A4F]" />
          <span>Directions</span>
        </button>
      </div>

      {/* Products list tags */}
      {shop.products && shop.products.length > 0 && (
        <div className="mb-3 sm:mb-4 bg-[#F8FAF6] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-[#E8EDE6]">
          <span className="text-[11px] sm:text-xs font-bold text-gray-700 block mb-1.5">
            Products In Stock:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {shop.products.map((p, idx) => (
              <span
                key={idx}
                className="text-[11px] sm:text-xs font-medium bg-white text-gray-700 border border-gray-200 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg shadow-2xs"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Details Section (Smooth Animated Reveal) */}
      <AnimatePresence initial={false}>
        {isSelected && (
          <motion.div
            key="expanded-details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-4 space-y-3.5 border-t border-emerald-200/60 mt-2">
              {/* Real-time Distance & Live Geolocation Sensor Card */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50/80 rounded-xl p-3 sm:p-3.5 border border-emerald-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <span className="font-bold text-[#1B4332] flex items-center gap-1.5">
                    <Radio size={14} className={`text-[#2D6A4F] ${isLocating ? 'animate-spin' : 'animate-pulse'}`} />
                    Real-time Geolocation Distance
                  </span>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchLiveDistance();
                    }}
                    disabled={isLocating}
                    style={{ touchAction: 'manipulation' }}
                    className="inline-flex items-center gap-1 bg-white hover:bg-emerald-100/80 text-[#2D6A4F] font-bold text-[11px] px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={11} className={isLocating ? 'animate-spin' : ''} />
                    <span>{isLocating ? 'Fetching GPS...' : 'Refresh Distance'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <div className="bg-white/90 p-2 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-gray-500 font-medium block">Live Distance</span>
                    <span className="text-sm font-black text-[#1B4332] flex items-center gap-1">
                      {isLocating ? (
                        <span className="text-xs text-amber-600 animate-pulse">Calculating...</span>
                      ) : (
                        formattedDistance
                      )}
                    </span>
                  </div>

                  <div className="bg-white/90 p-2 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-gray-500 font-medium block">Travel ETA</span>
                    <span className="text-sm font-bold text-gray-800">
                      {formattedEta ? `~${formattedEta}` : '—'}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 bg-white/90 p-2 rounded-lg border border-emerald-100 flex flex-col justify-center">
                    <span className="text-[10px] text-gray-500 font-medium block">GPS Precision</span>
                    <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                      <LocateFixed size={12} className="text-emerald-600 shrink-0" />
                      {liveLocation?.accuracy ? `±${liveLocation.accuracy} m accuracy` : (geoError ? 'Approx. Regional' : 'Device GPS active')}
                    </span>
                  </div>
                </div>

                {geoError && (
                  <p className="text-[11px] text-amber-700 bg-amber-50/90 px-2 py-1 rounded border border-amber-200 flex items-center gap-1">
                    <AlertTriangle size={11} className="shrink-0" />
                    <span>{geoError} — Displaying approximate distance based on regional centroid.</span>
                  </p>
                )}

                {lastUpdated && !geoError && (
                  <p className="text-[10px] text-emerald-700 font-medium flex items-center justify-between px-0.5">
                    <span>• GPS coordinates refreshed</span>
                    <span>{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </p>
                )}
              </div>

              {/* Farmer Ratings & Verified Customer Review Snippet */}
              <div className="bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-yellow-50/60 rounded-xl p-3 sm:p-3.5 border border-amber-200 shadow-2xs space-y-2.5">
                {/* Header: Star Rating Score, Stars, Reviews Count, and Recommendation badge */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs">
                      <StarRating rating={effectiveRating} size={15} />
                      <span className="font-black text-xs text-amber-950">
                        {effectiveRating.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">/ 5.0</span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-700">
                      ({ratingData?.totalReviews || 120} farmer ratings)
                    </span>
                  </div>

                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-300/80 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 shadow-2xs">
                    <BadgeCheck size={12} className="text-emerald-700" />
                    {ratingData?.recommendationRate || 96}% recommend
                  </span>
                </div>

                {/* Recent Review Snippet */}
                {isLoadingReviews ? (
                  <div className="bg-white/80 rounded-xl p-3 border border-amber-100 animate-pulse space-y-2">
                    <div className="h-3 bg-amber-100 rounded w-1/3"></div>
                    <div className="h-3 bg-amber-50 rounded w-full"></div>
                  </div>
                ) : recentReview ? (
                  <div className="bg-white/95 rounded-xl p-3 border border-amber-200/90 shadow-2xs space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                          {recentReview.author.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-gray-900 truncate">
                              {recentReview.author}
                            </span>
                            {recentReview.verified && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                                <UserCheck size={9} className="text-emerald-600" />
                                Verified Farmer
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 truncate">
                            {recentReview.village} • {recentReview.crop}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end">
                        <StarRating rating={recentReview.rating} size={11} />
                        <span className="text-[10px] text-gray-400 mt-0.5 font-medium">{recentReview.date}</span>
                      </div>
                    </div>

                    {/* Review quote snippet */}
                    <div className="relative pl-6 pr-2.5 py-1.5 text-xs text-gray-700 bg-amber-50/50 rounded-lg border border-amber-100/90 leading-relaxed italic">
                      <Quote size={13} className="text-amber-500 absolute left-1.5 top-2 rotate-180 opacity-80" />
                      "{recentReview.comment}"
                    </div>

                    {/* Tags and Helpful Interaction */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5 text-[10px]">
                      {recentReview.tag && (
                        <span className="bg-amber-100/80 text-amber-900 font-bold px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                          ★ {recentReview.tag}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={handleToggleHelpful}
                        style={{ touchAction: 'manipulation' }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border transition-all cursor-pointer font-bold ${
                          hasMarkedHelpful
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs'
                            : 'bg-white hover:bg-amber-50 text-gray-600 hover:text-amber-900 border-gray-200 hover:border-amber-300'
                        }`}
                        title="Mark review as helpful"
                      >
                        <ThumbsUp size={11} className={hasMarkedHelpful ? 'text-emerald-700 fill-emerald-600' : 'text-gray-400'} />
                        <span>{helpfulCount} farmers found helpful</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Opening & Operating Hours */}
              <div className="bg-white/90 rounded-xl p-3 border border-emerald-100 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-gray-900 flex-wrap gap-1.5">
                  <span className="flex items-center gap-1.5 text-[#2D6A4F]">
                    <Clock size={14} className="text-[#2D6A4F]" />
                    Opening & Operating Hours
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1.5 ${
                      operatingStatus.isOpen
                        ? operatingStatus.isClosingSoon
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        operatingStatus.isOpen
                          ? operatingStatus.isClosingSoon
                            ? 'bg-amber-500 animate-pulse'
                            : 'bg-emerald-500'
                          : 'bg-rose-400'
                      }`}
                    ></span>
                    {operatingStatus.fullStatusDetail}
                  </span>
                </div>

                {/* Today's Schedule Highlight */}
                <div className="bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-green-50/50 p-2.5 rounded-lg border border-emerald-200/80 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[9px] uppercase tracking-wider font-black bg-[#2D6A4F] text-white px-1.5 py-0.5 rounded shadow-2xs shrink-0">
                      Today ({operatingStatus.todayDayName})
                    </span>
                    <span className="font-bold text-gray-900 truncate">
                      {operatingStatus.todayHoursLabel}
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold shrink-0 ${
                    operatingStatus.isOpen ? 'text-[#2D6A4F]' : 'text-rose-700'
                  }`}>
                    {operatingStatus.isOpen ? '● Open Now' : '○ Closed'}
                  </span>
                </div>

                {/* Standard Hours Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-0.5">
                  <div className="flex items-center justify-between sm:justify-start sm:gap-3 bg-gray-50/80 px-2.5 py-1.5 rounded-lg border border-gray-100">
                    <span className="text-gray-500 font-medium flex items-center gap-1">
                      <Calendar size={12} className="text-gray-400" />
                      Mon – Sat:
                    </span>
                    <span className="font-bold text-gray-800">{operatingStatus.weekdaySummary}</span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-start sm:gap-3 bg-gray-50/80 px-2.5 py-1.5 rounded-lg border border-gray-100">
                    <span className="text-gray-500 font-medium flex items-center gap-1">
                      <Calendar size={12} className="text-gray-400" />
                      Sunday:
                    </span>
                    <span className={`font-bold ${operatingStatus.sundaySummary === 'Closed' ? 'text-rose-600' : 'text-gray-800'}`}>
                      {operatingStatus.sundaySummary}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information & Support Desk */}
              <div className="bg-white/90 rounded-xl p-3 border border-emerald-100 shadow-2xs space-y-2.5">
                <span className="text-xs font-bold text-[#2D6A4F] flex items-center gap-1.5">
                  <Phone size={14} className="text-[#2D6A4F]" />
                  Direct Contact & Dealer Verification
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <span className="text-[11px] text-gray-500 font-medium block">Store Helpline:</span>
                    <a 
                      href={`tel:${shop.phone || '+91-9876543210'}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                    >
                      <Phone size={12} className="text-emerald-600" />
                      {shop.phone || '+91-9876543210'}
                    </a>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-gray-500 font-medium block">Dealer Certification:</span>
                    <span className="font-bold text-gray-800 flex items-center gap-1">
                      <ShieldCheck size={13} className="text-[#2D6A4F]" />
                      Reg. #KA-AGR-{1000 + (Number(shop.id || 1) * 83)}
                    </span>
                  </div>
                </div>

                <div className="pt-1.5 flex items-center gap-2 flex-wrap text-[11px]">
                  <button
                    type="button"
                    onClick={handleWhatsAppClick}
                    style={{ touchAction: 'manipulation' }}
                    className="inline-flex items-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075E54] font-bold px-2.5 py-1.5 rounded-lg border border-[#25D366]/30 transition-colors cursor-pointer"
                  >
                    <MessageSquare size={13} className="text-[#25D366]" />
                    <span>WhatsApp Inquiry</span>
                  </button>
                  <span className="text-gray-500 font-medium flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-500" />
                    Govt. Certified Input Vendor
                  </span>
                </div>
              </div>

              {/* Payment & Farm Delivery Facilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200/50 flex items-start gap-2">
                  <CreditCard size={14} className="text-[#2D6A4F] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900 block text-[11px]">Payment Modes</span>
                    <span className="text-[11px] text-gray-600">UPI, Cash, Kisan Credit Card (KCC), DBT</span>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-200/50 flex items-start gap-2">
                  <Truck size={14} className="text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900 block text-[11px]">Farm Delivery</span>
                    <span className="text-[11px] text-gray-600">Bulk delivery available for village clusters</span>
                  </div>
                </div>
              </div>

              {/* GPS Navigation & Get Directions CTA Block */}
              <div className="bg-gradient-to-br from-[#F0FDF4] to-[#E8F7EE] rounded-xl p-3 sm:p-3.5 border border-[#B7E4C7] shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <span className="font-bold text-[#1B4332] flex items-center gap-1.5">
                    <Compass size={14} className="text-[#2D6A4F]" />
                    GPS Coordinates & Navigation
                  </span>
                  {shop.lat && shop.lng && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="font-mono text-gray-600 bg-white/90 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {typeof shop.lat === 'number' ? shop.lat.toFixed(4) : shop.lat}°N, {typeof shop.lng === 'number' ? shop.lng.toFixed(4) : shop.lng}°E
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCoords}
                        title="Copy GPS coordinates"
                        className="inline-flex items-center gap-1 bg-white hover:bg-emerald-50 text-[#2D6A4F] px-1.5 py-0.5 rounded border border-emerald-200 text-[10px] font-semibold cursor-pointer transition-colors"
                      >
                        {copiedCoords ? (
                          <>
                            <Check size={10} className="text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={10} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-0.5">
                  <button
                    type="button"
                    id={`expanded-get-directions-btn-${shop.id}`}
                    onClick={handleDirectionsClick}
                    style={{ touchAction: 'manipulation' }}
                    className="w-full min-h-[46px] flex items-center justify-between gap-2 bg-[#2D6A4F] hover:bg-[#1B5E20] active:bg-[#154734] text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                        <Navigation size={15} className="text-white fill-white" />
                      </div>
                      <div className="text-left">
                        <span className="block leading-tight font-black">Get Directions</span>
                        <span className="block text-[10px] text-emerald-200 font-normal leading-tight">
                          {isLive ? 'Navigating from live GPS coordinates' : 'Open in Device Maps / Google Maps app'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0 bg-white/15 px-2.5 py-1 rounded-lg border border-white/20 text-xs font-black">
                      <span>{formattedDistance || 'Navigate'}</span>
                      <ExternalLink size={12} className="text-emerald-200" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock Availability Pill + District */}
      <div className="flex items-center justify-between pt-2 pb-3.5 border-t border-gray-100 text-xs">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${availability.bgColor}`}>
          <span className={`w-2 h-2 rounded-full ${availability.dotColor}`}></span>
          <span className={availability.textColor}>{availability.label}</span>
        </div>
        {shop.district && (
          <span className="text-[11px] sm:text-xs text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
            {shop.district}
          </span>
        )}
      </div>

      {/* Action Buttons: Get Directions, Call, and Visit Website */}
      <div className="flex flex-col min-[380px]:flex-row items-stretch gap-2 pt-1">
        <button
          type="button"
          id={`get-directions-btn-${shop.id}`}
          onClick={handleDirectionsClick}
          style={{ touchAction: 'manipulation' }}
          className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 bg-[#2D6A4F] hover:bg-[#1B5E20] active:bg-[#154734] text-white text-xs sm:text-sm font-bold py-2.5 px-3 rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          title={`Get Directions to ${shop.name} on Google Maps (${shop.lat}, ${shop.lng})`}
          aria-label={`Get directions to ${shop.name} on Google Maps`}
        >
          <Navigation size={15} className="text-white shrink-0 fill-current" />
          <span className="whitespace-nowrap font-black">Get Directions</span>
        </button>

        <a
          id={`call-supplier-btn-${shop.id}`}
          href={`tel:${shop.phone || '+91-9876543210'}`}
          onClick={(e) => e.stopPropagation()}
          style={{ touchAction: 'manipulation' }}
          className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 bg-white hover:bg-emerald-50/80 active:bg-emerald-100/70 border border-[#2D6A4F]/40 text-[#2D6A4F] hover:text-[#1B5E20] text-xs sm:text-sm font-extrabold py-2.5 px-2.5 rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer no-underline"
          title={`Call ${shop.name} directly`}
        >
          <Phone size={15} className="text-[#2D6A4F] shrink-0" />
          <span>Call</span>
        </a>

        <a
          id={`visit-website-btn-${shop.id}`}
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWebsiteClick}
          style={{ touchAction: 'manipulation' }}
          className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 bg-[#F0FDF4] hover:bg-[#DCFCE7] active:bg-[#BBF7D0] border border-[#22C55E]/40 text-[#15803D] hover:text-[#166534] text-xs sm:text-sm font-bold py-2.5 px-2.5 rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer no-underline"
          title={`Visit ${shop.name}'s business website in new tab`}
        >
          <Globe size={15} className="text-[#16A34A] shrink-0" />
          <span className="whitespace-nowrap">Visit Website</span>
        </a>
      </div>

      {/* Navigation & Details Actions: Back to Home & More Info */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 mt-2">
        <button
          type="button"
          id={`back-to-home-btn-${shop.id}`}
          onClick={(e) => {
            e.stopPropagation();
            if (typeof onBackToHome === 'function') {
              onBackToHome();
            } else if (typeof onBack === 'function') {
              onBack();
            }
          }}
          style={{ touchAction: 'manipulation' }}
          className="min-h-[44px] flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 border border-gray-200 text-gray-700 hover:text-gray-900 text-xs sm:text-sm font-bold py-2.5 px-3 rounded-xl shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
          title="Return to Home Dashboard"
          aria-label="Back to Home"
        >
          <Home size={15} className="text-gray-600 shrink-0" />
          <span className="whitespace-nowrap font-bold">Back to Home</span>
        </button>

        <button
          type="button"
          id={`more-info-btn-${shop.id}`}
          onClick={(e) => {
            e.stopPropagation();
            if (typeof onMoreInfo === 'function') {
              onMoreInfo(shop);
            } else {
              onSelect(isSelected ? null : shop);
            }
          }}
          style={{ touchAction: 'manipulation' }}
          className={`min-h-[44px] flex items-center justify-center gap-1.5 border text-xs sm:text-sm font-extrabold py-2.5 px-3 rounded-xl shadow-2xs transition-all active:scale-[0.98] cursor-pointer ${
            isSelected
              ? 'bg-emerald-100/90 hover:bg-emerald-200/90 border-emerald-300 text-[#1B4332]'
              : 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200 text-[#2D6A4F]'
          }`}
          title={isSelected ? 'Collapse supplier details' : 'View more info, operating hours and stock details'}
          aria-label={isSelected ? 'Less Info' : 'More Info'}
        >
          <Info size={15} className="text-[#2D6A4F] shrink-0" />
          <span className="whitespace-nowrap font-black">
            {isSelected ? 'Less Info' : 'More Info'}
          </span>
          {isSelected ? (
            <ChevronUp size={14} className="text-[#2D6A4F] shrink-0" />
          ) : (
            <ChevronDown size={14} className="text-[#2D6A4F] shrink-0" />
          )}
        </button>
      </div>
    </motion.div>
  );
};


