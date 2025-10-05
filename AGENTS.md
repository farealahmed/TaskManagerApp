# AGENTS.md - Task Manager Web

## Build/Lint/Test Commands
- `npm run dev` - Start development server (port 5173)
- `npm run build` - Build for production (TypeScript + Vite)
- `npm run preview` - Preview production build
- No test framework currently configured

## Code Style Guidelines
- **Language**: TypeScript with strict mode enabled
- **Imports**: Use ES modules, prefer relative imports (`./src/`)
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Types**: Define interfaces in `src/types/`, use strict typing
- **Error Handling**: Try/catch for async operations, display user-friendly errors
- **Components**: Functional components with hooks, keep presentational logic separate
- **Services**: API calls in `src/services/`, use Axios instance from `src/api/axios.ts`
- **Environment**: Use `import.meta.env.VITE_API_URL` for API endpoints
- **Styling**: CSS variables in `src/styles/globals.css`, dark theme by default