# Product Rules & Scope Guardrails

## 🎯 Product Principles
1. **User Centricity**: Features must serve the core workflow: effortless capture, rapid organization, and secure retrieval.
2. **Minimal Friction**: Note creation and auto-saving must be instantaneous with zero blocking operations on the main thread.
3. **Data Ownership**: Users must always have the ability to export their full data without proprietary lock-in.

---

## 🚫 Out of Scope Guardrails
- Do NOT build bloatware features (e.g. complex CRM functions, full spreadsheet engines) into the core note editor.
- Do NOT introduce synchronous blocking external network calls during editor typing loops.
- Do NOT store plain-text user passwords, unhashed tokens, or unencrypted sensitive metadata.

---

## 📋 Feature Acceptance Checklist
- [ ] User story clearly matches an approved phase in [Phases.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/Phases.md).
- [ ] UI/UX matches [Design.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/Design.md) tokens and responsiveness.
- [ ] Meets security and auth criteria defined in [`.agents/rules/`](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/.agents/rules).
