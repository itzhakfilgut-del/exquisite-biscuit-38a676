import React, { useState, useEffect } from 'react';
import Counter from './components/Counter';
import Login from './components/Login';
import Summary from './components/Summary';
import IsraelMap from './components/IsraelMap';
import MitzvahInsight from './components/MitzvahInsight';
import { User } from './types';
import { subscribeToConnectionStatus, getProjectId, onAuthChange, logout } from './services/firebaseService';

type Tab = 'counter' | 'summary' | 'map';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('counter');
  const [status, setStatus] = useState('Checking...');
  const [showGuide, setShowGuide] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false); // סטטוס חדש לממתינים לאישור

  useEffect(() => {
    // הרשמה לעדכוני סטטוס חיבור בזמן אמת
    const unsubscribeStatus = subscribeToConnectionStatus((newStatus) => {
      setStatus(newStatus);
    });

    // הרשמה לעדכוני סטטוס התחברות (כולל בדיקת האישור)
    const unsubscribeAuth = onAuthChange((newUser, pending) => {
      setUser(newUser);
      setIsPendingApproval(!!pending);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeAuth();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setActiveTab('counter');
    setIsPendingApproval(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar - מוסתר אם המשתמש רק ממתין לאישור */}
      {user && (
        <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center space-x-3 space-x-reverse">
            <img src={user.picture} alt={user.name} className="h-8 w-8 rounded-full border border-gray-200 shadow-sm" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-800 leading-none">{user.name}</span>
              <button onClick={handleLogout} className="text-[9px] text-red-500 hover:underline text-right font-bold uppercase tracking-tighter">התנתק</button>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
             <button 
                onClick={() => status !== 'Connected' && setShowGuide(!showGuide)}
                className={`flex items-center space-x-1.5 space-x-reverse px-2 py-1 rounded-full border transition-all ${status === 'Connected' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200 hover:bg-orange-100'}`}
             >
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Connected' ? 'bg-green-500' : 'bg-orange-400 animate-pulse'}`}></span>
                <span className={`text-[8px] font-black uppercase tracking-tighter ${status === 'Connected' ? 'text-green-600' : 'text-orange-600'}`}>
                  {status} {status !== 'Connected' && '• Setup Needed'}
                </span>
             </button>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
             <div className="bg-black p-1.5 rounded-md">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
             </div>
             <span className="text-sm font-black tracking-tight hidden sm:inline">KARKAFOT</span>
          </div>
        </header>
      )}

      {/* Connection Guide Overlay */}
      {showGuide && status !== 'Connected' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl space-y-4">
            <h4 className="text-xl font-black">הפעלת סנכרון גלובלי</h4>
            <p className="text-sm text-gray-600 leading-relaxed text-right">
              הפרויקט שלך <b>{getProjectId()}</b> מוכן! <br/>
              אם מופיע Offline, וודא שהגדרת ב-Firebase Console תחת <b>Realtime Database</b> כללי קריאה וכתיבה (Rules) שמאפשרים גישה.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-right">
               <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">כללי מסד נתונים</p>
               <pre className="text-[9px] text-left overflow-x-auto bg-gray-100 p-2 rounded">
{`{
  "rules": {
    ".read": true,
    ".write": true
  }
}`}
               </pre>
            </div>
            <button 
              onClick={() => setShowGuide(false)}
              className="w-full py-3 bg-black text-white rounded-xl font-bold"
            >
              הבנתי
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center p-6">
        <div className="w-full max-w-md mt-4">
          {user ? (
            /* --- מסך משתמש מחובר ומאושר --- */
            <div className="space-y-6">
              <MitzvahInsight />

              <div className="flex bg-gray-200/50 p-1 rounded-2xl border border-gray-200">
                <button 
                  onClick={() => setActiveTab('counter')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'counter' ? 'bg-white shadow-md text-black' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  ספירה
                </button>
                <button 
                  onClick={() => setActiveTab('map')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'map' ? 'bg-white shadow-md text-black' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  מפה
                </button>
                <button 
                  onClick={() => setActiveTab('summary')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'summary' ? 'bg-white shadow-md text-black' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  דירוג
                </button>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-[3rem] p-2 min-h-[400px]">
                {activeTab === 'counter' && <Counter user={user} />}
                {activeTab === 'map' && <IsraelMap />}
                {activeTab === 'summary' && <Summary user={user} />}
              </div>
            </div>
          ) : isPendingApproval ? (
            /* --- מסך המתנה לאישור מנהל --- */
            <div className="mt-20 flex flex-col items-center space-y-4 bg-white p-8 rounded-[3rem] shadow-xl text-center rtl animate-fade-in">
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-gray-800">חשבונך ממתין לאישור</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                ההרשמה בוצעה בהצלחה! <br/>
                מנהל המערכת צריך לאשר את המשתמש שלך לפני שתוכל להתחיל לספור. חזור לבדוק שוב מאוחר יותר.
              </p>
              <button 
                onClick={handleLogout}
                className="mt-4 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm"
              >
                התנתק בינתיים
              </button>
            </div>
          ) : (
            /* --- מסך התחברות --- */
            <div className="mt-20">
              <Login />
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-8 text-gray-400 text-[10px] font-bold tracking-[0.3em] uppercase text-center">
        Project: {getProjectId()} &bull; Version 10.0
      </footer>
    </div>
  );
};

export default App;