import React, { useState } from 'react';
import { subscribeEmail } from '../services/supabase';

export const SubscriptionForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const result = await subscribeEmail(email);
      if (result.success) {
        setStatus('success');
        setMsg(result.message);
        setEmail('');
      } else {
        setStatus('error');
        setMsg(result.message);
      }
    } catch (err) {
      setStatus('error');
      setMsg("An unexpected error occurred.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-1 rounded-2xl shadow-2xl">
        <div className="bg-slate-950 rounded-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Never Miss an IPO</h3>
            <p className="text-slate-400 text-sm">
              Get instant alerts in your Gmail the second an IPO is filed or listed in Nepal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-lg leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                placeholder="you@gmail.com"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/50"
            >
              {status === 'loading' ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Activate Alerts'}
            </button>
          </form>

          {msg && (
            <div className={`mt-4 p-3 rounded-lg text-sm text-center ${status === 'success' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
              {msg}
            </div>
          )}
          
          <p className="mt-4 text-xs text-center text-slate-600">
            By subscribing, you agree to receive real-time IPO updates via our secure Supabase backend.
          </p>
        </div>
      </div>
    </div>
  );
};