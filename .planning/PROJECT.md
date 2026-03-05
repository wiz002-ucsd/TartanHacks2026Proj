# Sunzi UI/UX Revamp — RPG Academic Assistant

## What This Is

A full UI/UX revamp of Sunzi, an AI-powered academic assistant, transforming it from a utilitarian study tool into an RPG-themed learning experience. Students upload syllabi, track mastery, and get AI study plans — but now wrapped in an earthy fantasy RPG aesthetic with light gamification (XP, levels, progress bars). The revamp covers the landing page, inner app UI, color/theme system, and a new gamification visual layer.

## Core Value

The app must look and feel polished — a cohesive earthy RPG theme across every screen that makes studying feel like character progression, not a chore.

## Requirements

### Validated

- Syllabus upload (PDF and text) with AI extraction — existing
- Course list view with deadline tracking — existing
- Course detail view (grading, events, lectures) — existing
- AI advisor dashboard with study recommendations — existing
- Client-side routing with auth-gated pages — existing
- Landing page with scroll animations and sticky sections — existing
- Backend API (Express + Supabase + OpenAI) — existing

### Active

- [ ] New earthy RPG color palette and design token system (parchment, warm golds, forest greens, deep browns)
- [ ] Redesigned landing page: opens academic, reveals RPG layer as user scrolls
- [ ] New typography pairing that blends fantasy/medieval headers with clean body text
- [ ] Redesigned dashboard as "home base" — XP display, level indicator, course progress rings
- [ ] Light gamification visuals: XP bars per course, level badges, progress indicators
- [ ] Mastery visualization per course topic (progress bars or simple tree nodes)
- [ ] Redesigned course list with RPG-flavored cards (quest-style framing)
- [ ] Updated navigation and app layout matching new theme
- [ ] Consistent component styling (replace inline styles with theme-driven approach)
- [ ] Responsive design across all revamped screens

### Out of Scope

- Backend gamification logic (XP calculations, persistence) — frontend visuals only, backend stays as-is
- Real authentication system — keep existing bypass auth
- New backend endpoints — use existing API, mock gamification data on frontend
- Mobile native app — web only
- Multiplayer/social features (leaderboards, friend systems) — single-user experience for now

## Context

- This is a hackathon project (TartanHacks 2026) — polish and visual impact matter most
- Current app uses Tailwind CDN for landing page and inline styles for inner app — inconsistent
- Theme tokens exist in `frontend/src/theme.ts` but aren't used consistently
- Current brand color is `#E67E22` (orange) with Crimson Pro + Inter fonts
- The landing page already has scroll animations, parallax, and sticky sections — these should be preserved/enhanced
- Dashboard currently uses emoji section headers and JS hover states — needs cleanup
- Existing codebase maps available in `.planning/codebase/`

## Constraints

- **Stack**: React + Vite + TypeScript frontend — no framework changes
- **Styling**: Tailwind CSS (already loaded via CDN) — migrate inline styles to Tailwind classes where practical
- **Backend**: No backend changes — all gamification data is mocked/static on frontend
- **Scope**: Visual polish over functional depth — looks polished, XP/levels can be static/mocked
- **Fonts**: Google Fonts only (already loaded via CDN in index.html)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Earthy RPG palette over neon/cyberpunk | Matches academic context, feels warm and inviting rather than aggressive | -- Pending |
| Light gamification over full RPG system | Polish over complexity — XP bars and levels without backend economy | -- Pending |
| Dashboard as hero screen | Most-used screen, sets the RPG tone for daily experience | -- Pending |
| Landing page blends academic + RPG | Don't alienate visitors — open familiar, reveal the hook gradually | -- Pending |
| Frontend-only gamification data | Backend stays untouched — mock XP/levels in component state | -- Pending |

---
*Last updated: 2026-03-04 after initialization*
