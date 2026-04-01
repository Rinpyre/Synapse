# Project Guidelines

## Architecture

- The workspace has three primary areas:
  - `backend/`: Laravel 12 API (Sanctum enabled)
  - `frontend/`: React 19 + Vite SPA
  - `database/` + `docker-compose.yml`: SQL Server container and initialization scripts
- Keep backend, frontend, and database concerns separated.
- Backend API entrypoint is `backend/routes/api.php`.
- Frontend routing entrypoint is `frontend/src/App.jsx`.

## Build and Test

- Database:
  - `docker compose up -d` (from workspace root)
- Backend:
  - `cd backend`
  - `composer run setup`
  - `composer run dev`
  - `composer run test`
- Frontend:
  - `cd frontend`
  - `npm run dev`
  - `npm run build`
  - `npm run lint`
- Formatting:
  - `npm run format` (workspace root)
  - `npm run format:check` (workspace root)

## Conventions

- For commit messages, follow `.github/instructions/commit-instructions.md`.
- For pull requests, follow `.github/instructions/pr-instructions.md`.
- For issue/task creation, follow `.github/instructions/issue-instructions.md`.
- Track work in GitHub Issues and the GitHub Projects board.
- Follow repo formatting from `.prettierrc.yaml`:
  - `singleQuote: true`
  - `semi: false`
  - default `tabWidth: 4`, with file-type overrides
- Frontend import aliases are defined in `frontend/vite.config.js` (`@`, `@components`, `@routes`, `@assets`, `@utils`). Prefer aliases over deep relative imports when available.

## Documentation

- Keep official/project deliverable documentation primarily in `.tex` files (with generated `.pdf` for human consumption).
- Keep internal team and AI-facing operational docs in `.md` files.
- Before adding new docs, check existing material in `docs/` and link to related content instead of duplicating it.

## Environment Gotchas

- Backend defaults to SQL Server (`DB_CONNECTION=sqlsrv`) in `backend/.env.example`.
- SQL Server config expects certificate trust in local development (`DB_TRUST_SERVER_CERTIFICATE=true`).
- Sanctum stateful domains include `localhost:3000` in `backend/config/sanctum.php`.

## Dataset Safety (Critical)

- NEVER read, write, or alter dataset SQL files under `database/DATASET1/` or `database/DATASET2/`.
- These dataset files are human-managed only.
- If dataset knowledge is required, use Memory Graph MCP or `MEMORY.md`.
- If information is unavailable, respond with "I don't know" or "I have no information on that topic" rather than inspecting dataset files.
- You may ask the user for dataset details when needed.
