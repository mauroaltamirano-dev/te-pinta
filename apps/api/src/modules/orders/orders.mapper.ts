import type { Order, OrderItem } from "./orders.types";

export const ordersMapper = {
  toOrderResponse(order: Order) {
    return {
      id: order.id,
      clientId: order.clientId,
      customerNameSnapshot: order.customerNameSnapshot,
      customerPhoneSnapshot: order.customerPhoneSnapshot,
      customerAddressSnapshot: order.customerAddressSnapshot,
      status: order.status,
      channel: order.channel,
      deliveryDate: order.deliveryDate?.toISOString() ?? null,
      deliveryShift: order.deliveryShift,
      paymentMethod: order.paymentMethod,
      isPaid: order.isPaid,
      notes: order.notes,
      subtotalAmount: order.subtotalAmount,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      isActive: order.isActive,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  },

  toOrderItemResponse(item: OrderItem) {
    return {
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      productNameSnapshot: item.productNameSnapshot,
      quantity: item.quantity,
      unitSalePriceSnapshot: item.unitSalePriceSnapshot,
      unitCostSnapshot: item.unitCostSnapshot,
      lineSubtotal: item.lineSubtotal,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  },

  toOrderListResponse(orders: Order[]) {
    return orders.map((order) => this.toOrderResponse(order));
  },

  toOrderItemListResponse(items: OrderItem[]) {
    return items.map((item) => this.toOrderItemResponse(item));
  },

  toOrderDetailResponse(order: Order, items: OrderItem[]) {
    return {
      ...this.toOrderResponse(order),
      items: this.toOrderItemListResponse(items),
    };
  },

  toOperationalSummaryResponse(summary: {
    date: string | null;
    ordersCount: number;
    totalUnits: number;
    totalDozens: number;
    varieties: Array<{
      productId: string;
      productName: string;
      units: number;
      dozens: number;
    }>;
  }) {
  return {
    date: summary.date ?? null,
    ordersCount: summary.ordersCount,
    totalUnits: summary.totalUnits,
    totalDozens: summary.totalDozens,
    varieties: summary.varieties.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      units: item.units,
      dozens: item.dozens,
    })),
  };
},
};