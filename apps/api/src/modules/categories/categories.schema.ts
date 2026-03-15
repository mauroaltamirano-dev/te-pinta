import { z } from 'zod';

export const categoryIdParamsSchema = z.object({
  id: z.uuid('Category id must be a valid UUID'),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required'),
  description: z.string().trim().optional(),
});

export const updateCategorySchema = createCategorySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided',
  },
);