---
name: understand-prime-env
description: Generate a rich, self-contained HTML report that fully explains a Prime Intellect verifiers environment. Use this skill any time the user asks to understand, explain, document, visualize, or explore a verifiers environment — even if they just say "what does this environment do?", "explain this env", "give me an overview", or "generate an HTML for this environment". The skill reads the Python source files in the current directory, extracts the raw dataset, reward functions, and rollout logic, and writes a visually stunning gamified HTML file to the environment folder.
---

# Understand Prime Environment

## Goal

Produce a single self-contained HTML file (`environment_overview.html`) that gives a researcher — someone who already knows RL and verifiers but has never seen *this* environment — a complete deep understanding in one page. The output should make them stop and say "whoa."

The page has **4 cards**, rendered in a dark gamified UI. Each card is a deep-dive, not a summary.

---

## Step 1 — Read the source

Read **every `.py` file** in the current directory. Also read `pyproject.toml` and `README.md` if they exist. Do not skip helper files — reward logic is often split across modules (e.g. `*_checks.py`, `*_prompts.py`). Read all of them before writing a single line of HTML.

Extract exactly four things:

### A. Environment identity
- The environment's name, one-paragraph description of what task it trains a model to do
- The GitHub repo URL if present in any source file or README (e.g. `https://github.com/PrimeIntellect-ai/verifiers`)
- 3–5 quick stats: e.g. dataset size, number of reward functions, number of turns, task type

### B. Raw dataset — the input data itself
- Where does the data come from? (HuggingFace dataset name + split, a hardcoded `PROMPTS` list, a generator function, etc.)
- What fields does a single row have? List every field name and its type/purpose
- Show **one complete real example row** — every field, real values, not truncated. If real data is not available locally, synthesize one example that is indistinguishable from a real row (match field names, value formats, constraints exactly)

### C. Reward functions — the actual logic
For each reward function (`@vf.reward`, functions passed to `Rubric`, reward methods on `Taskset`):
- Its name
- What it is actually checking — not a summary, the real logic: what string patterns, what conditions, what regex, what comparisons
- Exactly what makes it return **0** (failure) vs **1** (full score) — and any partial scores in between
- Any thresholds, edge cases, or gotchas a model writer would need to know
- If a judge LLM is used: the model name, what the judge prompt asks, and what it returns

If multiple rewards combine into a final score, extract the exact formula.

### D. Theoretical rollout — what would happen
Write a step-by-step narrative trace of what would happen if you ran one example end-to-end through this environment:
1. How the raw dataset row gets transformed into the actual prompt the model sees (system prompt + user message, any templating)
2. What the model is expected to produce (format, length, structure)
3. If there are tools or a sandbox: what tools, how they'd be called
4. How each reward function gets called on the model output — in what order, with what inputs
5. How the final score is computed from the individual reward outputs
6. What a **perfect response** looks like vs a **zero-score response**

Be specific. Trace through the actual code logic. This is theoretical (not executed) but must be grounded in what the code actually does.

---

## Step 2 — Generate the HTML

Write a single **self-contained** HTML file to `./environment_overview.html`. No external CDN dependencies — all CSS, JS, and assets inline.

---

### Visual Direction: Dark Gamified Research Dashboard

The aesthetic is a **dark, glowing, gamified dashboard** — like a game HUD for researchers. Think deep space + neon. Each card has its own accent color and glows on hover. The reader should feel like they're exploring a world, not reading a doc.

**Color palette:**
```
Page background:   #080b14  (near-black, blue-tinted)
Card background:   #0e1420  (dark navy)
Card border:       1.5px gradient border (unique per card)

Card 1 accent — purple:   #a855f7  glow: rgba(168,85,247,0.25)
Card 2 accent — cyan:     #22d3ee  glow: rgba(34,211,238,0.25)
Card 3 accent — amber:    #f59e0b  glow: rgba(245,158,11,0.25)
Card 4 accent — rose:     #f43f5e  glow: rgba(244,63,94,0.25)

Text primary:   #f1f5f9
Text secondary: #94a3b8
Text muted:     #475569
Code text:      #e2e8f0
```

**Gradient borders** — each card has a glowing gradient border using this trick:
```css
.card {
  position: relative;
  background: #0e1420;
  border-radius: 16px;
}
.card::before {
  content: '';
  position: absolute;
  inset: -1.5px;
  border-radius: 17px;
  background: linear-gradient(135deg, var(--card-accent), transparent 60%);
  z-index: -1;
}
```

On hover: `box-shadow: 0 0 40px var(--card-glow), 0 0 80px rgba(var(--card-glow), 0.3)` + `transform: translateY(-4px)`. Transition: `0.3s cubic-bezier(0.34, 1.56, 0.64, 1)` (slight spring).

**Typography:**
```css
font-family: 'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif;  /* body */
font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;           /* code */
```

---

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  HERO: env name (large, glowing) + tagline + PI logo badge  │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  CARD 1      │  CARD 2      │  CARD 3      │  CARD 4        │
│  🌐 Env      │  📦 Dataset  │  ⚡ Rewards  │  🎯 Rollout    │
│  purple      │  cyan        │  amber       │  rose          │
├──────────────┴──────────────┴──────────────┴────────────────┤
│  FOOTER: generated timestamp · PI branding                  │
└─────────────────────────────────────────────────────────────┘
```

On screens < 1200px: 2-column grid. On mobile: single column.

Cards are tall enough to show all content — the page CAN scroll, but each card is self-contained.

---

### Hero Section

Full-width header above the cards:
- Large environment name: `font-size: clamp(2rem, 5vw, 4rem)`, `font-weight: 800`, white with a subtle purple text-shadow glow: `text-shadow: 0 0 40px rgba(168,85,247,0.4)`
- Below: one sentence tagline in `#94a3b8`
- Top-right: a `⬡ PRIME INTELLECT` badge — `background: rgba(168,85,247,0.1)`, `border: 1px solid rgba(168,85,247,0.3)`, `color: #a855f7`, `border-radius: 6px`, `padding: 4px 12px`, `font-size: 0.7rem`, `letter-spacing: 0.12em`
- Background: `radial-gradient(ellipse at 30% 0%, rgba(168,85,247,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(34,211,238,0.06) 0%, transparent 50%)`
- A thin `border-bottom: 1px solid #1e293b` separates the hero from the cards

On page load: env name fades + slides up 16px (`animation: heroIn 0.6s ease-out`). Tagline follows 150ms later.

---

### Card 1 — Environment `(purple)`

**Header:** `🌐  Environment` in bold white, `font-size: 0.7rem` `ENVIRONMENT` label in purple caps above it.

**Body:**
- A paragraph of prose describing what task this environment trains a model to do — written in plain English, no jargon beyond what the researcher already knows
- GitHub link (if found): a pill button — `background: rgba(168,85,247,0.1)`, `border: 1px solid rgba(168,85,247,0.3)`, hover brightens, shows `↗` arrow. If no GitHub link found, omit this element entirely.
- Stat chips row at the bottom: 3–5 pill badges (e.g. `64 prompts`, `2 rewards`, `single-turn`, `math reasoning`). Each chip: `background: rgba(168,85,247,0.08)`, `border: 1px solid rgba(168,85,247,0.2)`, `color: #c4b5fd`, `border-radius: 99px`, `padding: 3px 10px`, `font-size: 0.72rem`

---

### Card 2 — Dataset `(cyan)`

**Header:** `📦  Dataset` label.

**Body — three subsections, stacked:**

**① Source** — one line, monospace: where the data comes from. E.g.:
```
HuggingFace  ·  openai/gsm8k  ·  train split
```
or
```
Hardcoded  ·  PROMPTS list  ·  64 examples
```
Style: `background: rgba(34,211,238,0.05)`, `border-left: 3px solid #22d3ee`, `padding: 8px 14px`, `border-radius: 0 6px 6px 0`, monospace, cyan text.

**② Field anatomy** — a compact table showing every field in a data row:

| Field | Type | Description |
|-------|------|-------------|

Table style: no outer border, alternating row backgrounds `rgba(34,211,238,0.03)` / transparent, header row in cyan `0.6rem` caps. Text `0.82rem`.

**③ Example row** — the most important part. Show one complete real (or synthesized) example row. Render it as a structured display, NOT a raw JSON dump:
- Each field on its own line: field name in cyan monospace, value in white
- Long text values (like prompt content) get a soft box: `background: rgba(255,255,255,0.03)`, `border: 1px solid #1e293b`, `border-radius: 6px`, `padding: 10px 14px`, `font-size: 0.82rem`, full content shown (no truncation)

---

### Card 3 — Rewards `(amber)`

**Header:** `⚡  Rewards` label.

**Body:** For each reward function, a reward block:

```
┌─────────────────────────────────────────────────┐
│  format_reward                          [float]  │
│  ─────────────────────────────────────────────  │
│  CHECKS                                          │
│  Checks that response contains <answer>...</     │
│  answer> tags and inner content is numeric       │
│                                                  │
│  SCORES 0  if tags missing or content non-num    │
│  SCORES 1  if tags present and content is int    │
└─────────────────────────────────────────────────┘
```

- Function name: `font-family: monospace`, amber color, `font-size: 0.9rem`, `font-weight: 600`
- `[float]` / `[int]` / `[bool]` type badge: small, muted, right-aligned
- `CHECKS` / `SCORES 0` / `SCORES 1` labels: `0.65rem`, letter-spacing `0.1em`, amber at 60% opacity
- Actual descriptions: white text, `0.83rem`, leading `1.5`
- Block background: `rgba(245,158,11,0.04)`, `border: 1px solid rgba(245,158,11,0.15)`, `border-radius: 10px`, `padding: 14px 16px`
- Blocks separated by `12px` gap

If there is a composite formula, show it after all blocks in a prominent callout:
```
background: rgba(245,158,11,0.08)
border: 1px solid rgba(245,158,11,0.3)
border-radius: 8px
padding: 14px 18px
font-family: monospace
color: #fcd34d
font-size: 0.9rem
```

---

### Card 4 — Rollout `(rose)`

**Header:** `🎯  Rollout` label.

**Body:** A numbered step-by-step trace. Each step:

```
  ① Data → Prompt
  ──────────────────────────────────────────
  The raw row's `problem` field is inserted
  into a system prompt: "Solve the following
  math problem step by step..." followed by
  the problem text as the user message.
```

- Step number: large, `font-size: 1.4rem`, `font-weight: 800`, rose color, `opacity: 0.4`, positioned to the left
- Step title: `font-weight: 700`, white, `font-size: 0.9rem`
- A `1px solid rgba(244,63,94,0.15)` rule below the title
- Description: `0.83rem`, `#94a3b8`, `line-height: 1.6`
- Between steps: a rose-tinted connector line on the left side (`border-left: 2px solid rgba(244,63,94,0.15)`, `margin-left: 10px`, `padding-left: 20px`)

Steps to always include (adapt to what's in the code):
1. **Data → Prompt** — how the raw row becomes the model's input
2. **Model response** — what the model is expected to produce (format, structure)
3. **Reward evaluation** — how each reward function is called and what it receives
4. **Score computation** — how the final score is derived
5. **Perfect vs zero** — what a max-score response looks like vs a zero-score response (concrete examples if possible)

---

### Entrance Animations

All guarded by `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; } }`.

```css
@keyframes heroIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(24px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

Cards animate in with staggered delay: `animation-delay: 0.1s, 0.2s, 0.3s, 0.4s` for cards 1–4.

---

### JavaScript (inline, vanilla)

```js
// Card hover glow
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});
```

Add a radial gradient spotlight that follows the mouse inside each card:
```css
.card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255,255,255,0.03) 0%,
    transparent 60%
  );
  pointer-events: none;
}
```

---

### Footer

```
Generated by Claude  ·  Prime Intellect Verifiers  ·  <ISO timestamp>
```

Centered, `color: #334155`, `font-size: 0.72rem`. `border-top: 1px solid #1e293b`, `padding: 24px`. No links, no extra content.

---

## Step 3 — Confirm and report

After writing the file, tell the user:
- The full path and `open environment_overview.html` command
- Two sentences: what the environment trains and how it scores

## Anti-patterns

- Do not produce a surface-level summary — every section must contain the actual logic from the code
- Do not hallucinate reward weights, field names, dataset contents, or GitHub URLs not found in the source
- Do not skip helper modules — they often contain the core reward logic
- Do not truncate the example row — show every field in full
- Do not use light theme — this is dark-only
- Do not add tabs, collapsible sections, score bars, or copy buttons — the 4-card layout is the whole structure
- Do not use Inter, Roboto, or any Google Font
- If a GitHub URL is not found in the source, omit the GitHub button entirely — never invent a URL
