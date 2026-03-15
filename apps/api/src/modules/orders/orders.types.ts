import type { z } from 'zod';

import type {
  createOrderSchema,
  orderChannelSchema,
  orderStatusSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
} from './orders.schema';

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderChannel = z.infer<typeof orderChannelSchema>;

export type Order = {
  id: string;
  clientId: string | null;
  status: OrderStatus;
  channel: OrderChannel;
  notes: string | null;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
};

export type OrdersSummary = {
  totalRevenue: number;
  deliveredCount: number;
  averageTicket: number;
};

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;