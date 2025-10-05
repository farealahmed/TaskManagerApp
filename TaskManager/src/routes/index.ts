import { Router } from 'express';
import tasks from './task.routes';
import auth from './auth.routes';
import user from './user.routes';

const router = Router();
router.use(auth);
router.use(tasks);
router.use(user);

export default router;