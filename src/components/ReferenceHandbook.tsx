import React, { useState, useMemo } from 'react';
import { Formula } from '../math/Formula';
import { BookOpen, Search, Sparkles, SlidersHorizontal, Table, Flame, Check } from 'lucide-react';

export const ReferenceHandbook: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSection, setActiveSection] = useState<'all' | 'tables' | 'guidelines' | 'rules'>('all');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      {/* Header & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
            Technician Reference Guide
          </span>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>Digital Controller Tuning Handbook (ILM 310305dB)</span>
          </h2>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search formulas, tables, loops..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveSection('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeSection === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          All Reference Topics
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('tables')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeSection === 'tables'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          Formulas & Tables (1, 2, 3, 4, 5)
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('guidelines')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeSection === 'guidelines'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          Industrial Loop Archetypes
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('rules')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeSection === 'rules'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          Golden Rules & Fine Tuning
        </button>
      </div>

      {/* SECTION 1: FORMULAS & TABLES */}
      {(activeSection === 'all' || activeSection === 'tables') && (
        <div className="space-y-6">
          {/* Table 1: ZN Ultimate Gain */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-xs font-bold text-amber-400">
                Table 1 — Ziegler Nichols Ultimate Gain Tuning Settings (Page 18)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Quarter Amplitude Decay Criterion
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-400 uppercase font-mono border-b border-slate-800 bg-slate-900/50">
                  <tr>
                    <th className="py-2 px-3">Mode</th>
                    <th className="py-2 px-3">Proportional Gain (<Formula tex="K_c" />)</th>
                    <th className="py-2 px-3">Integral Time (<Formula tex="T_i" />)</th>
                    <th className="py-2 px-3">Derivative Time (<Formula tex="T_d" />)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-cyan-400 font-sans">P</td>
                    <td className="py-2.5 px-3"><Formula tex="0.50 K_{cu}" /></td>
                    <td className="py-2.5 px-3 text-slate-500">—</td>
                    <td className="py-2.5 px-3 text-slate-500">—</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-emerald-400 font-sans">PI</td>
                    <td className="py-2.5 px-3"><Formula tex="0.45 K_{cu}" /></td>
                    <td className="py-2.5 px-3"><Formula tex="\frac{P_u}{1.2}" /></td>
                    <td className="py-2.5 px-3 text-slate-500">—</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-purple-400 font-sans">PID</td>
                    <td className="py-2.5 px-3"><Formula tex="0.60 K_{cu}" /></td>
                    <td className="py-2.5 px-3"><Formula tex="\frac{P_u}{2}" /></td>
                    <td className="py-2.5 px-3"><Formula tex="\frac{P_u}{8}" /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-300">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <strong className="text-amber-400 block mb-1">Damped Oscillations Formula:</strong>
                <Formula tex="K_{cu} = \frac{K_c}{\sqrt{DR}}, \quad DR = \frac{B}{A}" displayMode />
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <strong className="text-cyan-400 block mb-1">Relay Oscillation Formula:</strong>
                <Formula tex="K_{cu} = \frac{4d}{\pi \cdot a}" displayMode />
              </div>
            </div>
          </div>

          {/* Table 2: ZN Reaction Curve */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-xs font-bold text-cyan-400">
                Table 2 — Ziegler Nichols Reaction Curve Tuning Settings (Page 21)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Open Loop Tangent Method
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-400 uppercase font-mono border-b border-slate-800 bg-slate-900/50">
                  <tr>
                    <th className="py-2 px-3">Mode</th>
                    <th className="py-2 px-3">Proportional Gain (<Formula tex="K_c" />)</th>
                    <th className="py-2 px-3">Integral Time (<Formula tex="T_i" />)</th>
                    <th className="py-2 px-3">Derivative Time (<Formula tex="T_d" />)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-cyan-400 font-sans">P</td>
                    <td className="py-2.5 px-3"><Formula tex="\frac{\Delta CO}{L \cdot R_r}" /></td>
                    <td className="py-2.5 px-3 text-slate-500">—</td>
                    <td className="py-2.5 px-3 text-slate-500">—</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-emerald-400 font-sans">PI</td>
                    <td className="py-2.5 px-3"><Formula tex="0.9 \left( \frac{\Delta CO}{L \cdot R_r} \right)" /></td>
                    <td className="py-2.5 px-3"><Formula tex="3.33 L" /></td>
                    <td className="py-2.5 px-3 text-slate-500">—</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-purple-400 font-sans">PID</td>
                    <td className="py-2.5 px-3"><Formula tex="1.2 \left( \frac{\Delta CO}{L \cdot R_r} \right)" /></td>
                    <td className="py-2.5 px-3"><Formula tex="2 L" /></td>
                    <td className="py-2.5 px-3"><Formula tex="0.5 L" /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              <Formula tex="R_r = \frac{\Delta PV}{\Delta t}" /> (% Rise / Min Run), Dead time <Formula tex="L" /> in minutes.
              Assumes process oscillates at 4 times dead time. Valid for <Formula tex="U_p \in [0.1, 0.5]" />.
            </p>
          </div>

          {/* Table 3: IMC Proportional Gain Settings */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-xs font-bold text-sky-400">
                Table 3 — Internal Model Control (IMC) Proportional Gain Settings (Page 23)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                FODT Model: <Formula tex="T_i = \tau_1, \; T_d = \frac{\tau_D}{2}" />
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-400 uppercase font-mono border-b border-slate-800 bg-slate-900/50">
                  <tr>
                    <th className="py-2 px-3">Disturbance / Application</th>
                    <th className="py-2 px-3">Filter (<Formula tex="\tau_f" />)</th>
                    <th className="py-2 px-3">Gain (<Formula tex="K_c" />)</th>
                    <th className="py-2 px-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans">Load Disturbances</td>
                    <td className="py-2.5 px-3"><Formula tex="\tau_f = 0" /></td>
                    <td className="py-2.5 px-3"><Formula tex="K_c = \frac{\tau_1}{K_p \tau_D}" /></td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">
                      ≈ 1/4 amp decay when Up is 0.1 to 0.5 (PI) or 0.1 to 1.5 (PID).
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans">Setpoint Changes (PI)</td>
                    <td className="py-2.5 px-3"><Formula tex="\tau_f = 0.67 \tau_D" /></td>
                    <td className="py-2.5 px-3"><Formula tex="K_c = \frac{0.6 \tau_1}{K_p \tau_D}" /></td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">
                      ≈ 1/4 amp decay when Up is 0.1 to 1.5.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans">Setpoint Changes (PID)</td>
                    <td className="py-2.5 px-3"><Formula tex="\tau_f = 0.2 \tau_D" /></td>
                    <td className="py-2.5 px-3"><Formula tex="K_c = \frac{0.83 \tau_1}{K_p \tau_D}" /></td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">
                      ≈ 1/4 amp decay when Up is 0.1 to 1.5.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans">Setpoint Changes (Mild PID)</td>
                    <td className="py-2.5 px-3"><Formula tex="\tau_f = \tau_D" /></td>
                    <td className="py-2.5 px-3"><Formula tex="K_c = \frac{0.5 \tau_1}{K_p \tau_D}" /></td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">
                      ≈ 5% gentle overshoot when Up is 0.1 to 1.5.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 4 & Table 5 Benchmark Summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-xs font-bold text-emerald-400">
                  Table 4: Benchmark 1 (Standard Up = 0.27)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Page 30</span>
              </div>
              <ul className="text-xs space-y-1.5 font-mono text-slate-300">
                <li className="flex justify-between"><span>ZN reaction curve:</span> <span>Kc = 3.3, Ti = 0.50m</span></li>
                <li className="flex justify-between"><span>ZN ultimate gain:</span> <span>Kc = 3.4, Ti = 0.52m</span></li>
                <li className="flex justify-between"><span>Relay tuning:</span> <span>Kc = 3.3, Ti = 0.51m</span></li>
                <li className="flex justify-between text-emerald-400"><span>Lambda (λ = 2):</span> <span>Kc = 0.29, Ti = 0.56m</span></li>
                <li className="flex justify-between text-sky-400"><span>IMC (τf = 0.1m):</span> <span>Kc = 1.5, Ti = 0.56m</span></li>
              </ul>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-xs font-bold text-rose-400">
                  Table 5: Benchmark 2 (High Dead-Time Up = 0.72)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Page 37</span>
              </div>
              <ul className="text-xs space-y-1.5 font-mono text-slate-300">
                <li className="flex justify-between text-rose-400"><span>ZN reaction curve:</span> <span>Kc = 1.1 (Fails! Half-Amp)</span></li>
                <li className="flex justify-between"><span>ZN ultimate gain:</span> <span>Kc = 0.72, Ti = 0.76m</span></li>
                <li className="flex justify-between"><span>Relay tuning:</span> <span>Kc = 0.63, Ti = 0.72m</span></li>
                <li className="flex justify-between text-emerald-400"><span>Lambda (λ = 2):</span> <span>Kc = 0.25, Ti = 0.32m</span></li>
                <li className="flex justify-between text-sky-400"><span>IMC (τf = 0.15m):</span> <span>Kc = 0.56, Ti = 0.32m</span></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: INDUSTRIAL LOOP GUIDELINES */}
      {(activeSection === 'all' || activeSection === 'guidelines') && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span>Industrial Control Loop Guidelines Matrix (Objective Two)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* Liquid Flow */}
            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-cyan-500/30">
              <span className="font-bold text-cyan-300 block mb-1">Liquid Flow & Pressure</span>
              <p className="text-slate-400 text-[11px] mb-2">
                Fast acting, noisy, <Formula tex="U_p \approx 1.0" />. High dynamic gain.
              </p>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <div>• Mode: <strong>PI Only</strong> (Never rate/derivative!)</div>
                <div>• Kc: <strong>0.3</strong> (range 0.2 to 0.8)</div>
                <div>• Ti: <strong>0.1 min/rpt</strong> (range 0.02 to 0.25)</div>
                <div>• Filter: 0.5 × controller scan rate</div>
              </div>
            </div>

            {/* Vessel Back Pressure */}
            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-amber-500/30">
              <span className="font-bold text-amber-300 block mb-1">Gas Vessel Back Pressure</span>
              <p className="text-slate-400 text-[11px] mb-2">
                Large <Formula tex="\tau_1" /> vs <Formula tex="\tau_D" /> (small <Formula tex="U_p" />). Easy to control. Clean signal.
              </p>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <div>• Mode: <strong>P-only</strong> or <strong>PI</strong> with minimal reset</div>
                <div>• Kc: <strong>5.0</strong> (range 0.5 to 20)</div>
                <div>• Ti: <strong>5.0 min/rpt</strong> (range 1 to 10)</div>
                <div>• Initial tuning: ZN Ultimate Gain</div>
              </div>
            </div>

            {/* Furnace Draft */}
            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-rose-500/30">
              <span className="font-bold text-rose-300 block mb-1">Furnace Draft Pressure</span>
              <p className="text-slate-400 text-[11px] mb-2">
                Small span creates high static gain & draft noise.
              </p>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <div>• Mode: <strong>PI with Proportional on PV</strong></div>
                <div>• Integral on Error (eliminates kick)</div>
                <div>• Controller PV dampening</div>
                <div>• Cut initial ZN gain by <strong>half</strong> for robustness</div>
              </div>
            </div>

            {/* Reactor Pressure */}
            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-purple-500/30">
              <span className="font-bold text-purple-300 block mb-1">Reactor Pressure (Safety)</span>
              <p className="text-slate-400 text-[11px] mb-2">
                Critical rupture discs break if pressure spikes!
              </p>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <div>• Mode: <strong>PI Control</strong></div>
                <div>• Must use <strong>Setpoint Softening</strong></div>
                <div>• Transmitter filter: 0.5 × scan rate</div>
                <div>• Cut initial ZN gain by <strong>half</strong> to protect discs</div>
              </div>
            </div>

            {/* Tight Level */}
            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-sky-500/30">
              <span className="font-bold text-sky-300 block mb-1">Tight Level Control</span>
              <p className="text-slate-400 text-[11px] mb-2">
                Keeps PV pinned at SP. Maintains mass flow balance & protects steam heating tubes from exposure.
              </p>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <div>• Mode: <strong>PI Control</strong></div>
                <div>• Kc: <strong>5.0</strong> (range 0.5 to 25)</div>
                <div>• Ti: <strong>10.0 min/rpt</strong> (range 2 to 100)</div>
                <div>• Initial tuning: ZN Ultimate Gain</div>
              </div>
            </div>

            {/* Surge Level */}
            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-emerald-500/30">
              <span className="font-bold text-emerald-300 block mb-1">Surge (Averaging) Level</span>
              <p className="text-slate-400 text-[11px] mb-2">
                Buffers outflow to downstream units. Major level deviations allowed.
              </p>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <div>• Mode: <strong>P-only</strong> with SP = 50%</div>
                <div>• Kc = 1.0 (100% PB): Maximum dampening</div>
                <div>• Kc = 2.0 (50% PB): Higher safety buffer</div>
                <div>• Ti = 50 min/rpt (if slow return needed)</div>
              </div>
            </div>

            {/* Inline Temperature */}
            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-rose-500/30 md:col-span-2 lg:col-span-3">
              <span className="font-bold text-rose-300 block mb-1">Inline Temperature Control (Heat Exchangers)</span>
              <p className="text-slate-400 text-[11px] mb-2">
                Self-regulating thermal energy process. Clean non-noisy signal. Thermowell introduces significant first-order thermal lag (<Formula tex="\tau_{tw}" />).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] text-slate-300">
                <div>• Mode: <strong>PID (PD on PV, Integral on Error)</strong></div>
                <div>• Settings: Kc = <strong>0.5</strong>, Ti = <strong>1.0m</strong>, Td = <strong>0.25m (15s)</strong></div>
                <div>• Setpoint Softening required to counteract thermowell overshoot</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: GOLDEN RULES */}
      {(activeSection === 'all' || activeSection === 'rules') && (
        <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Golden Rules of Industrial Loop Tuning (ILM Page 30)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Adjust Proportional Gain First:</strong> For P, PI, and PID control, change only the proportional gain (<Formula tex="K_c" />) to obtain the desired response before touching reset or rate.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Make Significant Changes:</strong> If a loop is too oscillatory for the process, cut the proportional gain by a <strong>factor of two (50%)</strong> and retest.
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Derivative Cutoff Threshold:</strong> For PID control, if the calculated rate setting (<Formula tex="T_d" />) is <strong>less than 0.1 minutes (6 seconds)</strong>, eliminate derivative completely, use a PI controller, and recalculate tuning settings!
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Uncontrollability Limit:</strong> If <Formula tex="U_p = \tau_D / \tau_1 > 0.5" />, do not rely on classic Ziegler-Nichols reaction curve; switch immediately to Lambda or IMC tuning.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
