# TaskManager — Backend Guide (Node.js + Express + MongoDB + GraphQL)

A step-by-step guide to design, bootstrap, and implement the backend for the Simple Task Manager. Covers RESTful API with Express + Mongoose and optional GraphQL.

---

## Overview

- Tech: `Node.js` (Express 4), `MongoDB` + `Mongoose`, optional `GraphQL`.
- Features: CRUD tasks; set priority, due date; mark complete/incomplete.
- Quality: ESLint + Prettier, Jest + Supertest, environment config, error handling.

---

## Prerequisites

- Node.js `>=18`
- MongoDB (local container or cloud e.g., Atlas)
- npm (or pnpm/yarn)

---

## Quick Start (Bootstrap)

Initialize a TypeScript Express project:

```bash
cd TaskManager
npm init -y
npm install express mongoose cors helmet morgan dotenv zod express-rate-limit
npm install -D typescript ts-node-dev @types/node @types/express \
  jest ts-jest @types/jest supertest @types/supertest \
  eslint prettier eslint-config-prettier eslint-plugin-import

# TS config
npx tsc --init
```

## OpenAPI/Swagger Documentation

Interactive API documentation is served via Swagger UI.

### What was added
- Installed dependencies: `swagger-ui-express` and `swagger-jsdoc` (and dev types `@types/swagger-ui-express`).
- Added static OpenAPI 3.0 spec: `src/docs/openapi.ts` describing Auth, Tasks, and User endpoints.
- Wired routes in `src/app.ts`:
  - `GET /api/openapi.json` — returns the OpenAPI JSON
  - `GET /api/docs` — Swagger UI interactive documentation

### Step-by-step changes
1. Install dependencies:
   - `npm i swagger-ui-express swagger-jsdoc`
   - `npm i -D @types/swagger-ui-express`
2. Create `src/docs/openapi.ts` with:
   - `info`, `servers`, `tags`
   - `components.securitySchemes.bearerAuth`
   - `components.schemas` for `User`, `Task`, `Error`, `PaginatedTasks` and request models
   - `paths` for `auth`, `tasks`, and `user` endpoints (secured with bearerAuth where needed)
3. Update `src/app.ts` to serve docs:
   - `app.get('/api/openapi.json', ...)`
   - `app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, { explorer: true }))`
4. Rebuild the backend: `npm run build`
5. Start the server: `npm start`
6. Open docs: `http://localhost:4000/api/docs`

### Notes
- Protected endpoints require `Authorization: Bearer <JWT>` in Swagger UI via the “Authorize” button.
- The spec uses the local dev server `http://localhost:4000/api`. Update `servers` for staging/production.
- Future improvement: integrate `zod-to-openapi` to auto-generate components from existing Zod schemas.

Recommended `package.json` scripts:

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpileOnly src/server.ts",
    "start": "node dist/server.js",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.{ts,md}\""
  }
}
```

Jest config:

```bash
npx ts-jest config:init
```

---

## Environment Variables

Create `.env`:

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/taskmanager
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

Load with `dotenv` and validate.

---

## Project Structure

```
src/
  config/
    env.ts            # Env loader & validator (zod)
    db.ts             # Mongoose connection
  models/
    Task.ts           # Mongoose schema & model
  routes/
    task.routes.ts    # REST routes
    index.ts          # Router aggregation
  controllers/
    task.controller.ts
  services/
    task.service.ts
  middleware/
    error.ts          # Global error handler
    validate.ts       # zod validation middleware
  graphql/            # (optional) Apollo Server
    schema.ts
    resolvers.ts
    server.ts
  utils/
    asyncHandler.ts
    apiResponse.ts
  app.ts              # Express app setup
  server.ts           # HTTP server bootstrap
  tests/
    task.e2e.test.ts  # Supertest endpoints
```

---

## Data Model (Mongoose)

```ts
// src/models/Task.ts
import { Schema, model } from 'mongoose';

export type Priority = 'low' | 'medium' | 'high';

export interface TaskDoc {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: Date;
  completed: boolean;
}

const TaskSchema = new Schema<TaskDoc>({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

TaskSchema.index({ priority: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ title: 'text', description: 'text' });

export const Task = model<TaskDoc>('Task', TaskSchema);
```

---

## Configuration & DB Connection

```ts
// src/config/env.ts
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().url().or(z.string().startsWith('mongodb://')),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);
```

```ts
// src/config/db.ts
import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB() {
  await mongoose.connect(env.MONGODB_URI);
}
```

---

## Express App Setup

```ts
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import router from './routes';
import { errorHandler } from './middleware/error';
import { env } from './config/env';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN || true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.use('/api', router);
app.use(errorHandler);

export default app;
```

```ts
// src/server.ts
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function bootstrap() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });
}

bootstrap();
```

---

## Validation Middleware (zod)


```ts
// src/middleware/validate.ts (Express 5-safe)
import { RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';

export const validate = (schema: ZodTypeAny): RequestHandler => (req, res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) {
    return res.status(400).json({ error: 'ValidationError', details: result.error.issues });
  }
  const parsed: any = result.data;
  if (parsed?.body) req.body = parsed.body;
  if (parsed?.params) Object.assign(req.params as any, parsed.params);
  if (parsed?.query) Object.assign(req.query as any, parsed.query);
  next();
};
```

---

## Error Handling

```ts
// src/middleware/error.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || 500;
  res.status(status).json({ error: err.name || 'ServerError', message: err.message || 'Unexpected error' });
}
```

---

## Step-by-Step Backend Setup & Operations

1) Prerequisites
- Install `Node.js >= 18`, `npm`, and `Docker Desktop`.

2) Install dependencies
- Runtime: `npm install express mongoose zod cors helmet morgan express-rate-limit dotenv`
- Dev: `npm install -D typescript ts-node-dev ts-node eslint prettier jest ts-jest @types/node @types/express @types/cors @types/morgan @types/jest @types/supertest eslint-plugin-import eslint-config-prettier supertest`

3) Configure TypeScript
- `tsconfig.json`: `{ target: ES2020, module: CommonJS, rootDir: src, outDir: dist, esModuleInterop: true, strict: true, skipLibCheck: true }`

4) Environment variables
- Copy `.env.example` to `.env`
- Set: `PORT=4000`, `MONGODB_URI=mongodb://localhost:27017/taskmanager`, `NODE_ENV=development`, `CORS_ORIGIN=http://localhost:3000`
- `src/config/env.ts` loads and validates with Zod.

5) Database connector
- `src/config/db.ts` exports `connectDB()` using `mongoose.connect(env.MONGODB_URI)`.

6) Data model
- `src/models/Task.ts` defines `Task` schema, indices, and text index.

7) Express app
- `src/app.ts` sets `helmet`, `cors`, `express.json`, `morgan`, `rateLimit`, mounts `/api` router, and global `errorHandler`.

8) Server bootstrap
- `src/server.ts` runs `await connectDB()` then `app.listen(env.PORT)`.

9) Routing
- `src/routes/index.ts` aggregates routes.
- `src/routes/task.routes.ts` defines `GET/POST/PATCH/DELETE` for `/tasks` with validation and async error handling.

10) Validation schemas
- `src/routes/task.schemas.ts` includes `createTaskSchema`, `updateTaskSchema`, `idSchema`, `listQuerySchema` for filters, pagination, and sorting.

11) Validation middleware (Express 5-safe)
- `src/middleware/validate.ts` uses `safeParse` and merges `params`/`query` with `Object.assign` (avoids read-only setter errors).

12) Error handling
- `src/middleware/error.ts` returns `{ error, message }` with status code.

13) Async handler
- `src/utils/asyncHandler.ts` wraps route handlers and forwards rejections to error middleware.

14) Docker Compose for MongoDB
- `docker-compose.yml` uses `mongo:6`, exposes `27017`, persists data in `mongo_data`.
- Start DB: `docker compose up -d` (run from `TaskManager` directory).

15) NPM scripts
- `dev`: `ts-node-dev src/server.ts`
- `seed`: `ts-node src/scripts/seed.ts`
- `seed:clear`: `ts-node src/scripts/clear.ts`
- `seed:reset`: `npm run seed:clear && npm run seed`

16) Seed & Clear scripts
- `src/scripts/seed.ts` inserts 3 tasks if empty; disconnects afterward.
- `src/scripts/clear.ts` deletes all tasks; disconnects afterward.

17) Postman collection
- Import `TaskManager.postman_collection.json`, set `baseUrl=http://localhost:4000`.

18) Run & verify
- Start server: `npm run dev` → logs `API running on http://localhost:4000`
- List: `curl -s "http://localhost:4000/api/tasks?page=1&limit=20&sort=createdAt&order=desc"`
- Create: `curl -s -X POST -H "Content-Type: application/json" -d '{"title":"New","priority":"low"}' http://localhost:4000/api/tasks`
- Reset data: `npm run seed:reset`

---

## Troubleshooting Notes

- Missing type declarations
  - Errors like "Could not find a declaration file for module 'cors' or 'morgan'" → `npm install -D @types/cors @types/morgan`.

- ts-node-dev argument parsing
  - "no script to run provided" → ensure script path after options or use `ts-node` for one-off scripts (we use `ts-node src/scripts/seed.ts`).

- Express 5 read-only properties
  - Direct assignment to `req.query` or `req.params` throws TypeError. Use `Object.assign` to merge validated values.

- MongoDB connection refused
  - "MongooseServerSelectionError" indicates MongoDB isn’t running. Start with `docker compose up -d` and verify `.env MONGODB_URI`.

---

## Optional Enhancements

- Health check endpoint: `GET /api/health` returns `{ status: 'ok' }`.
- Graceful shutdown: trap `SIGINT/SIGTERM` to `mongoose.disconnect()` and `server.close()`.
- Extend sorting options: allow `completed` or custom weights for `priority`.

```ts
// src/utils/asyncHandler.ts
import { RequestHandler } from 'express';
export const asyncHandler = (fn: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

---

## REST Routes, Controllers, Services

Validation schemas:

```ts
// src/routes/task.schemas.ts
import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    dueDate: z.string().datetime().optional(),
    completed: z.boolean().default(false),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.string().datetime().optional(),
    completed: z.boolean().optional(),
  }),
});

export const idSchema = z.object({ params: z.object({ id: z.string().min(1) }) });

export const listQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    completed: z.coerce.boolean().optional(),
    dueBefore: z.string().datetime().optional(),
    dueAfter: z.string().datetime().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sort: z.enum(['createdAt', 'dueDate', 'priority']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
});
```

Service layer:

```ts
// src/services/task.service.ts
import { Task } from '../models/Task';

export async function createTask(data: any) {
  if (data.dueDate) data.dueDate = new Date(data.dueDate);
  return Task.create(data);
}

export async function listTasks(query: any) {
  const { search, priority, completed, dueBefore, dueAfter, page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = query;

  const filter: any = {};
  if (priority) filter.priority = priority;
  if (typeof completed === 'boolean') filter.completed = completed;
  if (dueBefore || dueAfter) filter.dueDate = {};
  if (dueBefore) filter.dueDate.$lte = new Date(dueBefore);
  if (dueAfter) filter.dueDate.$gte = new Date(dueAfter);
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;
  const sortSpec: any = { [sort]: order === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    Task.find(filter).sort(sortSpec).skip(skip).limit(limit),
    Task.countDocuments(filter),
  ]);

  return { items, page, limit, total };
}

export async function getTask(id: string) { return Task.findById(id); }
export async function updateTask(id: string, patch: any) {
  if (patch.dueDate) patch.dueDate = new Date(patch.dueDate);
  return Task.findByIdAndUpdate(id, patch, { new: true });
}
export async function deleteTask(id: string) { await Task.findByIdAndDelete(id); }
```

Controllers:

```ts
// src/controllers/task.controller.ts
import { Request, Response } from 'express';
import * as svc from '../services/task.service';

export async function create(req: Request, res: Response) {
  const task = await svc.createTask(req.body);
  res.status(201).json(task);
}

export async function list(req: Request, res: Response) {
  const data = await svc.listTasks(req.query);
  res.json(data);
}

export async function get(req: Request, res: Response) {
  const task = await svc.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'NotFound' });
  res.json(task);
}

export async function patch(req: Request, res: Response) {
  const task = await svc.updateTask(req.params.id, req.body);
  if (!task) return res.status(404).json({ error: 'NotFound' });
  res.json(task);
}

export async function remove(req: Request, res: Response) {
  await svc.deleteTask(req.params.id);
  res.status(204).send();
}
```

Routes:

```ts
// src/routes/task.routes.ts
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/task.controller';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema, idSchema, listQuerySchema } from './task.schemas';

const r = Router();

r.get('/tasks', validate(listQuerySchema), asyncHandler(ctrl.list));
r.get('/tasks/:id', validate(idSchema), asyncHandler(ctrl.get));
r.post('/tasks', validate(createTaskSchema), asyncHandler(ctrl.create));
r.patch('/tasks/:id', validate(updateTaskSchema), asyncHandler(ctrl.patch));
r.delete('/tasks/:id', validate(idSchema), asyncHandler(ctrl.remove));

export default r;
```

Router index:

```ts
// src/routes/index.ts
import { Router } from 'express';
import tasks from './task.routes';

const router = Router();
router.use(tasks);
export default router;
```

---

## Optional: GraphQL (Apollo Server)

Install:

```bash
npm install @apollo/server graphql
```

Schema & resolvers:

```ts
// src/graphql/schema.ts
import { gql } from 'graphql-tag';
export const typeDefs = gql`
  scalar Date
  type Task { _id: ID!, title: String!, description: String, priority: String!, dueDate: Date, completed: Boolean!, createdAt: Date, updatedAt: Date }
  input TaskInput { title: String!, description: String, priority: String!, dueDate: Date, completed: Boolean }
  input TaskUpdate { title: String, description: String, priority: String, dueDate: Date, completed: Boolean }
  type TaskList { items: [Task!]!, page: Int!, limit: Int!, total: Int! }
  type Query { tasks(page: Int, limit: Int, search: String, priority: String, completed: Boolean, dueBefore: Date, dueAfter: Date, sort: String, order: String): TaskList!, task(id: ID!): Task }
  type Mutation { createTask(input: TaskInput!): Task!, updateTask(id: ID!, patch: TaskUpdate!): Task!, deleteTask(id: ID!): Boolean! }
`;
```

```ts
// src/graphql/resolvers.ts
import * as svc from '../services/task.service';
export const resolvers = {
  Query: {
    tasks: (_: any, args: any) => svc.listTasks(args),
    task: (_: any, { id }: any) => svc.getTask(id),
  },
  Mutation: {
    createTask: (_: any, { input }: any) => svc.createTask(input),
    updateTask: (_: any, { id, patch }: any) => svc.updateTask(id, patch),
    deleteTask: async (_: any, { id }: any) => { await svc.deleteTask(id); return true; },
  },
};
```

Server integration:

```ts
// src/graphql/server.ts
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import app from '../app';

export async function mountGraphQL() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  app.use('/graphql', expressMiddleware(server));
}
```

Call `mountGraphQL()` in `server.ts` after app creation (optional).

---

## Testing (Jest + Supertest)

Example endpoint test:

```ts
// src/tests/task.e2e.test.ts
import request from 'supertest';
import app from '../app';

describe('Tasks API', () => {
  it('creates a task', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Test', priority: 'low' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test');
  });
});
```

Note: For DB tests, spin up a test database or use in-memory Mongo (e.g., `mongodb-memory-server`).

---

## Linting & Formatting

ESLint config (`.eslintrc.json`):

```json
{
  "env": { "es2021": true, "node": true },
  "extends": ["eslint:recommended", "plugin:import/recommended", "prettier"],
  "parserOptions": { "ecmaVersion": 12, "sourceType": "module" },
  "rules": { "import/order": ["error", { "newlines-between": "always" }] }
}
```

Prettier config (`.prettierrc`):

```json
{ "singleQuote": true, "semi": true }
```

---

## Docker & Mongo Setup (Optional)

`docker-compose.yml` example:

```yaml
version: '3.8'
services:
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
volumes:
  mongo_data:
```

Start: `docker compose up -d`.

---

## API Contracts (REST)

- `GET /api/tasks` → `TaskList` with pagination and filters
- `GET /api/tasks/:id` → `Task`
- `POST /api/tasks` → body: `{ title, description?, priority, dueDate?, completed? }`
- `PATCH /api/tasks/:id` → partial update
- `DELETE /api/tasks/:id` → 204

Responses use ISO dates; ids use Mongo `_id`.

---

## Best Practices

- Separation of concerns: controller (HTTP), service (business), model (data).
- Centralize validation and error handling; avoid logic in routes.
- Use indexes on query-heavy fields (`priority`, `dueDate`); enable text search.
- Consistent status codes and response shapes.
- Avoid over-fetching; implement pagination and filterable queries.
- Secure headers (`helmet`), CORS, and rate limiting.
- Log requests (`morgan`) and errors; avoid sensitive data in logs.
- Keep environment secrets out of code; use `.env` and validation.
- Write tests for critical paths (create, list filters, update, delete).

---

## Implementation Checklist

1. Initialize Node/TypeScript project and install dependencies.
2. Add `.env` and env validation.
3. Implement `Task` Mongoose model and indexes.
4. Configure Express app with security, CORS, JSON parsing, logging.
5. Create service layer for CRUD and list filters + pagination.
6. Implement controllers and route bindings with async handler.
7. Add zod validation for body/params/query.
8. Add global error handler.
9. Write Jest + Supertest tests for endpoints.
10. Optional: integrate Apollo Server for GraphQL.
11. Build and run; verify with Postman or curl.
12. Add Docker Compose for Mongo (optional) and production configs.

---

## Run & Build

```bash
# Development
npm run dev

# Test
npm run test

# Build & Start
npm run build
npm run start
```

---

## Troubleshooting

- Cannot connect to Mongo: check `MONGODB_URI` and Mongo service is running.
- 400 validation errors: verify request payload matches zod schemas.
- CORS blocked: update `CORS_ORIGIN` or configure `cors()` properly.
- GraphQL endpoint not mounted: ensure `mountGraphQL()` is called.


## Seeding and Testing

- Seed sample data: `npm run seed`
- Clear all tasks: `npm run seed:clear`
- Reset (clear then seed): `npm run seed:reset`

After seeding, verify via curl:

- List tasks: `curl -s "http://localhost:4000/api/tasks?page=1&limit=20&sort=createdAt&order=desc"`
- Create a task: `curl -s -X POST -H "Content-Type: application/json" -d '{"title":"Try API","priority":"medium"}' http://localhost:4000/api/tasks`

Postman collection:

- Import `TaskManager/TaskManager.postman_collection.json`
- Set `baseUrl` environment variable to `http://localhost:4000`

Notes:

- Validation uses Zod; query and params are merged to avoid Express 5 read-only property assignment.
- MongoDB runs via Docker Compose; ensure `docker compose up -d` is active and `.env` has `MONGODB_URI`.