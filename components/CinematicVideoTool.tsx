
import React, { useState } from 'react';
import ImageUploader from './ImageUploader';
import VideoResultCard from './VideoResultCard';
import { generateCinematicVideo, isAuthError } from '../services/geminiService';
import { visionApi } from '../services/api';
import { 
  GeneratedVideo, 
  AspectRatio, 
  ASPECT_RATIOS, 
  StudioAngle, 
  STUDIO_ANGLES, 
  VideoDuration, 
  CameraMotion, 
  CAMERA_MOTIONS, 
  CinematicStyle, 
  CINEMATIC_STYLES, 
  SoundStyle, 
  SOUND_STYLES,
  PRODUCT_COLORS,
  VideoFps,
  VideoLens
} from '../types';

interface CinematicVideoToolProps {
  onBack: () => void;
  incrementUsage: () => void;
  isLimitReached: boolean;
  onViewLarge?: (url: string) => void;
}

const CinematicVideoTool: React.FC<CinematicVideoToolProps> = ({ onBack, incrementUsage, onViewLarge }) => {
  const [productImages, setProductImages] = useState<string[]>([]);
  const [duration, setDuration] = useState<VideoDuration>("8");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [selectedAngles, setSelectedAngles] = useState<StudioAngle[]>(["Eye-Level"]);
  const [motion, setMotion] = useState<CameraMotion>("Auto");
  const [style, setStyle] = useState<CinematicStyle>("Auto");
  const [sound, setSound] = useState<SoundStyle>("Auto");
  const [productColor, setProductColor] = useState<string>("Original");
  const [fps, setFps] = useState<VideoFps>("30");
  const [lens, setLens] = useState<VideoLens>("Standard (35mm)");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedVideo[]>([]);
  const [history, setHistory] = useState<GeneratedVideo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const hasKey = !!localStorage.getItem('VISION_API_KEY') || !!process.env.API_KEY;

  const toggleAngle = (angle: StudioAngle) => {
    if (selectedAngles.includes(angle)) {
      setSelectedAngles(prev => prev.filter(a => a !== angle));
    } else if (selectedAngles.length < 3) {
      setSelectedAngles(prev => [...prev, angle]);
    }
  };

  const handleGenerate = async (refinePrompt?: string, upscaleId?: string) => {
      if (!hasKey) return;
      if (productImages.length === 0) return setError("Please upload product images.");
      setIsGenerating(true);
      setError(null);

      try {
          const videoUrl = await generateCinematicVideo(productImages, {
            duration, aspectRatio, angles: selectedAngles, motion, style, sound, productColor, fps, lens
          }, refinePrompt, !!upscaleId);
          
          incrementUsage();
          const newVideo: GeneratedVideo = { 
            id: `vid_${Date.now()}`, 
            url: videoUrl, 
            prompt: `${style} style with ${motion} motion, ${aspectRatio} aspect ratio.`, 
            timestamp: Date.now() 
          };
          
          setResults(prev => [newVideo, ...prev]);
          setHistory(prev => [newVideo, ...prev]);
      } catch (err: any) {
          if (isAuthError(err)) {
             setError("Authentication failed. Please verify your API key in Profile.");
          } else {
             setError(err.message || "Video generation encountered an error. Please try a different prompt or check your key.");
          }
      } finally {
          setIsGenerating(false);
      }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-12 py-10">
      <div className="mb-10">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest flex items-center gap-2 transition-colors text-[10px]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth={2.5} /></svg>
          Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* Settings Sidebar */}
          <div className="xl:col-span-4 space-y-6">
              <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
                  
                  <div className="mb-8">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">Cinematic Ads</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Motion & Sound Synthesis</p>
                  </div>

                  <div className="space-y-10">
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">1. Product Image</h3>
                      <ImageUploader onImageSelect={setProductImages} selectedImages={productImages} disabled={isGenerating} multiple={true} />
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">2. Visual Directing</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 block">Style</label>
                          <select value={style} onChange={e=>setStyle(e.target.value as any)} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px] font-bold uppercase outline-none focus:ring-2 focus:ring-emerald-50">
                            {CINEMATIC_STYLES.map(s=><option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 block">Motion</label>
                          <select value={motion} onChange={e=>setMotion(e.target.value as any)} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px] font-bold uppercase outline-none focus:ring-2 focus:ring-emerald-50">
                            {CAMERA_MOTIONS.map(m=><option key={m}>{m}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">3. Production Specs</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                          {ASPECT_RATIOS.slice(3, 6).map(ratio => (
                            <button key={ratio} onClick={()=>setAspectRatio(ratio)} className={`py-2 text-[10px] font-black rounded-lg border transition-all ${aspectRatio === ratio ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{ratio}</button>
                          ))}
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                          {PRODUCT_COLORS.map(c => (
                            <button key={c.name} onClick={() => setProductColor(c.name)} className={`w-7 h-7 rounded-full border-2 transition-all flex-shrink-0 ${productColor === c.name ? 'border-emerald-500 scale-110 shadow-lg' : 'border-slate-100'}`} style={{backgroundColor: c.hex || '#fff'}} title={c.name} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button onClick={() => handleGenerate()} disabled={isGenerating || productImages.length === 0 || !hasKey} className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-slate-800 shadow-2xl transition-all active:scale-95 disabled:opacity-50">
                        {isGenerating ? "Rendering Motion..." : "Launch Video Production"}
                      </button>
                      {!hasKey && <p className="text-[10px] font-black text-red-500 mt-2 text-center uppercase tracking-widest">Please connect your API key in Profile settings</p>}
                    </div>

                    {error && (
                        <div className="p-5 bg-red-50 text-red-600 rounded-3xl text-[10px] font-bold border border-red-100 text-center flex flex-col gap-4">
                          <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span>{error}</span>
                          </div>
                        </div>
                    )}
                  </div>
              </div>
          </div>

          {/* Results Area */}
          <div className="xl:col-span-8 space-y-8">
              {isGenerating && results.length === 0 && (
                <div className="w-full bg-white border border-slate-100 rounded-[3rem] p-24 flex flex-col items-center justify-center text-center shadow-2xl animate-shimmer relative overflow-hidden">
                  <div className="w-24 h-24 relative mb-10">
                    <div className="absolute inset-0 border-[6px] border-slate-50 rounded-full"></div>
                    <div className="absolute inset-0 border-[6px] border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Generating Cinematic Sequence</h3>
                  <p className="text-slate-400 font-medium italic">Simulating camera paths, lighting bounce, and AI soundscapes...</p>
                  <div className="w-full max-w-md bg-slate-50 h-2 rounded-full overflow-hidden mt-10">
                    <div className="bg-emerald-500 h-full animate-pulse w-2/3"></div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-12">
                {results.map(vid => (
                  <VideoResultCard 
                    key={vid.id} 
                    video={vid} 
                    onDownload={(u,i) => {const a=document.createElement('a');a.href=u;a.download=`cognitospark_ad_${i}.mp4`;a.click();}} 
                    onViewLarge={onViewLarge} 
                    onRefine={(id, ins) => handleGenerate(ins)}
                  />
                ))}
              </div>
              
              {history.length > 0 && (
                <div className="pt-10 border-t border-slate-100">
                  <div className="flex items-center gap-4 mb-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Video Vault</h3>
                    <div className="flex-1 h-px bg-slate-100"></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {history.map(vid => (
                      <div key={vid.id} className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-100 shadow-sm group relative cursor-pointer" onClick={() => onViewLarge && onViewLarge(vid.url)}>
                        <video src={vid.url} className="w-full h-full object-cover" muted onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => {e.currentTarget.pause(); e.currentTarget.currentTime = 0;}} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
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

export default CinematicVideoTool;
