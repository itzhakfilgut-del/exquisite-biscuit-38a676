
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { subscribeToContributions } from '../services/firebaseService';
import { UserContribution } from '../types';

const IsraelMap: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map', {
        center: [31.5, 34.9],
        zoom: 7,
        zoomControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapRef.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
      markersRef.current = L.layerGroup().addTo(mapRef.current);
    }

    const unsubscribe = subscribeToContributions((contributions) => {
      if (markersRef.current && mapRef.current) {
        markersRef.current.clearLayers();
        
        contributions.forEach(c => {
          if (c.lat && c.lng) {
            const customIcon = L.divIcon({
              className: 'custom-div-icon',
              html: `
                <div class="relative group">
                  <div class="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-lg shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                     <p class="text-[9px] font-black text-black whitespace-nowrap">${c.name}</p>
                  </div>
                  <div class="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20 scale-150"></div>
                  <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg overflow-hidden bg-white relative z-10 transition-transform hover:scale-125">
                    <img src="${c.picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + c.email}" class="w-full h-full object-cover" />
                  </div>
                  <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-black text-white text-[7px] font-black px-1.5 rounded-full z-20">
                    ${c.count}
                  </div>
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });

            L.marker([c.lat, c.lng], { icon: customIcon }).addTo(markersRef.current!);
          }
        });
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full space-y-4 animate-fade-in relative">
      <div className="flex justify-between items-center mb-2 px-2">
        <h3 className="text-xl font-black text-gray-800">מפת הפריסה</h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">שידור חי</span>
        </div>
      </div>
      
      <div className="relative bg-white p-2 rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-gray-100 border-t-black rounded-full mb-2"></div>
            <p className="text-[10px] font-black uppercase text-gray-400">טוען נתונים...</p>
          </div>
        )}
        <div id="map" className="h-[450px] w-full"></div>
      </div>
    </div>
  );
};

export default IsraelMap;
