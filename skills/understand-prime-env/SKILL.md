---
name: understand-prime-env
description: Generate a rich, self-contained HTML report that fully explains a Prime Intellect verifiers environment. Use this skill any time the user asks to understand, explain, document, visualize, or explore a verifiers environment — even if they just say "what does this environment do?", "explain this env", "give me an overview", or "generate an HTML for this environment". The skill reads the Python source files in the current directory, extracts the raw dataset, reward functions, and rollout logic, and writes a visually stunning gamified HTML file to the environment folder.
---

# Understand Prime Environment

## Goal

Produce a single self-contained HTML file (`environment_overview.html`). A researcher opens it and sees a **stack of 4 cards** — like a physical deck — each one peeking out behind the one in front. They click through the deck, one card at a time, in a satisfying progressive reveal. Each card is one chapter of the story. The whole experience should feel like flipping through a beautifully designed research brief.

---

## Step 1 — Read the source

Read **every `.py` file** in the current directory. Also read `pyproject.toml` and `README.md` if they exist. Do not skip helper files — reward logic is often split across modules (e.g. `*_checks.py`, `*_prompts.py`). Read everything before writing a single line of HTML.

Extract exactly four things:

### Card 1 — Environment
- Name, and one punchy paragraph (3–4 sentences) describing what task this trains a model to do
- GitHub URL if found anywhere in source or README — if not found, omit entirely
- 3–5 stat chips: dataset size, reward count, turn count, task type, etc.

### Card 2 — Dataset
- Where the data comes from: HuggingFace dataset name + split, hardcoded list, generator, etc. — one line
- Every field in a data row: name, type, purpose
- One complete example row with every field shown in full — real values if available, otherwise synthesize one that is indistinguishable from real (exact field names, value formats, constraints)

### Card 3 — Rewards
- Every reward function: name, exactly what it checks, precisely what makes it score 0 vs 1 (and any partial values)
- Any thresholds, regex patterns, or edge cases a model writer needs to know
- If rewards combine into a final score: the exact formula

### Card 4 — Rollout
- Step-by-step theoretical trace of one example running end-to-end:
  1. How the raw row becomes the prompt the model sees
  2. What the model is expected to produce
  3. How each reward fires on the output
  4. How the final score is computed
  5. What a perfect response looks like vs a zero-score response

---

## Step 2 — Generate the HTML

Write a single **self-contained** HTML file to `./environment_overview.html`. Zero external dependencies — all CSS and JS inline.

---

### The Core Mechanic — Card Stack Reveal

The entire UI is a **centered card deck**. All four cards occupy the same position. The active card is front and center at full size. Cards behind it peek out — each one slightly smaller, slightly lower, slightly darker — giving the illusion of a physical stack.

```
         ░░░░░░░░░░░░░░░░  ← Card 4 (furthest back, barely visible)
       ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  ← Card 3
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← Card 2
   ██████████████████████████  ← Card 1 (active, full size, full opacity)
```

Clicking anywhere on the active card — or the "Continue →" button — triggers the reveal: the active card flies out (slides left + slight rotation + fade), and the next card scales up to the front with a spring animation. A progress indicator shows position (● ● ○ ○).

When card 4 is shown, "Continue →" becomes "Done ✓" and clicking it does nothing (or fades the stack out gracefully).

---

### Visual Design

**Background:** Full-viewport dark canvas.
```css
body {
  background: #07090f;
  background-image:
    radial-gradient(ellipse at 20% 20%, rgba(168,85,247,0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(34,211,238,0.04) 0%, transparent 50%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
```

**Card base:**
```css
.card {
  position: absolute;
  width: min(600px, 90vw);
  background: #0d1117;
  border-radius: 24px;
  padding: 40px 44px 36px;
  transform-origin: center bottom;
  will-change: transform, opacity;
}
```

**Stack offset** (CSS, applied via `data-depth` attribute 0–3, 0 = active):
```
depth 0: scale(1.00)   translateY(0px)    opacity: 1     (active)
depth 1: scale(0.96)   translateY(18px)   opacity: 0.65  z-index: -1
depth 2: scale(0.92)   translateY(36px)   opacity: 0.35  z-index: -2
depth 3: scale(0.88)   translateY(54px)   opacity: 0.15  z-index: -3
```

Each card has a unique accent. Apply via a CSS custom property `--accent` and `--glow` set on the card element itself. The gradient border and glow use this accent.

```
Card 1:  --accent: #a855f7   --glow: rgba(168,85,247,0.3)   (purple)
Card 2:  --accent: #22d3ee   --glow: rgba(34,211,238,0.3)   (cyan)
Card 3:  --accent: #f59e0b   --glow: rgba(245,158,11,0.3)   (amber)
Card 4:  --accent: #f43f5e   --glow: rgba(244,63,94,0.3)    (rose)
```

**Gradient border** on the active card only:
```css
.card[data-depth="0"] {
  box-shadow:
    0 0 0 1.5px var(--accent),
    0 0 60px var(--glow),
    0 32px 80px rgba(0,0,0,0.6);
}
.card[data-depth="1"],
.card[data-depth="2"],
.card[data-depth="3"] {
  box-shadow: 0 0 0 1px rgba(255,255,255,0.06);
}
```

**Typography:**
```css
font-family: -apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif;
font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace; /* code only */
```

---

### Card Content Specs

Each card has the same shell structure:

```
┌────────────────────────────────────────────┐
│  LABEL (0.65rem, accent, caps, tracking)   │
│  TITLE (1.6rem, 700, white)                │
│  ─────────────────────────────────────     │
│                                            │
│  [BODY — unique per card, see below]       │
│                                            │
│  ────────────────────────────────────────  │
│  [progress dots]    [Continue → button]    │
└────────────────────────────────────────────┘
```

**Progress dots:** 4 dots, `width: 7px height: 7px border-radius: 50%`. Active dot: accent color, `width: 20px border-radius: 4px` (pill). Inactive: `rgba(255,255,255,0.15)`. Transition: `width 0.3s ease`.

**Continue button:** `background: var(--accent)`, `color: #000`, `font-weight: 700`, `font-size: 0.82rem`, `border-radius: 99px`, `padding: 8px 20px`, `border: none`, `cursor: pointer`. Hover: `opacity: 0.85`.

---

#### Card 1 Body — Environment

- **Env name**: `font-size: 1.6rem`, `font-weight: 800`, white
- **Description**: 3–4 sentences, `font-size: 0.9rem`, `color: #94a3b8`, `line-height: 1.65`, `margin: 14px 0`
- **GitHub link** (only if URL was found in source): pill button — `background: rgba(255,255,255,0.05)`, `border: 1px solid rgba(255,255,255,0.1)`, `color: #e2e8f0`, `border-radius: 99px`, `padding: 5px 14px`, `font-size: 0.78rem`. Shows `↗ GitHub`. Hover: `border-color: var(--accent)`, `color: var(--accent)`. If no URL found, this element does not exist.
- **Stat chips**: row of 3–5 pills. `background: rgba(168,85,247,0.08)`, `border: 1px solid rgba(168,85,247,0.2)`, `color: #c4b5fd`, `border-radius: 99px`, `padding: 4px 11px`, `font-size: 0.73rem`

---

#### Card 2 Body — Dataset

**Source line** — monospace, one line:
```
HuggingFace · openai/gsm8k · train split
```
Style: `background: rgba(34,211,238,0.05)`, `border-left: 3px solid #22d3ee`, `padding: 8px 14px`, `border-radius: 0 6px 6px 0`, `font-size: 0.82rem`, `color: #67e8f9`

**Field list** — compact, beneath the source line:
Each field on one line: `field_name` in cyan monospace + `·` + type/purpose in muted text. `font-size: 0.8rem`, `line-height: 1.8`.

**Example row** — the main content:
A clean structured display. Label: `EXAMPLE ROW` in `0.65rem` cyan caps. Then each field:
- Field name: cyan monospace, `font-size: 0.78rem`
- Value: white, `font-size: 0.82rem`, `line-height: 1.5`
- Long text values (prompts, answers): wrapped in a soft box — `background: rgba(255,255,255,0.03)`, `border-radius: 6px`, `padding: 8px 12px`, `margin-top: 2px`
- Full content — never truncated

---

#### Card 3 Body — Rewards

For each reward function, a compact block:

```
format_reward                               [float]
Checks response contains <answer>…</answer>
  ✗ 0  tags absent or inner content non-numeric
  ✓ 1  tags present, content is a valid integer
```

- Name: monospace, `color: #fcd34d`, `font-weight: 600`, `font-size: 0.88rem`
- `[float]` badge: `font-size: 0.68rem`, `color: #6b7280`, right-aligned via `display: flex justify-content: space-between`
- Description line: `color: #94a3b8`, `font-size: 0.8rem`, `margin: 4px 0 6px`
- `✗ 0` / `✓ 1` lines: `font-size: 0.78rem`, `✗` in `#f87171`, `✓` in `#4ade80`, text in `#94a3b8`
- Block: `background: rgba(245,158,11,0.05)`, `border: 1px solid rgba(245,158,11,0.12)`, `border-radius: 10px`, `padding: 12px 14px`, `margin-bottom: 10px`

If composite formula exists — after all reward blocks:
```
background: rgba(245,158,11,0.08)
border: 1px solid rgba(245,158,11,0.25)
border-radius: 8px · padding: 10px 14px
font-family: monospace · color: #fcd34d · font-size: 0.85rem
```

---

#### Card 4 Body — Rollout

Numbered steps. Each step:

```
  01
  Data → Prompt
  The problem field is inserted into "Solve step by step…"
  as the user message. No system prompt.
```

- Number: `font-size: 2rem`, `font-weight: 800`, `color: var(--accent)`, `opacity: 0.25`, `line-height: 1`
- Title: `font-size: 0.88rem`, `font-weight: 700`, `color: #f1f5f9`, `margin: 2px 0`
- Description: `font-size: 0.8rem`, `color: #94a3b8`, `line-height: 1.55`
- Left connector: `border-left: 2px solid rgba(244,63,94,0.15)`, `padding-left: 16px`, `margin-left: 12px`, except on last step
- Between steps: `margin-bottom: 16px`

Always 5 steps: Data→Prompt · Model Response · Reward Evaluation · Score Computation · Perfect vs Zero.

---

### Reveal Animation

```css
@keyframes flyOut {
  to { transform: translateX(-120%) rotate(-8deg); opacity: 0; }
}
@keyframes riseUp {
  from { transform: scale(0.96) translateY(18px); opacity: 0.65; }
  to   { transform: scale(1) translateY(0); opacity: 1; }
}
```

On click:
1. Active card: `flyOut 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards`
2. After 80ms: next card transitions from depth-1 styles to depth-0 styles — `riseUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)` (spring overshoot)
3. All remaining cards shift their `data-depth` attributes down by 1
4. Progress dots update with a `0.3s` width transition

Guard all animations:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

---

### Page Chrome

**Top:** Environment name in small muted text, centered, `font-size: 0.75rem`, `color: #334155`, `letter-spacing: 0.08em`, `margin-bottom: 32px`.

**Bottom:** `Generated by Claude · Prime Intellect · <timestamp>` — `font-size: 0.68rem`, `color: #1e293b`, `margin-top: 28px`.

Nothing else. No nav, no sidebar, no header. The cards are the whole UI.

---

## Step 3 — Confirm and report

After writing the file:
- Give the full path and `open environment_overview.html`
- Two sentences: what the environment trains and how it scores

## Anti-patterns

- Do not dump all content at once — each card is one focused chapter
- Do not truncate the example row — every field, every value, in full
- Do not invent a GitHub URL — only include it if found in the source
- Do not hallucinate reward weights, field names, or dataset content
- Do not skip helper modules — they contain the core reward logic
- Do not add tabs, sidebars, scroll-within-cards, or any structure beyond the 4-card deck
- Do not use a light theme — dark only
- Do not use Inter, Roboto, or any Google Font
