import React, { useState } from 'react';
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
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('אימייל או סיסמה לא נכונים');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('האימייל הזה כבר רשום במערכת');
      } else if (err.code === 'auth/weak-password') {
        setError('הסיסמה חייבת להיות לפחות 6 תווים');
      } else {
        setError('אירעה שגיאה. נסה שוב מאוחר יותר');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 rtl">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
              <LogIn className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-2">
              {isRegistering ? 'יצירת חשבון חדש' : 'ברוך הבא למערכת'}
            </h1>
            <p className="text-slate-500">נא להזין פרטים כדי להמשיך</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-r-4 border-red-500 text-red-700 flex items-center gap-3 animate-pulse-slow">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 mr-1">שם מלא</label>
                <div className="relative">
                  <User className="absolute right-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    placeholder="ישראל ישראלי"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 mr-1">אימייל</label>
              <div className="relative">
                <Mail className="absolute right-3 top-3.5 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 mr-1">סיסמה</label>
              <div className="relative">
                <Lock className="absolute right-3 top-3.5 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                  placeholder="••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                loading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95'
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isRegistering ? (
                <>
                  <UserPlus size={20} />
                  צור חשבון והמתן לאישור
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  התחבר למערכת
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
            >
              {isRegistering ? 'כבר יש לך חשבון? התחבר כאן' : 'אין לך חשבון? הירשם עכשיו'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
