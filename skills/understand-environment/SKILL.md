---
name: understand-environment
description: Generate a rich, self-contained HTML report that fully explains a Prime Intellect verifiers environment. Use this skill any time the user asks to understand, explain, document, visualize, or explore a verifiers environment — even if they just say "what does this environment do?", "explain this env", "give me an overview", or "generate an HTML for this environment". The skill reads the Python source files in the current directory, extracts the dataset, reward functions, rollout logic, and configuration parameters, and writes a beautiful HTML file to the environment folder.
---

# Understand Environment

## Goal

Produce a single self-contained HTML file (`environment_overview.html`) — a **treasure map** that lets a first-timer understand any verifiers environment in under 5 minutes. Everything is visible at once, on one screen, no scrolling, no clicking required. The page answers one question: *"What is this environment training a model to do?"*

---

## Step 1 — Read the source

Read **every `.py` file** in the current directory. Also read `pyproject.toml` and `README.md` if they exist. Do not skip helper files — reward logic is often split across modules (e.g. `*_checks.py`, `*_prompts.py`).

Extract exactly three things:

### 1. The Task — what does the model see?
- Find 1 real example prompt from the source (a `PROMPTS` list, HuggingFace dataset, or prompt builder).
- Extract only the **user-facing prompt text** the model actually reads. Truncate to ~300 chars if longer.
- Note which file it lives in.

### 2. The Judge — what counts as a good response?
- Write 2–3 sentences in plain English describing how the environment scores the model. What is it rewarding? What does a high score look like vs a low score?
- If there is a composite formula (e.g. `R = (1−hw)×visible + hw×hidden`), include it.
- Note which file the reward logic lives in.

### 3. The Loop — how does one rollout execute?
- Identify 4–5 steps: what the model receives → what it produces → any tools/sandbox → scoring → final score.
- Write each step as a 2–4 word label and a single-line description.
- Note which file the rollout logic lives in.

---

## Step 2 — Generate the HTML

Write a single self-contained `./environment_overview.html`. No external CDN — all CSS and JS inline.

---

### Aesthetic Direction: "Cartographic"

The page looks like a **premium map artifact** — warm parchment in light mode, deep space in dark mode. Three cards feel like physical territories on the map, slightly lifted off the page. The purple accent (#a855f7) is the single modern intrusion into an otherwise scholarly palette — like a highlighted route drawn over an aged chart.

**The one thing a viewer remembers**: the parchment texture and the offset card shadows in light mode — it genuinely feels like a physical object.

---

### Theme System

All colors as CSS custom properties. Toggle swaps `data-theme="dark"` on `<html>`. Persisted via `localStorage`.

**Light theme — "Parchment" (default):**
```css
--bg-page:       #f4efe4;   /* warm laid paper */
--bg-card:       #fdfaf3;   /* lighter parchment for cards */
--bg-code:       #ece6d4;   /* aged paper for code blocks */
--border:        #d6cba8;   /* ink-faded edge */
--border-strong: #b8a87a;
--text-primary:  #1c1410;   /* dark iron-gall ink */
--text-secondary:#5c4f3a;   /* brown ink */
--text-muted:    #9c8b6e;
--accent:        #a855f7;   /* PI purple — the modern intrusion */
--accent-soft:   rgba(168,85,247,0.12);
--shadow-card:   4px 6px 0 rgba(168,85,247,0.10), 0 2px 8px rgba(100,70,20,0.12);
--shadow-hover:  6px 8px 0 rgba(168,85,247,0.18), 0 4px 16px rgba(100,70,20,0.16);

/* Parchment noise texture — paste this SVG as a data URI background on body */
/* background-image: url("data:image/svg+xml,...") — see Noise Texture section */
```

**Dark theme — "Deep Space" (`[data-theme="dark"]`):**
```css
--bg-page:       #0f0f1a;
--bg-card:       #161627;
--bg-code:       #1a1a2e;
--border:        #2a2a4a;
--border-strong: #3d3d6b;
--text-primary:  #e8e4f0;
--text-secondary:#b0a8c8;
--text-muted:    #6b6488;
--accent:        #a855f7;
--accent-soft:   rgba(168,85,247,0.15);
--shadow-card:   0 0 0 1px rgba(168,85,247,0.15), 0 8px 32px rgba(0,0,0,0.5);
--shadow-hover:  0 0 0 1px rgba(168,85,247,0.3), 0 12px 40px rgba(168,85,247,0.15);
```

All elements get `transition: background-color 0.3s ease, border-color 0.3s ease, color 0.2s ease, box-shadow 0.3s ease` so the toggle animates smoothly.

---

### Noise Texture (light mode only)

Add a subtle grain to `body` in light mode using an inline SVG filter — no external file needed:

```html
<svg style="display:none">
  <filter id="noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feBlend in="SourceGraphic" mode="multiply"/>
  </filter>
</svg>
```

Apply to body in light mode:
```css
:root body { filter: url(#noise); }  /* very subtle — opacity trick below */
```

Better approach — use a pseudo-element overlay:
```css
body::before {
  content: '';
  position: fixed; inset: 0; pointer-events: none; z-index: 9999;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
[data-theme="dark"] body::before { opacity: 0.04; }
```

---

### Typography

```css
/* Display — scholarly, map-label feel */
--font-display: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif;

/* Body — humanist, readable, not generic */
--font-body: 'Optima', 'Candara', 'Gill Sans', 'Segoe UI', sans-serif;

/* Code — typewriter, like coordinates on a map */
--font-mono: 'Courier New', 'Lucida Console', ui-monospace, monospace;
```

Scale:
- Env name: `2.2rem`, `var(--font-display)`, `font-weight: 700`, `letter-spacing: -0.02em`, color: `var(--text-primary)`
- Env description: `0.95rem`, `var(--font-body)`, `color: var(--text-secondary)`, `font-style: italic`
- Card landmark label: `0.65rem`, `var(--font-body)`, `font-weight: 700`, `letter-spacing: 0.12em`, `text-transform: uppercase`, `color: var(--accent)`
- Card body text: `0.875rem`, `var(--font-body)`, `line-height: 1.6`, `color: var(--text-primary)`
- Code: `0.8rem`, `var(--font-mono)`, `color: var(--text-primary)`
- Filename badge: `0.7rem`, `var(--font-mono)`, `color: var(--text-muted)`

---

### Layout

Full viewport, no scroll. CSS Grid:

```css
html, body { height: 100%; margin: 0; overflow: hidden; }

body {
  display: grid;
  grid-template-rows: auto 1fr;  /* header + cards */
  padding: 24px 28px 20px;
  gap: 20px;
  box-sizing: border-box;
  background: var(--bg-page);
}

.cards {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 18px;
  min-height: 0;  /* critical: lets grid row shrink */
}
```

---

### Header

```
┌─ header ──────────────────────────────────────────────────────┐
│  ⬡ Prime Intellect          [light mode: ☀  dark mode: ☾]    │
│                                                               │
│  ifeval_goblin                                                │
│  Trains a model to follow format instructions...             │
└───────────────────────────────────────────────────────────────┘
```

- Top row: `⬡ Prime Intellect` in `0.7rem` caps, `var(--accent)`, `letter-spacing: 0.1em` — left. Theme toggle — right.
- Theme toggle: a small pill `<button>`, `background: var(--accent-soft)`, `border: 1px solid var(--border-strong)`, `border-radius: 99px`, `padding: 4px 12px`, `font-size: 0.75rem`. Shows `☀ Light` or `☾ Dark`. Hover: `background: var(--accent-soft)` stronger, no outline.
- Env name: large display serif below, with a 2px `var(--accent)` underline that is 40px wide and sits 4px below the baseline — does NOT span the full word. Like a map annotation mark.
- Description: italic, secondary color, one line beneath.

---

### Cards

Three equal-width cards. Each card is a fixed-height territory on the map.

```css
.card {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow-card);
  padding: 20px;
  display: grid;
  grid-template-rows: auto 1fr auto;  /* label | content | filename */
  min-height: 0;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}
```

Each card has exactly three zones:

**Zone 1 — Landmark label** (top):
```
THE TASK          THE JUDGE          THE LOOP
━━━━━━━━          ━━━━━━━━━          ━━━━━━━━
```
Label in `0.65rem` uppercase caps + accent color. A `1px solid var(--border-strong)` rule beneath it, `margin-bottom: 14px`.

**Zone 2 — Content** (middle, `overflow: hidden`):
Content specific to each card — see below.

**Zone 3 — Filename badge** (bottom):
```
📍 ifeval_goblin_prompts.py
```
`font-size: 0.7rem`, `font-family: var(--font-mono)`, `color: var(--text-muted)`. A `1px solid var(--border)` rule above it, `padding-top: 10px`, `margin-top: 10px`.

---

### Card 1 — The Task

Content zone: the actual prompt text the model sees.

```css
.task-prompt {
  background: var(--bg-code);
  border-left: 3px solid var(--accent);
  border-radius: 0 6px 6px 0;
  padding: 12px 14px;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  line-height: 1.55;
  color: var(--text-primary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 8;           /* truncate at ~8 lines */
  -webkit-box-orient: vertical;
  white-space: pre-wrap;
  word-break: break-word;
}
```

If the prompt has format constraints embedded (e.g. "do not use the letter g"), highlight those phrases:
```html
<mark style="background:rgba(168,85,247,0.15); border-radius:2px; padding:0 2px;">
  do not use the letter g
</mark>
```

---

### Card 2 — The Judge

Content zone: plain English scoring description.

```css
.judge-description {
  font-family: var(--font-body);
  font-size: 0.875rem;
  line-height: 1.65;
  color: var(--text-primary);
}
```

If there is a composite formula, render it below the prose in a formula block:

```css
.formula {
  margin-top: 14px;
  background: var(--accent-soft);
  border: 1px solid var(--accent);
  border-radius: 6px;
  padding: 10px 14px;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--accent);
  letter-spacing: 0.02em;
}
```

If no formula exists, omit the block entirely — don't leave empty space.

---

### Card 3 — The Loop

Content zone: a static pipeline diagram.

Layout: vertical stack of step rows connected by short vertical lines (easier to fit in a card than horizontal).

```
  ● Prompt received
  │
  ● Model generates response
  │
  ● [Tool call / sandbox]     ← only if applicable
  │
  ● Scoring applied
  │
  ● Final score emitted
```

HTML structure:
```html
<div class="pipeline">
  <div class="step">
    <div class="node"></div>
    <div class="step-text">
      <span class="step-label">Prompt received</span>
      <span class="step-desc">64 task prompts with format constraints</span>
    </div>
  </div>
  <div class="connector"></div>
  <!-- repeat -->
</div>
```

CSS:
```css
.pipeline { display: flex; flex-direction: column; gap: 0; }

.step { display: flex; align-items: flex-start; gap: 12px; }

.node {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--accent); flex-shrink: 0;
  margin-top: 4px;
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.connector {
  width: 1px; height: 14px;
  background: var(--border-strong);
  margin-left: 4.5px;        /* aligns with node center */
  border-left: 1.5px dashed var(--border-strong);
}

.step-label {
  display: block;
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
}

.step-desc {
  display: block;
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin-top: 1px;
}
```

---

### Theme Toggle JS (complete, ~15 lines)

```js
(function() {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('pi-env-theme');
  if (saved) root.setAttribute('data-theme', saved);
  function update() {
    const isDark = root.getAttribute('data-theme') === 'dark';
    btn.textContent = isDark ? '☀ Light' : '☾ Dark';
  }
  update();
  btn.addEventListener('click', function() {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('pi-env-theme', next);
    update();
  });
})();
```

---

### Page Load Animation

One single orchestrated entrance — not scattered micro-animations:

```css
@keyframes rise {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.header { animation: rise 0.5s ease both; }
.card:nth-child(1) { animation: rise 0.5s ease 0.1s both; }
.card:nth-child(2) { animation: rise 0.5s ease 0.2s both; }
.card:nth-child(3) { animation: rise 0.5s ease 0.3s both; }

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
```

---

### Final HTML skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[ENV_NAME] — Prime Intellect Environment</title>
  <style>/* ALL CSS INLINE HERE */</style>
</head>
<body>
  <!-- Noise texture SVG (hidden) -->
  <svg style="display:none">...</svg>

  <header class="header">
    <div class="header-top">
      <span class="pi-logo">⬡ Prime Intellect</span>
      <button id="theme-toggle">☾ Dark</button>
    </div>
    <h1 class="env-name">[ENV_NAME]</h1>
    <p class="env-desc">[ONE_SENTENCE_DESCRIPTION]</p>
  </header>

  <div class="cards">
    <div class="card">
      <div class="card-label">The Task</div>
      <div class="card-content">
        <pre class="task-prompt">[PROMPT_TEXT]</pre>
      </div>
      <div class="card-file">📍 [FILENAME]</div>
    </div>

    <div class="card">
      <div class="card-label">The Judge</div>
      <div class="card-content">
        <p class="judge-description">[SCORING_DESCRIPTION]</p>
        <!-- optional -->
        <div class="formula">[FORMULA]</div>
      </div>
      <div class="card-file">📍 [FILENAME]</div>
    </div>

    <div class="card">
      <div class="card-label">The Loop</div>
      <div class="card-content">
        <div class="pipeline">
          <!-- step + connector pairs -->
        </div>
      </div>
      <div class="card-file">📍 [FILENAME]</div>
    </div>
  </div>

  <script>/* ALL JS INLINE HERE */</script>
</body>
</html>
```

---

## Step 3 — Confirm and report

After writing the file:
- Tell the user the full path and `open environment_overview.html`
- Two sentences: what the environment does and how it scores

## Anti-patterns

- Do not add any section beyond the three cards
- Do not add tabs, collapsibles, config tables, file maps, quick-start blocks, or score bars
- Do not let any card overflow or scroll — truncate content to fit
- Do not hallucinate prompt text, reward logic, or filenames not found in the source
- Do not skip helper modules — they often contain the core scoring logic
- Do not use Inter, Roboto, system-ui, or Space Grotesk — use the Palatino/Optima/Courier stack
