#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const SKILL_NAME = 'understand-environment';
const PACKAGE_ROOT = path.join(__dirname, '..');
const SKILL_MD_PATH = path.join(PACKAGE_ROOT, 'skills', SKILL_NAME, 'SKILL.md');

// ── helpers ──────────────────────────────────────────────────────────────────

function readSkillRaw() {
  return fs.readFileSync(SKILL_MD_PATH, 'utf8');
}

function readSkillBody() {
  const raw = readSkillRaw();
  const m = raw.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return m ? m[1].trim() : raw.trim();
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function appendOrCreate(filePath, section) {
  if (fs.existsSync(filePath)) {
    fs.appendFileSync(filePath, '\n\n' + section);
  } else {
    fs.writeFileSync(filePath, section);
  }
}

function ok(msg)   { console.log('\x1b[32m✓\x1b[0m ' + msg); }
function info(msg) { console.log('\x1b[36mℹ\x1b[0m ' + msg); }
function warn(msg) { console.log('\x1b[33m⚠\x1b[0m ' + msg); }
function fail(msg) { console.error('\x1b[31m✗\x1b[0m ' + msg); process.exit(1); }

// ── installers ────────────────────────────────────────────────────────────────

function installClaude(isGlobal) {
  const base = isGlobal
    ? path.join(os.homedir(), '.claude', 'skills')
    : path.join(process.cwd(), '.claude', 'skills');
  const dest = path.join(base, SKILL_NAME);
  ensureDir(dest);
  fs.writeFileSync(path.join(dest, 'SKILL.md'), readSkillRaw());
  ok(`Claude Code  →  ${dest}/SKILL.md`);
  if (isGlobal) {
    info('Skill is now available in every project.');
  } else {
    info('Skill is available in this project only. Add .claude/ to .gitignore if you do not want to commit it.');
  }
}

function installCursor() {
  const body = readSkillBody();
  const dest = path.join(process.cwd(), '.cursor', 'rules');
  ensureDir(dest);
  const outPath = path.join(dest, `${SKILL_NAME}.mdc`);
  // Cursor MDC format: YAML front-matter + markdown body
  const mdc = [
    '---',
    `description: ${SKILL_NAME} — generate HTML overview for a Prime Intellect verifiers environment`,
    'globs:',
    '  - "**/*.py"',
    'alwaysApply: false',
    '---',
    '',
    body,
  ].join('\n');
  fs.writeFileSync(outPath, mdc);
  ok(`Cursor  →  ${outPath}`);
  info('Rule is off by default. Enable it in Cursor Settings → Rules when working in a verifiers folder.');
}

function installWindsurf() {
  const body = readSkillBody();
  const outPath = path.join(process.cwd(), '.windsurfrules');
  const section = `# understand-environment\n\n${body}`;
  appendOrCreate(outPath, section);
  ok(`Windsurf  →  ${outPath}`);
}

function installCopilot() {
  const body = readSkillBody();
  const dir = path.join(process.cwd(), '.github');
  ensureDir(dir);
  const outPath = path.join(dir, 'copilot-instructions.md');
  const section = `# understand-environment\n\n${body}`;
  appendOrCreate(outPath, section);
  ok(`GitHub Copilot  →  ${outPath}`);
}

function installZed() {
  const body = readSkillBody();
  const zedDir = path.join(process.cwd(), '.zed');
  ensureDir(zedDir);
  const settingsPath = path.join(zedDir, 'settings.json');

  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch (_) {}
  }

  const existing = settings.assistant?.default_context?.custom_instructions ?? '';
  const separator = existing ? '\n\n---\n\n' : '';
  settings.assistant = settings.assistant ?? {};
  settings.assistant.default_context = settings.assistant.default_context ?? {};
  settings.assistant.default_context.custom_instructions = existing + separator + `# understand-environment\n\n${body}`;

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  ok(`Zed  →  ${settingsPath}`);
}

function installAll(isGlobal) {
  installClaude(isGlobal);
  installCursor();
  installWindsurf();
  installCopilot();
  installZed();
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const TOOLS = {
  claude:   { label: 'Claude Code',     fn: (g) => installClaude(g) },
  cursor:   { label: 'Cursor',          fn: () => installCursor() },
  windsurf: { label: 'Windsurf',        fn: () => installWindsurf() },
  copilot:  { label: 'GitHub Copilot',  fn: () => installCopilot() },
  zed:      { label: 'Zed',             fn: () => installZed() },
  all:      { label: 'All of the above',fn: (g) => installAll(g) },
};

const HELP = `
understand-environment installer
Usage: npx understanding-prime-env [tool] [options]

Tools (optional — omit for interactive prompt):
  --claude       Install for Claude Code
  --cursor       Install for Cursor
  --windsurf     Install for Windsurf
  --copilot      Install for GitHub Copilot
  --zed          Install for Zed
  --all          Install for all supported tools

Options:
  --global, -g   Claude Code only: install to ~/.claude/skills/ (global)
  --help,   -h   Show this message
`.trim();

function parseArgs() {
  const argv = process.argv.slice(2);
  let tool = null;
  let isGlobal = false;

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h')   { console.log(HELP); process.exit(0); }
    if (arg === '--global' || arg === '-g') { isGlobal = true; continue; }
    const key = arg.replace(/^--/, '');
    if (TOOLS[key]) tool = key;
  }
  return { tool, isGlobal };
}

async function prompt(question, choices) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log('\n' + question);
  choices.forEach((c, i) => console.log(`  ${i + 1}) ${c}`));
  return new Promise((resolve) => {
    rl.question('\nEnter number: ', (answer) => {
      rl.close();
      const idx = parseInt(answer, 10) - 1;
      resolve(idx >= 0 && idx < choices.length ? idx : -1);
    });
  });
}

async function main() {
  console.log('\n\x1b[1munderstand-environment\x1b[0m  ·  Prime Intellect verifiers skill\n');

  const { tool, isGlobal } = parseArgs();

  if (tool) {
    TOOLS[tool].fn(isGlobal);
    return;
  }

  // interactive
  const keys    = Object.keys(TOOLS);
  const labels  = keys.map(k => TOOLS[k].label);
  const idx     = await prompt('Which editor / CLI tool do you want to install for?', labels);
  if (idx === -1) { fail('Invalid selection.'); }

  const chosen = keys[idx];
  let global = isGlobal;

  if (chosen === 'claude' || chosen === 'all') {
    const scopeIdx = await prompt(
      'Install scope for Claude Code:',
      ['Global  (~/.claude/skills/ — available everywhere)', 'Local   (.claude/skills/ — this project only)']
    );
    global = scopeIdx === 0;
  }

  TOOLS[chosen].fn(global);
}

main().catch((err) => { fail(err.message); });
