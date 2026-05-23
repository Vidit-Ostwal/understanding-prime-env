# Rollout Section — Single-Turn Environment

## Detection Signals

This section applies when the source contains any of:
- `class MyEnv(vf.SingleTurnEnv)` or `SingleTurnEnv` subclass
- `max_turns=1` with no `env_response()` override
- Simple `rollout()` that calls model once and scores

## What to Extract

1. **Prompt construction** — how the raw dataset row becomes the model's input:
   - System prompt (if any) — exact text or template
   - User message format — is it raw `question` field? A formatted template? Few-shot examples?
   - Any `few_shot` messages prepended

2. **Expected output format** — what the model should produce:
   - Free text? Structured format? Specific tags like `<answer>...</answer>`?
   - Any length constraints

3. **Stop conditions** — what ends the rollout early (besides reaching max_turns=1):
   - Look for `@vf.stop` decorated methods or `is_completed()` overrides

## What to Visualize

### Scan face — SVG flowchart

A single horizontal pipeline with 4 nodes:

```
[DATASET ROW] ──▶ [PROMPT] ──▶ [MODEL] ──▶ [SCORE]
```

Node style:
- `fill: rgba(244,63,94,0.08)`, `stroke: rgba(244,63,94,0.3)`, `rx: 10`
- Label: rose monospace bold, `font-size: 13px`
- Subtitle below label: `font-size: 10px`, `fill: #64748b` (≤5 words describing what happens)
- Arrows: SVG path with arrowhead marker, `stroke: rgba(244,63,94,0.5)`

Node subtitles:
- `[DATASET ROW]` → "question + answer fields"
- `[PROMPT]` → "system + user message" (or actual template summary)
- `[MODEL]` → "single response" (note any format requirement)
- `[SCORE]` → "reward functions applied"

Keep the SVG compact: `width: 100%`, `height: 80px`, nodes evenly spaced.

### Detail drawer content

Numbered steps:

**1. Dataset → Prompt**
Exact prompt construction. If there's a template, show it verbatim with real values filled in from example row. Show system prompt if present.

**2. Model Response**
What the model produces — format, expected tags, typical length. Show a realistic example response (1–3 sentences).

**3. Reward Evaluation**
How each reward fires on the example response from step 2. Show scores.

**4. Score**
Final score formula and result for the example.

**5. Perfect vs Zero**
Two contrasting responses:
- Perfect: earns 1.0 — show it
- Zero: earns 0.0 — show it and why

## Reference Example Output

**Scan face SVG (schematic):**
```
[DATASET ROW]──▶[PROMPT]──▶[MODEL]──▶[SCORE]
question+answer  sys+user   one resp  2 rewards
```

**Drawer step 1:**
```
1  Dataset → Prompt
   System: "You are a math solver. Respond with your reasoning,
            then wrap your final answer in <answer>...</answer>"

   User: "Janet's ducks lay 16 eggs per day. She eats three for
          breakfast every morning..."
```

**Drawer step 5:**
```
5  Perfect vs Zero

   ✓ 1.0  "...so she sells 9 eggs × $2 = $18. <answer>18</answer>"
           format ✓  accuracy ✓

   ✗ 0.0  "The answer is 18 dollars."
           format ✗ (no tags)  accuracy ✗ (can't extract)
```
