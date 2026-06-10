# Technical Blueprint

## Architecture (MVP)

- Frontend: Next.js 15 (App Router)
- API layer: Next.js route handlers
- Database: SQLite for MVP
- Queue: not required for the first MVP pass
- Judge worker: Next.js server-side execution path or later a separate worker
- Solve runtime: Python 3.12 container image

## Why this stack?

- One codebase for UI + API reduces setup complexity
- SQLite removes local setup friction for a single-user MVP
- Docker sandbox is mandatory for safe code execution
- Python-only runtime simplifies judging logic and templates

## High-Level Components

1. Web UI
- Problem list/detail pages
- Code editor page
- Result panel
- Daily streak calendar

2. API
- Problem retrieval
- Submission creation
- Submission status polling
- Daily challenge endpoint
- Streak endpoint

3. Judge Worker
- Pull job from queue
- Build execution payload
- Run code in restricted container
- Compare outputs against expected results
- Persist result summary and per-test outcomes

4. Data Store
- Problems, test cases, submissions, streaks, daily assignments

## Data Model (Initial)

## tables

### `problems`
- id (uuid)
- slug (unique)
- title
- difficulty (`easy|medium`)
- topic (`array|string|hashmap|sorting|two_pointers`)
- statement_md
- constraints_md
- starter_code_py
- is_active
- created_at

### `problem_test_cases`
- id (uuid)
- problem_id (fk)
- input_text
- expected_output_text
- is_sample (boolean)
- order_index

### `submissions`
- id (uuid)
- problem_id (fk)
- source_code
- language (`python`)
- status (`queued|running|finished|failed`)
- verdict (`accepted|wrong_answer|runtime_error|time_limit_exceeded|compile_error`)
- runtime_ms
- created_at
- finished_at

### `submission_case_results`
- id (uuid)
- submission_id (fk)
- test_case_id (fk)
- passed (boolean)
- stdout_text
- stderr_text
- runtime_ms

### `daily_challenges`
- id (uuid)
- challenge_date (date, unique)
- problem_id (fk)

### `streak_daily_status`
- id (uuid)
- active_date (date, unique)
- solved (boolean)

## API Endpoints (Draft)

- `GET /api/problems`
- `GET /api/problems/:slug`
- `POST /api/submissions/run` (samples only)
- `POST /api/submissions/submit` (full judge)
- `GET /api/submissions/:id`
- `GET /api/daily-challenge`
- `GET /api/streak`

## Judge Safety Controls

1. Run untrusted code only in Docker sandbox
2. Disable outbound network
3. CPU and memory limits
4. Hard timeout per test
5. Read-only mounted filesystem where possible
6. Limit stdout/stderr size

## Execution Strategy

For each test case:

1. Inject user solution into runner template
2. Execute python process with timeout
3. Capture stdout/stderr/exit code
4. Normalize output (`trim` + line ending normalization)
5. Compare with expected output

## Local Dev Topology

- Next.js app (`localhost:3000`)
- SQLite file stored in the project
- Optional worker process later if submission handling is moved out of the app

## Observability (MVP)

- Structured logs for API and worker
- Submission lifecycle timestamps
- Failure reason classification for debugging
