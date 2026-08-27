import { DatabaseSync } from "node:sqlite";

/**
 * SQLite via Node's built-in driver. The schema is written in
 * portable SQL so it can be moved to PostgreSQL (or MS SQL) with
 * only the column-type keywords changed.
 */
const db = new DatabaseSync(":memory:");

db.exec(`
  CREATE TABLE tasks (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    description TEXT   NOT NULL DEFAULT '',
    status     TEXT    NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done')),
    priority   TEXT    NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX idx_tasks_status ON tasks(status);
`);

export interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

export function listTasks(status?: string): Task[] {
  if (status) {
    return db.prepare("SELECT * FROM tasks WHERE status = ? ORDER BY updated_at DESC").all(status) as unknown as Task[];
  }
  return db.prepare("SELECT * FROM tasks ORDER BY updated_at DESC").all() as unknown as Task[];
}

export function getTask(id: number): Task | undefined {
  return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as unknown as Task | undefined;
}

export function createTask(title: string, description: string, priority: string): Task {
  const res = db
    .prepare("INSERT INTO tasks (title, description, priority) VALUES (?, ?, ?)")
    .run(title, description, priority);
  return getTask(Number(res.lastInsertRowid))!;
}

export function updateTask(id: number, fields: Partial<Pick<Task, "title" | "description" | "status" | "priority">>): Task | undefined {
  const existing = getTask(id);
  if (!existing) return undefined;
  const next = { ...existing };
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) (next as Record<string, unknown>)[k] = v;
  }
  db.prepare(
    `UPDATE tasks SET title=?, description=?, status=?, priority=?, updated_at=datetime('now') WHERE id=?`
  ).run(next.title, next.description, next.status, next.priority, id);
  return getTask(id);
}

export function deleteTask(id: number): boolean {
  const res = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return res.changes > 0;
}
