# Product Requirements Document (PRD)

## 📌 Product Name
**NoteNest**
**Tagline**: *"Your notes. Organized."*

---

## 🎯 Executive Summary
NoteNest is a polished, local-first MVP with a production-ready frontend architecture designed for future backend, authentication, and cloud storage integration. It solves the academic clutter problem where college students receive important lecture PDFs, assignments, and study materials in WhatsApp groups, only for them to get lost in chat histories.

---

## 👥 Target Personas
1. **Undergraduate & Graduate Students**: Need simple, immediate subject folders (Mathematics, Physics, Programming) to drop and retrieve PDFs without scrolling through hundreds of WhatsApp messages.
2. **Class Representatives & Study Groups**: Need a structured way to categorize shared unit notes and lab manuals.

---

## 🚀 Core MVP Scope (The Critical User Workflow)

```
Upload PDF ──► Choose Subject ──► Store PDF ──► Find Instantly
```

### 1. Subject Folders
- Create, rename, and delete subjects with clean folder cards.
- Custom calm color accents (*Sage Green, Slate Blue, Soft Lavender, Warm Sand, Muted Terracotta, Cool Mint*).
- Dynamic count of notes and total file size per subject.

### 2. PDF Note Management
- Layered PDF validation (extension `.pdf`, MIME `application/pdf`, `%PDF-` signature bytes, centralized 50MB limit).
- Upload notes with drag-and-drop or file picker.
- Rename, delete, and download notes.
- Integrated in-browser PDF Viewer modal.

### 3. Fast Normalized Search
- Instant case-insensitive substring search across subject names and note titles.

### 4. Local Persistence & Demo Profiles
- Browser IndexedDB persistence across sessions and reloads.
- Local Demo Authentication with preset student profiles (*Thejas - CS Student*, *Alex - EE Student*).
- JSON backup export and restore in Settings.

---

## 🔮 Future Architecture (Post-MVP Roadmap)
- Real OAuth / OpenID Connect / JWT backend authentication.
- Server-side database & cloud S3 object storage.
- Cross-device automated sync.
- AI-assisted PDF summarization and full-text search inside PDF bodies.
