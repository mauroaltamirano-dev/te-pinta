import type { z } from "zod";

import type {
  createOrderSchema,
  orderChannelSchema,
  orderStatusSchema,
  paymentMethodSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
} from "./orders.schema";

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderChannel = z.infer<typeof orderChannelSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export type Order = {
  id: string;
  clientId: string | null;
  customerNameSnapshot: string | null;
  status: OrderStatus;
  channel: OrderChannel;
  deliveryDate: Date | null;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  notes: string | null;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productNameSnapshot: string;
  quantity: number;
  unitSalePriceSnapshot: number;
  unitCostSnapshot: number;
  lineSubtotal: number;
  createdAt: Date;
  updatedAt: Date;
};

export type OrdersSummary = {
  totalRevenue: number;
  deliveredCount: number;
  averageTicket: number;
};

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;