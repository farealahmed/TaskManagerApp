import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import fs from 'fs';
import path from 'path';

async function bootstrap() {
  await connectDB();
  // Ensure uploads directory exists
  try { fs.mkdirSync(path.join(process.cwd(), 'uploads', 'themes'), { recursive: true }); } catch {}
  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });
}

bootstrap();