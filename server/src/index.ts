import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { listTasks, getTask, createTask, updateTask, deleteTask } from "./db";
import { openapiSpec } from "./openapi";

const app = express();
app.use(cors());
app.use(express.json());

// ---- Swagger UI (loaded from CDN, spec served locally) ----
app.get("/api/openapi.json", (_req, res) => res.json(openapiSpec));
app.get("/api/docs", (_req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html>
<head>
  <title>TaskFlow API — Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({ url: "/api/openapi.json", dom_id: "#swagger" });
  </script>
</body>
</html>`);
});

// ---- Tasks CRUD ----
const STATUSES = ["todo", "in_progress", "done"];
const PRIORITIES = ["low", "medium", "high"];

app.get("/api/tasks", (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${STATUSES.join(", ")}` });
  }
  res.json(listTasks(status));
});

app.post("/api/tasks", (req: Request, res: Response) => {
  const { title, description = "", priority = "medium" } = req.body ?? {};
  if (typeof title !== "string" || !title.trim() || title.length > 200) {
    return res.status(400).json({ error: "title is required (1-200 chars)" });
  }
  if (!PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `priority must be one of ${PRIORITIES.join(", ")}` });
  }
  res.status(201).json(createTask(title.trim(), description, priority));
});

app.get("/api/tasks/:id", (req: Request, res: Response) => {
  const task = getTask(Number(req.params.id));
  if (!task) return res.status(404).json({ error: "task not found" });
  res.json(task);
});

app.put("/api/tasks/:id", (req: Request, res: Response) => {
  const { title, description, status, priority } = req.body ?? {};
  if (status !== undefined && !STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${STATUSES.join(", ")}` });
  }
  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `priority must be one of ${PRIORITIES.join(", ")}` });
  }
  const task = updateTask(Number(req.params.id), { title, description, status, priority });
  if (!task) return res.status(404).json({ error: "task not found" });
  res.json(task);
});

app.delete("/api/tasks/:id", (req: Request, res: Response) => {
  const ok = deleteTask(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: "task not found" });
  res.json({ deleted: true });
});

// seed data so the UI is never empty
if (listTasks().length === 0) {
  createTask("Set up project repository", "Initialize Git repo with TypeScript + React + Tailwind", "high");
  createTask("Design REST API with Swagger", "Document all CRUD endpoints in OpenAPI 3.0", "high");
  createTask("Build task list UI", "React + Tailwind table with status filters", "medium");
}

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`TaskFlow API running at http://localhost:\${PORT}`);
  console.log(`Swagger docs:      http://localhost:\${PORT}/api/docs`);
});
