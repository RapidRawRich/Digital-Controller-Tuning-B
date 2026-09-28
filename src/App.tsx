import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProcessSimulation } from './engine/simEngine';
import { SCENARIO_PRESETS } from './engine/presets';
import { Navbar } from './components/Navbar';
import { ScopeChart } from './components/ScopeChart';
import { Lab1ProcessTypes } from './components/Lab1ProcessTypes';
import { Lab2Robustness } from './components/Lab2Robustness';
import { Lab3OpenLoopTuning } from './components/Lab3OpenLoopTuning';
import { Lab4ClosedLoopTuning } from './components/Lab4ClosedLoopTuning';
import { Lab5IndustrialLoops } from './components/Lab5IndustrialLoops';
import { SelfTestQuiz } from './components/SelfTestQuiz';
import { ReferenceHandbook } from './components/ReferenceHandbook';
import type { TelemetryPoint } from './types/simulation';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('lab1');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('lab1-self-regulating');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);

  // Simulation engine instance
  const simRef = useRef<ProcessSimulation | null>(null);

  if (!simRef.current) {
    const defaultPreset = SCENARIO_PRESETS[0];
    simRef.current = new ProcessSimulation(
      defaultPreset.process,
      defaultPreset.controller,
      defaultPreset.targetSP,
      defaultPreset.process.initialPV
    );
  }

  const sim = simRef.current;

  // Apply scenario preset
  const handleApplyPreset = useCallback((presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = SCENARIO_PRESETS.find(p => p.id === presetId);
    if (!preset || !sim) return;

    sim.updateProcess(preset.process);
    sim.updateController(preset.controller);
    sim.resetSimulation(preset.targetSP, preset.process.initialPV);
    setTelemetry([...sim.getTelemetry()]);
  }, [sim]);

  // Tab switching with contextual preset auto-selection
  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'lab1' && !selectedPresetId.startsWith('lab1')) {
      handleApplyPreset('lab1-self-regulating');
    } else if (tabId === 'lab2' && !selectedPresetId.startsWith('lab2')) {
      handleApplyPreset('lab2-quarter-decay');
    } else if (tabId === 'lab3' && !selectedPresetId.startsWith('lab3')) {
      handleApplyPreset('lab3-benchmark1-standard');
    } else if (tabId === 'lab4') {
      handleApplyPreset('lab3-benchmark1-standard');
    } else if (tabId === 'lab5' && !selectedPresetId.startsWith('lab5')) {
      handleApplyPreset('lab5-liquid-flow');
    }
  };

  // Toggle play/pause
  const handleTogglePlay = () => {
    setIsRunning(prev => !prev);
  };

  // Reset simulation
  const handleReset = () => {
    if (!sim) return;
    const currentSP = sim.getTelemetry().length > 0 ? sim.getTelemetry()[sim.getTelemetry().length - 1].sp : 50;
    const currentPV = sim.getProcessParams().initialPV;
    sim.resetSimulation(currentSP, currentPV);
    setTelemetry([...sim.getTelemetry()]);
  };

  // Main high-frequency continuous simulation loop
  useEffect(() => {
    if (!sim) return;

    // Initialize telemetry with baseline history immediately
    setTelemetry([...sim.getTelemetry()]);

    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const elapsedSec = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isRunning && elapsedSec > 0 && elapsedSec < 0.25) {
        // Real-time process seconds: elapsedSec * simSpeed
        // Convert to minutes for differential equations
        const simDtMinutes = (elapsedSec * simSpeed) / 60;
        sim.step(simDtMinutes);
        setTelemetry([...sim.getTelemetry()]);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, sim, simSpeed]);

  const activePreset = SCENARIO_PRESETS.find(p => p.id === selectedPresetId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top SCADA DCS Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isRunning={isRunning}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Real-Time Rolling ScopeChart is prominently displayed for all interactive labs (Labs 1 to 5) */}
        {activeTab !== 'quiz' && activeTab !== 'handbook' && (
          <div className="w-full">
            <ScopeChart
              telemetry={telemetry}
              isRunning={isRunning}
              onTogglePlay={handleTogglePlay}
              onReset={handleReset}
              simSpeed={simSpeed}
              onSimSpeedChange={setSimSpeed}
              statusBadgeText={activePreset ? activePreset.name : 'DCS ACTIVE'}
              statusBadgeColor={
                activePreset?.process.type === 'runaway'
                  ? 'rose'
                  : activePreset?.process.stiction && activePreset.process.stiction > 0
                  ? 'amber'
                  : 'emerald'
              }
              moduleTitle={`ILM 310305dB • ${activePreset?.name || 'Digital Controller Tuning'}`}
            />
          </div>
        )}

        {/* Dynamic Lab / Quiz / Handbook views */}
        <div className="w-full">
          {activeTab === 'lab1' && (
            <Lab1ProcessTypes
              sim={sim}
              onApplyPreset={handleApplyPreset}
              selectedPresetId={selectedPresetId}
            />
          )}

          {activeTab === 'lab2' && (
            <Lab2Robustness
              sim={sim}
              onApplyPreset={handleApplyPreset}
              selectedPresetId={selectedPresetId}
            />
          )}

          {activeTab === 'lab3' && (
            <Lab3OpenLoopTuning
              sim={sim}
              onApplyPreset={handleApplyPreset}
              selectedPresetId={selectedPresetId}
            />
          )}

          {activeTab === 'lab4' && (
            <Lab4ClosedLoopTuning
              sim={sim}
              onApplyPreset={handleApplyPreset}
              selectedPresetId={selectedPresetId}
            />
          )}

          {activeTab === 'lab5' && (
            <Lab5IndustrialLoops
              sim={sim}
              onApplyPreset={handleApplyPreset}
              selectedPresetId={selectedPresetId}
            />
          )}

          {activeTab === 'quiz' && <SelfTestQuiz />}

          {activeTab === 'handbook' && <ReferenceHandbook />}
        </div>
      </main>

      {/* Industrial Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>
            Alberta Skilled Trades & Apprenticeship Education • <strong>Module 310305dB: Digital Controller Tuning - Part B</strong>
          </span>
          <span className="font-mono text-slate-600">
            DCS Scope Engine 60FPS • React 19 • KaTeX • Tailwind CSS
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
