import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, Map as MapIcon, LogOut } from 'lucide-react';
import Login from './components/Login';
import IsraelMap from './components/IsraelMap';
import Summary from './components/Summary';
import Counter from './components/Counter';
import { firebaseAuth, firebaseDb, logout, updateCount, getProjectId } from './services/firebaseService';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('counter');
  const [globalCount, setGlobalCount] = useState(0);
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    onAuthStateChanged(firebaseAuth, (u) => setUser(u));
    onValue(ref(firebaseDb, 'global/totalCount'), (s) => setGlobalCount(s.val() || 0));
    onValue(ref(firebaseDb, 'contributions'), (s) => {
      const data = s.val() || {};
      setContributions(Object.values(data) as any);
    });
  }, []);

  if (!user) return <Login onLoginSuccess={setUser} />;

  const handleIncrement = () => {
    updateCount(user.email, user.displayName || 'צדיק');
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20 rtl" style={{ direction: 'rtl' }}>
      <header className="bg-white p-4 shadow-sm flex justify-between items-center">
        <h1 className="font-bold text-xl">מונה המצוות</h1>
        <button onClick={logout} className="text-slate-500"><LogOut size={20}/></button>
      </header>

      <main className="p-6 max-w-md mx-auto">
        {activeTab === 'counter' && (
          <Counter globalCount={globalCount} onIncrement={handleIncrement} userName={user.displayName} />
        )}
        {activeTab === 'summary' && <Summary contributions={contributions} currentUserEmail={user.email} />}
        {activeTab === 'map' && <IsraelMap contributions={contributions} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-4">
        <button onClick={() => setActiveTab('counter')} className={activeTab === 'counter' ? 'text-indigo-600' : 'text-slate-400'}><Plus /></button>
        <button onClick={() => setActiveTab('summary')} className={activeTab === 'summary' ? 'text-indigo-600' : 'text-slate-400'}><BarChart3 /></button>
        <button onClick={() => setActiveTab('map')} className={activeTab === 'map' ? 'text-indigo-600' : 'text-slate-400'}><MapIcon /></button>
      </nav>
    </div>
  );
};

export default App;
