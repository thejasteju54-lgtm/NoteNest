# Accessibility (a11y) Rules & Guidelines

## ♿ Core Accessibility Standards
NoteNest must be accessible to all students, including those relying on screen readers, keyboard-only navigation, and high-contrast modes.

---

## 📋 Accessibility Checklist

### 1. Keyboard Navigation
- All interactive controls (buttons, links, search inputs, modal triggers, dropdown items) must be keyboard-focusable (`Tab` / `Shift+Tab`).
- Modals must implement focus traps and close upon pressing the `Escape` key.
- Quick actions and search should be triggered via accessible keyboard shortcuts (`/` or `Ctrl+K` / `Cmd+K` when enabled, `Enter` to open, `Escape` to dismiss).

### 2. Visible Focus Indicators
- Never remove CSS outline without providing a distinct focus ring: `focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2`.

### 3. Semantic HTML & ARIA Attributes
- Use native semantic elements: `<main>`, `<nav>`, `<header>`, `<section>`, `<article>`, `<button>`, `<input>`.
- Icon-only buttons must provide an explicit `aria-label` (e.g. `aria-label="Delete subject"`).
- Dynamic status messages (e.g. upload progress, toasts) should have `role="status"` or `aria-live="polite"`.

### 4. Color Contrast & Text Legibility
- Maintain minimum WCAG 2.1 AA contrast ratio (>= 4.5:1 for normal text, >= 3:1 for large headings).
- Never rely on color alone to convey meaning (e.g. include both a color badge and an explicit text label or icon).
