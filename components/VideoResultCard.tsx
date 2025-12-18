
import React, { useState } from 'react';
import { GeneratedVideo } from '../types';

interface VideoResultCardProps {
  video: GeneratedVideo;
  onDownload: (url: string, id: string) => void;
  onRefine?: (id: string, instruction: string) => void;
  onUpscale?: (id: string) => void;
  onViewLarge?: (url: string) => void;
}

const VideoResultCard: React.FC<VideoResultCardProps> = ({ video, onDownload, onRefine, onUpscale, onViewLarge }) => {
  const [isRefining, setIsRefining] = useState(false);
  const [refineInput, setRefineInput] = useState("");
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);

  const handleRefineSubmit = () => {
    if (onRefine && refineInput.trim()) {
        onRefine(video.id, refineInput);
        setIsRefining(false);
        setRefineInput("");
    }
  };

  const handleDriveUpload = async () => {
    setIsUploadingToDrive(true);
    const fileName = `cinematic_motion_${video.id}.mp4`;
    console.log(`Simulating video upload of ${fileName} to Google Drive...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsUploadingToDrive(false);
    alert(`Video ${fileName} "uploaded" to Google Drive.`);
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 group">
      <div className="relative aspect-video bg-black">
        <video 
            src={video.url} 
            controls 
            className="w-full h-full object-contain" 
            loop
            playsInline
        />
      </div>

      <div className="p-6">
         <div className="flex items-center justify-between mb-4">
             <div className="flex gap-2">
                 <button 
                    onClick={() => onDownload(video.url, video.id)}
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 flex items-center gap-2 transition-all active:scale-95 shadow-lg"
                 >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                     Download
                 </button>
                 <button 
                    onClick={handleDriveUpload}
                    disabled={isUploadingToDrive}
                    className="bg-white border border-slate-100 text-slate-900 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 flex items-center gap-2 transition-all active:scale-95 shadow-md"
                 >
                    {isUploadingToDrive ? (
                      <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></span>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7.71 3.5l2.45 4.24L4.62 17.5h-2.5L7.71 3.5zm3.87 4.24l2.45-4.24h4.9l2.45 4.24H11.58zm6.54 0L13.1 17.5l-2.45-4.24 5.02-8.67 2.45 4.24z"/></svg>
                    )}
                 </button>
             </div>
             
             {onRefine && (
                 <button 
                    onClick={() => setIsRefining(!isRefining)}
                    className="text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
                 >
                    Refine
                 </button>
             )}
         </div>

         {isRefining && (
             <div className="mb-4 flex gap-2 animate-fade-in">
                 <input 
                    type="text" 
                    value={refineInput}
                    onChange={(e) => setRefineInput(e.target.value)}
                    placeholder="e.g. Add cinematic bloom..."
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-slate-900 outline-none font-medium"
                 />
                 <button 
                    onClick={handleRefineSubmit}
                    className="bg-slate-900 text-white px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest"
                 >
                    Go
                 </button>
             </div>
         )}
         
         <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest truncate bg-slate-50 p-2 rounded-lg">
             {video.prompt}
         </p>
      </div>
    </div>
  );
};

export default VideoResultCard;
