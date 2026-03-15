import { apiClient } from "./client";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "delivered"
  | "cancelled";

export type OrderChannel =
  | "whatsapp"
  | "instagram"
  | "local"
  | "phone"
  | "other";

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

export type Order = {
  id: string;
  clientId: string | null;
  customerNameSnapshot: string | null;
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

export type OrdersSummary = {
  totalRevenue: number;
  deliveredCount: number;
  averageTicket: number;
};


export type OrderDetail = Order & {
  items: OrderItem[];
};

export function getOrders() {
  return apiClient.get<Order[]>("/orders");
}

export function getOrderById(orderId: string) {
  return apiClient.get<OrderDetail>(`/orders/${orderId}`);
}

export function createOrder(data: {
  clientId?: string;
  channel: OrderChannel;
  notes?: string;
  discountAmount?: number;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}) {
  return apiClient.post<OrderDetail>("/orders", data);
}

export function updateOrderStatus(
  orderId: string,
  data: {
    status: OrderStatus;
  },
) {
  return apiClient.patch<Order>(`/orders/${orderId}/status`, data);
}

export function getOrdersSummary() {
  return apiClient.get<OrdersSummary>('/orders-summary');
}