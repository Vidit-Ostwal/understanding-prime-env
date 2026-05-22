---
name: understand-environment
description: Generate a rich, self-contained HTML report that fully explains a Prime Intellect verifiers environment. Use this skill any time the user asks to understand, explain, document, visualize, or explore a verifiers environment — even if they just say "what does this environment do?", "explain this env", "give me an overview", or "generate an HTML for this environment". The skill reads the Python source files in the current directory, extracts the dataset, reward functions, rollout logic, and configuration parameters, and writes a beautiful HTML file to the environment folder.
---

# Understand Environment

## Goal

Produce a single self-contained HTML file (`environment_overview.html`) that gives anyone — a researcher, a new contributor, a team lead — a complete, visual understanding of what a verifiers environment does, how rollouts are judged, and how to use it. Run this skill from inside an environment directory (any folder under `environments/`).

## Step 1 — Read the source

Read **every `.py` file** in the current directory. Also read `pyproject.toml` and `README.md` if they exist. Do not skip helper files — reward logic is often split across modules (e.g. `*_checks.py`, `*_prompts.py`).

Extract these four things:

### 1. Dataset / Task Prompts
- What prompts or tasks does the environment feed to the model?
- If the environment imports a `PROMPTS` list, a HuggingFace dataset, or any structured prompt-building function, surface the actual content (or a representative sample of ≤10 rows).
- If real data is too large or not local, synthesize 3–5 realistic example rows that match the prompt schema exactly.
- Show the full message structure: `system` (if any), `user` content, and what fields accompany each row (e.g. `answer`, `info`, `checks`).

### 2. Configuration Parameters
- Find every parameter exposed by `load_environment(...)`, `TasksetConfig`, `HarnessConfig`, or `EnvConfig`.
- For each: name, type, default value, and a plain-English description of what it controls.
- Flag parameters that have significant behavioral impact (e.g. change scoring mode, enable/disable reward components).

### 3. Reward Functions & Scoring Logic
- List every reward and metric function (`@vf.reward`, `@vf.metric`, functions passed to `Rubric`, reward methods on `Taskset`).
- For each: name, weight (if any), what it measures, scoring range (0–1, float, etc.).
- Show the **composite reward formula** if multiple rewards are combined.
- If a judge LLM is used, state the model, the abbreviated judge prompt, and what it returns.

### 4. Rollout Logic — What Gets Judged
- What the model sees, how many turns, what tools or sandbox it has access to, what it's expected to produce.
- What signals are measured: visible constraints, hidden signals, group monitors, etc.
- The full scoring pipeline in plain English: "Model is given X, produces Y, then Z is checked, W is judged by a model, final score = …"

---

## Step 2 — Generate the HTML

Write a single **self-contained** HTML file to `./environment_overview.html`. No external CDN dependencies whatsoever — all CSS, JS, fonts, and icons must be inline.

---

### Design Direction: "Research Notebook"

The aesthetic is a **premium research notebook** — crisp, information-dense, and scholarly, with a living interactive layer. Light mode is the default; it should feel like a beautifully typeset technical paper. Dark mode shifts to Prime Intellect's signature deep-space palette.

**The one thing someone will remember**: The animated rollout pipeline — glowing nodes connected by flowing dashed lines, showing exactly what happens to a prompt step-by-step.

---

### Theme System

Implement a **light/dark toggle** using a single `data-theme` attribute on `<html>`. All colors must be CSS custom properties so the toggle is a single attribute swap with a smooth `transition: background 0.3s, color 0.3s` on every element.

**Light theme (default):**
```
--bg-page:       #f8f7f4        /* warm off-white, like laid paper */
--bg-card:       #ffffff
--bg-card-hover: #faf9ff        /* barely-there purple tint on hover */
--bg-code:       #f3f0ff        /* very light purple wash for code */
--border:        #e5e1f0        /* soft lavender border */
--border-strong: #c4b8e8
--text-primary:  #1a1523        /* near-black with purple undertone */
--text-secondary:#4a4560
--text-muted:    #8b82a8
--accent:        #a855f7        /* PI purple */
--accent-dark:   #7c3aed
--accent-glow:   rgba(168,85,247,0.15)
--green:         #16a34a
--red:           #dc2626
--yellow:        #ca8a04
--shadow-sm:     0 1px 3px rgba(120,80,180,0.08), 0 1px 2px rgba(120,80,180,0.05)
--shadow-md:     0 4px 16px rgba(120,80,180,0.10), 0 2px 6px rgba(120,80,180,0.06)
--shadow-lg:     0 12px 40px rgba(120,80,180,0.14)
```

**Dark theme** (`[data-theme="dark"]`):
```
--bg-page:       #0f0f1a
--bg-card:       #161627
--bg-card-hover: #1c1c35
--bg-code:       #1a1a30
--border:        #2a2a4a
--border-strong: #3d3d6b
--text-primary:  #e2e8f0
--text-secondary:#b8b0d0
--text-muted:    #6b6890
--accent:        #a855f7
--accent-dark:   #c084fc
--accent-glow:   rgba(168,85,247,0.20)
--green:         #22c55e
--red:           #ef4444
--yellow:        #eab308
--shadow-sm:     0 1px 3px rgba(0,0,0,0.4)
--shadow-md:     0 4px 16px rgba(0,0,0,0.5)
--shadow-lg:     0 12px 40px rgba(0,0,0,0.6)
```

---

### Typography

No generic fonts. Use this stack for the UI body:
```css
font-family: 'Georgia', 'Times New Roman', serif; /* for display/headers — editorial */
font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace; /* code */
font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; /* body prose */
```

Apply Georgia/serif to section headings (`h1`, `h2`) for a research-paper feel. Use the sans stack for body text, labels, badges. Use mono for all code.

Typographic scale:
- Page title: `3rem`, `font-weight: 800`, letter-spacing `-0.03em`
- Section headings: `1.4rem`, serif, `font-weight: 700`
- Body: `0.9375rem` / `1.6` line-height
- Captions/labels: `0.75rem`, uppercase, letter-spacing `0.08em`
- Code: `0.85rem`

---

### Layout

```
┌─────────────────────────────────────────────────────┐
│  STICKY NAV  [logo] [sections...] [theme toggle]    │
├─────────────────────────────────────────────────────┤
│  HERO HEADER (full-width, gradient mesh background) │
│  env name + description + stat badges               │
├─────────┬───────────────────────────────────────────┤
│         │  ROLLOUT PIPELINE (animated, full-width)  │
│  SIDE   ├───────────────────────────────────────────┤
│  TOC    │  DATASET EXAMPLES (card carousel/tabs)    │
│  (sticky│───────────────────────────────────────────┤
│  left   │  REWARD & SCORING (score bars + formula)  │
│  on     ├───────────────────────────────────────────┤
│  desktop│  CONFIGURATION (grouped param table)      │
│  )      ├───────────────────────────────────────────┤
│         │  QUICK START (terminal-style code block)  │
│         ├───────────────────────────────────────────┤
│         │  FILE MAP (visual tree)                   │
└─────────┴───────────────────────────────────────────┘
```

On mobile (< 768px): sidebar collapses, single column.

---

### Component Specs

#### Sticky Navigation Bar
- Height: 52px, `backdrop-filter: blur(12px)`, `background: rgba(var(--bg-page-rgb), 0.85)`
- Left: `⬡ PI` monogram in accent color + env name in muted text
- Center: anchor links to each section — underline slides in on hover
- Right: **theme toggle** — a pill switch (`☀ / ☾`) with CSS transition. Clicking it toggles `data-theme="dark"` on `<html>` and persists to `localStorage`
- On scroll past hero, nav gains `box-shadow: var(--shadow-sm)`

#### Hero Header
- Background: a CSS mesh gradient that shifts between `--bg-page` and a very subtle purple wash. In light mode: `radial-gradient(ellipse at 20% 50%, rgba(168,85,247,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.05) 0%, transparent 50%)`. In dark mode, increase opacity to 0.15/0.12.
- Top-left: `⬡ Prime Intellect` in `0.75rem` caps + accent color
- Environment name: large serif, with a thin purple underline that animates in (width 0→100%) on page load using a CSS keyframe
- One-sentence description beneath in secondary text
- Stat badges row: pill chips showing environment type, reward count, dataset size, turns. Each chip: `background: var(--accent-glow)`, `border: 1px solid var(--accent)`, `color: var(--accent)`, `font-size: 0.75rem`, `border-radius: 99px`, `padding: 3px 12px`

#### Animated Rollout Pipeline
This is the centerpiece section. Render it as an SVG or pure CSS/HTML flow diagram.

Structure: horizontal nodes connected by animated dashed lines.

```
[PROMPT] ──▶ [MODEL] ──▶ [RESPONSE] ──▶ [SCORING] ──▶ [FINAL SCORE]
```

Each node:
- Rounded rectangle, `background: var(--bg-card)`, `border: 2px solid var(--border)`
- Icon (use Unicode/emoji: 📋 🤖 💬 ⚖️ 🎯) + label + 1-line description from the actual env
- On hover: `border-color: var(--accent)`, subtle `box-shadow: 0 0 0 3px var(--accent-glow)`

Connecting lines: SVG `<line>` or CSS `border-top: 2px dashed var(--border-strong)` with an animated flow:
```css
@keyframes flow {
  from { stroke-dashoffset: 20; }
  to   { stroke-dashoffset: 0; }
}
/* apply: animation: flow 1s linear infinite; */
```

If the env has tool calls or sandbox steps, add branch nodes below the main line with a vertical connector.

On page load, nodes fade+slide in with staggered `animation-delay` (0.1s per node).

#### Dataset Examples
- Tab strip at top: "Example 1", "Example 2", … (up to 5 tabs). Active tab: `border-bottom: 2px solid var(--accent)`, accent color text
- Each tab panel: a card showing the prompt content, then metadata chips for accompanying fields
- Prompt content: monospace block with subtle `background: var(--bg-code)`, `border-left: 3px solid var(--accent)`, `padding: 12px 16px`
- If the prompt has format constraints (e.g. "must not contain letter g"), highlight those phrases with `background: rgba(168,85,247,0.15)`, `border-radius: 3px`
- Copy button: top-right of each code block, shows "Copied!" with checkmark on click (pure JS)

#### Reward & Scoring
For each reward function, render a **reward card**:
```
┌─────────────────────────────────────────────┐
│  ◉ visible_reward              weight: 0.5  │
│  ─────────────────────────────────────────  │
│  Checks format constraints programmatically  │
│                                             │
│  Score range  [████████░░]  0.0 → 1.0       │
│  Type: deterministic · Returns: float        │
└─────────────────────────────────────────────┘
```

Score bar: `<div>` with `background: linear-gradient(to right, var(--accent), var(--accent-dark))`, width animates from 0 to the displayed percentage on page load using `@keyframes grow-bar`.

If there's a composite formula, render it in a prominent callout:
```
┌─ COMPOSITE FORMULA ──────────────────────────────┐
│  R = (1 − hidden_weight) × visible               │
│        + hidden_weight × hidden                  │
└───────────────────────────────────────────────────┘
```
Style: `background: var(--accent-glow)`, `border: 1px solid var(--accent)`, `border-radius: 8px`, `padding: 16px 20px`, monospace formula text in accent color.

If a judge LLM is used: a separate "Judge" callout card showing model name as a badge, abbreviated prompt in a collapsible block.

#### Configuration Table
Group parameters by `[Taskset]` / `[Harness]` / `[Top-level]` with a small section label.

Each row:
- `Parameter`: monospace, accent color
- `Type`: small badge — gray bg, rounded
- `Default`: monospace, muted
- `Description`: normal prose

High-impact parameters get a `⚡ key` badge in accent color.

Alternating row background: `var(--bg-card)` / `var(--bg-card-hover)` for readability.

#### Quick Start Block
A terminal-style window:
- Header bar: three colored dots (red/yellow/green `●●●`) + title "bash" in muted text
- Body: `background: #1a1a2e` (always dark, regardless of theme — this is a terminal), `color: #e2e8f0`
- Commands: lines prefixed with `$ ` in accent color; actual command in white
- Comments: muted color
- Copy-all button top-right

#### File Map
A visual file tree using box-drawing characters in a monospace block:
```
environments/ifeval_goblin/
├── ifeval_goblin.py       — Main environment, config classes, taskset
├── ifeval_goblin_checks.py — Format constraint checkers
├── ifeval_goblin_prompts.py — PROMPTS list (64 task definitions)
└── pyproject.toml          — Dependencies and eval defaults
```
Style: `background: var(--bg-code)`, `border-radius: 8px`, `padding: 20px`, monospace, muted text with filename in primary color.

#### Collapsible Sections
Every `<section>` has a toggle header. Clicking it smoothly expands/collapses:
```css
.section-body {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.3s ease;
}
.section-body.collapsed {
  grid-template-rows: 0fr;
}
.section-body > .inner { overflow: hidden; }
```
The section heading shows a `▾` / `▸` chevron that rotates with `transition: transform 0.3s`.

#### Syntax Highlighting (inline JS, no library)
For Python code snippets, apply a minimal tokenizer via JS after DOM load:
- Keywords (`def`, `class`, `import`, `from`, `return`, `if`, `async`, `await`, `True`, `False`, `None`): wrap in `<span style="color: var(--accent)">` 
- Strings (`"..."`, `'...'`, `"""..."""`): `color: var(--green)`
- Comments (`# ...`): `color: var(--text-muted); font-style: italic`
- Numbers: `color: var(--yellow)`
- Decorator (`@...`): `color: var(--accent-dark)`

#### Footer
```
Generated by Claude · Prime Intellect Verifiers · <timestamp>
```
Small, centered, `color: var(--text-muted)`, `font-size: 0.75rem`. Separator line above using `border-top: 1px solid var(--border)`.

---

### Animation Summary

All animations use `prefers-reduced-motion: reduce` guard:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

Animations to include:
1. **Page load**: Hero title underline grows left-to-right (600ms ease-out, 200ms delay)
2. **Stagger fade-in**: Pipeline nodes slide up 12px + fade in, 100ms stagger per node
3. **Score bars**: Width grows from 0 to final value (800ms ease-out, triggered when section scrolls into view via `IntersectionObserver`)
4. **Flow lines**: Dashed SVG/CSS lines have continuous `stroke-dashoffset` animation
5. **Theme toggle**: Smooth 300ms transition on all color properties
6. **Tab switch**: Content fades in at 150ms
7. **Section collapse**: Grid row height transition (300ms)
8. **Copy button**: Brief scale pulse (0.95 → 1.0) + text change

---

### JavaScript (inline, vanilla, ~80 lines total)

```js
// Theme toggle
const toggle = document.getElementById('theme-toggle');
const root = document.documentElement;
const saved = localStorage.getItem('pi-theme');
if (saved) root.setAttribute('data-theme', saved);
toggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('pi-theme', next);
});

// Score bar animation via IntersectionObserver
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.width = e.target.dataset.target;
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.score-bar-fill').forEach(el => observer.observe(el));

// Copy buttons
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(btn.closest('.code-block').querySelector('code').innerText);
    btn.textContent = '✓ Copied';
    setTimeout(() => btn.textContent = 'Copy', 1800);
  });
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.closest('.tab-group');
    group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    group.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    group.querySelector(btn.dataset.target).classList.add('active');
  });
});

// Collapsible sections
document.querySelectorAll('.section-header').forEach(header => {
  header.addEventListener('click', () => {
    const body = header.nextElementSibling;
    const chevron = header.querySelector('.chevron');
    body.classList.toggle('collapsed');
    chevron.style.transform = body.classList.contains('collapsed') ? 'rotate(-90deg)' : 'rotate(0deg)';
  });
});

// Active nav highlight on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      document.querySelector(`.nav-link[href="#${e.target.id}"]`)?.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => scrollObserver.observe(s));
```

---

## Step 3 — Confirm and report

After writing the file, tell the user:
- The full path to `environment_overview.html` and the command to open it (`open environment_overview.html`)
- A one-paragraph summary: environment type, number of reward functions, dataset source, and the key behavioral parameters worth knowing

If any section couldn't be filled because the information wasn't in the source, say so explicitly — never hallucinate reward weights, defaults, or dataset contents.

## Anti-patterns

- Do not invent reward weights, parameter defaults, or dataset contents not in the source
- Do not link to external URLs — the file must be fully self-contained
- Do not skip helper modules (e.g. `*_checks.py`) — they often contain the core scoring logic
- Do not use Inter, Roboto, or Arial — use the Georgia/serif + system-sans stack specified above
- Do not default to a dark-only output — light is the default; dark toggle must work
