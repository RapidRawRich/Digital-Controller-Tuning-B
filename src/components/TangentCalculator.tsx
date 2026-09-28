import React, { useState } from 'react';
import { Formula } from '../math/Formula';

interface TangentCalculatorProps {
  onApplyTuning?: (method: string, settings: { Kc: number; Ti: number; Td: number }) => void;
}

export const TangentCalculator: React.FC<TangentCalculatorProps> = ({ onApplyTuning }) => {
  // Configurable open loop test parameters
  const [deltaCO, setDeltaCO] = useState<number>(10);      // % step
  const [deltaPV, setDeltaPV] = useState<number>(15);      // % rise
  const [tauD, setTauD] = useState<number>(0.15);          // dead time in minutes (or L)
  const [tau1, setTau1] = useState<number>(0.56);          // first order time constant in minutes
  const [lambdaFactor, setLambdaFactor] = useState<number>(2); // Lambda factor (1 to 3)

  // Calculations
  const Kp = deltaCO !== 0 ? deltaPV / deltaCO : 1.5;
  const Up = tau1 > 0 ? tauD / tau1 : 0;
  // Reaction rate Rr (%/min) = deltaPV / tau1 or slope of tangent line
  // In Figure 22: Rr = 18 %/min
  const Rr = tau1 > 0 ? deltaPV / tau1 : 18;

  // 1. Ziegler-Nichols Reaction Curve (Table 2)
  // P: Kc = deltaCO / (L * Rr)
  // PI: Kc = 0.9 * (deltaCO / (L * Rr)), Ti = 3.33 * L
  // PID: Kc = 1.2 * (deltaCO / (L * Rr)), Ti = 2.0 * L, Td = 0.5 * L
  const znP_Kc = (tauD * Rr) > 0 ? deltaCO / (tauD * Rr) : 0;
  const znPI_Kc = 0.9 * znP_Kc;
  const znPI_Ti = 3.33 * tauD;
  const znPID_Kc = 1.2 * znP_Kc;
  const znPID_Ti = 2.0 * tauD;
  const znPID_Td = 0.5 * tauD;

  // 2. Lambda Tuning (PI only)
  // tau_c = lambda * (larger of tau1 or tauD)
  // Ti = tau1
  // Kc = tau1 / (Kp * (tau_c + tauD))
  const tauC = lambdaFactor * Math.max(tau1, tauD);
  const lambdaPI_Ti = tau1;
  const lambdaPI_Kc = (Kp * (tauC + tauD)) > 0 ? tau1 / (Kp * (tauC + tauD)) : 0;

  // 3. IMC Tuning (Table 3)
  // For setpoint PI: tau_f = 0.67 * tauD -> Kc = 0.6 * tau1 / (Kp * tauD), Ti = tau1
  // For PID: tau_f = 0.2 * tauD -> Kc = 0.83 * tau1 / (Kp * tauD), Ti = tau1, Td = tauD / 2
  const imcPI_Ti = tau1;
  const imcPI_Kc = (Kp * tauD) > 0 ? (0.6 * tau1) / (Kp * tauD) : 0;
  const imcPID_Kc = (Kp * tauD) > 0 ? (0.83 * tau1) / (Kp * tauD) : 0;
  const imcPID_Ti = tau1;
  const imcPID_Td = tauD / 2;

  // Preset loading
  const loadBenchmark1 = () => {
    setDeltaCO(10);
    setDeltaPV(15);
    setTauD(0.15);
    setTau1(0.56);
    setLambdaFactor(2);
  };

  const loadBenchmark2 = () => {
    setDeltaCO(10);
    setDeltaPV(15);
    setTauD(0.23);
    setTau1(0.32);
    setLambdaFactor(2);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>Open-Loop Reaction Curve & FODT Model Calculator</span>
          </h3>
          <p className="text-xs text-slate-400">
            Determine First-Order Plus Dead Time (FODT) parameters from bump test and calculate ZN, Lambda, and IMC settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadBenchmark1}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium border border-slate-700"
          >
            Load Benchmark 1 (Up = 0.27)
          </button>
          <button
            type="button"
            onClick={loadBenchmark2}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium border border-slate-700"
          >
            Load Benchmark 2 (Up = 0.72)
          </button>
        </div>
      </div>

      {/* Input sliders and values */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <label className="text-xs text-slate-400 block mb-1">
            Output Step (<Formula tex="\Delta CO" />)
          </label>
          <div className="flex items-center justify-between font-mono text-cyan-400 font-bold mb-1">
            <span>{deltaCO}%</span>
          </div>
          <input
            type="range"
            min="2"
            max="25"
            step="1"
            value={deltaCO}
            onChange={e => setDeltaCO(parseFloat(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <label className="text-xs text-slate-400 block mb-1">
            PV Rise (<Formula tex="\Delta PV" />)
          </label>
          <div className="flex items-center justify-between font-mono text-emerald-400 font-bold mb-1">
            <span>{deltaPV}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="40"
            step="0.5"
            value={deltaPV}
            onChange={e => setDeltaPV(parseFloat(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <label className="text-xs text-slate-400 block mb-1">
            Dead Time (<Formula tex="L \text{ or } \tau_D" />)
          </label>
          <div className="flex items-center justify-between font-mono text-amber-400 font-bold mb-1">
            <span>{tauD.toFixed(2)} min</span>
            <span className="text-[10px] text-slate-500">{(tauD * 60).toFixed(0)}s</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1.5"
            step="0.01"
            value={tauD}
            onChange={e => setTauD(parseFloat(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <label className="text-xs text-slate-400 block mb-1">
            Time Constant (<Formula tex="\tau_1" />)
          </label>
          <div className="flex items-center justify-between font-mono text-purple-400 font-bold mb-1">
            <span>{tau1.toFixed(2)} min</span>
            <span className="text-[10px] text-slate-500">{(tau1 * 60).toFixed(0)}s</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.02"
            value={tau1}
            onChange={e => setTau1(parseFloat(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>
      </div>

      {/* Calculated Process Transfer Function & Uncontrollability Parameter Up */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-300">Process Gain & Transfer Function</span>
          <div className="my-2">
            <Formula
              tex={`G_p(s) = \\frac{${Kp.toFixed(2)} \\cdot e^{-${tauD.toFixed(2)}s}}{1 + ${tau1.toFixed(2)}s}`}
              displayMode
            />
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Process Gain: <strong className="text-cyan-400">{Kp.toFixed(2)}</strong> (%PV / %CO)
          </span>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Uncontrollability Parameter</span>
            <span className="text-xs font-mono font-bold text-amber-400">Up = {Up.toFixed(2)}</span>
          </div>
          <div className="my-2">
            <Formula tex={`U_p = \\frac{\\tau_D}{\\tau_1} = \\frac{${tauD.toFixed(2)}}{${tau1.toFixed(2)}} = ${Up.toFixed(2)}`} displayMode />
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full ${Up < 0.5 ? 'bg-emerald-500' : Up < 1.0 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, (Up / 1.5) * 100)}%` }}
            />
          </div>
        </div>

        <div className={`p-3 rounded-lg border flex flex-col justify-center ${
          Up >= 0.1 && Up <= 0.5
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : Up > 0.5
            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            : 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
        }`}>
          <span className="text-xs font-bold uppercase tracking-wider mb-1">
            {Up >= 0.1 && Up <= 0.5
              ? 'Ideal ZN Operating Window'
              : Up > 0.5
              ? 'Warning: High Dead Time'
              : 'Lag Dominant (Easy Control)'}
          </span>
          <p className="text-xs leading-relaxed">
            {Up >= 0.1 && Up <= 0.5
              ? 'Up is between 0.1 and 0.5: Ziegler-Nichols tuning recommendations will yield textbook quarter-amplitude decay.'
              : Up > 0.5
              ? 'Up > 0.5: ZN reaction curve will cause excessive oscillations (half amplitude decay). Use Lambda or IMC tuning!'
              : 'Up < 0.1: Minimal dead time. Easy loop to tune with high proportional gain.'}
          </p>
        </div>
      </div>

      {/* Side-by-Side Tuning Comparison Matrix (Table 2, Lambda, Table 3) */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border border-slate-800 rounded-lg overflow-hidden">
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Tuning Method</th>
              <th className="py-2.5 px-3">Mode</th>
              <th className="py-2.5 px-3">Gain (<Formula tex="K_c" />)</th>
              <th className="py-2.5 px-3">Reset (<Formula tex="T_i" /> min)</th>
              <th className="py-2.5 px-3">Rate (<Formula tex="T_d" /> min)</th>
              <th className="py-2.5 px-3">Expected Closed-Loop Response</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
            {/* ZN Reaction Curve PI */}
            <tr className="bg-slate-900/60 hover:bg-slate-800/40">
              <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans">
                ZN Reaction Curve (Table 2)
              </td>
              <td className="py-2.5 px-3 text-cyan-400">PI</td>
              <td className="py-2.5 px-3 font-bold text-amber-400">{znPI_Kc.toFixed(2)}</td>
              <td className="py-2.5 px-3 text-slate-300">{znPI_Ti.toFixed(2)}</td>
              <td className="py-2.5 px-3 text-slate-500">—</td>
              <td className="py-2.5 px-3 font-sans text-slate-300">
                Quarter Amplitude Decay ({Up > 0.5 ? '⚠️ Half-Amp if Up > 0.5' : 'DR ≈ 0.25'})
              </td>
              <td className="py-2.5 px-3 text-right">
                <button
                  type="button"
                  onClick={() => onApplyTuning && onApplyTuning('ZN Reaction Curve', { Kc: znPI_Kc, Ti: znPI_Ti, Td: 0 })}
                  className="px-2 py-1 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 text-[11px] border border-cyan-500/40"
                >
                  Apply
                </button>
              </td>
            </tr>

            {/* ZN Reaction Curve PID */}
            <tr className="bg-slate-900/60 hover:bg-slate-800/40">
              <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans">
                ZN Reaction Curve (Table 2)
              </td>
              <td className="py-2.5 px-3 text-purple-400">PID</td>
              <td className="py-2.5 px-3 font-bold text-amber-400">{znPID_Kc.toFixed(2)}</td>
              <td className="py-2.5 px-3 text-slate-300">{znPID_Ti.toFixed(2)}</td>
              <td className="py-2.5 px-3 text-slate-300">{znPID_Td.toFixed(2)}</td>
              <td className="py-2.5 px-3 font-sans text-slate-300">
                Quarter Amplitude Decay ({znPID_Td < 0.1 ? '⚠️ Td < 0.1m, use PI!' : 'Fast Pre-Act'})
              </td>
              <td className="py-2.5 px-3 text-right">
                <button
                  type="button"
                  onClick={() => onApplyTuning && onApplyTuning('ZN Reaction Curve PID', { Kc: znPID_Kc, Ti: znPID_Ti, Td: znPID_Td })}
                  className="px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-[11px] border border-purple-500/40"
                >
                  Apply
                </button>
              </td>
            </tr>

            {/* Lambda Tuning PI */}
            <tr className="bg-slate-900/40 hover:bg-slate-800/40">
              <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans">
                Lambda Tuning (<Formula tex={`\\lambda = ${lambdaFactor}`} />)
              </td>
              <td className="py-2.5 px-3 text-emerald-400">PI</td>
              <td className="py-2.5 px-3 font-bold text-emerald-400">{lambdaPI_Kc.toFixed(2)}</td>
              <td className="py-2.5 px-3 text-slate-300">{lambdaPI_Ti.toFixed(2)}</td>
              <td className="py-2.5 px-3 text-slate-500">—</td>
              <td className="py-2.5 px-3 font-sans text-slate-300">
                Zero Overshoot (First order, settles in ~{(5 * tauC).toFixed(1)} min)
              </td>
              <td className="py-2.5 px-3 text-right">
                <button
                  type="button"
                  onClick={() => onApplyTuning && onApplyTuning('Lambda Tuning', { Kc: lambdaPI_Kc, Ti: lambdaPI_Ti, Td: 0 })}
                  className="px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[11px] border border-emerald-500/40"
                >
                  Apply
                </button>
              </td>
            </tr>

            {/* IMC Tuning PI */}
            <tr className="bg-slate-900/60 hover:bg-slate-800/40">
              <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans">
                IMC Tuning (SP, <Formula tex="\tau_f = 0.67\tau_D" />)
              </td>
              <td className="py-2.5 px-3 text-sky-400">PI</td>
              <td className="py-2.5 px-3 font-bold text-sky-400">{imcPI_Kc.toFixed(2)}</td>
              <td className="py-2.5 px-3 text-slate-300">{imcPI_Ti.toFixed(2)}</td>
              <td className="py-2.5 px-3 text-slate-500">—</td>
              <td className="py-2.5 px-3 font-sans text-slate-300">
                Mild ~2% overshoot, fast robust settling
              </td>
              <td className="py-2.5 px-3 text-right">
                <button
                  type="button"
                  onClick={() => onApplyTuning && onApplyTuning('IMC Tuning PI', { Kc: imcPI_Kc, Ti: imcPI_Ti, Td: 0 })}
                  className="px-2 py-1 rounded bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 text-[11px] border border-sky-500/40"
                >
                  Apply
                </button>
              </td>
            </tr>

            {/* IMC Tuning PID */}
            <tr className="bg-slate-900/60 hover:bg-slate-800/40">
              <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans">
                IMC Tuning (SP, <Formula tex="\tau_f = 0.2\tau_D" />)
              </td>
              <td className="py-2.5 px-3 text-indigo-400">PID</td>
              <td className="py-2.5 px-3 font-bold text-indigo-400">{imcPID_Kc.toFixed(2)}</td>
              <td className="py-2.5 px-3 text-slate-300">{imcPID_Ti.toFixed(2)}</td>
              <td className="py-2.5 px-3 text-slate-300">{imcPID_Td.toFixed(2)}</td>
              <td className="py-2.5 px-3 font-sans text-slate-300">
                ~1/4 amp decay for Up up to 1.5
              </td>
              <td className="py-2.5 px-3 text-right">
                <button
                  type="button"
                  onClick={() => onApplyTuning && onApplyTuning('IMC Tuning PID', { Kc: imcPID_Kc, Ti: imcPID_Ti, Td: imcPID_Td })}
                  className="px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[11px] border border-indigo-500/40"
                >
                  Apply
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
