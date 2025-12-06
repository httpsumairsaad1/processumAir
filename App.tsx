
import React, { useState, useEffect } from 'react';
import { AppState, DatasetSummary, AgentStep } from './types';
import { parseCSV, parseExcel } from './utils/csv';
import { generateCleaningPlan, generateFinalReport, generateDatasetSuggestions, initGemini } from './services/gemini';
import { FileUpload } from './components/FileUpload';
import { AgentDashboard } from './components/AgentDashboard';
import { ReportView } from './components/ReportView';
import { LandingPage } from './components/LandingPage';
import { AboutModal, DocsModal } from './components/Modals';

const DATA_FACTS = [
  "Data scientists spend roughly 80% of their time cleaning and preparing data.",
  "Ignoring missing values is the most common mistake in early model development.",
  "Outliers aren't always bad data; sometimes they hold the most valuable insights.",
  "Feature scaling is crucial for distance-based algorithms like K-Means and SVM.",
  "Garbage In, Garbage Out is the golden rule of Machine Learning.",
  "Proper data types (int vs float) can reduce memory usage by up to 50%."
];

const App: React.FC = () => {
  // Initialize in LANDING state
  const [state, setState] = useState<AppState>(AppState.LANDING);
  const [datasetSummary, setDatasetSummary] = useState<DatasetSummary | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [userGoal, setUserGoal] = useState<string>("");
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [finalReport, setFinalReport] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // New State for Suggestions & Loading
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestedTarget, setSuggestedTarget] = useState<string>("");
  const [isPlanning, setIsPlanning] = useState<boolean>(false);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  // Modal State
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  useEffect(() => {
    initGemini();
  }, []);

  // Fact rotation effect
  useEffect(() => {
    let interval: any;
    if (isPlanning) {
      interval = setInterval(() => {
        setCurrentFactIndex((prev) => (prev + 1) % DATA_FACTS.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlanning]);

  const handleFileSelect = async (file: File) => {
    try {
      setFileName(file.name);
      let summary: DatasetSummary;
      
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        summary = parseCSV(text);
      } else if (file.name.match(/\.(xlsx|xls)$/i)) {
        const buffer = await file.arrayBuffer();
        summary = parseExcel(buffer);
      } else {
        throw new Error("Unsupported file format. Please upload a CSV or Excel file.");
      }

      setDatasetSummary(summary);
      setState(AppState.ANALYZING);
      
      // Fetch suggestions
      generateDatasetSuggestions(summary).then(res => {
        setSuggestions(res.prompts);
        setSuggestedTarget(res.targetColumn);
      });

    } catch (err: any) {
      console.error(err);
      setError("Failed to parse file. " + (err.message || "Please check the file format."));
    }
  };

  const handleReupload = () => {
    setDatasetSummary(null);
    setFileName("");
    setUserGoal("");
    setSuggestions([]);
    setSuggestedTarget("");
    setError(null);
    setValidationError(null);
    setState(AppState.IDLE);
  };

  const validateInput = (): boolean => {
    setValidationError(null);

    if (!userGoal.trim()) {
      setValidationError("Goal cannot be empty. Please tell the agent what to do.");
      return false;
    }
    
    if (userGoal.length < 10) {
      setValidationError("Your objective is too short (min 10 chars). Please provide more detail.");
      return false;
    }

    // Check for "Target Column: [Name]" pattern validity if present
    // This is a simple heuristic to catch if a user manually types a non-existent column
    // or if the suggestions logic somehow got disjointed.
    if (datasetSummary) {
        // Regex to find "Target Column: Something"
        const targetMatch = userGoal.match(/Target Column:\s*([^\n,]+)/i);
        if (targetMatch && targetMatch[1]) {
            const colNameRaw = targetMatch[1].trim();
            // Try to match exact or close case
            const exactMatch = datasetSummary.columns.find(c => c.name === colNameRaw);
            if (!exactMatch) {
                setValidationError(`Invalid Column Error: The column '${colNameRaw}' does not exist in the uploaded file.`);
                return false;
            }
        }
    }

    return true;
  };

  const startProcessing = async () => {
    if (!datasetSummary) return;
    
    // Validate Input
    if (!validateInput()) {
        return;
    }

    setIsPlanning(true); // Start specific loading state
    setError(null);
    setCurrentStepIndex(0);
    
    try {
      // 1. Generate Plan with enforced minimum loading time (8s to allow reading facts)
      const delayPromise = new Promise(resolve => setTimeout(resolve, 8000));
      const planPromise = generateCleaningPlan(datasetSummary, userGoal);
      
      const [steps] = await Promise.all([planPromise, delayPromise]);

      setAgentSteps(steps);
      
      setIsPlanning(false); // Stop loading, start dashboard
      setState(AppState.PROCESSING);
      
      // 2. Execute Simulation Loop
      for (let i = 0; i < steps.length; i++) {
        setCurrentStepIndex(i);
        // Simulate "work" duration
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setAgentSteps(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'completed' } : s
        ));
      }

      // 3. Generate Final Report (Pre-fetch it)
      const report = await generateFinalReport(steps, datasetSummary, userGoal);
      setFinalReport(report);

    } catch (err) {
      console.error(err);
      setError("Agent encountered an error. Please ensure API Key is valid.");
      setIsPlanning(false);
      setState(AppState.ANALYZING);
    }
  };

  const handleReviewReport = () => {
    setState(AppState.FINISHED);
  };

  const handleBackToAnalysis = () => {
    setState(AppState.ANALYZING);
    setAgentSteps([]);
    setCurrentStepIndex(-1);
    setFinalReport("");
    setUserGoal("");
    setSuggestions([]);
  };

  const handleBackToDashboard = () => {
    setState(AppState.PROCESSING);
  };

  const handleLogoClick = () => {
      setState(AppState.LANDING);
      setDatasetSummary(null);
      setFileName("");
      setAgentSteps([]);
  };

  const appendToGoal = (text: string) => {
    setValidationError(null); // Clear error on interaction
    setUserGoal(prev => {
        const separator = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
        return prev + separator + text;
    });
  };

  // Background Icons Component
  const BackgroundIcons = () => {
    const icons = [
        "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4", // Database
        "M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z", // Flask
        "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", // Chart
        "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", // Code
        "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", // Search
        "M13 10V3L4 14h7v7l9-11h-7z", // Bolt
        "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4", // Sliders
        "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", // Edit
        "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", // Archive
        "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", // Clipboard Check
        "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z", // Cloud
        "M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5", // Cubes
        "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", // Refresh
        "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z", // Layers
        "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", // File Text
        "M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z", // Flask Repeat
        "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01", // Color Swatch
        "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" // Cart (Data Store)
    ];

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.04]">
            <div className="grid grid-cols-6 gap-12 p-8 transform -rotate-6 scale-105">
                {Array.from({ length: 60 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-center p-2">
                        <svg className="w-12 h-12 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icons[i % icons.length]} />
                        </svg>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  // Agent Planning Loading Screen
  if (isPlanning) {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-brand-50/50">
                 <BackgroundIcons />
             </div>
             <div className="z-10 flex flex-col items-center max-w-lg px-4 text-center">
                 <div className="relative mb-8">
                     <div className="absolute inset-0 bg-brand-200 rounded-full animate-ping opacity-75"></div>
                     <div className="relative bg-brand-50 p-6 rounded-full border-2 border-brand-100 shadow-xl">
                        <svg className="w-16 h-16 text-brand-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                     </div>
                 </div>
                 <h2 className="text-3xl font-bold text-gray-800 mb-2">ProcessumAir Agent Starting</h2>
                 <p className="text-gray-500 font-mono text-sm animate-pulse mb-8">Analyzing Dataset Structure...</p>
                 
                 <div className="w-full max-w-xs h-2 bg-gray-100 rounded-full overflow-hidden mb-8 mx-auto">
                     <div className="h-full bg-brand-500 animate-[loading_2s_ease-in-out_infinite] w-1/2 rounded-full"></div>
                 </div>

                 {/* Dynamic Fact Section */}
                 <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-sm border border-brand-100 w-full animate-fade-in">
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-3 bg-brand-50 px-3 py-1 rounded-full">Did you know?</span>
                        <p className="text-gray-700 italic font-medium transition-all duration-300 min-h-[3.5rem] flex items-center justify-center">
                           "{DATA_FACTS[currentFactIndex]}"
                        </p>
                    </div>
                 </div>
                 
                 <p className="mt-6 text-xs text-gray-400 font-mono">Estimated wait: 10-15 seconds</p>
             </div>
             <style>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(250%); }
                }
             `}</style>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 relative">
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={handleLogoClick}>
            <div className="bg-brand-600 rounded-lg p-1.5 group-hover:bg-brand-700 transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">processum<span className="text-brand-600">air</span></span>
          </div>

          <div className="flex items-center gap-6">
             {datasetSummary && state !== AppState.LANDING ? (
                 <div className="text-xs font-mono bg-gray-100 px-3 py-1 rounded text-gray-600 border border-gray-200 hidden md:block">
                   {datasetSummary.rowCount} rows • {datasetSummary.columns.length} cols
                 </div>
             ) : (
                 <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                    <button onClick={() => setIsDocsOpen(true)} className="hover:text-brand-600 transition-colors">Docs</button>
                    <button onClick={() => setIsAboutOpen(true)} className="hover:text-brand-600 transition-colors">About Us</button>
                 </nav>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded-r shadow-sm flex items-start gap-3">
             <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <div>
               <p className="font-bold text-sm">System Error</p>
               <p className="text-sm">{error}</p>
             </div>
          </div>
        )}

        {state === AppState.LANDING && (
           <LandingPage onStart={() => setState(AppState.IDLE)} />
        )}

        {state === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Your Autonomous <br/>
              <span className="text-brand-600 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400">Data Engineer</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mb-12">
              Stop manually cleaning data. ProcessumAir analyzes, cleans, and engineers features autonomously using advanced GenAI reasoning.
            </p>
            <FileUpload onFileSelect={handleFileSelect} />
            <button onClick={() => setState(AppState.LANDING)} className="mt-8 text-sm text-gray-400 hover:text-gray-600 underline">Back to Home</button>
          </div>
        )}

        {state === AppState.ANALYZING && datasetSummary && (
          <div className="relative max-w-4xl mx-auto animate-fade-in">
            {/* Background Layer */}
            <BackgroundIcons />
            
            <div className="relative bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 p-8 z-10">
              
              {/* File Info Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-md border border-slate-200 text-brand-600 shadow-sm">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                       <div className="font-bold text-gray-800 text-sm md:text-base truncate max-w-[200px] md:max-w-md" title={fileName}>{fileName}</div>
                       <div className="text-xs text-gray-500 font-mono mt-1 flex items-center gap-2">
                          <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-700">{datasetSummary.rowCount.toLocaleString()} rows</span>
                          <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-700">{datasetSummary.columns.length} columns</span>
                       </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleReupload} 
                    className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-red-500 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 px-4 py-2 rounded-lg transition-all uppercase tracking-wide"
                  >
                     <span>Change File</span>
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">Define Your Objective</h2>
              
              <div className="mb-6 relative">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">What is the goal for this dataset?</label>
                    {suggestions.length > 0 && (
                        <div className="text-xs text-brand-600 font-medium flex items-center gap-1 bg-brand-50 px-2 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          AI Suggestions
                        </div>
                    )}
                </div>
                
                <textarea
                  value={userGoal}
                  onChange={(e) => {
                      setUserGoal(e.target.value);
                      if (validationError) setValidationError(null);
                  }}
                  placeholder="e.g., Predict customer churn, Segment users based on behavior, Forecast sales for Q4..."
                  className={`w-full px-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-brand-500/20 transition-all min-h-[120px] shadow-inner bg-white text-gray-900 placeholder-gray-400 text-base ${validationError ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-brand-500'}`}
                />
                
                {/* Validation Error Message */}
                {validationError && (
                    <div className="mt-2 text-sm text-red-600 flex items-center gap-1.5 animate-fade-in font-medium">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        {validationError}
                    </div>
                )}

                {/* Suggestions Chips */}
                {suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {suggestions.map((prompt, idx) => (
                            <button 
                                key={idx}
                                onClick={() => appendToGoal(prompt)}
                                className="text-xs bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1.5 rounded-full hover:bg-brand-100 hover:border-brand-300 transition-all text-left shadow-sm"
                            >
                                + {prompt}
                            </button>
                        ))}
                    </div>
                )}
              </div>

              {/* Smart Columns Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                 <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm">
                    <h4 className="font-semibold text-blue-900 mb-3 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Detected Columns (Click to add)
                    </h4>
                    <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                        {datasetSummary.columns.map(c => (
                        <button 
                            key={c.name} 
                            onClick={() => appendToGoal(c.name)}
                            className="px-2 py-1 bg-white border border-blue-200 rounded text-xs text-blue-800 hover:bg-blue-600 hover:text-white transition-colors"
                            title={`Type: ${c.type}`}
                        >
                            {c.name}
                        </button>
                        ))}
                    </div>
                 </div>

                 {suggestedTarget && (
                     <div className="bg-green-50 p-5 rounded-xl border border-green-100 flex flex-col justify-center shadow-sm">
                        <h4 className="font-semibold text-green-900 mb-2 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Suggested Target
                        </h4>
                        <p className="text-xs text-green-700 mb-3">
                            Based on analysis, <strong>{suggestedTarget}</strong> seems like the likely prediction target.
                        </p>
                        <button 
                            onClick={() => appendToGoal(`Target Column: ${suggestedTarget}`)}
                            className="w-full bg-green-100 text-green-800 border border-green-200 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                        >
                            Set Goal: Predict {suggestedTarget}
                        </button>
                     </div>
                 )}
              </div>

              <button
                onClick={startProcessing}
                className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-3 group"
              >
                <span>Start Processum Agent</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {state === AppState.PROCESSING && datasetSummary && (
          <AgentDashboard 
            steps={agentSteps}
            datasetSummary={datasetSummary}
            currentStepIndex={currentStepIndex}
            isProcessing={true}
            onReviewReport={handleReviewReport}
            onBack={handleBackToAnalysis}
          />
        )}

        {state === AppState.FINISHED && (
          <ReportView 
            report={finalReport} 
            steps={agentSteps} 
            goal={userGoal}
            datasetSummary={datasetSummary}
            onBack={handleBackToDashboard}
            fileName={fileName}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8 mt-auto relative z-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} ProcessumAir. Powered by Gemini 2.5 Flash.
        </div>
      </footer>
    </div>
  );
};

export default App;
