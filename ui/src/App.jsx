import React, { useEffect, useState } from 'react';
import { Activity, Shield, Brain, Clock, ArrowRight, AlertTriangle, Monitor, RotateCcw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [status, setStatus] = useState({ status: 'offline', current_state: 'Unknown', current_window: 'None' });
  const [drifts, setDrifts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const statusRes = await fetch('http://localhost:8000/api/status');
      if (statusRes.ok) {
        setStatus(await statusRes.json());
      }
      
      const driftsRes = await fetch('http://localhost:8000/api/drifts');
      if (driftsRes.ok) {
        setDrifts(await driftsRes.json());
      }
    } catch (e) {
      console.error("API not reachable", e);
      setStatus({ status: 'offline', current_state: 'Disconnected', current_window: 'None' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Mock data for the activity chart
  const chartData = [
    { time: '10:00', productivity: 90 },
    { time: '10:30', productivity: 85 },
    { time: '11:00', productivity: 30 },
    { time: '11:30', productivity: 10 },
    { time: '12:00', productivity: 95 },
  ];

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto font-sans">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
            <Brain className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">
              NeuroLock
            </h1>
            <p className="text-slate-400 text-sm font-medium">Attention & Drift Guardian</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900/50 px-5 py-2.5 rounded-full border border-slate-800">
          <div className={`w-3 h-3 rounded-full animate-pulse ${status.status === 'running' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-rose-500'}`}></div>
          <span className="text-sm font-medium text-slate-300">
            {status.status === 'running' ? 'System Active' : 'System Offline'}
          </span>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Current Status */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-indigo-500/20"></div>
            
            <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" /> Live Telemetry
            </h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-400 mb-1">Current State</p>
                <div className="flex items-center gap-3">
                  {status.current_state === 'Productive' && <Shield className="w-6 h-6 text-emerald-400" />}
                  {status.current_state === 'Non-Productive' && <Clock className="w-6 h-6 text-amber-400" />}
                  {status.current_state === 'Doom Scrolling' && <AlertTriangle className="w-6 h-6 text-rose-500 animate-bounce" />}
                  {status.current_state === 'Neutral' && <Monitor className="w-6 h-6 text-slate-400" />}
                  <span className={`text-xl font-bold ${
                    status.current_state === 'Productive' ? 'text-emerald-400' :
                    status.current_state === 'Doom Scrolling' ? 'text-rose-500' :
                    status.current_state === 'Non-Productive' ? 'text-amber-400' : 'text-slate-200'
                  }`}>
                    {status.current_state}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-slate-400 mb-1">Active Window</p>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 break-words">
                  <p className="text-sm text-slate-300 font-mono truncate">{status.current_window || 'Waiting for data...'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" /> Focus Trend
            </h2>
            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}/>
                  <Area type="monotone" dataKey="productivity" stroke="#818cf8" fillOpacity={1} fill="url(#colorProd)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column - Drift Logs */}
        <div className="lg:col-span-2">
          <div className="glass-card p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-3">
                <RotateCcw className="w-6 h-6 text-amber-400" /> Drift Events
              </h2>
              <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-medium border border-slate-700">
                Today
              </span>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
              </div>
            ) : drifts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <CheckCircle className="w-16 h-16 mb-4 text-emerald-500/50" />
                <p className="text-lg font-medium">No drifts detected today.</p>
                <p className="text-sm">You've been perfectly focused!</p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {drifts.map((drift) => (
                  <div key={drift.id} className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md">
                        {new Date(drift.detected_time).toLocaleTimeString()}
                      </span>
                      {drift.is_doom_scrolling && (
                        <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3" /> Doom Scrolling Prevented
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex-1 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-center">
                        <p className="text-xs text-emerald-400/80 uppercase font-bold tracking-wider mb-1">Productive</p>
                        <p className="font-semibold text-emerald-100">{drift.from_app}</p>
                        <p className="text-xs text-emerald-300/60 truncate mt-1 w-full" title={drift.from_title}>{drift.from_title}</p>
                      </div>
                      
                      <div className="flex-shrink-0 text-slate-500 group-hover:text-indigo-400 transition-colors">
                        <ArrowRight className="w-6 h-6" />
                      </div>
                      
                      <div className={`flex-1 p-4 rounded-xl border text-center ${drift.is_doom_scrolling ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                        <p className={`text-xs uppercase font-bold tracking-wider mb-1 ${drift.is_doom_scrolling ? 'text-rose-400/80' : 'text-amber-400/80'}`}>Distraction</p>
                        <p className={`font-semibold ${drift.is_doom_scrolling ? 'text-rose-100' : 'text-amber-100'}`}>{drift.to_app}</p>
                        <p className={`text-xs truncate mt-1 w-full ${drift.is_doom_scrolling ? 'text-rose-300/60' : 'text-amber-300/60'}`} title={drift.to_title}>{drift.to_title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// CheckCircle missing import fix locally
const CheckCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default App;
