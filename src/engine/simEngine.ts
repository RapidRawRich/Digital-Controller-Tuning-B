import type { ProcessParams, ControllerParams, TelemetryPoint } from '../types/simulation';
import { PIDController } from './controller';

export class ProcessSimulation {
  private processParams: ProcessParams;
  private controller: PIDController;
  private controllerParams: ControllerParams;

  // Process State
  private simTime: number = 0; // minutes
  private pvActual: number = 50;
  private pvSensor: number = 50;
  private pvFiltered: number = 50;
  private targetSP: number = 50;
  private loadDisturbance: number = 0;
  private transientDisturbance: number = 0;
  private manualCO: number = 40;
  private isManual: boolean = false;

  // Valve stiction state
  private valveStem: number = 40;

  // Dead time circular buffer
  private deadTimeQueue: Array<{ time: number; stem: number }> = [];

  // Telemetry rolling buffer for strip chart
  private history: TelemetryPoint[] = [];
  private lastSampleTime: number = -999;
  private sampleIntervalMin: number = 0.05 / 60; // 0.05s (20Hz) sample rate in minutes
  private maxRetainedMinutes: number = 8.0; // Keep 8 full minutes of history (well exceeds 5m max window)

  constructor(
    processParams: ProcessParams,
    controllerParams: ControllerParams,
    initialSP: number = 50,
    initialPV: number = 50
  ) {
    this.processParams = { ...processParams };
    this.controllerParams = { ...controllerParams };
    this.targetSP = initialSP;
    this.pvActual = initialPV;
    this.pvSensor = initialPV;
    this.pvFiltered = initialPV;
    this.valveStem = controllerParams.bias;
    this.manualCO = controllerParams.bias;
    this.isManual = controllerParams.mode === 'MANUAL';

    this.controller = new PIDController(controllerParams, initialSP, initialPV);

    this.preSeedHistory(8.0); // pre-seed 8 full minutes so 30s, 60s, 2m, and 5m windows are 100% full
  }

  /**
   * Pre-seed telemetry buffer so graphs are populated edge-to-edge on load
   */
  public preSeedHistory(durationMinutes: number = 8.0): void {
    const dt = this.sampleIntervalMin;
    const steps = Math.ceil(durationMinutes / dt);
    const startTime = -durationMinutes;

    this.history = [];
    this.deadTimeQueue = [];

    const initialCO = this.controllerParams.bias;
    this.valveStem = initialCO;
    this.pvActual = this.processParams.initialPV;
    this.pvSensor = this.processParams.initialPV;
    this.pvFiltered = this.processParams.initialPV;

    // Fill dead time buffer
    for (let t = startTime - Math.max(0.5, this.processParams.tauD * 2); t <= 0; t += dt) {
      this.deadTimeQueue.push({ time: t, stem: initialCO });
    }

    for (let i = 0; i <= steps; i++) {
      const t = startTime + i * dt;
      this.history.push({
        time: t,
        sp: this.targetSP,
        pv: this.processParams.initialPV,
        pvRaw: this.processParams.initialPV,
        co: initialCO,
        valveStem: initialCO,
        error: this.targetSP - this.processParams.initialPV,
        pTerm: 0,
        iTerm: initialCO - this.controllerParams.bias,
        dTerm: 0,
        loadDisturbance: 0,
      });
    }

    this.simTime = 0;
    this.lastSampleTime = 0;
  }

  // Observer listeners for parameter updates
  private listeners: Array<() => void> = [];

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify(): void {
    for (const fn of this.listeners) {
      try {
        fn();
      } catch (err) {
        console.error('Error in ProcessSimulation listener:', err);
      }
    }
  }

  public updateProcess(newParams: Partial<ProcessParams>): void {
    this.processParams = { ...this.processParams, ...newParams };
    this.notify();
  }

  public updateController(newParams: Partial<ControllerParams>): void {
    this.controllerParams = { ...this.controllerParams, ...newParams };
    this.controller.updateParams(newParams);
    if (newParams.mode !== undefined) {
      this.isManual = newParams.mode === 'MANUAL';
    }
    this.notify();
  }

  public setSetpoint(sp: number): void {
    this.targetSP = sp;
    this.notify();
  }

  public setLoadDisturbance(load: number): void {
    this.loadDisturbance = load;
    this.notify();
  }

  public setTransientDisturbance(trans: number): void {
    this.transientDisturbance = trans;
    this.notify();
  }

  public setManualMode(manual: boolean, coValue?: number): void {
    this.isManual = manual;
    if (coValue !== undefined) {
      this.manualCO = coValue;
      this.controller.setManualOutput(coValue);
    }
    this.controllerParams.mode = manual ? 'MANUAL' : (this.controllerParams.mode === 'MANUAL' ? 'PI' : this.controllerParams.mode);
    this.notify();
  }

  public setManualCO(co: number): void {
    this.manualCO = Math.max(0, Math.min(100, co));
    this.controller.setManualOutput(this.manualCO);
    this.notify();
  }

  public resetSimulation(sp: number = 50, pv: number = 50): void {
    this.targetSP = sp;
    this.pvActual = pv;
    this.pvSensor = pv;
    this.pvFiltered = pv;
    this.loadDisturbance = 0;
    this.transientDisturbance = 0;
    this.valveStem = this.controllerParams.bias;
    this.manualCO = this.controllerParams.bias;
    this.controller.reset(sp, pv);
    this.preSeedHistory(8.0);
    this.notify();
  }

  public getTelemetry(): TelemetryPoint[] {
    return this.history;
  }

  public getLatestTelemetry(): TelemetryPoint {
    if (this.history.length === 0) {
      return {
        time: 0,
        sp: this.targetSP,
        pv: this.pvFiltered,
        pvRaw: this.pvActual,
        co: this.controllerParams.bias,
        valveStem: this.valveStem,
        error: this.targetSP - this.pvFiltered,
        pTerm: 0,
        iTerm: 0,
        dTerm: 0,
        loadDisturbance: 0,
      };
    }
    return this.history[this.history.length - 1];
  }

  public getProcessParams(): ProcessParams {
    return { ...this.processParams };
  }

  public getControllerParams(): ControllerParams {
    return { ...this.controllerParams };
  }

  public getSimTime(): number {
    return this.simTime;
  }

  /**
   * Advances simulation by dt minutes
   */
  public step(dt: number): TelemetryPoint {
    this.simTime += dt;

    // 1. Controller execution
    const ctrlStep = this.controller.step(
      this.targetSP,
      this.pvFiltered,
      dt,
      this.isManual,
      this.manualCO
    );

    const controllerCO = ctrlStep.co;

    // 2. Valve Stiction Model (Chou / Choudhury model)
    const stictionBand = this.processParams.stiction;
    if (stictionBand > 0) {
      const delta = controllerCO - this.valveStem;
      if (Math.abs(delta) > stictionBand) {
        const slip = Math.sign(delta) * (Math.abs(delta) - stictionBand * 0.15);
        this.valveStem += slip;
      }
    } else {
      this.valveStem = controllerCO;
    }
    this.valveStem = Math.max(0, Math.min(100, this.valveStem));

    // 3. Dead Time Delay Buffer
    this.deadTimeQueue.push({ time: this.simTime, stem: this.valveStem });

    // Find delayed stem position at (simTime - tauD)
    const delayedTime = this.simTime - this.processParams.tauD;
    let delayedStem = this.valveStem;

    while (this.deadTimeQueue.length > 2 && this.deadTimeQueue[1].time < delayedTime) {
      this.deadTimeQueue.shift();
    }

    if (this.deadTimeQueue.length >= 2) {
      const p0 = this.deadTimeQueue[0];
      const p1 = this.deadTimeQueue[1];
      const span = p1.time - p0.time;
      const frac = span > 0 ? (delayedTime - p0.time) / span : 0;
      delayedStem = p0.stem + frac * (p1.stem - p0.stem);
    } else if (this.deadTimeQueue.length === 1) {
      delayedStem = this.deadTimeQueue[0].stem;
    }

    // 4. Process Dynamic Differential Equations
    const effectiveCO = delayedStem + this.transientDisturbance;
    const { type, Kp, tau1, Ki, runawayAlpha, ambientPV } = this.processParams;
    const baseCO = this.controllerParams.bias;

    if (type === 'self-regulating') {
      const dPV = ((ambientPV + Kp * (effectiveCO + this.loadDisturbance - baseCO)) - this.pvActual) / Math.max(0.005, tau1);
      this.pvActual += dPV * dt;
    } else if (type === 'integrating') {
      const dPV = Ki * ((effectiveCO + this.loadDisturbance) - baseCO);
      this.pvActual += dPV * dt;
      this.pvActual = Math.max(0, Math.min(100, this.pvActual));
    } else if (type === 'runaway') {
      const tempDeviation = this.pvActual - ambientPV;
      const reactionAcceleration = runawayAlpha * tempDeviation * (1 + 0.04 * Math.max(0, tempDeviation));
      const coolingRemoval = -Kp * (effectiveCO - baseCO);
      const disturbanceHeating = this.loadDisturbance * 1.5;
      const dPV = (reactionAcceleration + coolingRemoval + disturbanceHeating) / Math.max(0.01, tau1);
      this.pvActual += dPV * dt;
      this.pvActual = Math.max(0, Math.min(120, this.pvActual));
    }

    // 5. Sensor / Thermowell Lag (first-order filter)
    const tauSensor = this.processParams.tauSensor;
    if (tauSensor > 0) {
      const alphaSensor = dt / (tauSensor + dt);
      this.pvSensor += alphaSensor * (this.pvActual - this.pvSensor);
    } else {
      this.pvSensor = this.pvActual;
    }

    // 6. Process / Measurement Noise (Gaussian Box-Muller)
    let noise = 0;
    if (this.processParams.noiseRms > 0) {
      const u1 = Math.max(1e-6, Math.random());
      const u2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      noise = z0 * this.processParams.noiseRms;
    }
    const pvRawWithNoise = this.pvSensor + noise;

    // 7. Transmitter Filtering
    const tauFilt = this.controllerParams.transmitterFilterTau;
    if (tauFilt > 0) {
      const alphaFilt = dt / (tauFilt + dt);
      this.pvFiltered += alphaFilt * (pvRawWithNoise - this.pvFiltered);
    } else {
      this.pvFiltered = pvRawWithNoise;
    }

    // Transient disturbance decay
    if (Math.abs(this.transientDisturbance) > 0.01) {
      this.transientDisturbance *= Math.exp(-dt / 0.1);
    } else {
      this.transientDisturbance = 0;
    }

    // 8. Record Telemetry Point at steady sample rate (or on big event)
    const shouldRecordSample = (this.simTime - this.lastSampleTime) >= (this.sampleIntervalMin * 0.95);

    const point: TelemetryPoint = {
      time: this.simTime,
      sp: ctrlStep.softSP,
      pv: this.pvFiltered,
      pvRaw: pvRawWithNoise,
      co: controllerCO,
      valveStem: this.valveStem,
      error: ctrlStep.error,
      pTerm: ctrlStep.pTerm,
      iTerm: ctrlStep.iTerm,
      dTerm: ctrlStep.dTerm,
      loadDisturbance: this.loadDisturbance,
    };

    if (shouldRecordSample) {
      this.lastSampleTime = this.simTime;
      this.history.push(point);

      // Time-based buffer pruning: keep at least 8.0 minutes of continuous history
      const cutoffTime = this.simTime - this.maxRetainedMinutes;
      // Only prune in batches to prevent array reallocation overhead
      if (this.history.length > 12000 && this.history[0].time < cutoffTime) {
        const removeCount = this.history.findIndex(p => p.time >= cutoffTime);
        if (removeCount > 0) {
          this.history.splice(0, removeCount);
        }
      }
    } else if (this.history.length > 0) {
      // Update latest point so crosshair and readouts are always real-time
      this.history[this.history.length - 1] = point;
    }

    return point;
  }
}
