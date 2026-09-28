import React from 'react';

interface RobustnessPlotProps {
  selectedPoint?: number;
  onSelectPoint?: (pointId: number) => void;
}

export const RobustnessPlot: React.FC<RobustnessPlotProps> = ({
  selectedPoint = 1,
  onSelectPoint,
}) => {
  // Coordinates mapped from ILM Figure 12
  // X: Gain Margin (2 to 9)
  // Y: Phase Margin (35 to 90 degrees)
  const points = [
    { id: 1, gm: 3.3, pm: 48, label: 'Point 1', desc: 'Quarter Amplitude Decay (Low Gain Margin, Low Phase Margin)' },
    { id: 2, gm: 5.6, pm: 51, label: 'Point 2', desc: 'Quarter Amplitude Decay with Higher Gain Margin (More robust against process gain changes)' },
    { id: 3, gm: 3.6, pm: 74, label: 'Point 3', desc: 'First Order Response with Higher Phase Margin (More robust against process dead time & lag)' },
    { id: 4, gm: 5.3, pm: 83, label: 'Point 4', desc: 'First Order Response (High Gain Margin AND High Phase Margin, maximum robustness)' },
  ];

  // SVG dimensions
  const w = 480;
  const h = 280;
  const padL = 50;
  const padR = 25;
  const padT = 30;
  const padB = 40;

  const gmToX = (gm: number) => padL + ((gm - 2) / (9 - 2)) * (w - padL - padR);
  const pmToY = (pm: number) => padT + (h - padT - padB) - ((pm - 35) / (90 - 35)) * (h - padT - padB);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-xs">
        <div>
          <span className="font-semibold text-slate-200">Robustness Plot: Gain Margin vs Phase Margin</span>
          <span className="text-slate-400 block text-[11px]">ILM Figure 12: Select points to evaluate loop stability bounds</span>
        </div>
        <span className="text-[11px] bg-slate-800 text-cyan-400 px-2 py-0.5 rounded font-mono">
          Selected: Point {selectedPoint}
        </span>
      </div>

      <div className="relative w-full flex justify-center">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[480px] h-auto select-none">
          {/* Background grid */}
          <rect x={padL} y={padT} width={w - padL - padR} height={h - padT - padB} fill="#0b1120" stroke="#334155" />

          {/* Phase Margin horizontal grid lines (35, 45, 55, 65, 75, 85, 90) */}
          {[35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90].map(pm => {
            const y = pmToY(pm);
            return (
              <g key={pm}>
                <line x1={padL} y1={y} x2={w - padR} y2={y} stroke={pm % 10 === 0 ? '#1e293b' : '#131c31'} strokeWidth="1" />
                {pm % 10 === 0 && (
                  <text x={padL - 8} y={y + 3} fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">
                    {pm}°
                  </text>
                )}
              </g>
            );
          })}

          {/* Gain Margin vertical grid lines (2 to 9) */}
          {[2, 3, 4, 5, 6, 7, 8, 9].map(gm => {
            const x = gmToX(gm);
            return (
              <g key={gm}>
                <line x1={x} y1={padT} x2={x} y2={h - padB} stroke="#1e293b" strokeWidth="1" />
                <text x={x} y={h - padB + 14} fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  {gm}
                </text>
              </g>
            );
          })}

          {/* Axis Labels */}
          <text x={padL + (w - padL - padR) / 2} y={h - 10} fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
            Gain Margin (GM)
          </text>
          <text
            x={15}
            y={padT + (h - padT - padB) / 2}
            fill="#94a3b8"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            transform={`rotate(-90 15 ${padT + (h - padT - padB) / 2})`}
          >
            Phase Margin (PM)
          </text>

          {/* No Overshoot Bound Curve */}
          <path
            d={`M ${gmToX(2.3)} ${pmToY(67)} Q ${gmToX(3.5)} ${pmToY(79)} ${gmToX(5.5)} ${pmToY(84)} T ${gmToX(8.8)} ${pmToY(86)}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
          />
          <text x={gmToX(3.8)} y={pmToY(84)} fill="#10b981" fontSize="10" fontWeight="bold">
            No Overshoot Bound (First Order)
          </text>

          {/* Quarter Amplitude Bound Curve */}
          <path
            d={`M ${gmToX(2.3)} ${pmToY(37)} Q ${gmToX(3.5)} ${pmToY(47)} ${gmToX(5.5)} ${pmToY(50)} T ${gmToX(8.8)} ${pmToY(53)}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
          />
          <text x={gmToX(6.2)} y={pmToY(43)} fill="#f59e0b" fontSize="10" fontWeight="bold">
            Quarter Amplitude Bound
          </text>

          {/* Points 1, 2, 3, 4 */}
          {points.map(pt => {
            const isSelected = selectedPoint === pt.id;
            const x = gmToX(pt.gm);
            const y = pmToY(pt.pm);
            return (
              <g
                key={pt.id}
                onClick={() => onSelectPoint && onSelectPoint(pt.id)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {isSelected && (
                  <circle cx={x} cy={y} r="14" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" className="animate-spin" />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r="7"
                  fill={isSelected ? '#38bdf8' : (pt.id === 1 || pt.id === 2 ? '#f59e0b' : '#10b981')}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text
                  x={x + 10}
                  y={y - 6}
                  fill={isSelected ? '#38bdf8' : '#f8fafc'}
                  fontSize="11"
                  fontWeight="bold"
                >
                  {pt.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Point details and explanations */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
        {points.map(pt => (
          <button
            key={pt.id}
            type="button"
            onClick={() => onSelectPoint && onSelectPoint(pt.id)}
            className={`p-2 rounded-lg text-left transition-all border ${
              selectedPoint === pt.id
                ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`font-bold ${selectedPoint === pt.id ? 'text-cyan-300' : 'text-slate-300'}`}>
                Point {pt.id}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                GM: {pt.gm} | {pt.pm}°
              </span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
              {pt.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
