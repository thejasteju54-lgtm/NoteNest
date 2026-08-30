# Contributing to NoteNest

Thank you for your interest in contributing to **NoteNest**! NoteNest is an open-source, student-focused academic note organizer designed to help students keep lecture notes, study materials, and PDFs organized.

We welcome contributions from developers of all skill levels. Whether you are fixing a typo in documentation, improving accessibility, adding a new feature, or resolving a bug, your help is appreciated!

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Code Quality & Testing](#code-quality--testing)
- [Questions and Help](#questions-and-help)

---

## 🤝 Code of Conduct

All contributors are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please be kind, respectful, and collaborative.

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher (Recommended: LTS)
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)
- **Git** installed on your machine

### 1. Fork and Clone

1. Fork the repository on GitHub: [https://github.com/thejasteju54-lgtm/NoteNest](https://github.com/thejasteju54-lgtm/NoteNest)
2. Clone your fork locally:

```bash
git clone https://github.com/<your-username>/NoteNest.git
cd NoteNest
```

3. Add the upstream remote:

```bash
git remote add upstream https://github.com/thejasteju54-lgtm/NoteNest.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your Supabase project credentials (you can create a free project at [supabase.com](https://supabase.com)):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 🌿 Branching Strategy

Always create a new branch from `main` for your work:

```bash
# For a new feature
git checkout -b feat/subject-color-customization

# For a bug fix
git checkout -b fix/pdf-viewer-overflow

# For documentation updates
git checkout -b docs/update-readme-setup
```

---

## 📝 Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

- `feat:` A new feature for the user
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
- `chore:` Changes to the build process, auxiliary tools, or libraries

**Examples:**
```text
feat(subjects): add custom color picker palette
fix(viewer): resolve iframe scrolling issue on mobile viewports
docs(setup): add step-by-step local database migration guide
```

---

## 🧪 Code Quality & Testing

Before submitting a Pull Request, please ensure all automated checks pass locally:

```bash
# 1. Run full unit and integration test suite
npm test

# 2. Run TypeScript type-checking
npm run typecheck

# 3. Verify production compilation
npm run build
```

---

## 🚀 Pull Request Guidelines

1. **Keep PRs focused**: One feature or bug fix per Pull Request.
2. **Fill out the PR template**: Clearly describe what was changed, why, and how you tested it.
3. **Attach screenshots/recordings**: For any visual or UI modifications.
4. **Ensure clean history**: Rebase on `upstream/main` if needed.

---

## 💡 Good First Issues

If you're looking for a place to start, look for issues labeled:
- `good first issue` — Beginner-friendly tasks with clear boundaries.
- `help wanted` — Community contributions requested.
- `documentation` — Improvements to guides, comments, or examples.

---

## 💬 Questions and Support

Feel free to open a [GitHub Discussion](https://github.com/thejasteju54-lgtm/NoteNest/discussions) or submit an [Issue](https://github.com/thejasteju54-lgtm/NoteNest/issues) if you have any questions or need guidance!
