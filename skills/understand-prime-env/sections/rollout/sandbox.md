# Rollout Section — Sandbox Environment

## Detection Signals

This section applies when the source contains any of:
- `class MyEnv(vf.SandboxEnv)` or `PythonEnv` or `BrowserEnv`
- `docker_image=...` parameter
- `SandboxConfig(...)` with container resource specs
- `CliAgentEnv`, `OpenCodeEnv`, or similar container-based envs
- Code execution inside a container (bash commands, Python REPL)

## What to Extract

1. **Sandbox configuration** — extract:
   - `docker_image` — what container is used
   - `cpu_cores`, `memory_gb`, `disk_size_gb` — resource limits (if present)
   - `timeout_minutes`, `timeout_per_command_seconds`
   - `environment_vars` — any env vars injected

2. **What runs in the sandbox** — is it:
   - A persistent Python REPL (PythonEnv)?
   - Bash command execution (SandboxEnv)?
   - A browser (BrowserEnv)?
   - A full agent loop (CliAgentEnv)?

3. **Model interaction** — how does the model interact with the sandbox:
   - Does it generate code that gets executed?
   - Does it issue shell commands?
   - Does it see stdout/stderr?

4. **Lifecycle** — setup (container start), per-turn execution, cleanup (container teardown)

## What to Visualize

### Scan face — SVG flowchart

A pipeline that shows container lifecycle + execution loop:

```
[TASK] ──▶ [SANDBOX INIT] ──▶ [MODEL] ──▶ [EXECUTE] ──▶ [MODEL]
                                   │ done                    │
                               [CLEANUP] ◀──────────────────┘
                                   │
                               [SCORE]
```

Node style: rose palette
- `[SANDBOX INIT]` has a "🐳" or "⬡" prefix (use text "DOCKER" in small caps if emoji unavailable)
- `[EXECUTE]` subtitle: the execution type (Python REPL / bash / browser)
- `[CLEANUP]` in muted style: `fill: rgba(244,63,94,0.04)`, `stroke: rgba(244,63,94,0.2)`
- Show resource specs as small chips below `[SANDBOX INIT]`: `image: python:3.11`, `2 CPU`, `4GB RAM`

SVG height: `150px`.

### Detail drawer content

**1. Sandbox Setup**
What container is launched. Show docker image, resource limits, any environment variables. Explain what the container provides (Python REPL, bash shell, browser, etc.).

**2. Initial Prompt**
How the task is presented to the model. Does the system prompt explain sandbox capabilities? Show template.

**3. Execution Cycle**
Plain English: model generates code/command → framework sends to sandbox → sandbox executes → stdout/stderr returned to model → model continues. Show a realistic exchange.

**4. Conversation Example**
```
User:   [coding task]
Asst:   ```python
        def solve(n): ...
        print(solve(42))
        ```
Exec:   stdout: "1764\n"
Asst:   "The answer is 1764."
[sandbox cleaned up — scored]
```

**5. Score + Cleanup**
When scoring fires. What cleanup does (container teardown). Score formula.

## Reference Example Output

**Scan face SVG (schematic):**
```
[TASK]──▶[DOCKER INIT]──▶[MODEL]──▶[EXEC]──▶[MODEL]
          python:3.11      │done        Python REPL  │
          2CPU / 4GB    [CLEANUP]◀──────────────────┘
                            │
                         [SCORE]
```

**Drawer step 1:**
```
1  Sandbox Setup
   A Docker container is launched for each rollout.

   Image:    python:3.11-slim
   CPU:      2 cores
   Memory:   4 GB
   Timeout:  10 minutes (2 min per command)

   The container provides a persistent Python REPL. All code
   the model writes is executed inside this isolated environment.
   Files and variables persist across turns within a rollout.
```
