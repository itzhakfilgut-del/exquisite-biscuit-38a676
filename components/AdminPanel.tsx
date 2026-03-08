import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { firebaseDb, approveUser, deleteUser, resetGlobalCount, resetUserCount } from '../services/firebaseService';
import { Check, Trash2, RotateCcw, Users, Clock, RefreshCw } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [pending, setPending] = useState<any[]>([]);
  const [approved, setApproved] = useState<any[]>([]);

  useEffect(() => {
    // משיכת ממתינים
    onValue(ref(firebaseDb, 'pendingUsers'), (s) => setPending(Object.values(s.val() || {})));
    
    // משיכת מאושרים + חיבור המונה שלהם מהדירוג
    onValue(ref(firebaseDb, 'approvedUsers'), (s) => {
      const approvedData = s.val() || {};
      onValue(ref(firebaseDb, 'contributions'), (cSnap) => {
        const contribs = cSnap.val() || {};
        const combined = Object.values(approvedData).map((u: any) => ({
          ...u,
          count: contribs[u.email.replace(/\./g, '_')]?.count || 0
        }));
        setApproved(combined);
      });
    });
  }, []);

  return (
    <div className="space-y-6 pb-10 text-right rtl" style={{ direction: 'rtl' }}>
      <div className="bg-white rounded-3xl p-6 shadow-md border border-amber-100">
        <h3 className="text-amber-600 font-bold mb-4 flex items-center gap-2"><Clock size={18}/> ממתינים לאישור ({pending.length})</h3>
        {pending.map(u => (
          <div key={u.email} className="flex justify-between items-center bg-amber-50 p-3 rounded-xl mb-2">
            <span className="text-sm font-bold">{u.name || u.email}</span>
            <button onClick={() => approveUser(u.email, u.name)} className="text-green-600 bg-white p-2 rounded-lg shadow-sm"><Check size={18}/></button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
        <h3 className="text-indigo-600 font-bold mb-4 flex items-center gap-2"><Users size={18}/> משתמשים פעילים ({approved.length})</h3>
        {approved.map(u => (
          <div key={u.email} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl mb-2">
            <div className="flex flex-col">
              <span className="text-sm font-bold">{u.name}</span>
              <span className="text-[10px] text-indigo-500 font-bold">מונה: {u.count}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => window.confirm(`לאפס ל-${u.name}?`) && resetUserCount(u.email)} 
                className="text-amber-500 p-2 hover:bg-amber-100 rounded-lg transition-colors"
                title="איפוס מונה אישי"
              >
                <RefreshCw size={16}/>
              </button>
              <button onClick={() => window.confirm("למחוק משתמש?") && deleteUser(u.email)} className="text-slate-300 p-2 hover:text-red-500"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => window.confirm("לאפס את כל המערכת?") && resetGlobalCount()} className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl border border-red-100 flex items-center justify-center gap-2">
        <RotateCcw size={18} /> איפוס מונה ודירוג כללי
      </button>
    </div>
  );
};

export default AdminPanel;
