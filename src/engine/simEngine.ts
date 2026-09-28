import { ProcessParams, ControllerParams, TelemetryPoint, ProcessType } from '../types/simulation';
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
  // stores { time, co } points
  private deadTimeQueue: Array<{ time: number; stem: number }> = [];

  // Telemetry rolling buffer for strip chart
  private history: TelemetryPoint[] = [];
  private maxHistoryPoints: number = 6000; // e.g. 5 minutes at 20Hz = 6000 points

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

    this.preSeedHistory(2.0); // pre-seed 2 minutes of steady-state baseline
  }

  /**
   * Pre-seed telemetry buffer so graphs are populated edge-to-edge on load
   */
  public preSeedHistory(durationMinutes: number = 2.0): void {
    const dt = 0.05 / 60; // 0.05 sec converted to minutes
    const steps = Math.floor(durationMinutes / dt);
    const startTime = -durationMinutes;

    this.history = [];
    this.deadTimeQueue = [];

    const initialCO = this.controllerParams.bias;
    this.valveStem = initialCO;
    this.pvActual = this.processParams.initialPV;
    this.pvSensor = this.processParams.initialPV;
    this.pvFiltered = this.processParams.initialPV;

    // Fill dead time buffer
    for (let t = startTime - this.processParams.tauD; t <= 0; t += dt) {
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
  }

  public updateProcess(newParams: Partial<ProcessParams>): void {
    this.processParams = { ...this.processParams, ...newParams };
  }

  public updateController(newParams: Partial<ControllerParams>): void {
    this.controllerParams = { ...this.controllerParams, ...newParams };
    this.controller.updateParams(newParams);
    if (newParams.mode !== undefined) {
      this.isManual = newParams.mode === 'MANUAL';
    }
  }

  public setSetpoint(sp: number): void {
    this.targetSP = sp;
  }

  public setLoadDisturbance(load: number): void {
    this.loadDisturbance = load;
  }

  public setTransientDisturbance(trans: number): void {
    this.transientDisturbance = trans;
  }

  public setManualMode(manual: boolean, coValue?: number): void {
    this.isManual = manual;
    if (coValue !== undefined) {
      this.manualCO = coValue;
      this.controller.setManualOutput(coValue);
    }
    this.controllerParams.mode = manual ? 'MANUAL' : (this.controllerParams.mode === 'MANUAL' ? 'PI' : this.controllerParams.mode);
  }

  public setManualCO(co: number): void {
    this.manualCO = Math.max(0, Math.min(100, co));
    this.controller.setManualOutput(this.manualCO);
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
    this.preSeedHistory(2.0);
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
   * Advances simulation by dt minutes (e.g. 0.05s = 0.05/60 min)
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
    // If stiction > 0, the valve stem sticks until the delta between CO and stem exceeds stiction.
    // When slip occurs, it jumps forward by ~stiction * 0.85
    const stictionBand = this.processParams.stiction;
    if (stictionBand > 0) {
      const delta = controllerCO - this.valveStem;
      if (Math.abs(delta) > stictionBand) {
        // Slip jump: jumps forward towards CO
        const slip = Math.sign(delta) * (Math.abs(delta) - stictionBand * 0.15);
        this.valveStem += slip;
      }
      // If within stictionBand, stem does not move!
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
      // First-Order Plus Dead Time (FODT)
      // tau1 * d(PV)/dt + (PV - ambientPV) = Kp * (effectiveCO + loadDisturbance - baseCO)
      const dPV = ((ambientPV + Kp * (effectiveCO + this.loadDisturbance - baseCO)) - this.pvActual) / Math.max(0.005, tau1);
      this.pvActual += dPV * dt;
    } else if (type === 'integrating') {
      // Integrating Process (e.g. Liquid Level)
      // d(PV)/dt = Ki * [ (effectiveCO + loadDisturbance) - balanceCO ]
      // When effectiveCO == baseCO and load == 0, dPV/dt = 0
      const dPV = Ki * ((effectiveCO + this.loadDisturbance) - baseCO);
      this.pvActual += dPV * dt;
      // Clamp to physical tank limits (0% to 100%)
      this.pvActual = Math.max(0, Math.min(100, this.pvActual));
    } else if (type === 'runaway') {
      // Runaway Exothermic Reactor (Figure 4)
      // Higher temperature increases reaction rate exponentially
      // Cooling CO (cold oil) removes heat: -Kp * (effectiveCO - baseCO)
      const tempDeviation = this.pvActual - ambientPV;
      const reactionAcceleration = runawayAlpha * tempDeviation * (1 + 0.04 * Math.max(0, tempDeviation));
      const coolingRemoval = -Kp * (effectiveCO - baseCO);
      const disturbanceHeating = this.loadDisturbance * 1.5;
      const dPV = (reactionAcceleration + coolingRemoval + disturbanceHeating) / Math.max(0.01, tau1);
      this.pvActual += dPV * dt;
      // Clamp runaway limits for safety (0% to 120%)
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

    // 7. Transmitter Filtering (recommendation: 0.5 * controller scan rate)
    const tauFilt = this.controllerParams.transmitterFilterTau;
    if (tauFilt > 0) {
      const alphaFilt = dt / (tauFilt + dt);
      this.pvFiltered += alphaFilt * (pvRawWithNoise - this.pvFiltered);
    } else {
      this.pvFiltered = pvRawWithNoise;
    }

    // Transient disturbance naturally decays if it was an impulse/pulse
    if (Math.abs(this.transientDisturbance) > 0.01) {
      this.transientDisturbance *= Math.exp(-dt / 0.1); // 6 second decay
    } else {
      this.transientDisturbance = 0;
    }

    // 8. Record Telemetry Point
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

    this.history.push(point);

    // Keep history buffer bounded
    if (this.history.length > this.maxHistoryPoints) {
      this.history.splice(0, this.history.length - this.maxHistoryPoints);
    }

    return point;
  }
}
