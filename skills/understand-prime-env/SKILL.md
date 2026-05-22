---
name: understand-prime-env
description: Generate a rich, self-contained HTML report that fully explains a Prime Intellect verifiers environment. Use this skill any time the user asks to understand, explain, document, visualize, or explore a verifiers environment — even if they just say "what does this environment do?", "explain this env", "give me an overview", or "generate an HTML for this environment". The skill reads the Python source files in the current directory, extracts the dataset, reward functions, rollout logic, and configuration parameters, and writes a beautiful HTML file to the environment folder.
---

# Understand Environment

## Goal

Produce a single self-contained HTML file (`environment_overview.html`) that gives a first-timer — someone who has never seen this environment — a clear answer to one question in under 2 minutes: **"What does the model get asked to do, and how does it get scored?"**

The output is a single screen (no scrolling), three tabs. That's it.

---

## Step 1 — Read the source

Read **every `.py` file** in the current directory. Also read `pyproject.toml` and `README.md` if they exist. Do not skip helper files — reward logic is often split across modules (e.g. `*_checks.py`, `*_prompts.py`).

Extract only these three things:

### 1. Dataset — what does the model see?
- Find 1–2 real example prompts from the source (a `PROMPTS` list, HuggingFace dataset, or prompt-building function).
- If real data is unavailable, synthesize 1–2 examples that match the prompt schema exactly.
- Extract only the **user-facing prompt text** — what the model actually reads. No metadata, no field schemas, no accompanying fields.

### 2. Rollout — what is the sequence of events?
- Identify the 4–5 steps that happen during a single rollout: what the model receives, what it produces, what tools or sandbox it has (if any), and what happens at scoring time.
- Write each step as a short label (2–5 words) and a one-line description.

### 3. Rewards — how does scoring work?
- List every reward function (`@vf.reward`, functions passed to `Rubric`, reward methods on `Taskset`).
- For each: its name and one sentence describing what it measures.
- If multiple rewards combine into a final score, extract the exact formula (e.g. `R = (1 - hw) × visible + hw × hidden`).

---

## Step 2 — Generate the HTML

Write a single self-contained HTML file to `./environment_overview.html`. No external CDN dependencies — all CSS and JS inline.

### Design

**Light theme default, dark toggle in the top-right corner.**

```
Light:  bg #f8f7f4 · card #ffffff · border #e5e1f0
        text #1a1523 · muted #8b82a8 · accent #a855f7
Dark:   bg #0f0f1a · card #161627 · border #2a2a4a
        text #e2e8f0 · muted #6b6890 · accent #a855f7
```

All colors as CSS custom properties on `:root` and `[data-theme="dark"]`. Toggle swaps the attribute; `localStorage` persists the choice.

Typography: Georgia/serif for the env name; `-apple-system, Helvetica Neue, sans-serif` for everything else; `ui-monospace, Fira Code, monospace` for code and formulas. No Inter, no Roboto.

### Structure

The entire page fits on one screen without scrolling. Layout:

```
┌─────────────────────────────────────────────┐
│  env name (large, serif)        [☀/☾ toggle]│
│  one-sentence description                   │
├─────────────────────────────────────────────┤
│  [ Dataset ]  [ Rollout ]  [ Rewards ]      │
├─────────────────────────────────────────────┤
│                                             │
│  tab content (no scroll)                   │
│                                             │
└─────────────────────────────────────────────┘
```

### Tab 1 — Dataset

Show 1–2 example prompts in a clean monospace block:
- `background: var(--bg-code)`, `border-left: 3px solid var(--accent)`, `padding: 12px 16px`, `border-radius: 0 6px 6px 0`
- If there are 2 examples, a subtle "Example 1 / 2" toggle (two small buttons, no full tab strip)
- Nothing else on this tab — no labels, no field names, no copy button

### Tab 2 — Rollout

A static horizontal pipeline: 4–5 boxes connected by `→` arrows.

```
[ Prompt ] → [ Model ] → [ Response ] → [ Scoring ] → [ Score ]
```

Each box:
- `background: var(--bg-card)`, `border: 1.5px solid var(--border)`, `border-radius: 8px`, `padding: 10px 16px`
- **Bold label** (2–4 words) on top
- One-line description beneath in muted text, `font-size: 0.8rem`
- On hover: `border-color: var(--accent)`

Arrows: plain `→` character in muted color between boxes. No SVG, no animation.

Layout: `display: flex; align-items: center; gap: 8px; flex-wrap: wrap` so it reflows gracefully on smaller screens.

### Tab 3 — Rewards

A clean list. For each reward function:

```
reward_name
One sentence describing what it measures.
```

- Name: monospace, accent color, `font-size: 0.9rem`
- Description: normal prose, secondary text color, `font-size: 0.875rem`
- Separated by a thin `border-bottom: 1px solid var(--border)`

If there is a composite formula, show it below the list in a single styled block:
```
background: var(--accent-glow)   /* rgba(168,85,247,0.10) */
border: 1px solid var(--accent)
border-radius: 6px
padding: 12px 16px
font-family: monospace
color: var(--accent)
```

Nothing else on this tab — no weights, no score bars, no judge details.

### Theme Toggle

A small pill button, top-right of the header. Shows `☀` in dark mode, `☾` in light mode.

```js
const root = document.documentElement;
const btn = document.getElementById('theme-toggle');
const saved = localStorage.getItem('pi-theme');
if (saved) root.setAttribute('data-theme', saved);
btn.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('pi-theme', next);
});
```

### Tab Switching

```js
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});
```

Active tab style: `border-bottom: 2px solid var(--accent)`, accent color text. Inactive: muted text, no border.

---

## Step 3 — Confirm and report

After writing the file, tell the user:
- The full path and `open environment_overview.html` command
- Two sentences: what the environment does and how it scores

## Anti-patterns

- Do not add config parameters, file maps, quick-start commands, or any section beyond the three tabs
- Do not add animations, score bars, copy buttons, or collapsible sections
- Do not hallucinate reward weights, defaults, or prompt content not found in the source
- Do not skip helper modules — they often contain the core scoring logic
- If content would cause scrolling within a tab, cut it further
