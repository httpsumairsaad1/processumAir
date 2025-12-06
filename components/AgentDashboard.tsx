
import React, { useEffect, useState, useRef } from 'react';
import { AgentStep, DatasetSummary } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AgentDashboardProps {
  steps: AgentStep[];
  datasetSummary: DatasetSummary;
  currentStepIndex: number;
  isProcessing: boolean;
  onReviewReport: () => void;
  onBack: () => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ 
  steps, 
  datasetSummary, 
  currentStepIndex,
  isProcessing,
  onReviewReport,
  onBack
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // State for chart data
  const [chartData, setChartData] = useState<{name: string, score: number}[]>([
    { name: 'Start', score: 30 }
  ]);

  // State for which step is currently inspected (clicked by user or auto-selected)
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'trace' | 'code' | 'stats'>('trace');

  // Auto-select current running step if processing
  useEffect(() => {
    if (isProcessing && currentStepIndex >= 0) {
      setSelectedStepIndex(currentStepIndex);
    }
  }, [currentStepIndex, isProcessing]);

  // Update Chart Data
  useEffect(() => {
    if (steps.length > 0 && currentStepIndex >= 0) {
      const newChartData = [{ name: 'Start', score: 30 }];
      let currentScore = 30;
      
      steps.slice(0, currentStepIndex + 1).forEach((step, idx) => {
        currentScore = Math.min(100, currentScore + (step.qualityScoreImpact || 10));
        newChartData.push({
          name: `Step ${idx + 1}`,
          score: currentScore
        });
      });
      setChartData(newChartData);
    }
  }, [currentStepIndex, steps]);

  // Auto-scroll the log
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentStepIndex]);

  const activeStep = steps[selectedStepIndex] || steps[0];
  const isAllComplete = steps.length > 0 && steps.every(s => s.status === 'completed');

  // --- Helper Components ---
  
  const TraceGraph = ({ step }: { step: AgentStep }) => {
    const thoughts = step.traceThoughts || ["Analyze Data", "Identify Issue", "Formulate Plan"];
    const nodes = ["Input Data", ...thoughts, "Code Gen"];
    
    return (
      <div className="w-full overflow-x-auto pb-4 pt-2 px-2 custom-scrollbar">
        <div className="flex items-start min-w-max">
          {nodes.map((node, i) => {
            const isFirst = i === 0;
            const isLast = i === nodes.length - 1;
            const delay = i * 150;
            
            return (
              <div key={i} className="flex items-center group">
                {/* Node Container */}
                <div className="flex flex-col items-center relative z-10 animate-fade-in" style={{animationDelay: `${delay}ms`}}>
                  
                  {/* Node Shape */}
                  <div className={`
                    relative w-14 h-14 flex items-center justify-center rounded-xl border-2 transition-all duration-300 bg-white
                    ${isFirst ? 'border-slate-300 text-slate-500 bg-slate-50' : 
                      isLast ? 'border-brand-500 text-brand-600 bg-brand-50 shadow-md shadow-brand-200' : 
                      'border-blue-200 text-blue-500 shadow-sm'}
                  `}>
                     {/* Icons based on type */}
                     {isFirst ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                     ) : isLast ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                     ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     )}

                     {/* Badge for sequence number */}
                     {!isFirst && !isLast && (
                       <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full flex items-center justify-center border border-blue-200">
                         {i}
                       </div>
                     )}
                  </div>

                  {/* Node Label */}
                  <span className={`
                    mt-3 text-[11px] font-medium text-center uppercase tracking-wide max-w-[100px] leading-tight
                    ${isLast ? 'text-brand-700 font-bold' : 'text-gray-500'}
                  `}>
                    {node}
                  </span>
                  
                </div>

                {/* Connecting Edge */}
                {!isLast && (
                  <div className="flex items-center w-12 -mx-2 relative z-0 animate-fade-in" style={{animationDelay: `${delay + 100}ms`}}>
                    {/* Line */}
                    <div className="h-0.5 w-full bg-gray-300 group-hover:bg-blue-300 transition-colors"></div>
                    {/* Arrow Head */}
                    <svg className="w-4 h-4 text-gray-300 -ml-1.5 group-hover:text-blue-300 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-500 hover:text-brand-600 transition-colors font-medium text-sm"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Analysis
        </button>
        {isAllComplete && (
           <div className="animate-fade-in">
             <button
               onClick={onReviewReport}
               className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition-all font-semibold shadow-lg shadow-brand-200"
             >
               Review Report
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
               </svg>
             </button>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[800px]">
        {/* Left Panel: Agent Log List */}
        <div className="lg:col-span-4 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                {!isAllComplete && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${!isAllComplete ? 'bg-brand-500' : 'bg-green-500'}`}></span>
              </span>
              Activity Log
            </h2>
            <span className="text-xs font-mono text-gray-500">{steps.filter(s => s.status === 'completed').length}/{steps.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
            {steps.map((step, idx) => {
              const isSelected = selectedStepIndex === idx;
              const isCurrent = idx === currentStepIndex && !isAllComplete;
              const isDone = step.status === 'completed';
              
              return (
                <div 
                  key={step.id}
                  onClick={() => setSelectedStepIndex(idx)}
                  className={`
                    cursor-pointer rounded-lg p-3 border transition-all duration-200 relative overflow-hidden group
                    ${isSelected ? 'bg-brand-50 border-brand-300 ring-1 ring-brand-200' : 'bg-white border-gray-100 hover:border-brand-200 hover:shadow-sm'}
                  `}
                >
                  {isCurrent && <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>}
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      step.type === 'CLEAN' ? 'bg-red-100 text-red-700' :
                      step.type === 'IMPUTE' ? 'bg-yellow-100 text-yellow-700' :
                      step.type === 'ENGINEER' ? 'bg-purple-100 text-purple-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {step.type}
                    </span>
                    {isDone ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : isCurrent ? (
                      <svg className="w-4 h-4 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                    )}
                  </div>
                  <h3 className={`text-sm font-semibold mb-1 ${isSelected ? 'text-brand-900' : 'text-gray-700'}`}>{step.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Step Inspector & Details */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Inspector Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
            
            {/* Inspector Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
               <div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Step Inspector</div>
                 <h2 className="text-xl font-bold text-gray-800">{activeStep?.title || "Initializing..."}</h2>
               </div>
               <div className="flex gap-2">
                 {(['trace', 'code', 'stats'] as const).map((tab) => (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`
                       px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize
                       ${activeTab === tab ? 'bg-white shadow text-brand-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
                     `}
                   >
                     {tab === 'stats' ? 'Global Stats' : tab === 'code' ? 'Code & Data' : 'Execution Trace'}
                   </button>
                 ))}
               </div>
            </div>

            {/* Inspector Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              
              {/* TAB: TRACE */}
              {activeTab === 'trace' && activeStep && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Trace Graph Section */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                      Decision Trace Graph
                    </h3>
                    <TraceGraph step={activeStep} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Reasoning Console */}
                    <div className="bg-slate-900 text-slate-200 p-5 rounded-xl font-mono text-sm shadow-inner flex flex-col">
                      <div className="flex items-center gap-2 mb-3 text-brand-400 border-b border-slate-700 pb-2">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         <span className="font-bold">Agent Trace Logs</span>
                      </div>
                      <div className="space-y-2 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                        {activeStep.traceThoughts ? (
                          activeStep.traceThoughts.map((log, i) => (
                            <div key={i} className="flex gap-3">
                              <span className="text-slate-500 select-none">{`>`}</span>
                              <span className="text-slate-300">{log}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-500 italic">Reading trace logs...</div>
                        )}
                        <div className="flex gap-3 animate-pulse">
                           <span className="text-brand-500">{`>`}</span>
                           <span className="w-2 h-4 bg-brand-500 block"></span>
                        </div>
                      </div>
                    </div>

                    {/* Reasoning Text */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <h4 className="font-bold text-gray-700 mb-2">Strategic Reasoning</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {activeStep.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CODE & DATA */}
              {activeTab === 'code' && activeStep && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Affected Columns */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                       <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                       Affected Columns
                    </h4>
                    <div className="flex flex-wrap gap-2">
                       {activeStep.affectedColumns && activeStep.affectedColumns.length > 0 ? (
                         activeStep.affectedColumns.map((col, i) => (
                           <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-xs font-medium">
                             {col}
                           </span>
                         ))
                       ) : (
                         <span className="text-gray-400 italic text-sm">No specific columns modified in this step.</span>
                       )}
                    </div>
                  </div>

                  {/* Python Code */}
                  <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700">
                    <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono">step_execution.py</span>
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                      </div>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <pre className="text-sm font-mono text-blue-300">
                        <code>{activeStep.pythonCode}</code>
                      </pre>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB: GLOBAL STATS */}
              {activeTab === 'stats' && (
                <div className="space-y-6 animate-fade-in h-full">
                  <div className="grid grid-cols-3 gap-4">
                     <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                       <div className="text-sm text-gray-500 mb-1">Current Quality Score</div>
                       <div className="text-3xl font-bold text-brand-600">
                         {chartData[selectedStepIndex + 1]?.score || chartData[chartData.length-1].score}%
                       </div>
                     </div>
                     <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                       <div className="text-sm text-gray-500 mb-1">Steps Planned</div>
                       <div className="text-3xl font-bold text-gray-800">{steps.length}</div>
                     </div>
                     <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                       <div className="text-sm text-gray-500 mb-1">Processing</div>
                       <div className="text-3xl font-bold text-green-600">Active</div>
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 min-h-[400px]">
                    <h3 className="text-sm font-semibold text-gray-700 mb-6">Data Quality Improvement Trend</h3>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                          <Tooltip 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#0ea5e9" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorScore)" 
                            isAnimationActive={true}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
