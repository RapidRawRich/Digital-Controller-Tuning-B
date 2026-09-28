import { QuizQuestion } from '../types/quiz';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Question 1
  {
    id: 1,
    ilmNumber: 1,
    title: 'Question 1: Bump Test Analysis',
    figureLabel: 'Figure 40',
    figureType: 'fig40',
    type: 'multiple-choice',
    prompt: 'Figure 40 illustrates two bump tests that were performed on two control loops. Explain the type of process and the response for each bump test.',
    options: [
      {
        id: '1a',
        text: 'Left: Self-regulating process with valve stiction (does not return to initial PV); Right: Integrating process with proper loop operation (steady ramp up and down).',
        isCorrect: true,
      },
      {
        id: '1b',
        text: 'Left: Integrating process with normal operation; Right: Runaway process with thermal runaway.',
        isCorrect: false,
      },
      {
        id: '1c',
        text: 'Left: Properly operating flow loop; Right: Level vessel suffering from severe sensor noise.',
        isCorrect: false,
      },
      {
        id: '1d',
        text: 'Both loops are self-regulating processes operating normally with quarter amplitude decay.',
        isCorrect: false,
      },
    ],
    explanation: 'The drawing on the left is a self-regulating process, and the response indicates valve stiction (the PV steady-state value does not return to the same point for the same CO). The drawing on the right is an integrating process, and the response indicates proper loop operation (ramping at constant rate proportional to step size).',
    ilmReference: 'ILM 310305dB page 44 & 49 (Question 1)',
  },

  // Question 2
  {
    id: 2,
    ilmNumber: 2,
    title: 'Question 2: Effects of Integral Action',
    type: 'multiple-choice',
    prompt: 'What does adding integral action do to offset, control loop robustness, and loop natural frequency?',
    options: [
      {
        id: '2a',
        text: 'Eliminates offset, makes the control loop less robust, and decreases natural frequency (increases period of oscillations).',
        isCorrect: true,
      },
      {
        id: '2b',
        text: 'Increases offset, improves control loop robustness, and increases natural frequency.',
        isCorrect: false,
      },
      {
        id: '2c',
        text: 'Eliminates offset, increases phase margin, and decreases oscillation period.',
        isCorrect: false,
      },
      {
        id: '2d',
        text: 'Has no effect on offset, makes loop critically damped, and eliminates dead time.',
        isCorrect: false,
      },
    ],
    explanation: 'Adding integral action into the controller eliminates steady-state offset, but makes the loop less robust and decreases the natural frequency of the loop (which results in oscillations with a longer period).',
    ilmReference: 'ILM 310305dB page 16 & 49 (Question 2)',
  },

  // Question 3
  {
    id: 3,
    ilmNumber: 3,
    title: 'Question 3: Manipulated Variable (CO) Impact',
    type: 'multiple-choice',
    prompt: 'Why is the manipulated variable (CO) response a concern when tuning a control loop?',
    options: [
      {
        id: '3a',
        text: 'Large changes in the manipulated variable can adversely affect downstream control loops (creating major transient upsets) and cause excessive valve stem wear.',
        isCorrect: true,
      },
      {
        id: '3b',
        text: 'Because controller output (CO) must always stay locked at exactly 50% regardless of disturbance size.',
        isCorrect: false,
      },
      {
        id: '3c',
        text: 'Because high CO forces the transmitter filter to invert its polarity.',
        isCorrect: false,
      },
      {
        id: '3d',
        text: 'Manipulated variable swings have no effect outside the immediate feedback loop.',
        isCorrect: false,
      },
    ],
    explanation: 'Large changes in the manipulated variable (e.g. >60% flow variations caused by quarter amplitude decay) create major transient disturbances for downstream units. Furthermore, oscillatory stem movement causes excessive mechanical valve wear.',
    ilmReference: 'ILM 310305dB page 13 & 49 (Question 3)',
  },

  // Question 4
  {
    id: 4,
    ilmNumber: 4,
    title: 'Question 4: Standard PID Settings from Damped Proportional Test',
    figureLabel: 'Figure 41',
    figureType: 'fig41',
    type: 'multi-input',
    prompt: 'Figure 41 illustrates the PV response of a proportional only controller in automatic with Kc = 1.8 to a setpoint change of +10%. Calculate the three Ziegler Nichols tuning settings for a standard PID controller from this recording (A₁ = 11.3%, A₂ = 5.2%, Pu = 2.57 min).',
    subQuestions: [
      {
        id: 'q4_kc',
        label: 'Proportional Gain (Kc)',
        expected: 1.6,
        tolerance: 0.15,
        placeholder: 'e.g. 1.6',
      },
      {
        id: 'q4_ti',
        label: 'Integral Time (Ti)',
        expected: 1.3,
        tolerance: 0.15,
        unit: 'min/rpt',
        placeholder: 'e.g. 1.3',
      },
      {
        id: 'q4_td',
        label: 'Derivative Time (Td)',
        expected: 0.32,
        tolerance: 0.05,
        unit: 'min',
        placeholder: 'e.g. 0.32',
      },
    ],
    explanation: 'Decay Ratio DR = A₂/A₁ = 5.2% / 11.3% = 0.46. Ultimate Gain Kcu = Kc / √DR = 1.8 / √0.46 = 2.65. Ultimate Period Pu = 2.57 min. Using Table 1 standard PID formulas:\n• Kc = 0.60 Kcu = 0.60 × 2.65 = 1.6\n• Ti = Pu / 2 = 2.57 / 2 = 1.3 min/rpt\n• Td = Pu / 8 = 2.57 / 8 = 0.32 min.',
    ilmReference: 'ILM 310305dB page 19 & 49 (Question 4)',
  },

  // Question 5
  {
    id: 5,
    ilmNumber: 5,
    title: 'Question 5: Relay-Oscillation Standard PID Settings',
    figureLabel: 'Figure 42',
    figureType: 'fig42',
    type: 'multi-input',
    prompt: 'Figure 42 illustrates the PV response to relay-oscillation tuning with relay step d = 20%, PV amplitude a = 8%, and period Pu = 2.32 min. Calculate the three Ziegler Nichols tuning settings for a standard PID controller.',
    subQuestions: [
      {
        id: 'q5_kc',
        label: 'Proportional Gain (Kc)',
        expected: 1.9,
        tolerance: 0.15,
        placeholder: 'e.g. 1.9',
      },
      {
        id: 'q5_ti',
        label: 'Integral Time (Ti)',
        expected: 1.2,
        tolerance: 0.15,
        unit: 'min/rpt',
        placeholder: 'e.g. 1.2',
      },
      {
        id: 'q5_td',
        label: 'Derivative Time (Td)',
        expected: 0.3,
        tolerance: 0.05,
        unit: 'min',
        placeholder: 'e.g. 0.3',
      },
    ],
    explanation: 'Kcu = 4d / (π · a) = 4(20%) / (π × 8%) = 3.2. Pu = 2.32 min. From Table 1 standard PID:\n• Kc = 0.60 Kcu = 0.60 × 3.2 = 1.9\n• Ti = Pu / 2 = 2.32 / 2 = 1.16 ≈ 1.2 min/rpt\n• Td = Pu / 8 = 2.32 / 8 = 0.29 ≈ 0.3 min.',
    ilmReference: 'ILM 310305dB page 28 & 50 (Question 5)',
  },

  // Question 6
  {
    id: 6,
    ilmNumber: 6,
    title: 'Question 6: Open-Loop Step Tuning Comparison (ZN, Lambda, IMC)',
    figureLabel: 'Figure 43',
    figureType: 'fig43',
    type: 'multi-input',
    prompt: 'Figure 43 illustrates the PV response to a -5% step in CO (L = 0.5 min, τ₁ = 1.8 min, Kp = 1.5, Rr = 2.8%/min). Calculate the PI controller settings for ZN Reaction Curve, Lambda (λ = 2), and IMC.',
    subQuestions: [
      {
        id: 'q6_zn_kc',
        label: 'a) ZN Reaction Curve Kc',
        expected: 3.2,
        tolerance: 0.2,
        placeholder: 'e.g. 3.2',
      },
      {
        id: 'q6_zn_ti',
        label: 'a) ZN Reaction Curve Ti (min/rpt)',
        expected: 1.7,
        tolerance: 0.15,
        placeholder: 'e.g. 1.7',
      },
      {
        id: 'q6_lam_kc',
        label: 'b) Lambda Tuning Kc (λ = 2)',
        expected: 0.3,
        tolerance: 0.08,
        placeholder: 'e.g. 0.3',
      },
      {
        id: 'q6_lam_ti',
        label: 'b) Lambda Tuning Ti (min/rpt)',
        expected: 1.8,
        tolerance: 0.15,
        placeholder: 'e.g. 1.8',
      },
      {
        id: 'q6_imc_kc',
        label: 'c) IMC Tuning Kc (τf = 0.67τD)',
        expected: 1.4,
        tolerance: 0.15,
        placeholder: 'e.g. 1.4',
      },
      {
        id: 'q6_imc_ti',
        label: 'c) IMC Tuning Ti (min/rpt)',
        expected: 1.8,
        tolerance: 0.15,
        placeholder: 'e.g. 1.8',
      },
    ],
    explanation: 'From Figure 43: ΔCO = 5%, L = 0.5m, τ₁ = 1.8m, Kp = 1.5, Rr = 2.8%/min.\n• a) ZN: Kc = 0.9(ΔCO / (L·Rr)) = 0.9(5 / (0.5 × 2.8)) = 3.2; Ti = 3.33L = 3.33(0.5) = 1.7 min/rpt.\n• b) Lambda (λ=2): τc = 2(1.8) = 3.6m; Kc = τ₁ / (Kp(τc + τD)) = 1.8 / (1.5(3.6 + 0.5)) = 0.29 ≈ 0.3; Ti = τ₁ = 1.8 min/rpt.\n• c) IMC: Kc = 0.6(τ₁) / (Kp · τD) = 0.6(1.8) / (1.5 × 0.5) = 1.44 ≈ 1.4; Ti = τ₁ = 1.8 min/rpt.',
    ilmReference: 'ILM 310305dB page 26, 27, 28 & 51 (Question 6)',
  },

  // Question 7
  {
    id: 7,
    ilmNumber: 7,
    title: 'Question 7: Relay Tuning Advantage',
    type: 'multiple-choice',
    prompt: 'What is the main advantage that relay-oscillation tuning provides over the Ziegler Nichols ultimate gain method?',
    options: [
      {
        id: '7a',
        text: 'With relay-oscillation tuning, you can control the amplitude of the PV oscillations (preventing plant upsets), while with ZN ultimate gain you cannot control amplitude.',
        isCorrect: true,
      },
      {
        id: '7b',
        text: 'Relay tuning eliminates the need for dead time measurement and guarantees zero overshoot.',
        isCorrect: false,
      },
      {
        id: '7c',
        text: 'Relay tuning operates exclusively in manual mode and does not require sensor feedback.',
        isCorrect: false,
      },
      {
        id: '7d',
        text: 'Relay tuning allows the controller to ignore transmitter noise without any hysteresis.',
        isCorrect: false,
      },
    ],
    explanation: 'With relay-oscillation tuning, you can control the amplitude of the process variable oscillations by choosing the CO step size (d), whereas the ZN ultimate gain method risks runaway sustained oscillations that can upset plant production.',
    ilmReference: 'ILM 310305dB page 20, 22 & 51 (Question 7)',
  },

  // Question 8
  {
    id: 8,
    ilmNumber: 8,
    title: 'Question 8: Uncontrollability Parameter & Method Selection',
    figureLabel: 'Figure 44',
    figureType: 'fig44',
    type: 'multi-input',
    prompt: 'Figure 44 illustrates the PV response to a 10% change in controller output with dead time τD = 0.77 min and first-order time constant τ₁ = 0.73 min. Calculate Up and recommend the appropriate open loop tuning method.',
    subQuestions: [
      {
        id: 'q8_up',
        label: 'Uncontrollability Parameter (Up = τD / τ₁)',
        expected: 1.1,
        tolerance: 0.1,
        placeholder: 'e.g. 1.1',
      },
      {
        id: 'q8_method',
        label: 'Recommended Method (Select one)',
        expected: 'Lambda or IMC',
        options: [
          'Lambda or IMC (Up > 0.5)',
          'ZN Reaction Curve (Up < 0.5)',
          'ZN Ultimate Gain only',
          'P-only with manual reset',
        ],
      },
    ],
    explanation: 'Up = τD / τ₁ = 0.77 min / 0.73 min = 1.05 ≈ 1.1. Because the uncontrollability parameter is greater than one (and greater than 0.5), either the Lambda or IMC tuning method should be used. Use Lambda if a first order (zero overshoot) response is required; use IMC if a more aggressive response is required.',
    ilmReference: 'ILM 310305dB page 31, 37 & 52 (Question 8)',
  },

  // Question 9
  {
    id: 9,
    ilmNumber: 9,
    title: 'Question 9: Liquid Flow Control Characteristics & Settings',
    type: 'multiple-choice',
    prompt: 'State the characteristics and typical recommended tuning settings for a liquid flow control loop.',
    options: [
      {
        id: '9a',
        text: 'Fast-acting self-regulating, Up ≈ 1.0, naturally noisy PV. Recommended: PI control, Proportional gain Kc = 0.3 (0.2–0.8), Reset Ti = 0.1 min/rpt (0.02–0.25), filter = 0.5 × scan rate.',
        isCorrect: true,
      },
      {
        id: '9b',
        text: 'Integrating process with small gain. Recommended: PID control with rate Td = 1.5 min.',
        isCorrect: false,
      },
      {
        id: '9c',
        text: 'Slow runaway process. Recommended: P-only control with gain Kc = 5.0.',
        isCorrect: false,
      },
      {
        id: '9d',
        text: 'Self-regulating with Up < 0.1. Recommended: Derivative-only with no integral action.',
        isCorrect: false,
      },
    ],
    explanation: 'Liquid flow control is fast-acting self-regulating with Up ≈ 1.0 and a naturally noisy PV. Because high gain causes instability and rate amplifies flow noise, use PI control with Kc = 0.3 and reset Ti = 0.1 min/rpt.',
    ilmReference: 'ILM 310305dB page 40-41 & 52 (Question 9)',
  },

  // Question 10
  {
    id: 10,
    ilmNumber: 10,
    title: 'Question 10: Gas Vessel Back Pressure Control',
    type: 'multiple-choice',
    prompt: 'State two characteristics of a gas vessel back pressure control loop and the recommended tuning settings.',
    options: [
      {
        id: '10a',
        text: 'Self-regulating with large time constant vs dead time (small Up, easy to control); noise is not an issue. Settings: Proportional gain Kc = 5 (0.5–20), Reset Ti = 5 min/rpt (1–10).',
        isCorrect: true,
      },
      {
        id: '10b',
        text: 'Runaway exothermic process requiring heavy derivative pre-act. Settings: Kc = 0.2, Td = 2.0 min.',
        isCorrect: false,
      },
      {
        id: '10c',
        text: 'Non-self-regulating integrating loop. Settings: P-only with Kc = 0.1.',
        isCorrect: false,
      },
      {
        id: '10d',
        text: 'Dead-time dominant loop with Up > 2.0. Settings: Lambda tuning with λ = 10.',
        isCorrect: false,
      },
    ],
    explanation: 'Gas vessel back pressure is self-regulating with a large first-order time constant compared to dead time (small Up), making it very easy to control. Recommended settings: Proportional gain Kc = 5 and minimal reset action Ti = 5 min/rpt.',
    ilmReference: 'ILM 310305dB page 41-42 & 52 (Question 10)',
  },

  // Question 11
  {
    id: 11,
    ilmNumber: 11,
    title: 'Question 11: Tight vs Surge Level Primary Concerns',
    type: 'multiple-choice',
    prompt: 'State the primary operational concerns for Tight Level Control versus Surge Level Control.',
    options: [
      {
        id: '11a',
        text: 'Tight level: Keep PV at setpoint (maintain mass balance & protect steam heating tubes from exposure). Surge level: Minimize liquid outflow variations to downstream units.',
        isCorrect: true,
      },
      {
        id: '11b',
        text: 'Tight level: Allow tank to overflow safely. Surge level: Eliminate all level deviations instantly.',
        isCorrect: false,
      },
      {
        id: '11c',
        text: 'Tight level: Minimize valve stem movement. Surge level: Maximize derivative action.',
        isCorrect: false,
      },
      {
        id: '11d',
        text: 'Both strategies have identical objectives and use identical controller settings.',
        isCorrect: false,
      },
    ],
    explanation: 'Tight level control must keep PV close to SP to maintain mass balance and prevent exposing steam tubes (which causes thermal stress fractures and scale deposits). Surge level control intentionally allows level to rise and fall to buffer outflow to downstream equipment.',
    ilmReference: 'ILM 310305dB page 43-44 & 52 (Question 11)',
  },

  // Question 12
  {
    id: 12,
    ilmNumber: 12,
    title: 'Question 12: Recommended Mode & Settings for Surge Level',
    type: 'multiple-choice',
    prompt: 'Give the recommended PID controller mode and tuning settings for a surge control level strategy.',
    options: [
      {
        id: '12a',
        text: 'Proportional only (P) with a gain of Kc = 1.5 (range 1.0 to 2.0) and Setpoint at 50%.',
        isCorrect: true,
      },
      {
        id: '12b',
        text: 'PID with maximum derivative pre-act (Td = 2.0 min) and Kc = 10.0.',
        isCorrect: false,
      },
      {
        id: '12c',
        text: 'PI with aggressive reset (Ti = 0.05 min/rpt) to eliminate offset rapidly.',
        isCorrect: false,
      },
      {
        id: '12d',
        text: 'Integral only (I) to prevent any proportional step change.',
        isCorrect: false,
      },
    ],
    explanation: 'Surge level control uses a Proportional-only controller with low gain (Kc = 1.0 to 2.0) and SP = 50%. With Kc = 1.0, the valve moves 0% to 100% as level moves 0% to 100% (maximum dampening). With Kc = 2.0, valve moves 0% to 100% as level moves 25% to 75% (larger safety margin).',
    ilmReference: 'ILM 310305dB page 44 & 52 (Question 12)',
  },

  // Question 13
  {
    id: 13,
    ilmNumber: 13,
    title: 'Question 13: Inline Temperature Control Characteristics & Methods',
    type: 'multiple-choice',
    prompt: 'State two characteristics of an inline temperature control loop and a recommended tuning method.',
    options: [
      {
        id: '13a',
        text: 'Characteristics: Self-regulating process, moderate to slow-acting depending on thermal mass, clean non-noisy signal, thermowell adds lag. Recommended method: Ziegler-Nichols reaction curve or IMC.',
        isCorrect: true,
      },
      {
        id: '13b',
        text: 'Characteristics: Fast runaway process with high noise. Recommended method: Relay oscillation without hysteresis.',
        isCorrect: false,
      },
      {
        id: '13c',
        text: 'Characteristics: Integrating pure dead time with no time constant. Recommended method: Pure manual bias.',
        isCorrect: false,
      },
      {
        id: '13d',
        text: 'Characteristics: Noisy flow process requiring P-only control. Recommended method: Trial and error only.',
        isCorrect: false,
      },
    ],
    explanation: 'Inline temperature control is a self-regulating process ranging from fast to slow acting depending on fluid thermal mass, with a clean non-noisy signal. Thermowells add thermal lag. The recommended initial tuning method is the Ziegler-Nichols reaction curve or IMC.',
    ilmReference: 'ILM 310305dB page 45 & 52 (Question 13)',
  },
];
