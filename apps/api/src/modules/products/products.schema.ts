import { z } from 'zod';

export const productIdParamsSchema = z.object({
  id: z.uuid('Product id must be a valid UUID'),
});

export const productKindSchema = z.enum([
  'prepared',
  'resale',
  'combo',
]);

const productBaseSchema = z.object({
  categoryId: z.uuid('Category id must be a valid UUID'),
  name: z.string().trim().min(1, 'Product name is required'),
  description: z.string().trim().optional(),
  kind: productKindSchema,
  unitPrice: z.number().positive('Unit price must be greater than 0'),
  halfDozenPrice: z
    .number()
    .positive('Half dozen price must be greater than 0')
    .optional(),
  dozenPrice: z
    .number()
    .positive('Dozen price must be greater than 0')
    .optional(),
  directCost: z
    .number()
    .min(0, 'Direct cost must be greater or equal to 0')
    .optional(),
  isActive: z.boolean().optional(),
});

export const createProductSchema = productBaseSchema.superRefine((data, ctx) => {
  if (
    (data.kind === 'resale' || data.kind === 'combo') &&
    data.directCost === undefined
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['directCost'],
      message: 'Direct cost is required for resale and combo products',
    });
  }
});

export const updateProductSchema = productBaseSchema
  .partial()
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: [],
        message: 'At least one field must be provided',
      });
    }

    if (
      (data.kind === 'resale' || data.kind === 'combo') &&
      data.directCost === undefined
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['directCost'],
        message: 'Direct cost is required for resale and combo products',
      });
    }
  });