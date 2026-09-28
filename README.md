# Digital Controller Tuning - Part B (ILM 310305dB)
### High-Fidelity Interactive DCS / SCADA Learning Simulator & Self-Test Lab

An interactive, high-fidelity web-based learning simulator covering every concept, transfer function, discrete equation, objective, and test question from **Module 310305dB: Digital Controller Tuning - Part B** (Alberta Skilled Trades and Apprenticeship Education, Third Period Process Control for Instrument Technicians).

Designed for **Instrument Technicians**, **Process Automation Apprentices**, and **Control Engineers**.

Hosted on GitHub Pages with zero external backend dependencies.

---

## 🚀 Live Demo & Repository Structure
- **Vite Base Path**: Configured with `base: './'` for seamless relative asset resolution on GitHub Pages.
- **Automated Deployment**: Run `./scripts/deploy.sh` to package `dist/` and push directly to the `gh-pages` branch.

---

## 🛠️ Technology Stack & SCADA Design System
- **Core Framework**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS tailored to an industrial SCADA/DCS glassmorphism palette:
  - Deep Canvas: `slate-950` / `slate-900`
  - Process Variable (PV): **Emerald** (`#10b981`)
  - Setpoint (SP): **Amber** (`#f59e0b`)
  - Controller Output (CO): **Cyan** (`#06b6d4`)
  - Valve Stem / Hysteresis: **Orange** (`#fb923c`)
  - Alarms / Runaway / Stiction: **Rose** (`#f43f5e`)
  - Proportional Term (P): **Purple** (`#a855f7`)
  - Integral Term (I): **Indigo** (`#6366f1`)
  - Derivative Term (D): **Sky** (`#38bdf8`)
- **Mathematical Engine**: KaTeX (`katex`) for crystal-clear LaTeX formula rendering.
- **Plotting Engine**: High-performance HTML5 Canvas 2D rolling strip-chart running at 60 FPS with pre-seeded steady-state history buffer.
- **Iconography**: `lucide-react`.

---

## 📚 Core Pedagogical Labs & Architecture

### 1. Lab 1: Process Types, Disturbances & Valve Diagnostics
- **Disturbance Archetypes**:
  - *Transient*: Temporary parameter upset (e.g. steam header pressure dip).
  - *Load*: Deliberate throughput/feed variation (e.g. cold oil flow surge).
  - *Setpoint*: Immediate step change for rapid loop tuning feedback.
- **Process Classifications**:
  - *Self-Regulating*: Stabilizes to a steady PV after a manual CO step (Fig 2 & 5).
  - *Integrating*: Continuous ramp proportional to step size; non-self-regulating liquid level (Fig 3 & 6).
  - *Runaway*: Exothermic reactor where reaction rate accelerates with temperature; requires rate (derivative) pre-act to stabilize (Fig 4).
- **Field Diagnostics (Valve Stiction)**:
  - Bump test in manual shows stem deadband and hysteresis (Fig 7).
  - Closed-loop operation produces classic **saw tooth CO** pattern and limit cycle hunting around SP (Fig 8).

### 2. Lab 2: Performance Criteria, Robustness & Manipulated Variable Swing
- **Response Criteria**:
  - *Quarter Amplitude Decay*: $DR = A_2 / A_1 = 0.25$ (Fig 9 & 14).
  - *Minimum Integral Absolute Error (IAE)*: $\int_0^\infty |e(t)| \, dt$ (Fig 10).
  - *Zero Overshoot*: Critically damped (fastest no-overshoot) vs overdamped (Fig 11 & 15).
- **Interactive Robustness Plot (Gain Margin vs Phase Margin)**:
  - Replicates ILM Figure 12 with selectable Points 1, 2, 3, and 4 bounded between the *No Overshoot Bound* and the *Quarter Amplitude Bound*.
- **Manipulated Variable (CO) Wear Analysis**:
  - Demonstrates why quarter amplitude decay is often rejected in petrochemical units due to violent $>60\%$ CO swings and valve stem fatigue, compared to gentle $<10\%$ swings with zero overshoot tuning.

### 3. Lab 3: Open-Loop FODT Modeling & Tuning (ZN vs Lambda vs IMC)
- **Inflection Point Tangent Method**:
  - Extract dead time $L$ ($\tau_D$), reaction rate $R_r = \Delta PV / \Delta t$, first-order time constant $\tau_1$, and static gain $K_p$.
- **Uncontrollability Parameter Meter**:
  $$U_p = \frac{\tau_D}{\tau_1}$$
  - $U_p \in [0.1, 0.5]$: Classic Ziegler-Nichols sweet spot.
  - $U_p > 0.5$: Significant dead time. Demonstrates why ZN Reaction Curve fails (causing dangerous half-amplitude decay and $4\%$ overshoot), while **Lambda Tuning** ($\lambda = 2$) and **IMC** ($\tau_f = 0.67\tau_D$) maintain tight stability!

### 4. Lab 4: Closed-Loop & Relay-Oscillation Tuning
- **Ziegler-Nichols Ultimate Gain**:
  - Finding ultimate gain $K_{cu}$ and ultimate period $P_u$ where dynamic loop gain = 1 and phase lag = $180^\circ$ (Table 1 formulas).
- **Damped Oscillations Method**:
  $$K_{cu} = \frac{K_c}{\sqrt{DR}}, \quad DR = \frac{B}{A}$$
- **Automated Relay-Oscillation Tuner**:
  $$K_{cu} = \frac{4d}{\pi \cdot a}$$
  - Square-wave excitation prevents runaway plant trips and allows the technician to select the safe amplitude of PV cycling.

### 5. Lab 5: Industrial Process Control Archetypes (Objective Two)
- **Liquid Flow & Liquid Pressure (FIC-101 / PIC-101)**:
  - Fast-acting, noisy, $U_p \approx 1.0$. PI control only ($K_c = 0.3$, $T_i = 0.1\text{ min/rpt}$), transmitter filtering ($0.5 \times$ scan rate), **NEVER derivative**!
- **Gas Vessel Back Pressure (PIC-101)**:
  - Large mass capacity, small $U_p$, very easy to control. High gain ($K_c = 5.0$, $T_i = 5.0\text{ min/rpt}$).
- **Furnace Draft & Reactor Pressure**:
  - High static gain and rupture disc safety hazards. Requires **Proportional on PV**, **Setpoint Softening**, and cutting gain by half for safety.
- **Vessel Level: Tight vs Surge (LIC-101)**:
  - *Tight Level*: PI control ($K_c = 5$, $T_i = 10\text{ min/rpt}$), preserves mass balance and protects boiler tubes from exposure.
  - *Surge Level*: Pure P-only control ($K_c = 1.0 \dots 2.0$, $SP = 50\%$), deliberately absorbs level swings to provide ultra-smooth liquid outflow to downstream units.
- **Inline Temperature Control (TIC-101)**:
  - Thermowell thermal lag $\tau_{tw}$ causes overshoot. PID control with **PD on PV**, **Integral on Error**, Setpoint Softening, and rate pre-act against cold feed load upsets.

### 6. Authentic Self-Test Quiz
- Complete 13 self-test questions from ILM pages 44–54.
- Includes high-resolution SVG reproductions of Figures 40, 41, 42, 43, and 44.
- Interactive numerical mathematical evaluation (with tolerance scoring), instant rationale feedback quoting the ILM, and celebratory confetti upon completion.

### 7. Reference Handbook & Formula Cheat-Sheet
- Searchable quick-reference matrix for Table 1, Table 2, Table 3, Table 4, and Table 5.
- Golden Rules of Industrial Loop Tuning and Field Instrument Diagnostic Guide.

---

## 🏃 Local Development
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🚢 Deploying to GitHub Pages
The deployment script automatically builds the application and pushes it to the `gh-pages` branch using a clean Git worktree:
```bash
./scripts/deploy.sh
git push origin gh-pages
```

---
*Developed for Instrument Technicians, Process Automation Apprentices, and Control Engineers.*
