import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { me, setTheme, upload } from '../controllers/user.controller';

const r = Router();

r.use(requireAuth);

r.get('/user/me', asyncHandler(me));
r.post('/user/theme', upload.single('image'), asyncHandler(setTheme));

export default r;