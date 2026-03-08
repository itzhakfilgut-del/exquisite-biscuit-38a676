import React, { useState } from 'react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../services/firebaseService';

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState(''); // שדה השם החדש
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isRegistering) {
        await registerWithEmail(email, password, name, rememberMe);
      } else {
        await loginWithEmail(email, password, rememberMe);
      }
    } catch (err: any) {
      console.error("Auth failed", err);
      if (err.code === 'auth/email-already-in-use') setError('האימייל הזה כבר רשום במערכת.');
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') setError('אימייל או סיסמה שגויים.');
      else if (err.code === 'auth/weak-password') setError('הסיסמה חלשה מדי, בחר סיסמה של 6 תווים לפחות.');
      else setError('אירעה שגיאה. וודא שאתה מחובר לאינטרנט ונסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle(rememberMe);
    } catch (e: any) {
      console.error("Google Login failed", e);
      if (e.code === 'auth/popup-blocked') {
        setError("החלון הקופץ של גוגל נחסם. אנא אפשר חלונות קופצים בדפדפן.");
      } else {
        setError("התחברות עם גוגל נכשלה. נסה שוב.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl border border-gray-100 animate-fade-in max-w-sm mx-auto">
      
      {/* כותרת ולוגו */}
      <div className="text-center space-y-3">
        <div className="bg-gradient-to-br from-gray-800 to-black w-16 h-16 rounded-[1.5rem] mx-auto flex items-center justify-center shadow-xl transform hover:rotate-12 transition-transform cursor-pointer">
          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">KARKAFOT</h2>
          <p className="text-gray-400 font-medium text-[10px] uppercase tracking-widest mt-1">Real-time Global Counter</p>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed px-2">
          {isRegistering ? 'צרו חשבון חדש כדי להשתתף במונה הקרקפות הגלובלי.' : 'התחברו כדי להשתתף במונה הקרקפות ולראות את הדירוג שלכם.'}
        </p>
      </div>

      {/* הודעת שגיאה אדומה */}
      {error && (
        <div className="w-full p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold text-center border border-red-100">
          {error}
        </div>
      )}

      {/* טופס התחברות/הרשמה עם אימייל */}
      <form onSubmit={handleEmailSubmit} className="w-full space-y-3">
        
        {/* שדה שם פרטי - מופיע רק בהרשמה */}
        {isRegistering && (
          <div>
            <input 
              type="text" 
              placeholder="שם פרטי (יוצג באתר)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-right"
              required
              disabled={loading}
            />
          </div>
        )}

        <div>
          <input 
            type="email" 
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-left dir-ltr"
            required
            disabled={loading}
          />
        </div>
        <div>
          <input 
            type="password" 
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-left dir-ltr"
            required
            minLength={6}
            disabled={loading}
          />
        </div>

        {/* תיבת סימון "זכור אותי" */}
        <div className="flex items-center space-x-2 space-x-reverse px-1 pt-1">
          <input 
            type="checkbox" 
            id="rememberMe" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            disabled={loading}
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-600 font-medium cursor-pointer select-none">
            זכור אותי במחשב זה
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50 text-sm mt-2"
        >
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
          ) : (
            <span>{isRegistering ? 'הרשמה למערכת' : 'התחברות'}</span>
          )}
        </button>
      </form>

      {/* כפתור מעבר בין התחברות להרשמה */}
      <button 
        type="button"
        onClick={() => {
          setIsRegistering(!isRegistering);
          setError('');
        }}
        className="text-xs text-gray-500 font-bold hover:text-black transition-colors"
      >
        {isRegistering ? 'כבר יש לך חשבון? לחץ להתחברות' : 'אין לך חשבון? לחץ להרשמה'}
      </button>

      <div className="w-full flex items-center opacity-40">
        <div className="flex-1 border-t border-gray-400"></div>
        <span className="px-3 text-[10px] font-black uppercase tracking-widest text-gray-500">או</span>
        <div className="flex-1 border-t border-gray-400"></div>
      </div>

      {/* התחברות גוגל עם פופאפ */}
      <button 
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full py-3.5 px-6 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center space-x-3 space-x-reverse disabled:opacity-50 text-sm"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/0.png" alt="Google" className="w-4 h-4" />
        <span>המשך עם גוגל</span>
      </button>

      {/* קרדיט למטה */}
      <div className="flex flex-col items-center space-y-2 opacity-40 pt-2">
        <div className="flex items-center space-x-1 space-x-reverse text-[9px] font-bold text-gray-500">
           <span>POWERED BY</span>
           <span className="text-orange-500">FIREBASE</span>
        </div>
      </div>
    </div>
  );
};

export default Login;