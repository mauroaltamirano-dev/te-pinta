import { z } from "zod";

export const orderIdParamsSchema = z.object({
  id: z.uuid("Order id must be a valid UUID"),
});

export const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "prepared",
  "delivered",
  "cancelled",
]);

export const orderChannelSchema = z.enum([
  "whatsapp",
  "instagram",
  "local",
  "phone",
  "other",
]);

export const paymentMethodSchema = z.enum(["cash", "transfer"]);

export const orderItemInputSchema = z.object({
  productId: z.uuid("Product id must be a valid UUID"),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
});

export const createOrderSchema = z.object({
  clientId: z.uuid("Client id must be a valid UUID").optional(),
  customerName: z.string().trim().min(1).max(120).optional(),
  customerPhone: z.string().trim().max(50).optional(),
  customerAddress: z.string().trim().max(255).optional(),
  channel: orderChannelSchema,
  deliveryDate: z.coerce.date().optional(),
  paymentMethod: paymentMethodSchema.optional(),
  isPaid: z.boolean().optional(),
  notes: z.string().trim().optional(),
  discountAmount: z
    .number()
    .min(0, "Discount must be greater or equal to 0")
    .optional(),
  items: z.array(orderItemInputSchema).min(1, "Order must have at least one item"),
});

export const updateOrderSchema = z
  .object({
    clientId: z.uuid("Client id must be a valid UUID").nullable().optional(),
    customerName: z.string().trim().min(1).max(120).nullable().optional(),
    customerPhone: z.string().trim().max(50).nullable().optional(),
    customerAddress: z.string().trim().max(255).nullable().optional(),
    channel: orderChannelSchema.optional(),
    deliveryDate: z.coerce.date().nullable().optional(),
    paymentMethod: paymentMethodSchema.optional(),
    isPaid: z.boolean().optional(),
    notes: z.string().trim().optional(),
    discountAmount: z
      .number()
      .min(0, "Discount must be greater or equal to 0")
      .optional(),
    items: z.array(orderItemInputSchema).min(1, "Order must have at least one item").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});

export const operationalSummaryQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional(),
});