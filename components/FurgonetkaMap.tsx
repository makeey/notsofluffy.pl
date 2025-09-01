"use client";

import React, { useEffect, useState, useRef } from 'react';

export interface FurgonetkaPoint {
  code: string;
  name: string;
  type: string;
  courier?: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  services?: string[];
}

interface FurgonetkaMapProps {
  courierServices?: string[];
  courierServicesFilter?: string[];
  type?: 'parcel_machine' | 'service_point';
  city?: string;
  street?: string;
  pointTypesFilter?: string[];
  onPointSelect: (point: FurgonetkaPoint) => void;
  onModalClose?: () => void;
  className?: string;
  buttonText?: string;
  selectedPoint?: FurgonetkaPoint | null;
  limit?: number;
  zoom?: number;
}

interface FurgonetkaMapInstance {
  show: () => void;
}

interface FurgonetkaMapConstructor {
  new (config: FurgonetkaMapConfig): FurgonetkaMapInstance;
}

interface FurgonetkaMapConfig {
  courierServices: string[];
  callback: (params: FurgonetkaCallbackParams) => void;
  closeModalCallback: () => void;
  zoom: number;
  courierServicesFilter?: string[];
  type?: string;
  city?: string;
  street?: string;
  pointTypesFilter?: string[];
}

interface FurgonetkaCallbackParams {
  point: {
    code: string;
    name: string;
    type?: string;
    courier?: string;
    provider?: string;
    address?: string;
    full_address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    lat?: number;
    latitude?: number;
    lng?: number;
    longitude?: number;
    services?: string[];
  };
}

declare global {
  interface Window {
    Furgonetka?: {
      Map: FurgonetkaMapConstructor;
    };
  }
}

export const FurgonetkaMap: React.FC<FurgonetkaMapProps> = ({
  courierServices = ['inpost', 'poczta', 'dpd', 'ups', 'orlen'],
  courierServicesFilter = [],
  type,
  city = '',
  street = '',
  pointTypesFilter = [],
  onPointSelect,
  onModalClose = () => {},
  className = '',
  buttonText = 'Wybierz punkt odbioru',
  selectedPoint = null,
  zoom = 14
}) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scriptLoaded = useRef(false);

  // Load Furgonetka script
  useEffect(() => {
    if (scriptLoaded.current || isScriptLoaded) return;

    const script = document.createElement('script');
    script.src = 'https://furgonetka.pl/js/dist/map/map.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Furgonetka script loaded');
      setIsScriptLoaded(true);
      scriptLoaded.current = true;
    };

    script.onerror = () => {
      console.error('Failed to load Furgonetka map script');
      setError('Failed to load Furgonetka map script');
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Callback function for point selection
  const handlePointSelect = (params: FurgonetkaCallbackParams) => {
    console.log('Point selected:', params);
    
    const pointData: FurgonetkaPoint = {
      code: params.point.code,
      name: params.point.name,
      type: params.point.type || 'parcel_machine',
      courier: params.point.courier || params.point.provider,
      address: params.point.address || params.point.full_address,
      coordinates: params.point.coordinates || {
        lat: params.point.lat || params.point.latitude || 0,
        lng: params.point.lng || params.point.longitude || 0
      },
      services: params.point.services || []
    };
    
    onPointSelect(pointData);
  };

  // Callback for modal close
  const handleModalClose = () => {
    console.log('Map modal closed');
    onModalClose();
  };

  // Open map function
  const openMap = () => {
    if (!isScriptLoaded || !window.Furgonetka?.Map) {
      console.error('Furgonetka map script not loaded or Furgonetka.Map not available');
      setError('Furgonetka map not available. Please try again.');
      return;
    }

    console.log('Opening Furgonetka map...');
    setError(null);

    try {
      const mapConfig: FurgonetkaMapConfig = {
        courierServices,
        callback: handlePointSelect,
        closeModalCallback: handleModalClose,
        zoom,
        ...(courierServicesFilter.length > 0 && { courierServicesFilter }),
        ...(type && { type }),
        ...(city && { city }),
        ...(street && { street }),
        ...(pointTypesFilter.length > 0 && { pointTypesFilter })
      };

      console.log('Map config:', mapConfig);
      
      const mapInstance = new window.Furgonetka.Map(mapConfig);
      mapInstance.show();
      
      console.log('Map shown successfully');
      
    } catch (err) {
      console.error('Error opening Furgonetka map:', err);
      setError(`Error opening map: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className={`furgonetka-map-container ${className}`}>
      <button
        type="button"
        onClick={openMap}
        disabled={!isScriptLoaded}
        className={`w-full rounded-md px-4 py-2 text-sm font-medium ${
          !isScriptLoaded
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none'
        }`}
      >
        {!isScriptLoaded ? 'Ładowanie...' : buttonText}
      </button>

      {/* Error display */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">Błąd: {error}</p>
        </div>
      )}

      {/* Selected point display */}
      {selectedPoint && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm font-medium text-green-800">Wybrany punkt odbioru:</p>
          <p className="text-sm text-green-700 mt-1">{selectedPoint.name}</p>
          {selectedPoint.address && (
            <p className="text-sm text-green-600">{selectedPoint.address}</p>
          )}
          <p className="text-xs text-green-600 mt-1">Kod: {selectedPoint.code}</p>
          {selectedPoint.courier && (
            <p className="text-xs text-green-600">Kurier: {selectedPoint.courier}</p>
          )}
        </div>
      )}
    </div>
  );
};