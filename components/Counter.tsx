import React from 'react';
import { Plus } from 'lucide-react';

interface CounterProps {
  globalCount: number;
  onIncrement: () => void;
  userName?: string;
  isUpdating?: boolean;
}

const Counter: React.FC<CounterProps> = ({ globalCount, onIncrement, userName, isUpdating }) => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl p-10 text-center border border-white relative overflow-hidden">
      <h2 className="text-slate-400 font-bold text-sm mb-2">סך המצוות העולמי</h2>
      <div className="text-6xl font-black text-indigo-600 mb-8 tabular-nums">
        {(globalCount || 0).toLocaleString()}
      </div>
      
      <button
        onClick={onIncrement}
        disabled={isUpdating}
        className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center transition-all shadow-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white`}
      >
        <Plus size={48} strokeWidth={3} />
      </button>
      
      <p className="mt-8 text-slate-500 font-medium">שלום {userName || 'צדיק'}, לחץ להוספת מצווה!</p>
    </div>
  );
};

export default Counter;
