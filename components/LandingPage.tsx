
import React, { useState } from 'react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    { 
      id: 1, 
      title: "Data Profiling", 
      subtitle: "Schema & Type Detection",
      desc: "The agent scans raw binary data to infer schema, column types (categorical/numeric), and statistical distributions. It identifies immediate quality issues like null density and mixed types.", 
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
    },
    { 
      id: 2, 
      title: "Strategic Planning", 
      subtitle: "Reasoning Engine",
      desc: "Using Gemini 2.5 Pro, the agent formulates a multi-step hypothesis tailored to your specific goal (e.g., 'Reduce Churn'). It prioritizes tasks that maximize information gain.", 
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
    },
    { 
      id: 3, 
      title: "Smart Imputation", 
      subtitle: "Missing Value Handling",
      desc: "Instead of blind dropping, the agent selects optimal imputation strategies (Mean, Median, Mode, or KNN) based on column skewness and correlation with the target variable.", 
      icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
    },
    { 
      id: 4, 
      title: "Outlier Handling", 
      subtitle: "Anomaly Detection",
      desc: "Detects statistical anomalies using IQR or Z-Score methods. The agent autonomously decides whether to cap these values, remove the rows, or transform the feature.", 
      icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
    },
    { 
      id: 5, 
      title: "Feature Engineering", 
      subtitle: "Transformation & Encoding",
      desc: "Converts raw data into ML-ready features. Applies One-Hot Encoding for low-cardinality categories, Target Encoding for high-cardinality, and Standard/MinMax scaling for numerics.", 
      icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" 
    },
    { 
      id: 6, 
      title: "Code Generation", 
      subtitle: "Production Scripting",
      desc: "Finalizes the pipeline by synthesizing a clean, commented, and reproducible Python script (Pandas/Scikit-Learn) that performs all the above steps on any new data.", 
      icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" 
    }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] font-sans">
      
      {/* Hero Section (Updated with Ocean/Layers/Math theme) */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 bg-slate-950 overflow-hidden">
        
        {/* --- Background Layers --- */}

        {/* 1. Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0f172a] to-[#0c4a6e] z-0"></div>

        {/* 2. Technical Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0"></div>

        {/* 3. Floating Binary & Math Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
           {/* Static Placements for better composition control */}
           <div className="absolute top-[15%] left-[10%] text-brand-500/10 text-8xl font-mono font-bold rotate-12 animate-pulse">01</div>
           <div className="absolute top-[25%] right-[15%] text-blue-400/10 text-6xl font-mono font-bold -rotate-6">1011</div>
           <div className="absolute bottom-[40%] left-[5%] text-white/5 text-9xl font-mono font-bold">1</div>
           <div className="absolute bottom-[30%] right-[5%] text-white/5 text-9xl font-mono font-bold">0</div>
           
           {/* Math Symbols */}
           <div className="absolute top-[20%] left-[30%] text-white/5 text-4xl font-serif">∑</div>
           <div className="absolute bottom-[40%] right-[30%] text-white/5 text-4xl font-serif">∫</div>
           <div className="absolute top-[10%] right-[40%] text-white/5 text-3xl font-mono">NaN</div>
           <div className="absolute bottom-[20%] left-[40%] text-white/5 text-3xl font-mono">null</div>
           <div className="absolute top-[30%] right-[5%] text-cyan-500/10 text-5xl font-bold">f(x)</div>

           {/* Random small bits */}
           <div className="absolute top-1/2 left-10 text-brand-500/20 text-xl font-mono">00101</div>
           <div className="absolute top-1/3 right-10 text-brand-500/20 text-xl font-mono">11010</div>
        </div>

        {/* 4. Ocean Waves Transition (Bottom) */}
        <div className="absolute bottom-0 left-0 w-full z-10 pointer-events-none">
           {/* Layer 1 - Back Wave (Darker) */}
           <svg className="w-full h-24 md:h-48 text-[#0369a1] opacity-30 transform translate-y-8" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="currentColor" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z"></path>
           </svg>
           
           {/* Layer 2 - Mid Wave (Brand color) */}
           <svg className="w-full h-24 md:h-48 text-[#0ea5e9] opacity-20 transform translate-y-4" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="currentColor" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z"></path>
           </svg>

           {/* Layer 3 - Front Wave (White) to transition into next section */}
           <svg className="w-full h-16 md:h-32 text-white" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="currentColor" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z"></path>
           </svg>
        </div>

        {/* --- Foreground Content --- */}
        <div className="relative z-20 max-w-5xl mx-auto">
           {/* Pill Badge */}
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700 text-brand-300 text-sm font-medium mb-8 backdrop-blur-md animate-fade-in-up shadow-lg shadow-black/20">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
             </span>
             v1.0 Now Available for CSV & Excel
           </div>

           {/* Main Heading */}
           <h1 className="text-5xl md:text-8xl font-extrabold text-white tracking-tight mb-8 leading-tight animate-fade-in-up delay-100 drop-shadow-2xl">
              Automate your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-cyan-400 to-blue-500">Data Engineering</span> Pipeline
           </h1>
           
           {/* Subheading */}
           <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 animate-fade-in-up delay-200 leading-relaxed font-light">
              ProcessumAir is an autonomous agent that inspects, cleans, and engineers features for your datasets. From raw CSV to ML-ready code in seconds.
           </p>

           {/* Scroll Indicator */}
           <div className="animate-fade-in-up delay-300 text-slate-500 text-sm flex flex-col items-center gap-2">
                <span className="tracking-widest uppercase text-xs opacity-70">Scroll to explore</span>
                <div className="p-2 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <svg className="w-5 h-5 animate-bounce text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
           </div>
        </div>
      </section>

      {/* Why ProcessumAir Name */}
      <section className="py-16 bg-white border-b border-gray-100 relative z-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-2xl font-bold text-gray-400 mb-4">
                <span className="text-gray-900">Processum</span>
                <span className="text-gray-300">+</span>
                <span className="text-brand-600">Air</span>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-sm">
                <div className="bg-gray-50 px-6 py-3 rounded-lg border border-gray-100 shadow-sm">
                    <span className="font-bold text-gray-900 block mb-1">Processum</span>
                    <span className="text-gray-500">Latin for "Process" or "Preparation"</span>
                </div>
                <div className="bg-brand-50 px-6 py-3 rounded-lg border border-brand-100 shadow-sm">
                    <span className="font-bold text-brand-900 block mb-1">Air</span>
                    <span className="text-brand-600">Autonomous Intelligent Reasoning</span>
                </div>
            </div>
            <p className="mt-8 text-gray-600 max-w-xl mx-auto leading-relaxed">
                The name reflects our mission: to combine rigorous data preparation processes with the lightness, speed, and intelligence of autonomous AI agents.
            </p>
        </div>
      </section>

      {/* Pipeline Workflow Visualization */}
      <section className="py-24 bg-slate-950 text-white relative overflow-hidden my-8 mx-4 md:mx-8 rounded-[2.5rem] shadow-2xl">
        
        {/* Abstract Data Waves / Layers Background */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-[2.5rem]">
            {/* Deep Ocean Gradient Base */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0f172a] to-[#0c4a6e]"></div>
            
            {/* Layer 1 - Deep Blue Flow */}
            <svg className="absolute bottom-0 left-0 w-full h-[70%] opacity-20 transform translate-y-24" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="#0ea5e9" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z"></path>
            </svg>

            {/* Layer 2 - Mid Blue Flow */}
            <svg className="absolute bottom-0 left-0 w-full h-[60%] opacity-30 transform translate-y-12" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="#38bdf8" fillOpacity="1" d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,144C672,149,768,203,864,224C960,245,1056,235,1152,208C1248,181,1344,139,1392,117.3L1440,96V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z"></path>
            </svg>

            {/* Layer 3 - Light Blue Highlight Flow */}
            <svg className="absolute bottom-0 left-0 w-full h-[40%] opacity-10" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="#7dd3fc" fillOpacity="1" d="M0,64L48,85.3C96,107,192,149,288,160C384,171,480,149,576,128C672,107,768,85,864,96C960,107,1056,149,1152,154.7C1248,160,1344,128,1392,112L1440,96V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z"></path>
            </svg>

            {/* Technical Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
            
            {/* Radial glow for center focus */}
            <div className="absolute inset-0 bg-radial-gradient from-brand-900/20 via-transparent to-transparent pointer-events-none"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4 font-mono tracking-tight"><span className="text-brand-500">/</span> Autonomous_Pipeline_Core</h2>
                <p className="text-slate-300 max-w-2xl mx-auto">
                    A visualization of the agent's internal architecture. Hover over nodes to inspect the logic flow through the data layers.
                </p>
            </div>

            {/* PIPELINE CONTAINER */}
            <div className="relative">
                
                {/* Connecting Line (The Bus) */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 hidden md:block rounded-full border border-slate-700/50"></div>
                
                {/* Animated Data Flow */}
                <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 hidden md:block overflow-hidden rounded-full">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-brand-400 to-transparent animate-[shimmer_3s_infinite] opacity-70"></div>
                </div>

                {/* Nodes Wrapper */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-8 relative z-20">
                    {steps.map((step, index) => {
                        const isActive = activeStep === index;
                        return (
                            <div 
                                key={step.id}
                                className="group relative flex flex-col items-center cursor-pointer"
                                onMouseEnter={() => setActiveStep(index)}
                                onClick={() => setActiveStep(index)}
                            >
                                {/* Connector Dot Top (Mobile) / Left (Desktop) */}
                                <div className={`absolute top-0 md:top-1/2 md:-left-4 w-2 h-2 rounded-full transform md:-translate-y-1/2 transition-colors duration-300 ${isActive ? 'bg-brand-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]' : 'bg-slate-700'}`}></div>

                                {/* Node Body */}
                                <div className={`
                                    relative w-24 h-24 rounded-2xl border-2 flex items-center justify-center transition-all duration-300
                                    ${isActive 
                                        ? 'bg-slate-900 border-brand-400 shadow-[0_0_25px_rgba(14,165,233,0.4)] scale-110' 
                                        : 'bg-slate-900/80 backdrop-blur-sm border-slate-700 text-slate-500 hover:border-slate-500 hover:bg-slate-800'}
                                `}>
                                    <svg className={`w-8 h-8 transition-colors duration-300 ${isActive ? 'text-brand-400' : 'text-slate-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={step.icon} />
                                    </svg>

                                    {/* Number Badge */}
                                    <div className={`absolute -top-3 -right-3 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold border transition-colors duration-300 ${isActive ? 'bg-brand-600 border-brand-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                        {step.id}
                                    </div>
                                </div>

                                {/* Label */}
                                <div className="mt-6 text-center transition-opacity duration-300">
                                    <h3 className={`text-sm font-bold font-mono ${isActive ? 'text-white' : 'text-slate-500'}`}>{step.title}</h3>
                                </div>

                                {/* Connector Dot Bottom (Mobile) / Right (Desktop) */}
                                {index !== steps.length - 1 && (
                                     <div className={`absolute bottom-0 md:top-1/2 md:-right-4 w-2 h-2 rounded-full transform md:-translate-y-1/2 transition-colors duration-300 ${isActive ? 'bg-brand-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]' : 'bg-slate-700'}`}></div>
                                )}
                                
                                {/* Vertical Line for Mobile */}
                                {index !== steps.length - 1 && (
                                    <div className="md:hidden absolute top-full left-1/2 w-0.5 h-8 bg-slate-800 -translate-x-1/2"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* SYSTEM MONITOR (Detail View) */}
            <div className="mt-16 max-w-4xl mx-auto">
                <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 overflow-hidden shadow-2xl relative">
                    {/* Header Bar */}
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                        </div>
                        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                            System_Monitor.log
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                        {/* Scanlines Effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-0 opacity-20"></div>

                        {/* Icon Large */}
                        <div className="hidden md:flex flex-shrink-0 w-24 h-24 bg-slate-800/50 rounded-lg items-center justify-center border border-slate-700 relative z-10">
                             <svg className="w-10 h-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={steps[activeStep].icon} />
                            </svg>
                        </div>

                        {/* Text */}
                        <div className="flex-1 relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-brand-500 font-mono text-sm">>> STEP_0{steps[activeStep].id}</span>
                                <div className="h-px bg-slate-800 flex-1"></div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">{steps[activeStep].title}</h3>
                            <h4 className="text-sm font-mono text-slate-400 mb-4 uppercase">{steps[activeStep].subtitle}</h4>
                            <p className="text-slate-300 leading-relaxed text-lg">
                                {steps[activeStep].desc}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Deliverables Section (Report & Script) */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
             <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Tangible Deliverables</h2>
                <p className="text-gray-500">Don't just get results. Get the proof.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Report Block */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#0c4a6e] to-[#0f172a] rounded-2xl p-8 shadow-xl border border-slate-700/50 flex flex-col md:flex-row gap-6 items-center hover:scale-[1.02] transition-transform duration-300 group">
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(30deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative z-10 flex-shrink-0 w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-brand-300 border border-white/10 shadow-inner group-hover:bg-brand-500/20 group-hover:border-brand-500/30 transition-colors">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="relative z-10 text-center md:text-left">
                        <h3 className="text-xl font-bold text-white mb-2">Professional PDF Reports</h3>
                        <p className="text-blue-100/70 mb-4 text-sm leading-relaxed">
                            Receive a comprehensive executive summary and detailed changelog of every modification made to your data.
                        </p>
                        <div className="text-sm font-semibold text-brand-400 flex items-center justify-center md:justify-start gap-1">
                            Included in Free Tier 
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </div>
                    </div>
                </div>

                {/* Script Block */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#0c4a6e] to-[#0f172a] rounded-2xl p-8 shadow-xl border border-slate-700/50 flex flex-col md:flex-row gap-6 items-center hover:scale-[1.02] transition-transform duration-300 group">
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(30deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10 flex-shrink-0 w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-blue-300 border border-white/10 shadow-inner group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-colors">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="relative z-10 text-center md:text-left">
                        <h3 className="text-xl font-bold text-white mb-2">Reproducible Python Code</h3>
                        <p className="text-blue-100/70 mb-4 text-sm leading-relaxed">
                            The agent writes the actual Pandas/Scikit-Learn code for you. Download the script to run the pipeline locally.
                        </p>
                        <div className="text-sm font-semibold text-brand-400 flex items-center justify-center md:justify-start gap-1">
                            Standard Python Libraries
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* WAVE CTA SECTION */}
      <section className="relative py-24 bg-gradient-to-br from-brand-600 to-blue-900 overflow-hidden my-8 mx-4 md:mx-8 rounded-[2.5rem] shadow-2xl">
          
          {/* Wave Background Layers */}
          <div className="absolute inset-0 z-0">
             {/* Wave 1: Back, darkest */}
             <svg className="absolute -top-12 left-0 w-full h-48 text-brand-800 opacity-30 animate-[wave_10s_ease-in-out_infinite]" viewBox="0 0 1440 320" preserveAspectRatio="none">
               <path fill="currentColor" d="M0,224L48,229.3C96,235,192,245,288,234.7C384,224,480,192,576,192C672,192,768,224,864,240C960,256,1056,256,1152,240C1248,224,1344,192,1392,176L1440,160V0H1392C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0H0Z"></path>
             </svg>
             {/* Wave 2: Middle, lighter */}
             <svg className="absolute -top-12 left-0 w-full h-48 text-brand-500 opacity-40 animate-[wave_8s_ease-in-out_infinite_reverse]" viewBox="0 0 1440 320" preserveAspectRatio="none">
               <path fill="currentColor" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,213.3C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160V0H1392C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0H0Z"></path>
             </svg>
             
             {/* Floating Bubble Particles */}
             <div className="absolute inset-0 overflow-hidden">
                <div className="absolute bottom-0 left-1/4 w-4 h-4 bg-white/10 rounded-full animate-[float_6s_ease-in-out_infinite]"></div>
                <div className="absolute bottom-10 left-3/4 w-8 h-8 bg-white/5 rounded-full animate-[float_8s_ease-in-out_infinite_1s]"></div>
                <div className="absolute bottom-20 left-1/2 w-2 h-2 bg-white/20 rounded-full animate-[float_4s_ease-in-out_infinite_2s]"></div>
             </div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-md tracking-tight">
                  Ready to clean your data?
              </h2>
              <p className="text-xl text-brand-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                  Join the future of data engineering. Upload your dataset, define your goal, and let the agent handle the rest.
              </p>
              
              <button 
                onClick={onStart}
                className="px-10 py-5 bg-white text-brand-700 rounded-full font-bold text-lg hover:bg-brand-50 hover:shadow-2xl hover:scale-105 transition-all shadow-xl inline-flex items-center gap-2 group ring-4 ring-brand-500/30"
              >
                Start Autonomous Agent
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
          </div>
      </section>

      <style>{`
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        @keyframes wave {
           0%, 100% { transform: translateY(0); }
           50% { transform: translateY(-15px); }
        }
        @keyframes float {
           0% { transform: translateY(0); opacity: 0; }
           50% { opacity: 0.5; }
           100% { transform: translateY(-100px); opacity: 0; }
        }
      `}</style>

    </div>
  );
};
