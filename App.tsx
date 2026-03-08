import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, Map as MapIcon, LogOut, Settings, Clock, CheckCircle2 } from 'lucide-react';
import Login from './components/Login';
import IsraelMap from './components/IsraelMap';
import Summary from './components/Summary';
import Counter from './components/Counter';
import AdminPanel from './components/AdminPanel'; // וודא שהקובץ קיים ב-components
import { firebaseAuth, firebaseDb, logout, updateCount, checkUserStatus } from './services/firebaseService';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';

const ADMIN_EMAIL = "your-email@gmail.com"; // שים כאן את המייל שלך!

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('counter');
  const [globalCount, setGlobalCount] = useState(0);
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(firebaseAuth, async (u) => {
      if (u) {
        setUser(u);
        const approved = await checkUserStatus(u.email!);
        setIsApproved(approved || u.email === ADMIN_EMAIL);
      } else {
        setUser(null);
        setIsApproved(null);
      }
    });

    onValue(ref(firebaseDb, 'global/totalCount'), (s) => setGlobalCount(s.val() || 0));
    onValue(ref(firebaseDb, 'contributions'), (s) => {
      const data = s.val() || {};
      setContributions(Object.values(data) as any);
    });

    return () => unsubAuth();
  }, []);

  if (!user) return <Login onLoginSuccess={setUser} />;

  if (isApproved === false && user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center" style={{direction: 'rtl'}}>
        <Clock className="text-amber-500 w-16 h-16 mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold mb-2 text-slate-800">ממתין לאישור מנהל</h1>
        <p className="text-slate-600 mb-6 font-medium">החשבון שלך נוצר. ברגע שהמנהל יאשר אותך, תוכל להתחיל לצבור מצוות!</p>
        <button onClick={logout} className="bg-white border border-slate-200 px-6 py-2 rounded-full shadow-sm font-bold text-indigo-600 hover:bg-slate-50 transition-all">יציאה</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-24 rtl" style={{ direction: 'rtl' }}>
      {/* Header המעוצב עם הלשוניות מלמעלה */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-indigo-600 w-6 h-6" />
            <h1 className="font-black text-xl text-slate-800 tracking-tight">מונה המצוות</h1>
          </div>
          <div className="flex items-center gap-2">
            {user.email === ADMIN_EMAIL && (
              <button onClick={() => setActiveTab('admin')} className={`p-2 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-amber-100 text-amber-600' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Settings size={22} />
              </button>
            )}
            <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={22}/></button>
          </div>
        </div>

        {/* לשוניות ניווט עליונות */}
        <nav className="max-w-md mx-auto flex justify-around p-1">
          <button onClick={() => setActiveTab('counter')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all border-b-4 ${activeTab === 'counter' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>
            <Plus size={24} strokeWidth={activeTab === 'counter' ? 3 : 2} />
            <span className="text-[10px] font-bold">מונה</span>
          </button>
          <button onClick={() => setActiveTab('summary')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all border-b-4 ${activeTab === 'summary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>
            <BarChart3 size={24} strokeWidth={activeTab === 'summary' ? 3 : 2} />
            <span className="text-[10px] font-bold">דירוג</span>
          </button>
          <button onClick={() => setActiveTab('map')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all border-b-4 ${activeTab === 'map' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>
            <MapIcon size={24} strokeWidth={activeTab === 'map' ? 3 : 2} />
            <span className="text-[10px] font-bold">מפה</span>
          </button>
        </nav>
      </header>

      <main className="p-6 max-w-md mx-auto animate-fade-in">
        {activeTab === 'counter' && <Counter globalCount={globalCount} onIncrement={() => updateCount(user.email, user.displayName || 'צדיק')} userName={user.displayName} />}
        {activeTab === 'summary' && <Summary contributions={contributions} currentUserEmail={user.email} />}
        {activeTab === 'map' && <IsraelMap contributions={contributions} />}
        {activeTab === 'admin' && <AdminPanel />}
      </main>
    </div>
  );
};

export default App;
