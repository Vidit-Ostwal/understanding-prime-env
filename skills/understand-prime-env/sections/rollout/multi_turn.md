# Rollout Section — Multi-Turn Environment

## Detection Signals

This section applies when the source contains any of:
- `class MyEnv(vf.MultiTurnEnv)` with a custom `env_response()` method
- `max_turns > 1` with back-and-forth interaction logic
- Modern v1 `vf.Harness` with a custom `program` that loops

## What to Extract

1. **env_response() logic** — what the environment sends back after each model turn:
   - Does it check the model's response and branch?
   - Does it call external APIs, run code, or look up answers?
   - What does a "correct" environment response look like vs an error response?

2. **Turn structure** — how many turns maximum (`max_turns`), and what typically ends the conversation:
   - `@vf.stop` conditions
   - Task completion signals

3. **Prompt construction** — initial system prompt and first user message

4. **Conversation shape** — what a full successful trajectory looks like (show a sketch: User → Asst → Env → Asst → ...)

## What to Visualize

### Scan face — SVG flowchart

A looping pipeline that shows the back-and-forth:

```
[TASK] ──▶ [MODEL TURN] ──▶ [ENV RESPONSE] ──▶ [MODEL TURN] ──▶ ... ──▶ [SCORE]
                └──────────────────────────────────┘
                              loop
```

Node style: same as single-turn (rose palette)
- Add a loop-back arrow from `[ENV RESPONSE]` to `[MODEL TURN]`
- Label the loop arc: "up to N turns" (fill in actual max_turns)
- Add a diamond-shaped `[DONE?]` node after `[ENV RESPONSE]` if stop conditions exist

SVG height: `120px` to accommodate the loop arc.

Key nodes:
- `[TASK]` → "initial prompt"
- `[MODEL TURN]` → "generates response"
- `[ENV RESPONSE]` → brief description of what env does (e.g., "checks answer", "runs code", "provides feedback")
- `[SCORE]` → "reward applied at end"

### Detail drawer content

**1. Initial Prompt**
System prompt + first user message structure. Real example.

**2. Model Turn**
What the model is expected to produce each turn — format, length, any tags.

**3. Environment Response**
Explain the `env_response()` logic in plain English. What triggers a "correct" response? What triggers an error or retry message? Show example exchange.

**4. Conversation Example**
A condensed real trajectory — show 2–3 turns:
```
User:  [initial problem]
Asst:  [model response turn 1]
User:  [env response — what the environment sent back]
Asst:  [model response turn 2]
...
```

**5. Score**
When and how scoring happens — at end of conversation only? After each turn? Final formula.

## Reference Example Output

**Scan face SVG (schematic):**
```
[TASK]──▶[MODEL]──▶[ENV CHECK]──▶[DONE?]──▶[SCORE]
              ↑_________|  no
         up to 5 turns
```

**Drawer step 3:**
```
3  Environment Response
   The env_response() checks if the model's answer matches
   the target string. If correct: returns "Correct! Well done."
   and sets done=True. If wrong: returns "Incorrect, try again."
   and allows another turn.
```

**Drawer step 4:**
```
4  Conversation Example

   User:  "What is the capital of France?"
   Asst:  "The capital of France is Berlin."
   User:  "Incorrect, try again."
   Asst:  "The capital of France is Paris."
   User:  "Correct! Well done."
   [done — scored]
```
