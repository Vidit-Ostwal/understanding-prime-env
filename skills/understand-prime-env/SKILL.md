---
name: understand-prime-env
description: Generate a rich, self-contained HTML report that fully explains a Prime Intellect verifiers environment. Use this skill any time the user asks to understand, explain, document, visualize, or explore a verifiers environment — even if they just say "what does this environment do?", "explain this env", "give me an overview", or "generate an HTML for this environment". The skill reads the Python source files in the current directory, extracts the dataset, reward functions, and rollout logic, and writes a visually stunning infographic-style HTML file to the environment folder.
---

# Understand Prime Environment

## Goal

Produce a single self-contained `environment_overview.html`. An ML practitioner (knows RL basics, new to this specific environment) opens it and **fully understands the environment in under 5 minutes** — visual-first, SVG diagrams dominate, text exists only to label what visuals show.

---

## Step 1 — Detect Environment Type

Run a quick targeted search through the `.py` files in the current directory. Look for these class names and patterns to determine the **effective behavior type**:

| Pattern found | Type |
|---|---|
| `SingleTurnEnv` subclass, or `max_turns=1` with no `env_response` | **single-turn** |
| `MultiTurnEnv` subclass with custom `env_response()` method | **multi-turn** |
| `ToolEnv`, `StatefulToolEnv`, `MCPEnv`, or `tools=[...]` param | **tool-use** |
| `SandboxEnv`, `PythonEnv`, `BrowserEnv`, `docker_image=`, `SandboxConfig` | **sandbox** |

For modern v1 composition pattern (`vf.Taskset` + `vf.Harness`): detect type from the Harness `program` — if it uses `sandbox_base_program` → sandbox; if it defines custom tools → tool-use; if `max_turns > 1` → multi-turn; otherwise → single-turn.

If multiple signals conflict, use the most specific (sandbox > tool-use > multi-turn > single-turn).

---

## Step 2 — Read Section Guides

Read all four of these files before reading any source code. They tell you exactly what to extract, how to visualize it, and how to build the frontend:

1. `sections/dataset.md` — how to extract and visualize the dataset
2. `sections/reward.md` — how to extract and visualize reward functions
3. `sections/rollout/{detected-type}.md` — the rollout flowchart for this env type
4. `sections/frontend.md` — the complete frontend design spec (card layout, animations, styles)

Where `{detected-type}` is one of: `single_turn`, `multi_turn`, `tool_use`, `sandbox`.

---

## Step 3 — Read Source Files

Now do a **targeted deep read** of the `.py` files. Read **all** `.py` files in the current directory — do not skip helper files. Reward logic is often in `*_checks.py`, `*_rewards.py`, `*_utils.py`. Also read `README.md` and `pyproject.toml` if present.

Extract precisely what each section guide specifies. Do not invent values. If something cannot be found, note it as "not found in source" rather than guessing.

---

## Step 4 — Generate the HTML

Write a single **self-contained** `environment_overview.html` file in the current directory. Zero external dependencies — all CSS and JS inline. No CDN. No framework.

Follow `sections/frontend.md` exactly for all layout, animation, color, and interaction details.

### Layout Summary

Full-screen card deck — 4 cards, one visible at a time, horizontal slide navigation.

```
Card 1 — Overview   (indigo tint) — env name + animated stat bars
Card 2 — Dataset    (teal tint)   — schema graph (left) + examples (right)
Card 3 — Rollout    (rose tint)   — animated SVG flowchart (top) + trace (bottom)
Card 4 — Reward     (amber tint)  — auto-playing scoring simulation + replay button
```

Navigation: left/right arrow buttons + dot indicators + keyboard arrow keys.

---

## Step 5 — Report

After writing the file:
- State what the environment trains (one sentence)
- State how it scores (one sentence)
- State the detected environment type

---

## Anti-patterns — never do these

- **Do not write walls of text on the scan face.** Every section face is a diagram, chart, or SVG. Text labels only.
- **Do not use `<img>` for diagrams.** All flowcharts must be inline SVG.
- **Do not fabricate field names, reward weights, dataset content, or examples.** Extract exactly from source.
- **Do not skip helper modules.** Reward logic is often split across files.
- **Do not use the wrong rollout section.** Match it to the detected env type.
- **Do not truncate example data in the drawer.** Full values, all fields.
- **Do not use a light theme.**
- **Do not use Inter, Roboto, or any Google Font.**
- **Do not add tabs, nav, or sidebar.**
- **Do not add more than four sections.** Header + Dataset + Rollout + Reward only.
- **Do not use the generic single-turn flowchart for a multi-turn or tool-use environment.**
