
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { AppView } from '../../types';

interface HeaderProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const { profile } = useAuth();
  
  const handleLogout = () => {
    signOut(auth);
  };

  const isApiActive = !!profile?.geminiApiKey || !!process.env.API_KEY;

  return (
    <header className="glass sticky top-0 z-[100] border-b border-slate-100 h-20">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 h-full flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setCurrentView('HOME')}>
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Vision Studio</span>
            <span className="text-[10px] font-black text-blue-600 tracking-[0.2em] uppercase mt-0.5">Professional Edition</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-4 border-r border-slate-100 pr-8 mr-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isApiActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isApiActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isApiActive ? 'API Active' : 'API Inactive'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged in as</span>
              <span className="text-xs font-bold text-slate-900">{profile?.email}</span>
            </div>
            
            <button 
              onClick={() => setCurrentView('PROFILE')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentView === 'PROFILE' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}
              title="Profile & Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </button>

            <button 
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
