
import React, { useState } from 'react';
import WebListingTool from './components/WebListingTool';
import StudioShootTool from './components/StudioShootTool';
import AIInfluencerTool from './components/AIInfluencerTool';
import RelocateTool from './components/RelocateTool';
import FashionHome from './components/FashionHome';
import ClothingStudioTool from './components/ClothingStudioTool';
import ClothingInfluencerTool from './components/ClothingInfluencerTool';
import ImageViewer from './components/ImageViewer';
import Header from './components/Layout/Header';
import ProfilePage from './components/Profile/ProfilePage';
import AnalysisTool from './components/AnalysisTool';
import { LoginPage, SignupPage } from './components/Auth/AuthPages';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppView } from './types';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('HOME');
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA]">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'LOGIN' ? (
      <LoginPage onToggle={() => setAuthMode('SIGNUP')} />
    ) : (
      <SignupPage onToggle={() => setAuthMode('LOGIN')} />
    );
  }

  const renderContent = () => {
    const commonProps = {
      onBack: () => setCurrentView('HOME'),
      incrementUsage: () => {},
      isLimitReached: false,
      onViewLarge: (url: string) => setViewImage(url)
    };

    switch(currentView) {
      case 'WEB_LISTING': return <WebListingTool {...commonProps} />;
      case 'STUDIO_SHOOT': return <StudioShootTool {...commonProps} />;
      case 'AI_INFLUENCER': return <AIInfluencerTool {...commonProps} />;
      case 'RELOCATE_PRODUCT': return <RelocateTool {...commonProps} />;
      case 'FASHION_HOME': return <FashionHome onViewTool={(v) => setCurrentView(v)} onBack={() => setCurrentView('HOME')} />;
      case 'CLOTHING_STUDIO': return <ClothingStudioTool {...commonProps} onBack={() => setCurrentView('FASHION_HOME')} />;
      case 'CLOTHING_INFLUENCER': return <ClothingInfluencerTool {...commonProps} onBack={() => setCurrentView('FASHION_HOME')} />;
      case 'PROFILE': return <ProfilePage onBack={() => setCurrentView('HOME')} />;
      
      // Marketing Suite
      case 'SIGNAL': return <AnalysisTool title="SIGNAL" tagline="Ad creative analysis & improvement suggestions." instruction="You are an elite marketing analyst. Analyze the following ad creative description or performance data. Identify weaknesses, provide 3 actionable improvement suggestions, and score the creative out of 100 based on conversion potential." placeholder="Paste ad details or describe the creative visual..." onBack={() => setCurrentView('HOME')} />;
      case 'AMPLIFY': return <AnalysisTool title="AMPLIFY LITE" tagline="High-performing ad copy generation." instruction="You are a professional conversion copywriter. Based on the product info provided, generate 5 high-impact headlines, 3 persuasive primary text options, and 2 compelling CTA variations." placeholder="Describe your product and target audience..." onBack={() => setCurrentView('HOME')} />;
      case 'HOOKLAB': return <AnalysisTool title="HOOKLAB" tagline="UGC hook & angle generator for social growth." instruction="You are a social media strategist. Generate 10 viral hooks and 3 unique video angles (e.g., Problem/Solution, Green Screen, Aesthetic) for the provided product to maximize retention." placeholder="What product are we creating UGC for?" onBack={() => setCurrentView('HOME')} />;
      case 'CREOSCORE': return <AnalysisTool title="CREO SCORE" tagline="Quality scoring tool for marketing assets." instruction="You are a creative director. Critique the provided asset description or landing page text. Provide a score for: Clarity, Emotional Hook, and Professionalism. Offer a 'Pro Tip' for immediate improvement." placeholder="Describe your asset or paste copy for scoring..." onBack={() => setCurrentView('HOME')} />;

      // Intelligence Suite
      case 'MERIDIAN': return <AnalysisTool title="MERIDIAN LITE" tagline="Product listing SEO & optimization analysis." instruction="You are an E-commerce SEO expert. Analyze the provided product listing. Suggest 10 high-volume keywords, an optimized title, and highlight missing key details that would increase search ranking." placeholder="Paste your current product title and description..." onBack={() => setCurrentView('HOME')} />;
      case 'ATLAS': return <AnalysisTool title="ATLAS PULSE" tagline="Sales & performance insights from raw data." instruction="You are a data scientist for brands. Analyze the provided sales or performance data points. Identify the top performing trend, one leaking point in the funnel, and provide a growth forecast strategy." placeholder="Paste raw metrics or observations (e.g. CTR: 2%, ROAS: 3.5)..." onBack={() => setCurrentView('HOME')} />;
      case 'PRICEWISE': return <AnalysisTool title="PRICEWISE" tagline="Pricing & offer strategy recommendations." instruction="You are a pricing strategist. Based on the product and competitor info, recommend a primary price point, a 'Sweetener' offer (e.g. BOGO), and a bundle strategy to maximize Average Order Value (AOV)." placeholder="Describe product and competitor prices..." onBack={() => setCurrentView('HOME')} />;
      case 'FUNNELMAP': return <AnalysisTool title="FUNNEL MAP" tagline="Customer journey & conversion mapping." instruction="You are a growth architect. Map out a 5-step customer journey for this product from Awareness to Retention. Include 'Drop-off Risks' and 'Conversion Triggers' for each stage." placeholder="Describe your product and how you currently sell it..." onBack={() => setCurrentView('HOME')} />;

      default:
        return (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-32">
            <div className="flex flex-col items-center mb-32 text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-3 mb-10 bg-white border border-slate-100 px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all animate-float">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Enterprise AI Fusion Engine</span>
              </div>
              
              <div className="relative">
                <h1 className="text-8xl md:text-9xl font-black text-slate-900 tracking-tighter mb-6">
                  VISION<span className="text-blue-600">.</span>
                </h1>
                <div className="flex items-center justify-center gap-3 opacity-80 mt-[-10px] mb-10">
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">Advanced Neural Production</span>
                </div>
              </div>
              
              <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                The core engine for modern brands. Precision production for bulk catalogs and elite marketing assets.
              </p>
            </div>

            <div className="space-y-32">
              {/* Product Production Section */}
              <div>
                <div className="flex items-center gap-6 mb-12 px-2">
                  <h2 className="text-xs font-black text-slate-300 uppercase tracking-[0.4em]">Section 01 / Production</h2>
                  <div className="flex-1 h-px bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                  <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ToolCard title="ORBIT" tag="Catalog" desc="Bulk marketplace generation with context awareness." icon="listing" onClick={() => setCurrentView('WEB_LISTING')} />
                    <ToolCard title="LUMA" tag="High-End" desc="Advanced lighting & camera perspective mastery." icon="camera" onClick={() => setCurrentView('STUDIO_SHOOT')} />
                    <ToolCard title="SHIFT" tag="Variations" desc="Precise color replication & environment swapping." icon="relocate" onClick={() => setCurrentView('RELOCATE_PRODUCT')} />
                    <ToolCard title="PULSE" tag="UGC" desc="Hyper-realistic social proof with Indian models." icon="user" onClick={() => setCurrentView('AI_INFLUENCER')} />
                  </div>
                  <div className="lg:col-span-4 h-full">
                    <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden group cursor-pointer h-full flex flex-col shadow-2xl transition-all hover:scale-[1.01]" onClick={() => setCurrentView('FASHION_HOME')}>
                      <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative z-10 flex flex-col h-full">
                         <div className="bg-white/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth={2} /></svg>
                         </div>
                         <h3 className="text-6xl font-black mb-6 tracking-tighter uppercase leading-none">Fashion Studio</h3>
                         <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
                           Specialized neural engine for apparel. Multi-part uploads and elite Indian modeling.
                         </p>
                         <div className="mt-auto flex items-center gap-3 text-blue-400 font-black text-xs uppercase tracking-[0.3em]">
                           Enter Premium Hub <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketing Suite Section */}
              <div>
                <div className="flex items-center gap-6 mb-12 px-2">
                  <h2 className="text-xs font-black text-slate-300 uppercase tracking-[0.4em]">Section 02 / Marketing</h2>
                  <div className="flex-1 h-px bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <ToolCard title="SIGNAL" tag="Analysis" desc="Creative audit & conversion improvement." icon="listing" onClick={() => setCurrentView('SIGNAL')} />
                  <ToolCard title="AMPLIFY LITE" tag="Copywriting" desc="Headline & CTA generation engine." icon="video" onClick={() => setCurrentView('AMPLIFY')} />
                  <ToolCard title="HOOKLAB" tag="UGC Hooks" desc="Viral retention angles for social media." icon="relocate" onClick={() => setCurrentView('HOOKLAB')} />
                  <ToolCard title="CREO SCORE" tag="Scoring" desc="Quality scoring for marketing assets." icon="camera" onClick={() => setCurrentView('CREOSCORE')} />
                </div>
              </div>

              {/* Intelligence Suite Section */}
              <div>
                <div className="flex items-center gap-6 mb-12 px-2">
                  <h2 className="text-xs font-black text-slate-300 uppercase tracking-[0.4em]">Section 03 / Intelligence</h2>
                  <div className="flex-1 h-px bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <ToolCard title="MERIDIAN LITE" tag="SEO" desc="Product listing & search optimization." icon="listing" onClick={() => setCurrentView('MERIDIAN')} />
                  <ToolCard title="ATLAS PULSE" tag="Data" desc="Sales insights from raw metrics data." icon="video" onClick={() => setCurrentView('ATLAS')} />
                  <ToolCard title="PRICEWISE" tag="Strategy" desc="Pricing & offer strategy recommendations." icon="listing" onClick={() => setCurrentView('PRICEWISE')} />
                  <ToolCard title="FUNNEL MAP" tag="Mapping" desc="Full journey & funnel conversion audit." icon="relocate" onClick={() => setCurrentView('FUNNELMAP')} />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <ImageViewer imageUrl={viewImage} onClose={() => setViewImage(null)} />
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 bg-[#FAFAFA]">{renderContent()}</main>
      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Vision Studio • Cloud Neural Infrastructure • v2.1.0</p>
        </div>
      </footer>
    </div>
  );
};

const ToolCard = ({ title, desc, onClick, icon, tag, highlight }: any) => (
  <button onClick={onClick} className={`group relative rounded-[3rem] p-10 lg:p-12 transition-all duration-700 text-left flex flex-col h-full overflow-hidden border ${highlight ? 'bg-white border-blue-600 shadow-2xl ring-2 ring-blue-50' : 'bg-white border-slate-100 shadow-sm hover:shadow-2xl hover:border-slate-300 hover:-translate-y-1'}`}>
    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-10 transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 ${highlight ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-900'}`}>
       {icon === 'listing' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16m-7 6h7" strokeWidth={2} stroke="currentColor" /></svg>}
       {icon === 'camera' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeWidth={2} stroke="currentColor" /></svg>}
       {icon === 'user' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth={2} stroke="currentColor" /></svg>}
       {icon === 'video' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" strokeWidth={2} stroke="currentColor" /></svg>}
       {icon === 'relocate' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
    <div className="mb-2 flex items-center gap-2"><span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{tag}</span></div>
    <h3 className={`font-black mb-4 tracking-tighter uppercase leading-none ${highlight ? 'text-4xl' : 'text-3xl'}`}>{title}</h3>
    <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 flex-1">{desc}</p>
    <div className="flex items-center font-black text-[10px] uppercase tracking-[0.2em] mt-auto group-hover:translate-x-2 transition-transform duration-300 text-slate-900">Execute Engine <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></div>
  </button>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
