# Frontend Development Skill & Best Practices

## 💻 Tech Stack & Architecture
- **Framework**: React / Next.js / Vite + TypeScript
- **Styling**: Vanilla CSS / Tailwind / CSS Modules adhering strictly to [Design.md](file:///c:/Users/Thejas/OneDrive/Desktop/notevault/Design.md) tokens.
- **State Management**: Zustand / React Context / TanStack Query (React Query) for server-state caching.

---

## 🎨 Component Architecture Guidelines

1. **Component Modularity**:
   - Split complex components into atomic building blocks: `Atom` (button, input, badge) -> `Molecule` (search bar, note card) -> `Organism` (sidebar, note editor, folder tree).
   - Co-locate component styles, tests, and sub-components in dedicated folders.

2. **State & Data Fetching**:
   - Separate server state (cached API responses) from local UI state (modals open, active tab).
   - Use optimistic updates for snappy UI interactions (e.g. note title edits, folder creation).
   - Implement loading skeletons, empty states, and error boundaries for all asynchronous views.

3. **Performance Optimization**:
   - Memoize expensive calculations with `useMemo` and stable callbacks with `useCallback`.
   - Use virtual scrolling (e.g. `@tanstack/react-virtual`) for large note trees or infinite lists.
   - Code-split heavy editor tools, syntax highlighters, and modal dialogues via dynamic imports.
