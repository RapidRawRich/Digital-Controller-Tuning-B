export type ProcessType = 'self-regulating' | 'integrating' | 'runaway';

export type ControllerMode = 'P' | 'PI' | 'PID' | 'MANUAL';

export type TuningMethodType = 
  | 'zn-ultimate'
  | 'zn-reaction-curve'
  | 'relay'
  | 'lambda'
  | 'imc';

export interface ProcessParams {
  type: ProcessType;
  Kp: number;           // Process steady-state gain (%PV / %CO)
  tau1: number;         // First order time constant (minutes)
  tauD: number;         // Dead time (minutes)
  Ki: number;           // Integrating gain (%PV / (min * %CO))
  runawayAlpha: number; // Positive feedback acceleration factor
  initialPV: number;    // Steady-state initial PV (%)
  ambientPV: number;    // Ambient temperature or equilibrium level (%)
  tauSensor: number;    // Thermowell or sensor lag (minutes)
  noiseRms: number;     // Process/measurement noise (%)
  stiction: number;     // Valve stiction band (%)
}

export interface ControllerParams {
  mode: ControllerMode;
  Kc: number;           // Proportional gain
  Ti: number;           // Integral time (min/repeat)
  Td: number;           // Derivative time (minutes)
  bias: number;         // Manual bias or steady-state CO (%)
  coMin: number;        // Output minimum limit (%)
  coMax: number;        // Output maximum limit (%)
  propOnPV: boolean;    // Proportional on PV (true) or Error (false)
  derivOnPV: boolean;   // Derivative on PV (true) or Error (false)
  spSofteningTau: number; // Setpoint filter time constant (min, 0 = step)
  transmitterFilterTau: number; // Transmitter filtering (min)
}

export interface TelemetryPoint {
  time: number;         // Simulated time in minutes
  sp: number;           // Setpoint (%)
  pv: number;           // Process variable (%)
  pvRaw: number;        // Unfiltered PV with noise (%)
  co: number;           // Controller output (%)
  valveStem: number;    // Actual valve position after stiction (%)
  error: number;        // SP - PV (%)
  pTerm: number;        // Proportional component (%)
  iTerm: number;        // Integral component (%)
  dTerm: number;        // Derivative component (%)
  loadDisturbance: number; // Active load disturbance (%)
}

export interface TuningResult {
  method: TuningMethodType;
  name: string;
  Kc: number;
  Ti: number;
  Td: number;
  targetResponse: string;
  notes: string;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  labId: string;
  description: string;
  process: ProcessParams;
  controller: ControllerParams;
  targetSP: number;
  tuningMethod?: TuningMethodType;
}
