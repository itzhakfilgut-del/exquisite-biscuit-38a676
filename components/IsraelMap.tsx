import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';

// ייבוא ה-CSS הכרחי כדי שהמפה לא תיראה מפורקת
import 'leaflet/dist/leaflet.css';

// פתרון קריטי לבעיית האייקונים הנעלמים ב-Build של Vite/Production
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// הגדרת האייקון כברירת מחדל לכל המרקרים
L.Marker.prototype.options.icon = DefaultIcon;

interface Contribution {
  email?: string;
  name?: string;
  count?: number;
  lat?: number;
  lng?: number;
}

interface IsraelMapProps {
  contributions: Contribution[];
}

const IsraelMap: React.FC<IsraelMapProps> = ({ contributions = [] }) => {
  
  // פילטר הגנה: מונע מהמפה לקרוס אם נשלחו נתונים שאינם מספרים או חסרים
  const validPoints = useMemo(() => {
    if (!Array.isArray(contributions)) return [];
    
    return contributions.filter(p => 
      p && 
      typeof p.lat === 'number' && 
      typeof p.lng === 'number' &&
      !isNaN(p.lat) && 
      !isNaN(p.lng) &&
      p.lat !== 0 && p.lng !== 0 // מונע נקודות שקופצות לאפריקה בגלל 0,0
    );
  }, [contributions]);

  // מרכז המפה (ישראל)
  const mapCenter: [number, number] = [31.5, 34.8];

  return (
    <div className="w-full space-y-4 animate-fade-in" style={{ direction: 'rtl' }}>
      <div className="relative bg-white rounded-[2.5rem] p-2 shadow-2xl border-4 border-white h-[450px] overflow-hidden group">
        
        {/* בדיקה אם יש בכלל נתונים להצגה */}
        {validPoints.length === 0 && (
          <div className="absolute inset-0 z-[1001] bg-slate-50/80 backdrop-blur-sm flex items-center justify-center text-center p-6">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
              <p className="text-slate-500 font-bold">טרם נוספו מצוות עם מיקום גיאוגרפי.</p>
              <p className="text-xs text-slate-400 mt-2">המיקום מתווסף רק בעת לחיצה על כפתור ה-"+" באישור המשתמש.</p>
            </div>
          </div>
        )}

        <MapContainer 
          center={mapCenter} 
          zoom={7} 
          zoomControl={false} // ביטול כדי להוסיף ידנית בצד הנכון
          style={{ height: '100%', width: '100%', borderRadius: '2rem' }}
          attributionControl={false} // ניקוי הטקסט למטה לעיצוב נקי
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <ZoomControl position="bottomleft" />

          {validPoints.map((point, idx) => (
            <Marker 
              key={point.email || `marker-${idx}`} 
              position={[point.lat!, point.lng!]}
            >
              <Popup>
                <div className="text-right font-sans p-1" style={{ direction: 'rtl' }}>
                  <div className="font-black text-indigo-700 text-sm">
                    {point.name || 'צדיק אנונימי'}
                  </div>
                  <div className="text-slate-500 text-[11px] font-bold mt-1">
                    צבר {point.count || 0} מצוות
                  </div>
                  <div className="mt-2 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500" 
                      style={{ width: `${Math.min((point.count || 0) * 5, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* שכבת מידע עליונה */}
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-md border border-white/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
            <span className="text-xs font-black text-slate-700">
              {validPoints.length} נקודות אור בארץ
            </span>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
        <p className="text-[11px] text-indigo-700 leading-relaxed text-center font-medium">
          💡 <b>טיפ:</b> המפה מציגה רק משתמשים שאישרו גישה למיקום. <br/>
          ניתן ללחוץ על סמן כדי לראות מי פועל באזור.
        </p>
      </div>
    </div>
  );
};

export default IsraelMap;
