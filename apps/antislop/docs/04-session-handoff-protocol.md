# Session Handoff Protocol

Use this file to transfer context between sessions or between different AI agents.

## Quick Context

- Product: personal coding practice app (LeetCode-style)
- Stage: MVP implemented, hardening in progress
- Solve language: Python only
- App language/UI/docs: English
- Auth: none (single user)
- Storage: SQLite MVP, no Postgres/Redis for the first pass
- Package manager: pnpm
- UI system: shadcn-style components built on Tailwind CSS

## Current Implementation State

- Next.js app scaffold exists
- Prisma schema uses SQLite for the MVP
- App shell with top navigation exists
- Working routes exist for problems, daily, and roadmap
- ESLint and Prettier configs are in place
- Local build succeeds with `pnpm build`
- Run instructions are documented in the README
- shadcn-style `Button`, `Card`, and `Badge` components are in place
- Monaco editor is integrated on the problem detail page
- Sample run and submit endpoints are implemented
- Daily challenge, streak state, and calendar grid persist locally
- 30 beginner problems are seeded
- Accepted daily challenge submissions can call the HabitQuest external verification webhook when env vars are configured

## Always Update This At End Of Session

## 1) What was completed

- Project scaffolded for local development
- ESLint and Prettier configured
- SQLite MVP storage decision documented
- Prisma schema and run config settled
- App shell and route structure added
- Problem engine and editor flow implemented
- Daily streak and calendar flow implemented
- Project builds successfully with Next.js

## 2) What is in progress

- Sandbox hardening for code execution
- Formal integration tests for the submit flow
- Topic progress summary polish
- HabitQuest webhook is implemented and should be configured with a real `WEB_HOOK` habit id

## 3) What should happen next

1. Add a sandboxed worker or container boundary before sharing outside local use.
2. Add a small integration smoke test for the submit path.
3. Expand topic progress summaries on the daily page.
4. Add more beginner problems if you want broader coverage.
5. Configure HabitQuest env values and test the daily coding webhook end-to-end.

## 4) Blockers and decisions needed

- Missing inputs
- Risk notes
- The current judge still runs Python in a local subprocess, which is fine for personal use but not safe for public deployment.
- HabitQuest webhook calls are skipped unless `HABITQUEST_WEBHOOK_URL`, `HABITQUEST_DAILY_CODING_HABIT_ID`, and `HABITQUEST_DAILY_CODING_SECRET_KEY` are configured.

## Session Update - 2026-06-06

### Completed
- Added a HabitQuest webhook client.
- Wired accepted daily challenge submissions to call HabitQuest external verification.
- Surfaced webhook status in the submit verdict panel.

### In Progress
- End-to-end configuration with the actual HabitQuest daily coding habit id.

### Next
1. Run HabitQuest backend on a different port than AntiSlop, for example `3001`.
2. Seed or create the `Daily coding` `WEB_HOOK` habit in HabitQuest.
3. Copy its id into AntiSlop env and submit the AntiSlop daily challenge.

### Blockers
- None in code; runtime env values are still needed for a real webhook call.

## Working Agreements For Any AI

1. Do not expand scope before MVP is stable.
2. Keep English product copy consistent.
3. Preserve single-language solve pipeline until explicitly changed.
4. Keep docs synchronized with real implementation.
5. Update roadmap checklist whenever tasks are finished.

## Suggested End-of-Session Template

Copy and fill this at each session end:

```md
## Session Update - YYYY-MM-DD

### Completed
- ...

### In Progress
- ...

### Next
1. ...
2. ...
3. ...

### Blockers
- ...
```
