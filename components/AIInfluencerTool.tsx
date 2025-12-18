
import React, { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import ResultCard from './ResultCard';
import { generateInfluencerShoot, suggestInfluencerScenes, isAuthError, safeSaveToLocalStorage } from '../services/geminiService';
import { driveService } from '../services/driveService';
import { 
  AppState, 
  GeneratedImage, 
  InfluencerGender, 
  InfluencerRegionalLook, 
  INFLUENCER_REGIONAL, 
  InfluencerAge, 
  INFLUENCER_AGES, 
  InfluencerSkinTone, 
  INFLUENCER_SKIN_TONES, 
  InfluencerBodyType, 
  INFLUENCER_BODY_TYPES, 
  AspectRatio, 
  ASPECT_RATIOS,
  InfluencerShotType 
} from '../types';

interface AIInfluencerToolProps {
  onBack: () => void;
  incrementUsage: () => void;
  isLimitReached: boolean;
  onViewLarge?: (url: string) => void;
}

const AIInfluencerTool: React.FC<AIInfluencerToolProps> = ({ onBack, incrementUsage, onViewLarge }) => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [usage, setUsage] = useState("");
  const [gender, setGender] = useState<InfluencerGender>("Female");
  const [region, setRegion] = useState<InfluencerRegionalLook>("Auto");
  const [age, setAge] = useState<InfluencerAge>("Auto");
  const [skin, setSkin] = useState<InfluencerSkinTone>("Auto");
  const [body, setBody] = useState<InfluencerBodyType>("Auto");
  const [shotType, setShotType] = useState<InfluencerShotType>("Standard UGC");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [results, setResults] = useState<(GeneratedImage | null)[]>([]);
  const [history, setHistory] = useState<GeneratedImage[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('HISTORY_UGC') || '[]');
    } catch {
      return [];
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const hasKey = !!localStorage.getItem('VISION_API_KEY') || !!process.env.API_KEY;

  useEffect(() => {
    safeSaveToLocalStorage('HISTORY_UGC', history.slice(0, 10));
  }, [history]);

  const handleGenerate = async () => {
    if (!hasKey) return;
    if (productImages.length === 0) return setError("Please upload product images.");
    if (!description) return setError("Please describe the product.");
    
    setAppState(AppState.ANALYZING);
    setError(null);
    setResults([]);
    const totalCalls = 4;
    setProgress(0);

    try {
      const scenes = await suggestInfluencerScenes(productImages, description, gender);
      setAppState(AppState.GENERATING);

      for (let i = 0; i < totalCalls; i++) {
        const scene = scenes[i % scenes.length] || { title: `Scene ${i+1}`, description: `UGC interaction`, persona: "User", setting: "Natural" };
        try {
          const url = await generateInfluencerShoot(productImages, description, {
            gender, 
            setting: scene.setting, 
            aspectRatio: aspectRatio, 
            usage,
            regionalLook: region, 
            age, 
            skinTone: skin, 
            bodyType: body, 
            shotType: shotType
          });
          const res: GeneratedImage = { id: `inf_${Date.now()}_${i}`, url, theme: scene.title, description: scene.description, timestamp: Date.now() };
          setResults(prev => [...prev, res]);
          setHistory(prev => [res, ...prev]);
          incrementUsage();
        } catch (err: any) {
          if (isAuthError(err)) {
            throw err;
          }
        }
        setProgress(Math.round(((i + 1) / totalCalls) * 100));
        if (i < totalCalls - 1) await new Promise(r => setTimeout(r, 6000));
      }
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      setError(err.message || "Production failed.");
      setAppState(AppState.ERROR);
    }
  };

  const handleDriveUpload = async (url: string, id: string) => {
    await driveService.upload(url, `ugc_asset_${id.substring(0, 8)}.png`);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-12 py-10">
      <div className="mb-10">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest text-[10px] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth={2.5} /></svg>
          Dashboard
        </button>
      </div>

      <div className="text-center mb-16 uppercase">
        <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">PULSE</h2>
        <p className="text-slate-500 font-medium lowercase">Authentic Indian social proof with precision usage context.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-purple-600"></div>
            
            <div className="space-y-10">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">1. Media Hub</h3>
                <ImageUploader onImageSelect={setProductImages} selectedImages={productImages} disabled={appState === AppState.GENERATING} multiple={true} />
              </div>

              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">2. Context Engine</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Description</label>
                    <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium outline-none h-24 focus:ring-4 focus:ring-purple-50 transition-all" placeholder="What is the product?" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Usage Context</label>
                    <textarea value={usage} onChange={e=>setUsage(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium outline-none h-24 focus:ring-4 focus:ring-purple-50 transition-all" placeholder="E.g., used while drinking coffee, worn at a gym..." />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">3. Demographic & Sizing</h3>
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-3">
                      <select value={gender} onChange={e=>setGender(e.target.value as any)} className="w-full bg-slate-50 p-3 rounded-xl text-[10px] font-black uppercase border border-slate-100 outline-none">
                        <option value="Female">Female</option><option value="Male">Male</option>
                      </select>
                      <select value={region} onChange={e=>setRegion(e.target.value as any)} className="w-full bg-slate-50 p-3 rounded-xl text-[10px] font-black uppercase border border-slate-100 outline-none">
                        {INFLUENCER_REGIONAL.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                   </div>
                   <div className="grid grid-cols-3 gap-2">
                      {ASPECT_RATIOS.map(ratio => (
                        <button key={ratio} onClick={()=>setAspectRatio(ratio)} className={`py-2 text-[10px] font-black rounded-lg border transition-all ${aspectRatio === ratio ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{ratio}</button>
                      ))}
                   </div>
                </div>
              </div>

              <button 
                onClick={handleGenerate} 
                disabled={appState === AppState.GENERATING || productImages.length === 0 || !hasKey} 
                className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-slate-800 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
              >
                {appState === AppState.GENERATING ? "AI Filming..." : "Launch Production"}
              </button>
              {!hasKey && <p className="text-[10px] font-black text-red-500 mt-2 text-center uppercase tracking-widest">Please connect your API key in Profile settings</p>}
              
              {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-bold border border-red-100 text-center">{error}</div>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9 space-y-12">
          {appState === AppState.GENERATING && results.length === 0 && (
             <div className="w-full bg-white border border-slate-100 rounded-[3rem] p-24 flex flex-col items-center justify-center text-center shadow-xl animate-shimmer">
               <div className="w-24 h-24 relative mb-10"><div className="absolute inset-0 border-[6px] border-slate-50 rounded-full"></div><div className="absolute inset-0 border-[6px] border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>
               <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Filming UGC Batch</h3>
               <div className="w-full max-w-md bg-slate-50 h-2 rounded-full overflow-hidden mt-10"><div className="bg-purple-600 h-full transition-all duration-1000" style={{width: `${progress}%`}}></div></div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {results.map((r, i) => (
              <ResultCard 
                key={r?.id || i} 
                title={r?.theme || `UGC Shot #${i+1}`} 
                loading={appState === AppState.GENERATING && !r} 
                result={r || undefined} 
                onDownload={(url, id) => { const a = document.createElement('a'); a.href = url; a.download = `ugc_${id}.png`; a.click(); }} 
                onRefine={()=>{}} 
                onUpscale={()=>{}} 
                onViewLarge={onViewLarge} 
                onDriveUpload={handleDriveUpload}
              />
            ))}
          </div>

          {history.length > 0 && (
            <div className="pt-10">
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">UGC Archive</h3>
                <div className="flex-1 h-px bg-slate-100"></div>
                <button onClick={() => { setHistory([]); localStorage.removeItem('HISTORY_UGC'); }} className="text-[10px] font-black text-red-500 uppercase hover:underline">Clear History</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {history.map(item => (
                  <div key={item.id} className="group relative aspect-[9/16] rounded-2xl overflow-hidden border border-slate-100 bg-white hover:scale-[1.05] transition-all cursor-pointer shadow-sm" onClick={()=>onViewLarge && onViewLarge(item.url)}>
                    <img src={item.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInfluencerTool;
