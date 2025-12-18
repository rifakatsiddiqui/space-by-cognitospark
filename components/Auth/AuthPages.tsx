
import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../../services/firebase';

export const LoginPage: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 uppercase">Vision Studio</h1>
          <p className="text-slate-500 font-medium">Log in to your neural workspace</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-50 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black uppercase text-slate-400 block tracking-widest">Password</label>
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-[9px] font-black uppercase text-blue-600 hover:underline tracking-widest"
              >
                Forgot?
              </button>
            </div>
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-50 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && <p className="text-red-600 text-[10px] font-bold text-center animate-shake">{error}</p>}
          {resetMessage && <p className="text-emerald-600 text-[10px] font-bold text-center">{resetMessage}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-[0.3em] text-[10px] hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-xl"
          >
            {loading ? "Authenticating..." : "Login to Studio"}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-slate-100"></div></div>
          <div className="relative flex justify-center text-[9px] font-black text-slate-300 uppercase tracking-widest"><span className="bg-white px-4">Or continue with</span></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full py-5 bg-white border border-slate-100 text-slate-900 font-black rounded-2xl uppercase tracking-[0.3em] text-[10px] hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt=""/>
          Google Auth
        </button>

        <p className="mt-10 text-center text-xs text-slate-400 font-medium">
          Need an account? <button onClick={onToggle} className="text-blue-600 font-black hover:underline uppercase tracking-widest ml-1">Sign up</button>
        </p>
      </div>
    </div>
  );
};

export const SignupPage: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 uppercase">Vision Studio</h1>
          <p className="text-slate-500 font-medium">Join our advanced neural hub</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-50 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-50 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-600 text-[10px] font-bold text-center animate-shake">{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-[0.3em] text-[10px] hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-xl"
          >
            {loading ? "Creating Instance..." : "Initialize Account"}
          </button>
        </form>

        <p className="mt-10 text-center text-xs text-slate-400 font-medium">
          Already verified? <button onClick={onToggle} className="text-blue-600 font-black hover:underline uppercase tracking-widest ml-1">Log in</button>
        </p>
      </div>
    </div>
  );
};
