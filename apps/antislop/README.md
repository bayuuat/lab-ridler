# AntiSlop

A personal coding practice web app inspired by LeetCode/HackerRank, designed for beginner-friendly DSA learning.

## Current Scope (MVP)

- Single-user web app (no auth yet)
- 30 beginner-friendly problems across arrays, strings, math, and hash-map basics
- Problem list and problem detail page
- In-browser Monaco editor
- One solve language: **Python 3.12**
- Run sample tests and submit against hidden tests
- Daily challenge and streak calendar
- English-only product copy
- SQLite for local MVP storage

## Why Python First?

Python is the best first language for this product goal:

- Cleaner syntax for beginners learning arrays, loops, and hash maps
- Faster iteration when solving algorithmic problems
- Easier to read and debug compared to JS for DSA beginners

## Why There Is Still a Backend

The app still needs server-side logic for:

- Serving problems and saving submissions
- Running and grading code safely
- Tracking streaks and daily challenge state

For MVP, this backend can stay simple inside Next.js route handlers instead of a separate service.

## Documentation Map

- [Project Charter](docs/00-project-charter.md)
- [Product Plan](docs/01-product-plan.md)
- [Technical Blueprint](docs/02-technical-blueprint.md)
- [Execution Roadmap](docs/03-execution-roadmap.md)
- [Session Handoff Protocol](docs/04-session-handoff-protocol.md)

## Continuity Rules (Important)

At the end of each work session, always update:

1. `docs/03-execution-roadmap.md` (task status)
2. `docs/04-session-handoff-protocol.md` (what changed, what is next, blockers)

This ensures a new session or a different AI can continue work immediately with minimal context loss.

## Run Locally

```bash
pnpm install
pnpm dev
```

If you want to verify the production build:

```bash
pnpm build
```

## Stack Notes

- Package manager: pnpm
- UI: shadcn-style components built with Tailwind CSS
- Local database: SQLite
- Judge flow: local Python subprocess for the personal MVP
