# Git & Version Control Rules

## 🌿 Branching Strategy

- **`main` / `master`**: Production-ready, always deployable code.
- **`develop`**: Integration branch for active features and upcoming releases.
- **`feature/<name>`**: Feature branches branched from `develop`.
- **`bugfix/<name>`** or **`fix/<name>`**: Bug fixes for active development.
- **`hotfix/<name>`**: Emergency fixes branched directly from `main`.

---

## ✍️ Commit Conventions (Conventional Commits)

Use the following standard format for all commit messages:
```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Allowed Types:
- `feat`: A new feature
- `fix`: A bug fix
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `docs`: Documentation only changes
- `chore`: Build process, dependency updates, tooling changes
- `style`: Formatting, missing semi-colons, whitespace changes

---

## 🚫 Git Rules
- Never force push (`--force` or `-f`) to shared branches (`main`, `develop`).
- Keep commits atomic and readable.
- Review diffs before committing to avoid accidental inclusion of debug code or secret credentials.
