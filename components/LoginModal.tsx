import React, { useState } from 'react';

interface LoginModalProps {
  onLogin: (email: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || email.length < 5) {
      setError('Please enter a valid email address.');
      return;
    }
    onLogin(email);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-white rounded-none shadow-2xl w-full max-w-md overflow-hidden relative border border-slate-200">
        <div className="p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black text-white rounded-none flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-3xl font-extrabold text-black uppercase tracking-tight">Access Tool</h2>
            <p className="text-slate-600 mt-2 font-medium">Verify your email to check daily credits.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-black uppercase mb-2 tracking-wider">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="w-full px-4 py-4 bg-white text-black border-2 border-slate-300 focus:border-black focus:ring-0 outline-none transition-all placeholder-slate-400 font-medium rounded-none"
                placeholder="Enter your email"
                autoFocus
              />
              {error && <p className="text-red-600 text-xs mt-2 font-bold">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white font-bold py-4 hover:bg-slate-800 transition-all uppercase tracking-widest text-sm rounded-none"
            >
              Start Generating
            </button>
          </form>
          
          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
             <p className="text-[10px] text-slate-400 uppercase tracking-widest">
               Rifakat AI Suite • Secure Access
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;