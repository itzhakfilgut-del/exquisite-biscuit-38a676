import React from 'react';
import { UserContribution } from '../types';
import { Trophy, Medal, Award, Users } from 'lucide-react';

interface SummaryProps {
  contributions: UserContribution[];
  currentUserEmail: string;
}

const Summary: React.FC<SummaryProps> = ({ contributions = [], currentUserEmail }) => {
  // הגנה: אם אין נתונים עדיין או שהמערכת בטעינה
  if (!contributions || contributions.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl border border-slate-100 animate-pulse">
        <Users className="mx-auto text-slate-200 mb-4" size={48} />
        <p className="text-slate-400 font-black text-xl">טוען את לוח הצדיקים...</p>
      </div>
    );
  }

  // מיון לפי כמות (ליתר ביטחון)
  const sortedContribs = [...contributions].sort((a, b) => (b.count || 0) - (a.count || 0));

  return (
    <div className="space-y-6 animate-fade-in pb-8" style={{ direction: 'rtl' }}>
      <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100 border border-white">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Trophy className="text-amber-500" size={32} />
            דירוג המצוות
          </h2>
          <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-sm font-black">
            {contributions.length} משתתפים
          </span>
        </div>
        
        <div className="space-y-4">
          {sortedContribs.map((contrib, index) => {
            const isMe = contrib.email === currentUserEmail;
            const count = contrib.count || 0;
            
            return (
              <div 
                key={contrib.email || index} 
                className={`flex items-center justify-between p-5 rounded-3xl transition-all transform hover:scale-[1.02] ${
                  isMe ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.03]' : 'bg-slate-50 border border-slate-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* מדליות לשלושת המקומות הראשונים */}
                  <div className="w-8 flex justify-center">
                    {index === 0 ? <Medal className={isMe ? "text-amber-300" : "text-amber-500"} size={28} /> : 
                     index === 1 ? <Medal className={isMe ? "text-slate-200" : "text-slate-400"} size={26} /> :
                     index === 2 ? <Award className={isMe ? "text-orange-200" : "text-orange-700"} size={24} /> : 
                     <span className={`font-black ${isMe ? 'text-indigo-200' : 'text-slate-300'}`}>{index + 1}</span>}
                  </div>
                  
                  <img 
                    src={contrib.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(contrib.name || 'U')}&background=random`} 
                    className="w-12 h-12 rounded-2xl bg-white shadow-sm object-cover border-2 border-white/20"
                    alt=""
                  />
                  
                  <div>
                    <div className={`font-black text-lg leading-tight ${isMe ? 'text-white' : 'text-slate-800'}`}>
                      {contrib.name || 'צדיק אנונימי'}
                    </div>
                    {isMe && <div className="text-[10px] font-bold opacity-80">זה החשבון שלך</div>}
                  </div>
                </div>
                
                <div className={`text-2xl font-black tabular-nums ${isMe ? 'text-white' : 'text-indigo-600'}`}>
                  {count.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Summary;
