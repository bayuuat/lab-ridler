# Lab Ridler

Monorepo untuk HabitQuest dan AntiSlop.

## Apps

- `apps/habitquest-api`: backend HabitQuest, time engine, streak, proof verification, and external webhook API.
- `apps/habitquest-ios`: SwiftUI iOS app for HabitQuest.
- `apps/antislop`: daily coding practice web app that can notify HabitQuest when the daily challenge is accepted.

## Local Development

Install dependencies per app when needed:

```bash
cd apps/habitquest-api && npm install
cd ../antislop && pnpm install
```

Initialize the HabitQuest local SQLite database:

```bash
cd apps/habitquest-api
cp .env.example .env
npm run prisma:generate
npm run db:init
```

Run both backend services together from the repo root:

```bash
npm run dev:all
```

Default local ports:

- HabitQuest API: `http://127.0.0.1:3001`
- AntiSlop: `http://127.0.0.1:3000`

For a real AntiSlop to HabitQuest webhook call, let the setup script seed HabitQuest and write `apps/antislop/.env.local`:

```bash
npm run dev:api
# in another terminal
npm run setup:webhook
```

The script writes:

```bash
apps/antislop/.env.local
.env.compose
```

After changing `.env.local`, restart AntiSlop or `npm run dev:all` so Next.js reloads the env.

## Docker

For Docker, the webhook habit id must come from the HabitQuest database used by the Docker volume. Start HabitQuest API first, run the setup script against it, then start the full stack:

```bash
cp .env.compose.example .env.compose
docker compose --env-file .env.compose up -d habitquest-api
npm run setup:webhook
docker compose --env-file .env.compose up --build
```

If HabitQuest API is not exposed on the default local port, pass its base URL:

```bash
HABITQUEST_API_URL=http://127.0.0.1:3001 npm run setup:webhook
```

Compose exposes:

- HabitQuest API: `http://localhost:3001`
- AntiSlop: `http://localhost:3000`

The Docker stack keeps HabitQuest SQLite data and proof uploads in named volumes. AntiSlop uses the repo `apps/antislop/data` folder as a bind mount so progress/submissions stay visible locally.

## HabitQuest on Mac

HabitQuest can run on macOS from the same SwiftUI codebase as a Mac Catalyst app:

```bash
npm run mac:build
npm run mac:run
```

The app talks to the same HabitQuest API. Run `npm run dev:api` first if you want the Mac app to load local habits from `http://127.0.0.1:3001`.

The Mac build also embeds `HabitWidgetExtension`, a WidgetKit widget that shows streak, done, and left counts. It refreshes from the local HabitQuest API on `http://127.0.0.1:3001`, so keep `npm run dev:api` running while testing the widget.

For compile checks, the script disables code signing by default. To register and test the widget from the macOS widget gallery, run from Xcode or build/run with signing enabled:

```bash
HABITQUEST_CODE_SIGNING_ALLOWED=YES npm run mac:run
```

## Verification

```bash
npm run test
npm run build
npm run mac:build
pnpm --dir apps/antislop build
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcodebuild \
  -project apps/habitquest-ios/HabitQuest.xcodeproj \
  -scheme HabitQuest \
  -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' \
  build
```
