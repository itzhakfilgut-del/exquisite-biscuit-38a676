import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { UserContribution } from '../types';
import L from 'leaflet';

// תיקון ויזואלי לאייקונים של Leaflet ב-Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  contributions: UserContribution[];
}

const IsraelMap: React.FC<MapProps> = ({ contributions = [] }) => {
  // הגנה: סינון רק של נקודות שיש להן קואורדינטות מספר תקינות
  const validPoints = (contributions || []).filter(c => 
    c && 
    typeof c.lat === 'number' && 
    typeof c.lng === 'number' && 
    !isNaN(c.lat) && 
    !isNaN(c.lng)
  );

  return (
    <div className="bg-white rounded-[2.5rem] p-3 shadow-2xl shadow-indigo-100 border-4 border-white h-[550px] overflow-hidden relative animate-fade-in group">
      <MapContainer 
        center={[31.5, 34.9]} 
        zoom={7} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', borderRadius: '2rem' }}
        zoomControl={false} // נבטל כפתורי זום למראה נקי יותר בטלפון
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        {validPoints.map((point, idx) => (
          <Marker key={point.email || idx} position={[point.lat!, point.lng!]}>
            <Popup className="custom-popup">
              <div className="text-center font-sans p-1 rtl" style={{ direction: 'rtl' }}>
                <div className="flex items-center gap-2 mb-1 justify-center">
                   <img 
                    src={point.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(point.name || 'U')}`} 
                    className="w-6 h-6 rounded-full border border-indigo-100" 
                    alt="" 
                   />
                   <span className="font-black text-indigo-700">{point.name || 'צדיק'}</span>
                </div>
                <div className="bg-indigo-50 text-indigo-600 rounded-lg py-1 px-3 text-xs font-black">
                  {point.count || 0} מצוות נספרו כאן
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* שכבת מידע עליונה */}
      <div className="absolute top-6 right-6 z-[1000] bg-white/90 backdrop-blur-md px-5 py-2 rounded-2xl shadow-lg border border-white/50 pointer-events-none">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">תפרוסת ארצית</div>
        <div className="text-slate-800 font-black flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
          {validPoints.length} מוקדי עשייה
        </div>
      </div>

      {validPoints.length === 0 && (
        <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] flex items-center justify-center z-[1000] pointer-events-none">
          <div className="bg-white/90 px-6 py-3 rounded-2xl shadow-2xl text-slate-600 font-black border border-white animate-bounce">
            מחפש מצוות על המפה...
          </div>
        </div>
      )}
    </div>
  );
};

export default IsraelMap;
