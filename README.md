# TaskFlow

A full-stack task management app built to demonstrate a production-style workflow:
**React + TypeScript + Tailwind CSS** frontend, **Express + TypeScript** REST API,
**SQL** storage, and **Swagger UI** interactive API documentation.

> Built as a portfolio project — the API layer mirrors a real-world CRUD + integration
> workflow (the kind used by agency web portals and internal systems).

## Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18, TypeScript, Tailwind CSS 4 (Vite) |
| Backend    | Node.js, Express, TypeScript |
| Database   | SQLite via Node's built-in `node:sqlite` driver, written in portable SQL (PostgreSQL / MS SQL-ready schema) |
| API docs   | OpenAPI 3.0 + Swagger UI at `/api/docs` |

## Features

- Full CRUD for tasks: create, read, update, delete
- Status workflow: `todo → in_progress → done`, with server-side status filtering
- Priority levels (low / medium / high) with validation on both API and UI
- Interactive Swagger documentation for every endpoint
- Typed end-to-end: shared `Task` model, strict TypeScript in frontend and backend
- Vite dev-proxy so the frontend calls `/api/*` with no CORS juggling in development

## Run it

```bash
# terminal 1 — API on :4000
cd server
npm install
npm run dev

# terminal 2 — frontend on :5173 (proxies /api to :4000)
cd web
npm install
npm run dev
```

Then open:
- App: http://localhost:5173
- Swagger UI: http://localhost:4000/api/docs

## API overview

| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| GET    | `/api/tasks`      | List tasks (`?status=` filter) |
| POST   | `/api/tasks`      | Create a task            |
| GET    | `/api/tasks/:id`  | Get one task             |
| PUT    | `/api/tasks/:id`  | Update (partial ok)      |
| DELETE | `/api/tasks/:id`  | Delete a task            |

## Author

**Luka Tkemaladze** — Full-Stack Developer · AI Specialist
[Portfolio](https://lukatkem.github.io) · [GitHub](https://github.com/lukatkem)
