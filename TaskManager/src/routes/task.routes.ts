import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/task.controller';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema, idSchema, listQuerySchema } from './task.schemas';
import { requireAuth } from '../middleware/auth';

const r = Router();

r.use(requireAuth);

r.get('/tasks', validate(listQuerySchema), asyncHandler(ctrl.list));
r.get('/tasks/:id', validate(idSchema), asyncHandler(ctrl.get));
r.post('/tasks', validate(createTaskSchema), asyncHandler(ctrl.create));
r.patch('/tasks/:id', validate(updateTaskSchema), asyncHandler(ctrl.patch));
r.delete('/tasks/:id', validate(idSchema), asyncHandler(ctrl.remove));

export default r;