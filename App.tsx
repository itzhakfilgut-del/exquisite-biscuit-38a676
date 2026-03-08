import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  BarChart3, 
  Map as MapIcon, 
  LogOut, 
  Smartphone, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import Login from './components/Login';
import MitzvahMap from './components/MitzvahMap';
import StatsSummary from './components/StatsSummary';
import MitzvahInsight from './components/MitzvahInsight';
import { User, UserContribution } from './types';
import { 
  subscribeToConnectionStatus, 
  getProjectId, 
  onAuthChange, 
  logout, 
  updateCount,
  subscribeToGlobalCount,
  subscribeToContributions
} from './services/firebaseService';

type Tab = 'counter' | 'summary' | 'map';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('counter');
  const [globalCount, setGlobalCount] = useState(0);
  const [contributions, setContributions] = useState<UserContribution[]>([]);
  const [connStatus, setConnStatus] = useState('Connecting...');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. האזנה למצב התקנה (PWA)
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  // 2. ניהול אימות משתמש ובקשת מיקום מוקדמת
  useEffect(() => {
    const unsubscribe = onAuthChange((userData, pending) => {
      setUser(userData);
      setIsPending(pending || false);

      // בקשת מיקום מיד עם ההתחברות כדי למנוע עיכוב בלחיצה הראשונה
      if (userData && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => console.log("Location access denied"),
          { enableHighAccuracy: true }
        );
      }
    });

    const unSubStatus = subscribeToConnectionStatus(setConnStatus);
    const unSubCount = subscribeToGlobalCount(setGlobalCount);
    const unSubContribs = subscribeToContributions(setContributions);

    return () => {
      unsubscribe();
      unSubStatus();
      unSubCount();
      unSubContribs();
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  const handleIncrement = async () => {
    if (!user || isUpdating) return;
    setIsUpdating(true);

    const performUpdate = async (lat?: number, lng?: number) => {
      try {
        await updateCount(user.email, user.name, lat, lng, user.picture);
      } catch (error) {
        console.error("Update failed:", error);
      } finally {
        setIsUpdating(false);
      }
    };

    // אם כבר יש מיקום שמור - נשתמש בו מיד
    if (userLocation) {
      await performUpdate(userLocation.lat, userLocation.lng);
    } else {
      // אם אין מיקום, נבקש ונבצע את העדכון מיד כשמתקבל (פותר את הלחיצה הראשונה)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(coords);
          await performUpdate(coords.lat, coords.lng);
        },
        async () => {
          // גם אם המשתמש סירב, נספור את הלחיצה
          await performUpdate();
        },
        { timeout: 5000 }
      );
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 rtl" style={{ direction: 'rtl' }}>
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center animate-fade-in">
          <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="text-amber-600 w-10 h-10 animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-4">ההרשמה התקבלה!</h1>
          <p className="text-slate-600 leading-relaxed mb-6">
            החשבון שלך ממתין לאישור מנהל. <br />
            ברגע שיאשרו אותך, תוכל להתחיל לצבור מצוות.
          </p>
          <button onClick={() => logout()} className="text-indigo-600 font-bold hover:underline">
            יציאה וחזרה למסך הכניסה
          </button>
        </div>
      </div>
    );
  }

  if (!user) return <Login onLoginSuccess={setUser} />;

  return (
    <div className="min-h-screen bg-slate-100 pb-24 rtl" style={{ direction: 'rtl' }}>
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
            <CheckCircle2 className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-slate-800 text-lg leading-tight">מונה המצוות</h1>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{connStatus}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {installPrompt && (
            <button 
              onClick={handleInstall}
              className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 transition-colors"
              title="התקן אפליקציה"
            >
              <Smartphone size={20} />
            </button>
          )}
          <button 
            onClick={() => logout()} 
            className="text-slate-400 hover:text-red-500 transition-colors p-2"
          >
            <LogOut size={20} />
          </button>
          <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full border-2 border-indigo-100 shadow-sm" />
        </div>
      </header>

      <main className="max-w-lg mx-auto p-6">
        {activeTab === 'counter' && (
          <div className="space-y-6 animate-fade-in">
            <MitzvahInsight />
            
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-10 text-center border border-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600/10"></div>
              <h2 className="text-slate-400 font-bold text-sm mb-2">סך המצוות העולמי</h2>
              <div className="text-7xl font-black text-indigo-600 mb-8 tracking-tighter tabular-nums">
                {globalCount.toLocaleString()}
              </div>
              
              <button
                onClick={handleIncrement}
                disabled={isUpdating}
                className={`w-40 h-40 rounded-full mx-auto flex items-center justify-center transition-all shadow-2xl relative group ${
                  isUpdating 
                  ? 'bg-slate-200 scale-95' 
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-90 hover:shadow-indigo-300'
                }`}
              >
                <Plus className={`text-white w-20 h-20 transition-transform ${isUpdating ? 'animate-ping' : 'group-hover:rotate-90'}`} strokeWidth={3} />
                {isUpdating && <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>}
              </button>
              
              <p className="mt-8 text-slate-500 font-medium">שלום {user.name}, לחץ כדי להוסיף מצווה!</p>
            </div>
          </div>
        )}

        {activeTab === 'summary' && <StatsSummary contributions={contributions} currentUserEmail={user.email} />}
        {activeTab === 'map' && <MitzvahMap contributions={contributions} />}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-3xl p-2 flex justify-around items-center z-50">
        <button
          onClick={() => setActiveTab('counter')}
          className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all ${activeTab === 'counter' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Plus size={24} strokeWidth={activeTab === 'counter' ? 3 : 2} />
          <span className="text-[10px] font-black">מונה</span>
        </button>
        
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all ${activeTab === 'summary' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <BarChart3 size={24} strokeWidth={activeTab === 'summary' ? 3 : 2} />
          <span className="text-[10px] font-black">דירוג</span>
        </button>
        
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all ${activeTab === 'map' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <MapIcon size={24} strokeWidth={activeTab === 'map' ? 3 : 2} />
          <span className="text-[10px] font-black">מפה</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
