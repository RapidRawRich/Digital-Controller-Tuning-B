import React from 'react';
import { ProcessSimulation } from '../engine/simEngine';
import { ProcessSchematic } from './ProcessSchematic';
import { Formula } from '../math/Formula';
import { Zap, Activity, AlertTriangle, Disc, RefreshCw } from 'lucide-react';

interface Lab1Props {
  sim: ProcessSimulation;
  onApplyPreset: (presetId: string) => void;
  selectedPresetId: string;
}

export const Lab1ProcessTypes: React.FC<Lab1Props> = ({
  sim,
  onApplyPreset,
  selectedPresetId,
}) => {
  const currentTelemetry = sim.getLatestTelemetry();
  const processParams = sim.getProcessParams();
  const controllerParams = sim.getControllerParams();

  // Test disturbance triggers
  const handleStepCO = (delta: number) => {
    const currentCO = sim.getControllerParams().bias;
    const newCO = Math.max(0, Math.min(100, currentCO + delta));
    sim.setManualMode(true, newCO);
  };

  const handleBumpTest = () => {
    // Standard bump test sequence: step CO +10%
    sim.setManualMode(true, 50);
  };

  const handleLoadDisturbance = () => {
    sim.setLoadDisturbance(12);
    setTimeout(() => {
      sim.setLoadDisturbance(0);
    }, 15000);
  };

  const handleTransientDisturbance = () => {
    sim.setTransientDisturbance(-15);
  };

  const handleToggleStiction = () => {
    const currentStiction = processParams.stiction;
    sim.updateProcess({ stiction: currentStiction > 0 ? 0 : 4.5 });
  };

  const currentType = processParams.type;

  return (
    <div className="space-y-6">
      {/* Educational Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Objective 1 • Foundation
            </span>
            <h2 className="text-lg font-bold text-slate-100">
              Process Types, Disturbances & Valve Diagnostics
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Classifications:</span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Self-Regulating
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Integrating
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Runaway
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Before tuning any feedback control loop, you must ensure all loop hardware components are functioning properly.
          Poor control is just as likely to be caused by field instrument problems (such as valve stiction) as it is by incorrect tuning parameters.
          Performing a <strong>Bump Test</strong> in manual reveals whether the process is <em>self-regulating</em>, <em>integrating</em>, or suffering from <em>valve stiction</em>.
        </p>

        {/* 1-Click Scenario Preset Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <button
            type="button"
            onClick={() => onApplyPreset('lab1-self-regulating')}
            className={`p-2.5 rounded-lg text-left border transition-all ${
              selectedPresetId === 'lab1-self-regulating'
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-md ring-1 ring-emerald-500/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Self-Regulating</span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Fig 2 & 5: Settles to stable PV after CO step.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('lab1-integrating')}
            className={`p-2.5 rounded-lg text-left border transition-all ${
              selectedPresetId === 'lab1-integrating'
                ? 'bg-sky-950/40 border-sky-500 text-sky-200 shadow-md ring-1 ring-sky-500/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1">
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
              <span>Integrating (Level)</span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Fig 3 & 6: Ramps PV at constant rate; non-self-regulating.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('lab1-runaway')}
            className={`p-2.5 rounded-lg text-left border transition-all ${
              selectedPresetId === 'lab1-runaway'
                ? 'bg-rose-950/40 border-rose-500 text-rose-200 shadow-md ring-1 ring-rose-500/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Runaway Reactor</span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Fig 4: Exothermic reaction accelerates rate of change over time.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('lab1-stiction-manual')}
            className={`p-2.5 rounded-lg text-left border transition-all ${
              selectedPresetId === 'lab1-stiction-manual'
                ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1">
              <Disc className="w-3.5 h-3.5 text-amber-400" />
              <span>Stiction in Manual</span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Fig 7: PV does not return to same value for same CO.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('lab1-stiction-auto')}
            className={`p-2.5 rounded-lg text-left border transition-all ${
              selectedPresetId === 'lab1-stiction-auto'
                ? 'bg-purple-950/40 border-purple-500 text-purple-200 shadow-md ring-1 ring-purple-500/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Stiction in Auto</span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Fig 8: Sawtooth CO pattern & limit cycle oscillation.
            </p>
          </button>
        </div>
      </div>

      {/* Schematic & Live Action Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Schematic */}
        <div className="lg:col-span-7">
          <ProcessSchematic
            type={
              processParams.stiction > 0
                ? 'valve-stiction'
                : currentType === 'integrating'
                ? 'level-vessel'
                : currentType === 'runaway'
                ? 'reactor'
                : 'heat-exchanger'
            }
            telemetry={currentTelemetry}
            stictionBand={processParams.stiction}
          />
        </div>

        {/* Right Column: Interactive Diagnostic Tests */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Field Bump Testing & Disturbance Simulator</span>
            </h3>

            {/* Disturbance Buttons */}
            <div className="space-y-3 mb-4">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block mb-2">
                  1. Manual Bump Test (Stepping CO)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStepCO(10)}
                    className="px-2.5 py-1.5 rounded bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 text-xs font-semibold border border-cyan-500/30"
                  >
                    CO Step +10%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepCO(-10)}
                    className="px-2.5 py-1.5 rounded bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 text-xs font-semibold border border-cyan-500/30"
                  >
                    CO Step -10%
                  </button>
                  <button
                    type="button"
                    onClick={handleBumpTest}
                    className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                  >
                    Center (50%)
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block mb-2">
                  2. Disturbance Injection (ILM Page 4-5)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleLoadDisturbance}
                    className="px-2.5 py-1.5 rounded bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-xs font-semibold border border-amber-500/30"
                    title="Change in feed flow rate (throughput)"
                  >
                    Load Disturbance (+12%)
                  </button>
                  <button
                    type="button"
                    onClick={handleTransientDisturbance}
                    className="px-2.5 py-1.5 rounded bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-xs font-semibold border border-rose-500/30"
                    title="Temporary dip in steam supply pressure"
                  >
                    Transient Pulse (-15%)
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block mb-2">
                  3. Valve Mechanical Health (Friction / Stiction)
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Packing Stiction Band: <strong className="text-orange-400">{processParams.stiction.toFixed(1)}%</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleStiction}
                    className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
                      processParams.stiction > 0
                        ? 'bg-rose-600/30 text-rose-300 border-rose-500/50'
                        : 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                    }`}
                  >
                    {processParams.stiction > 0 ? 'Clear Stiction' : 'Inject Stiction (4.5%)'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Note Box */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
            <strong className="text-amber-400 block mb-1">
              Industrial Field Lesson:
            </strong>
            {currentType === 'integrating' ? (
              <p>
                An integrating process (Figure 3 & 6) does not reach steady state after a CO step; it ramps continuously.
                <strong> An integrating process cannot be left unattended in manual!</strong>
              </p>
            ) : currentType === 'runaway' ? (
              <p>
                A runaway process (Figure 4) increases its rate of change over time. It has a narrow stability window
                and <strong>requires rate (derivative) action</strong> to be stable.
              </p>
            ) : processParams.stiction > 0 ? (
              <p>
                Valve stiction (tight packing, rough stem) causes the stem to stick. In automatic, integral action ramps CO in a
                <strong> sawtooth pattern</strong> until the stem breaks free and jumps past SP (Figure 8).
              </p>
            ) : (
              <p>
                In a properly operating self-regulating process bump test (Figure 5), the PV response is identical for each step
                and the PV returns to the exact same steady-state value.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
