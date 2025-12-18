
import React, { useRef, useEffect, useState } from 'react';
import { GeneratedAd, AdAnalysis } from '../types';

interface AdResultCardProps {
  ad: GeneratedAd;
  onUpdateAd: (id: string, newCopy: any) => void; 
  onViewLarge?: (url: string) => void;
  loading?: boolean;
}

const AdResultCard: React.FC<AdResultCardProps> = ({ ad, onUpdateAd, onViewLarge, loading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generatedBlobUrl, setGeneratedBlobUrl] = useState<string | null>(null);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);

  // Constants for styling
  const FONT_FAMILY = 'Inter, sans-serif';

  // Function to draw the ad on canvas
  const drawAd = () => {
    if (!ad) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = ad.imageUrl;
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const w = canvas.width;
      const h = canvas.height;

      // Draw background image
      ctx.drawImage(img, 0, 0);

      const data = ad.data;

      // --- TEXT RENDERING LOGIC BASED ON LAYOUT STYLE ---
      ctx.fillStyle = data.textColor || '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const padding = w * 0.08;
      let titleY = h * 0.1;
      let titleX = padding;
      let align: CanvasTextAlign = 'left';

      if (data.layoutStyle === 'CENTERED') {
          align = 'center';
          titleX = w / 2;
          titleY = h * 0.15;
      } else if (data.layoutStyle === 'SPLIT_RIGHT') {
          align = 'right';
          titleX = w - padding;
          titleY = h * 0.1;
      } else if (data.layoutStyle === 'BOTTOM_HEAVY') {
          align = 'left';
          titleX = padding;
          titleY = h * 0.65;
      }

      ctx.textAlign = align;
      ctx.font = `900 ${h * 0.08}px ${FONT_FAMILY}`;
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 15;
      
      const words = (data.headline || '').toUpperCase().split(' ');
      let line = '';
      let y = titleY;
      const lineHeight = h * 0.09;
      const maxWidth = data.layoutStyle === 'CENTERED' ? w * 0.8 : w * 0.5;

      for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, titleX, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, titleX, y);
      y += lineHeight * 1.2;

      ctx.font = `bold ${h * 0.035}px ${FONT_FAMILY}`;
      ctx.fillStyle = data.textColor || '#ffffff';
      ctx.fillText(data.subHeadline || '', titleX, y);
      y += lineHeight * 0.8;

      const btnPaddingX = w * 0.04;
      ctx.font = `bold ${h * 0.03}px ${FONT_FAMILY}`;
      const ctaText = data.cta || 'SHOP NOW';
      const ctaWidth = ctx.measureText(ctaText).width + (btnPaddingX * 2);
      const ctaHeight = h * 0.06;
      let btnX = titleX;
      if (align === 'center') btnX = titleX - (ctaWidth/2);
      if (align === 'right') btnX = titleX - ctaWidth;

      ctx.shadowBlur = 0;
      ctx.fillStyle = data.primaryColor || '#000000';
      ctx.beginPath();
      ctx.roundRect(btnX, y, ctaWidth, ctaHeight, 10);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.fillText(ctaText.toUpperCase(), btnX + (ctaWidth/2), y + (ctaHeight/2) - (h*0.015));

      if (data.price) {
          const radius = w * 0.1;
          const px = w - radius - (w*0.05);
          const py = radius + (w*0.05);
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, 2 * Math.PI);
          ctx.fillStyle = data.primaryColor || '#bd0218';
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.font = `bold ${h * 0.05}px ${FONT_FAMILY}`;
          ctx.fillText(data.price, px, py - (h*0.02));
          ctx.font = `normal ${h * 0.02}px ${FONT_FAMILY}`;
          ctx.fillText("ONLY", px, py + (h*0.03));
      }
      
      canvas.toBlob((blob) => {
         if (blob) setGeneratedBlobUrl(URL.createObjectURL(blob));
      });
    };
  };

  useEffect(() => {
    if (ad) {
        drawAd();
    }
  }, [ad]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `meta_ad_${ad.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleDriveUpload = async () => {
    setIsUploadingToDrive(true);
    const sanitizedTitle = ad.data.headline.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const fileName = `${sanitizedTitle}_ad_final.png`;
    console.log(`Simulating ad upload of ${fileName} to Google Drive...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsUploadingToDrive(false);
    alert(`Ad Creative ${fileName} "uploaded" to Google Drive.`);
  };

  if (loading) {
      return (
         <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full relative min-h-[400px]">
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-slate-50">
                <div className="relative">
                <div className="w-12 h-12 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-[10px] text-slate-900 font-black uppercase tracking-widest animate-pulse">Designing...</p>
            </div>
         </div>
      );
  }

  if (!ad) return null;

  return (
    <div className="flex flex-col gap-6 h-full">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden relative group">
            <div className="relative aspect-square bg-slate-50">
                <canvas ref={canvasRef} className="w-full h-full object-cover" />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                        onClick={handleDownload}
                        className="bg-white text-slate-900 px-6 py-3 rounded-2xl shadow-xl hover:scale-105 transition-transform font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
                    >
                        Download
                    </button>
                    <button 
                        onClick={handleDriveUpload}
                        disabled={isUploadingToDrive}
                        className="bg-white text-slate-900 px-6 py-3 rounded-2xl shadow-xl hover:scale-105 transition-transform font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
                    >
                        {isUploadingToDrive ? "Uploading..." : "Drive"}
                    </button>
                </div>
            </div>
        </div>

        {ad.data.performanceReasoning && (
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Creative Insight</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                    {ad.data.performanceReasoning}
                </p>
            </div>
        )}
    </div>
  );
};

export default AdResultCard;
