
import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { driveService } from '../services/driveService';

interface ResultCardProps {
  result?: GeneratedImage;
  loading?: boolean;
  onDownload: (url: string, id: string) => void;
  onRefine: (id: string, instruction: string) => Promise<void>;
  onUpscale: (id: string) => void;
  onViewLarge?: (url: string) => void;
  onDriveUpload?: (url: string, id: string) => Promise<void>;
  title: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, loading, onDownload, onRefine, onUpscale, onViewLarge, onDriveUpload, title }) => {
  const [isRefiningMode, setIsRefiningMode] = useState(false);
  const [isProcessingRefine, setIsProcessingRefine] = useState(false);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [isDriveSuccess, setIsDriveSuccess] = useState(false);
  const [refineInput, setRefineInput] = useState("");

  const handleRefineSubmit = async () => {
    if (result && refineInput.trim()) {
      setIsProcessingRefine(true);
      try {
        await onRefine(result.id, refineInput);
      } catch (e) {
        console.error("Refinement failed", e);
      } finally {
        setIsProcessingRefine(false);
        setIsRefiningMode(false);
        setRefineInput("");
      }
    }
  };

  const handleDriveClick = async () => {
    if (result) {
      if (isDriveSuccess) return;

      setIsUploadingToDrive(true);
      try {
        if (onDriveUpload) {
          // Use tool-specific handler if provided
          await onDriveUpload(result.url, result.id);
        } else {
          // Use global Drive service with sanitized filename
          const safeTitle = (title || result.theme || 'ai_asset').replace(/[^a-z0-9]/gi, '_').toLowerCase();
          const fileName = `${safeTitle}_${result.id.substring(0, 8)}.png`;
          await driveService.upload(result.url, fileName);
        }
        setIsDriveSuccess(true);
        setTimeout(() => setIsDriveSuccess(false), 5000);
      } catch (e) {
        console.error("Drive upload failed", e);
      } finally {
        setIsUploadingToDrive(false);
      }
    }
  };

  const isDriveConnected = driveService.isConnected();

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full group relative">
      <div className="relative aspect-square w-full bg-[#F5F5F7] overflow-hidden">
        {(loading || isProcessingRefine) ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-white/90 backdrop-blur-md z-30">
            <div className="w-12 h-12 relative">
              <div className="absolute inset-0 border-[3px] border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-[10px] text-slate-900 font-black uppercase tracking-[0.3em] animate-pulse">
              {isProcessingRefine ? "Refining Details..." : "Generating Asset..."}
            </p>
          </div>
        ) : result ? (
          <>
            <img 
              src={result.url} 
              alt={result.theme} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            
            {/* Overlay Actions - Visible on Hover */}
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-6 backdrop-blur-[2px] z-20">
               <div className="flex gap-2 w-full max-w-[240px]">
                  <button
                    onClick={() => onDownload(result.url, result.id)}
                    className="flex-1 bg-white text-slate-900 font-black py-3 rounded-2xl shadow-xl hover:bg-slate-50 active:scale-95 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Save
                  </button>
                  
                  <button
                    onClick={handleDriveClick}
                    disabled={isUploadingToDrive}
                    className={`flex-1 font-black py-3 px-3 rounded-2xl shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 ${
                      isDriveSuccess ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    title={isDriveConnected ? "Upload to Google Drive" : "Connect Google Drive"}
                  >
                    {isUploadingToDrive ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : isDriveSuccess ? (
                      "Saved ✓"
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7.71 3.5l2.45 4.24L4.62 17.5h-2.5L7.71 3.5zm3.87 4.24l2.45-4.24h4.9l2.45 4.24H11.58zm6.54 0L13.1 17.5l-2.45-4.24 5.02-8.67 2.45 4.24z"/></svg>
                        {isDriveConnected ? "Drive" : "Connect"}
                      </>
                    )}
                  </button>
               </div>

                <div className="flex gap-2 w-full max-w-[240px]">
                  <button
                    onClick={() => setIsRefiningMode(true)}
                    className="flex-1 bg-slate-900 text-white font-black py-3 rounded-2xl shadow-xl hover:bg-slate-800 active:scale-95 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest transition-all"
                  >
                    Refine
                  </button>
                  <button
                    onClick={() => onViewLarge && onViewLarge(result.url)}
                    className="bg-white/20 text-white font-black py-3 px-4 rounded-2xl shadow-xl hover:bg-white/30 active:scale-95 flex items-center justify-center transition-all backdrop-blur-md border border-white/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-200">
             <svg className="w-16 h-16 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
      </div>
      
      {/* Refine Input Overlay */}
      {isRefiningMode && result && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] animate-slide-up">
           <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Variation Refinement</p>
              <button onClick={() => setIsRefiningMode(false)} className="text-slate-400 hover:text-slate-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
           </div>
           <div className="flex gap-2">
             <input 
               type="text" 
               className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-blue-100 outline-none font-medium transition-all"
               placeholder="e.g. Darken lighting, change background to wood..."
               value={refineInput}
               onChange={(e) => setRefineInput(e.target.value)}
               autoFocus
               disabled={isProcessingRefine}
             />
             <button 
               onClick={handleRefineSubmit}
               disabled={isProcessingRefine || !refineInput.trim()}
               className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest min-w-[80px] flex items-center justify-center transition-all disabled:opacity-50"
             >
               {isProcessingRefine ? (
                 <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
               ) : (
                 "Apply"
               )}
             </button>
           </div>
        </div>
      )}
      
      <div className="p-8 flex-1 flex flex-col justify-between bg-white">
        <div>
           <div className="flex items-center justify-between mb-3">
             <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight truncate pr-4">
               {title || "AI Asset"}
             </h3>
             <span className="text-[8px] bg-slate-50 text-slate-400 px-2 py-1 rounded-full font-black uppercase tracking-widest border border-slate-100">
               GEN-03
             </span>
           </div>
           {result && (
             <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
               {result.description}
             </p>
           )}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
