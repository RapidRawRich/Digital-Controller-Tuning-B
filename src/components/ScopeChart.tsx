import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { TelemetryPoint } from '../types/simulation';
import { Play, Pause, RotateCcw, Crosshair, Eye, Settings2, ZoomIn } from 'lucide-react';

interface ScopeChartProps {
  telemetry: TelemetryPoint[];
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  statusBadgeText?: string;
  statusBadgeColor?: 'emerald' | 'amber' | 'rose' | 'cyan';
  moduleTitle?: string;
  timeWindowSeconds?: number;
  onTimeWindowChange?: (sec: number) => void;
  activeLabId?: string;
}

export const ScopeChart: React.FC<ScopeChartProps> = ({
  telemetry,
  isRunning,
  onTogglePlay,
  onReset,
  statusBadgeText = 'ACTIVE',
  statusBadgeColor = 'emerald',
  moduleTitle = 'ILM 310305dB • Digital Controller Tuning - Part B',
  timeWindowSeconds = 60,
  onTimeWindowChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Time window selection (30s, 60s, 120s, 300s)
  const [windowSec, setWindowSec] = useState<number>(timeWindowSeconds);

  // Signal visibility toggles
  const [showSP, setShowSP] = useState(true);
  const [showPV, setShowPV] = useState(true);
  const [showCO, setShowCO] = useState(true);
  const [showError, setShowError] = useState(false);
  const [showValveStem, setShowValveStem] = useState(false);
  const [showPTerm, setShowPTerm] = useState(false);
  const [showITerm, setShowITerm] = useState(false);
  const [showDTerm, setShowDTerm] = useState(false);

  // Caliper & Inspector state
  const [inspectPoint, setInspectPoint] = useState<TelemetryPoint | null>(null);
  const [caliperStart, setCaliperStart] = useState<{ x: number; y: number; time: number; val: number } | null>(null);
  const [caliperEnd, setCaliperEnd] = useState<{ x: number; y: number; time: number; val: number } | null>(null);
  const [isCaliperActive, setIsCaliperActive] = useState(false);

  const handleWindowChange = (sec: number) => {
    setWindowSec(sec);
    if (onTimeWindowChange) onTimeWindowChange(sec);
  };

  // Get current live telemetry point
  const current = useMemo(() => {
    if (!telemetry || telemetry.length === 0) {
      return { sp: 50, pv: 50, co: 40, error: 0, pTerm: 0, iTerm: 0, dTerm: 0, valveStem: 40 };
    }
    return telemetry[telemetry.length - 1];
  }, [telemetry]);

  // Main canvas render loop
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    // Clear background: Industrial dark slate canvas
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Padding inside canvas
    const padL = 44 * dpr;
    const padR = 20 * dpr;
    const padT = 24 * dpr;
    const padB = 30 * dpr;

    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    if (plotW <= 0 || plotH <= 0) return;

    // Grid properties
    const yMin = 0;
    const yMax = 100;
    const yRange = yMax - yMin;

    const windowMinutes = windowSec / 60;
    const latestTime = telemetry.length > 0 ? telemetry[telemetry.length - 1].time : 0;
    const startTime = latestTime - windowMinutes;

    const timeToX = (t: number) => padL + ((t - startTime) / windowMinutes) * plotW;
    const valToY = (v: number) => padT + plotH - ((v - yMin) / yRange) * plotH;

    // 1. Draw Grid lines and Y-axis scale
    ctx.lineWidth = 1 * dpr;
    ctx.strokeStyle = '#1e293b';
    ctx.fillStyle = '#64748b';
    ctx.font = `${11 * dpr}px ui-monospace, SFMono-Regular, monospace`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // Horizontal Y grid lines every 10% (major) & 20% labels
    for (let yVal = 0; yVal <= 100; yVal += 10) {
      const y = valToY(yVal);
      ctx.beginPath();
      ctx.strokeStyle = yVal === 50 ? '#334155' : (yVal % 20 === 0 ? '#1e293b' : '#131b2e');
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();

      if (yVal % 20 === 0) {
        ctx.fillText(`${yVal}%`, padL - 8 * dpr, y);
      }
    }

    // Vertical X time grid lines
    const timeStepSec = windowSec <= 60 ? 10 : (windowSec <= 120 ? 20 : 60);
    const timeStepMin = timeStepSec / 60;
    const firstGridTime = Math.ceil(startTime / timeStepMin) * timeStepMin;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let t = firstGridTime; t <= latestTime; t += timeStepMin) {
      const x = timeToX(t);
      if (x >= padL && x <= padL + plotW) {
        ctx.beginPath();
        ctx.strokeStyle = '#1e293b';
        ctx.moveTo(x, padT);
        ctx.lineTo(x, padT + plotH);
        ctx.stroke();

        // Format relative seconds or minutes
        const diffSec = Math.round((t - latestTime) * 60);
        const label = diffSec === 0 ? 'NOW' : `${diffSec}s`;
        ctx.fillStyle = diffSec === 0 ? '#38bdf8' : '#64748b';
        ctx.fillText(label, x, padT + plotH + 8 * dpr);
      }
    }

    // Border around plot area
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1 * dpr;
    ctx.strokeRect(padL, padT, plotW, plotH);

    // 2. Filter data within time window
    const visibleData = telemetry.filter(
      p => p.time >= startTime - 0.05 && p.time <= latestTime + 0.05
    );

    if (visibleData.length < 2) return;

    // Helper to draw a polyline signal
    const drawSignal = (
      valFn: (p: TelemetryPoint) => number,
      color: string,
      lineWidth: number = 2,
      isDashed: boolean = false
    ) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(padL, padT, plotW, plotH);
      ctx.clip();

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth * dpr;
      if (isDashed) {
        ctx.setLineDash([6 * dpr, 4 * dpr]);
      } else {
        ctx.setLineDash([]);
      }

      let started = false;
      for (let i = 0; i < visibleData.length; i++) {
        const pt = visibleData[i];
        const x = timeToX(pt.time);
        const y = valToY(valFn(pt));

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.restore();
    };

    // Draw toggled signals (Back-to-front order)
    if (showDTerm) drawSignal(p => 50 + p.dTerm, '#38bdf8', 1.5, true); // Sky
    if (showITerm) drawSignal(p => 50 + p.iTerm, '#6366f1', 1.5, true); // Indigo
    if (showPTerm) drawSignal(p => 50 + p.pTerm, '#a855f7', 1.5, true); // Purple
    if (showError) drawSignal(p => 50 + p.error, '#eab308', 1.5, true); // Yellow
    if (showValveStem) drawSignal(p => p.valveStem, '#fb923c', 1.8, true); // Orange
    if (showCO) drawSignal(p => p.co, '#06b6d4', 2.0, false); // Cyan
    if (showSP) drawSignal(p => p.sp, '#f59e0b', 2.0, true);  // Amber dashed
    if (showPV) drawSignal(p => p.pv, '#10b981', 2.5, false); // Emerald solid

    // 3. Draw Calipers if active
    if (caliperStart) {
      ctx.save();
      ctx.strokeStyle = '#f43f5e';
      ctx.fillStyle = '#f43f5e';
      ctx.lineWidth = 1.5 * dpr;
      ctx.setLineDash([4 * dpr, 2 * dpr]);

      // Start line
      ctx.beginPath();
      ctx.moveTo(caliperStart.x, padT);
      ctx.lineTo(caliperStart.x, padT + plotH);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(caliperStart.x, caliperStart.y, 4 * dpr, 0, Math.PI * 2);
      ctx.fill();

      // End line if placed
      if (caliperEnd) {
        ctx.beginPath();
        ctx.moveTo(caliperEnd.x, padT);
        ctx.lineTo(caliperEnd.x, padT + plotH);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(caliperEnd.x, caliperEnd.y, 4 * dpr, 0, Math.PI * 2);
        ctx.fill();

        // Shaded delta span
        ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
        const minX = Math.min(caliperStart.x, caliperEnd.x);
        const maxX = Math.max(caliperStart.x, caliperEnd.x);
        ctx.fillRect(minX, padT, maxX - minX, plotH);

        // Caliper measurement box
        const dtMin = Math.abs(caliperEnd.time - caliperStart.time);
        const dtSec = dtMin * 60;
        const dVal = caliperEnd.val - caliperStart.val;

        const boxX = (minX + maxX) / 2;
        const boxY = padT + 20 * dpr;

        ctx.fillStyle = '#1e1b4b';
        ctx.strokeStyle = '#a855f7';
        ctx.setLineDash([]);
        ctx.lineWidth = 1 * dpr;
        const text = `Δt: ${dtMin.toFixed(2)} min (${dtSec.toFixed(1)}s) | ΔPV: ${dVal.toFixed(1)}%`;
        ctx.font = `bold ${11 * dpr}px ui-monospace, SFMono-Regular, monospace`;
        const textW = ctx.measureText(text).width + 16 * dpr;

        ctx.fillRect(boxX - textW / 2, boxY - 14 * dpr, textW, 22 * dpr);
        ctx.strokeRect(boxX - textW / 2, boxY - 14 * dpr, textW, 22 * dpr);

        ctx.fillStyle = '#e0e7ff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, boxX, boxY - 3 * dpr);
      }
      ctx.restore();
    }
  }, [
    telemetry,
    windowSec,
    showSP,
    showPV,
    showCO,
    showError,
    showValveStem,
    showPTerm,
    showITerm,
    showDTerm,
    caliperStart,
    caliperEnd,
  ]);

  // Sync canvas size with CSS pixels and DPR
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const cssWidth = rect.width;
      const cssHeight = 360; // crisp standard SCADA chart height

      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      drawChart();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawChart]);

  // RequestAnimationFrame redraw when running
  useEffect(() => {
    let animId: number;
    const loop = () => {
      drawChart();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [drawChart]);

  // Handle canvas mouse clicks for caliper measurement
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCaliperActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const clickX = (e.clientX - rect.left) * dpr;
    const clickY = (e.clientY - rect.top) * dpr;

    const padL = 44 * dpr;
    const padR = 20 * dpr;
    const padT = 24 * dpr;
    const padB = 30 * dpr;
    const plotW = canvas.width - padL - padR;
    const plotH = canvas.height - padT - padB;

    const windowMinutes = windowSec / 60;
    const latestTime = telemetry.length > 0 ? telemetry[telemetry.length - 1].time : 0;
    const startTime = latestTime - windowMinutes;

    const clickedTime = startTime + ((clickX - padL) / plotW) * windowMinutes;
    const clickedVal = 100 - ((clickY - padT) / plotH) * 100;

    if (!caliperStart || (caliperStart && caliperEnd)) {
      setCaliperStart({ x: clickX, y: clickY, time: clickedTime, val: clickedVal });
      setCaliperEnd(null);
    } else {
      setCaliperEnd({ x: clickX, y: clickY, time: clickedTime, val: clickedVal });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || telemetry.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mouseX = (e.clientX - rect.left) * dpr;

    const padL = 44 * dpr;
    const padR = 20 * dpr;
    const plotW = canvas.width - padL - padR;

    const windowMinutes = windowSec / 60;
    const latestTime = telemetry[telemetry.length - 1].time;
    const startTime = latestTime - windowMinutes;

    const hoverTime = startTime + ((mouseX - padL) / plotW) * windowMinutes;

    // Find closest telemetry point
    let closest = telemetry[0];
    let minDiff = Math.abs(closest.time - hoverTime);
    for (let i = 1; i < telemetry.length; i++) {
      const diff = Math.abs(telemetry[i].time - hoverTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = telemetry[i];
      }
    }
    setInspectPoint(closest);
  };

  const handleCanvasMouseLeave = () => {
    setInspectPoint(null);
  };

  return (
    <div className="w-full flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden mb-6">
      {/* 1. ANTI-JITTER TOP HEADER BAR */}
      <div className="h-14 px-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3">
        {/* Left side: Status badge + Module Title (Truncate) */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                !isRunning
                  ? 'bg-amber-400 animate-pulse'
                  : statusBadgeColor === 'emerald'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                  : statusBadgeColor === 'rose'
                  ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                  : 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
              }`}
            />
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded tracking-wide uppercase ${
                !isRunning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : statusBadgeColor === 'emerald'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : statusBadgeColor === 'rose'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {isRunning ? statusBadgeText : 'PAUSED'}
            </span>
          </div>

          <h2 className="text-sm font-medium text-slate-300 truncate" title={moduleTitle}>
            {moduleTitle}
          </h2>
        </div>

        {/* Right side: Fixed-width Anti-Jitter Control Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Caliper Measurement Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsCaliperActive(!isCaliperActive);
              if (isCaliperActive) {
                setCaliperStart(null);
                setCaliperEnd(null);
              }
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              isCaliperActive
                ? 'bg-rose-600/30 text-rose-300 border-rose-500/50 shadow-sm'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Measure delta time, period Pu, or decay peaks on chart"
          >
            <Crosshair className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Caliper</span>
          </button>

          {/* Time Span Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            {[30, 60, 120, 300].map(sec => (
              <button
                key={sec}
                type="button"
                onClick={() => handleWindowChange(sec)}
                className={`px-2 py-1 rounded transition-colors ${
                  windowSec === sec
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sec < 60 ? `${sec}s` : `${sec / 60}m`}
              </button>
            ))}
          </div>

          {/* Pause / Resume Button (w-24 fixed) */}
          <button
            type="button"
            onClick={onTogglePlay}
            className={`w-24 h-8 px-3 rounded-lg text-xs font-semibold shrink-0 flex items-center justify-center gap-1.5 transition-all shadow-md ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </>
            )}
          </button>

          {/* Reset Button (w-20 fixed) */}
          <button
            type="button"
            onClick={onReset}
            className="w-20 h-8 px-3 rounded-lg text-xs font-semibold shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 2. DEDICATED TELEMETRY SUB-BAR (No layout jitter, tabular numbers) */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-y-2 gap-x-6 text-xs font-mono-numbers">
        {/* Live Readouts */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* SP */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-400 text-[11px] font-sans">SP:</span>
            <span className="text-amber-400 font-bold min-w-[3.6rem] text-right">
              {current.sp.toFixed(1)}%
            </span>
          </div>

          {/* PV */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400 text-[11px] font-sans">PV:</span>
            <span className="text-emerald-400 font-bold min-w-[3.6rem] text-right">
              {current.pv.toFixed(1)}%
            </span>
          </div>

          {/* CO */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded border border-cyan-500/20">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-400 text-[11px] font-sans">CO:</span>
            <span className="text-cyan-400 font-bold min-w-[3.6rem] text-right">
              {current.co.toFixed(1)}%
            </span>
          </div>

          {/* Error (e = SP - PV) */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-slate-400 text-[11px] font-sans">Error (e):</span>
            <span
              className={`font-semibold min-w-[3.6rem] text-right ${
                Math.abs(current.error) > 2 ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {(current.sp - current.pv).toFixed(1)}%
            </span>
          </div>

          {/* Valve Stem Position (if stiction is engaged) */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded border border-orange-500/20">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-slate-400 text-[11px] font-sans">Stem:</span>
            <span className="text-orange-300 font-semibold min-w-[3.6rem] text-right">
              {current.valveStem.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Signal Legend Checkboxes */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-sans">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mr-1">Signals:</span>
          <label className="flex items-center gap-1 cursor-pointer hover:text-amber-300">
            <input
              type="checkbox"
              checked={showSP}
              onChange={e => setShowSP(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span className="text-amber-400 font-medium">SP</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer hover:text-emerald-300">
            <input
              type="checkbox"
              checked={showPV}
              onChange={e => setShowPV(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span className="text-emerald-400 font-medium">PV</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer hover:text-cyan-300">
            <input
              type="checkbox"
              checked={showCO}
              onChange={e => setShowCO(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
            <span className="text-cyan-400 font-medium">CO</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer hover:text-orange-300">
            <input
              type="checkbox"
              checked={showValveStem}
              onChange={e => setShowValveStem(e.target.checked)}
              className="accent-orange-500 rounded"
            />
            <span className="text-orange-400 font-medium">Stem</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer hover:text-purple-300">
            <input
              type="checkbox"
              checked={showPTerm}
              onChange={e => setShowPTerm(e.target.checked)}
              className="accent-purple-500 rounded"
            />
            <span className="text-purple-400 font-medium">P-Term</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer hover:text-indigo-300">
            <input
              type="checkbox"
              checked={showITerm}
              onChange={e => setShowITerm(e.target.checked)}
              className="accent-indigo-500 rounded"
            />
            <span className="text-indigo-400 font-medium">I-Term</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer hover:text-sky-300">
            <input
              type="checkbox"
              checked={showDTerm}
              onChange={e => setShowDTerm(e.target.checked)}
              className="accent-sky-500 rounded"
            />
            <span className="text-sky-400 font-medium">D-Term</span>
          </label>
        </div>
      </div>

      {/* 3. HTML5 CANVAS 2D ROLLING OSCILLOSCOPE */}
      <div
        ref={containerRef}
        className="w-full relative bg-[#090d16] cursor-crosshair select-none"
        style={{ minHeight: '340px' }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
          className="block w-full h-[360px]"
        />

        {/* Inspector Tooltip on Hover */}
        {inspectPoint && !caliperEnd && (
          <div className="absolute top-2 left-14 bg-slate-950/90 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg shadow-xl text-xs font-mono-numbers pointer-events-none flex items-center gap-3 backdrop-blur-md">
            <span className="text-slate-400">t: {(inspectPoint.time * 60).toFixed(1)}s</span>
            <span className="text-amber-400">SP: {inspectPoint.sp.toFixed(1)}%</span>
            <span className="text-emerald-400">PV: {inspectPoint.pv.toFixed(1)}%</span>
            <span className="text-cyan-400">CO: {inspectPoint.co.toFixed(1)}%</span>
            <span className="text-orange-400">Stem: {inspectPoint.valveStem.toFixed(1)}%</span>
          </div>
        )}

        {/* Caliper Instruction Banner */}
        {isCaliperActive && !caliperEnd && (
          <div className="absolute bottom-2 left-14 bg-rose-950/80 border border-rose-600/50 text-rose-200 px-3 py-1 rounded text-xs pointer-events-none shadow-md">
            {caliperStart
              ? 'Click second point to measure period Pu, dead time L, or peak decay ratio DR'
              : 'Click first peak or disturbance onset on the chart'}
          </div>
        )}
      </div>
    </div>
  );
};
