
import React, { useState } from 'react';
import JSZip from 'jszip';
import ClothingPartUploader from './ClothingPartUploader';
import ResultCard from './ResultCard';
import { generateFashionStudio, isAuthError } from '../services/geminiService';
import { 
  GeneratedImage, 
  AspectRatio, 
  ASPECT_RATIOS, 
  StudioAngle, 
  STUDIO_ANGLES, 
  PRODUCT_COLORS,
  OutfitInput,
  AppState
} from '../types';

interface Props {
  onBack: () => void;
  incrementUsage: () => void;
  isLimitReached: boolean;
  onViewLarge?: (url: string) => void;
}

const ClothingStudioTool: React.FC<Props> = ({ onBack, incrementUsage, isLimitReached, onViewLarge }) => {
  const [outfit, setOutfit] = useState<OutfitInput>({ upper: null, bottom: null, accessory: null, cap: null, chain: null, bracelet: null, watch: null });
  const [gender, setGender] = useState("Female");
  const [ageGroup, setAgeGroup] = useState("Young Adult (18-28)");
  const [bodyType, setBodyType] = useState("Athletic");
  const [skinTone, setSkinTone] = useState("Medium");
  const [bgColor, setBgColor] = useState("#f8fafc");
  const [angle, setAngle] = useState<StudioAngle>("Eye-Level");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("3:4");
  const [productColor, setProductColor] = useState("Original");

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [results, setResults] = useState<(GeneratedImage | null)[]>([null, null, null, null]);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const hasKey = !!localStorage.getItem('VISION_API_KEY') || !!process.env.API_KEY;

  const handleGenerate = async (refine?: string) => {
    if (!hasKey) return;
    if (isLimitReached) return setError("Limit reached.");
    const hasAny = Object.values(outfit).some(v => v !== null);
    if (!hasAny) return setError("Upload at least one clothing item.");

    setAppState(AppState.ANALYZING);
    setError(null);
    setResults([null, null, null, null]);

    try {
      setAppState(AppState.GENERATING);
      for (let i = 0; i < 4; i++) {
        const url = await generateFashionStudio(outfit, {
          gender,
          age: ageGroup,
          bodyType,
          skinTone,
          angle,
          color: bgColor,
          aspectRatio,
          productColor,
          refinement: refine
        });
        incrementUsage();
        const imgName = `outfit_${gender.toLowerCase()}_${angle.toLowerCase().replace(/\s+/g, '_')}`;
        const img: GeneratedImage = { 
            id: `fs_${Date.now()}_${i}`, 
            url, 
            theme: imgName, 
            description: `${gender}, ${angle}`, 
            timestamp: Date.now() 
        };
        setResults(prev => { const n = [...prev]; n[i] = img; return n; });
        setHistory(prev => [img, ...prev]);
        if (i < 3) await new Promise(r => setTimeout(r, 6000));
      }
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      console.error(err);
      if (isAuthError(err)) {
          setError("Authentication Denied: Check your API key in Profile.");
      } else {
          setError(err.message || "An unexpected error occurred.");
      }
      setAppState(AppState.ERROR);
    }
  };

  const handleDownloadAll = async () => {
    const validResults = results.filter(r => r !== null) as GeneratedImage[];
    if (validResults.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      validResults.forEach((res, index) => {
        const base64Data = res.url.split(',')[1];
        zip.file(`fashion_${index + 1}.png`, base64Data, { base64: true });
      });
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `CognitoSpark_Fashion_Batch_${Date.now()}.zip`;
      link.click();
    } catch (err) {
      console.error("ZIP failed", err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownload = (url: string, id: string) => {
    const a = document.createElement('a'); a.href = url; a.download = `fashion_${id}.png`; a.click();
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center">
         <button onClick={onBack} className="text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back
         </button>
      </div>

      <div className="mb-10 text-center max-w-3xl mx-auto uppercase">
          <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">LUMA CLOTHING</h2>
          <p className="text-lg text-slate-500 font-medium lowercase">Professional studio shoots for outfits. Indian models & outfit completion.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-900"></div>
            
            <div className="mb-8">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">1. Outfit Parts</h3>
              <ClothingPartUploader outfit={outfit} setOutfit={setOutfit} disabled={appState !== AppState.IDLE} />
            </div>

            <div className="mb-8">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">2. Model & Studio</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Gender</label>
                  <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full bg-slate-50 p-2 rounded-xl text-xs font-bold outline-none border border-slate-100">
                    <option>Female</option><option>Male</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Body Type</label>
                  <select value={bodyType} onChange={e=>setBodyType(e.target.value)} className="w-full bg-slate-50 p-2 rounded-xl text-xs font-bold outline-none border border-slate-100">
                    <option>Slim</option><option>Athletic</option><option>Curvy</option><option>Plus-size</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Angle</label>
                  <select value={angle} onChange={e=>setAngle(e.target.value as StudioAngle)} className="w-full bg-slate-50 p-2 rounded-xl text-xs font-bold outline-none border border-slate-100">
                    {STUDIO_ANGLES.map(a=><option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Aspect Ratio</label>
                <div className="flex gap-1">
                  {ASPECT_RATIOS.slice(0, 5).map(r => (
                    <button key={r} onClick={() => setAspectRatio(r)} className={`px-2 py-0.5 rounded text-[8px] font-bold border ${aspectRatio === r ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>{r}</button>
                  ))}
                </div>
              </div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Color Hint</label>
              <div className="flex gap-2">
                {PRODUCT_COLORS.slice(0, 8).map(c => (
                  <button key={c.name} onClick={() => setProductColor(c.name)} className={`w-6 h-6 rounded-full border-2 ${productColor === c.name ? 'border-slate-900 scale-110' : 'border-slate-200'}`} style={{backgroundColor: c.hex || '#fff'}} />
                ))}
              </div>
            </div>

            <button onClick={()=>handleGenerate()} disabled={appState !== AppState.IDLE && appState !== AppState.ERROR || !hasKey} className="w-full py-5 rounded-2xl font-black text-white bg-slate-900 shadow-xl uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
              {appState === AppState.GENERATING ? "Generating Outfits..." : "Generate 4 Fashion Shots"}
            </button>
            {!hasKey && <p className="text-[10px] font-black text-red-500 mt-2 text-center uppercase tracking-widest">Please connect your API key in Profile settings</p>}
            
            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl text-center text-[10px] font-bold flex flex-col gap-2">
                    <span>{error}</span>
                </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-8 space-y-10">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Batch Results</h3>
              {appState === AppState.COMPLETE && (
                <button 
                  onClick={handleDownloadAll} 
                  disabled={isZipping}
                  className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  {isZipping ? "Packaging ZIP..." : "Download Batch (ZIP)"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {results.map((r, i) => (
                <ResultCard key={r?.id || i} title={r?.theme || `Shot #${i+1}`} loading={appState === AppState.GENERATING && !r} result={r || undefined} onDownload={handleDownload} onRefine={(id, ins) => handleGenerate(ins)} onUpscale={()=>{}} onViewLarge={onViewLarge} />
              ))}
            </div>
          </div>

          {appState === AppState.COMPLETE && (
            <div className="flex justify-center py-6">
              <button onClick={()=>handleGenerate()} className="bg-slate-900 text-white font-black py-4 px-12 rounded-2xl shadow-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs">Regenerate Batch</button>
            </div>
          )}

          {history.length > 0 && (
            <div className="pt-10 border-t border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tighter uppercase">Fashion History</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {history.map(img => (
                  <div key={img.id} className="group relative rounded-2xl overflow-hidden aspect-[3/4] border border-slate-100 bg-white shadow-sm">
                    <img src={img.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => handleDownload(img.url, img.id)} className="bg-white p-2.5 rounded-xl text-slate-900"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></button>
                    </div>
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

export default ClothingStudioTool;
