
import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, onClose }) => {
  const [key, setKey] = useState(localStorage.getItem('VISION_API_KEY') || '');
  const [error, setError] = useState('');

  const handleStudioSelect = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      onSave(process.env.API_KEY || '');
    } else {
      setError("AI Studio selector not available in this environment.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim().length < 20) {
      setError('Please enter a valid Gemini API Key.');
      return;
    }
    localStorage.setItem('VISION_API_KEY', key.trim());
    onSave(key.trim());
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-fade-in">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden">
        <div className="p-12">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">Connect Key</h2>
            <p className="text-slate-500 font-medium text-sm">Required for high-fidelity production and video generation.</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleStudioSelect}
              className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
            >
              <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d47353047313c4f3366cc.svg" className="w-5 h-5" alt=""/>
              Select Paid Project Key
            </button>
            
            <div className="flex items-center gap-4">
              <div className="h-px bg-slate-100 flex-1"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase">OR</span>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                value={key}
                onChange={(e) => { setKey(e.target.value); setError(''); }}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder-slate-300 font-mono text-center text-sm"
                placeholder="Paste API Key manually"
              />
              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-xs hover:bg-slate-800 transition-all uppercase tracking-widest shadow-xl"
              >
                Launch with Manual Key
              </button>
            </form>
            
            {error && <p className="text-red-600 text-[10px] font-bold text-center">{error}</p>}
            
            <button onClick={onClose} className="w-full text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest py-2">
              Cancel
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
             <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 uppercase tracking-widest font-black hover:underline">
               Get Key from Google AI Studio
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
