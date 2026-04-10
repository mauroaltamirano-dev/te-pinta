import { apiClient } from "./client";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "prepared"
  | "delivered"
  | "cancelled";

export type OrderChannel =
  | "whatsapp"
  | "instagram"
  | "local"
  | "phone"
  | "other";

export type PaymentMethod = "cash" | "transfer";
export type DeliveryShift = "mediodia" | "tarde" | "noche";

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
  customerPhoneSnapshot: string | null;
  customerAddressSnapshot: string | null;
  status: OrderStatus;
  channel: OrderChannel;
  deliveryDate: string | null;
  deliveryShift: DeliveryShift | null;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
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
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  channel: OrderChannel;
  deliveryDate?: string;
  deliveryShift?: DeliveryShift;
  paymentMethod?: PaymentMethod;
  isPaid?: boolean;
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
  return apiClient.get<OrdersSummary>("/orders-summary");
}

export function updateOrder(
  orderId: string,
  data: {
    clientId?: string | null;
    customerName?: string | null;
    customerPhone?: string | null;
    customerAddress?: string | null;
    channel?: OrderChannel;
    deliveryDate?: string | null;
    deliveryShift?: DeliveryShift | null;
    paymentMethod?: PaymentMethod;
    isPaid?: boolean;
    notes?: string;
    discountAmount?: number;
    items?: Array<{
      productId: string;
      quantity: number;
    }>;
  },
) {
  return apiClient.patch<OrderDetail>(`/orders/${orderId}`, data);
}

export function deactivateOrder(orderId: string) {
  return apiClient.delete<Order>(`/orders/${orderId}`);
}

export function reactivateOrder(orderId: string) {
  return apiClient.patch<Order>(`/orders/${orderId}/reactivate`, {});
}

export function hardDeleteOrder(orderId: string) {
  return apiClient.delete<void>(`/orders/${orderId}/hard-delete`);
}

export type OperationalOrderVariety = {
  productId: string;
  productName: string;
  units: number;
  dozens: number;
};

export type OperationalOrdersSummary = {
  date: string;
  ordersCount: number;
  totalUnits: number;
  totalDozens: number;
  varieties: OperationalOrderVariety[];
};

export function getOperationalOrdersSummary(date?: string) {
  const query = date ? `?date=${date}` : "";
  return apiClient.get<OperationalOrdersSummary>(
    `/orders-operational-summary${query}`,
  );
}