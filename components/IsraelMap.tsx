import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { UserContribution } from '../types';

// חובה לייבא את ה-CSS כדי שהמפה לא תיראה כמו ג'יבריש של תמונות
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// תיקון טכני של Leaflet עבור סביבת Vite (אחרת האייקון הכחול חסר)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface IsraelMapProps {
  contributions: UserContribution[];
}

const IsraelMap: React.FC<IsraelMapProps> = ({ contributions = [] }) => {
  // מסננים נקודות רק למי שיש לו מיקום תקין כדי למנוע קריסה של המפה
  const validPoints = contributions.filter(p => 
    p.lat && p.lng && typeof p.lat === 'number' && typeof p.lng === 'number'
  );

  return (
    <div className="w-full bg-white rounded-3xl p-2 shadow-xl border border-slate-100 h-[450px] relative">
      <MapContainer 
        center={[31.5, 34.8]} 
        zoom={7} 
        style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validPoints.map((point, index) => (
          <Marker key={point.email || index} position={[point.lat!, point.lng!]}>
            <Popup>
              <div className="text-right rtl font-sans" style={{ direction: 'rtl' }}>
                <strong className="text-indigo-700">{point.name}</strong><br/>
                <span className="text-slate-600">{point.count} מצוות</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* הודעה אם אין אף אחד על המפה */}
      {validPoints.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
          <div className="bg-white/90 px-4 py-2 rounded-xl shadow-sm text-sm font-bold text-slate-500">
            עדיין אין מיקומים על המפה
          </div>
        </div>
      )}
    </div>
  );
};

export default IsraelMap;
