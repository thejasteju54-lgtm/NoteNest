# UI/UX Best Practices & Heuristics Skill

## 🎯 User Experience Goals
Deliver an intuitive, distraction-free, and delightful user interface that feels instantaneous and polished.

---

## 🎨 Key UX Patterns

### 1. Progressive Disclosure
- Keep the interface clean by hiding complex secondary tools until requested or hovered.
- Use command palettes (`Cmd+K` / `Ctrl+K`) for fast keyboard-driven navigation.

### 2. Immediate Feedback & Optimistic UI
- Respond to user input immediately: show optimistic updates for note renames, folder creation, and deletions with smooth rollback on network failure.
- Provide clear visual indicators for background autosave status (`Saving...`, `All changes saved`).

### 3. Error States & Recovery
- Never present dead ends. Include clear recovery actions (e.g. "Retry", "Export backup", "Go to Dashboard").
- Use non-intrusive toast notifications for success/info messages, and modal alerts only for destructive actions.

### 4. Accessibility (a11y)
- Ensure all interactive elements have accessible labels (`aria-label`, `role`).
- Maintain WCAG AA color contrast ratios across both light and dark themes.
- Support complete keyboard navigation: focus traps in modals, arrow keys in tree navigation.
