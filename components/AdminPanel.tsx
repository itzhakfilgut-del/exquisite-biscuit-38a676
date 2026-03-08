import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { firebaseDb, approveUser, deleteUser, resetGlobalCount } from '../services/firebaseService';
import { Check, Trash2, RotateCcw, Users } from 'lucide-react';

const AdminPanel = () => {
  const [pending, setPending] = useState<any[]>([]);
  const [approved, setApproved] = useState<any[]>([]);

  useEffect(() => {
    onValue(ref(firebaseDb, 'pendingUsers'), (s) => setPending(Object.values(s.val() || {})));
    onValue(ref(firebaseDb, 'approvedUsers'), (s) => setApproved(Object.values(s.val() || {})));
  }, []);

  const handleReset = () => {
    if (window.confirm("האם אתה בטוח שברצונך לאפס את המונה הגלובלי ל-0?")) {
      resetGlobalCount();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-amber-100">
        <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <Users className="text-indigo-600" /> ניהול משתמשים
        </h2>
        
        {/* ממתינים לאישור */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-amber-600 mb-3 tracking-wide">ממתינים לאישור ({pending.length})</h3>
          <div className="space-y-2">
            {pending.map(u => (
              <div key={u.email} className="flex justify-between items-center bg-amber-50 p-3 rounded-2xl border border-amber-100">
                <span className="text-sm font-bold text-slate-700">{u.name || u.email}</span>
                <button onClick={() => approveUser(u.email, u.name)} className="bg-white text-green-600 p-2 rounded-xl shadow-sm hover:bg-green-50"><Check size={18}/></button>
              </div>
            ))}
          </div>
        </div>

        {/* מאושרים */}
        <div>
          <h3 className="text-sm font-bold text-indigo-600 mb-3 tracking-wide">משתמשים פעילים ({approved.length})</h3>
          <div className="space-y-2">
            {approved.map(u => (
              <div key={u.email} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-sm text-slate-600">{u.name || u.email}</span>
                <button onClick={() => deleteUser(u.email)} className="text-red-400 hover:text-red-600 p-2 transition-colors"><Trash2 size={18}/></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-red-50 rounded-3xl p-6 border border-red-100 shadow-sm">
        <h3 className="text-red-700 font-bold mb-2">אזור מסוכן</h3>
        <button onClick={handleReset} className="w-full bg-white text-red-600 font-bold py-3 rounded-2xl shadow-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-all">
          <RotateCcw size={18} /> איפוס מונה גלובלי
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
