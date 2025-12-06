
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-scale-in border border-white/20">
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 backdrop-blur rounded-t-2xl">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export const AboutModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="About ProcessumAir">
      <div className="flex flex-col items-center text-center space-y-8">
        
        {/* Profile / Brand Section */}
        <div className="relative group">
           <div className="absolute inset-0 bg-brand-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
           <div className="relative w-24 h-24 bg-gradient-to-br from-brand-50 to-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <span className="text-3xl">👨‍💻</span>
           </div>
        </div>

        <div>
          <h4 className="text-2xl font-bold text-gray-900 mb-1">Umair Saad</h4>
          <p className="text-brand-600 font-medium tracking-wide text-sm uppercase">Lead Developer & Architect</p>
        </div>

        {/* Mission Card */}
        <div className="bg-brand-50/50 p-8 rounded-2xl border border-brand-100 max-w-xl">
           <h5 className="font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
             <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             Mission & Vision
           </h5>
           <p className="text-gray-600 leading-relaxed">
             "To democratize data engineering by building autonomous agents that can reason, clean, and optimize datasets instantly. ProcessumAir bridges the gap between raw data and actionable machine learning insights."
           </p>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
           <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
             <div className="text-2xl font-bold text-gray-800 mb-1">ADK</div>
             <div className="text-xs text-gray-500 uppercase">Python Core</div>
           </div>
           <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
             <div className="text-2xl font-bold text-gray-800 mb-1">A2A</div>
             <div className="text-xs text-gray-500 uppercase">Agent Comms</div>
           </div>
           <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
             <div className="text-2xl font-bold text-gray-800 mb-1">Gemini</div>
             <div className="text-xs text-gray-500 uppercase">Powered By</div>
           </div>
        </div>
      </div>
    </Modal>
  );
};

export const DocsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const sections = [
    {
      title: "How it Works",
      icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
      content: "ProcessumAir uses a multi-step agentic loop. 1) It analyzes your raw CSV/Excel. 2) It plans a cleaning strategy based on your goal. 3) It simulates execution, providing Python code for every step. 4) It validates the result."
    },
    {
      title: "Understanding Traces",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      content: "The 'Trace' feature in the dashboard reveals the Agent's internal thought process. You can see the 'Input -> Reasoning -> Decision' graph for every action, ensuring transparency in how your data is modified."
    },
    {
      title: "Data Limits",
      icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
      content: "Currently, ProcessumAir runs entirely in your browser for privacy. It supports datasets up to 100,000 rows. Larger files are automatically truncated to this limit to ensure performance."
    }
  ];

  const faqs = [
    { q: "Is my data uploaded to a server?", a: "The data parsing happens locally in your browser. Only statistical summaries (metadata) are sent to the AI model to generate code. Your raw rows remain private." },
    { q: "Can I use the output code?", a: "Yes! The final report includes a full, reproducible Python script compatible with pandas and scikit-learn." }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Documentation & Guide">
      <div className="space-y-10">
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((s, i) => (
             <div key={i} className="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:border-brand-200 transition-colors">
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mb-4 text-brand-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{s.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
             </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="bg-brand-100 text-brand-700 text-xs px-2 py-1 rounded">FAQ</span>
            Frequently Asked Questions
          </h4>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                <h5 className="font-medium text-gray-800 mb-2">Q: {f.q}</h5>
                <p className="text-gray-500 text-sm">A: {f.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Modal>
  );
};
