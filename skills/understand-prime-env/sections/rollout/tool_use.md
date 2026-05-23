# Rollout Section — Tool-Use Environment

## Detection Signals

This section applies when the source contains any of:
- `class MyEnv(vf.ToolEnv)` or `StatefulToolEnv` or `MCPEnv`
- `tools=[...]` parameter with callable functions
- Functions with `@tool` decorator or tool schemas
- Model expected to emit tool calls (function calling format)

## What to Extract

1. **Available tools** — list every tool the model can call:
   - Function name and purpose (from docstring or function body)
   - Parameters it accepts
   - What it returns

2. **Tool execution flow** — what happens when model calls a tool:
   - Is there error handling? What does the model see on failure?
   - Any `stop_errors` that halt the rollout?

3. **Tool calling loop** — how many times can the model call tools:
   - `max_turns` or equivalent
   - What triggers the final scoring (model produces non-tool response? specific output?)

4. **State** — if `StatefulToolEnv`: what state is injected into tool calls via `args_to_skip`?

## What to Visualize

### Scan face — SVG flowchart

A loop that shows tool call → execution → result back to model:

```
[TASK] ──▶ [MODEL] ──▶ [TOOL CALL?] ──▶ [TOOL EXEC] ──▶ [MODEL]
                │ no                                         │
                └──────────────────────────────[SCORE] ◀────┘
```

Node style: rose palette (same as other rollout types)
- `[TOOL CALL?]` is a diamond shape — `fill: rgba(244,63,94,0.06)`, `stroke: rgba(244,63,94,0.4)`
- `[TOOL EXEC]` has a small "⚙" icon prefix in the label
- Show available tool names as small chips below `[TOOL EXEC]` node: each tool as a mini pill `fill: rgba(244,63,94,0.05)`, `font-size: 9px`

SVG height: `130px`.

### Detail drawer content

**1. Initial Prompt**
System prompt + first user message. Note if tools are described in system prompt.

**2. Available Tools**
For each tool, a compact block:
```
tool_name(param1, param2) → return_type
Description: what it does
```

**3. Tool Call Cycle**
Plain English: model sees task → decides to call a tool → tool executes → result appended to context → model continues. Show a realistic tool call + result exchange.

**4. Conversation Example**
```
User:   [task]
Asst:   [tool_call: search("query")]
Tool:   [{"result": "..."}]
Asst:   [tool_call: calculate(42, 8)]
Tool:   [{"result": 336}]
Asst:   [final answer using tool results]
[scored]
```

**5. Score**
How scoring works — is it based on the final non-tool response? All turns? Show formula.

## Reference Example Output

**Scan face SVG (schematic):**
```
[TASK]──▶[MODEL]──▶[TOOL CALL?]──▶[EXEC]──▶[MODEL]
              └──no──▶[SCORE]◀──done──┘
              
              Tools: search  calculate  lookup
```

**Drawer step 3:**
```
3  Tool Call Cycle
   Model receives task and available tools. It may call any tool
   by emitting a function_call. The framework executes the function
   and appends a ToolMessage with the result. The model can chain
   multiple tool calls before producing a final text response,
   which triggers scoring.
```
