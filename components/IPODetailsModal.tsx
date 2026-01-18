import React from 'react';
import { IPOData } from '../types';

interface IPODetailsModalProps {
  ipo: IPOData;
  onClose: () => void;
}

export const IPODetailsModal: React.FC<IPODetailsModalProps> = ({ ipo, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-[fadeIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex flex-col gap-4 bg-slate-800/50">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                 <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30 px-2 py-0.5 rounded bg-emerald-500/10">
                  {ipo.sector}
                </span>
                <span className="text-purple-400 text-xs font-bold uppercase tracking-wider border border-purple-500/30 px-2 py-0.5 rounded bg-purple-500/10">
                  For: {ipo.shareType || 'General Public'}
                </span>
                {ipo.rating && (
                  <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider border border-yellow-500/30 px-2 py-0.5 rounded bg-yellow-500/10">
                    {ipo.rating}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white leading-tight">{ipo.companyName}</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          
          {/* Key Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
              <p className="text-slate-500 text-xs uppercase mb-1">Price</p>
              <p className="text-white font-bold">Rs. {ipo.price}</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
              <p className="text-slate-500 text-xs uppercase mb-1">Total Units</p>
              <p className="text-white font-bold">{(ipo.units / 100000).toFixed(1)} Lakhs</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
              <p className="text-slate-500 text-xs uppercase mb-1">Min Units</p>
              <p className="text-emerald-400 font-bold">{ipo.minUnits || 10}</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
              <p className="text-slate-500 text-xs uppercase mb-1">Max Units</p>
              <p className="text-white font-bold">{ipo.maxUnits ? ipo.maxUnits.toLocaleString() : 'N/A'}</p>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              Project Background
            </h3>
            <p className="text-slate-300 leading-relaxed text-sm">
              {ipo.projectDescription || ipo.description || "No specific project background available currently."}
            </p>
          </div>

          {/* Risks */}
          {ipo.risks && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Risk Factors
              </h3>
              <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-4">
                <p className="text-red-200/80 text-sm leading-relaxed">
                  {ipo.risks}
                </p>
              </div>
            </div>
          )}

          {/* Dates Timeline */}
          <div className="space-y-3">
             <h3 className="text-lg font-semibold text-white">Subscription Period</h3>
             <div className="flex items-center gap-4 text-sm">
                <div className="flex-1 bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-500 block text-xs">Opening</span>
                  <span className="text-white font-medium">{ipo.openingDate}</span>
                </div>
                <div className="text-slate-600">to</div>
                <div className="flex-1 bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-500 block text-xs">Closing</span>
                  <span className="text-red-400 font-medium">{ipo.closingDate}</span>
                </div>
             </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors">
            Close
          </button>
          <a 
            href={`https://meroshare.cdsc.com.np`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors text-center shadow-lg shadow-emerald-900/30"
          >
            Apply on MeroShare
          </a>
        </div>

      </div>
    </div>
  );
};