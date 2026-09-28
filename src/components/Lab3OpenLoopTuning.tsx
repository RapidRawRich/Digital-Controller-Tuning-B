import React, { useState } from 'react';
import { ProcessSimulation } from '../engine/simEngine';
import { TangentCalculator } from './TangentCalculator';
import { Formula } from '../math/Formula';
import { Compass, CheckCircle2, AlertTriangle, Layers, Play } from 'lucide-react';

interface Lab3Props {
  sim: ProcessSimulation;
  onApplyPreset: (presetId: string) => void;
  selectedPresetId: string;
}

export const Lab3OpenLoopTuning: React.FC<Lab3Props> = ({
  sim,
  onApplyPreset,
  selectedPresetId,
}) => {
  const [activeBenchmark, setActiveBenchmark] = useState<'bm1' | 'bm2'>('bm1');

  const handleApplyTuning = (
    methodName: string,
    settings: { Kc: number; Ti: number; Td: number }
  ) => {
    sim.setManualMode(false);
    sim.updateController({
      mode: settings.Td > 0 ? 'PID' : 'PI',
      Kc: settings.Kc,
      Ti: settings.Ti,
      Td: settings.Td,
    });
    // Trigger setpoint step to 60% to immediately test the new tuning
    sim.setSetpoint(60);
  };

  const handleLoadBenchmark = (bm: 'bm1' | 'bm2') => {
    setActiveBenchmark(bm);
    if (bm === 'bm1') {
      onApplyPreset('lab3-benchmark1-standard');
    } else {
      onApplyPreset('lab3-benchmark2-deadtime');
    }
  };

  return (
    <div className="space-y-6">
      {/* Educational Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Objective 1 • Open-Loop Modeling & Tuning
            </span>
            <h2 className="text-lg font-bold text-slate-100">
              Reaction Curve, Lambda & IMC Tuning (FODT Model)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleLoadBenchmark('bm1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                activeBenchmark === 'bm1'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              Benchmark 1: Up = 0.27 (Standard)
            </button>
            <button
              type="button"
              onClick={() => handleLoadBenchmark('bm2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                activeBenchmark === 'bm2'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              Benchmark 2: Up = 0.72 (High Dead-Time)
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          The <strong>Ziegler-Nichols Reaction Curve</strong>, <strong>Lambda Tuning</strong>, and <strong>Internal Model Control (IMC)</strong> methods all require an <em>open-loop step test</em> in manual.
          By plotting the tangent at the inflection point, we determine dead time <Formula tex="L" /> (<Formula tex="\tau_D" />), reaction rate <Formula tex="R_r" />, first-order time constant <Formula tex="\tau_1" />, and process gain <Formula tex="K_p" />.
          The ratio of dead time to time constant is the <strong>uncontrollability parameter</strong> (<Formula tex="U_p = \tau_D / \tau_1" />).
        </p>

        {/* Method Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-cyan-400">ZN Reaction Curve</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
                Quarter Decay
              </span>
            </div>
            <div className="text-center my-1">
              <Formula tex="K_c = 0.9 \left( \frac{\Delta CO}{L \cdot R_r} \right), \; T_i = 3.33 L" displayMode />
            </div>
            <p className="text-[11px] text-slate-400">
              Assumes process oscillates at 4 times dead time. Valid only when <Formula tex="U_p \in [0.1, 0.5]" />.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-400">Lambda Tuning</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                First-Order (No Overshoot)
              </span>
            </div>
            <div className="text-center my-1">
              <Formula tex="K_c = \frac{\tau_1}{K_p(\tau_c + \tau_D)}, \; T_i = \tau_1" displayMode />
            </div>
            <p className="text-[11px] text-slate-400">
              User specifies closed-loop time constant <Formula tex="\tau_c = \lambda \cdot \max(\tau_1, \tau_D)" /> (<Formula tex="\lambda = 1 \dots 3" />). Excellent when <Formula tex="U_p > 0.5" />.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-sky-400">IMC Tuning</span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono">
                Model Based Filter
              </span>
            </div>
            <div className="text-center my-1">
              <Formula tex="K_c = \frac{\tau_1}{K_p(\tau_f + \tau_D)}, \; T_i = \tau_1" displayMode />
            </div>
            <p className="text-[11px] text-slate-400">
              Allows derivative action. Select filter <Formula tex="\tau_f = 0.67\tau_D" /> for PI setpoint or <Formula tex="0.2\tau_D" /> for PID. Handles <Formula tex="U_p" /> up to 1.5.
            </p>
          </div>
        </div>
      </div>

      {/* Tangent Calculator Workbench */}
      <TangentCalculator onApplyTuning={handleApplyTuning} />

      {/* Uncontrollability Deep-Dive Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Case Study Comparison: Why ZN Fails when <Formula tex="U_p > 0.5" /></span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200">Standard Process (Figure 22, Table 4)</span>
              <span className="text-emerald-400 font-mono font-bold">Up = 0.27</span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-2">
              Dead time <Formula tex="\tau_D = 0.15\text{ min}" />, time constant <Formula tex="\tau_1 = 0.56\text{ min}" />.
              Because <Formula tex="U_p" /> is in the sweet spot between 0.1 and 0.5:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>ZN reaction curve yields <Formula tex="K_c = 3.3, T_i = 0.50\text{ min}" />.</li>
              <li>Reaches steady state in 2.5 minutes with true quarter amplitude decay (Figure 25).</li>
              <li>ZN Ultimate Gain (<Formula tex="K_c = 3.4" />) and Relay (<Formula tex="K_c = 3.3" />) produce almost identical settings!</li>
            </ul>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-lg border border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200">High Dead-Time Process (Figure 28, Table 5)</span>
              <span className="text-rose-400 font-mono font-bold">Up = 0.72</span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-2">
              Dead time <Formula tex="\tau_D = 0.23\text{ min}" />, time constant <Formula tex="\tau_1 = 0.32\text{ min}" />.
              Because <Formula tex="U_p > 0.5" />, classic ZN assumptions collapse:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>ZN reaction curve calculates <Formula tex="K_c = 1.1" /> (much too aggressive!).</li>
              <li><strong>Result:</strong> Excessive 4% overshoot, dangerous <em>half amplitude decay</em>, and takes 6.0 minutes to settle (Figure 31).</li>
              <li><strong>Solution:</strong> Use Lambda (<Formula tex="K_c = 0.25, T_i = 0.32" />) for smooth 3.0 min zero overshoot, or IMC (<Formula tex="K_c = 0.56" />) for 2.0 min settling!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
