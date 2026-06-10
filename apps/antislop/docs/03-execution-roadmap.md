# Execution Roadmap

## Current Phase

Phase 4 - MVP implemented, hardening in progress

## Status Update - 2026-05-27

- Next.js app scaffold is runnable locally.
- SQLite is the MVP storage layer.
- Prisma schema and base navigation shell are in place.
- The app now uses pnpm and shadcn-style UI components.
- 30 beginner problems are seeded.
- Monaco editor, sample run flow, submit flow, daily challenge, and streak calendar are implemented.
- Accepted daily challenge submissions can notify HabitQuest through a configurable webhook.
- `pnpm build` passes successfully.
- Remaining hardening work is sandboxing and formal integration tests.

## Milestones

## Milestone 1: Project Bootstrap (Week 1)

### Goals

- Initialize Next.js project
- Add database and queue infrastructure
- Establish baseline folder structure

### Tasks

- [x] Initialize Next.js app (TypeScript)
- [x] Configure ESLint + Prettier
- [x] Add Docker Compose for Postgres + Redis
- [x] Setup Prisma schema and first migration
- [x] Add basic UI layout and navigation shell

## Milestone 2: Problem Engine (Week 2)

### Goals

- Build problem browsing and reading experience

### Tasks

- [x] Seed 30 beginner problems
- [x] Implement `GET /api/problems`
- [x] Implement `GET /api/problems/:slug`
- [x] Build problem list page with filters
- [x] Build problem detail page

## Milestone 3: Run and Submit Pipeline (Week 3)

### Goals

- End-to-end code execution and verdict system

### Tasks

- [x] Integrate Monaco editor for Python
- [x] Build `run` endpoint (sample tests only)
- [x] Build `submit` endpoint with hidden tests
- [x] Build submission result panel UI
- [ ] Implement worker sandbox execution flow

## Milestone 4: Daily Habit System (Week 4)

### Goals

- Add daily challenge and streak experience

### Tasks

- [x] Generate daily challenge by date
- [x] Build daily challenge page
- [x] Implement streak calculation service
- [x] Build calendar heatmap UI
- [x] Add HabitQuest webhook notification for accepted daily submissions
- [ ] Add simple progress summary by topic

## Milestone 5: Hardening (Week 5)

### Goals

- Stabilize and reduce bugs

### Tasks

- [ ] Add integration tests for submit flow
- [x] Add error states and retry UX
- [x] Tune timeout and resource limits
- [x] Improve logs and debugging docs

## Definition of Done (MVP)

All below must be true:

1. Can solve problem from editor and get reliable verdict
2. Daily challenge and streak update correctly
3. Data persists across restarts
4. At least 30 beginner problems are usable
5. Setup and run instructions are documented and repeatable

## Update Rules

- Keep task checklist status current
- Add date-stamped notes at bottom after each session

## Session Notes

### 2026-05-26

- Initial product and technical planning completed.
- Locked major scope decisions (single-user, English UI, Python-only solving, no hints).
- Next step: scaffold codebase and infrastructure from Milestone 1.

### 2026-05-27

- Seeded 30 beginner problems with hidden tests and entry points.
- Added Monaco editor, run/submit flow, and verdict summary.
- Added daily challenge API, streak persistence, and calendar grid.
- `pnpm build` passes after the update.

### 2026-06-06

- Added optional HabitQuest webhook integration for accepted daily challenge submissions.
- Added env keys for HabitQuest URL, daily coding habit id, and secret key.
