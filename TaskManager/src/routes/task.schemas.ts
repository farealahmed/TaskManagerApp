import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    dueDate: z.string().datetime().optional(),
    completed: z.boolean().default(false),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.string().datetime().optional(),
    completed: z.boolean().optional(),
  }),
});

export const idSchema = z.object({ params: z.object({ id: z.string().min(1) }) });

export const listQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    completed: z.coerce.boolean().optional(),
    dueBefore: z.string().datetime().optional(),
    dueAfter: z.string().datetime().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sort: z.enum(['createdAt', 'dueDate', 'priority']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
});