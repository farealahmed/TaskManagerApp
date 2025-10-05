import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/auth.controller';

const r = Router();

r.post('/auth/register', asyncHandler(ctrl.register));
r.post('/auth/login', asyncHandler(ctrl.login));
r.post('/auth/forgot', asyncHandler(ctrl.forgot));
r.post('/auth/reset', asyncHandler(ctrl.reset));

export default r;