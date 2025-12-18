import React, { useState } from 'react';

interface UrlInputProps {
  onAnalyze: (url: string) => Promise<void>;
  isLoading: boolean;
}

const UrlInput: React.FC<UrlInputProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  return (
    <div className="w-full">
       <form onSubmit={handleSubmit} className="flex gap-2">
         <input
           type="url"
           placeholder="https://myshop.com/products/example"
           className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all shadow-sm"
           value={url}
           onChange={(e) => setUrl(e.target.value)}
           disabled={isLoading}
           required
         />
         <button
           type="submit"
           disabled={!url || isLoading}
           className={`
             px-6 rounded-xl font-bold text-white shadow-md transition-all duration-300 flex items-center justify-center whitespace-nowrap
             ${(!url || isLoading)
               ? 'bg-slate-400 cursor-not-allowed' 
               : 'bg-brand-600 hover:bg-brand-500 hover:shadow-lg hover:-translate-y-0.5'
             }
           `}
         >
           {isLoading ? (
             <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
           ) : (
             "Fetch"
           )}
         </button>
       </form>
       <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
         Enter a product page URL to automatically extract image and details.
       </p>
    </div>
  );
};

export default UrlInput;
