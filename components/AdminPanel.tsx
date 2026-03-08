import React, { useState, useEffect } from 'react';
import { 
  subscribeToPendingUsers, 
  subscribeToContributions, 
  approveUser, 
  rejectUser, 
  deleteUser, 
  resetGlobalCount, 
  resetUserCount 
} from '../services/firebaseService';
import { Check, X, Trash2, RotateCcw, Users, Clock, RefreshCw } from 'lucide-react';
import { UserContribution } from '../types';

const AdminPanel: React.FC = () => {
  const [pending, setPending] = useState<any[]>([]);
  const [contributions, setContributions] = useState<UserContribution[]>([]);

  useEffect(() => {
    // שימוש בפונקציות המקוריות והמעולות שלך למשיכת הנתונים
    const unsubPending = subscribeToPendingUsers(setPending);
    const unsubContribs = subscribeToContributions(setContributions);

    return () => {
      // ניקוי האזנות כשהקומפוננטה נסגרת
      if (typeof unsubPending === 'function') unsubPending();
      if (typeof unsubContribs === 'function') unsubContribs();
    };
  }, []);

  return (
    <div className="space-y-6 pb-10 text-right rtl" style={{ direction: 'rtl' }}>
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg">
        <h2 className="text-xl font-black flex items-center gap-2">
          פאנל ניהול
        </h2>
      </div>

      {/* אזור ממתינים */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-amber-100">
        <h3 className="text-amber-600 font-bold mb-4 flex items-center gap-2">
          <Clock size={18}/> ממתינים לאישור ({pending.length})
        </h3>
        {pending.length === 0 && <p className="text-slate-400 text-sm">אין ממתינים כרגע.</p>}
        {pending.map(u => (
          <div key={u.email} className="flex justify-between items-center bg-amber-50 p-3 rounded-xl mb-2">
            <span className="text-sm font-bold">{u.name || u.email}</span>
            <div className="flex gap-2">
              <button onClick={() => approveUser(u.email)} className="text-green-600 bg-white p-2 rounded-lg shadow-sm hover:bg-green-100">
                <Check size={18}/>
              </button>
              <button onClick={() => rejectUser(u.email)} className="text-red-500 bg-white p-2 rounded-lg shadow-sm hover:bg-red-100">
                <X size={18}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* אזור משתמשים פעילים (מתוך טבלת הדירוג) */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
        <h3 className="text-indigo-600 font-bold mb-4 flex items-center gap-2">
          <Users size={18}/> משתמשים פעילים בדירוג ({contributions.length})
        </h3>
        {contributions.length === 0 && <p className="text-slate-400 text-sm">אין משתמשים בדירוג.</p>}
        {contributions.map(u => (
          <div key={u.email} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl mb-2 border border-slate-100">
            <div className="flex flex-col">
              <span className="text-sm font-bold">{u.name}</span>
              <span className="text-[11px] text-indigo-500 font-black">מונה מצוות: {u.count}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => window.confirm(`לאפס את המונה של ${u.name}?`) && resetUserCount(u.email)} 
                className="text-amber-500 p-2 hover:bg-amber-100 rounded-lg transition-colors"
                title="איפוס מונה אישי"
              >
                <RefreshCw size={16}/>
              </button>
              <button 
                onClick={() => window.confirm(`למחוק את ${u.name} מהמערכת לגמרי?`) && deleteUser(u.email)} 
                className="text-slate-400 p-2 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="מחיקת משתמש"
              >
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* איפוס כללי */}
      <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
        <button 
          onClick={() => window.confirm("זהירות! האם לאפס את המונה העולמי ולמחוק את כל הדירוגים?") && resetGlobalCount()} 
          className="w-full bg-white text-red-600 font-bold py-4 rounded-2xl border border-red-200 shadow-sm flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-colors"
        >
          <RotateCcw size={18} /> איפוס מונה עולמי ודירוג
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
