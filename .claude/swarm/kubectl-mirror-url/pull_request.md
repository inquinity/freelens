# Pull Request: Add custom kubectl download mirror URL

**PR Title:** Add custom kubectl download mirror URL preference

**Base branch:** `main` (freelensapp/freelens)
**Head branch:** `inquinity/freelens:custom-mirror-url`

---

Fixes #1823

**Description of changes:**

- Added "Custom URL..." as a third option in the Download Mirror dropdown (Preferences → Kubernetes → kubectl)
- When selected, a URL input field below the dropdown is enabled; switching to Default or China disables it without clearing the saved value
- Only HTTPS URLs are accepted; invalid input shows an inline validation warning
- URL saves on Enter or blur; clearing the field removes the custom URL and restores standard mirror behavior
- Updated `getDownloadMirror()` in `kubectl.ts` to use the custom URL only when "Custom URL..." is the active selection
- Updated existing unit test that expected the custom URL to always take priority (now correctly gated on mirror selection)
- Updated preference snapshots
