# Deployment

This repo is intended to be cloned onto the always-on laptop server and run with Docker Compose. Cloudflare Tunnel should point public hostnames to the local host ports below.

## Server setup

Install Docker, Docker Compose, Git, and Cloudflare Tunnel on the server laptop. Then clone this repository:

```bash
git clone git@github.com:USERNAME/REPO.git
cd REPO
```

Create the local compose env file:

```bash
cp .env.compose.example .env.compose
```

Edit `.env.compose` for the server:

```env
COMPOSE_PROJECT_NAME=lab-ridler

HABITQUEST_API_PORT=31874
ANTISLOP_PORT=31873

HABITQUEST_PUBLIC_BASE_URL=https://api.your-domain.com
HABITQUEST_DEFAULT_TIMEZONE=Asia/Jakarta
HABITQUEST_DEFAULT_FREEZE_QUOTA=2

HABITQUEST_DAILY_CODING_HABIT_ID=
HABITQUEST_DAILY_CODING_SECRET_KEY=replace-with-a-long-random-secret
```

Start the services:

```bash
docker compose --env-file .env.compose up -d --build
```

Check logs:

```bash
docker compose --env-file .env.compose logs -f
```

## Cloudflare Tunnel

Point the tunnel public hostnames to these local services:

```txt
antislop.your-domain.com -> http://localhost:31873
api.your-domain.com      -> http://localhost:31874
```

If the API only needs to be called from the web container, exposing the API hostname is optional. Expose it when the iOS app or another device needs direct API access.

## Updates

On the server:

```bash
git pull
docker compose --env-file .env.compose up -d --build
```

## Notes

- `.env.compose` and app `.env` files are intentionally ignored.
- HabitQuest data is stored in Docker volumes.
- AntiSlop data is mounted from `apps/antislop/data`.
- AntiSlop executes Python code for judging submissions. Keep it private or protect it with Cloudflare Access unless stronger sandboxing, auth, and rate limits are added.
