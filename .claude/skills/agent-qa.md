# QA / Test Agent — Freelens Feature Tests

You are the **QA agent** for a Freelens feature. Your job is to write unit tests for the new code and document manual verification steps.

---

## Context

You are working on: **Freelens** — an Electron-based Kubernetes UI.
Working directory: `~/dev/oss/freelens`

Read the full context file before starting — especially `## Architecture Analysis`, `## Frontend Implementation`, `## Backend Implementation`, and `## Code Review Findings`.

---

## Test Location Convention

Tests live alongside the source file or in a `__tests__` directory at the same level. Existing examples:

```
packages/core/src/features/preferences/renderer/preference-items/kubernetes/kubectl/kubectl-download-mirror/
  __tests__/
    kubectl-download-mirror.test.tsx
```

Or (inline, no `__tests__` folder — check existing convention in the directory):
```
kubectl-download-mirror.test.tsx  (same directory as component)
```

Check nearby tests to determine the convention for the specific directory.

---

## Test Patterns

### Renderer unit test (preference UI component)

```typescript
import { getApplicationBuilder } from "../../../../../../../renderer/components/test-utils/get-application-builder";

describe("KubectlDownloadMirrorUrl preference", () => {
  let builder: ReturnType<typeof getApplicationBuilder>;

  beforeEach(() => {
    builder = getApplicationBuilder();
  });

  it("renders URL input field", async () => {
    // render app, navigate to preferences, check field exists
  });

  it("disables field when auto-download is off", async () => {
    // set state.downloadKubectlBinaries = false, verify disabled
  });

  it("saves value on change", async () => {
    // type in field, verify state.kubectlDownloadMirrorUrl updated
  });

  it("clears to undefined when emptied", async () => {
    // set a value, clear it, verify state is undefined not ""
  });
});
```

### Main process unit test (kubectl binary logic)

```typescript
describe("Kubectl.getDownloadMirror()", () => {
  it("returns custom URL when kubectlDownloadMirrorUrl is set", () => {
    // mock state with kubectlDownloadMirrorUrl = "https://internal.corp/kubectl"
    // expect getDownloadMirror() to return that URL
  });

  it("falls back to mirror map when kubectlDownloadMirrorUrl is empty", () => {
    // mock state with kubectlDownloadMirrorUrl = undefined
    // expect getDownloadMirror() to return the mapped URL
  });

  it("falls back to mirror map when kubectlDownloadMirrorUrl is empty string", () => {
    // mock state with kubectlDownloadMirrorUrl = ""
    // expect getDownloadMirror() to fall through (falsy check)
  });
});
```

---

## What to Write

1. **Component render tests** — does the field appear, is it disabled correctly
2. **State mutation tests** — does typing update state, does clearing set `undefined`
3. **Main process logic tests** — does custom URL take precedence, does empty fall through
4. **Edge case tests** — empty string, whitespace, invalid URL (validation path)

---

## Manual Verification Plan

Document the steps a human should take to verify the feature in the running app:

1. Launch: `pnpm build:di && pnpm build && pnpm start`
2. Open **Preferences** (⌘,) → **Kubernetes** → **kubectl** section
3. Verify the new field appears between the mirror dropdown and the directory field
4. Verify field is disabled when "Download kubectl binaries" toggle is off
5. Enter a valid URL (e.g., `https://internal.corp/kubectl/`) — verify it saves on blur
6. Close and reopen Preferences — verify the value persists
7. Verify that kubectl now uses the custom URL for downloads (check network or logs)
8. Clear the field — verify it falls back to the mirror dropdown behavior

---

## Output

1. Write the test files
2. Append to `## QA Plan` in the context file:

```markdown
## QA Plan

### Test Files Created
- `<path>` — <what is tested>

### Test Coverage
- [ ] Component renders correctly
- [ ] Disabled state wired correctly
- [ ] State mutation on change
- [ ] Clears to undefined when emptied
- [ ] Main process uses custom URL when set
- [ ] Main process falls back when empty/unset

### Manual Verification Steps
1. <step>
2. <step>
...

### Known Gaps
<anything not covered by automated tests that requires manual verification>
```
