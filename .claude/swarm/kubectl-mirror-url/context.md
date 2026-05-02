# Experiment: Multi-Agent Swarm Development in an Open-Source Project
## Feature: kubectl Custom Repository URL

**Author**: Robert Altman  
**Date started**: 2026-04-20  
**Current date**: 2026-04-23  
**Project**: [freelensapp/freelens](https://github.com/freelensapp/freelens)  
**Branch**: `rda`  
**Experiment slug**: `kubectl-mirror-url`

---

## Purpose of This Document

This file serves as the **running log, storyboard source, and retrospective base** for a learning experiment in multi-agent software development. It is updated chronologically as each phase completes. After the swarm run it becomes the raw material for:

- A technical retrospective (`.claude/swarm/kubectl-mirror-url/retrospective.md`)
- A presentation / storyboard on agent-assisted OSS contribution
- A reusable template for future swarm-based feature development

---

## 1. Motivation

### The Problem Being Solved (Feature)

Freelens downloads `kubectl` binaries from a hardcoded set of mirrors:

| Mirror key | URL |
|------------|-----|
| `"default"` | `https://dl.k8s.io/release` |
| `"china"` | `https://mirror.azure.cn/kubernetes/kubectl` |

Corporate environments often cannot reach these public URLs. They maintain internal artifact mirrors but have no way to point Freelens at one. The only current workaround is to disable auto-download entirely and manage the binary manually.

**The fix**: Add a free-text URL field in Preferences → Kubernetes → kubectl that, when set, overrides the mirror selection entirely.

### The Bigger Goal (Experiment)

This feature is the **test case** for a larger experiment: can a structured multi-agent swarm — where an orchestrator spawns specialized sub-agents for architecture, UI, backend, review, and QA — implement a real feature in a production open-source Electron codebase, with enough quality to submit a PR?

Secondary questions:
- How much human context-setting is needed before the swarm can operate?
- Where do agents succeed without help? Where do they need correction?
- Is the context-file accumulation pattern an effective way to pass state between agents?
- What does this workflow look like as a repeatable template?

---

## 2. Project Background

**Freelens** is a free, open-source fork of OpenLens (the open-source core of Lens Desktop by Mirantis). It was created in 2024 when Mirantis closed the open-source version. Today it is maintained by a volunteer core team and has broad community adoption.

| Attribute | Value |
|-----------|-------|
| Language | TypeScript (Electron + React) |
| Build system | Turbo monorepo, pnpm workspaces |
| DI framework | `@ogre-tools/injectable` |
| State management | MobX (observable + observer) |
| Bundler | Webpack |
| Test runner | Jest |
| Linter | Biome + Trunk |
| Node requirement | 22.x (project: 22.22.1, actual: 22.22.2 ✓) |

---

## 3. Chronological Setup Log

### Phase 0 — First Session (2026-04-20): Planning

**Session context**: First time working on this project with Claude Code. CWD was `~/dev/freelens`.

**Actions taken**:
1. Claude explored the Freelens codebase and architecture documentation
2. Designed the full implementation and swarm plan (saved to `/Users/robert/.claude/plans/we-are-going-to-velvet-beaver.md`)
3. Decided to move the project to `~/dev/oss/freelens` to establish a convention: OSS projects in `~/dev/oss/`, personal in `~/dev/`
4. Session ended mid-execution because Claude Code's CWD was still pointed at old path after the move

**Key decisions made**:
- `.claude/` directory is **valuable experiment documentation** — track it locally, never push to OSS upstream
- Gate PRs with a `prep-pr.sh` script rather than gitignore
- Skills/commands live in `.claude/` (project-local, never in upstream PRs)
- Use the Claude Agent SDK `Agent` tool with `isolation: "worktree"` for agents that write code

**Artifacts produced**:
- `/Users/robert/.claude/plans/we-are-going-to-velvet-beaver.md` — the full plan

---

### Phase 1 — Second Session (2026-04-23): Infrastructure Creation

**Session context**: Reopened Claude Code from `~/dev/oss/freelens`. CWD now correct. Bash tools working.

**Problem found at session start**: The plan called for skill files in `.claude/skills/`, but Claude Code custom slash commands require `.claude/commands/` as the directory. Files in `.claude/skills/` are readable as prompt templates but are NOT auto-registered as `/skill-name` commands.

**Actions taken**:
1. Created directory structure: `.claude/scripts/`, `.claude/skills/`, `.claude/swarm/`
2. Created `prep-pr.sh` — blocks `.claude/` files from being staged before a PR
3. Created all skill/agent files (see Section 4)
4. Confirmed Node version: `v22.22.2` (matches `.nvmrc` requirement of `22.22.1` ✓)
5. Ran `pnpm i && pnpm build:di && pnpm build` → **compiled without errors** ✓
6. Ran `pnpm build:app:dir` → Electron app packaged ✓
7. Ran `pnpm start` → **app launched successfully** ✓
8. Navigated to Preferences → Kubernetes → kubectl — confirmed baseline UI with existing fields
9. Created this context/log file

**Gap identified**: `.claude/skills/` vs `.claude/commands/`
- **Status**: Documented; will be addressed before swarm execution by either renaming the directory or manually invoking the orchestrator skill by reading it
- **Impact**: Low — the orchestrator can be invoked by reading `implement-feature.md` and acting on it; the slash command shortcut is a convenience, not a requirement

---

### Phase 2 — Pre-Execution Verification (2026-04-23)

**Baseline UI confirmed** (Preferences → Kubernetes → kubectl):

| orderNumber | Existing field | Status |
|-------------|---------------|--------|
| 10 | Download kubectl binaries (toggle) | ✓ visible |
| 20 | Download mirror (select dropdown) | ✓ visible |
| 30 | Directory for binaries (path input) | ✓ visible |
| 40 | Path to binary (manual path input) | ✓ visible |

**Target insertion point**: orderNumber **25** — between mirror dropdown and directory field.

**Build cycle verified**:
```
pnpm build:di → pnpm build → pnpm start   (full)
pnpm build:app:dir → pnpm start            (package + launch)
```

**Environment summary**:
```
Node: v22.22.2  (required: 22.22.1)  ✓
pnpm: 10.33.0                         ✓
Branch: rda (0 commits ahead of main)
.claude/ directory: tracked locally, not in .gitignore
```

---

## 4. Swarm Configuration

### Philosophy

Rather than implementing features in a single monolithic conversation, we build an **orchestration layer**: Claude receives a feature description and coordinates multiple specialized agents. Each agent has a narrow role. The result is separation of concerns, parallelism where possible, and a built-in review+test pass.

This is a **learning experiment**. Success is not just "feature works" — it is "we understand where agents helped, where they failed, and how to improve the template."

### Agent Roster

| Agent | Skill file | Role | Runs in worktree? |
|-------|-----------|------|-------------------|
| Orchestrator | `implement-feature.md` | Coordinates all phases, writes context file, summarizes | No |
| Architecture | `agent-architecture.md` | Reads codebase, produces exact file map + spec | Yes (read-heavy) |
| Frontend | `agent-frontend.md` | Creates React component + preference block injectable | Yes |
| Backend | `agent-backend.md` | Wires descriptor, storage, kubectl.ts logic | Yes |
| Code Review | `agent-review.md` | Reviews all changes against a checklist | No (read-only) |
| QA / Test | `agent-qa.md` | Writes unit tests + manual verification plan | Yes |

### Execution Phases

```
Phase 1 (sequential):   [Architecture]
Phase 2 (parallel):     [Frontend] ║ [Backend]
Phase 3 (sequential):   [Code Review]
Phase 4 (sequential):   [QA / Test]
Phase 5 (orchestrator): Summary + next steps
```

### State Sharing Pattern

Agents communicate through this file (context.md). Each agent:
1. Reads prior sections to understand what was decided before it
2. Appends its own section when done

This creates a human-readable, inspectable record of the entire run. No hidden state.

### Skill Files Created

```
.claude/
  scripts/
    prep-pr.sh                    ← PR safety gate
  skills/
    freelens.md                   ← Project knowledge base (dev workflow, DI rules, file paths)
    implement-feature.md          ← Orchestrator: phases, context file format, summary template
    agent-architecture.md         ← Architecture agent: codebase analysis → file map
    agent-frontend.md             ← Frontend agent: React/MobX component patterns
    agent-backend.md              ← Backend agent: descriptor, storage, kubectl.ts
    agent-review.md               ← Review agent: DI, MobX, TypeScript, UX checklist
    agent-qa.md                   ← QA agent: test patterns, manual verification plan
```

**Known gap**: Claude Code custom slash commands must live in `.claude/commands/`, not `.claude/skills/`. The files work as prompt templates read by the orchestrator, but `/implement-feature` is not a registered slash command. Resolution: either move files to `.claude/commands/` or invoke by manually reading the skill file.

---

## 5. Feature Specification

**Name**: kubectl Custom Repository URL  
**Preference key**: `kubectlDownloadMirrorUrl`  
**Type**: `string | undefined`

### What It Does

Adds a free-text URL input to Preferences → Kubernetes → kubectl. When set, `getDownloadMirror()` in `kubectl.ts` returns this URL directly, bypassing the `packageMirrors` map entirely. When empty or unset, existing mirror behavior is unchanged.

### UI Specification

- **Location**: Preferences → Kubernetes → kubectl section
- **Position**: `orderNumber: 25` (after mirror dropdown at 20, before directory field at 30)
- **Label**: "Custom download URL" (or similar)
- **Placeholder**: `https://internal.corp/kubectl`
- **Disabled when**: `state.downloadKubectlBinaries === false`
- **Saves**: `undefined` when cleared (not empty string)
- **Validation**: URL format only when non-empty (do not block the empty/unset state)

### Files to Modify

| File | Change |
|------|--------|
| `packages/core/src/features/user-preferences/common/preference-descriptors.injectable.ts` | Add `kubectlDownloadMirrorUrl` descriptor |
| `packages/core/src/features/user-preferences/common/storage.injectable.ts` | Wire `fromStore` + `toJSON` |
| `packages/core/src/main/kubectl/kubectl.ts` | Update `getDownloadMirror()` to check custom URL first |

### Files to Create

| File | Notes |
|------|-------|
| `packages/core/src/features/preferences/renderer/preference-items/kubernetes/kubectl/kubectl-download-mirror-url/kubectl-download-mirror-url.tsx` | React component |
| `packages/core/src/features/preferences/renderer/preference-items/kubernetes/kubectl/kubectl-download-mirror-url/kubectl-download-mirror-url-preference-block.injectable.ts` | Preference block injectable |
| `...kubectl-download-mirror-url/register-injectables.ts` | AUTO-GENERATED — do not create manually |

### No Migration Needed

`kubectlDownloadMirrorUrl` is a new optional field. Existing preference files without it produce `undefined`, which correctly falls through to the mirror map.

---

## 6. Next Steps (Pre-Swarm)

- [x] Build compiles without errors
- [x] App launches and baseline UI confirmed
- [x] All skill files created
- [ ] **Fix skill file location**: move or copy `.claude/skills/` → `.claude/commands/` OR confirm manual invocation approach
- [ ] **Execute swarm**: invoke orchestrator with the feature description below
- [ ] **Post-run**: verify `pnpm build:di && pnpm build && pnpm start` shows new field
- [ ] **Manual QA**: test all states (set, clear, disabled, persist across restart)
- [ ] **Automated checks**: `pnpm test:unit:core && pnpm lint`
- [ ] **PR prep**: run `.claude/scripts/prep-pr.sh`, confirm only feature files staged
- [ ] **Submit PR** to `freelensapp/freelens`

### Feature description to pass to the orchestrator:

```
Add a "Custom kubectl download URL" text input to Preferences > Kubernetes > kubectl,
between the mirror dropdown (orderNumber 20) and the directory field (orderNumber 30),
at orderNumber 25. The field stores a value named kubectlDownloadMirrorUrl (string | undefined).
When set, it overrides getDownloadMirror() in kubectl.ts — the custom URL is returned
directly instead of looking up the packageMirrors map. The field should be disabled
when downloadKubectlBinaries is false. Empty string saves as undefined. No migration needed.
```

---

## 7. Swarm Execution Log

*This section will be appended by each agent as it runs.*

### Architecture Analysis
<!-- Architecture agent appends here -->

### Frontend Implementation
<!-- Frontend agent appends here -->

### Backend Implementation
<!-- Backend agent appends here -->

### Code Review Findings
<!-- Review agent appends here -->

### QA Plan
<!-- QA agent appends here -->

### Orchestrator Summary
<!-- Orchestrator appends here after all phases complete -->

---

## 8. UI Iteration History

### Iteration 1 — Standalone text box (commit b124ebf6)

**What was built**: A free-text input below the mirror dropdown with placeholder `https://mirror.corp/kubernetes/kubectl`. Always visible, always editable (disabled only when `downloadKubectlBinaries === false`). The `getDownloadMirror()` function returned `kubectlDownloadMirrorUrl` unconditionally if it was set, overriding whatever the mirror dropdown showed.

**Problems found (by the /simplify review)**:

| Problem | Root cause |
|---------|-----------|
| `InputValidators.isUrl` never fired | Validator has an internal `condition: ({ type }) => type === "url"` gate — requires `<Input type="url">` to activate. The Input had no `type` prop. Validation silently disabled. |
| No Enter-key save | Only `onBlur` was wired. Standard UX expects Enter to also commit. |
| `getDownloadMirror()` silently overrode named mirrors | If a user typed a URL, then switched back to "Default (Google)", the custom URL still won. No way to "use default again" short of clearing the field. |
| No visual connection to the mirror dropdown | The two controls looked unrelated. Users had no indication the text field was an override for the dropdown. |

**Why these were missed**: The architecture agent and frontend agent each implemented their own piece without a unified UX review. The backend agent correctly wired `getDownloadMirror()` but didn't model the user interaction of "switch back to a named mirror." The review agent caught the `isUrl` bug and missing Enter handler but not the silent-override semantic problem. No full end-to-end UX walkthrough was performed before the code review phase.

---

### Iteration 2 — Integrated dropdown (current: post-plan implementation)

**What was built**: "Custom URL..." added as a third option in the mirror dropdown. The text input below is now gated — enabled only when `downloadMirror === "custom"`, disabled otherwise. `getDownloadMirror()` only uses the custom URL when `downloadMirror === "custom"`. Custom HTTPS-only validator added inline. Enter-key save added. `fromStore` fixed to accept "custom" as a valid mirror key (without this, MobX's storage reaction roundtrip silently reset "custom" back to `defaultPackageMirror`).

**Problem found by user after visual inspection**:

The dropdown option label is `"Custom URL..."` and the text input placeholder is also `"Custom URL..."`. To a user, this looks like the text input is the same control duplicated — especially because the dropdown selection and the placeholder text are visually identical strings. The user concluded the text input was the "old" standalone box that should have been removed.

**Why was this missed**:
1. **Focus was on behavior, not copy** — the plan specified behavior (enabled/disabled, validation, save on blur/Enter). Placeholder text was treated as a minor detail and inherited from the dropdown option label without independent review.
2. **No visual diff review** — changes were validated by running the tests and confirming the build succeeded. Nobody looked at the rendered UI and asked "do these two 'Custom URL...' labels make sense side by side?"
3. **Agents don't self-audit UX copy** — both the frontend agent (wrote the component) and the review agent (checked code quality) operated on source code, not on a rendered screenshot. UX copy review requires seeing the actual UI.
4. **The right question wasn't asked** — a good UX review would ask: "If I'm a first-time user, what does each element tell me?" The dropdown option says "Custom URL..." (meaning: switch to custom mode). The placeholder also says "Custom URL..." (meaning: hint about what to type). They mean different things but use the same words.

**Fix**: Change the URL input placeholder from `"Custom URL..."` to `"https://mirror.example.com/kubectl"` so the two controls are visually distinct and the placeholder communicates what format the URL should take.

---

## 9. Observations & Issues (Running)

*Append here whenever something unexpected happens, a decision is made, or a correction is needed.*

| Date | Phase | Observation |
|------|-------|-------------|
| 2026-04-23 | Setup | Skill files placed in `.claude/skills/` — Claude Code requires `.claude/commands/` for slash command registration. Low impact; manual invocation works. |
| 2026-04-23 | Setup | `pnpm start` failed on first attempt — binary at `dist/mac-arm64/` does not exist until `pnpm build:app:dir` is run. Not documented in AGENTS.md. Added to skill file. |
| 2026-04-27 | UI review | `fromStore` for `downloadMirror` rejected "custom" (not in `packageMirrors` map) — MobX storage reaction roundtripped the value back to `defaultPackageMirror`. Required explicit "custom" allowance in the `fromStore` guard. |
| 2026-04-27 | UI review | Placeholder `"Custom URL..."` on text input is visually identical to the dropdown option label. User concluded the text input was redundant. Fix: use a concrete URL example as placeholder. |

---

## 9. Retrospective (Post-Run)

*To be written after the swarm completes.*

Questions to answer:
- Which agents produced high-quality output on the first pass?
- Where did agents make errors or need human correction?
- Was the context file an effective state-sharing mechanism?
- Did parallel execution (Frontend + Backend) work without conflicts?
- What would you change about the skill prompts?
- How long did the swarm take vs. direct implementation estimate?
- Is this approach worth repeating? For what class of features?
- What does the template need before the next run?
