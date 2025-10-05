# TaskManagerWeb — Frontend Guide (React + Axios)

A step-by-step guide to bootstrap, structure, and implement the frontend for the Simple Task Manager. It focuses on a clean React setup with Axios for REST. Optional notes are included for GraphQL with Apollo Client.

---

## Overview

- Tech: `React` (Vite), `Axios`, optional `React Router`, `react-hook-form`, `date-fns`.
- Targets: CRUD tasks, priority, due date, complete/incomplete toggle.
- Backends: RESTful API by default; optional GraphQL.
- Quality: ESLint + Prettier, Vitest + React Testing Library.

---

## Prerequisites

- Node.js `>=18`
- npm (or pnpm/yarn)
- A running backend or mock server

---

## Project Bootstrap

If `TaskManagerWeb` is empty, initialize with Vite React:

```bash
cd TaskManagerWeb
npm create vite@latest . -- --template react
npm install
```

Install core dependencies:

```bash
npm install axios react-router-dom react-hook-form date-fns
```

Install quality and testing tools:

```bash
npm install -D eslint prettier eslint-config-prettier eslint-plugin-react \
  vitest @testing-library/react @testing-library/jest-dom jsdom
```

Optional UI helpers (pick one if needed):

```bash
# Toasts (choose one)
npm install react-hot-toast
# or
npm install sonner
```

Optional GraphQL:

```bash
npm install @apollo/client graphql
```

---

## Environment Variables

Use Vite env variables for API endpoints:

```
# .env.development
VITE_API_URL=http://localhost:4000/api
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

Access in code via `import.meta.env.VITE_API_URL`.

---

## Recommended Structure

```
src/
  api/
    axios.ts          # Axios instance (REST)
  components/
    TaskForm/
    TaskList/
    TaskItem/
    TaskFilters/
    Layout/
  hooks/
    useTasks.ts       # Custom hooks around services
  pages/
    Home.tsx
    Tasks.tsx
    TaskDetail.tsx
  routes/
    index.tsx         # React Router setup
  services/
    taskService.ts    # CRUD wrappers over Axios
  styles/
    globals.css
  types/
    task.ts           # Shared Task types
  utils/
    date.ts           # date helpers, formatters
  graphql/            # (optional) Apollo client & operations
    client.ts
    queries.ts
    mutations.ts
  App.tsx
  main.tsx
```

---

## Data Model

Define a single source of truth for Task type:

```ts
// src/types/task.ts
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  _id: string;              // From MongoDB
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;         // ISO string
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

---

## Axios Setup (REST)

Create a configured instance with base URL and simple error handling:

```ts
// src/api/axios.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Centralized error handling hook point
    // You can show a toast here or map server errors
    return Promise.reject(err);
  }
);
```

---

## Services (CRUD)

Wrap API calls in a service layer so components remain clean:

```ts
// src/services/taskService.ts
import { api } from '../api/axios';
import type { Task } from '../types/task';

export async function getTasks(): Promise<Task[]> {
  const { data } = await api.get('/tasks');
  return data;
}

export async function getTask(id: string): Promise<Task> {
  const { data } = await api.get(`/tasks/${id}`);
  return data;
}

export async function createTask(input: Partial<Task>): Promise<Task> {
  const { data } = await api.post('/tasks', input);
  return data;
}

export async function updateTask(id: string, update: Partial<Task>): Promise<Task> {
  const { data } = await api.patch(`/tasks/${id}`, update);
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function toggleComplete(id: string, completed: boolean): Promise<Task> {
  return updateTask(id, { completed });
}
```

---

## Custom Hooks

Encapsulate fetch/update logic with loading and error states:

```ts
// src/hooks/useTasks.ts
import { useEffect, useState, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask, toggleComplete } from '../services/taskService';
import type { Task } from '../types/task';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = async (input: Partial<Task>) => {
    const newTask = await createTask(input);
    setTasks((prev) => [newTask, ...prev]);
  };

  const update = async (id: string, patch: Partial<Task>) => {
    const updated = await updateTask(id, patch);
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
  };

  const remove = async (id: string) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  const setCompleted = async (id: string, completed: boolean) => {
    const updated = await toggleComplete(id, completed);
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
  };

  return { tasks, loading, error, refresh, add, update, remove, setCompleted };
}
```

---

## Routing

Set up basic routes for listing and detail views:

```tsx
// src/routes/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Tasks from '../pages/Tasks';
import TaskDetail from '../pages/TaskDetail';
import Home from '../pages/Home';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/tasks', element: <Tasks /> },
  { path: '/tasks/:id', element: <TaskDetail /> },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
```

Use in `App.tsx`:

```tsx
// src/App.tsx
import AppRoutes from './routes';

export default function App() {
  return <AppRoutes />;
}
```

---

## UI Components (Suggested)

- `TaskList`: displays tasks with filters (priority, status, search).
- `TaskItem`: row with title, priority badge, due date, actions.
- `TaskForm`: create/update form (title, description, priority, due date, completed).
- `TaskFilters`: controls for priority, status, search; syncs with query params.
- `Layout`: header, footer, container.
- Loading and error states: skeletons/spinners, retry button.
- Toasts: success/error feedback.

Form validation with `react-hook-form` and `date-fns`:

```tsx
// Example inside TaskForm
import { useForm } from 'react-hook-form';

// schema-less basic rules
const { register, handleSubmit, formState: { errors } } = useForm({
  defaultValues: { title: '', description: '', priority: 'medium', dueDate: '', completed: false },
});
```

---

## Good Practices

- Single source of truth for types in `src/types`.
- Keep components presentational; move all side effects into hooks/services.
- Never hardcode API URLs; use env vars.
- Handle loading, error, and empty states consistently.
- Validate user input; prevent invalid dates and titles.
- Prefer small, composable components over monoliths.
- Memoize derived lists and callbacks where needed.
- Accessibility: semantic HTML, labels for inputs, focus management.
- Testing: write unit tests for hooks/services and components with critical logic.
- Code style: ESLint + Prettier; consistent naming (`PascalCase` components, `camelCase` functions).

---

## Testing Setup

Enable Vitest with React Testing Library. Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\""
  }
}
```

Vitest config (if needed):

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
  },
});
```

Testing setup file:

```ts
// test/setup.ts
import '@testing-library/jest-dom';
```

Example service test:

```ts
// src/services/taskService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { api } from '../api/axios';
import { getTasks } from './taskService';

describe('taskService', () => {
  it('getTasks returns data', async () => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: [{ _id: '1', title: 'T', priority: 'low', completed: false }] });
    const data = await getTasks();
    expect(data.length).toBe(1);
  });
});
```

---

## Linting & Formatting

Initialize ESLint and Prettier:

```bash
npx eslint --init
```

Recommended `.eslintrc` tweaks:

```json
{
  "extends": ["eslint:recommended", "plugin:react/recommended", "prettier"],
  "parserOptions": { "ecmaVersion": 2020, "sourceType": "module" },
  "settings": { "react": { "version": "detect" } },
  "env": { "browser": true, "es2021": true },
  "rules": { "react/react-in-jsx-scope": "off" }
}
```

Prettier config (`.prettierrc`):

```json
{ "singleQuote": true, "semi": true }
```

---

## Optional: GraphQL (Apollo Client)

If you prefer GraphQL for frontend data:

1. Install: `npm install @apollo/client graphql`
2. Client setup:

```ts
// src/graphql/client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const link = createHttpLink({ uri: import.meta.env.VITE_GRAPHQL_URL });

export const gqlClient = new ApolloClient({ link, cache: new InMemoryCache() });
```

3. Provide at app root:

```tsx
// src/main.tsx
import { ApolloProvider } from '@apollo/client';
import { gqlClient } from './graphql/client';

<ApolloProvider client={gqlClient}>
  <App />
</ApolloProvider>
```

4. Example operations:

```ts
// src/graphql/queries.ts
import { gql } from '@apollo/client';
export const GET_TASKS = gql`
  query GetTasks { tasks { _id title priority dueDate completed } }
`;
```

```ts
// src/graphql/mutations.ts
import { gql } from '@apollo/client';
export const CREATE_TASK = gql`
  mutation CreateTask($input: TaskInput!) { createTask(input: $input) { _id title } }
`;
```

5. Usage in components:

```tsx
import { useQuery, useMutation } from '@apollo/client';
import { GET_TASKS } from '../graphql/queries';
import { CREATE_TASK } from '../graphql/mutations';

const { data, loading, error, refetch } = useQuery(GET_TASKS);
const [create] = useMutation(CREATE_TASK);
```

Note: Keep either REST or GraphQL as the primary path to avoid duplication; you can maintain a thin abstraction to switch later if needed.

---

## Run & Build

```bash
# Development
npm run dev

# Type-check, lint, format (if configured)
npm run lint
npm run format

# Tests
npm run test

# Production build and preview
npm run build
npm run preview
```

---

## Implementation Steps (Checklist)

1. Initialize Vite React app in `TaskManagerWeb`.
2. Configure ESLint + Prettier; add scripts for lint/format.
3. Add env files (`.env.development`) with `VITE_API_URL` (and `VITE_GRAPHQL_URL` if needed).
4. Create `src/types/task.ts` with the `Task` model.
5. Create `src/api/axios.ts` for Axios instance (REST).
6. Implement `src/services/taskService.ts` for CRUD.
7. Create hooks (`src/hooks/useTasks.ts`) to manage tasks state.
8. Set up routing (`src/routes/index.tsx`) and basic pages.
9. Build UI components: `TaskList`, `TaskItem`, `TaskForm`, `TaskFilters`.
10. Add loading/error/toast UX.
11. Add form validation (title required, due date not past, etc.).
12. Write unit tests for services/hooks and key components.
13. Connect to running backend; verify CRUD flows end-to-end.
14. Optional: integrate Apollo Client and GraphQL operations.
15. Polish accessibility and performance (keyboard nav, memoization, list virtualization if needed).

---

## API Contracts (Expected REST)

Ensure backend exposes these endpoints (examples):

- `GET /api/tasks` → `Task[]`
- `GET /api/tasks/:id` → `Task`
- `POST /api/tasks` → body: `{ title, description?, priority, dueDate?, completed? }`
- `PATCH /api/tasks/:id` → partial body supports updates
- `DELETE /api/tasks/:id` → 204

Return ISO dates and Mongo `_id` consistently.

---

## Troubleshooting

- 404/Network errors: verify `VITE_API_URL` and backend CORS.
- Mixed REST/GraphQL: decide one primary flow to avoid duplicate logic.
- Dates display wrong: ensure timezone-safe formatting with `date-fns`.
- Performance: paginate or virtualize lists when tasks grow large.
