import { ControllerParams, TelemetryPoint } from '../types/simulation';

export class PIDController {
  private params: ControllerParams;
  private integralAccum: number = 0;
  private prevError: number = 0;
  private prevPV: number = 0;
  private filteredDeriv: number = 0;
  private softSP: number = 50;

  constructor(initialParams: ControllerParams, initialSP: number = 50, initialPV: number = 50) {
    this.params = { ...initialParams };
    this.softSP = initialSP;
    this.prevPV = initialPV;
    this.prevError = initialSP - initialPV;
    // Set initial integral so CO equals bias at steady state
    this.integralAccum = 0;
  }

  public updateParams(newParams: Partial<ControllerParams>): void {
    this.params = { ...this.params, ...newParams };
  }

  public getParams(): ControllerParams {
    return { ...this.params };
  }

  public reset(sp: number = 50, pv: number = 50): void {
    this.softSP = sp;
    this.prevPV = pv;
    this.prevError = sp - pv;
    this.integralAccum = 0;
    this.filteredDeriv = 0;
  }

  public setManualOutput(manualCO: number): void {
    this.integralAccum = manualCO - this.params.bias;
  }

  /**
   * Calculates controller step
   * @param targetSP Current raw setpoint (%)
   * @param pv Current filtered Process Variable (%)
   * @param dt Time delta in minutes
   * @param isManual Whether controller is in manual mode
   * @param manualCO Manual CO setting when isManual is true
   */
  public step(
    targetSP: number,
    pv: number,
    dt: number,
    isManual: boolean = false,
    manualCO: number = 50
  ): {
    co: number;
    softSP: number;
    error: number;
    pTerm: number;
    iTerm: number;
    dTerm: number;
  } {
    // 1. Setpoint Softening (First-order filter on setpoint if tau > 0)
    if (this.params.spSofteningTau > 0 && dt > 0) {
      const alphaSP = dt / (this.params.spSofteningTau + dt);
      this.softSP += alphaSP * (targetSP - this.softSP);
    } else {
      this.softSP = targetSP;
    }

    const error = this.softSP - pv;

    if (isManual || this.params.mode === 'MANUAL') {
      const clampedManual = Math.max(this.params.coMin, Math.min(this.params.coMax, manualCO));
      this.integralAccum = clampedManual - this.params.bias;
      this.prevPV = pv;
      this.prevError = error;
      return {
        co: clampedManual,
        softSP: this.softSP,
        error,
        pTerm: 0,
        iTerm: this.integralAccum,
        dTerm: 0,
      };
    }

    const { Kc, Ti, Td, bias, coMin, coMax, propOnPV, derivOnPV, mode } = this.params;

    // 2. Proportional Term
    let pTerm = 0;
    if (mode === 'P' || mode === 'PI' || mode === 'PID') {
      if (propOnPV) {
        // Proportional on PV: avoids controller kick on SP changes
        pTerm = -Kc * (pv - this.prevPV);
      } else {
        // Standard Proportional on Error
        pTerm = Kc * error;
      }
    }

    // 3. Derivative Term with low-pass filtering
    let dTerm = 0;
    if (mode === 'PID' && Td > 0 && dt > 0) {
      let rawDeriv = 0;
      if (derivOnPV) {
        // Derivative on PV: avoids derivative kick on SP step
        rawDeriv = -Kc * Td * ((pv - this.prevPV) / dt);
      } else {
        rawDeriv = Kc * Td * ((error - this.prevError) / dt);
      }

      // Derivative filter (alpha = 0.1)
      const derivFilterAlpha = dt / (0.1 * Td + dt);
      this.filteredDeriv += derivFilterAlpha * (rawDeriv - this.filteredDeriv);
      dTerm = this.filteredDeriv;
    } else {
      this.filteredDeriv = 0;
    }

    // 4. Integral Term calculation & Anti-Reset Windup clamping
    let iTerm = 0;
    if ((mode === 'PI' || mode === 'PID') && Ti > 0) {
      // Preliminary raw CO to check for saturation
      const preliminaryCO = bias + pTerm + this.integralAccum + dTerm;
      const willSaturateHigh = preliminaryCO >= coMax && error > 0;
      const willSaturateLow = preliminaryCO <= coMin && error < 0;

      // Only accumulate integral if not saturated in the direction of error
      if (!willSaturateHigh && !willSaturateLow) {
        this.integralAccum += (Kc / Ti) * error * dt;
      }
      iTerm = this.integralAccum;
    } else {
      this.integralAccum = 0;
      iTerm = 0;
    }

    // 5. Raw CO and Final Saturation Clamping
    const rawCO = bias + (propOnPV ? (bias + pTerm) : pTerm) + iTerm + dTerm;
    const finalCO = Math.max(coMin, Math.min(coMax, rawCO));

    this.prevPV = pv;
    this.prevError = error;

    return {
      co: finalCO,
      softSP: this.softSP,
      error,
      pTerm,
      iTerm,
      dTerm,
    };
  }
}
