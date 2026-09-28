import React, { useState } from 'react';
import { ProcessSimulation } from '../engine/simEngine';
import { Formula } from '../math/Formula';
import { Waves, Flame, ShieldAlert, Thermometer, Gauge, ChevronRight, CheckCircle2 } from 'lucide-react';

interface Lab5Props {
  sim: ProcessSimulation;
  onApplyPreset: (presetId: string) => void;
  selectedPresetId: string;
}

export const Lab5IndustrialLoops: React.FC<Lab5Props> = ({
  sim,
  onApplyPreset,
  selectedPresetId,
}) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'gas' | 'level' | 'temp'>('flow');

  const handleSelectLoop = (presetId: string, tab: 'flow' | 'gas' | 'level' | 'temp') => {
    setActiveTab(tab);
    onApplyPreset(presetId);
  };

  return (
    <div className="space-y-6">
      {/* Educational Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Objective 2 • Industrial Loop Architectures
            </span>
            <h2 className="text-lg font-bold text-slate-100">
              Controller Mode Selection & Initial Settings for Field Applications
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Industry Standards:</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Flow • Gas • Level • Temperature
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          In industrial facilities, processes governing the same physical variable share recurring dynamic characteristics.
          Instrument Technicians and Control Engineers use established guidelines for mode selection (P vs PI vs PID),
          controller structures (e.g. <em>Proportional on PV</em>, <em>Setpoint Softening</em>), and initial tuning settings.
        </p>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleSelectLoop('lab5-liquid-flow', 'flow')}
            className={`p-3 rounded-lg text-left border flex items-center justify-between transition-all ${
              activeTab === 'flow'
                ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-md ring-1 ring-cyan-500/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div>
              <span className="text-xs font-bold block text-slate-200">Flow & Pressure</span>
              <span className="text-[11px] text-slate-400">FIC-101 / PIC-101</span>
            </div>
            <Waves className="w-4 h-4 text-cyan-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleSelectLoop('lab5-vessel-gas-pressure', 'gas')}
            className={`p-3 rounded-lg text-left border flex items-center justify-between transition-all ${
              activeTab === 'gas'
                ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div>
              <span className="text-xs font-bold block text-slate-200">Gas Pressure</span>
              <span className="text-[11px] text-slate-400">Vessel, Furnace, Reactor</span>
            </div>
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleSelectLoop('lab5-tight-level', 'level')}
            className={`p-3 rounded-lg text-left border flex items-center justify-between transition-all ${
              activeTab === 'level'
                ? 'bg-sky-950/40 border-sky-500 text-sky-200 shadow-md ring-1 ring-sky-500/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div>
              <span className="text-xs font-bold block text-slate-200">Level Control</span>
              <span className="text-[11px] text-slate-400">Tight vs Surge Control</span>
            </div>
            <Gauge className="w-4 h-4 text-sky-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleSelectLoop('lab5-inline-temp', 'temp')}
            className={`p-3 rounded-lg text-left border flex items-center justify-between transition-all ${
              activeTab === 'temp'
                ? 'bg-rose-950/40 border-rose-500 text-rose-200 shadow-md ring-1 ring-rose-500/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div>
              <span className="text-xs font-bold block text-slate-200">Temperature</span>
              <span className="text-[11px] text-slate-400">TIC-101 Thermowell Lag</span>
            </div>
            <Thermometer className="w-4 h-4 text-rose-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* Tab Specific Content */}
      {/* 1. FLOW & LIQUID PRESSURE */}
      {activeTab === 'flow' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Waves className="w-4 h-4 text-cyan-400" />
              <span>Liquid Flow & Liquid Pressure Guidelines (Figure 35)</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                <span className="font-semibold text-cyan-300 block mb-1">Process Characteristics:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong>Fast-acting & self-regulating:</strong> Valve opening produces instantaneous change in flow/pressure.</li>
                  <li><strong>High dynamic gain:</strong> Demands low controller gain (<Formula tex="K_c < 1" />).</li>
                  <li><strong>Uncontrollability parameter:</strong> Dead time and time constant are similar (<Formula tex="U_p \approx 1.0" />).</li>
                  <li><strong>Naturally noisy PV:</strong> Turbulence creates high-frequency fluctuations.</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                <span className="font-semibold text-amber-300 block mb-1">Recommended Mode: PI Control Only</span>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong>Why not P-only?</strong> Low proportional gain causes severe, unacceptable offset.</li>
                  <li><strong>Why NEVER Derivative?</strong> The process is already fast, and rate action amplifies fluid flow noise into valve chatter and rapid actuator wear!</li>
                  <li><strong>Transmitter Filter:</strong> Filter time constant <Formula tex="\tau_f = 0.5 \times \text{controller scan rate}" />.</li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-lg text-xs">
              <span className="font-bold text-cyan-300 block mb-1">Textbook Tuning Settings:</span>
              <div className="font-mono text-slate-200">
                Proportional Gain (<Formula tex="K_c" />): <strong>0.3</strong> (range 0.2 to 0.8)
                <br />
                Reset Action (<Formula tex="T_i" />): <strong>0.1 min/rpt</strong> (range 0.02 to 0.25)
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Live Interactive Lab Actions
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Test the liquid feed flow controller under noisy conditions. Observe the difference when derivative is mistakenly added!
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    sim.updateProcess({ noiseRms: 1.5 });
                    sim.updateController({ Kc: 0.3, Ti: 0.1, Td: 0 });
                  }}
                  className="w-full py-2 px-3 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 text-left flex items-center justify-between"
                >
                  <span>1. Apply Standard Flow PI Settings (Kc = 0.3, Ti = 0.1m)</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Mistuning: adding derivative to noisy flow!
                    sim.updateController({ Kc: 0.8, Ti: 0.1, Td: 0.15 });
                  }}
                  className="w-full py-2 px-3 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30 text-left flex items-center justify-between"
                >
                  <span>2. Anti-Pattern: Inject Derivative (Rate Chattering!)</span>
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 mt-4">
              Watch the Cyan CO trace on the ScopeChart: Notice how derivative action kicks erratically on flow turbulence, destroying the control valve stem.
            </div>
          </div>
        </div>
      )}

      {/* 2. GAS PRESSURE */}
      {activeTab === 'gas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Vessel Back Pressure */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-400">1. Vessel Back Pressure</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">Fig 36</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Large time constant vs dead time (<Formula tex="U_p \ll 0.1" />). Very easy to control. Noise is not an issue.
            </p>
            <div className="p-2.5 bg-slate-950/70 rounded border border-slate-800 text-[11px] font-mono text-slate-300">
              <strong className="text-cyan-400 block font-sans">Recommended Mode:</strong>
              P-only or PI with minimal reset.
              <br />
              <strong className="text-amber-400 block font-sans mt-1">Settings:</strong>
              Kc = 5 (range 0.5–20)
              <br />
              Ti = 5 min/rpt (range 1–10)
            </div>
            <button
              type="button"
              onClick={() => onApplyPreset('lab5-vessel-gas-pressure')}
              className="w-full py-1.5 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/30"
            >
              Test Vessel Pressure Loop
            </button>
          </div>

          {/* Furnace Draft Pressure */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-rose-400">2. Furnace Pressure</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">Draft</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Small span creates high static gain & noisy draft. Reacts like integrating. Needs PV close to SP.
            </p>
            <div className="p-2.5 bg-slate-950/70 rounded border border-slate-800 text-[11px] font-mono text-slate-300">
              <strong className="text-cyan-400 block font-sans">Recommended Architecture:</strong>
              PI with <strong>Proportional on PV</strong> and Integral on Error (prevents controller kick).
              <br />
              <strong className="text-rose-400 block font-sans mt-1">Guideline:</strong>
              Initial ZN reaction curve, then <strong>cut gain by half</strong> for robustness!
            </div>
            <button
              type="button"
              onClick={() => onApplyPreset('lab5-furnace-pressure')}
              className="w-full py-1.5 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30"
            >
              Test Furnace Draft Loop
            </button>
          </div>

          {/* Reactor Pressure */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-purple-400">3. Reactor Pressure</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">Safety</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Critical Safety Hazard:</strong> Reactors have rupture discs that burst on overpressure. Fluctuations cause fatigue failure!
            </p>
            <div className="p-2.5 bg-slate-950/70 rounded border border-slate-800 text-[11px] font-mono text-slate-300">
              <strong className="text-cyan-400 block font-sans">Essential Feature:</strong>
              Provide <strong>Setpoint Softening</strong> (ramped filter on SP) to eliminate overshoot.
              <br />
              <strong className="text-purple-400 block font-sans mt-1">Guideline:</strong>
              Initial ZN reaction curve, then <strong>cut gain by half</strong> to protect discs.
            </div>
            <button
              type="button"
              onClick={() => {
                onApplyPreset('lab5-furnace-pressure');
                sim.updateController({ spSofteningTau: 0.4 });
                sim.setSetpoint(60);
              }}
              className="w-full py-1.5 rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30"
            >
              Test Rupture Disc Protection
            </button>
          </div>
        </div>
      )}

      {/* 3. LEVEL CONTROL: TIGHT VS SURGE */}
      {activeTab === 'level' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tight Level Control (Figure 37) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-sm font-bold text-sky-400">Tight Level Control (Figure 37)</span>
              <span className="text-xs bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono">Boiler / Steam Tube</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Primary Concern:</strong> Keep PV tightly pinned at Setpoint to maintain continuous mass flow balance (<Formula tex="\text{Flow In} = \text{Flow Out}" />).
              Crucially protects equipment: steam tubes must never be exposed, as exposure causes unequal thermal expansion, stress fractures, and mineral scale baking!
            </p>
            <div className="p-3 bg-slate-950/70 rounded border border-slate-800 text-xs font-mono space-y-1">
              <div><strong className="text-cyan-400 font-sans">Mode:</strong> PI Controller (ZN Ultimate Gain initial)</div>
              <div><strong className="text-sky-400 font-sans">Typical Proportional Gain:</strong> Kc = 5 (range 0.5 to 25)</div>
              <div><strong className="text-amber-400 font-sans">Reset Action:</strong> Ti = 10 min/rpt (range 2 to 100)</div>
            </div>
            <button
              type="button"
              onClick={() => onApplyPreset('lab5-tight-level')}
              className="w-full py-2 rounded bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-bold border border-sky-500/30"
            >
              Activate Tight Level Control
            </button>
          </div>

          {/* Surge Level Control (Figure 38) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-sm font-bold text-emerald-400">Surge (Averaging) Level Control (Figure 38)</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">Buffer Vessel</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Primary Concern:</strong> Smooth and buffer outflow variations to downstream units!
              The tank is deliberately allowed to rise when inflow surges and drop when inflow declines. Major deviations from SP are acceptable.
            </p>
            <div className="p-3 bg-slate-950/70 rounded border border-slate-800 text-xs font-mono space-y-1">
              <div><strong className="text-cyan-400 font-sans">Mode:</strong> Pure Proportional-Only (P) with SP = 50%</div>
              <div><strong className="text-emerald-400 font-sans">Kc = 1.0 (PB 100%):</strong> Valve 0→100% as level moves 0→100%. Max dampening.</div>
              <div><strong className="text-amber-400 font-sans">Kc = 2.0 (PB 50%):</strong> Valve 0→100% as level moves 25→75%. Higher safety buffer.</div>
            </div>
            <button
              type="button"
              onClick={() => onApplyPreset('lab5-surge-level')}
              className="w-full py-2 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/30"
            >
              Activate Surge Level Control (Kc = 1.5)
            </button>
          </div>
        </div>
      )}

      {/* 4. INLINE TEMPERATURE CONTROL */}
      {activeTab === 'temp' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-sm font-bold text-rose-400">Inline Temperature Control (Figure 39)</span>
              <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono">TIC-101</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Inline temperature cools or heats product in transit (e.g. cold oil heated by steam).
              It is a self-regulating process with moderate to slow dynamics determined by fluid thermal mass.
              The signal is clean and not noisy.
            </p>

            <div className="p-3 bg-slate-950/70 rounded border border-slate-800 text-xs space-y-2 text-slate-300">
              <div>
                <strong className="text-amber-300 block mb-0.5">Thermowell Lag & Derivative Pre-Act:</strong>
                A thermowell is a pressure-tight receptacle adapted to receive a temperature sensor.
                It introduces significant first-order thermal lag (<Formula tex="\tau_{tw}" />), which causes substantial closed-loop overshoot!
              </div>
              <div>
                <strong className="text-emerald-300 block mb-0.5">Recommended Architecture:</strong>
                <strong>PID Control</strong> with <strong>PD on PV</strong> and <strong>Integral on Error</strong>, plus <strong>Setpoint Softening</strong>.
                Derivative action provides crucial <em>pre-act</em> to counteract sudden load disturbances (cold product flow rate surges).
              </div>
            </div>

            <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-lg text-xs font-mono text-slate-200">
              <span className="font-bold text-rose-300 block font-sans mb-1">Recommended Settings:</span>
              Proportional Gain (<Formula tex="K_c" />): <strong>0.5</strong> (range 0.2 to 2)
              <br />
              Reset Action (<Formula tex="T_i" />): <strong>1 min/rpt</strong> (range 0.2 to 2)
              <br />
              Rate Action (<Formula tex="T_d" />): <strong>0.25 min (15s)</strong> (range 0.1 to 0.5)
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Thermowell Lag & Pre-Act Demonstration
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Watch how derivative action counters cold feed load upsets before the delayed thermowell sensor registers the full drop!
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => onApplyPreset('lab5-inline-temp')}
                  className="w-full py-2 px-3 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 text-left flex items-center justify-between"
                >
                  <span>1. Configure Temperature Loop with PID + PD on PV</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sim.setLoadDisturbance(-15);
                    setTimeout(() => sim.setLoadDisturbance(0), 12000);
                  }}
                  className="w-full py-2 px-3 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/30 text-left flex items-center justify-between"
                >
                  <span>2. Inject Cold Product Inflow Surge (Load Disturbance)</span>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 mt-4">
              Initial tuning for temperature loops is typically obtained using the <strong>Ziegler-Nichols Reaction Curve</strong> or <strong>IMC</strong> method.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
