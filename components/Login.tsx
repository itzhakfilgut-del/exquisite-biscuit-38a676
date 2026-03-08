import React, { useState } from 'react';
// שים לב: ייבוא רק של מה שקיים בשירות המעודכן
import { loginWithEmail, registerWithEmail } from '../services/firebaseService';
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (!name.trim()) throw new Error('נא להזין שם מלא');
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      // אם הגענו לכאן, סימן שהפעולה הצליחה (או עברה למצב המתנה שמנוהל ב-onAuthChange)
    } catch (err: any) {
      console.error("Auth Error:", err);
      // טיפול בשגיאות נפוצות של Firebase
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('פרטי התחברות שגויים. בדוק את האימייל והסיסמה.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('כתובת האימייל הזו כבר רשומה במערכת.');
      } else if (err.code === 'auth/weak-password') {
        setError('הסיסמה חלשה מדי. בחר לפחות 6 תווים.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('התחברות באימייל כבויה ב-Firebase. יש להפעיל אותה ב-Console.');
      } else {
        setError('שגיאה בהתחברות: ' + (err.message || 'נסה שוב מאוחר יותר'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 rtl" style={{ direction: 'rtl' }}>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-slate-100">
        <div className="p-8">
          <div className="text-center mb-10">
            <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100 rotate-3">
              <LogIn className="text-white w-10 h-10 -rotate-3" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">
              {isRegistering ? 'מצטרפים למהפכה' : 'כניסת משתמשים'}
            </h1>
            <p className="text-slate-500 font-medium">הכניסו פרטים כדי להתקדם</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-r-4 border-red-500 text-red-700 flex items-center gap-3 rounded-l-lg animate-pulse-slow">
              <AlertCircle size={20} className="shrink-0" />
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegistering && (
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 block pr-1">שם מלא</label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-right font-medium"
                    placeholder="ישראל ישראלי"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 block pr-1">אימייל</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-right font-medium"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 block pr-1">סיסמה</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-right font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-xl transition-all flex items-center justify-center gap-3 ${
                loading 
                ? 'bg-slate-400 cursor-wait' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 shadow-indigo-200'
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isRegistering ? (
                <>
                  <UserPlus size={22} />
                  הרשמה והמתנה לאישור
                </>
              ) : (
                <>
                  <LogIn size={22} />
                  התחברות למערכת
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 mb-2">
              {isRegistering ? 'כבר יש לך חשבון?' : 'עדיין לא רשום?'}
            </p>
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-indigo-600 text-lg font-black hover:text-indigo-800 transition-colors underline decoration-indigo-200 underline-offset-8"
            >
              {isRegistering ? 'חזור למסך הכניסה' : 'צור חשבון חדש עכשיו'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
