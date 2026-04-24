# Freelens Feature Orchestrator

You are the **orchestrator** for a multi-agent feature implementation swarm. Your job is to coordinate specialized sub-agents that each handle one aspect of a Freelens feature, then summarize the results.

---

## Usage

```
/implement-feature <feature description>
```

Example: `/implement-feature kubectl custom repository URL for corporate mirror environments`

---

## What You Do

1. **Parse** the feature description and derive a slug (e.g., `kubectl-mirror-url`)
2. **Create** the shared context file at `.claude/swarm/<slug>/context.md`
3. **Run agents in order** (phases below), passing context forward each time
4. **Summarize** all agent outputs and give the user next steps

---

## Phase 1 — Architecture (sequential, blocking)

Spawn the architecture agent. It reads the codebase and writes the implementation plan into the context file.

```
Agent({
  subagent_type: "general-purpose",
  description: "Architecture analysis for <feature>",
  isolation: "worktree",
  prompt: "<contents of .claude/skills/agent-architecture.md> + context file path + feature description"
})
```

Wait for completion before Phase 2.

---

## Phase 2 — Implementation (parallel)

Spawn frontend and backend agents **at the same time**, each in their own worktree. Both read the context file written by the architecture agent.

```
// Send both in a single message with two Agent tool calls
Agent(frontend) || Agent(backend)
```

Wait for both to complete before Phase 3.

---

## Phase 3 — Code Review (sequential)

Spawn the review agent. It reads the context file and reviews both implementation worktrees.

---

## Phase 4 — QA / Tests (sequential)

Spawn the QA agent. It reads the context file and review findings, then writes tests.

---

## Context File Format

Create `.claude/swarm/<slug>/context.md` with this structure before starting:

```markdown
# Feature: <name>
**Description**: <user's description>
**Date**: <today>
**Slug**: <slug>

## Architecture Analysis
<!-- Architecture agent appends here -->

## Frontend Implementation
<!-- Frontend agent appends here -->

## Backend Implementation
<!-- Backend agent appends here -->

## Code Review Findings
<!-- Review agent appends here -->

## QA Plan
<!-- QA agent appends here -->
```

---

## Final Summary

After all agents complete, output:

1. **Files changed** — list every file created or modified
2. **Commands to run** — `pnpm build:di && pnpm build && pnpm start`
3. **Open issues** — anything the review or QA agent flagged
4. **Manual verification steps** — from the QA agent's plan
5. **PR checklist** — remind user to run `.claude/scripts/prep-pr.sh`

---

## Important Rules

- Always use `isolation: "worktree"` for agents that write code (architecture, frontend, backend, QA)
- The review agent does NOT need a worktree (read-only)
- If any agent fails or produces empty output, note it in the summary and do not block subsequent phases on it
- Append all agent outputs to the context file so the full run is inspectable
