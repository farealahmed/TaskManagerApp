import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import router from './routes';
import path from 'path';
import { errorHandler } from './middleware/error';
import { env } from './config/env';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './docs/openapi';

const app = express();

// Security headers: allow cross-origin resource loading for images from frontend dev origin
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// Allow multiple origins via comma-separated CORS_ORIGIN, or allow all when unset
const origins = env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean) : undefined;
app.use(cors({ origin: origins && origins.length > 0 ? origins : true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Root health and hint
app.get('/', (_req, res) => {
  res.status(200).send('TaskManager API is running. Visit /api/docs for Swagger UI.');
});

// OpenAPI JSON and Swagger UI (public, mounted before /api router)
app.get('/api/openapi.json', (_req, res) => res.json(openApiSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, { explorer: true }));

app.use('/api', router);
app.use(errorHandler);

export default app;