import React from 'react';

interface QuizFigureProps {
  type: 'fig40' | 'fig41' | 'fig42' | 'fig43' | 'fig44';
}

export const QuizFigure: React.FC<QuizFigureProps> = ({ type }) => {
  // Figure 40: Two Bump Tests (Left: Valve Stiction, Right: Integrating)
  if (type === 'fig40') {
    return (
      <div className="w-full bg-slate-950 p-3 rounded-lg border border-slate-800 my-3">
        <div className="text-center text-xs font-mono text-slate-400 mb-2 font-bold">
          Figure 40 — Bump Tests on Two Control Loops
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Plot: Self-Regulating with Stiction */}
          <div className="bg-[#0b1120] p-2 rounded border border-slate-800 flex flex-col items-center">
            <span className="text-[11px] font-semibold text-rose-400 mb-1">Loop A (Left Bump Test)</span>
            <svg viewBox="0 0 240 130" className="w-full h-auto">
              {/* Grid */}
              <defs>
                <pattern id="grid40a" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="240" height="130" fill="url(#grid40a)" />
              {/* CO trace */}
              <polyline
                points="10,110 50,110 50,85 100,85 100,110 140,110 140,125 190,125 190,110 230,110"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
              />
              <text x="14" y="104" fill="#06b6d4" fontSize="9" fontWeight="bold">CO</text>
              {/* PV trace with stiction hysteresis */}
              <path
                d="M 10,50 L 50,50 Q 75,30 100,30 Q 115,30 125,42 L 140,42 Q 160,70 190,70 Q 210,70 230,62"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />
              <text x="14" y="44" fill="#10b981" fontSize="9" fontWeight="bold">PV</text>
              {/* Stiction indicator */}
              <line x1="10" y1="50" x2="230" y2="50" stroke="#64748b" strokeDasharray="2 2" strokeWidth="1" />
              <text x="180" y="58" fill="#f43f5e" fontSize="8" fontWeight="bold">Offset / Stuck!</text>
            </svg>
          </div>

          {/* Right Plot: Integrating Process Proper Operation */}
          <div className="bg-[#0b1120] p-2 rounded border border-slate-800 flex flex-col items-center">
            <span className="text-[11px] font-semibold text-emerald-400 mb-1">Loop B (Right Bump Test)</span>
            <svg viewBox="0 0 240 130" className="w-full h-auto">
              <defs>
                <pattern id="grid40b" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="240" height="130" fill="url(#grid40b)" />
              {/* CO trace */}
              <polyline
                points="10,110 50,110 50,85 100,85 100,110 140,110 140,125 190,125 190,110 230,110"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
              />
              <text x="14" y="104" fill="#06b6d4" fontSize="9" fontWeight="bold">CO</text>
              {/* PV integrating ramp */}
              <polyline
                points="10,60 50,60 100,30 140,30 190,60 230,60"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />
              <text x="14" y="54" fill="#10b981" fontSize="9" fontWeight="bold">PV</text>
              <text x="110" y="24" fill="#38bdf8" fontSize="8">Constant Ramp Slope</text>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Figure 41: Proportional Only Controller Response
  if (type === 'fig41') {
    return (
      <div className="w-full bg-slate-950 p-3 rounded-lg border border-slate-800 my-3 flex flex-col items-center">
        <div className="text-center text-xs font-mono text-slate-400 mb-2 font-bold">
          Figure 41 — Proportional-Only Test (<span className="text-amber-400 font-bold">Kc = 1.8</span>, SP Step +10%, Grid: 1 min/div)
        </div>
        <svg viewBox="0 0 500 200" className="w-full max-w-[500px] h-auto bg-[#0b1120] rounded border border-slate-800">
          <defs>
            <pattern id="grid41" width="40" height="25" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="500" height="200" fill="url(#grid41)" />

          {/* SP step at t = 1 min (x = 80) */}
          <line x1="20" y1="120" x2="80" y2="120" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
          <line x1="80" y1="120" x2="80" y2="90" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
          <line x1="80" y1="90" x2="480" y2="90" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
          <text x="440" y="85" fill="#f59e0b" fontSize="9" fontWeight="bold">SP (60%)</text>

          {/* PV Damped Oscillations */}
          {/* Peak 1 at x = 140 (11.3% above SP = y = 52) */}
          {/* Valley at x = 190 */}
          {/* Peak 2 at x = 243 (5.2% above SP = y = 72) */}
          {/* Period Pu = (243 - 140)/40 = 2.57 min */}
          <path
            d="M 20,120 L 80,120 Q 105,115 120,70 Q 135,48 143,52 Q 165,65 190,118 Q 215,135 243,72 Q 270,45 295,95 Q 320,110 346,84 Q 380,80 480,95"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
          />
          <text x="30" y="114" fill="#10b981" fontSize="9" fontWeight="bold">PV</text>

          {/* Caliper annotations */}
          {/* Peak 1 A1 = 11.3% */}
          <line x1="143" y1="90" x2="143" y2="52" stroke="#f43f5e" strokeWidth="1.5" />
          <text x="148" y="70" fill="#f43f5e" fontSize="9" fontWeight="bold">A₁ = 11.3%</text>

          {/* Peak 2 A2 = 5.2% */}
          <line x1="243" y1="90" x2="243" y2="72" stroke="#f43f5e" strokeWidth="1.5" />
          <text x="248" y="82" fill="#f43f5e" fontSize="9" fontWeight="bold">A₂ = 5.2%</text>

          {/* Period Pu */}
          <line x1="143" y1="35" x2="243" y2="35" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <line x1="143" y1="30" x2="143" y2="40" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="243" y1="30" x2="243" y2="40" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="193" y="30" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">
            Pu = 2.57 min
          </text>
        </svg>
      </div>
    );
  }

  // Figure 42: Relay-Oscillation Tuning Recording
  if (type === 'fig42') {
    return (
      <div className="w-full bg-slate-950 p-3 rounded-lg border border-slate-800 my-3 flex flex-col items-center">
        <div className="text-center text-xs font-mono text-slate-400 mb-2 font-bold">
          Figure 42 — Relay-Oscillation Tuning Test (CO step: <span className="text-cyan-400 font-bold">d = 20%</span>, Grid: 1 min/div)
        </div>
        <svg viewBox="0 0 500 200" className="w-full max-w-[500px] h-auto bg-[#0b1120] rounded border border-slate-800">
          <defs>
            <pattern id="grid42" width="40" height="25" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="500" height="200" fill="url(#grid42)" />

          {/* CO Square Wave: d = 20% (±10% around bias 40) */}
          <polyline
            points="20,130 80,130 80,105 130,105 130,155 176,155 176,105 223,105 223,155 269,155 269,105 315,105 315,155 362,155 362,105 408,105 408,155 454,155"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
          />
          <text x="30" y="125" fill="#06b6d4" fontSize="9" fontWeight="bold">CO</text>
          <line x1="176" y1="130" x2="223" y2="130" stroke="#64748b" strokeDasharray="2 2" />
          <text x="140" y="145" fill="#06b6d4" fontSize="9" fontWeight="bold">d = 20%</text>

          {/* PV Sinusoidal Wave: amplitude a = 8% */}
          <path
            d="M 20,90 L 80,90 Q 105,75 130,70 Q 155,75 176,95 Q 200,115 223,95 Q 245,75 269,70 Q 290,75 315,95 Q 340,115 362,95 Q 385,75 408,70 Q 430,75 454,95"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
          />
          <text x="30" y="85" fill="#10b981" fontSize="9" fontWeight="bold">PV</text>

          {/* Amplitude a = 8% callout */}
          <line x1="269" y1="90" x2="269" y2="70" stroke="#f43f5e" strokeWidth="1.5" />
          <text x="274" y="83" fill="#f43f5e" fontSize="9" fontWeight="bold">a = 8%</text>

          {/* Period Pu = 2.32 min (93 px) */}
          <line x1="176" y1="40" x2="269" y2="40" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="176" y1="35" x2="176" y2="45" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="269" y1="35" x2="269" y2="45" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="222" y="32" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">
            Pu = 2.32 min
          </text>
        </svg>
      </div>
    );
  }

  // Figure 43: -5% CO step open-loop reaction curve
  if (type === 'fig43') {
    return (
      <div className="w-full bg-slate-950 p-3 rounded-lg border border-slate-800 my-3 flex flex-col items-center">
        <div className="text-center text-xs font-mono text-slate-400 mb-2 font-bold">
          Figure 43 — Open-Loop Step (<span className="text-cyan-400 font-bold">ΔCO = -5%</span>, Grid: 1 min/div)
        </div>
        <svg viewBox="0 0 500 200" className="w-full max-w-[500px] h-auto bg-[#0b1120] rounded border border-slate-800">
          <defs>
            <pattern id="grid43" width="50" height="25" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 25" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="500" height="200" fill="url(#grid43)" />

          {/* CO step from 50% to 45% (-5%) at x = 100 */}
          <polyline
            points="20,100 100,100 100,125 480,125"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
          />
          <text x="30" y="95" fill="#06b6d4" fontSize="9" fontWeight="bold">CO (50% → 45%)</text>
          <text x="110" y="115" fill="#06b6d4" fontSize="9">ΔCO = -5%</text>

          {/* PV drop from 55% to 47.5% (-7.5%) */}
          <path
            d="M 20,50 L 125,50 Q 150,55 190,75 Q 230,100 300,105 L 480,105"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
          />
          <text x="30" y="45" fill="#10b981" fontSize="9" fontWeight="bold">PV (55% → 47.5%)</text>
          <text x="410" y="100" fill="#10b981" fontSize="9">ΔPV = -7.5%</text>

          {/* Tangent line at inflection point */}
          <line x1="125" y1="50" x2="250" y2="105" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* L = 0.5 min (25 px) */}
          <line x1="100" y1="35" x2="125" y2="35" stroke="#f43f5e" strokeWidth="1.5" />
          <text x="112" y="28" fill="#f43f5e" fontSize="8" textAnchor="middle">L = 0.5m</text>

          {/* tau1 = 1.8 min (90 px) */}
          <line x1="125" y1="35" x2="215" y2="35" stroke="#a855f7" strokeWidth="1.5" />
          <text x="170" y="28" fill="#a855f7" fontSize="8" textAnchor="middle">τ₁ = 1.8m</text>

          <text x="260" y="75" fill="#f59e0b" fontSize="8">Rr = 2.8%/min</text>
        </svg>
      </div>
    );
  }

  // Figure 44: High dead-time step response
  return (
    <div className="w-full bg-slate-950 p-3 rounded-lg border border-slate-800 my-3 flex flex-col items-center">
      <div className="text-center text-xs font-mono text-slate-400 mb-2 font-bold">
        Figure 44 — Step Response with High Dead Time (<span className="text-cyan-400 font-bold">ΔCO = +10%</span>, Grid: 1 min/div)
      </div>
      <svg viewBox="0 0 500 200" className="w-full max-w-[500px] h-auto bg-[#0b1120] rounded border border-slate-800">
        <defs>
          <pattern id="grid44" width="50" height="25" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 25" fill="none" stroke="#1e293b" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="500" height="200" fill="url(#grid44)" />

        {/* CO Step +10% at x = 80 */}
        <polyline
          points="20,140 80,140 80,115 480,115"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
        />
        <text x="30" y="135" fill="#06b6d4" fontSize="9" fontWeight="bold">CO (+10%)</text>

        {/* PV curve with dead time L = 0.77 min, tau1 = 0.73 min */}
        <path
          d="M 20,120 L 118,120 Q 135,118 155,95 Q 180,65 240,60 L 480,60"
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
        />
        <text x="30" y="115" fill="#10b981" fontSize="9" fontWeight="bold">PV</text>

        {/* Tangent line */}
        <line x1="118" y1="120" x2="200" y2="60" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* Dead time L = 0.77 min (38.5 px) */}
        <line x1="80" y1="100" x2="118" y2="100" stroke="#f43f5e" strokeWidth="1.5" />
        <text x="99" y="94" fill="#f43f5e" fontSize="8" textAnchor="middle">τD = 0.77m</text>

        {/* tau1 = 0.73 min (36.5 px) */}
        <line x1="118" y1="100" x2="155" y2="100" stroke="#a855f7" strokeWidth="1.5" />
        <text x="136" y="94" fill="#a855f7" fontSize="8" textAnchor="middle">τ₁ = 0.73m</text>

        <text x="210" y="80" fill="#f59e0b" fontSize="8">Up = 0.77 / 0.73 = 1.1</text>
      </svg>
    </div>
  );
};
