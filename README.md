# understanding-prime-env

A Claude Code plugin that generates a rich, self-contained HTML report explaining any [Prime Intellect verifiers](https://github.com/PrimeIntellect-ai/verifiers) environment.

Run it from inside any environment folder and get an instant visual breakdown of:

- **Dataset & task examples** — what prompts the model sees, with sample rows
- **Reward functions** — every reward/metric, its weight, scoring range, and plain-English description
- **Rollout logic** — the full scoring pipeline from prompt → response → final score
- **Configuration reference** — every parameter with type, default, and description
- **Quick-start commands** — install and run the environment immediately

Output is a single `environment_overview.html` file styled to match the Prime Intellect platform (dark purple theme, syntax-highlighted code, collapsible sections).

## Installation

```bash
# 1. Add this repo as a marketplace
claude plugin marketplace add Vidit-Ostwal/understanding-prime-env

# 2. Install the plugin
claude plugin install understand-environment@understanding-prime-env
```

## Usage

Navigate into any verifiers environment folder and ask Claude:

```
"explain this environment"
"what does this env do?"
"generate an HTML overview"
"understand this environment"
```

Claude will read the source files and write `environment_overview.html` to the current directory.

## Example

```bash
cd environments/ifeval_goblin
# then in Claude Code:
# "explain this environment"
# → writes environment_overview.html
open environment_overview.html
```

## Requirements

- [Claude Code](https://claude.ai/code)
- A verifiers environment directory to analyze
