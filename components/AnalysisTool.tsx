
import React, { useState } from 'react';
import { runTextAnalysis } from '../services/geminiService';
import { AppState } from '../types';

interface AnalysisToolProps {
  title: string;
  tagline: string;
  instruction: string;
  placeholder: string;
  onBack: () => void;
}

const AnalysisTool: React.FC<AnalysisToolProps> = ({ title, tagline, instruction, placeholder, onBack }) => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);

  const hasKey = !!localStorage.getItem('VISION_API_KEY') || !!process.env.API_KEY;

  const handleRun = async () => {
    if (!input.trim() || !hasKey) return;
    setAppState(AppState.ANALYZING);
    setError(null);
    try {
      const output = await runTextAnalysis(instruction, input);
      setResult(output);
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      setError(err.message || "Analysis failed.");
      setAppState(AppState.ERROR);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest text-[10px] mb-12 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth={2.5} /></svg>
        Dashboard
      </button>

      <div className="bg-white rounded-[3rem] p-10 lg:p-16 border border-slate-100 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-900"></div>
        
        <div className="mb-12">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4">{title}</h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">{tagline}</p>
        </div>

        <div className="space-y-10">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Input Data / Description</label>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-48 bg-slate-50 border border-slate-100 rounded-[2rem] p-8 text-sm font-medium focus:ring-4 focus:ring-slate-50 outline-none transition-all resize-none"
              placeholder={placeholder}
            />
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleRun}
              disabled={appState === AppState.ANALYZING || !input.trim() || !hasKey}
              className="w-full py-6 bg-slate-900 text-white font-black rounded-[2rem] uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
            >
              {appState === AppState.ANALYZING ? "Running Analysis..." : "Execute Analysis"}
            </button>
            {!hasKey && <p className="text-[10px] font-black text-red-500 mt-2 text-center uppercase tracking-widest">Please connect your API key in Profile settings</p>}
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

          {result && (
            <div className="pt-12 border-t border-slate-100 animate-fade-in">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-6">AI Generated Output</h3>
              <div className="bg-slate-50 rounded-[2rem] p-8 lg:p-12 text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                {result}
              </div>
              <button 
                onClick={() => { navigator.clipboard.writeText(result); }}
                className="mt-6 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
              >
                Copy to Clipboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisTool;
