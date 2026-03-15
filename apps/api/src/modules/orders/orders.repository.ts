import type { Order, OrderItem } from './orders.types';

const orders = new Map<string, Order>();
const orderItems = new Map<string, OrderItem>();

function generateOrderId() {
  return crypto.randomUUID();
}

function generateOrderItemId() {
  return crypto.randomUUID();
}

export const ordersRepository = {
  findAllOrders(): Order[] {
    return Array.from(orders.values());
  },

  findOrderById(id: string): Order | null {
    return orders.get(id) ?? null;
  },

  findItemsByOrderId(orderId: string): OrderItem[] {
    return Array.from(orderItems.values()).filter((item) => item.orderId === orderId);
  },

  createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const now = new Date().toISOString();

    const order: Order = {
      id: generateOrderId(),
      ...orderData,
      createdAt: now,
      updatedAt: now,
    };

    orders.set(order.id, order);

    return order;
  },

  createOrderItems(
    orderId: string,
    itemsData: Array<Omit<OrderItem, 'id' | 'orderId' | 'createdAt' | 'updatedAt'>>,
  ): OrderItem[] {
    const now = new Date().toISOString();

    const createdItems = itemsData.map((itemData) => {
      const item: OrderItem = {
        id: generateOrderItemId(),
        orderId,
        ...itemData,
        createdAt: now,
        updatedAt: now,
      };

      orderItems.set(item.id, item);

      return item;
    });

    return createdItems;
  },

  replaceOrderItems(
    orderId: string,
    itemsData: Array<Omit<OrderItem, 'id' | 'orderId' | 'createdAt' | 'updatedAt'>>,
  ): OrderItem[] {
    for (const item of orderItems.values()) {
      if (item.orderId === orderId) {
        orderItems.delete(item.id);
      }
    }

    return this.createOrderItems(orderId, itemsData);
  },

  updateOrder(
    id: string,
    input: Partial<
      Pick<
        Order,
        | 'clientId'
        | 'status'
        | 'channel'
        | 'notes'
        | 'subtotalAmount'
        | 'discountAmount'
        | 'totalAmount'
        | 'isActive'
      >
    >,
  ): Order | null {
    const existing = orders.get(id);

    if (!existing) {
      return null;
    }

    const updated: Order = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    orders.set(id, updated);

    return updated;
  },

  deactivateOrder(id: string): Order | null {
    const existing = orders.get(id);

    if (!existing) {
      return null;
    }

    const updated: Order = {
      ...existing,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    orders.set(id, updated);

    return updated;
  },
};