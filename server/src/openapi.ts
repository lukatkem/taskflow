/** OpenAPI 3.0 specification served through Swagger UI at /api/docs */
export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "TaskFlow API",
    version: "1.0.0",
    description:
      "Task management REST API — full CRUD with filtering. Built with Express + TypeScript; interactive docs generated with Swagger UI.",
  },
  tags: [{ name: "Tasks", description: "CRUD operations for tasks" }],
  paths: {
    "/api/tasks": {
      get: {
        summary: "List tasks",
        tags: ["Tasks"],
        parameters: [
          {
            name: "status",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["todo", "in_progress", "done"] },
            description: "Filter tasks by status",
          },
        ],
        responses: {
          "200": {
            description: "Array of tasks",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Task" } },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a task",
        tags: ["Tasks"],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/TaskInput" } },
          },
        },
        responses: {
          "201": {
            description: "Created task",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Task" } },
            },
          },
          "400": { description: "Validation error" },
        },
      },
    },
    "/api/tasks/{id}": {
      get: {
        summary: "Get a task by id",
        tags: ["Tasks"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": {
            description: "The task",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Task" } } },
          },
          "404": { description: "Task not found" },
        },
      },
      put: {
        summary: "Update a task",
        tags: ["Tasks"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/TaskUpdate" } },
          },
        },
        responses: {
          "200": {
            description: "Updated task",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Task" } } },
          },
          "404": { description: "Task not found" },
        },
      },
      delete: {
        summary: "Delete a task",
        tags: ["Tasks"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Deleted" },
          "404": { description: "Task not found" },
        },
      },
    },
  },
  components: {
    schemas: {
      Task: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "Design checkout flow" },
          description: { type: "string", example: "Mobile-first checkout wireframes" },
          status: { type: "string", enum: ["todo", "in_progress", "done"] },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          created_at: { type: "string", example: "2026-08-28 10:00:00" },
          updated_at: { type: "string", example: "2026-08-28 10:00:00" },
        },
      },
      TaskInput: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200 },
          description: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high"], default: "medium" },
        },
      },
      TaskUpdate: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200 },
          description: { type: "string" },
          status: { type: "string", enum: ["todo", "in_progress", "done"] },
          priority: { type: "string", enum: ["low", "medium", "high"] },
        },
      },
    },
  },
};
