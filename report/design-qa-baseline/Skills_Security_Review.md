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

## Line-level record

Line numbers refer to the copies in `.agents/skills/`, as reviewed. Removed files are cited as they were in the originals.

| File : line (function) | Behaviour | Purpose | Risk | Decision | Mitigation |
|---|---|---|---|---|---|
| `ui-ux-pro-max/scripts/search.py:110-152` (`--persist`) | Writes `design-system/<slug>/MASTER.md` | Save a generated design system | Low (local write) | **SAFE** in search mode | `--persist` and `--design-system` forbidden (AGENTS.md). Always run with `PYTHONDONTWRITEBYTECODE=1`. |
| `ui-ux-pro-max/scripts/design_system.py:615` | Reads `COLORTERM` | Terminal colours | None | **SAFE** | — |
| `ui-ux-pro-max/scripts/core.py:848-896` | Function name contains "requests"; no HTTP | Stack-version lookup | None | **SAFE** | — |
| `ui-ux-pro-max/scripts/validate_data.py:29` | `urllib.parse` only (URL format checks) | Data validation | None | **SAFE** | — |
| `design-system/scripts/slide-token-validator.py:30` | `subprocess.run([sys.executable, html-token-validator.py, …])` | Delegates to a sibling script | Low | **SAFE**, NOT APPLICABLE (slides) | Not run |
| `design-system/scripts/fetch-background.py:144-198` | Returns hard-coded Pexels URLs; no requests | Slide backgrounds | None | **SAFE**, NOT APPLICABLE | Not run |
| `brand/scripts/sync-brand-to-tokens.cjs:14,228-236` | `writeFileSync` tokens JSON + `execFileSync('node', generate-tokens.cjs)` in the current folder | Regenerate tokens from brand markdown | Medium: would create parallel tokens in this repo | **REVIEW**: never run here | Documented in AGENTS.md |
| `ui-styling/scripts/tailwind_config_gen.py` | Writes a `tailwind.config` file | Tailwind v3 setup | Low | NOT APPLICABLE (v4) | Never run |
| `design/scripts/icon/generate.py:28-45, 56, 198-237, 290-325` | Loads `.env` from the skill folder, `~/.claude/skills/.env` and `~/.claude/.env` into the environment; sends prompts to Google Gemini with `GEMINI_API_KEY` | AI icon generation | Medium: third-party transmission, reads global secret files, needs a pip package | **UNSAFE for this project** | **Removed** from the local copy |
| `design/scripts/logo/generate.py:33-46, 59, 145-172` | Same pattern (logo generation) | AI logo generation | Medium | **UNSAFE for this project** | **Removed** |
| `design/scripts/cip/generate.py:70-85, 205-247` | Same pattern (corporate identity mock-ups) | AI CIP generation | Medium | **UNSAFE for this project** | **Removed** |
| `ui-styling/scripts/shadcn_add.py:116-140, 163-186` | `subprocess.run(["npx", "shadcn@<ver>", "add", …])`, which downloads and runs a remote package that rewrites project files | Add shadcn components | High: remote code execution plus a forbidden dependency | **UNSAFE** | **Removed** |

**Not found anywhere:**
- telemetry or analytics calls;
- `eval` or `exec` on input;
- obfuscated code;
- destructive shell commands (`rm -rf`, `del`);
- global configuration changes;
- automatic package installation.

The only browser automation is this project's own QA tooling (`scripts/qa`, Playwright).
