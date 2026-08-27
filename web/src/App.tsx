import { useEffect, useState, useCallback } from "react";
import type { Status, Task } from "./types";
import { STATUSES } from "./types";

const API = "/api/tasks";

const statusStyles: Record<Status, string> = {
  todo: "bg-slate-100 text-slate-700 border-slate-300",
  in_progress: "bg-blue-50 text-blue-700 border-blue-300",
  done: "bg-emerald-50 text-emerald-700 border-emerald-300",
};

const priorityStyles: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-slate-400",
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (status: Status | "all") => {
    setLoading(true);
    setError(null);
    try {
      const url = status === "all" ? API : `${API}?status=${status}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      setTasks(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), description }),
    });
    if (res.ok) {
      setTitle("");
      setDescription("");
      load(filter);
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not create task");
    }
  }

  async function setStatus(task: Task, status: Status) {
    await fetch(`${API}/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load(filter);
  }

  async function removeTask(id: number) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    load(filter);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Task<span className="text-blue-600">Flow</span>
            </h1>
            <p className="text-sm text-slate-500">React + TypeScript + Tailwind · REST API documented with Swagger</p>
          </div>
          <a
            href="http://localhost:4000/api/docs"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50"
          >
            API Docs ↗
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={addTask} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New task title…"
              maxLength={200}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Add task
            </button>
          </div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex gap-2 mb-4">
          {(["all", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${
                filter === s
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-slate-500 text-sm py-8 text-center">Loading…</div>
        ) : tasks.length === 0 ? (
          <div className="text-slate-400 text-sm py-8 text-center">No tasks yet — add one above.</div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start gap-3"
              >
                <span className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${priorityStyles[task.priority]}`} />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${task.status === "done" ? "line-through text-slate-400" : ""}`}>
                    {task.title}
                  </p>
                  {task.description && <p className="text-sm text-slate-500 mt-0.5">{task.description}</p>}
                  <span
                    className={`inline-block mt-2 rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[task.status]}`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  <select
                    value={task.status}
                    onChange={(e) => setStatus(task, e.target.value as Status)}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
