import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Task } from '../models/Task';

async function run() {
  try {
    await connectDB();
    const res = await Task.deleteMany({});
    console.log(`Cleared tasks collection. Deleted: ${res.deletedCount}`);
  } catch (err) {
    console.error('Clear failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void run();