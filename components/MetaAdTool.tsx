
import React, { useState } from 'react';
import ImageUploader from './ImageUploader';
import AdResultCard from './AdResultCard';
import { generateAdBackground } from '../services/geminiService';
import { GeneratedAd, AdAnalysis, PRODUCT_COLORS, AD_HOOKS, AdType } from '../types';

interface MetaAdToolProps {
  onBack: () => void;
  incrementUsage: () => void;
  isLimitReached: boolean;
  onViewLarge?: (url: string) => void;
}

const MetaAdTool: React.FC<MetaAdToolProps> = ({ onBack, incrementUsage, onViewLarge }) => {
  // Input State
  const [productImage, setProductImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  
  // Config State
  const [adType, setAdType] = useState<AdType>("PROMO");
  const [headline, setHeadline] = useState("Just Dropped");
  const [subHeadline, setSubHeadline] = useState("Freshly launched. Be the first to own it.");
  const [cta, setCta] = useState("Shop Now");
  const [price, setPrice] = useState("$49");
  
  // Appearance State
  const [primaryColor, setPrimaryColor] = useState("#000000"); // Background/Brand color hint
  const [textColor, setTextColor] = useState("#ffffff");
  const [selectedProductColor, setSelectedProductColor] = useState<string>("Original");
  
  // Layout Hints
  const [layoutStyle, setLayoutStyle] = useState<'CENTERED' | 'SPLIT_LEFT' | 'SPLIT_RIGHT' | 'BOTTOM_HEAVY'>('CENTERED');

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHooksModal, setShowHooksModal] = useState(false);

  const hasKey = !!localStorage.getItem('VISION_API_KEY') || !!process.env.API_KEY;

  // Hook Selection Handler
  const handleSelectHook = (hook: { title: string, subtitle: string }) => {
      setHeadline(hook.title);
      setSubHeadline(hook.subtitle);
      setShowHooksModal(false);
  };

  // Generation Handler
  const handleGenerate = async () => {
    if (!hasKey) return;
    if (!productImage || !referenceImage) {
        setError("Please upload both Product Image and Reference Ad.");
        return;
    }
    
    setIsGenerating(true);
    setError(null);
    setGeneratedAd(null);

    const analysisData: AdAnalysis = {
        headline,
        subHeadline,
        cta,
        price,
        primaryColor,
        textColor,
        layoutStyle, // User selected or default
        adType
    };

    try {
        // We use the same service, but the prompt inside acts based on the inputs
        const bgUrl = await generateAdBackground(productImage, referenceImage, analysisData, selectedProductColor);
        
        const newAd: GeneratedAd = {
            id: `ad_gen_${Date.now()}`,
            imageUrl: bgUrl,
            data: analysisData,
            timestamp: Date.now()
        };

        setGeneratedAd(newAd);
    } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to generate ad creative.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center">
         <button onClick={onBack} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Home
         </button>
      </div>

      <div className="mb-10 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Meta Ad Generator</h2>
          <p className="text-lg text-slate-600">
            Replicate high-performing ad layouts. Upload a reference, pick a hook, and generate 1:1 creatives.
          </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Assets & Configuration */}
        <div className="xl:col-span-5 space-y-6">
           
           {/* 1. Assets */}
           <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">1. Assets</h3>
             
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Your Product</label>
                    <div className="h-32">
                        <ImageUploader 
                            onImageSelect={(imgs) => setProductImage(imgs[0] || null)} 
                            selectedImages={productImage} 
                            disabled={isGenerating} 
                        />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Reference Ad</label>
                    <div className="h-32">
                        <ImageUploader 
                            onImageSelect={(img) => setReferenceImage(img[0] || null)} 
                            selectedImages={referenceImage} 
                            disabled={isGenerating} 
                        />
                    </div>
                 </div>
             </div>
           </div>

           {/* 2. Configuration */}
           <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">2. Configuration</h3>
             
             {/* Ad Type */}
             <div className="mb-4">
                 <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Ad Type</label>
                 <div className="flex bg-slate-100 p-1 rounded-lg">
                     <button onClick={() => setAdType("PROMO")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${adType === "PROMO" ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Promo / Sale</button>
                     <button onClick={() => setAdType("REVIEW")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${adType === "REVIEW" ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Review / Social Proof</button>
                 </div>
             </div>

             {/* Hook Selection */}
             <div className="mb-4 relative">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Headline & Hook</label>
                    <button 
                        onClick={() => setShowHooksModal(true)}
                        className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        Browse 100 Hooks
                    </button>
                 </div>
                 <input 
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                    placeholder="e.g. Just Dropped"
                 />
                 <input 
                    value={subHeadline}
                    onChange={(e) => setSubHeadline(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Be the first to own it."
                 />
             </div>

             {/* Price & CTA */}
             <div className="grid grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Price</label>
                    <input 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">CTA Button</label>
                    <input 
                        value={cta}
                        onChange={(e) => setCta(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
             </div>

             {/* Layout Style */}
             <div className="mb-4">
                 <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Text Layout Preference</label>
                 <select 
                    value={layoutStyle}
                    onChange={(e) => setLayoutStyle(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                 >
                     <option value="CENTERED">Centered (Classic)</option>
                     <option value="SPLIT_LEFT">Split Left (Text Left, Image Right)</option>
                     <option value="SPLIT_RIGHT">Split Right (Text Right, Image Left)</option>
                     <option value="BOTTOM_HEAVY">Bottom Heavy (Text Overlay Bottom)</option>
                 </select>
             </div>

             {/* Colors */}
             <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Background Color</label>
                    <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50">
                        <input 
                            type="color" 
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                        />
                        <span className="text-xs font-mono text-slate-500">{primaryColor}</span>
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Text Color</label>
                    <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50">
                        <input 
                            type="color" 
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                        />
                        <span className="text-xs font-mono text-slate-500">{textColor}</span>
                    </div>
                </div>
             </div>

             {/* Product Color Override */}
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Product Color Override</label>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {PRODUCT_COLORS.map(c => (
                        <button
                            key={c.name}
                            onClick={() => setSelectedProductColor(c.name)}
                            title={c.name}
                            className={`min-w-[24px] h-6 rounded-full border-2 transition-all flex-shrink-0 ${selectedProductColor === c.name ? 'border-blue-600 scale-125 shadow-sm' : 'border-slate-200'}`}
                            style={{ backgroundColor: c.hex || 'white' }}
                        >
                            {c.name === 'Original' && <span className="flex items-center justify-center text-[6px] text-slate-500 h-full font-bold">ORG</span>}
                        </button>
                    ))}
                </div>
             </div>

             <div className="space-y-3">
               <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !productImage || !referenceImage || !hasKey}
                  className={`w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2
                      ${(isGenerating || !productImage || !referenceImage || !hasKey) ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
               >
                  {isGenerating ? (
                      <>
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Generating Creative...
                      </>
                  ) : "Generate Ad Creative"}
               </button>
               {!hasKey && <p className="text-[10px] font-black text-red-500 mt-2 text-center uppercase tracking-widest">Please connect your API key in Profile settings</p>}
             </div>
             
             {error && (
                 <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 text-xs text-center">
                     {error}
                 </div>
             )}
           </div>
        </div>

        {/* RIGHT COLUMN: Result Preview */}
        <div className="xl:col-span-7">
             <div className="sticky top-24 h-full min-h-[500px]">
                 {generatedAd ? (
                     <AdResultCard 
                        ad={generatedAd}
                        loading={isGenerating}
                        onViewLarge={onViewLarge}
                        onUpdateAd={() => {}} 
                     />
                 ) : (
                    <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
                        {isGenerating ? (
                            <div className="max-w-md">
                                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Designing Your Ad...</h3>
                                <p>Replicating reference layout, placing your product, and applying text styles.</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-700">Preview Area</h3>
                                <p className="max-w-sm mt-2">
                                    Your generated 1:1 ad creative will appear here.
                                </p>
                            </>
                        )}
                    </div>
                 )}
             </div>
        </div>

      </div>

      {/* Hooks Modal */}
      {showHooksModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-fade-in">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-slate-800">Select a Hook</h3>
                      <button onClick={() => setShowHooksModal(false)} className="text-slate-400 hover:text-slate-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                  </div>
                  <div className="overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3 custom-scrollbar">
                      {AD_HOOKS.map((hook) => (
                          <button 
                            key={hook.id}
                            onClick={() => handleSelectHook(hook)}
                            className="text-left p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                          >
                              <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-blue-600 bg-blue-100 px-1.5 rounded">{hook.id}</span>
                                  <span className="font-bold text-slate-900 group-hover:text-blue-700">{hook.title}</span>
                              </div>
                              <p className="text-xs text-slate-500">{hook.subtitle}</p>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default MetaAdTool;
