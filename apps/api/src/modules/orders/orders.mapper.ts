import type { Order, OrderItem } from './orders.types';

export const ordersMapper = {
  toOrderResponse(order: Order) {
    return {
      id: order.id,
      clientId: order.clientId,
      status: order.status,
      channel: order.channel,
      notes: order.notes,
      subtotalAmount: order.subtotalAmount,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      isActive: order.isActive,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
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
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
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