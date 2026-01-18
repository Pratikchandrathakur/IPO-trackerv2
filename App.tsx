import React, { useEffect, useState } from 'react';
import { IPOList } from './components/IPOList';
import { SubscriptionForm } from './components/SubscriptionForm';
import { fetchLiveIPOData } from './services/gemini';
import { fetchSavedIPOs, saveIPOsToDb } from './services/supabase';
import { IPOData, ScanResult } from './types';

export default function App() {
  const [ipos, setIpos] = useState<IPOData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('Loading...');
  const [marketSummary, setMarketSummary] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // Initial load: Prefer Database data (Fast & Reliable)
  useEffect(() => {
    loadFromDatabase();
  }, []);

  const loadFromDatabase = async () => {
    try {
      setLoading(true);
      const savedIPOs = await fetchSavedIPOs();
      if (savedIPOs.length > 0) {
        setIpos(savedIPOs);
        setLastUpdated('From Database');
        setMarketSummary('Showing cached data. Click "Scan Market" for live updates.');
      } else {
        // If DB empty, auto-scan
        handleRefresh();
      }
    } catch (e) {
      console.error("DB Load Error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLoading(true); // Show loading state during scan
    setNotification(null);

    try {
      // 1. Scan Live Data
      const result: ScanResult = await fetchLiveIPOData();
      
      // 2. Persist to Supabase (Robustness: Save history)
      const hasNewItems = await saveIPOsToDb(result.ipos);

      // 3. Re-fetch from DB to ensure we show the merged/deduplicated list
      // This fixes the "missing data" issue by keeping old valid records that Gemini might have missed momentarily
      const mergedIPOs = await fetchSavedIPOs();
      setIpos(mergedIPOs);
      
      setLastUpdated(result.lastUpdated);
      setMarketSummary(result.newsSummary);

      if (hasNewItems) {
        setNotification({ msg: "New IPOs detected! Sending alerts...", type: 'success' });
        // Trigger Email Notification (Serverless Function)
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ipos: result.ipos.filter(i => i.status === 'OPEN' || i.status === 'COMING_SOON') })
        });
        setNotification({ msg: "System updated & Alerts sent!", type: 'success' });
      }

    } catch (e) {
      console.error("Failed to fetch", e);
      setNotification({ msg: "Scan failed. Check internet or API keys.", type: 'error' });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const activeIPOs = ipos.filter(i => i.status === 'OPEN');
  const upcomingIPOs = ipos.filter(i => i.status === 'COMING_SOON');

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/30">
      
      {/* Header / Hero */}
      <header className="relative border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/50">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Nepal IPO Radar</h1>
              <p className="text-xs text-emerald-500 font-medium">Fullstack Live System</p>
            </div>
          </div>
          
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-sm font-medium transition-all border border-slate-700 ${isRefreshing ? 'opacity-70 cursor-wait' : ''}`}
          >
            <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {isRefreshing ? 'Scanning Market...' : 'Scan Market'}
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-24 right-4 z-50 px-6 py-3 rounded-lg shadow-2xl border ${notification.type === 'success' ? 'bg-emerald-900/90 border-emerald-500 text-white' : 'bg-red-900/90 border-red-500 text-white'} animate-[slideIn_0.3s_ease-out]`}>
          {notification.msg}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">

        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-800 text-emerald-400 text-xs font-medium uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Live • Database Sync Active
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            Track <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Nepal's IPOs</span> in Real-Time
          </h2>
          <p className="text-lg text-slate-400">
            A robust, fullstack solution. We verify sources, persist data to avoid loss, and alert you via verified Email channels.
          </p>

          {/* Market Summary from AI */}
          {marketSummary && (
             <div className="mt-8 p-4 bg-slate-900/80 border-l-4 border-emerald-500 rounded-r-lg text-left shadow-lg">
               <p className="text-sm text-slate-300 italic">" {marketSummary} "</p>
               <p className="text-xs text-slate-600 mt-2 font-mono text-right">Updated: {lastUpdated}</p>
             </div>
          )}
        </section>

        {/* Live IPOs */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
              Open for Subscription
            </h3>
            {activeIPOs.length > 0 && <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">{activeIPOs.length} Active</span>}
          </div>
          <IPOList ipos={activeIPOs} loading={loading} />
        </section>

        {/* Upcoming IPOs */}
        <section>
           <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
              Approved & Coming Soon
            </h3>
          </div>
          <IPOList ipos={upcomingIPOs} loading={loading} />
        </section>

        {/* Subscription Area */}
        <section className="relative py-12">
          <div className="absolute inset-0 bg-emerald-600/5 blur-3xl rounded-full pointer-events-none"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white">Get Alerts on Gmail</h3>
              <p className="text-slate-400 text-lg">
                Don't waste time refreshing news portals. Our system monitors SEBON approvals and MeroShare listings 24/7.
              </p>
              <ul className="space-y-4">
                {[
                  'Instant Email Notification via SMTP',
                  'Persistent Database (No Data Loss)',
                  'Targeted Alerts for Foreign Employment'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <SubscriptionForm />
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Nepal IPO Radar. Fullstack System deployed on Vercel.
          </p>
          <p className="text-slate-700 text-xs mt-2">
            Not financial advice. Invest responsibly.
          </p>
        </div>
      </footer>
    </div>
  );
}