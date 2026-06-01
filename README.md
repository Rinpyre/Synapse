# Synapse

Monorepo with three app services plus a SQL Server database:

- backend: Laravel 12 API (Sanctum)
- frontend: React 19 + Vite SPA
- ai: Node/Express AI service
- db: SQL Server 2019 (Docker only)

## Prerequisites

- Node.js 20+
- PHP 8.2+ with SQL Server drivers (pdo_sqlsrv) for local backend
- Composer
- Docker Desktop (required for SQL Server; also used for full stack Docker)

## Environment setup (must-have files)

Quick rule of thumb:

- Local dev: backend, frontend, and ai each require a .env, and the db still uses the root .env because SQL Server always runs in Docker.
- Docker: backend, frontend, and ai each require a .env.docker, and the db still uses the root .env (there is no db .env.docker).

When running Docker, the backend/frontend/ai containers read their .env.docker files via docker-compose; they do not read the local .env files.

If a value is blank in a .env.docker file, keep it blank so the container can fall back to its internal defaults (this matters most for the frontend).

### Database (SQL Server, Docker only)

File: .env (required for both local and Docker because the db always runs in Docker)

```
ACCEPT_EULA=Y
MSSQL_SA_PASSWORD=PASTE_A_STRONG_PASSWORD
MSSQL_PID=Developer
MSSQL_PORT=1433
```

If you change MSSQL*PORT or MSSQL_SA_PASSWORD, update the backend DB*\* values to match.

Command:

- `docker compose up -d sqlserver`

### Backend (Laravel)

#### Local (.env)

Copy backend/.env.example to backend/.env, then set these values (APP_KEY can be blank at first; `composer run setup` will fill it):

```
APP_NAME=Synapse
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
# APP_MAINTENANCE_STORE=database

# PHP_CLI_SERVER_WORKERS=4

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=sqlsrv
DB_HOST=localhost
DB_PORT=1433
DB_DATABASE=DATASET1
DB_USERNAME=sa
DB_PASSWORD=PASTE_MSSQL_SA_PASSWORD
DB_TRUST_SERVER_CERTIFICATE=true

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
# CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false
```

Make sure these values are exactly as shown:

- APP_ENV=local
- APP_DEBUG=true
- DB_HOST=localhost

Commands:

- `composer run setup` (installs deps, generates APP_KEY, runs migrations)
- If you only need a key: `php artisan key:generate`

#### Docker (.env.docker)

Copy backend/.env.example to backend/.env.docker if you do not have it, then set these values:

```
APP_NAME=Synapse
APP_ENV=production
APP_KEY=base64:PASTE_GENERATED_KEY_HERE
APP_DEBUG=false
APP_URL=http://localhost

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
# APP_MAINTENANCE_STORE=database

# PHP_CLI_SERVER_WORKERS=4

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=sqlsrv
DB_HOST=sqlserver
DB_PORT=1433
DB_DATABASE=DATASET1
DB_USERNAME=sa
DB_PASSWORD=PASTE_MSSQL_SA_PASSWORD
DB_TRUST_SERVER_CERTIFICATE=true

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
# CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false
```

Generate a key and paste it into APP_KEY with:

- `php artisan key:generate --show`

Make sure these values are exactly as shown:

- APP_ENV=production
- APP_DEBUG=false
- DB_HOST=sqlserver

### Frontend (Vite)

#### Local (.env)

Copy frontend/.env.example to frontend/.env, then set:

```
VITE_BACKEND_URL=http://localhost:8000
VITE_AI_SERVICE_URL=http://localhost:4000
```

Commands:

- `npm ci`
- `npm run dev` (http://localhost:3000)

#### Docker (.env.docker)

Keep these empty so Nginx uses same-origin /api and /ai:

```
VITE_BACKEND_URL=
VITE_AI_SERVICE_URL=
```

### AI service

#### Local (.env)

Copy ai/.env.example to ai/.env, then set:

```
PROVIDER=ollama
MODEL=qwen3.5:latest
BASE_URL=http://localhost:11434/api
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
PORT=4000
LMSTUDIO_API_KEY=
```

If you switch PROVIDER to lmstudio, set LMSTUDIO_API_KEY and update MODEL/BASE_URL accordingly.

Commands:

- `npm ci`
- `npm run dev` (http://localhost:4000)

#### Docker (.env.docker)

Set these values (replace the key if PROVIDER=lmstudio):

```
PROVIDER=lmstudio
MODEL=qwen/qwen3.5-9b
BASE_URL=http://host.docker.internal:1234/v1
LMSTUDIO_API_KEY=PASTE_LMSTUDIO_API_KEY
BACKEND_URL=http://backend:8000
FRONTEND_URL=http://frontend:80
PORT=4000
```

Notes:

- If you run your model server on the host machine, use `host.docker.internal` (Docker Desktop). Example defaults:
  - LM Studio: http://host.docker.internal:1234/v1
  - Ollama: http://host.docker.internal:11434/api (set PROVIDER=ollama)
- If you use a hosted provider, replace BASE_URL with your own domain URL.
- The AI service loads the first matching .env file in this order: .env.<NODE_ENV>.local, .env.<NODE_ENV>, .env.local, .env.
- Keep only the env file you want the AI service to use when running locally.

## Run locally (recommended for dev)

1. Make sure these files exist: .env, backend/.env, frontend/.env, ai/.env.

2. Start SQL Server (Docker):

- From repo root: `docker compose up -d sqlserver`

3. Backend (Laravel API):

- In backend/: `composer run setup` (includes `php artisan key:generate` and migrations).
- In backend/: `composer run dev` (runs `php artisan serve`, http://localhost:8000).

4. AI service:

- In ai/: `npm ci`
- In ai/: `npm run dev` (http://localhost:4000)

5. Frontend:

- In frontend/: `npm ci`
- In frontend/: `npm run dev` (http://localhost:3000)

You can also use the root scripts once dependencies are installed:

- `npm run backend`
- `npm run ai-service`
- `npm run frontend`

## Run with Docker (full stack)

1. Make sure these files exist: .env, backend/.env.docker, frontend/.env.docker, ai/.env.docker.

2. Build and start:

- From repo root: `docker compose up -d --build`

3. Open the app:

- Frontend: http://localhost:3000
- API and AI are proxied under the same origin: /api and /ai

## Ports

- Frontend dev: 3000
- Backend dev: 8000
- AI dev: 4000
- SQL Server: 1433

## Troubleshooting

- If `composer run setup` fails, wait for the SQL Server container to finish initializing, then retry.
- If the AI service fails to start, verify PROVIDER, MODEL, BASE_URL, and LMSTUDIO_API_KEY values.
