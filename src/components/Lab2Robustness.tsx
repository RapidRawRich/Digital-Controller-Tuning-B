import React, { useState } from 'react';
import { ProcessSimulation } from '../engine/simEngine';
import { RobustnessPlot } from './RobustnessPlot';
import { Formula } from '../math/Formula';
import { ShieldCheck, TrendingDown, Gauge, AlertCircle, ArrowRightLeft } from 'lucide-react';

interface Lab2Props {
  sim: ProcessSimulation;
  onApplyPreset: (presetId: string) => void;
  selectedPresetId: string;
}

export const Lab2Robustness: React.FC<Lab2Props> = ({
  sim,
  onApplyPreset,
  selectedPresetId,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<number>(1);
  const controllerParams = sim.getControllerParams();

  // Test triggers
  const handleSetpointStep = (newSP: number) => {
    sim.setSetpoint(newSP);
  };

  const handleSelectPoint = (pointId: number) => {
    setSelectedPoint(pointId);
    if (pointId === 1) {
      // Point 1: Underdamped Quarter Amplitude Decay (Low Gain Margin, Low Phase Margin)
      sim.updateController({ Kc: 3.3, Ti: 0.50, Td: 0 });
      sim.setSetpoint(60);
    } else if (pointId === 2) {
      // Point 2: Quarter Amplitude Decay with larger Gain Margin
      sim.updateController({ Kc: 2.4, Ti: 0.52, Td: 0 });
      sim.setSetpoint(60);
    } else if (pointId === 3) {
      // Point 3: First Order Response with higher Phase Margin
      sim.updateController({ Kc: 0.65, Ti: 0.56, Td: 0 });
      sim.setSetpoint(60);
    } else if (pointId === 4) {
      // Point 4: First Order Response (High Gain Margin & High Phase Margin)
      sim.updateController({ Kc: 0.29, Ti: 0.56, Td: 0 });
      sim.setSetpoint(60);
    }
  };

  return (
    <div className="space-y-6">
      {/* Educational Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Objective 1 • Closed-Loop Criteria
            </span>
            <h2 className="text-lg font-bold text-slate-100">
              Optimal Performance, Decay Ratio & Loop Robustness
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSetpointStep(controllerParams.bias === 40 ? 60 : 40)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-sm"
            >
              Step SP (50% → 60%)
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Optimal performance is a delicate balance between the <strong>performance of the controlled variable (PV)</strong>, the <strong>robustness of the loop</strong>, and the <strong>behavior of the manipulated variable (CO)</strong>.
          While <em>quarter amplitude decay</em> settles quickly, it creates violent manipulated variable swings (&gt;60% flow variations) and rapid valve stem wear.
          In many industrial applications, a <em>zero overshoot</em> (critically damped or overdamped) response is preferred.
        </p>

        {/* Quick Criterion Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                <span>Quarter Amplitude Decay</span>
              </span>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                DR = 0.25 (1/4)
              </span>
            </div>
            <div className="text-center my-1.5">
              <Formula tex="DR = \frac{A_2}{A_1} = \frac{2.5\%}{10\%} = 0.25" displayMode />
            </div>
            <p className="text-[11px] text-slate-300">
              Figure 9: Consecutive peak ratio of 1:4. Fast settling, but underdamped oscillations and aggressive valve movement.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-sky-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <Gauge className="w-4 h-4" />
                <span>Minimum IAE</span>
              </span>
              <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded">
                Integral Absolute Error
              </span>
            </div>
            <div className="text-center my-1.5">
              <Formula tex="\text{IAE} = \int_0^\infty |e(t)| \, dt" displayMode />
            </div>
            <p className="text-[11px] text-slate-300">
              Figure 10: Minimizes accumulated error area. Works for both overdamped and underdamped curves; results resemble quarter amplitude decay.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Overshoot</span>
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                First-Order
              </span>
            </div>
            <div className="text-center my-1.5">
              <Formula tex="t_{settle} \approx 5 \cdot \tau_c \quad (63.2\% \text{ at } \tau_c)" displayMode />
            </div>
            <p className="text-[11px] text-slate-300">
              Figure 11 & 15: Critically damped (fastest no overshoot) or overdamped. Eliminates valve wear and prevents downstream hydraulic shocks.
            </p>
          </div>
        </div>
      </div>

      {/* Robustness Plot & Manipulated Variable Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Robustness Plot (Figure 12) */}
        <div className="lg:col-span-7">
          <RobustnessPlot selectedPoint={selectedPoint} onSelectPoint={handleSelectPoint} />
        </div>

        {/* Right Column: Manipulated Variable (CO) Impact Analysis (Figure 14 vs 15) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
              <span>Manipulated Variable (CO) Analysis</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              ILM Pages 13–14: Why quarter amplitude decay is often rejected in chemical and oil processing plants:
            </p>

            {/* Comparison Cards */}
            <div className="space-y-3 mb-4">
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-300 mb-1">
                  <span>Quarter Amplitude Decay (Fig 14)</span>
                  <span className="text-rose-400 font-mono">CO Swing &gt; 60%!</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>PV repeatedly overshoots and undershoots SP.</li>
                  <li>CO amplifies PV swings (10% to 70% range).</li>
                  <li>Creates severe transient hydraulic shock to downstream processes.</li>
                  <li>Continuous oscillating valve stem movement accelerates mechanical packing and trim wear.</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-xs">
                <div className="flex items-center justify-between font-bold text-emerald-300 mb-1">
                  <span>Zero Overshoot Response (Fig 15)</span>
                  <span className="text-emerald-400 font-mono">CO Swing &lt; 10%</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>PV settles monotonically without any overshoot.</li>
                  <li>CO varies smoothly between 50% and 60% (&lt;10% change).</li>
                  <li>Non-oscillatory stem motion eliminates valve wear.</li>
                  <li>Only requires slightly longer settling time (5.5 min vs 4 min).</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Scenario Test Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                onApplyPreset('lab2-quarter-decay');
                setSelectedPoint(1);
              }}
              className="flex-1 py-1.5 rounded bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-xs font-semibold border border-amber-500/30 text-center"
            >
              Test Quarter Decay (Fig 14)
            </button>
            <button
              type="button"
              onClick={() => {
                onApplyPreset('lab2-zero-overshoot');
                setSelectedPoint(4);
              }}
              className="flex-1 py-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-xs font-semibold border border-emerald-500/30 text-center"
            >
              Test Zero Overshoot (Fig 15)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
