import React, { useEffect, useState } from 'react';
import { subscribeToContributions, deleteContribution, setContributionCount, resetAllCounts } from '../services/firebaseService';
import { UserContribution, User } from '../types';
import { ADMIN_EMAIL } from '../constants';
import { Trash2, Edit2, Check, X, RotateCcw } from 'lucide-react';
import AdminPanel from './AdminPanel';

interface SummaryProps {
  user: User | null;
}

const Summary: React.FC<SummaryProps> = ({ user }) => {
  const [contributions, setContributions] = useState<UserContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const unsubscribe = subscribeToContributions((data) => {
      setContributions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (email: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק רשומה זו?')) {
      try {
        await deleteContribution(email);
      } catch (e) {
        alert('המחיקה נכשלה. וודא שיש לך הרשאות מתאימות.');
      }
    }
  };

  const handleResetAll = async () => {
    if (window.confirm('אזהרה: פעולה זו תאפס את כל הלחיצות של כל המשתמשים ואת המונה הגלובלי. האם להמשיך?')) {
      await resetAllCounts();
    }
  };

  const startEdit = (c: UserContribution) => {
    setEditingEmail(c.email);
    setEditValue(c.count);
  };

  const saveEdit = async (email: string) => {
    await setContributionCount(email, editValue);
    setEditingEmail(null);
  };

  if (loading) return (
    <div className="flex flex-col space-y-3 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-16 bg-gray-200 rounded-2xl w-full"></div>
      ))}
    </div>
  );

  return (
    <div className="w-full space-y-4 animate-fade-in">
      
      {/* כאן הוספנו את פאנל הניהול שיופיע רק למנהל! */}
      {isAdmin && <AdminPanel />}

      <div className="flex justify-between items-end mb-2">
        <h3 className="text-xl font-black text-gray-800">סיכום פעילות</h3>
        <div className="flex items-center space-x-3 space-x-reverse">
          {isAdmin && (
            <button 
              onClick={handleResetAll}
              className="flex items-center space-x-1 space-x-reverse px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold border border-red-100 hover:bg-red-100 transition-colors"
            >
              <RotateCcw size={12} />
              <span>איפוס הכל</span>
            </button>
          )}
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">לפי משתמש</span>
        </div>
      </div>
      
      {contributions.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center text-gray-400 italic">
          אין נתונים עדיין... היה הראשון לספור!
        </div>
      ) : (
        <div className="space-y-3">
          {contributions.map((c, idx) => (
            <div 
              key={c.email} 
              className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                  {idx + 1}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800">{c.name}</span>
                  <span className="text-[10px] text-gray-400">{c.email}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                {isAdmin && (
                  <div className="flex items-center space-x-1 space-x-reverse mr-2">
                    {editingEmail === c.email ? (
                      <>
                        <input 
                          type="number" 
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-xs border rounded bg-gray-50 font-bold"
                        />
                        <button onClick={() => saveEdit(c.email)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingEmail(null)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(c)} title="ערוך" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setContributionCount(c.email, 0)} title="אפס משתמש" className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                          <RotateCcw size={14} />
                        </button>
                        <button onClick={() => handleDelete(c.email)} title="מחק" className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                )}
                <div className="bg-black text-white px-4 py-1 rounded-full text-sm font-black">
                  {c.count}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Summary;
