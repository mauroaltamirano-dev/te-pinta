import type { Order, OrderItem } from "./orders.types";

export const ordersMapper = {
  toOrderResponse(order: Order) {
    return {
      id: order.id,
      clientId: order.clientId,
      customerNameSnapshot: order.customerNameSnapshot,
      status: order.status,
      channel: order.channel,
      deliveryDate: order.deliveryDate?.toISOString() ?? null,
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
};