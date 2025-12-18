
import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import ImageUploader from './ImageUploader';
import MultiColorPicker from './MultiColorPicker';
import ResultCard from './ResultCard';
import { analyzeProductContext, generateProductShoot, generateDescriptionFromImage, isAuthError, isQuotaError, safeSaveToLocalStorage } from '../services/geminiService';
import { AppState, GeneratedImage, AspectRatio, ASPECT_RATIOS } from '../types';

interface WebListingToolProps {
  onBack: () => void;
  incrementUsage: () => void;
  isLimitReached: boolean;
  onViewLarge?: (url: string) => void;
}

const WebListingTool: React.FC<WebListingToolProps> = ({ onBack, incrementUsage, onViewLarge }) => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [description, setDescription] = useState<string>('');
  const [usage, setUsage] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [selectedProductColors, setSelectedProductColors] = useState<string[]>(["Original"]);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [history, setHistory] = useState<GeneratedImage[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('HISTORY_LISTING') || '[]');
    } catch {
      return [];
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  
  const hasKey = !!localStorage.getItem('VISION_API_KEY') || !!process.env.API_KEY;

  // Production Stats
  const [progress, setProgress] = useState(0);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    safeSaveToLocalStorage('HISTORY_LISTING', history.slice(0, 20));
  }, [history]);

  useEffect(() => {
    if (appState === AppState.GENERATING && remainingTime > 0) {
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => Math.max(0, prev - 1));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [appState, remainingTime]);

  const handleAutoDescribe = async () => {
    if (productImages.length === 0) return;
    setAppState(AppState.ANALYZING);
    try {
      const desc = await generateDescriptionFromImage(productImages[0]);
      setDescription(desc);
      setAppState(AppState.IDLE);
    } catch (err: any) {
      if (isQuotaError(err)) {
        setError("Platform quota reached. Please connect your own API key.");
      } else {
        setError("Analysis failed.");
      }
      setAppState(AppState.IDLE);
    }
  };

  const handleGenerate = async (refinePrompt?: string) => {
    if (!hasKey) return;
    setAppState(AppState.GENERATING);
    setError(null);
    if (!refinePrompt) setResults([]);
    
    const totalAssets = productImages.length;
    const colorsCount = selectedProductColors.length || 1;
    const variationsPerColor = 1;
    const totalTasks = totalAssets * colorsCount * variationsPerColor;
    const estTimePerTask = 7;
    
    setProgress(0);
    setCurrentAssetIndex(0);
    setRemainingTime(totalTasks * estTimePerTask);

    try {
      let completedTasks = 0;

      for (let i = 0; i < totalAssets; i++) {
        setCurrentAssetIndex(i + 1);
        const currentImg = productImages[i];
        
        // Analyze context using both description and usage for better theme suggestions
        const contextAnalysis = `${description} ${usage}`;
        const suggestedThemes = await analyzeProductContext(currentImg, contextAnalysis || "Professional product shoot", "Auto");
        
        for (let c = 0; c < colorsCount; c++) {
          const pColor = selectedProductColors[c] === 'Original' ? undefined : selectedProductColors[c];
          const theme = suggestedThemes[c % suggestedThemes.length] || { title: "Studio", prompt: "Professional high-end commercial photography" };
          
          try {
            // Incorporating description and usage directly into the prompt via the theme modification
            const enhancedTheme = {
              ...theme,
              prompt: `${theme.prompt}. Product Context: ${description}. Optimized for: ${usage}.`
            };

            const url = await generateProductShoot(
              currentImg, 
              enhancedTheme, 
              aspectRatio,
              usage,
              refinePrompt,
              pColor
            );
            
            const result: GeneratedImage = {
              id: `img_${Date.now()}_${completedTasks}`,
              url,
              theme: `${theme.title} ${pColor ? `(${pColor})` : ''}`,
              description: theme.prompt,
              timestamp: Date.now()
            };
            
            setResults(prev => [...prev, result]);
            setHistory(prev => [result, ...prev]);
            incrementUsage();
          } catch (err: any) {
            if (isAuthError(err) || isQuotaError(err)) {
              throw err;
            }
          }
          completedTasks++;
          setProgress(Math.round((completedTasks / totalTasks) * 100));
          if (completedTasks < totalTasks) await new Promise(r => setTimeout(r, 4000));
        }
      }
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      const errorMsg = isQuotaError(err) 
        ? "Daily AI Quota Reached. Please check your API key status in Profile." 
        : (err.message || "Production error.");
      setError(errorMsg);
      setAppState(AppState.ERROR);
    }
  };

  const handleDownloadAll = async () => {
    if (results.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      results.forEach((res, index) => {
        const base64Data = res.url.split(',')[1];
        zip.file(`listing_shot_${index + 1}.png`, base64Data, { base64: true });
      });
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `CognitoSpark_Listing_Export_${Date.now()}.zip`;
      link.click();
    } catch (err) {
      console.error("ZIP failed", err);
    } finally {
      setIsZipping(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
        <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">ORBIT</h2>
        <p className="text-slate-500 font-medium lowercase">Bulk catalog generation with usage-aware AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
            
            <div className="space-y-10">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">1. Product Media</h3>
                <ImageUploader onImageSelect={setProductImages} selectedImages={productImages} disabled={appState === AppState.GENERATING} multiple={true} />
              </div>

              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">2. Product Context</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <textarea 
                      value={description} 
                      onChange={e=>setDescription(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium outline-none h-24 focus:ring-4 focus:ring-blue-50 transition-all" 
                      placeholder="Detailed Product Description (Materials, features...)" 
                    />
                    <button onClick={handleAutoDescribe} disabled={appState === AppState.ANALYZING || productImages.length === 0} className="absolute bottom-2 right-2 text-[8px] font-black uppercase bg-white border border-slate-100 px-2 py-1 rounded-lg text-blue-600 hover:bg-slate-50 disabled:opacity-50">
                      {appState === AppState.ANALYZING ? "Analyzing..." : "Auto-Describe"}
                    </button>
                  </div>
                  <textarea 
                    value={usage} 
                    onChange={e=>setUsage(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium outline-none h-24 focus:ring-4 focus:ring-blue-50 transition-all" 
                    placeholder="How is it used? (Environment context...)" 
                  />
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">3. Production Spec</h3>
                <div className="space-y-6">
                  <MultiColorPicker 
                    label="Product Color Variations" 
                    selectedColors={selectedProductColors} 
                    onColorsChange={setSelectedProductColors} 
                    maxColors={3} 
                  />
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Aspect Ratio</label>
                    <div className="grid grid-cols-3 gap-2">
                       {ASPECT_RATIOS.map(ratio => (
                         <button key={ratio} onClick={()=>setAspectRatio(ratio)} className={`py-2 text-[10px] font-black rounded-lg border transition-all ${aspectRatio === ratio ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{ratio}</button>
                       ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => handleGenerate()} 
                  disabled={appState === AppState.GENERATING || productImages.length === 0 || !hasKey} 
                  className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-slate-800 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {appState === AppState.GENERATING ? "Processing Bulk..." : "Launch Production Batch"}
                </button>
                {!hasKey && <p className="text-[10px] font-black text-red-500 mt-2 text-center uppercase tracking-widest">Please connect your API key in Profile settings</p>}
                {error && <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-bold border border-red-100 text-center">{error}</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9 space-y-12">
          {appState === AppState.GENERATING && results.length === 0 && (
             <div className="w-full bg-white border border-slate-100 rounded-[3rem] p-24 flex flex-col items-center justify-center text-center shadow-2xl animate-shimmer relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time to Completion</span>
                  <span className="text-3xl font-black text-blue-600 tabular-nums">{formatTime(remainingTime)}</span>
                </div>

               <div className="w-24 h-24 relative mb-10">
                  <div className="absolute inset-0 border-[6px] border-slate-50 rounded-full"></div>
                  <div className="absolute inset-0 border-[6px] border-blue-600 border-t-transparent rounded-full animate-spin"></div>
               </div>
               
               <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Rendering Catalog Batch</h3>
               <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Asset {results.length + 1} of {productImages.length * selectedProductColors.length} in production</p>
               
               <div className="w-full max-w-md bg-slate-50 h-3 rounded-full overflow-hidden mt-10 relative">
                  <div className="bg-blue-600 h-full transition-all duration-1000 ease-out" style={{width: `${progress}%`}}></div>
               </div>
               <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{progress}% Complete</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Generated Listing Batch ({results.length})</h3>
                <button 
                  onClick={handleDownloadAll} 
                  disabled={isZipping}
                  className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  {isZipping ? "Packaging ZIP..." : "Download Batch (ZIP)"}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {results.map((r, i) => (
                  <ResultCard key={r.id} title={r.theme} result={r} onDownload={(url, id) => { const a = document.createElement('a'); a.href = url; a.download = `listing_${id}.png`; a.click(); }} onRefine={(id, ins) => handleGenerate(ins)} onUpscale={()=>{}} onViewLarge={onViewLarge} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebListingTool;
