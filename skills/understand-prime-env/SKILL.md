---
name: understand-prime-env
description: Generate a rich, self-contained HTML report that fully explains a Prime Intellect verifiers environment. Use this skill any time the user asks to understand, explain, document, visualize, or explore a verifiers environment — even if they just say "what does this environment do?", "explain this env", "give me an overview", or "generate an HTML for this environment". The skill reads the Python source files in the current directory, extracts the dataset, reward functions, and rollout logic, and writes a visually stunning infographic-style HTML file to the environment folder.
---

# Understand Prime Environment

## Goal

Produce a single self-contained `environment_overview.html`. An ML researcher opens it and **gets the full picture in under 10 seconds** — no reading required. The design is infographic-first: diagrams, flow charts, and big numbers dominate. Text exists only to label what the visuals show. Tapping any section slides open a detail drawer with the full technical depth.

The experience has two layers:
1. **Scan layer** — the full page, visible immediately. Every section is a visual unit: a flow diagram, a metric cluster, a reward breakdown chart. Labels are short. Numbers are big. The researcher understands the environment without reading a word.
2. **Drill layer** — tap any section → a smooth panel slides in from the right with complete technical detail: exact field names, regex patterns, formula, full example row.

---

## Step 1 — Read the source

Read **every `.py` file** in the current directory. Also read `pyproject.toml` and `README.md` if present. Do not skip helper files — reward logic is often split across modules (`*_checks.py`, `*_prompts.py`, etc.). Read everything before writing a single line of HTML.

Extract the following. Be precise — do not invent values:

### A — Identity
- Environment name
- One-line task description (what skill does this train?)
- GitHub URL only if found verbatim in source or README — otherwise omit entirely
- 3–5 key stats: dataset size, number of rewards, number of turns, task type, etc.

### B — Dataset
- Source: HuggingFace dataset + split, hardcoded list, or generator — one line
- Every field: name, type, purpose
- One complete real example row — all fields, real values, nothing truncated

### C — Rewards
- Every reward function: name, what it checks, what earns 0 vs 1 (and any partials), any thresholds or regex
- If rewards combine: the exact formula

### D — Rollout
- How raw row → prompt (exact template if present)
- What the model is expected to output
- How each reward fires on a sample output
- How final score is computed
- What a perfect response looks like vs a zero-score response

---

## Step 2 — Generate the HTML

Write a single **self-contained** HTML file. Zero external dependencies — all CSS and JS inline. No framework. No CDN.

---

### Layout

Full-page dark canvas. A single centered column, `max-width: 760px`, generous vertical padding. No sidebar. No nav. No tabs.

The page has exactly **four visual sections**, stacked vertically, each separated by `60px` of breathing room:

```
[HEADER]          — name, one-line description, stat chips, GitHub pill
[DATASET]         — schema diagram + tap to see full example row
[REWARDS]         — horizontal bar chart of reward functions + tap for detail
[ROLLOUT]         — horizontal flow diagram → tap any node for step detail
```

Each section is a self-contained card. Each card has a **tap target** — the whole card or a labeled "See details →" affordance — that opens a detail drawer.

---

### Visual Design

**Background:**
```css
body {
  background: #080b12;
  background-image:
    radial-gradient(ellipse at 15% 0%, rgba(99,102,241,0.07) 0%, transparent 45%),
    radial-gradient(ellipse at 85% 100%, rgba(20,184,166,0.05) 0%, transparent 45%);
  min-height: 100vh;
  font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
  color: #e2e8f0;
}
```

**Card base:**
```css
.section-card {
  background: #0d1117;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 28px 32px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}
.section-card:hover { border-color: rgba(255,255,255,0.15); }
```

**Section accent colors** — used for borders, labels, highlights, chart fills:
```
Header / Identity:  #6366f1  (indigo)
Dataset:            #14b8a6  (teal)
Rewards:            #f59e0b  (amber)
Rollout:            #f43f5e  (rose)
```

**Typography:**
- Section label: `0.65rem`, accent color, `letter-spacing: 0.12em`, uppercase, `font-weight: 500`
- Section title: `1.1rem`, white, `font-weight: 700`
- Body / labels: `0.8rem`, `#64748b`
- Big numbers / diagram nodes: `1.6–2.4rem`, white or accent, `font-weight: 800`

---

### Section 1 — Header

```
┌─────────────────────────────────────────────────────┐
│  PRIME INTELLECT ENVIRONMENT                        │
│  EnvironmentName                    [↗ GitHub]      │
│  One-line task description                          │
│  ─────────────────────────────────────────────────  │
│  [42k rows]  [3 rewards]  [2 turns]  [Math QA]     │
└─────────────────────────────────────────────────────┘
```

- Env name: `2rem`, `font-weight: 800`, white. Monospace.
- Description: `0.85rem`, `#94a3b8`, `line-height: 1.5`. Below the name.
- GitHub pill: only if URL was found. `background: rgba(99,102,241,0.1)`, `border: 1px solid rgba(99,102,241,0.3)`, `color: #a5b4fc`, `border-radius: 99px`, `padding: 4px 12px`, `font-size: 0.73rem`. Hover: border and color shift to solid indigo.
- Stat chips: row of 3–5 pills. `background: rgba(99,102,241,0.08)`, `border: 1px solid rgba(99,102,241,0.18)`, `color: #a5b4fc`, `border-radius: 6px`, `padding: 5px 12px`, `font-size: 0.75rem`, `font-weight: 600`. Label on top in `0.6rem` muted caps, value below in `0.85rem` white.

No drawer for this section. Static.

---

### Section 2 — Dataset (tappable)

**Scan face** — a visual schema diagram:

```
SOURCE ──────────────────────────────────────────────
  HuggingFace · openai/gsm8k · train split

FIELDS ──────────────────────────────────────────────
  [question]──str──────────[answer]──str
              [level]──int
              [subject]──str
```

Render fields as connected pills in a small horizontal/vertical node graph. Each pill: `background: rgba(20,184,166,0.08)`, `border: 1px solid rgba(20,184,166,0.2)`, `border-radius: 6px`, `padding: 4px 10px`. Field name in teal monospace `0.75rem`, type in muted `0.65rem`. Connect them with SVG lines (stroke `rgba(20,184,166,0.2)`, stroke-width 1).

At the bottom of the card, a muted "See example row →" in `0.72rem` teal.

**Detail drawer content** (slides in on tap — see Drawer spec below):

- `EXAMPLE ROW` label
- Every field displayed as: field name (teal monospace) + value (white). Long text in a soft box — `background: rgba(255,255,255,0.03)`, `border-radius: 6px`, `padding: 8px 12px`. Nothing truncated.
- `FIELD GUIDE` label, then each field one per line: name · type · purpose sentence.

---

### Section 3 — Rewards (tappable)

**Scan face** — a horizontal stacked bar chart:

Each reward function gets one horizontal bar. The bar represents its contribution to the final score (equal weight if not specified). Left side: reward name in amber monospace `0.8rem`. Right side: bar — `height: 8px`, `border-radius: 4px`, `background: linear-gradient(90deg, #f59e0b, #fbbf24)`. Below the bar: one-phrase description in `0.65rem` muted text.

If there's a final score formula, show it below the bars in a formula chip:
`background: rgba(245,158,11,0.08)`, `border: 1px solid rgba(245,158,11,0.2)`, `border-radius: 8px`, `padding: 8px 14px`, amber monospace `0.82rem`.

At the bottom: "See reward logic →" in `0.72rem` amber.

**Detail drawer content:**

For each reward, a block:
```
format_reward                        [float 0–1]
─────────────────────────────────────────────────
Checks response contains <answer>…</answer>

  ✗  0   Tags absent, or inner content non-numeric
  ✓  1   Tags present, inner content is valid integer

  Pattern: <answer>(\d+)</answer>
```
- Name: amber monospace, `font-weight: 700`, `0.88rem`
- `[float 0–1]` badge: `0.65rem`, `#6b7280`, right-aligned via flex
- Description: `0.8rem`, `#94a3b8`
- ✗ / ✓ lines: `0.78rem`. ✗ in `#f87171`, ✓ in `#4ade80`, text in `#94a3b8`
- Pattern/threshold: monospace, `0.75rem`, `#64748b`
- Block: `background: rgba(245,158,11,0.04)`, `border: 1px solid rgba(245,158,11,0.1)`, `border-radius: 10px`, `padding: 12px 14px`, `margin-bottom: 10px`

---

### Section 4 — Rollout (tappable)

**Scan face** — a horizontal pipeline flow diagram:

```
[DATA ROW] ──▶ [PROMPT] ──▶ [MODEL] ──▶ [REWARDS] ──▶ [SCORE]
```

Each node: rounded rect, `background: rgba(244,63,94,0.08)`, `border: 1px solid rgba(244,63,94,0.2)`, `border-radius: 10px`, `padding: 10px 16px`. Node label: rose monospace `0.8rem` bold. Below each node: 1 short phrase (≤6 words) in `0.65rem` muted. Arrows: SVG `▶` in `rgba(244,63,94,0.4)`.

On narrow viewports, collapse to vertical with connecting arrows below each node.

At the bottom: "Trace an example →" in `0.72rem` rose.

**Detail drawer content:**

5 numbered steps. Each:
- Step number: `2rem`, `font-weight: 800`, rose, `opacity: 0.2`
- Step title: `0.9rem`, white, `font-weight: 700`
- Description: `0.82rem`, `#94a3b8`, `line-height: 1.6`
- Left border: `border-left: 2px solid rgba(244,63,94,0.15)`, `padding-left: 16px`, `margin-left: 10px` (omit on last step)
- `margin-bottom: 20px`

Steps are always:
1. **Data → Prompt** — how the raw row becomes the exact prompt the model sees (include template if found)
2. **Model Response** — what the model is expected to produce (format, tags, structure)
3. **Reward Evaluation** — how each reward fires on a sample output; show scores for a real example
4. **Score Computation** — the exact formula and resulting score
5. **Perfect vs Zero** — what earns a full score vs what earns zero; concrete contrasting examples

---

### Detail Drawer

A panel that slides in from the **right edge** of the viewport, overlaying the page.

```css
.drawer {
  position: fixed;
  top: 0; right: 0;
  width: min(480px, 95vw);
  height: 100vh;
  background: #0d1117;
  border-left: 1px solid rgba(255,255,255,0.1);
  padding: 32px 28px;
  overflow-y: auto;
  transform: translateX(100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
}
.drawer.open { transform: translateX(0); }
```

**Backdrop:** `position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99` — fades in with `opacity 0.3s`. Clicking it closes the drawer.

**Close button:** `×` in the top-right of the drawer. `font-size: 1.1rem`, `color: #475569`, hover rose. Keyboard: `Escape` closes.

**Drawer header:**
- Section label (e.g., `DATASET DETAIL`) in accent color, `0.65rem` caps
- Section name in white `1.1rem` bold
- Thin `border-bottom: 1px solid rgba(255,255,255,0.07)`, `padding-bottom: 16px`, `margin-bottom: 20px`

Scroll within the drawer. The rest of the page does not scroll while drawer is open (`body { overflow: hidden }`).

---

### Motion

```css
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.section-card {
  animation: fadeSlideIn 0.4s ease both;
}
/* Stagger via animation-delay: 0s, 0.08s, 0.16s, 0.24s on the four sections */
```

Drawer slide uses CSS transition only (no keyframes). Section cards lift slightly on hover:
```css
.section-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
```

Reduced motion guard:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition-duration: 0.01ms !important; }
}
```

---

### Page Chrome

**Top of page** — above the first card:
```
PRIME INTELLECT · ENVIRONMENT OVERVIEW          [environment-name]
```
`font-size: 0.68rem`, `color: #1e293b`, `letter-spacing: 0.1em`, `margin-bottom: 40px`. Nothing else at the top.

**Bottom of page** — below the last card:
```
Generated by Claude · <timestamp>
```
`font-size: 0.65rem`, `color: #1e293b`, `margin-top: 48px`, centered.

Nothing else. No nav, no header, no sidebar.

---

## Step 3 — Confirm and report

After writing the file, share the full path and say:
- What the environment trains (one sentence)
- How it scores (one sentence)

---

## Anti-patterns — never do these

- **Do not write walls of text on the scan face.** Every section face is a diagram or a chart. Text labels only.
- **Do not truncate the example row.** Full values, all fields, in the drawer.
- **Do not invent a GitHub URL.** Only include it if found verbatim in source.
- **Do not hallucinate field names, reward weights, or dataset content.** Extract exactly.
- **Do not skip helper modules.** Core reward logic is often there.
- **Do not use a light theme.**
- **Do not use Inter, Roboto, or any Google Font.**
- **Do not add tabs, nav, or scroll-within-cards.** The drawer is the only overlay.
- **Do not add more than four sections.** Header + Dataset + Rewards + Rollout. That's it.
- **Do not use a card-stack / deck reveal mechanic.** This is a scrollable single-column page.