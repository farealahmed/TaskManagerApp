import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().url().or(z.string().startsWith('mongodb://')),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string().min(8).default('dev_secret_change_me'),
  JWT_EXPIRES: z.string().default('7d'),
});

export const env = EnvSchema.parse(process.env);