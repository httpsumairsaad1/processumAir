
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { AgentStep, DatasetSummary } from '../types';
import { jsPDF } from 'jspdf';
import { cleanAndExportData } from '../utils/csv';

interface ReportViewProps {
  report: string;
  steps: AgentStep[];
  goal: string;
  datasetSummary: DatasetSummary | null;
  onBack: () => void;
  fileName: string;
}

export const ReportView: React.FC<ReportViewProps> = ({ 
  report, 
  steps, 
  goal,
  datasetSummary,
  onBack,
  fileName
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const downloadScript = () => {
    const header = `import pandas as pd\nimport numpy as np\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\n\n# ProcessumAir Generated Script\n# Goal: ${goal}\n# Load Data (Replace with your path)\ndf = pd.read_csv('your_dataset.csv')\n\n`;
    const code = steps.map(s => `# Step: ${s.title}\n# ${s.reasoning}\n${s.pythonCode}\n`).join('\n');
    const fullScript = header + code + `\nprint("Data Processing Complete. Shape:", df.shape)`;
    
    const blob = new Blob([fullScript], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'processum_pipeline.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Brand Colors
    const brandBlue = [14, 165, 233] as [number, number, number]; // #0ea5e9
    const navyBg = [15, 23, 42] as [number, number, number]; // slate-900
    const gold = [212, 175, 55] as [number, number, number]; // Gold
    const grayText = [71, 85, 105] as [number, number, number]; // slate-600
    
    const certId = `PA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    let y = 0;

    // --- HELPER: Draw Logo ---
    const drawLogo = (x: number, y: number) => {
        doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
        doc.roundedRect(x, y, 8, 8, 1, 1, 'F');
        doc.rect(x + 3, y - 3, 2, 3, 'F');
        doc.setFillColor(255, 255, 255);
        doc.circle(x + 4, y + 5, 1, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text("processum", x + 12, y + 6);
        doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
        doc.text("air", x + 44, y + 6);
    };

    // --- HELPER: Certified Stamp ---
    const drawCertifiedStamp = (x: number, y: number) => {
        const goldColor = [212, 175, 55] as [number, number, number];
        const blackColor = [20, 20, 20] as [number, number, number];
        const cx = x;
        const cy = y;

        // 1. Scalloped Edge (Simulated with circle ring)
        doc.setFillColor(...goldColor);
        doc.circle(cx, cy, 14, 'F'); // Base
        
        // Draw decorative bumps around edge
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * 2 * Math.PI;
            const r = 14;
            doc.circle(cx + r * Math.cos(angle), cy + r * Math.sin(angle), 1.5, 'F');
        }

        // 2. Inner Black Circle
        doc.setFillColor(...blackColor);
        doc.circle(cx, cy, 12.5, 'F');

        // 3. Inner Gold Rings
        doc.setDrawColor(...goldColor);
        doc.setLineWidth(0.4);
        doc.circle(cx, cy, 11, 'S');
        doc.setLineWidth(0.2);
        doc.circle(cx, cy, 11.5, 'S');

        // 4. Stars (Top and Bottom)
        doc.setFillColor(...goldColor);
        // Top 3
        doc.circle(cx, cy - 6.5, 0.8, 'F'); 
        doc.circle(cx - 3.5, cy - 5, 0.6, 'F');
        doc.circle(cx + 3.5, cy - 5, 0.6, 'F');
        // Bottom 3
        doc.circle(cx, cy + 6.5, 0.8, 'F'); 
        doc.circle(cx - 3.5, cy + 5, 0.6, 'F');
        doc.circle(cx + 3.5, cy + 5, 0.6, 'F');

        // 5. Central Banner
        doc.setFillColor(...goldColor);
        // Draw banner rect
        doc.roundedRect(cx - 12, cy - 3.5, 24, 7, 1, 1, 'F');
        
        // 6. "CERTIFIED" Text
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...blackColor);
        // Center text alignment calculation roughly
        doc.text("CERTIFIED", cx, cy, { align: 'center', baseline: 'middle' });
    };

    // --- HEADER (Navy Strip) ---
    doc.setFillColor(navyBg[0], navyBg[1], navyBg[2]);
    doc.rect(0, 0, pageWidth, 35, 'F');
    drawLogo(margin, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`REPORT ID: ${certId}`, pageWidth - margin, 14, { align: 'right' });
    doc.text(`DATE: ${reportDate}`, pageWidth - margin, 19, { align: 'right' });

    y = 45;

    // --- TITLE SECTION ---
    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.setTextColor(navyBg[0], navyBg[1], navyBg[2]);
    doc.text("Executive Data Audit Report", margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text(`Project Goal: ${goal}`, margin, y);
    y += 10;

    // --- DATA VITAL SIGNS (Scorecard) ---
    const boxW = contentWidth / 3;
    const boxH = 18;
    
    // Draw Box Background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, boxH, 'FD');
    
    // Dividers
    doc.line(margin + boxW, y, margin + boxW, y + boxH);
    doc.line(margin + (boxW * 2), y, margin + (boxW * 2), y + boxH);

    // Box 1: File
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(navyBg[0], navyBg[1], navyBg[2]);
    doc.text(fileName.length > 20 ? fileName.substring(0,20)+'...' : fileName, margin + 4, y + 7);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("SOURCE FILE", margin + 4, y + 13);

    // Box 2: Dimensions
    const rowCount = datasetSummary?.rowCount?.toLocaleString() || "0";
    const colCount = datasetSummary?.columns?.length || 0;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(navyBg[0], navyBg[1], navyBg[2]);
    doc.text(`${rowCount} Rows / ${colCount} Cols`, margin + boxW + 4, y + 7);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("DATASET DIMENSIONS", margin + boxW + 4, y + 13);

    // Box 3: Pipeline Steps
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(navyBg[0], navyBg[1], navyBg[2]);
    doc.text(`${steps.length} Optimization Steps`, margin + (boxW * 2) + 4, y + 7);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("PIPELINE COMPLEXITY", margin + (boxW * 2) + 4, y + 13);

    y += 25;

    // --- EXECUTIVE SUMMARY ---
    // Background for summary box (reduced height for shorter text)
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(navyBg[0], navyBg[1], navyBg[2]);
    doc.text("EXECUTIVE SUMMARY", margin + 5, y + 8);
    
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    
    const cleanReport = report ? report.replace(/[#*]/g, '') : "No summary available.";
    const summaryLines = doc.splitTextToSize(cleanReport, contentWidth - 45); // Leave ample room for Stamp
    doc.text(summaryLines, margin + 5, y + 16);
    
    // Stamp (Positioned within the summary box area, slightly offset)
    drawCertifiedStamp(pageWidth - margin - 20, y + 19);

    y += 48; // Reduced spacing to keep content tight

    // --- AUDIT LOG TABLE ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(navyBg[0], navyBg[1], navyBg[2]);
    doc.text("Pipeline Execution Log", margin, y);
    y += 6;

    // Table Header
    doc.setFillColor(navyBg[0], navyBg[1], navyBg[2]);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("#", margin + 2, y + 5);
    doc.text("OPERATION", margin + 12, y + 5);
    doc.text("ACTION DETAILS", margin + 50, y + 5);
    doc.text("IMPACT", pageWidth - margin - 20, y + 5, { align: 'right' });
    
    y += 8;

    // Table Rows
    doc.setFont("helvetica", "normal");
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    
    steps.forEach((step, idx) => {
        if (y > pageHeight - 20) {
            doc.addPage();
            y = margin;
            // Draw simple header for subsequent pages
            doc.setFillColor(navyBg[0], navyBg[1], navyBg[2]);
            doc.rect(margin, y, contentWidth, 8, 'F');
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.text("#", margin + 2, y + 5);
            doc.text("OPERATION", margin + 12, y + 5);
            doc.text("DETAILS", margin + 50, y + 5);
            y += 8;
            doc.setFont("helvetica", "normal");
            doc.setTextColor(grayText[0], grayText[1], grayText[2]);
        }

        const bg = idx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
        doc.setFillColor(bg[0], bg[1], bg[2]);
        doc.rect(margin, y, contentWidth, 12, 'F');

        // Step ID
        doc.setFontSize(8);
        doc.text(String(idx + 1).padStart(2, '0'), margin + 2, y + 7);
        
        // Type Badge Text
        doc.setFont("helvetica", "bold");
        doc.text(step.type, margin + 12, y + 7);

        // Details
        doc.setFont("helvetica", "normal");
        // Truncate title if too long
        const title = step.title.length > 50 ? step.title.substring(0, 50) + "..." : step.title;
        doc.text(title, margin + 50, y + 7);
        
        // Impact Score
        const score = step.qualityScoreImpact || 5;
        const scoreColor = score > 10 ? [22, 163, 74] : [71, 85, 105];
        doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]); // Green for high impact
        doc.text(`+${score} pts`, pageWidth - margin - 20, y + 7, { align: 'right' });
        doc.setTextColor(grayText[0], grayText[1], grayText[2]);

        // Line divider
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y + 12, pageWidth - margin, y + 12);
        
        y += 12;
    });

    // --- FOOTER ---
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`ProcessumAir Autonomous Agent - Page ${i} of ${pageCount}`, margin, pageHeight - 10);
    }

    doc.save(`ProcessumAir_Audit_${certId}.pdf`);
  };

  const handleDownloadData = () => {
    if (!datasetSummary) return;
    setIsExporting(true);
    // Use timeout to allow UI to update to "processing" state
    setTimeout(() => {
        try {
            cleanAndExportData(steps, datasetSummary);
        } catch (e) {
            console.error("Export failed", e);
        }
        setIsExporting(false);
    }, 500);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-gray-500 hover:text-brand-600 transition-colors font-medium text-sm bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        
        <span className="text-sm font-mono text-gray-400">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Actions & Brief */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Downloads</h3>
            <div className="space-y-3">
              <button 
                onClick={downloadPDF}
                className="w-full flex items-center justify-between p-4 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 group"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="font-semibold">Executive Audit Report</span>
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">↓</span>
              </button>

              <button 
                onClick={handleDownloadData}
                disabled={isExporting}
                className="w-full flex items-center justify-between p-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  {isExporting ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  )}
                  <span className="font-semibold">{isExporting ? 'Processing...' : 'Cleaned Data (Excel)'}</span>
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">↓</span>
              </button>

              <button 
                onClick={downloadScript}
                className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-100 text-gray-700 rounded-xl hover:border-brand-200 hover:text-brand-600 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                  <span className="font-semibold">Python Script</span>
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">↓</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-2 mb-4 text-brand-300">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <h3 className="font-bold tracking-wide text-sm uppercase">Quick Summary</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              ProcessumAir has processed {datasetSummary?.rowCount.toLocaleString()} rows. 
              The pipeline executed {steps.length} steps to transform the raw data into a model-ready format. 
              Download the Excel file to use the data immediately.
            </p>
          </div>
        </div>

        {/* Right Col: Short On-Screen Report */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="ml-2 text-sm text-gray-400 font-mono">executive_summary.md</span>
             </div>
             <div className="p-8 prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-brand-700 prose-h2:text-xl prose-p:text-gray-600">
                <ReactMarkdown>{report}</ReactMarkdown>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};
