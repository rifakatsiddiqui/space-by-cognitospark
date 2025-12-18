
import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import ImageUploader from './ImageUploader';
import MultiColorPicker from './MultiColorPicker';
import ResultCard from './ResultCard';
import { generateStudioShoot, isAuthError, safeSaveToLocalStorage, generateDescriptionFromImage } from '../services/geminiService';
import { AppState, GeneratedImage, StudioAngle, STUDIO_ANGLES, PRODUCT_COLORS, MockupStyle, MOCKUP_STYLES, AspectRatio, ASPECT_RATIOS } from '../types';

interface StudioShootToolProps {
  onBack: () => void;
  incrementUsage: () => void;
  isLimitReached: boolean;
  onViewLarge?: (url: string) => void;
}

const StudioShootTool: React.FC<StudioShootToolProps> = ({ onBack, incrementUsage, onViewLarge }) => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [description, setDescription] = useState<string>('');
  const [selectedAngles, setSelectedAngles] = useState<StudioAngle[]>(["Eye-Level"]);
  const [selectedBgColors, setSelectedBgColors] = useState<string[]>(["#f8fafc"]);
  const [selectedProductColors, setSelectedProductColors] = useState<string[]>(["Original"]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [history, setHistory] = useState<GeneratedImage[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('HISTORY_STUDIO') || '[]');
    } catch {
      return [];
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const hasKey = !!localStorage.getItem('VISION_API_KEY') || !!process.env.API_KEY;

  // Production Queue States
  const [progress, setProgress] = useState(0);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    safeSaveToLocalStorage('HISTORY_STUDIO', history.slice(0, 10));
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
    } catch (err) {
      setError("Analysis failed.");
      setAppState(AppState.IDLE);
    }
  };

  const toggleAngle = (angle: StudioAngle) => {
    if (selectedAngles.includes(angle)) {
      setSelectedAngles(prev => prev.filter(a => a !== angle));
    } else if (selectedAngles.length < 5) {
      setSelectedAngles(prev => [...prev, angle]);
    }
  };

  const handleGenerate = async () => {
    if (!hasKey) return;
    setAppState(AppState.GENERATING);
    setError(null);
    setResults([]);
    
    const totalAssets = productImages.length;
    const anglesToProcess = selectedAngles.length;
    const colorsToProcess = selectedBgColors.length;
    const totalTasks = totalAssets * anglesToProcess * colorsToProcess;
    const estTimePerTask = 6;
    
    setProgress(0);
    setCurrentAssetIndex(0);
    setRemainingTime(totalTasks * estTimePerTask);

    try {
      let completedTasks = 0;

      for (let i = 0; i < totalAssets; i++) {
        setCurrentAssetIndex(i + 1);
        const currentImg = productImages[i];

        for (let a = 0; a < anglesToProcess; a++) {
          const currentAngle = selectedAngles[a];
          
          for (let c = 0; c < colorsToProcess; c++) {
            const currentBgColor = selectedBgColors[c];
            const currentProdColor = selectedProductColors[0] === 'Original' ? undefined : selectedProductColors[0];

            try {
              const url = await generateStudioShoot(
                [currentImg], 
                currentBgColor,
                currentAngle,
                aspectRatio,
                currentProdColor
              );
              const result: GeneratedImage = {
                id: `studio_${Date.now()}_${completedTasks}`,
                url,
                theme: `${currentAngle} | ${currentBgColor}`,
                description: `Studio shoot SKU ${i+1} on ${currentBgColor} backdrop`,
                timestamp: Date.now()
              };
              setResults(prev => [...prev, result]);
              setHistory(prev => [result, ...prev]);
              incrementUsage();
            } catch (err: any) {
              if (isAuthError(err)) {
                throw err;
              }
            }
            completedTasks++;
            setProgress(Math.round((completedTasks / totalTasks) * 100));
            if (completedTasks < totalTasks) await new Promise(r => setTimeout(r, 4500));
          }
        }
      }
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      setError(err.message || "Production error.");
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
        zip.file(`studio_shot_${index + 1}.png`, base64Data, { base64: true });
      });
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `CognitoSpark_Studio_Batch_${Date.now()}.zip`;
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

  const totalPossibleAssets = productImages.length * selectedAngles.length * selectedBgColors.length;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-12 py-10">
      <div className="mb-10 flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest text-[10px] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth={2.5} /></svg>
          Dashboard
        </button>
      </div>

      <div className="text-center mb-16 uppercase">
        <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">LUMA</h2>
        <p className="text-slate-500 font-medium lowercase">Multi-angle, multi-color high fidelity production.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600"></div>
            
            <div className="space-y-10">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">1. Asset Loading</h3>
                <ImageUploader onImageSelect={setProductImages} selectedImages={productImages} disabled={appState === AppState.GENERATING} multiple={true} />
              </div>

              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">2. Perspectives</h3>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar p-1">
                  {STUDIO_ANGLES.map(angle => (
                    <button
                      key={angle}
                      onClick={() => toggleAngle(angle)}
                      className={`px-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-tighter border transition-all text-center ${selectedAngles.includes(angle) ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'}`}
                    >
                      {angle}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">3. Palette & Sizing</h3>
                <div className="space-y-6">
                  <MultiColorPicker 
                    label="Backdrop Colors" 
                    selectedColors={selectedBgColors} 
                    onColorsChange={setSelectedBgColors} 
                    maxColors={5} 
                  />
                  
                  <MultiColorPicker 
                    label="Product Variant" 
                    selectedColors={selectedProductColors} 
                    onColorsChange={setSelectedProductColors} 
                    maxColors={1} 
                  />

                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Image Size</label>
                    <div className="grid grid-cols-3 gap-2">
                       {ASPECT_RATIOS.map(ratio => (
                         <button key={ratio} onClick={()=>setAspectRatio(ratio)} className={`py-2 text-[10px] font-black rounded-lg border transition-all ${aspectRatio === ratio ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{ratio}</button>
                       ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <div className="flex justify-between items-center mb-4">
                   <span className="text-[10px] font-black text-slate-400 uppercase">Scale: {totalPossibleAssets} Assets</span>
                   <span className="text-[10px] font-black text-red-600 uppercase">Est. ~{formatTime(totalPossibleAssets * 6)}</span>
                </div>
                <button onClick={() => handleGenerate()} disabled={appState === AppState.GENERATING || productImages.length === 0 || !hasKey} className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-slate-800 shadow-2xl transition-all active:scale-95 disabled:opacity-50">
                  {appState === AppState.GENERATING ? "Processing Bulk..." : "Launch Production Batch"}
                </button>
                {!hasKey && <p className="text-[10px] font-black text-red-500 mt-2 text-center uppercase tracking-widest">Please connect your API key in Profile settings</p>}
              </div>
              
              {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-bold border border-red-100 text-center">{error}</div>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9 space-y-12">
          {appState === AppState.GENERATING && results.length === 0 && (
             <div className="w-full bg-white border border-slate-100 rounded-[3rem] p-24 flex flex-col items-center justify-center text-center shadow-2xl animate-shimmer relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time to Completion</span>
                  <span className="text-3xl font-black text-red-600 tabular-nums">{formatTime(remainingTime)}</span>
                </div>

               <div className="w-24 h-24 relative mb-10">
                  <div className="absolute inset-0 border-[6px] border-slate-50 rounded-full"></div>
                  <div className="absolute inset-0 border-[6px] border-red-600 border-t-transparent rounded-full animate-spin"></div>
               </div>
               
               <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Rendering Catalog Batch</h3>
               <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Asset {results.length + 1} of {totalPossibleAssets} in production</p>
               
               <div className="w-full max-w-md bg-slate-50 h-3 rounded-full overflow-hidden mt-10 relative">
                  <div className="bg-red-600 h-full transition-all duration-1000 ease-out" style={{width: `${progress}%`}}></div>
               </div>
               <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{progress}% Complete</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Generated Studio Batch ({results.length})</h3>
                <button 
                  onClick={handleDownloadAll} 
                  disabled={isZipping}
                  className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-red-700 transition-all flex items-center gap-2"
                >
                  {isZipping ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Packaging...</span>
                    </>
                  ) : "Download Batch (ZIP)"}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {results.map((r, i) => (
                  <ResultCard 
                    key={r.id} 
                    title={r.theme} 
                    result={r} 
                    onDownload={(url, id) => { const a = document.createElement('a'); a.href = url; a.download = `studio_${id}.png`; a.click(); }} 
                    onRefine={()=>{}} 
                    onUpscale={()=>{}} 
                    onViewLarge={onViewLarge} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioShootTool;
