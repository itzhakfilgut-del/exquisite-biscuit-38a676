import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { firebaseDb, approveUser, deleteUser, resetGlobalCount, resetUserCount } from '../services/firebaseService';
import { Check, Trash2, RotateCcw, Users, ShieldCheck, Clock, RefreshCcw } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [pending, setPending] = useState<any[]>([]);
  const [approved, setApproved] = useState<any[]>([]);

  useEffect(() => {
    onValue(ref(firebaseDb, 'pendingUsers'), (s) => setPending(Object.values(s.val() || {})));
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
    <div className="space-y-6 animate-fade-in pb-10 text-right" style={{ direction: 'rtl' }}>
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg">
        <h2 className="text-xl font-black flex items-center gap-2">
          <ShieldCheck /> פאנל ניהול
        </h2>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-md border border-amber-100">
        <h3 className="text-amber-600 font-bold mb-4 flex items-center gap-2"><Clock size={18}/> ממתינים ({pending.length})</h3>
        {pending.map(u => (
          <div key={u.email} className="flex justify-between items-center bg-amber-50 p-3 rounded-xl mb-2">
            <span className="text-sm font-bold">{u.name || u.email}</span>
            <button onClick={() => approveUser(u.email, u.name)} className="text-green-600 bg-white p-2 rounded-lg shadow-sm"><Check size={18}/></button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
        <h3 className="text-indigo-600 font-bold mb-4 flex items-center gap-2"><Users size={18}/> פעילים ({approved.length})</h3>
        {approved.map(u => (
          <div key={u.email} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl mb-2">
            <div className="flex flex-col">
              <span className="text-sm font-bold">{u.name}</span>
              <span className="text-[10px] text-indigo-500 font-bold">מונה: {u.count}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => resetUserCount(u.email)} className="text-amber-500 p-2"><RefreshCcw size={16}/></button>
              <button onClick={() => deleteUser(u.email)} className="text-slate-300 p-2"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => window.confirm("לאפס הכל?") && resetGlobalCount()} className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl border border-red-100 flex items-center justify-center gap-2">
        <RotateCcw size={18} /> איפוס מונה ודירוג כללי
      </button>
    </div>
  );
};

export default AdminPanel;
