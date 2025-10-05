import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Task } from '../models/Task';

async function run() {
  try {
    await connectDB();
    const count = await Task.countDocuments();
    if (count === 0) {
      await Task.insertMany([
        { title: 'Read docs', description: 'Read backend guide', priority: 'low', completed: false },
        { title: 'Plan UI', description: 'Design TaskList and TaskForm', priority: 'medium', completed: false },
        { title: 'Implement API', description: 'Wire routes and controllers', priority: 'high', completed: true },
      ]);
      console.log('Seeded sample tasks.');
    } else {
      console.log(`Tasks already exist (${count}). Skipping seeding.`);
    }
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void run();