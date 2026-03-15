import { z } from 'zod';

export const orderIdParamsSchema = z.object({
  id: z.uuid('Order id must be a valid UUID'),
});

export const orderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'preparing',
  'delivered',
  'cancelled',
]);

export const orderChannelSchema = z.enum([
  'whatsapp',
  'instagram',
  'local',
  'phone',
  'other',
]);

export const orderItemInputSchema = z.object({
  productId: z.uuid('Product id must be a valid UUID'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
});

export const createOrderSchema = z.object({
  clientId: z.uuid('Client id must be a valid UUID').optional(),
  channel: orderChannelSchema,
  notes: z.string().trim().optional(),
  discountAmount: z.number().min(0, 'Discount must be greater or equal to 0').optional(),
  items: z
    .array(orderItemInputSchema)
    .min(1, 'Order must have at least one item'),
});

export const updateOrderSchema = z
  .object({
    clientId: z.uuid('Client id must be a valid UUID').nullable().optional(),
    channel: orderChannelSchema.optional(),
    notes: z.string().trim().optional(),
    discountAmount: z.number().min(0, 'Discount must be greater or equal to 0').optional(),
    items: z.array(orderItemInputSchema).min(1, 'Order must have at least one item').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});