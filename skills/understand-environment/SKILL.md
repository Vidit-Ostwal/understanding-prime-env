---
name: understand-environment
description: Generate a rich, self-contained HTML report that fully explains a Prime Intellect verifiers environment. Use this skill any time the user asks to understand, explain, document, visualize, or explore a verifiers environment — even if they just say "what does this environment do?", "explain this env", "give me an overview", or "generate an HTML for this environment". The skill reads the Python source files in the current directory, extracts the dataset, reward functions, rollout logic, and configuration parameters, and writes a beautiful HTML file (Prime Intellect brand style) to the environment folder.
---

# Understand Environment

## Goal

Produce a single self-contained HTML file (`environment_overview.html`) that gives anyone — a researcher, a new contributor, a team lead — a complete, visual understanding of what a verifiers environment does, how rollouts are judged, and how to use it. Run this skill from inside an environment directory (any folder under `environments/`).

## Step 1 — Read the source

Read **every `.py` file** in the current directory. Also read `pyproject.toml` and `README.md` if they exist. Do not skip helper files — reward logic is often split across modules (e.g. `*_checks.py`, `*_prompts.py`).

Focus on extracting these four things:

### 1. Dataset / Task Prompts
- What prompts or tasks does the environment feed to the model?
- If the environment imports a `PROMPTS` list, a HuggingFace dataset, or any structured prompt-building function, surface the actual content (or a representative sample of ≤10 rows).
- If real data is too large or not local, synthesize 3–5 realistic example rows that match the prompt schema exactly.
- Show the full message structure: `system` (if any), `user` content, and what fields accompany each row (e.g. `answer`, `info`, `checks`).

### 2. Configuration Parameters
- Find every parameter exposed by `load_environment(...)`, `TasksetConfig`, `HarnessConfig`, or `EnvConfig`.
- For each parameter: name, type, default value, and a plain-English description of what it controls.
- Flag parameters that have significant behavioral impact (e.g. change scoring mode, enable/disable reward components).

### 3. Reward Functions & Scoring Logic
- List every reward and metric function (`@vf.reward`, `@vf.metric`, functions passed to `Rubric`, reward methods on `Taskset`).
- For each: its name, weight (if any), what it measures, and the scoring range (0–1, float, etc.).
- Show the **composite reward formula** if multiple rewards are combined (e.g. `R = (1 - hw) * visible + hw * hidden`).
- If a judge LLM is used, state the model, the judge prompt template (abbreviated), and what it returns.

### 4. Rollout Logic — What Gets Judged
- Explain what a single rollout looks like: what the model sees, how many turns, what tools or sandbox it has access to, what the model is expected to produce.
- Explain what signals are measured: visible constraints checked programmatically, hidden signals, group monitors, etc.
- Summarize the full scoring pipeline in plain English: "The model is given X, produces Y, then Z is checked, then W is judged by a model, and the final score is computed as…"

## Step 2 — Generate the HTML

Write a single self-contained HTML file to `./environment_overview.html` (relative to the current directory). The file must work offline — no external CDN dependencies. Inline all CSS and JS.

### Visual Style — Prime Intellect Brand

```
Background:   #0f0f1a  (page)
Card surface: #161627  (panels/cards)
Border:       #2a2a4a  (card borders, dividers)
Accent:       #a855f7  (purple — headings, badges, highlights)
Accent-2:     #7c3aed  (darker purple — hover states)
Text primary: #e2e8f0
Text muted:   #94a3b8
Code bg:      #1e1e35
Code text:    #c084fc  (light purple for code)
Green:        #22c55e  (positive signals, rewards > 0)
Red:          #ef4444  (negative signals, zero reward)
Yellow:       #eab308  (warnings, partial rewards)
Font:         system-ui, -apple-system, 'Segoe UI', sans-serif
Mono font:    'JetBrains Mono', 'Fira Code', monospace
```

### Required HTML Sections

1. **Header** — Environment name (large), one-sentence description pulled from the module docstring or README, Prime Intellect logo text (`⬡ Prime Intellect`), and pill badges for: environment type (SingleTurn / MultiTurn / V1 Taskset / Tool), reward count, dataset size (or "synthetic").

2. **Dataset / Task Examples** — A card showing 3–5 example rows in a clean table or expandable card layout. Each row shows the user prompt, any accompanying fields (`answer`, checks, etc.), and a "Copy" button. If prompts have format constraints, highlight them visually.

3. **Configuration Reference** — A two-column table: Parameter | Type | Default | Description. Flag high-impact parameters with a purple badge. Group parameters by component (Taskset, Harness) if the environment uses V1 config classes.

4. **Reward & Scoring** — Visual breakdown of each reward function as a card with name, weight chip, score range bar, and plain-English description. If there's a composite formula, render it prominently in a styled code block. If a judge LLM is used, show a callout box with the model name and what it evaluates.

5. **Rollout Flow** — A step-by-step visual pipeline using numbered steps or an ASCII-art-style flow diagram rendered in HTML/CSS. Show: Prompt → Model → Response → [Tool calls if any] → Reward scoring → Final score. Each step should be a styled box with a short description.

6. **Quick Start** — A copy-pasteable command block showing how to install and run the environment:
   ```bash
   prime env install <env-name>
   prime eval run <env-name> -m openai/gpt-4.1-mini -n 5
   prime eval view
   ```

7. **File Map** — A small section listing every `.py` file in the environment with a one-line description of its role.

### HTML Quality Requirements

- Use CSS grid/flexbox for layout. No tables for layout.
- Code blocks must have syntax highlighting (simple keyword-based, inline CSS — no external library needed).
- Each section should be collapsible/expandable with smooth CSS transitions.
- The page must be readable on a laptop screen (1280px wide) without horizontal scrolling.
- Add a sticky top navigation bar with anchor links to each section.
- Add a subtle animated gradient or glow on the header to make it visually distinct.
- Show a small "Generated by Claude · Prime Intellect Verifiers" footer.

## Step 3 — Confirm and report

After writing the file, tell the user:
- The full path to `environment_overview.html`
- A one-paragraph summary of what you found: environment type, number of reward functions, dataset source, and the key behavioral parameter(s) worth knowing.

If any section couldn't be filled because information wasn't present in the source, say so explicitly rather than leaving the section blank or hallucinating details.

## Anti-patterns

- Do not invent reward weights, parameter defaults, or dataset contents that aren't in the source.
- Do not link to external URLs in the HTML — the file must be self-contained.
- Do not summarize at the expense of accuracy — if a reward formula is complex, show the actual formula.
- Do not skip helper modules (e.g. `*_checks.py`) — they often contain the core scoring logic.
