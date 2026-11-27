# Skills security review (2026-11-27)

**Scope:** the 7 project skills in `.agents/skills/`, about 40 scripts and 14k lines of Python and Node.

- **Source:** your original worktree (`Codex - GREAT EMPOWER Design System`), where they are staged but uncommitted.
- **Local copy:** copied read-only into this worktree and excluded from Git via `.git/info/exclude`. The originals are unchanged; `diff -r` matched before the removals below.
- **Also reviewed:** Anthropic's `frontend-design` skill (markdown only).

## Method
1. **Find every sensitive call site:** network (`urllib`, `requests`, `http`, `fetch`, `socket`), processes (`subprocess`, `child_process`, `os.system`), dynamic code (`eval`, `exec`, `new Function`), environment and secrets (`os.environ`, `process.env`, API keys), and file writes or deletes.
2. **Read each hit in context** and decide whether the behaviour is legitimate, necessary for GREAT EMPOWER, and safe. A keyword match on its own was not treated as a verdict.

## Findings

| Script | What it actually does | Verdict | Action |
|---|---|---|---|
| `ui-ux-pro-max/scripts/{search,core,design_system,reasoning_contract}.py` | Offline search over bundled CSVs, printed to stdout. Writes files only with `--persist`, to `design-system/<slug>/MASTER.md`. Reads `COLORTERM` only to colour terminal output. `core.py`'s "requests" hits are a function named `_stack_query_requests_legacy`, not the HTTP library. | Safe | Kept. Ran it with `PYTHONDONTWRITEBYTECODE=1`. `--persist`/`--design-system` must not be used (`AGENTS.md`). |
| `ui-ux-pro-max/scripts/validate_data.py` | `urllib.parse` to validate URL *format* in the data. No requests. | Safe | Kept (not run) |
| `ui-ux-pro-max/scripts/tests/*` | `subprocess` runs the skill's own `search.py` with the same interpreter. | Safe | Kept (not run) |
| `design-system/scripts/slide-token-validator.py` | `subprocess.run([sys.executable, html-token-validator.py, …])`, i.e. delegates to the sibling script. | Safe | Kept |
| `design-system/scripts/fetch-background.py` | Returns hard-coded Pexels URLs and builds a Pexels *search* URL. No HTTP calls, despite the name. | Safe; not needed (slides) | Kept |
| `brand/scripts/sync-brand-to-tokens.cjs` | Reads a brand-guidelines markdown file. Writes `design-tokens.json`, then runs `generate-tokens.cjs` (local, `execFileSync('node', …)`) to write a tokens CSS file in the current folder. | Not malicious, but **running it here would create a parallel token file**, which `AGENTS.md` forbids | Kept as reference; **must not be run in this repo** |
| `ui-styling/scripts/tailwind_config_gen.py` | Writes a `tailwind.config` file | Inapplicable (Tailwind v4 has no config file) | Kept; must not be run |
| **`design/scripts/{logo,cip,icon}/generate.py`** | Loads `.env` files from the skill folder **and from `~/.claude/.env` and `~/.claude/skills/.env`** into the environment. Sends prompt text to Google Gemini image models with `GEMINI_API_KEY`. Needs `pip install google-genai`. | Not malicious, but it sends data to a third party, reads global secret files and needs a new package. Not needed: GREAT EMPOWER's brand and logo are fixed, and icons are hand-made SVG. | **Removed from the local copy** |
| **`ui-styling/scripts/shadcn_add.py`** | Runs `npx shadcn@<version> add …`, which downloads and executes a remote package that rewrites project files | Remote code execution plus a forbidden dependency (`AGENTS.md`: no shadcn/ui) | **Removed from the local copy** |
| `frontend-design/SKILL.md` (Anthropic, Apache-2.0) | Markdown guidance only | Safe | Installed in `.claude/skills/` |

**No findings of:** data exfiltration, obfuscated or dynamic code (`eval`/`exec` on input), destructive shell commands, global configuration changes, or automatic installs.

**Discovered but not adopted:** a `taste-skill-main` package is staged in your original worktree. It wasn't required and wasn't reviewed, so it wasn't copied.

## Packages added (dev only)

| Package | Version | Why |
|---|---|---|
| `@playwright/test` | 1.65.1 | Browser automation, interaction tests and visual regression. Uses the installed Chrome, so no browser download. |
| `@axe-core/playwright` | 4.14.1 | WCAG accessibility audit inside Playwright |

Both are dev dependencies only: nothing ships to users. pnpm (v10) blocks install scripts by default, and no `playwright install` was run.
