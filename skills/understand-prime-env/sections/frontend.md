# Frontend Design Spec

## Layout

Full-screen card deck. One card fills the entire viewport at a time. No scrolling — all content fits within the card. 4 cards total, navigated sequentially.

**Navigation controls:**
- Left/right arrow buttons on the sides of the screen
- Dot indicators at the bottom (4 dots, active dot highlighted)
- Left/right keyboard arrow keys
- Dots are clickable to jump directly to any card

**Card transition:** Horizontal slide. Current card slides out left, next card slides in from right (and vice versa for prev). Use CSS `transform: translateX(...)` with `transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)`.

---

## Card Themes

Each card has a unique dark gradient background tinted to its accent color:

| Card | Content | Accent | Background gradient |
|---|---|---|---|
| 1 | Overview | `#6366f1` indigo | `linear-gradient(135deg, #080b12 0%, #0d1030 50%, #080b12 100%)` + `radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.12) 0%, transparent 60%)` |
| 2 | Dataset | `#14b8a6` teal | `linear-gradient(135deg, #080b12 0%, #001a18 50%, #080b12 100%)` + `radial-gradient(ellipse at 70% 30%, rgba(20,184,166,0.1) 0%, transparent 60%)` |
| 3 | Rollout | `#f43f5e` rose | `linear-gradient(135deg, #080b12 0%, #1a0810 50%, #080b12 100%)` + `radial-gradient(ellipse at 40% 60%, rgba(244,63,94,0.1) 0%, transparent 60%)` |
| 4 | Reward | `#f59e0b` amber | `linear-gradient(135deg, #080b12 0%, #1a1200 50%, #080b12 100%)` + `radial-gradient(ellipse at 60% 40%, rgba(245,158,11,0.1) 0%, transparent 60%)` |

Apply both gradients as `background-image` (comma-separated) on the card element.

---

## Shared Card Structure

```html
<div class="card" data-index="0">
  <div class="card-label">OVERVIEW</div>   <!-- top-left, 0.65rem caps, accent color -->
  <div class="card-content">
    <!-- card-specific content -->
  </div>
</div>
```

Card label: `position: absolute; top: 28px; left: 36px; font-size: 0.65rem; letter-spacing: 0.12em; font-weight: 500; color: <accent>; opacity: 0.7`

---

## Card 1 — Overview

**Full card layout:** Environment name at top, then 4–6 horizontal stat bars filling the center.

### Environment name block (top ~25% of card)
```
PRIME INTELLECT ENVIRONMENT
EnvironmentName                    [ENV TYPE BADGE]
One-line task description
```
- "PRIME INTELLECT ENVIRONMENT": `0.65rem`, indigo, caps, `letter-spacing: 0.12em`
- Env name: `2.4rem`, `font-weight: 800`, white, monospace
- Description: `0.88rem`, `#94a3b8`
- Env type badge: pill — `background: rgba(99,102,241,0.15)`, `border: 1px solid rgba(99,102,241,0.4)`, `color: #a5b4fc`, `border-radius: 99px`, `padding: 4px 14px`, `font-size: 0.72rem`, `font-weight: 600`. Content: env type (e.g., "SINGLE-TURN", "MULTI-TURN", "TOOL-USE", "SANDBOX")

### Stat bars (center ~60% of card)

4–6 stats, each rendered as an RPG-style HP bar:

```
DATASET SIZE     ████████████████░░░░░░  42,000 rows
REWARD FUNCTIONS ██████░░░░░░░░░░░░░░░░  3 functions
MAX TURNS        ████░░░░░░░░░░░░░░░░░░  1 turn
ENVIRONMENT TYPE ████████████████████░░  Single-Turn
```

Per stat bar:
- Stat label: `0.68rem`, `#64748b`, uppercase, `letter-spacing: 0.08em`, `font-weight: 500`
- Bar track: `height: 6px`, `background: rgba(255,255,255,0.06)`, `border-radius: 3px`, full width
- Bar fill: `height: 6px`, `border-radius: 3px`, animated from 0 to target width on card entry
  - Fill color: `linear-gradient(90deg, #6366f1, #818cf8)` with subtle glow: `box-shadow: 0 0 8px rgba(99,102,241,0.5)`
- Value: `0.82rem`, white, `font-weight: 600`, right-aligned

Bar fill animation: `transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1)` with staggered delays (0ms, 120ms, 240ms, 360ms...) triggered when card becomes active.

Bar width calculation (relative, for visual interest):
- Dataset size: scale against 100k rows max (cap at 95%)
- Reward count: scale against 5 max (cap at 95%)
- Max turns: scale against 10 max (cap at 95%)
- Env type: always 100% (it's a category, show full bar)

---

## Card 2 — Dataset

**Split layout:** Left 45% = field schema graph, Right 55% = example cards.

### Left — Field Schema (SVG node graph)

Inline SVG, `width: 100%`, `height: 100%` of its container.

- Central node `[TASK]`: large rounded rect, `fill: rgba(20,184,166,0.15)`, `stroke: #14b8a6`, `stroke-width: 1.5`, `rx: 12`
- Field nodes (prompt, answer, + any extras): smaller rounded rects connected to `[TASK]` by lines
  - `fill: rgba(20,184,166,0.07)`, `stroke: rgba(20,184,166,0.3)`, `rx: 8`
  - Field name: teal monospace `12px` bold
  - Field type: `10px` `#64748b` below name
- Connecting lines: `stroke: rgba(20,184,166,0.2)`, `stroke-width: 1`, straight paths
- Data source label above graph: `0.7rem`, `#64748b` — e.g., "openai/gsm8k · train · 42k rows"

Animate nodes in on card entry: each node fades + scales from 0.8→1.0 with staggered delays.

### Right — Example Cards

1–2 example cards stacked vertically, each:
- `background: rgba(20,184,166,0.05)`, `border: 1px solid rgba(20,184,166,0.15)`, `border-radius: 12px`, `padding: 16px 20px`
- `EXAMPLE 1` label: `0.6rem`, teal, caps
- `PROMPT` sub-label + prompt text (truncated to ~2 lines with `text-overflow: ellipsis`)
- `ANSWER` sub-label + answer value (full, highlighted in teal)
- Prompt text: `0.78rem`, `#94a3b8`
- Answer value: `0.85rem`, `#2dd4bf`, `font-weight: 600`

Divider between left and right: `1px solid rgba(20,184,166,0.1)`, vertical

---

## Card 3 — Rollout

**Split layout:** Top 55% = SVG flowchart, Bottom 45% = example trace.

### Top — Animated SVG Flowchart

Large inline SVG. The diagram comes from the matching rollout section file (`single_turn.md`, `multi_turn.md`, `tool_use.md`, or `sandbox.md`). All nodes use the rose palette.

Node style:
- `fill: rgba(244,63,94,0.08)`, `stroke: rgba(244,63,94,0.3)`, `rx: 12`
- Label: rose monospace `13px` bold
- Subtitle: `10px` `#64748b`

Arrow animation — "traveling dot" effect on each connecting path:
```css
@keyframes travelDot {
  0%   { stroke-dashoffset: 100; opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 0; }
}
.flow-arrow {
  stroke-dasharray: 6 94;
  animation: travelDot 2s linear infinite;
}
```
Stagger animation delay per arrow so dots travel sequentially through the pipeline.

### Bottom — Example Trace

A horizontal step-by-step trace of a real input moving through the flow:

```
[INPUT]  →  [PROMPT BUILT]  →  [MODEL OUTPUT]  →  [SCORED]
"Janet's…"   "System: You…"    "<answer>18</answer>"   1.0
```

Each step: small box with step label in rose `0.65rem` caps, value in white `0.75rem` below. Connected by `→` arrows in `rgba(244,63,94,0.4)`. Use real values extracted from the source.

Animate trace in on card entry: steps appear left to right with 150ms stagger, each fading + sliding up 8px.

---

## Card 4 — Reward

**Full card:** Scoring simulation that auto-plays on card entry.

### Layout

Top 30%: mock response display
Middle 50%: reward function bars (animate one by one)
Bottom 20%: final score readout

### Mock Response

A stylized "model output" box:
- `background: rgba(245,158,11,0.05)`, `border: 1px solid rgba(245,158,11,0.15)`, `border-radius: 12px`, `padding: 14px 20px`
- Label: `MODEL OUTPUT` in `0.6rem` amber caps
- Content: a realistic model response extracted from source (or constructed to be realistic). Show ~2–3 lines.
- Any answer tags highlighted: `<answer>` in amber, value in white bold

### Reward Bars (animate sequentially)

For each reward function:
```
format_reward    [bar fills: ████████████████████] 1.0  ✓
accuracy_reward  [bar fills: ████████████████████] 1.0  ✓
```

- Reward name: `0.8rem`, amber monospace
- Bar: `height: 8px`, `border-radius: 4px`, animated from 0→target width
  - Pass (score > 0): `background: linear-gradient(90deg, #f59e0b, #fbbf24)`, glow: `box-shadow: 0 0 10px rgba(245,158,11,0.5)`
  - Fail (score = 0): `background: #374151`
- Score value: `0.82rem`, white, `font-weight: 600`
- ✓ / ✗ icon: `#4ade80` / `#f87171`, appears after bar fills

Animation sequence (triggered on card entry):
1. Mock response fades in (0ms)
2. First reward bar label appears (400ms), bar fills over 600ms
3. Score + ✓/✗ pops in (1000ms)
4. Second reward bar label appears (1200ms), bar fills over 600ms
5. Score + ✓/✗ pops in (1800ms)
6. ... repeat for each reward
7. Final score readout animates in (300ms after last reward)

### Final Score Readout

```
FINAL SCORE
   1.0
```
- `FINAL SCORE`: `0.65rem`, amber, caps, centered
- Score number: `3.5rem`, `font-weight: 800`, white, centered
- Animate: number counts up from 0.0 to final value over 500ms

### Replay Button

Bottom-right of card: `▶ Replay` button
- `background: rgba(245,158,11,0.1)`, `border: 1px solid rgba(245,158,11,0.3)`, `color: #fbbf24`, `border-radius: 8px`, `padding: 6px 14px`, `font-size: 0.75rem`
- Hover: border and background brighten
- Click: resets all bars to 0 and replays the full animation sequence

---

## Navigation Controls

### Arrow buttons
```css
.nav-arrow {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  width: 44px; height: 44px;
  cursor: pointer;
  color: #475569;
  font-size: 1.1rem;
  transition: background 0.2s, color 0.2s;
}
.nav-arrow:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
.nav-arrow.left  { left: 20px; }
.nav-arrow.right { right: 20px; }
.nav-arrow:disabled { opacity: 0.2; cursor: default; }
```

Hide left arrow on card 1. Hide right arrow on card 4.

### Dot indicators
```css
.dot-nav {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}
.dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.dot.active {
  background: white;
  transform: scale(1.3);
}
```

### Keyboard
```js
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') goToCard(current + 1);
  if (e.key === 'ArrowLeft')  goToCard(current - 1);
});
```

---

## Global Styles

```css
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
  color: #e2e8f0;
  background: #080b12;
  overflow: hidden;
  height: 100vh;
  width: 100vw;
}

.card-deck {
  display: flex;
  width: 400vw;   /* 4 cards × 100vw */
  height: 100vh;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card {
  width: 100vw;
  height: 100vh;
  position: relative;
  padding: 60px 64px 80px;   /* bottom padding for dot nav */
  display: flex;
  flex-direction: column;
}
```

Card transition:
```js
function goToCard(index) {
  if (index < 0 || index > 3) return;
  current = index;
  deck.style.transform = `translateX(-${index * 100}vw)`;
  updateNav();
  if (index === 3) playRewardAnimation();
  else if (index === 0) animateStatBars();
}
```

---

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .card-deck { transition: none; }
  .flow-arrow { animation: none; }
  * { transition-duration: 0.01ms !important; }
}
```
