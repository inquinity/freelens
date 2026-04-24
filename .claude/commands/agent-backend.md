# Backend Agent — Freelens Main Process / Storage Implementation

You are the **backend agent** for a Freelens feature. Your job is to wire the preference descriptor, storage, and any main-process logic (e.g., kubectl binary download URL selection).

---

## Context

You are working on: **Freelens** — an Electron-based Kubernetes UI.
Working directory: `~/dev/oss/freelens`

Read the `## Architecture Analysis` section of the context file before writing any code — it tells you exactly which files to modify and what logic to add.

---

## Step 1 — Add Descriptor

File: `packages/core/src/features/user-preferences/common/preference-descriptors.injectable.ts`

Find the block of existing descriptors and add the new one in alphabetical order or near the most logically related field. Pattern:

```typescript
myNewPref: getPreferenceDescriptor<string | undefined>({
  fromStore: (val) => val,
  toStore: (val) => val || undefined,
}),
```

- `fromStore`: converts the stored value (possibly `undefined`) to the in-memory type
- `toStore`: converts the in-memory value to the stored value; return `undefined` to omit from file

`UserPreferencesState` and `UserPreferencesModel` are **auto-typed** from this — no additional changes to those files.

---

## Step 2 — Wire Storage

File: `packages/core/src/features/user-preferences/common/storage.injectable.ts`

Add in **two** places:

**In `fromStore` action** (keep alphabetical order with existing lines):
```typescript
state.myNewPref = descriptors.myNewPref.fromStore(preferences.myNewPref);
```

**In `toJSON` return object** (keep alphabetical order):
```typescript
myNewPref: descriptors.myNewPref.toStore(state.myNewPref),
```

---

## Step 3 — Main Process Logic (if applicable)

For the kubectl custom URL feature, update `packages/core/src/main/kubectl/kubectl.ts`:

Find `getDownloadMirror()` at line ~383:

```typescript
// BEFORE:
protected getDownloadMirror(): string {
  const { url } =
    packageMirrors.get(this.dependencies.state.downloadMirror) ?? packageMirrors.get(defaultPackageMirror)!;
  return url;
}

// AFTER:
protected getDownloadMirror(): string {
  if (this.dependencies.state.kubectlDownloadMirrorUrl) {
    return this.dependencies.state.kubectlDownloadMirrorUrl;
  }
  const { url } =
    packageMirrors.get(this.dependencies.state.downloadMirror) ?? packageMirrors.get(defaultPackageMirror)!;
  return url;
}
```

The custom URL takes precedence over the mirror selection, but only when set (non-empty).

---

## What NOT to Do

- Do NOT modify `state.injectable.ts` — state is auto-typed from descriptors
- Do NOT modify `preferences-helpers.ts` unless adding a new mirror to `packageMirrors`
- Do NOT create `register-injectables.ts` files — auto-generated
- Do NOT add migration files unless the field needs to rename or transform old stored data (it doesn't for an optional new field — `undefined` is the correct default)

---

## Output

1. Modify the descriptor file
2. Modify the storage file  
3. Modify `kubectl.ts` if applicable
4. Append to `## Backend Implementation` in the context file:

```markdown
## Backend Implementation

### Files Modified
- `<path>` — <what changed>
- `<path>` — <what changed>

### Notes
<any deviations from the architecture plan, edge cases encountered, decisions made>
```
