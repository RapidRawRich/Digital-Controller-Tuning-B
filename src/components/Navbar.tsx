import React from 'react';
import { Activity, Gauge, Sliders, Radio, Compass, Award, BookOpen, Cpu, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isRunning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  isRunning,
}) => {
  const tabs = [
    { id: 'lab1', label: 'Lab 1: Process Types & Valves', icon: Activity },
    { id: 'lab2', label: 'Lab 2: Robustness & Bounds', icon: Gauge },
    { id: 'lab3', label: 'Lab 3: Open-Loop FODT Tuning', icon: Compass },
    { id: 'lab4', label: 'Lab 4: Closed-Loop & Relay', icon: Radio },
    { id: 'lab5', label: 'Lab 5: Industrial Archetypes', icon: Sliders },
    { id: 'quiz', label: 'Self-Test Quiz (13 Qs)', icon: Award },
    { id: 'handbook', label: 'Reference Handbook', icon: BookOpen },
  ];

  return (
    <header className="w-full bg-slate-950 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      {/* Top SCADA Branding Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                ILM 310305dB
              </span>
              <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight">
                Digital Controller Tuning
              </h1>
              <span className="hidden md:inline-block text-[11px] text-slate-400 font-medium">
                • Third Period Process Control
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Interactive DCS / SCADA Learning Simulator & Self-Test Lab
            </p>
          </div>
        </div>

        {/* System Telemetry & GitHub info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-slate-400 hidden sm:inline">DCS ENGINE:</span>
            <span className={isRunning ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>
              {isRunning ? '60 FPS RUNNING' : 'PAUSED'}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Industrial Control Architecture</span>
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-900 pt-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg flex items-center gap-2 border-t-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-cyan-400 bg-slate-900 text-cyan-300 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
