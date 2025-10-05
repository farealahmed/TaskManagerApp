import { RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';

export const validate = (schema: ZodTypeAny): RequestHandler => (req, res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) {
    return res.status(400).json({ error: 'ValidationError', details: result.error.issues });
  }
  const parsed: any = result.data;
  if (parsed?.body) req.body = parsed.body;
  if (parsed?.params) Object.assign(req.params as any, parsed.params);
  if (parsed?.query) Object.assign(req.query as any, parsed.query);
  next();
};