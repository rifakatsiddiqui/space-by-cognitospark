
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../../services/firebase';

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { profile, saveApiKey, user } = useAuth();
  const [newKey, setNewKey] = useState(profile?.geminiApiKey || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await saveApiKey(newKey);
      setSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    setPassLoading(true);
    setPassError('');
    setPassSuccess(false);

    try {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPassSuccess(true);
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassError(err.message || "Failed to update password. Check old password.");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-20">
      <div className="mb-12 flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest text-[10px] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth={2.5} /></svg>
          Dashboard
        </button>
      </div>

      <div className="bg-white p-12 lg:p-20 rounded-[4rem] border border-slate-100 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-10 mb-20">
          <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-2">Neural Profile</h1>
            <p className="text-slate-400 font-medium text-lg">{profile?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* API Vault Section */}
          <div className="space-y-12">
            <div>
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">API Configuration</h2>
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${profile?.geminiApiKey ? 'text-emerald-500 border-emerald-100 bg-emerald-50' : 'text-slate-400 border-slate-100 bg-slate-50'}`}>
                  {profile?.geminiApiKey ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 p-10 rounded-[3rem] space-y-8">
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Your personal API key is used for all <span className="text-slate-900 font-bold">Image and Video production tools</span>. 
                  Marketing and Intelligence tools run on the platform engine by default.
                </p>
                
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase text-slate-400 block ml-1 tracking-widest">Gemini API Key</label>
                  <input 
                    type="password" 
                    className="w-full bg-white border border-slate-100 p-5 rounded-2xl text-sm font-mono outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Enter production key..."
                  />
                </div>

                <div className="flex items-center gap-6">
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-xl"
                  >
                    {saving ? "Encrypting..." : "Update Vault"}
                  </button>
                  {success && (
                    <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest animate-fade-in">
                      Synced
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-6">
              <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-6">Production Links</h2>
              <div className="grid grid-cols-1 gap-4">
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="p-6 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-between hover:bg-slate-50 transition-all shadow-sm group">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Get New API Key</span>
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Account Security Section */}
          <div>
            <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-6">Account Security</h2>
            <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm space-y-8">
               <p className="text-sm text-slate-500 font-medium leading-relaxed">
                 Update your login credentials. We recommend using a complex alphanumeric passphrase.
               </p>

               <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase text-slate-400 block ml-1 tracking-widest">Current Passphrase</label>
                    <input 
                      type="password" 
                      required
                      className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase text-slate-400 block ml-1 tracking-widest">New Passphrase</label>
                    <input 
                      type="password" 
                      required
                      className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  
                  {passError && <p className="text-red-500 text-[10px] font-bold text-center">{passError}</p>}
                  {passSuccess && <p className="text-emerald-600 text-[10px] font-bold text-center">Security Credentials Updated</p>}

                  <button 
                    type="submit"
                    disabled={passLoading || !oldPassword || !newPassword}
                    className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {passLoading ? "Updating..." : "Commit Security Change"}
                  </button>
               </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
