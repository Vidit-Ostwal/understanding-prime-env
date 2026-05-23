# Dataset Section — Extraction & Visualization Guide

## What to Extract

Search for these patterns in the source files:

1. **Data source** — look for:
   - `load_dataset(...)` calls → HuggingFace dataset name + split
   - `_default_source` class attribute on a Taskset subclass
   - `rows()` method returning a list of dicts
   - File paths (`.jsonl`, `.csv`, `.parquet`)
   - Inline hardcoded lists

2. **Task structure** — from the `rows()` method or dataset loading, identify:
   - `prompt` field — what the model receives (string or list of messages)
   - `answer` field — ground truth / reference answer
   - Any additional fields (`info`, `level`, `difficulty`, `subject`, etc.)

3. **Real examples** — extract 1–2 actual data points. If the dataset is loaded from HuggingFace, show the first row's values as they appear in the source or as documented. If rows are hardcoded, use the first 1–2. Never fabricate — if you cannot find real values, show the field structure only.

## What to Visualize

### Scan face (always visible on the card)

- A **field node graph** using inline SVG: each field is a rounded rect pill connected by lines to a central "TASK" node
  - Pill style: `fill: rgba(20,184,166,0.1)`, `stroke: rgba(20,184,166,0.3)`, `rx: 6`
  - Field name in teal monospace, field type in muted text below
  - Connect pills to center node with SVG lines `stroke: rgba(20,184,166,0.15)`
- Below the graph: **1–2 real example snippets** — show prompt (truncated to ~120 chars) and answer side by side in a two-column layout
  - Left column: `PROMPT` label + truncated prompt text
  - Right column: `ANSWER` label + answer value
  - Each in a soft box: `background: rgba(20,184,166,0.05)`, `border: 1px solid rgba(20,184,166,0.1)`, `border-radius: 8px`, `padding: 12px`

### Detail drawer content

- `FULL EXAMPLE` label
- Every field with its real value, nothing truncated — field name in teal, value in white soft box
- `FIELD GUIDE` — one line per field: `name · type · purpose`
- Data source line: where data comes from (HF dataset path, file, or inline)

## Reference Example Output

Here is what good dataset visualization looks like for a math reasoning environment:

**Scan face excerpt:**
```
SOURCE: openai/gsm8k · train split · 7,473 rows

[question]──[TASK]──[answer]
            │
         [level]──[subject]

EXAMPLE 1
PROMPT: "Janet's ducks lay 16 eggs per day..."    ANSWER: "270"

EXAMPLE 2
PROMPT: "A robe takes 2 bolts of blue fiber..."   ANSWER: "4"
```

**Drawer excerpt:**
```
FULL EXAMPLE — Row 0
question   Janet's ducks lay 16 eggs per day. She eats three for breakfast
           every morning and bakes muffins for her friends every day with four.
           She sells the remainder at the farmers' market daily for $2 per
           fresh duck egg. How much in dollars does she make every day at
           the farmers' market?
answer     $270

FIELD GUIDE
question · str · The math word problem the model must solve
answer   · str · The numeric answer (may include $ or units)
```
