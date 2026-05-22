# understanding-prime-env

[![npm version](https://img.shields.io/npm/v/understanding-prime-env.svg)](https://www.npmjs.com/package/understanding-prime-env)
[![npm downloads](https://img.shields.io/npm/dm/understanding-prime-env.svg)](https://www.npmjs.com/package/understanding-prime-env)

A skill that generates a rich, self-contained HTML report explaining any [Prime Intellect verifiers](https://github.com/PrimeIntellect-ai/verifiers) environment.

Run it from inside any environment folder and get an instant visual breakdown of:

- **Dataset & task examples** — what prompts the model sees, with sample rows
- **Reward functions** — every reward/metric, its weight, scoring range, and plain-English description
- **Rollout logic** — the full scoring pipeline from prompt → response → final score
- **Configuration reference** — every parameter with type, default, and description
- **Quick-start commands** — install and run the environment immediately

Output is a single `environment_overview.html` file styled to match the Prime Intellect platform.

---

## Installation

### One-line install (recommended)

```bash
npx understanding-prime-env
```

Running the command with no arguments launches an interactive prompt that lets you choose your editor/CLI and install scope.

### Non-interactive flags

```bash
# Claude Code — global (available in every project)
npx understanding-prime-env --claude --global

# Claude Code — local (this project only)
npx understanding-prime-env --claude

# Cursor
npx understanding-prime-env --cursor

# Windsurf
npx understanding-prime-env --windsurf

# GitHub Copilot
npx understanding-prime-env --copilot

# Zed
npx understanding-prime-env --zed

# All supported tools at once
npx understanding-prime-env --all
```

### Manual install (Claude Code legacy)

```bash
claude plugin marketplace add Vidit-Ostwal/understanding-prime-env
claude plugin install understand-environment@understanding-prime-env
```

---

## Supported tools

| Tool | What gets installed |
|---|---|
| **Claude Code** | `~/.claude/skills/understand-environment/SKILL.md` (global) or `.claude/skills/…` (local) |
| **Cursor** | `.cursor/rules/understand-environment.mdc` |
| **Windsurf** | appended to `.windsurfrules` |
| **GitHub Copilot** | appended to `.github/copilot-instructions.md` |
| **Zed** | `custom_instructions` field in `.zed/settings.json` |

---

## Usage

Navigate into any verifiers environment folder and ask your AI assistant:

```
"explain this environment"
"what does this env do?"
"generate an HTML overview"
"understand this environment"
```

The assistant will read the Python source files and write `environment_overview.html` to the current directory.

```bash
cd environments/ifeval_goblin
# ask your assistant to "explain this environment"
open environment_overview.html
```

## Requirements

- Node.js ≥ 16 (for the installer)
- A verifiers environment directory to analyze

---

## Links

- [npm package](https://www.npmjs.com/package/understanding-prime-env)
- [GitHub repository](https://github.com/Vidit-Ostwal/understanding-prime-env)
