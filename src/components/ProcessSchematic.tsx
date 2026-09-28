import React from 'react';
import { TelemetryPoint } from '../types/simulation';

interface ProcessSchematicProps {
  type: 'heat-exchanger' | 'level-vessel' | 'reactor' | 'valve-stiction' | 'flow-loop';
  telemetry: TelemetryPoint;
  stictionBand?: number;
  isSticking?: boolean;
}

export const ProcessSchematic: React.FC<ProcessSchematicProps> = ({
  type,
  telemetry,
  stictionBand = 0,
}) => {
  const { sp, pv, co, valveStem } = telemetry;
  const isSticking = stictionBand > 0 && Math.abs(co - valveStem) > 0.05 && Math.abs(co - valveStem) <= stictionBand;

  // 1. STEAM HEAT EXCHANGER SCHEMATIC (Figure 1 & Figure 39)
  if (type === 'heat-exchanger') {
    return (
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col items-center">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-xs">
          <span className="font-semibold text-slate-300">P&ID Process Schematic: Steam Heat Exchanger</span>
          <span className="text-slate-400 font-mono">TIC-101 / TT-101</span>
        </div>

        <svg viewBox="0 0 540 220" className="w-full max-w-[540px] h-auto text-slate-300">
          <defs>
            <linearGradient id="oilHeatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <linearGradient id="steamGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Process Pipe: Cold Oil to Hot Oil */}
          <line x1="20" y1="140" x2="180" y2="140" stroke="#38bdf8" strokeWidth="12" strokeLinecap="round" />
          <line x1="320" y1="140" x2="480" y2="140" stroke="url(#oilHeatGrad)" strokeWidth="12" strokeLinecap="round" />

          {/* Heat Exchanger Shell */}
          <rect x="180" y="80" width="140" height="100" rx="14" fill="#1e293b" stroke="#475569" strokeWidth="3" />
          {/* Internal Tube Bundle */}
          <path d="M 195 110 Q 250 95 305 110" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="4 2" />
          <path d="M 195 130 Q 250 145 305 130" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="4 2" />
          <path d="M 195 150 Q 250 135 305 150" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="4 2" />

          {/* Steam Supply Pipe (Top Inflow) */}
          <line x1="250" y1="20" x2="250" y2="80" stroke="#e2e8f0" strokeWidth="8" />

          {/* Steam Control Valve (FCV / TIC-101 actuator) */}
          <g transform="translate(250, 48)">
            {/* Valve Body */}
            <polygon points="-12,-8 0,0 -12,8" fill="#06b6d4" />
            <polygon points="12,-8 0,0 12,8" fill="#06b6d4" />
            {/* Actuator Diaphragm Dome */}
            <line x1="0" y1="0" x2="0" y2="-16" stroke="#94a3b8" strokeWidth="2" />
            <path d="M -14 -16 Q 0 -24 14 -16 Z" fill="#334155" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Valve stem opening readout */}
            <text x="18" y="-12" fill="#06b6d4" fontSize="10" fontFamily="monospace" fontWeight="bold">
              {co.toFixed(0)}%
            </text>
          </g>

          {/* Condensate Trap Outflow (Bottom) */}
          <line x1="250" y1="180" x2="250" y2="210" stroke="#64748b" strokeWidth="6" />
          <rect x="242" y="195" width="16" height="15" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
          <text x="264" y="206" fill="#94a3b8" fontSize="9">Trap [T]</text>

          {/* Temperature Transmitter TT-101 */}
          <circle cx="380" cy="140" r="14" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
          <text x="380" y="144" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">TT</text>
          <text x="380" y="120" fill="#64748b" fontSize="8" textAnchor="middle">101</text>

          {/* Controller Bubble TIC-101 */}
          <line x1="380" y1="126" x2="380" y2="50" stroke="#10b981" strokeDasharray="3 3" strokeWidth="1.5" />
          <line x1="380" y1="50" x2="270" y2="50" stroke="#06b6d4" strokeDasharray="3 3" strokeWidth="1.5" />
          <circle cx="380" cy="40" r="16" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
          <line x1="364" y1="40" x2="396" y2="40" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="380" y="34" fill="#f8fafc" fontSize="8" fontWeight="bold" textAnchor="middle">TIC</text>
          <text x="380" y="50" fill="#f8fafc" fontSize="8" textAnchor="middle">101</text>

          {/* Real-time live annotations */}
          <text x="30" y="125" fill="#38bdf8" fontSize="10" fontWeight="bold">Cold Feed (Load)</text>
          <text x="430" y="125" fill="#ef4444" fontSize="10" fontWeight="bold">Hot Product: {pv.toFixed(1)}°C</text>
          <text x="210" y="24" fill="#e2e8f0" fontSize="9">Steam Supply (Transient)</text>
        </svg>

        <div className="w-full grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px] text-center">
          <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
            <span className="text-amber-400 block font-semibold">SP Target</span>
            <span className="font-mono text-slate-200">{sp.toFixed(1)}%</span>
          </div>
          <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
            <span className="text-emerald-400 block font-semibold">PV Measured</span>
            <span className="font-mono text-slate-200">{pv.toFixed(1)}%</span>
          </div>
          <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
            <span className="text-cyan-400 block font-semibold">Steam Valve CO</span>
            <span className="font-mono text-slate-200">{co.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. LIQUID LEVEL VESSEL SCHEMATIC (Tight vs Surge Level, Figure 3, 37, 38)
  if (type === 'level-vessel') {
    const liquidHeight = Math.max(5, Math.min(130, (pv / 100) * 130));
    const liquidY = 170 - liquidHeight;

    return (
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col items-center">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-xs">
          <span className="font-semibold text-slate-300">P&ID Process Schematic: Liquid Vessel (Integrating Loop)</span>
          <span className="text-slate-400 font-mono">LIC-101 / LT-101</span>
        </div>

        <svg viewBox="0 0 540 220" className="w-full max-w-[540px] h-auto text-slate-300">
          <defs>
            <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <clipPath id="vesselClip">
              <rect x="210" y="40" width="120" height="130" rx="20" />
            </clipPath>
          </defs>

          {/* Inflow Pipe */}
          <line x1="80" y1="60" x2="210" y2="60" stroke="#38bdf8" strokeWidth="8" />
          <polygon points="190,56 205,60 190,64" fill="#38bdf8" />
          <text x="90" y="50" fill="#38bdf8" fontSize="10" fontWeight="bold">Inflow Streams</text>

          {/* Outflow Pipe */}
          <line x1="270" y1="170" x2="270" y2="200" stroke="#0284c7" strokeWidth="8" />
          <line x1="270" y1="200" x2="480" y2="200" stroke="#0284c7" strokeWidth="8" />
          <text x="380" y="190" fill="#0284c7" fontSize="10" fontWeight="bold">Liquid Outflow</text>

          {/* Outflow Control Valve (LIC-101 FCE) */}
          <g transform="translate(350, 200)">
            <polygon points="-12,-8 0,0 -12,8" fill="#06b6d4" />
            <polygon points="12,-8 0,0 12,8" fill="#06b6d4" />
            <line x1="0" y1="0" x2="0" y2="-14" stroke="#94a3b8" strokeWidth="2" />
            <path d="M -12 -14 Q 0 -22 12 -14 Z" fill="#334155" stroke="#06b6d4" strokeWidth="1.5" />
            <text x="16" y="-10" fill="#06b6d4" fontSize="10" fontFamily="monospace" fontWeight="bold">
              {co.toFixed(0)}%
            </text>
          </g>

          {/* Vessel Outline */}
          <rect x="210" y="40" width="120" height="130" rx="20" fill="#0f172a" stroke="#475569" strokeWidth="3" />

          {/* Liquid Mass Fill */}
          <g clipPath="url(#vesselClip)">
            <rect x="210" y={liquidY} width="120" height={liquidHeight} fill="url(#liquidGrad)" />
            {/* Animated liquid surface meniscus */}
            <ellipse cx="270" cy={liquidY} rx="60" ry="4" fill="#38bdf8" opacity="0.6" />
          </g>

          {/* Heating Steam Tubes for Tight Level coil protection (Figure 37) */}
          <path d="M 230 145 C 245 135 255 155 270 145 C 285 135 295 155 310 145" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          <text x="240" y="160" fill="#f59e0b" fontSize="8" opacity="0.8">Steam Coils</text>

          {/* Setpoint Reference Marker on Vessel */}
          <line
            x1="200"
            y1={170 - (sp / 100) * 130}
            x2="340"
            y2={170 - (sp / 100) * 130}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <text x="345" y={174 - (sp / 100) * 130} fill="#f59e0b" fontSize="9" fontWeight="bold">
            SP: {sp.toFixed(0)}%
          </text>

          {/* Level Transmitter LT-101 */}
          <line x1="330" y1="90" x2="360" y2="90" stroke="#94a3b8" strokeWidth="2" />
          <circle cx="375" cy="90" r="14" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
          <text x="375" y="94" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">LT</text>

          {/* LIC-101 Bubble */}
          <line x1="375" y1="76" x2="375" y2="40" stroke="#10b981" strokeDasharray="3 3" strokeWidth="1.5" />
          <circle cx="375" cy="30" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
          <line x1="361" y1="30" x2="389" y2="30" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="375" y="27" fill="#f8fafc" fontSize="8" fontWeight="bold" textAnchor="middle">LIC</text>
          <text x="375" y="38" fill="#f8fafc" fontSize="7" textAnchor="middle">101</text>
        </svg>

        <div className="w-full flex items-center justify-between text-xs px-2 pt-2 border-t border-slate-800 text-slate-400">
          <span>Integrating Rate: non-self-regulating</span>
          <span className="font-mono text-emerald-400 font-bold">Tank Level: {pv.toFixed(1)}%</span>
        </div>
      </div>
    );
  }

  // 3. EXOTHERMIC RUNAWAY REACTOR SCHEMATIC (Figure 4)
  if (type === 'reactor') {
    const isThermalRunaway = pv > 75;
    const reactorColor = isThermalRunaway ? '#ef4444' : (pv > 60 ? '#f59e0b' : '#10b981');

    return (
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col items-center">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-xs">
          <span className="font-semibold text-slate-300">P&ID Process Schematic: Exothermic Runaway Reactor</span>
          <span className="text-slate-400 font-mono">TIC-200 / TT-200</span>
        </div>

        <svg viewBox="0 0 540 220" className="w-full max-w-[540px] h-auto text-slate-300">
          {/* Reactor Cooling Jacket */}
          <rect x="200" y="55" width="140" height="120" rx="24" fill="#1e293b" stroke="#0284c7" strokeWidth="2.5" />

          {/* Reactor Inner Vessel */}
          <rect x="215" y="65" width="110" height="105" rx="16" fill="#0f172a" stroke={reactorColor} strokeWidth="2.5" />

          {/* Impeller / Agitator shaft and blades */}
          <line x1="270" y1="20" x2="270" y2="140" stroke="#94a3b8" strokeWidth="3" />
          <path d="M 250 140 L 290 140 M 250 135 L 250 145 M 290 135 L 290 145" stroke="#94a3b8" strokeWidth="3" />
          {/* Agitator Motor */}
          <rect x="258" y="10" width="24" height="18" fill="#334155" stroke="#64748b" rx="2" />
          <text x="270" y="22" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">M</text>

          {/* Cooling Oil Inflow */}
          <line x1="80" y1="85" x2="200" y2="85" stroke="#38bdf8" strokeWidth="6" />
          <text x="90" y="75" fill="#38bdf8" fontSize="9" fontWeight="bold">Cold Oil In</text>

          {/* TV-200 Cooling Valve */}
          <g transform="translate(140, 85)">
            <polygon points="-10,-6 0,0 -10,6" fill="#06b6d4" />
            <polygon points="10,-6 0,0 10,6" fill="#06b6d4" />
            <line x1="0" y1="0" x2="0" y2="-12" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M -10 -12 Q 0 -18 10 -12 Z" fill="#334155" stroke="#06b6d4" strokeWidth="1" />
            <text x="14" y="-8" fill="#06b6d4" fontSize="9" fontFamily="monospace">
              {co.toFixed(0)}%
            </text>
          </g>

          {/* Warm Oil Return Outflow */}
          <line x1="340" y1="150" x2="460" y2="150" stroke="#f59e0b" strokeWidth="6" />
          <text x="370" y="142" fill="#f59e0b" fontSize="9" fontWeight="bold">Warm Oil Return</text>

          {/* Catalyst Feed Line (Top) */}
          <line x1="235" y1="20" x2="235" y2="65" stroke="#a855f7" strokeWidth="5" />
          <text x="200" y="15" fill="#c084fc" fontSize="8" fontWeight="bold">Catalyst + Feed</text>

          {/* Temperature Sensor TT-200 */}
          <line x1="325" y1="100" x2="370" y2="100" stroke="#94a3b8" strokeWidth="2" />
          <circle cx="385" cy="100" r="14" fill="#0f172a" stroke={reactorColor} strokeWidth="2" />
          <text x="385" y="104" fill={reactorColor} fontSize="8" fontWeight="bold" textAnchor="middle">TT-200</text>

          {/* Runaway Status Banner inside SVG */}
          {isThermalRunaway && (
            <g transform="translate(270, 100)">
              <rect x="-65" y="-12" width="130" height="24" rx="4" fill="#991b1b" stroke="#f87171" strokeWidth="1.5" />
              <text x="0" y="4" fill="#fee2e2" fontSize="10" fontWeight="bold" textAnchor="middle" className="animate-pulse">
                THERMAL RUNAWAY!
              </text>
            </g>
          )}
        </svg>

        <div className="w-full flex items-center justify-between text-xs px-2 pt-2 border-t border-slate-800 text-slate-400">
          <span className="text-rose-400">Exothermic Reaction Rate accelerates with Temp!</span>
          <span className="font-mono text-emerald-400 font-bold">Temp: {pv.toFixed(1)}°C</span>
        </div>
      </div>
    );
  }

  // 4. VALVE STICTION CUTAWAY SCHEMATIC (Figure 7 & Figure 8)
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col items-center">
      <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-xs">
        <span className="font-semibold text-slate-300">Diagnostic Inspection: Valve Stem Packing Friction & Stiction</span>
        <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
          isSticking
            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
        }`}>
          {isSticking ? 'STEM STUCK (STATIC FRICTION)' : 'STEM SLIPPING / FREE'}
        </span>
      </div>

      <svg viewBox="0 0 540 210" className="w-full max-w-[540px] h-auto text-slate-300">
        {/* Actuator Diaphragm Upper Chamber */}
        <path d="M 210 50 Q 270 20 330 50 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
        <line x1="210" y1="50" x2="330" y2="50" stroke="#475569" strokeWidth="2" />
        <text x="270" y="42" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">
          Air Diaphragm (CO: {co.toFixed(1)}%)
        </text>

        {/* Return Spring */}
        <path d="M 260 55 L 280 62 L 260 69 L 280 76 L 260 83 L 280 90 L 270 95" fill="none" stroke="#64748b" strokeWidth="2" />

        {/* Valve Stem (Vertical rod) */}
        <line x1="270" y1="45" x2="270" y2="175" stroke="#f8fafc" strokeWidth="5" />

        {/* Packing Gland Box (Causes Stiction!) */}
        <rect x="250" y="100" width="40" height="35" rx="3" fill="#334155" stroke={isSticking ? '#f43f5e' : '#64748b'} strokeWidth="2" />
        {/* Packing Material Shading */}
        <line x1="252" y1="106" x2="266" y2="106" stroke="#fb923c" strokeWidth="2" />
        <line x1="274" y1="106" x2="288" y2="106" stroke="#fb923c" strokeWidth="2" />
        <line x1="252" y1="117" x2="266" y2="117" stroke="#fb923c" strokeWidth="2" />
        <line x1="274" y1="117" x2="288" y2="117" stroke="#fb923c" strokeWidth="2" />
        <line x1="252" y1="128" x2="266" y2="128" stroke="#fb923c" strokeWidth="2" />
        <line x1="274" y1="128" x2="288" y2="128" stroke="#fb923c" strokeWidth="2" />
        <text x="175" y="120" fill="#fb923c" fontSize="9" fontWeight="bold">Packing Gland Friction</text>
        <line x1="240" y1="118" x2="249" y2="118" stroke="#fb923c" strokeWidth="1.5" markerEnd="url(#arrow)" />

        {/* Valve Body & Plug */}
        <polygon points="210,165 270,180 210,195" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        <polygon points="330,165 270,180 330,195" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        {/* Valve Plug Contoured Head */}
        <polygon points="262,175 278,175 270,186" fill="#06b6d4" />

        {/* Live Indicator Gauges */}
        <g transform="translate(360, 80)">
          <rect x="0" y="0" width="140" height="70" rx="6" fill="#0f172a" stroke="#334155" />
          <text x="12" y="20" fill="#64748b" fontSize="10">Controller CO:</text>
          <text x="125" y="20" fill="#06b6d4" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="end">
            {co.toFixed(1)}%
          </text>
          <text x="12" y="40" fill="#64748b" fontSize="10">Actual Stem:</text>
          <text x="125" y="40" fill="#fb923c" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="end">
            {valveStem.toFixed(1)}%
          </text>
          <text x="12" y="60" fill="#64748b" fontSize="10">Hysteresis Lag:</text>
          <text x="125" y="60" fill={isSticking ? '#f43f5e' : '#10b981'} fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="end">
            {Math.abs(co - valveStem).toFixed(1)}%
          </text>
        </g>
      </svg>

      <div className="w-full text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800 flex justify-between">
        <span>Stiction Deadband: <strong className="text-amber-400">{stictionBand.toFixed(1)}%</strong></span>
        <span>Causes saw tooth CO pattern & limit-cycle hunting</span>
      </div>
    </div>
  );
};
