
import React, { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import MultiColorPicker from './MultiColorPicker';
import ResultCard from './ResultCard';
import { recolorProductAndBackground, isAuthError, safeSaveToLocalStorage } from '../services/geminiService';
import { AppState, GeneratedImage, AspectRatio, ASPECT_RATIOS, PRODUCT_COLORS } from '../types';

interface RelocateToolProps {
  onBack: () => void;
  incrementUsage: () => void;
  isLimitReached: boolean;
  onViewLarge?: (url: string) => void;
}

const RelocateTool: React.FC<RelocateToolProps> = ({ onBack, incrementUsage, onViewLarge }) => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [sourceImage, setSourceImage] = useState<string[]>([]);
  const [newProductImage, setNewProductImage] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [selectedProductColors, setSelectedProductColors] = useState<string[]>(["Original"]);
  const [selectedBgColors, setSelectedBgColors] = useState<string[]>(["Original"]);
  const [customCommand, setCustomCommand] = useState<string>("");
  
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [history, setHistory] = useState<GeneratedImage[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('HISTORY_RELOCATE') || '[]');
    } catch {
      return [];
    }
  });
  const [error, setError] = useState<string | null>(null);

  const hasKey = !!localStorage.getItem('VISION_API_KEY') || !!process.env.API_KEY;

  useEffect(() => {
    safeSaveToLocalStorage('HISTORY_RELOCATE', history.slice(0, 10));
  }, [history]);

  const handleGenerate = async (refinement?: string) => {
    if (!hasKey) return;
    if (sourceImage.length === 0) return setError("Please upload the original reference environment image.");
    
    if (!refinement) {
      setAppState(AppState.GENERATING);
      setResults([]);
    }
    setError(null);

    const colorsCount = selectedBgColors.length || 1;

    try {
      for (let i = 0; i < colorsCount; i++) {
        const targetBgColor = selectedBgColors[i] === 'Original' ? '' : selectedBgColors[i];
        const targetProductColor = selectedProductColors[0] === 'Original' ? '' : selectedProductColors[0];

        const url = await recolorProductAndBackground(
          sourceImage[0],
          targetProductColor,
          targetBgColor,
          aspectRatio,
          refinement ? `${customCommand} | Refinement: ${refinement}` : customCommand,
          newProductImage.length > 0 ? newProductImage[0] : null
        );

        const result: GeneratedImage = {
          id: `reloc_${Date.now()}_${i}`,
          url,
          theme: `Relocation | ${targetBgColor || 'Original'}`,
          description: refinement ? `Refined: ${refinement}` : `Color Match Batch`,
          timestamp: Date.now()
        };

        setResults(prev => [...prev, result]);
        setHistory(prev => [result, ...prev]);
        incrementUsage();
        if (i < colorsCount - 1) await new Promise(r => setTimeout(r, 4500));
      }
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      if (isAuthError(err)) {
        setError("Production key missing or invalid. Set it in Profile.");
      } else {
        setError(err.message || "Production session failed.");
      }
      setAppState(AppState.ERROR);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-12 py-10">
      <div className="mb-10 flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest text-[10px] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth={2.5} /></svg>
          Dashboard
        </button>
      </div>

      <div className="text-center mb-16 uppercase">
        <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">SHIFT</h2>
        <p className="text-slate-500 font-medium lowercase">Exact product replication across new environments and colors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
            
            <div className="space-y-10">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">1. Environment Reference</h3>
                <ImageUploader onImageSelect={setSourceImage} selectedImages={sourceImage} disabled={appState === AppState.GENERATING} multiple={false} />
              </div>

              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">2. New Product (Optional)</h3>
                <ImageUploader onImageSelect={setNewProductImage} selectedImages={newProductImage} disabled={appState === AppState.GENERATING} multiple={false} />
              </div>

              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">3. Multi-Color Swap</h3>
                <div className="space-y-6">
                  <MultiColorPicker 
                    label="Active Swatches" 
                    selectedColors={selectedBgColors} 
                    onColorsChange={setSelectedBgColors} 
                    maxColors={4} 
                  />
                  <MultiColorPicker 
                    label="Target Product Color" 
                    selectedColors={selectedProductColors} 
                    onColorsChange={setSelectedProductColors} 
                    maxColors={1} 
                  />
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">4. Creative Directives</h3>
                <textarea 
                  value={customCommand} 
                  onChange={e=>setCustomCommand(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium outline-none h-24 focus:ring-4 focus:ring-blue-50 transition-all" 
                  placeholder="Optional: Specify additional changes (e.g., 'replace wood with marble', 'add plants', 'brighten reflections')" 
                />
              </div>

              <div className="pt-4 border-t border-slate-50">
                <button onClick={() => handleGenerate()} disabled={appState === AppState.GENERATING || sourceImage.length === 0 || !hasKey} className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-slate-800 shadow-2xl transition-all active:scale-95 disabled:opacity-50">
                  {appState === AppState.GENERATING ? "Processing Shift..." : "Launch Batch Shift"}
                </button>
                {!hasKey && <p className="text-[10px] font-black text-red-500 mt-2 text-center uppercase tracking-widest">Please connect your API key in Profile settings</p>}
                {error && <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-bold border border-red-100 text-center">{error}</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9 space-y-12">
          {appState === AppState.GENERATING && results.length === 0 && (
            <div className="w-full bg-white border border-slate-100 rounded-[3rem] p-24 flex flex-col items-center justify-center text-center shadow-xl animate-shimmer">
              <div className="w-24 h-24 relative mb-10"><div className="absolute inset-0 border-[6px] border-slate-50 rounded-full"></div><div className="absolute inset-0 border-[6px] border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Replicating Scene</h3>
              <p className="text-slate-400 font-medium italic">Cloning environment geometry and matching product lighting...</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="relative group">
                    <span className="absolute top-4 left-4 z-10 bg-slate-900/80 text-white text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest backdrop-blur-md">Original Reference</span>
                    <img src={sourceImage[0] || 'https://via.placeholder.com/800?text=Upload+Reference'} className="w-full aspect-square object-cover rounded-[2.5rem] border border-slate-100 shadow-sm" alt="Reference" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {results.map((r) => (
                <ResultCard 
                  key={r.id} 
                  title={r.theme} 
                  result={r} 
                  onDownload={(url, id) => { const a = document.createElement('a'); a.href = url; a.download = `replicate_${id}.png`; a.click(); }} 
                  onRefine={()=>{}} 
                  onUpscale={()=>{}} 
                  onViewLarge={onViewLarge} 
                />
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div className="pt-10 border-t border-slate-100">
               <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Replication History</h3>
                  <div className="flex-1 h-px bg-slate-100"></div>
                  <button onClick={() => { setHistory([]); localStorage.removeItem('HISTORY_RELOCATE'); }} className="text-[10px] font-black text-red-500 uppercase hover:underline">Clear Archive</button>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {history.map(item => (
                    <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-white hover:scale-[1.05] transition-all cursor-pointer shadow-sm" onClick={()=>onViewLarge && onViewLarge(item.url)}>
                      <img src={item.url} className="w-full h-full object-cover" alt="History item" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
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

export default RelocateTool;
