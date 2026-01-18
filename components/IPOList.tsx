import React, { useState } from 'react';
import { IPOData, IPOStatus } from '../types';
import { IPODetailsModal } from './IPODetailsModal';

interface IPOListProps {
  ipos: IPOData[];
  loading: boolean;
}

export const IPOList: React.FC<IPOListProps> = ({ ipos, loading }) => {
  const [selectedIPO, setSelectedIPO] = useState<IPOData | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-slate-800 rounded-xl border border-slate-700"></div>
        ))}
      </div>
    );
  }

  if (ipos.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
        <p className="text-slate-400 text-lg">No active or upcoming IPOs found at this moment.</p>
      </div>
    );
  }

  const getStatusColor = (status: IPOStatus) => {
    switch (status) {
      case IPOStatus.OPEN: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case IPOStatus.COMING_SOON: return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case IPOStatus.CLOSED: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getShareTypeStyle = (type: string = '') => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('foreign') || lowerType.includes('employment')) {
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
    if (lowerType.includes('local') || lowerType.includes('affected')) {
      return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    }
    if (lowerType.includes('mutual')) {
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
    return 'bg-slate-700/50 text-slate-300 border-slate-600';
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ipos.map((ipo, idx) => (
          <div key={idx} className="group relative bg-slate-850 rounded-xl border border-slate-700 overflow-hidden hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20 flex flex-col">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3v18h18v-2H5V3H3m4 14h2v-4H7v4m4 0h2V7h-2v10m4 0h2v-7h-2v7z"/></svg>
            </div>
            
            <div className="p-6 relative z-10 flex flex-col h-full">
              {/* Header Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${getStatusColor(ipo.status as IPOStatus)}`}>
                  {ipo.status.replace('_', ' ')}
                </span>
                <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${getShareTypeStyle(ipo.shareType)}`}>
                  {ipo.shareType || 'General Public'}
                </span>
              </div>

              <div className="mb-1 text-slate-500 text-xs font-mono tracking-wider">{ipo.sector}</div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                {ipo.companyName}
              </h3>
              
              <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-grow">
                {ipo.description}
              </p>

              <div className="space-y-3 mb-6 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Price</span>
                  <span className="text-slate-200 font-medium">NPR {ipo.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Units</span>
                  <span className="text-slate-200 font-medium">{ipo.units.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-700/50 pt-2 mt-2">
                  <span className="text-slate-500">Closes</span>
                  <span className="text-red-400 font-medium">{ipo.closingDate}</span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedIPO(ipo)}
                className="w-full py-2.5 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 mt-auto"
              >
                View Details 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedIPO && (
        <IPODetailsModal 
          ipo={selectedIPO} 
          onClose={() => setSelectedIPO(null)} 
        />
      )}
    </>
  );
};