import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // חובה להצגת המפה בצורה תקינה
import L from 'leaflet';

// תיקון לאייקונים של Leaflet שנעלמים בתהליך ה-Build של Vite
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
  contributions: any[];
}

const IsraelMap: React.FC<MapProps> = ({ contributions = [] }) => {
  // סינון נקודות שיש להן קואורדינטות תקינות בלבד
  const validPoints = contributions.filter(p => 
    p && typeof p.lat === 'number' && typeof p.lng === 'number'
  );

  return (
    <div className="space-y-4 animate-fade-in" style={{ direction: 'rtl' }}>
      <div className="bg-white rounded-[2.5rem] p-3 shadow-2xl shadow-indigo-100 border-4 border-white h-[500px] overflow-hidden relative group">
        
        <MapContainer 
          center={[31.5, 34.9]} 
          zoom={7} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', borderRadius: '2rem' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {validPoints.map((point, idx) => (
            <Marker key={point.email || idx} position={[point.lat, point.lng]}>
              <Popup>
                <div className="text-center font-sans rtl" style={{ direction: 'rtl' }}>
                  <div className="font-black text-indigo-700 text-sm mb-1">
                    {point.name || 'צדיק אנונימי'}
                  </div>
                  <div className="bg-indigo-50 text-indigo-600 rounded-lg py-1 px-3 text-[10px] font-black">
                    {point.count || 0} מצוות נספרו
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* שכבת מידע צפה */}
        <div className="absolute top-6 right-6 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/50">
          <div className="text-slate-800 font-black flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
            {validPoints.length} מוקדי פעילות
          </div>
        </div>

        {validPoints.length === 0 && (
          <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-[1px] flex items-center justify-center z-[1000]">
            <div className="bg-white px-6 py-3 rounded-2xl shadow-xl text-slate-500 font-bold">
              מחפש מצוות על המפה...
            </div>
          </div>
        )}
      </div>
      
      <p className="text-center text-xs text-slate-400 font-medium">
        * המפה מציגה משתמשים ששיתפו מיקום בעת הלחיצה
      </p>
    </div>
  );
};

export default IsraelMap;
