import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ProcessSimulation } from '../engine/simEngine';
import { Formula } from '../math/Formula';
import type { ControllerMode, ControllerParams, ProcessParams } from '../types/simulation';
import {
  Sliders,
  Sparkles,
  Zap,
  RotateCcw,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react';

interface TuningControlPanelProps {
  sim: ProcessSimulation;
}

export const TuningControlPanel: React.FC<TuningControlPanelProps> = ({ sim }) => {
  // Sync state with simulation engine
  const [controllerParams, setControllerParams] = useState<ControllerParams>(sim.getControllerParams());
  const [processParams, setProcessParams] = useState<ProcessParams>(sim.getProcessParams());
  const [manualCO, setManualCO] = useState<number>(sim.getControllerParams().bias);
  const [activeTab, setActiveTab] = useState<'tuning' | 'advisor'>('tuning');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Subscribe to sim updates
  useEffect(() => {
    const syncState = () => {
      setControllerParams(sim.getControllerParams());
      setProcessParams(sim.getProcessParams());
    };
    syncState();
    const unsubscribe = sim.subscribe(syncState);
    return () => unsubscribe();
  }, [sim]);

  // Flash notification helper
  const flashNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Controller Parameter Handlers
  const handleModeChange = (newMode: ControllerMode) => {
    sim.setManualMode(newMode === 'MANUAL');
    sim.updateController({ mode: newMode });
    flashNotice(`Controller mode switched to ${newMode}`);
  };

  const handleKcChange = (val: number) => {
    const clamped = Math.max(0.01, Math.min(30.0, parseFloat(val.toFixed(2))));
    sim.updateController({ Kc: clamped });
  };

  const handleTiChange = (val: number) => {
    const clamped = Math.max(0.01, Math.min(50.0, parseFloat(val.toFixed(2))));
    sim.updateController({ Ti: clamped });
  };

  const handleTdChange = (val: number) => {
    const clamped = Math.max(0.0, Math.min(5.0, parseFloat(val.toFixed(2))));
    sim.updateController({ Td: clamped });
  };

  const handleManualCOChange = (val: number) => {
    const clamped = Math.max(0, Math.min(100, parseFloat(val.toFixed(1))));
    setManualCO(clamped);
    sim.setManualCO(clamped);
  };

  const handleNudgeManualCO = (delta: number) => {
    const nextVal = Math.max(0, Math.min(100, manualCO + delta));
    setManualCO(nextVal);
    sim.setManualCO(nextVal);
  };

  const handlePropOnPVToggle = () => {
    const next = !controllerParams.propOnPV;
    sim.updateController({ propOnPV: next });
    flashNotice(next ? 'Proportional on PV enabled (prevents SP kick)' : 'Proportional on Error enabled');
  };

  const handleDerivOnPVToggle = () => {
    const next = !controllerParams.derivOnPV;
    sim.updateController({ derivOnPV: next });
    flashNotice(next ? 'Derivative on PV enabled (prevents Rate kick)' : 'Derivative on Error enabled');
  };

  // Quick Loop Test Triggers
  const handleStepSP = (delta: number) => {
    const latest = sim.getLatestTelemetry();
    const newSP = Math.max(0, Math.min(100, (latest ? latest.sp : 50) + delta));
    sim.setSetpoint(newSP);
    flashNotice(`Setpoint stepped to ${newSP.toFixed(1)}%`);
  };

  const handleInjectDisturbance = (delta: number) => {
    sim.setLoadDisturbance(delta);
    flashNotice(delta === 0 ? 'Load disturbance cleared (0%)' : `Load disturbance set to ${delta > 0 ? '+' : ''}${delta}%`);
  };

  // Math Calculations for Feedback
  const pbPercent = controllerParams.Kc > 0 ? (100 / controllerParams.Kc).toFixed(1) : '∞';
  const resetRate = controllerParams.Ti > 0 ? (1 / controllerParams.Ti).toFixed(2) : '0';
  const tdSeconds = (controllerParams.Td * 60).toFixed(0);

  // Process & Loop Controllability Analysis
  const Kp = processParams.Kp || 1.0;
  const tau1 = processParams.tau1 || 0.5;
  const tauD = processParams.tauD || 0.1;
  const Up = tau1 > 0 ? tauD / tau1 : 0;
  const isDeadTimeDominant = Up > 0.5;
  const isLagDominant = Up < 0.1;
  const isHighNoise = (processParams.noiseRms || 0) >= 0.15;

  // Theoretical tuning calculations for the active process
  const tuningSuggestions = useMemo(() => {
    // 1. Ziegler-Nichols Open-Loop (Reaction Curve FODT)
    const znP_Kc = (tauD * (Kp / tau1)) > 0 ? 1.0 / (tauD * (Kp / tau1)) : (tau1 / (Kp * tauD));
    const znPI_Kc = parseFloat((0.9 * (tau1 / (Kp * tauD))).toFixed(2));
    const znPI_Ti = parseFloat((3.33 * tauD).toFixed(2));
    const znPID_Kc = parseFloat((1.2 * (tau1 / (Kp * tauD))).toFixed(2));
    const znPID_Ti = parseFloat((2.0 * tauD).toFixed(2));
    const znPID_Td = parseFloat((0.5 * tauD).toFixed(2));

    // 2. Lambda Tuning (Critically Damped, 0% Overshoot)
    // Moderate: lambda = 2 * tau1 (or 3 * tauD if dead-time dominant)
    const lambdaMod = Math.max(2 * tau1, 3 * tauD);
    const lambdaMod_Kc = parseFloat((tau1 / (Kp * (lambdaMod + tauD))).toFixed(2));
    const lambdaMod_Ti = parseFloat(tau1.toFixed(2));

    // Fast Lambda: lambda = tau1
    const lambdaFast = Math.max(tau1, tauD);
    const lambdaFast_Kc = parseFloat((tau1 / (Kp * (lambdaFast + tauD))).toFixed(2));
    const lambdaFast_Ti = parseFloat(tau1.toFixed(2));

    // 3. Ziegler-Nichols Closed-Loop (Relay / Ultimate)
    const estimatedPu = Math.max(0.4, 4 * tauD + 0.5 * tau1);
    const estimatedKcu = Math.max(0.8, (4 * tau1) / (Math.PI * Kp * tauD));
    const clPI_Kc = parseFloat((0.45 * estimatedKcu).toFixed(2));
    const clPI_Ti = parseFloat((estimatedPu / 1.2).toFixed(2));
    const clPID_Kc = parseFloat((0.60 * estimatedKcu).toFixed(2));
    const clPID_Ti = parseFloat((estimatedPu / 2.0).toFixed(2));
    const clPID_Td = parseFloat((estimatedPu / 8.0).toFixed(2));

    return {
      Up,
      znPI_Kc,
      znPI_Ti,
      znPID_Kc,
      znPID_Ti,
      znPID_Td,
      lambdaMod_Kc,
      lambdaMod_Ti,
      lambdaFast_Kc,
      lambdaFast_Ti,
      clPI_Kc,
      clPI_Ti,
      clPID_Kc,
      clPID_Ti,
      clPID_Td,
      estimatedKcu: parseFloat(estimatedKcu.toFixed(2)),
      estimatedPu: parseFloat(estimatedPu.toFixed(2)),
    };
  }, [Kp, tau1, tauD, Up]);

  // Apply suggestion callback
  const handleApplySuggestion = (
    methodName: string,
    mode: ControllerMode,
    Kc: number,
    Ti: number,
    Td: number
  ) => {
    sim.setManualMode(false);
    sim.updateController({
      mode,
      Kc,
      Ti,
      Td,
    });
    flashNotice(`Applied ${methodName}: Kc=${Kc}, Ti=${Ti}m, Td=${Td}m`);
  };

  // Golden Rule Quick Modifiers
  const handleHalveGain = () => {
    const newKc = parseFloat(Math.max(0.05, controllerParams.Kc * 0.5).toFixed(2));
    sim.updateController({ Kc: newKc });
    flashNotice(`Golden Rule applied: Cut gain in half to Kc = ${newKc}`);
  };

  const handleDoubleReset = () => {
    const newTi = parseFloat((controllerParams.Ti * 2.0).toFixed(2));
    sim.updateController({ Ti: newTi });
    flashNotice(`Golden Rule applied: Doubled integral time to Ti = ${newTi} min`);
  };

  const handleEliminateDerivative = () => {
    sim.updateController({ Td: 0, mode: controllerParams.mode === 'PID' ? 'PI' : controllerParams.mode });
    flashNotice('Golden Rule applied: Eliminated derivative (Td = 0) to protect control valve');
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl mb-6 overflow-hidden transition-all">
      {/* Console Top Navigation Bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Interactive Loop Engineering Console
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                ILM 310305dB
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Real-time controller gain manipulation & KaTeX tuning recommendation advisor
            </p>
          </div>
        </div>

        {/* Console Mode Tabs & Collapse Toggle */}
        <div className="flex items-center gap-2">
          {notification && (
            <div className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{notification}</span>
            </div>
          )}

          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('tuning')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'tuning'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Gain Sliders
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('advisor')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'advisor'
                  ? 'bg-purple-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Tuning Advisor
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title={isCollapsed ? 'Expand Console' : 'Collapse Console'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-4 sm:p-5">
          {activeTab === 'tuning' ? (
            /* TAB 1: INTERACTIVE GAIN SLIDERS & CONTROLLER BENCH */
            <div className="space-y-6">
              {/* Controller Mode & Algorithm Selectors */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Controller Mode:
                  </span>
                  <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    {(['P', 'PI', 'PID', 'MANUAL'] as ControllerMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleModeChange(mode)}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                          controllerParams.mode === mode
                            ? mode === 'MANUAL'
                              ? 'bg-amber-500 text-slate-950 shadow-md'
                              : 'bg-cyan-500 text-slate-950 shadow-md'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Algorithm Flags: P-on-PV & D-on-PV */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={handlePropOnPVToggle}
                    className={`px-2.5 py-1 rounded border text-xs font-medium transition flex items-center gap-1.5 ${
                      controllerParams.propOnPV
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                    title="Golden Rule: Eliminates setpoint kick on step changes"
                  >
                    <span>P-on-PV</span>
                    <span className="text-[10px] font-mono opacity-80">
                      ({controllerParams.propOnPV ? 'Active' : 'P-on-e'})
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDerivOnPVToggle}
                    className={`px-2.5 py-1 rounded border text-xs font-medium transition flex items-center gap-1.5 ${
                      controllerParams.derivOnPV
                        ? 'bg-purple-500/10 border-purple-500/40 text-purple-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                    title="Eliminates derivative spike when setpoint changes"
                  >
                    <span>D-on-PV</span>
                    <span className="text-[10px] font-mono opacity-80">
                      ({controllerParams.derivOnPV ? 'Active' : 'D-on-e'})
                    </span>
                  </button>

                  {/* Golden Rule Quick Button: Halve Gain */}
                  <button
                    type="button"
                    onClick={handleHalveGain}
                    className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition flex items-center gap-1"
                    title="Module Rule: Cut Gain by 50% to stop cycling"
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Halve <Formula tex="K_c" /> (50%)</span>
                  </button>
                </div>
              </div>

              {/* Live Interactive Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Proportional Gain (Kc) Slider */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                        Proportional Gain (<Formula tex="K_c" />)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0.05"
                        max="25"
                        step="0.05"
                        value={controllerParams.Kc}
                        onChange={(e) => handleKcChange(parseFloat(e.target.value) || 0.1)}
                        className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Slider Control */}
                  <div className="my-3">
                    <input
                      type="range"
                      min="0.05"
                      max="15.0"
                      step="0.05"
                      value={controllerParams.Kc}
                      onChange={(e) => handleKcChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>0.05 (Sluggish)</span>
                      <span>5.0</span>
                      <span>15.0 (Aggressive)</span>
                    </div>
                  </div>

                  {/* KaTeX Proportional Band Display */}
                  <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800 text-center">
                    <div className="text-[11px] text-slate-300">
                      <Formula tex={`\\text{PB} = \\frac{100\\%}{K_c} = ${pbPercent}\\%`} />
                    </div>
                  </div>
                </div>

                {/* 2. Integral Time (Ti) Slider */}
                <div
                  className={`bg-slate-950/70 border rounded-xl p-4 flex flex-col justify-between transition-opacity ${
                    controllerParams.mode === 'P' || controllerParams.mode === 'MANUAL'
                      ? 'opacity-40 border-slate-800'
                      : 'border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                        Integral Time (<Formula tex="T_i" />)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0.01"
                        max="30"
                        step="0.05"
                        disabled={controllerParams.mode === 'P' || controllerParams.mode === 'MANUAL'}
                        value={controllerParams.Ti}
                        onChange={(e) => handleTiChange(parseFloat(e.target.value) || 0.1)}
                        className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-400 disabled:opacity-50"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">min</span>
                    </div>
                  </div>

                  {/* Slider Control */}
                  <div className="my-3">
                    <input
                      type="range"
                      min="0.02"
                      max="10.0"
                      step="0.02"
                      disabled={controllerParams.mode === 'P' || controllerParams.mode === 'MANUAL'}
                      value={controllerParams.Ti}
                      onChange={(e) => handleTiChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 disabled:opacity-30"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>0.02 min (Fast)</span>
                      <span>2.5 min</span>
                      <span>10.0 min (Slow)</span>
                    </div>
                  </div>

                  {/* KaTeX Reset Rate Display */}
                  <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800 text-center">
                    <div className="text-[11px] text-slate-300">
                      {controllerParams.mode === 'P' ? (
                        <span className="text-slate-500 font-mono">Integral Disabled (P-Only)</span>
                      ) : (
                        <Formula tex={`R = \\frac{1}{T_i} = ${resetRate}\\text{ repeats/min}`} />
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Derivative Time (Td) Slider */}
                <div
                  className={`bg-slate-950/70 border rounded-xl p-4 flex flex-col justify-between transition-opacity ${
                    controllerParams.mode !== 'PID' ? 'opacity-40 border-slate-800' : 'border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                        Derivative Time (<Formula tex="T_d" />)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0.00"
                        max="2.5"
                        step="0.01"
                        disabled={controllerParams.mode !== 'PID'}
                        value={controllerParams.Td}
                        onChange={(e) => handleTdChange(parseFloat(e.target.value) || 0)}
                        className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-xs text-purple-300 focus:outline-none focus:border-purple-400 disabled:opacity-50"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">min</span>
                    </div>
                  </div>

                  {/* Slider Control */}
                  <div className="my-3">
                    <input
                      type="range"
                      min="0.00"
                      max="1.50"
                      step="0.01"
                      disabled={controllerParams.mode !== 'PID'}
                      value={controllerParams.Td}
                      onChange={(e) => handleTdChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400 disabled:opacity-30"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>0.00 min (Off)</span>
                      <span>0.50 min</span>
                      <span>1.50 min</span>
                    </div>
                  </div>

                  {/* KaTeX Rate Display & Golden Rule Warning */}
                  <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800 text-center">
                    <div className="text-[11px] text-slate-300">
                      {controllerParams.mode !== 'PID' ? (
                        <span className="text-slate-500 font-mono">Rate Disabled</span>
                      ) : (
                        <Formula tex={`T_d = ${controllerParams.Td.toFixed(2)}\\text{ min} \\; (${tdSeconds}\\text{ s})`} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Golden Rule Warning if Td is set too small */}
              {controllerParams.mode === 'PID' && controllerParams.Td > 0 && controllerParams.Td < 0.1 && (
                <div className="bg-amber-950/40 border border-amber-500/40 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Module 310305dB Golden Rule:</strong> Derivative time{' '}
                      <Formula tex="T_d < 0.1\text{ min}" /> (6 seconds) yields negligible phase lead but amplifies noise into the valve!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleEliminateDerivative}
                    className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shrink-0 text-[11px]"
                  >
                    Set <Formula tex="T_d = 0" /> (Switch to PI)
                  </button>
                </div>
              )}

              {/* Manual Mode Controller Output (CO) Bar */}
              {controllerParams.mode === 'MANUAL' && (
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                        Direct Manual Valve Stem Control (<Formula tex="CO\\%" />)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        {manualCO.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={manualCO}
                    onChange={(e) => handleManualCOChange(parseFloat(e.target.value))}
                    className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />

                  {/* Step Nudge Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400">Step Bump:</span>
                      {[-10, -5, -1, 1, 5, 10].map((step) => (
                        <button
                          key={step}
                          type="button"
                          onClick={() => handleNudgeManualCO(step)}
                          className="px-2 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                        >
                          {step > 0 ? `+${step}%` : `${step}%`}
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] text-amber-400/80">
                      Use open-loop manual step testing to measure reaction curve <Formula tex="\Delta PV / \Delta CO" />
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom Test Workbench: Setpoint Step & Load Disturbance Triggers */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Test Setpoint Step:</span>
                  <button
                    type="button"
                    onClick={() => handleStepSP(-5)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono transition"
                  >
                    -5% SP
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepSP(5)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono transition"
                  >
                    +5% SP
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepSP(10)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono transition"
                  >
                    +10% SP
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Inject Process Disturbance:</span>
                  <button
                    type="button"
                    onClick={() => handleInjectDisturbance(10)}
                    className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono transition"
                  >
                    +10% Load
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInjectDisturbance(-10)}
                    className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono transition"
                  >
                    -10% Load
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInjectDisturbance(0)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 font-mono transition"
                  >
                    Clear (0%)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: SMART TUNING ADVISOR & KATEX FORMULA SUGGESTIONS */
            <div className="space-y-6">
              {/* Process Controllability Diagnostic Banner */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Process Controllability Parameter Assessment
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Dead-Time Ratio:</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                        isDeadTimeDominant
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isLagDominant
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      <Formula tex={`U_p = \\frac{\\tau_D}{\\tau_1} = ${Up.toFixed(2)}`} />
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Steady-State Gain:</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      <Formula tex={`K_p = ${Kp.toFixed(2)}\\text{ \\%PV/\\%CO}`} />
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Primary Lag Time:</span>
                    <span className="font-mono text-emerald-300 font-bold">
                      <Formula tex={`\\tau_1 = ${tau1.toFixed(2)}\\text{ min} \\; (${(tau1 * 60).toFixed(0)}\\text{ s})`} />
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Dead Time (Lag):</span>
                    <span className="font-mono text-purple-300 font-bold">
                      <Formula tex={`\\tau_D = ${tauD.toFixed(2)}\\text{ min} \\; (${(tauD * 60).toFixed(0)}\\text{ s})`} />
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-xs leading-relaxed text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                  {isLagDominant ? (
                    <span className="text-emerald-300">
                      ★ <strong>Lag Dominant Process (<Formula tex="U_p < 0.1" />):</strong> Highly controllable. Tight PI or PID tuning can achieve rapid settling with minimal risk of instability.
                    </span>
                  ) : isDeadTimeDominant ? (
                    <span className="text-rose-300">
                      ⚠️ <strong>Dead-Time Dominant Process (<Formula tex="U_p > 0.5" />):</strong> Extreme phase lag! Quarter-decay Ziegler-Nichols tuning will cause violent hunting. Use Lambda or IMC tuning with closed-loop time constant <Formula tex="\lambda \ge 3 \tau_D" />.
                    </span>
                  ) : (
                    <span className="text-cyan-300">
                      ✓ <strong>Balanced Process (<Formula tex="0.1 \le U_p \le 0.5" />):</strong> Standard industrial response. Both Ziegler-Nichols reaction curve and moderate Lambda tuning provide robust closed-loop regulation.
                    </span>
                  )}
                  {isHighNoise && (
                    <span className="block text-amber-300 mt-1">
                      ⚠️ Measurement noise RMS &ge; 0.15% detected. Avoid derivative action (<Formula tex="T_d = 0" />) to prevent valve chattering.
                    </span>
                  )}
                </div>
              </div>

              {/* Curated Method Cards with KaTeX Markup and 1-Click Apply */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Method 1: Lambda Tuning (Critically Damped, 0% Overshoot) */}
                <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                        Lambda / IMC Tuning
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                        DR = 0 (Smooth)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-3">
                      Designed for critically damped response with zero overshoot. Eliminates valve wear.
                    </p>

                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 mb-3 text-center text-xs">
                      <div className="text-slate-400 text-[11px] mb-1">Standard Lambda Formulas:</div>
                      <Formula tex="K_c = \frac{\tau_1}{K_p (\lambda + \tau_D)}, \quad T_i = \tau_1" displayMode />
                    </div>

                    <div className="space-y-2 text-xs mb-4">
                      <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                        <span className="text-slate-400">Conservative (<Formula tex="\lambda = 3\tau_D" />):</span>
                        <span className="font-mono text-emerald-300 font-bold">
                          <Formula tex={`K_c = ${tuningSuggestions.lambdaMod_Kc}, \; T_i = ${tuningSuggestions.lambdaMod_Ti}`} />
                        </span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                        <span className="text-slate-400">Fast (<Formula tex="\lambda = \tau_1" />):</span>
                        <span className="font-mono text-emerald-300 font-bold">
                          <Formula tex={`K_c = ${tuningSuggestions.lambdaFast_Kc}, \; T_i = ${tuningSuggestions.lambdaFast_Ti}`} />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleApplySuggestion(
                          'Conservative Lambda',
                          'PI',
                          tuningSuggestions.lambdaMod_Kc,
                          tuningSuggestions.lambdaMod_Ti,
                          0
                        )
                      }
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Apply Conservative Lambda (PI)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplySuggestion(
                          'Fast Lambda',
                          'PI',
                          tuningSuggestions.lambdaFast_Kc,
                          tuningSuggestions.lambdaFast_Ti,
                          0
                        )
                      }
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      Apply Fast Lambda (PI)
                    </button>
                  </div>
                </div>

                {/* Method 2: Ziegler-Nichols Open-Loop (Reaction Curve) */}
                <div className="bg-slate-950/70 border border-cyan-500/30 rounded-xl p-4 flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">
                        Z-N Reaction Curve
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                        DR = 0.25 (Quarter Decay)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-3">
                      Classic Table 2 formulas for rapid setpoint recovery and load disturbance rejection.
                    </p>

                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 mb-3 text-center text-xs">
                      <div className="text-slate-400 text-[11px] mb-1">Open-Loop FODT Formulas:</div>
                      <Formula tex="K_c = \frac{0.9\tau_1}{K_p \tau_D}, \quad T_i = 3.33 \tau_D" displayMode />
                    </div>

                    <div className="space-y-2 text-xs mb-4">
                      <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                        <span className="text-slate-400">PI Settings:</span>
                        <span className="font-mono text-cyan-300 font-bold">
                          <Formula tex={`K_c = ${tuningSuggestions.znPI_Kc}, \; T_i = ${tuningSuggestions.znPI_Ti}`} />
                        </span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                        <span className="text-slate-400">PID Settings:</span>
                        <span className="font-mono text-cyan-300 font-bold">
                          <Formula tex={`K_c = ${tuningSuggestions.znPID_Kc}, \; T_d = ${tuningSuggestions.znPID_Td}`} />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleApplySuggestion(
                          'Z-N Reaction Curve PI',
                          'PI',
                          tuningSuggestions.znPI_Kc,
                          tuningSuggestions.znPI_Ti,
                          0
                        )
                      }
                      className="w-full py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Apply Z-N Reaction PI
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplySuggestion(
                          'Z-N Reaction Curve PID',
                          'PID',
                          tuningSuggestions.znPID_Kc,
                          tuningSuggestions.znPID_Ti,
                          tuningSuggestions.znPID_Td
                        )
                      }
                      className="w-full py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      Apply Z-N Reaction PID
                    </button>
                  </div>
                </div>

                {/* Method 3: Closed-Loop Ultimate Gain & Relay Tuning */}
                <div className="bg-slate-950/70 border border-purple-500/30 rounded-xl p-4 flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">
                        Closed-Loop Ultimate Gain
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                        Table 1 Formulas
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-3">
                      Derived from sustained frequency response (<Formula tex="K_{cu}" /> and <Formula tex="P_u" />).
                    </p>

                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 mb-3 text-center text-xs">
                      <div className="text-slate-400 text-[11px] mb-1">Ultimate Period & Gain:</div>
                      <Formula tex={`K_{cu} \\approx ${tuningSuggestions.estimatedKcu}, \\quad P_u \\approx ${tuningSuggestions.estimatedPu}\\text{ min}`} displayMode />
                    </div>

                    <div className="space-y-2 text-xs mb-4">
                      <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                        <span className="text-slate-400">Closed-Loop PI:</span>
                        <span className="font-mono text-purple-300 font-bold">
                          <Formula tex={`K_c = ${tuningSuggestions.clPI_Kc}, \; T_i = ${tuningSuggestions.clPI_Ti}`} />
                        </span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                        <span className="text-slate-400">Closed-Loop PID:</span>
                        <span className="font-mono text-purple-300 font-bold">
                          <Formula tex={`K_c = ${tuningSuggestions.clPID_Kc}, \; T_d = ${tuningSuggestions.clPID_Td}`} />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleApplySuggestion(
                          'Closed-Loop PI',
                          'PI',
                          tuningSuggestions.clPI_Kc,
                          tuningSuggestions.clPI_Ti,
                          0
                        )
                      }
                      className="w-full py-1.5 px-3 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Apply Closed-Loop PI
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplySuggestion(
                          'Closed-Loop PID',
                          'PID',
                          tuningSuggestions.clPID_Kc,
                          tuningSuggestions.clPID_Ti,
                          tuningSuggestions.clPID_Td
                        )
                      }
                      className="w-full py-1.5 px-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      Apply Closed-Loop PID
                    </button>
                  </div>
                </div>
              </div>

              {/* Troubleshooting Quick-Fixes Bar */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-slate-200 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Module 310305dB Golden Rules — Field Troubleshooting Quick-Fixes</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={handleHalveGain}
                    className="p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition hover:border-amber-500/40"
                  >
                    <div className="font-bold text-amber-300 mb-1 flex items-center justify-between">
                      <span>Loop Hunting / Cycling</span>
                      <Formula tex="K_c \to 0.5 K_c" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      If oscillation period is roughly <Formula tex="4 \tau_D" />, dynamic gain is too high. Halve gain immediately.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={handleDoubleReset}
                    className="p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition hover:border-emerald-500/40"
                  >
                    <div className="font-bold text-emerald-300 mb-1 flex items-center justify-between">
                      <span>Sluggish Rolling Drift</span>
                      <Formula tex="T_i \to 2.0 T_i" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Phase lag from integral action causes slow wandering. Double integral time to stabilize loop.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={handleEliminateDerivative}
                    className="p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition hover:border-purple-500/40"
                  >
                    <div className="font-bold text-purple-300 mb-1 flex items-center justify-between">
                      <span>Stem Chatter / Noise</span>
                      <Formula tex="T_d = 0" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Derivative amplifies noise pulses. Eliminate rate action (<Formula tex="T_d = 0" />) to prevent packing blowout.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
