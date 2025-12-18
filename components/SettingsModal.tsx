
import React, { useState } from 'react';
import { visionApi } from '../services/api';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setStatus('saving');
    try {
      await visionApi.saveUserKey(apiKey);
      localStorage.setItem('VISION_API_KEY', apiKey); // Keep for UI indicators if needed
      setStatus('success');
      setTimeout(onClose, 1000);
    } catch (e) {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-10 border border-slate-100">
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4 text-center">API Vault</h2>
        <p className="text-slate-500 text-sm text-center mb-8 font-medium">Connect your Gemini API key for high-fidelity production. Stored with AES-256 encryption.</p>
        
        <input 
          type="password"
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-mono mb-6 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-center"
          placeholder="Paste Gemini API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />

        <div className="flex flex-col gap-3">
          <button 
            onClick={handleSave}
            disabled={status === 'saving'}
            className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95"
          >
            {status === 'saving' ? "Encrypting..." : status === 'success' ? "Vault Updated!" : "Connect Key"}
          </button>
          <button onClick={onClose} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
