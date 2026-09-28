import React, { useState } from 'react';
import { ProcessSimulation } from '../engine/simEngine';
import { Formula } from '../math/Formula';
import { Radio, Activity, RefreshCw, CheckCircle2, Sliders, Zap } from 'lucide-react';

interface Lab4Props {
  sim: ProcessSimulation;
  onApplyPreset: (presetId: string) => void;
  selectedPresetId: string;
}

export const Lab4ClosedLoopTuning: React.FC<Lab4Props> = ({
  sim,
  onApplyPreset,
  selectedPresetId,
}) => {
  const [relayStepSize, setRelayStepSize] = useState<number>(10); // d = 10%
  const [isRelayTuning, setIsRelayTuning] = useState<boolean>(false);
  const [relayProgress, setRelayProgress] = useState<string>('Ready');
  const [relayResults, setRelayResults] = useState<{
    d: number;
    a: number;
    Pu: number;
    Kcu: number;
    piKc: number;
    piTi: number;
    pidKc: number;
    pidTi: number;
    pidTd: number;
  } | null>(null);

  // Damped oscillations manual calculator
  const [dampedKc, setDampedKc] = useState<number>(5.0);
  const [peakA, setPeakA] = useState<number>(10.5);
  const [peakB, setPeakB] = useState<number>(4.5);
  const [measuredPu, setMeasuredPu] = useState<number>(0.62);

  const dampedDR = peakA > 0 ? peakB / peakA : 0.43;
  const dampedKcu = dampedDR > 0 ? dampedKc / Math.sqrt(dampedDR) : 7.6;
  const dampedPI_Kc = 0.45 * dampedKcu;
  const dampedPI_Ti = measuredPu / 1.2;
  const dampedPID_Kc = 0.60 * dampedKcu;
  const dampedPID_Ti = measuredPu / 2;
  const dampedPID_Td = measuredPu / 8;

  // Run Automated Relay Tuner Routine
  const runRelayTuningRoutine = () => {
    setIsRelayTuning(true);
    setRelayProgress('Relay tuner active: Injecting square-wave excitation...');

    const process = sim.getProcessParams();
    const tauD = process.tauD;
    const tau1 = process.tau1;
    const estimatedPu = Math.max(0.4, 4 * tauD + 0.5 * tau1);

    // Theoretical amplitude based on FODT and relay d
    const d = relayStepSize;
    const Kp = process.Kp;
    // a ≈ (4d / pi) * Kp / sqrt(1 + (2*pi*tau1/Pu)^2)
    const omega = (2 * Math.PI) / estimatedPu;
    const a = Math.max(1.5, Math.min(25, (4 * d / Math.PI) * (Kp / Math.sqrt(1 + Math.pow(omega * tau1, 2)))));
    const calculatedKcu = (4 * d) / (Math.PI * a);
    const Pu = estimatedPu;

    sim.setManualMode(true, 40 + d);

    setTimeout(() => {
      sim.setManualCO(40 - d);
      setRelayProgress('Cycling relay step: Measuring peak amplitude (a) and period (Pu)...');
    }, 2000);

    setTimeout(() => {
      sim.setManualCO(40 + d);
    }, 4000);

    setTimeout(() => {
      sim.setManualCO(40);
      setIsRelayTuning(false);
      setRelayProgress('Tuning Complete! Ultimate Gain (Kcu) and Period (Pu) resolved.');

      setRelayResults({
        d,
        a: parseFloat(a.toFixed(1)),
        Pu: parseFloat(Pu.toFixed(2)),
        Kcu: parseFloat(calculatedKcu.toFixed(2)),
        piKc: parseFloat((0.45 * calculatedKcu).toFixed(2)),
        piTi: parseFloat((Pu / 1.2).toFixed(2)),
        pidKc: parseFloat((0.60 * calculatedKcu).toFixed(2)),
        pidTi: parseFloat((Pu / 2).toFixed(2)),
        pidTd: parseFloat((Pu / 8).toFixed(2)),
      });
    }, 6000);
  };

  const handleApplySettings = (settings: { Kc: number; Ti: number; Td: number }) => {
    sim.setManualMode(false);
    sim.updateController({
      mode: settings.Td > 0 ? 'PID' : 'PI',
      Kc: settings.Kc,
      Ti: settings.Ti,
      Td: settings.Td,
    });
    sim.setSetpoint(60);
  };

  return (
    <div className="space-y-6">
      {/* Educational Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              Objective 1 • Closed-Loop & Frequency Response
            </span>
            <h2 className="text-lg font-bold text-slate-100">
              Ziegler-Nichols Ultimate Gain & Relay-Oscillation Tuning
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Target Response:</span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Quarter Amplitude Decay
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          The <strong>Ziegler-Nichols Ultimate Gain</strong> method determines the controller gain (<Formula tex="K_{cu}" />) that causes sustained oscillations at frequency <Formula tex="\omega_u" /> (period <Formula tex="P_u" />) where loop dynamic gain is 1.0 and phase shift is 180°.
          Because sustained oscillations can upset production, technicians use the <strong>Damped Oscillations method</strong> (<Formula tex="K_{cu} = K_c / \sqrt{DR}" />) or automated <strong>Relay-Oscillation Tuning</strong> (<Formula tex="K_{cu} = \frac{4d}{\pi a}" />), which safely limits the oscillation amplitude.
        </p>

        {/* Table 1 Reference Formulas */}
        <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 mb-2">
          <div className="text-xs font-bold text-slate-200 mb-2">
            Table 1: Ziegler-Nichols Ultimate Gain Tuning Formulas
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">Proportional Only (P)</span>
              <Formula tex="K_c = 0.50 K_{cu}" displayMode />
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">Proportional + Integral (PI)</span>
              <Formula tex="K_c = 0.45 K_{cu}, \quad T_i = \frac{P_u}{1.2}" displayMode />
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-purple-400 font-bold block mb-1">Standard PID</span>
              <Formula tex="K_c = 0.60 K_{cu}, \; T_i = \frac{P_u}{2}, \; T_d = \frac{P_u}{8}" displayMode />
            </div>
          </div>
          <p className="text-[11px] text-amber-300/80 mt-2 text-center">
            ★ Golden Rule: If calculated derivative time <Formula tex="T_d < 0.1\text{ min}" />, eliminate rate and use a PI controller!
          </p>
        </div>
      </div>

      {/* Two Tuning Modalities Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modality 1: Automated Relay-Oscillation Tuner (Figure 20 & 24) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Automated Relay-Oscillation Tuner</span>
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">
                Figure 20 & 24
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Relay tuning automates the test by stepping CO up and down by amplitude <Formula tex="d" />.
              Because the PV oscillations are halved if the CO step is halved, you can control the oscillation amplitude to avoid plant upsets.
            </p>

            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 mb-4">
              <label className="text-xs text-slate-400 block mb-1">
                Relay Output Step Size (<Formula tex="d" />)
              </label>
              <div className="flex items-center justify-between font-mono text-cyan-400 font-bold mb-1">
                <span>±{relayStepSize}%</span>
                <span className="text-[10px] text-slate-500">Step size &gt; 3× noise</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={relayStepSize}
                onChange={e => setRelayStepSize(parseFloat(e.target.value))}
                disabled={isRelayTuning}
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="my-2 p-2.5 rounded bg-slate-950/80 border border-slate-800 text-center">
              <Formula tex="K_{cu} = \frac{4d}{\pi \cdot a}" displayMode />
            </div>

            {/* Run Button */}
            <button
              type="button"
              onClick={runRelayTuningRoutine}
              disabled={isRelayTuning}
              className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                isRelayTuning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isRelayTuning ? 'Executing Relay Sequence...' : 'Start Relay Auto-Tuning'}</span>
            </button>

            <div className="text-[11px] text-slate-400 text-center mt-2 italic">
              {relayProgress}
            </div>
          </div>

          {/* Results Box */}
          {relayResults && (
            <div className="mt-4 p-3 bg-cyan-950/20 border border-cyan-500/40 rounded-lg text-xs">
              <div className="flex items-center justify-between font-bold text-cyan-300 mb-2">
                <span>Resolved Parameters</span>
                <span className="font-mono">Kcu: {relayResults.Kcu} | Pu: {relayResults.Pu}m</span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px] mb-3">
                <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block">PI Tuning:</span>
                  <span className="text-emerald-400">Kc = {relayResults.piKc}</span> | <span>Ti = {relayResults.piTi}m</span>
                </div>
                <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block">PID Tuning:</span>
                  <span className="text-purple-400">Kc = {relayResults.pidKc}</span> | <span>Td = {relayResults.pidTd}m</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleApplySettings({ Kc: relayResults.piKc, Ti: relayResults.piTi, Td: 0 })}
                  className="flex-1 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold border border-emerald-500/40"
                >
                  Apply PI Settings
                </button>
                <button
                  type="button"
                  onClick={() => handleApplySettings({ Kc: relayResults.pidKc, Ti: relayResults.pidTi, Td: relayResults.pidTd })}
                  className="flex-1 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-semibold border border-purple-500/40"
                >
                  Apply PID Settings
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modality 2: Damped Oscillations Calculator (Figure 17 & 23) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Damped Oscillations Method</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                Figure 17 & 23
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Requires a proportional gain adjustment that causes at least two damped oscillations.
              Dividing the test controller gain (<Formula tex="K_c" />) by the square root of the decay ratio yields <Formula tex="K_{cu}" />.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">
                  Test Controller Gain (<Formula tex="K_c" />)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={dampedKc}
                  onChange={e => setDampedKc(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-amber-400 font-bold"
                />
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">
                  Oscillation Period (<Formula tex="P_u" /> min)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={measuredPu}
                  onChange={e => setMeasuredPu(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-purple-400 font-bold"
                />
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">
                  Peak 1 Amplitude (<Formula tex="A" /> %)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={peakA}
                  onChange={e => setPeakA(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-cyan-400"
                />
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">
                  Peak 2 Amplitude (<Formula tex="B" /> %)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={peakB}
                  onChange={e => setPeakB(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-cyan-400"
                />
              </div>
            </div>

            <div className="my-2 p-2.5 rounded bg-slate-950/80 border border-slate-800 text-center">
              <Formula
                tex={`DR = \\frac{${peakB}}{${peakA}} = ${dampedDR.toFixed(2)}, \\quad K_{cu} = \\frac{${dampedKc}}{\\sqrt{${dampedDR.toFixed(2)}}} = ${dampedKcu.toFixed(2)}`}
                displayMode
              />
            </div>
          </div>

          {/* Damped Results Action */}
          <div className="mt-3 p-3 bg-amber-950/20 border border-amber-500/40 rounded-lg text-xs">
            <div className="flex items-center justify-between font-bold text-amber-300 mb-2">
              <span>Calculated Settings</span>
              <span className="font-mono">Kcu: {dampedKcu.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px] mb-3">
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block">PI Controller:</span>
                <span className="text-emerald-400">Kc = {dampedPI_Kc.toFixed(2)}</span> | <span>Ti = {dampedPI_Ti.toFixed(2)}m</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block">PID Controller:</span>
                <span className="text-purple-400">Kc = {dampedPID_Kc.toFixed(2)}</span> | <span>Td = {dampedPID_Td.toFixed(2)}m</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleApplySettings({ Kc: dampedPI_Kc, Ti: dampedPI_Ti, Td: 0 })}
                className="flex-1 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold border border-emerald-500/40"
              >
                Apply PI Settings
              </button>
              <button
                type="button"
                onClick={() => handleApplySettings({ Kc: dampedPID_Kc, Ti: dampedPID_Ti, Td: dampedPID_Td })}
                className="flex-1 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-semibold border border-purple-500/40"
              >
                Apply PID Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
