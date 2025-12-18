
import React from 'react';
import { AppView } from '../types';

interface FashionHomeProps {
  onViewTool: (view: AppView) => void;
  onBack: () => void;
}

const FashionHome: React.FC<FashionHomeProps> = ({ onViewTool, onBack }) => {
  return (
    <div className="w-full">
       <div className="mb-6 flex items-center">
         <button onClick={onBack} className="text-slate-500 hover:text-slate-900 flex items-center gap-1 font-bold transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Dashboard
         </button>
      </div>

      <div className="mb-16 text-center max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Fashion Studio</h2>
          <p className="text-xl text-slate-500 font-medium">
            AI Clothing Production. Indian models, outfit completion, and high-end aesthetics.
          </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <button 
            onClick={() => onViewTool('CLOTHING_STUDIO')}
            className="group bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl hover:shadow-2xl hover:border-slate-300 transition-all text-left relative overflow-hidden"
          >
             <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">LUMA <br/> <span className="text-slate-400">CLOTHING</span></h3>
             <p className="text-slate-500 mb-8 font-medium">Minimalist high-end studio shots. Control angles, demographics, and body types.</p>
             <div className="flex items-center text-slate-900 font-bold text-xs uppercase tracking-widest">
                Start Session <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
             </div>
             <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
          </button>

          <button 
            onClick={() => onViewTool('CLOTHING_INFLUENCER')}
            className="group bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl hover:shadow-2xl hover:border-slate-300 transition-all text-left relative overflow-hidden"
          >
             <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">PULSE <br/> <span className="text-slate-400">CLOTHING</span></h3>
             <p className="text-slate-500 mb-8 font-medium">Authentic Indian lifestyle content. Smartphone vibes with precision demographics.</p>
             <div className="flex items-center text-slate-900 font-bold text-xs uppercase tracking-widest">
                Start Session <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
             </div>
             <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
          </button>
      </div>
    </div>
  );
};

export default FashionHome;
