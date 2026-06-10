# HabitQuest Backend

Milestone 1 backend untuk HabitQuest: habit API, time engine reset pukul 01.00 waktu lokal pengguna, verifikasi manual, dan streak freeze.

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run db:init
npm run dev
```

Server berjalan di `http://localhost:3001`.

`npm run prisma:migrate -- --name init` juga tersedia, tetapi setup ini memakai `npm run db:init` sebagai jalur lokal yang stabil untuk SQLite.

Jika ingin menjalankan SQL manual langsung:

```bash
sqlite3 prisma/dev.db ".read prisma/migrations/20260606081500_init/migration.sql"
```

## API

### Create Habit

```bash
curl -X POST http://localhost:3001/api/v1/habits \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Read 10 pages",
    "description": "Write a short takeaway",
    "verificationType": "TEXT_PROOF",
    "timezone": "Asia/Jakarta"
  }'
```

### Get Today's Habits

```bash
curl http://localhost:3001/api/v1/habits/today
```

### Verify Habit

```bash
curl -X POST http://localhost:3001/api/v1/habits/verify \
  -H "Content-Type: application/json" \
  -d '{
    "habitId": "PASTE_HABIT_ID",
    "proofText": "Finished and summarized the chapter"
  }'
```

Untuk `IMAGE_PROOF`, kirim `proofImageBase64` sebagai raw base64 JPEG/PNG/HEIC atau data URL. Backend menyimpan file ke `uploads/proofs` dan mengisi `proofUrl`.

### Get Streak

```bash
curl http://localhost:3001/api/v1/streak
```

### Seed Demo Habits

```bash
curl -X POST http://localhost:3001/api/v1/dev/seed \
  -H "Content-Type: application/json" \
  -d '{"timezone":"Asia/Jakarta"}'
```

### External Webhook Verify

```bash
curl -X POST http://localhost:3001/api/v1/webhook/external-verify \
  -H "Content-Type: application/json" \
  -d '{
    "habit_id": "PASTE_WEBHOOK_HABIT_ID",
    "secret_key": "dev-daily-coding-secret",
    "status": "COMPLETED"
  }'
```

## Notes

- Habit day dihitung dari waktu lokal user.
- Aktivitas sebelum pukul `01:00` masih masuk ke habit day sebelumnya.
- `GET /api/v1/streak` mengevaluasi hari-hari yang sudah selesai. Jika habit day sebelumnya belum lengkap, sistem memakai `freezeQuota` bila masih tersedia; jika habis, streak direset ke `0`.
- Untuk Milestone 1, API memakai demo user default. Kirim header `x-user-id` kalau ingin memisahkan data antar user saat testing.

## iOS App

Project SwiftUI ada di `../habitquest-ios/HabitQuest.xcodeproj`.

Jalankan backend lebih dulu:

```bash
npm run dev
```

Lalu buka project iOS di Xcode. Base URL default app adalah `http://127.0.0.1:3001`, cocok untuk simulator. Untuk iPhone fisik, ubah field backend di app menjadi IP Mac di Wi-Fi, misalnya `http://192.168.1.10:3001`.

Milestone 2 yang sudah tersedia:

- Dashboard streak, freeze quota, dan daftar habit hari ini.
- Verifikasi `TEXT_PROOF` lewat input teks.
- Verifikasi `IMAGE_PROOF` lewat galeri atau kamera.
- Status lokal `Waiting to sync` saat submit gagal.
