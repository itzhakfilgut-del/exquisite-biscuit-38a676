import React, { useEffect, useState } from 'react';
import { subscribeToPendingUsers, approveUser, rejectUser } from '../services/firebaseService';

const AdminPanel: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToPendingUsers((users) => {
      setPendingUsers(users);
    });
    return () => unsubscribe();
  }, []);

  if (pendingUsers.length === 0) {
    return (
      <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center shadow-sm mb-6">
        <p className="text-green-700 text-sm font-bold">אין משתמשים הממתינים לאישור כרגע. 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 shadow-sm space-y-4 mb-6 animate-fade-in rtl">
      <div className="flex items-center space-x-2 space-x-reverse mb-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
        </span>
        <h3 className="text-lg font-black text-orange-800">פאנל ניהול: בקשות הצטרפות</h3>
      </div>
      
      <div className="space-y-3">
        {pendingUsers.map((user, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-xl border border-orange-100 shadow-sm">
            <div className="flex items-center space-x-3 space-x-reverse">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border border-gray-200" />
              ) : (
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-gray-900">{user.name}</span>
                <span className="text-[10px] text-gray-500">{user.email}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={() => approveUser(user.email)}
                className="px-4 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors shadow-sm"
              >
                אשר גישה
              </button>
              <button
                onClick={() => rejectUser(user.email)}
                className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors border border-red-100"
              >
                דחה
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
