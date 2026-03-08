import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { 
  firebaseDb, 
  approveUser, 
  deleteUser, 
  resetGlobalCount,
  resetUserCount // ייבוא הפונקציה החדשה
} from '../services/firebaseService';
import { Check, Trash2, RotateCcw, Users, ShieldCheck, Clock, RefreshCcw } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [pending, setPending] = useState<any[]>([]);
  const [approved, setApproved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pendingRef = ref(firebaseDb, 'pendingUsers');
    const approvedRef = ref(firebaseDb, 'approvedUsers');
    const contributionsRef = ref(firebaseDb, 'contributions');

    onValue(pendingRef, (snap) => setPending(Object.values(snap.val() || {})));
    
    // אנחנו מושכים את נתוני הדירוג כדי להציג את המונים ברשימת המשתמשים
    onValue(contributionsRef, (snap) => {
      const contributions = snap.val() || {};
      onValue(approvedRef, (approvedSnap) => {
        const approvedData = approvedSnap.val() || {};
        const combined = Object.values(approvedData).map((u: any) => ({
          ...u,
          count: contributions[u.email.replace(/\./g, '_')]?.count || 0
        }));
        setApproved(combined);
        setLoading(false);
      });
    });
  }, []);

  const handleFullReset = () => {
    if (window.confirm("🚨 זהירות! פעולה זו תאפס את המונה העולמי ותמחק את כל הדירוג של כל המשתמשים. להמשיך?")) {
      resetGlobalCount();
    }
  };

  const handleUserReset = (email: string, name: string) => {
    if (window.confirm(`האם לאפס את המונה האישי של ${name}?`)) {
      resetUserCount(email);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">טוען נתוני ניהול...</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-10" style={{ direction: 'rtl' }}>
      
      {/* כותרת */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg text-right">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <ShieldCheck size={32} />
          פאנל ניהול
        </h2>
      </div>

      {/* ממתינים - (נשאר ללא שינוי מהקוד הקודם) */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-amber-100 text-right">
        <h3 className="text-lg font-black text-amber-600 mb-4 flex items-center gap-2">
          <Clock size={20} /> ממתינים לאישור ({pending.length})
        </h3>
        <div className="space-y-3">
          {pending.map((u) => (
            <div key={u.email} className="flex justify-between items-center bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">{u.name || u.email}</span>
              </div>
              <button onClick={() => approveUser(u.email, u.name)} className="bg-white text-green-600 p-2 rounded-xl shadow-sm hover:bg-green-50"><Check size={20}/></button>
            </div>
          ))}
        </div>
      </div>

      {/* משתמשים פעילים עם אפשרות איפוס אישי */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 text-right">
        <h3 className="text-lg font-black text-indigo-600 mb-4 flex items-center gap-2">
          <Users size={20} /> משתמשים פעילים ({approved.length})
        </h3>
        <div className="space-y-3">
          {approved.map((u) => (
            <div key={u.email} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex flex-col">
                <span className="font-bold text-slate-700">{u.name}</span>
                <span className="text-xs text-indigo-500 font-bold">מונה: {u.count}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleUserReset(u.email, u.name)}
                  className="text-amber-500 hover:bg-amber-50 p-2 rounded-lg transition-colors"
                  title="איפוס מונה אישי"
                >
                  <RefreshCcw size={18} />
                </button>
                <button 
                  onClick={() => deleteUser(u.email)}
                  className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                  title="מחיקת משתמש"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* איפוס כללי */}
      <div className="bg-red-50 rounded-3xl p-6 border border-red-100 shadow-inner text-right">
        <h3 className="text-red-700 font-black mb-4 flex items-center gap-2 text-right">
          <RotateCcw size={20} /> אזור תחזוקה
        </h3>
        <button 
          onClick={handleFullReset}
          className="w-full bg-white text-red-600 font-black py-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all border border-red-200"
        >
          <RotateCcw size={20} />
          איפוס הכל (מונה + דירוג)
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
