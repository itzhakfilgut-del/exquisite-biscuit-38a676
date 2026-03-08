import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { 
  firebaseDb, 
  approveUser, 
  deleteUser, 
  resetGlobalCount 
} from '../services/firebaseService';
import { Check, Trash2, RotateCcw, Users, ShieldCheck, Clock } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [pending, setPending] = useState<any[]>([]);
  const [approved, setApproved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pendingRef = ref(firebaseDb, 'pendingUsers');
    const approvedRef = ref(firebaseDb, 'approvedUsers');

    const unsubPending = onValue(pendingRef, (snap) => {
      const data = snap.val() || {};
      setPending(Object.values(data));
      setLoading(false);
    });

    const unsubApproved = onValue(approvedRef, (snap) => {
      const data = snap.val() || {};
      setApproved(Object.values(data));
    });

    return () => {
      unsubPending();
      unsubApproved();
    };
  }, []);

  const handleReset = () => {
    if (window.confirm("שים לב! האם אתה בטוח שברצונך לאפס את המונה הגלובלי ל-0? פעולה זו אינה הפיכה.")) {
      resetGlobalCount();
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">טוען נתוני ניהול...</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-10" style={{ direction: 'rtl' }}>
      
      {/* כותרת פאנל ניהול */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <ShieldCheck size={32} />
          פאנל ניהול מערכת
        </h2>
        <p className="opacity-80 text-sm mt-1">נהל משתמשים, אישורים והגדרות מערכת</p>
      </div>

      {/* ממתינים לאישור */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-amber-100">
        <h3 className="text-lg font-black text-amber-600 mb-4 flex items-center gap-2">
          <Clock size={20} />
          ממתינים לאישור ({pending.length})
        </h3>
        
        {pending.length === 0 ? (
          <p className="text-slate-400 text-sm italic py-4">אין משתמשים חדשים הממתינים לאישור.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((u) => (
              <div key={u.email} className="flex justify-between items-center bg-amber-50 p-4 rounded-2xl border border-amber-100 transition-all hover:shadow-md">
                <div className="flex flex-col text-right">
                  <span className="font-bold text-slate-800">{u.name || 'ללא שם'}</span>
                  <span className="text-xs text-slate-500">{u.email}</span>
                </div>
                <button 
                  onClick={() => approveUser(u.email, u.name)}
                  className="bg-white text-green-600 p-3 rounded-xl shadow-sm hover:bg-green-50 active:scale-90 transition-all"
                  title="אשר משתמש"
                >
                  <Check size={20} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* משתמשים מאושרים */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
        <h3 className="text-lg font-black text-indigo-600 mb-4 flex items-center gap-2">
          <Users size={20} />
          משתמשים פעילים ({approved.length})
        </h3>
        
        <div className="space-y-3 text-right">
          {approved.map((u) => (
            <div key={u.email} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex flex-col">
                <span className="font-bold text-slate-700">{u.name}</span>
                <span className="text-xs text-slate-400">{u.email}</span>
              </div>
              <button 
                onClick={() => deleteUser(u.email)}
                className="text-slate-300 hover:text-red-500 p-2 transition-colors active:scale-90"
                title="מחק משתמש"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* הגדרות ואזור מסוכן */}
      <div className="bg-red-50 rounded-3xl p-6 border border-red-100 shadow-inner">
        <h3 className="text-red-700 font-black mb-4 flex items-center gap-2">
          <RotateCcw size={20} />
          אזור תחזוקה
        </h3>
        <button 
          onClick={handleReset}
          className="w-full bg-white text-red-600 font-black py-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all border border-red-200"
        >
          <RotateCcw size={20} />
          איפוס המונה העולמי ל-0
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
