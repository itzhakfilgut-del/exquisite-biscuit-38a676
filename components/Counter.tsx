
import React, { useState, useEffect } from 'react';
import { subscribeToGlobalCount, updateCount } from '../services/firebaseService';
import { User } from '../types';

interface CounterProps {
  user: User;
}

const Counter: React.FC<CounterProps> = ({ user }) => {
  const [count, setCount] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToGlobalCount((newCount) => {
      setCount(newCount);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleIncrement = async () => {
    setAnimate(true);
    
    // Optimistic update for UI feel
    setCount(prev => prev + 1);
    
    let lat, lng;
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 2000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (e) {
        console.warn("Location not available");
      }
    }

    try {
      await updateCount(user.email, user.name, lat, lng, user.picture);
    } catch (e) {
      console.error("Sync failed:", e);
    }
    
    setTimeout(() => setAnimate(false), 300);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-80">
      <div className="relative">
        <div className="absolute inset-0 bg-black/10 rounded-full animate-ping scale-150"></div>
        <div className="relative animate-spin h-12 w-12 border-4 border-gray-100 border-t-black rounded-full"></div>
      </div>
      <p className="mt-6 text-gray-400 text-xs font-black uppercase tracking-widest">מתחבר ל-Firebase...</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-10 animate-fade-in">
      <div className="flex items-center space-x-2 space-x-reverse bg-white shadow-sm border border-gray-100 px-4 py-2 rounded-full">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">סנכרון גלובלי פעיל</span>
      </div>

      <div className={`transition-all duration-500 flex flex-col items-center ${animate ? 'scale-110' : 'scale-100'}`}>
        <span className="text-[11rem] font-black leading-none bg-clip-text text-transparent bg-gradient-to-b from-gray-900 via-black to-gray-800 tracking-tighter drop-shadow-sm">
          {count.toLocaleString()}
        </span>
        <div className="h-1 w-32 bg-black/5 rounded-full -mt-4 blur-md"></div>
      </div>

      <div className="relative group pt-4">
        {/* Glow effect */}
        <div className={`absolute -inset-8 bg-black/5 rounded-full blur-3xl transition-opacity duration-1000 ${animate ? 'opacity-100' : 'opacity-40'}`}></div>
        
        <button
          onClick={handleIncrement}
          className="relative w-64 h-64 bg-white rounded-full flex flex-col items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-gray-50 overflow-hidden"
        >
          <div className={`absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
          
          <div className={`relative z-10 transition-transform duration-300 ${animate ? '-translate-y-2' : ''}`}>
             <svg width="100" height="100" viewBox="0 0 100 100" fill="none" className="text-black">
                <rect x="25" y="20" width="50" height="45" rx="4" fill="currentColor" />
                <rect x="20" y="65" width="60" height="10" rx="2" fill="currentColor" />
                <path d="M40 30 V 45 M 50 30 V 45 M 60 30 V 45" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <path d="M15 85 Q 50 95 85 85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
             </svg>
          </div>
          
          <span className="mt-4 text-xl font-black text-gray-900 tracking-tight relative z-10">
            לחץ לספירה
          </span>
          <p className="text-[9px] text-gray-400 font-bold mt-1 relative z-10 uppercase tracking-tighter">המצווה שלך נרשמת כעת</p>
        </button>
      </div>

      <div className="flex flex-col items-center pt-4">
        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
          שלום, <span className="text-black">{user.name}</span>
        </p>
      </div>
    </div>
  );
};

export default Counter;
