# Reward Section — Extraction & Visualization Guide

## What to Extract

Search for these patterns in all `.py` files:

1. **Decorator-based rewards** — functions decorated with `@vf.reward(...)` or `@reward(...)`
   - Capture: function name, `weight` parameter (default 1.0), what it returns

2. **Rubric-based rewards** — `vf.Rubric(funcs=[...])` or `Rubric(funcs=[...])`
   - Capture: each function in the list

3. **Taskset default rewards** — `_default_rewards = (fn1, fn2, ...)` on a Taskset subclass
   - Capture: each function

4. **For each reward function**, extract:
   - What it checks (read the function body)
   - What input earns **0** vs **1** (and any partial scores like 0.5)
   - Any regex patterns, string matches, or thresholds used
   - Whether it operates on `completion`, `state`, or `task`

5. **Score combination** — if multiple rewards exist, note the weights and formula:
   - `final_score = Σ (weight_i × reward_i) / Σ weight_i`
   - Or any custom aggregation logic

## What to Visualize

### Scan face (always visible on the card)

- **Horizontal bar chart** — one bar per reward function
  - Bar width proportional to weight (equal width if all weights are 1.0)
  - Bar: `height: 8px`, `border-radius: 4px`, `background: linear-gradient(90deg, #f59e0b, #fbbf24)`
  - Left: reward name in amber monospace `0.8rem`
  - Below bar: one-phrase description in `0.65rem` muted text
- **Formula chip** if multiple rewards: `final = (r1 + r2 + ...) / N`
  - `background: rgba(245,158,11,0.08)`, `border: 1px solid rgba(245,158,11,0.2)`, amber monospace
- **Concrete scored example** — take one realistic model response and show how each reward fires:
  - Show the response (short, ~2 lines)
  - Show each reward: ✓ 1.0 or ✗ 0.0 with a one-line reason
  - Show final score

### Detail drawer content

For each reward function, a block:
```
reward_name                           [float 0–1]
────────────────────────────────────────────────
What it checks

  ✗  0   [condition that earns zero]
  ✓  1   [condition that earns full score]

  Pattern/threshold if applicable
```
- Name: amber monospace, `font-weight: 700`
- ✗ in `#f87171`, ✓ in `#4ade80`

## Reference Example Output

Here is what good reward visualization looks like for a math environment with 2 rewards:

**Scan face excerpt:**
```
format_reward    ████████████████████  checks <answer> tags
accuracy_reward  ████████████████████  checks numeric correctness

final = (format + accuracy) / 2

EXAMPLE RESPONSE: "...the answer is <answer>270</answer>"
  format_reward    ✓ 1.0   — <answer> tags present, content is numeric
  accuracy_reward  ✓ 1.0   — 270 matches ground truth
  SCORE: 1.0
```

**Drawer excerpt:**
```
format_reward                              [float 0–1]
──────────────────────────────────────────────────────
Checks response wraps answer in <answer>...</answer> tags
with a valid integer inside

  ✗  0   Tags absent, malformed, or inner content non-numeric
  ✓  1   Tags present and inner content is a valid integer

  Pattern: <answer>(\d+)</answer>

accuracy_reward                            [float 0–1]
──────────────────────────────────────────────────────
Checks numeric value inside tags matches the ground truth answer

  ✗  0   Extracted number ≠ answer, or format_reward = 0
  ✓  1   Extracted number exactly equals the ground truth
```
