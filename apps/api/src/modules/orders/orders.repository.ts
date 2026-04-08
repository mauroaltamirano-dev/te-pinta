import { and, desc, eq, gte, inArray, lt } from "drizzle-orm";

import { db } from "../../db/client";
import { orderItemsTable, ordersTable } from "../../db/schema";
import type { Order, OrderItem } from "./orders.types";

type CreateOrderData = Omit<Order, "id" | "createdAt" | "updatedAt">;

type CreateOrderItemData = Omit<
  OrderItem,
  "id" | "orderId" | "createdAt" | "updatedAt"
>;

function mapRowToOrder(row: typeof ordersTable.$inferSelect): Order {
  return {
    id: row.id,
    clientId: row.clientId,
    customerNameSnapshot: row.customerNameSnapshot,
    customerPhoneSnapshot: row.customerPhoneSnapshot,
    customerAddressSnapshot: row.customerAddressSnapshot,
    status: row.status as Order["status"],
    channel: row.channel as Order["channel"],
    deliveryDate: row.deliveryDate,
    paymentMethod: row.paymentMethod as Order["paymentMethod"],
    isPaid: row.isPaid,
    notes: row.notes,
    subtotalAmount: row.subtotalAmount,
    discountAmount: row.discountAmount,
    totalAmount: row.totalAmount,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapRowToOrderItem(
  row: typeof orderItemsTable.$inferSelect,
): OrderItem {
  return {
    id: row.id,
    orderId: row.orderId,
    productId: row.productId,
    productNameSnapshot: row.productNameSnapshot,
    quantity: row.quantity,
    unitSalePriceSnapshot: row.unitSalePriceSnapshot,
    unitCostSnapshot: row.unitCostSnapshot,
    lineSubtotal: row.lineSubtotal,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const ordersRepository = {
  async findAllOrders(): Promise<Order[]> {
    const rows = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    return rows.map(mapRowToOrder);
  },

  async findOrderById(id: string): Promise<Order | null> {
    const [row] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    return row ? mapRowToOrder(row) : null;
  },

  async findItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    const rows = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, orderId));
    return rows.map(mapRowToOrderItem);
  },

  async findOrdersByDeliveryDateAndStatuses(
  start: Date,
  end: Date,
  statuses: Array<Order["status"]>,
): Promise<Order[]> {
  const rows = await db
    .select()
    .from(ordersTable)
    .where(
      and(
        gte(ordersTable.deliveryDate, start),
        lt(ordersTable.deliveryDate, end),
        inArray(ordersTable.status, statuses),
        eq(ordersTable.isActive, true),
      ),
    )
    .orderBy(desc(ordersTable.createdAt));

  return rows.map(mapRowToOrder);
},

async findOrdersByStatuses(
  statuses: Array<Order["status"]>,
): Promise<Order[]> {
  const rows = await db
    .select()
    .from(ordersTable)
    .where(
      and(
        inArray(ordersTable.status, statuses),
        eq(ordersTable.isActive, true),
      ),
    )
    .orderBy(desc(ordersTable.createdAt));

  return rows.map(mapRowToOrder);
},

async findItemsByOrderIds(orderIds: string[]): Promise<OrderItem[]> {
  if (orderIds.length === 0) return [];

  const rows = await db
    .select()
    .from(orderItemsTable)
    .where(inArray(orderItemsTable.orderId, orderIds));

  return rows.map(mapRowToOrderItem);
},

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const [row] = await db
      .insert(ordersTable)
      .values({
        clientId: orderData.clientId,
        customerNameSnapshot: orderData.customerNameSnapshot,
        customerPhoneSnapshot: orderData.customerPhoneSnapshot,
        customerAddressSnapshot: orderData.customerAddressSnapshot,
        status: orderData.status,
        channel: orderData.channel,
        deliveryDate: orderData.deliveryDate,
        paymentMethod: orderData.paymentMethod,
        isPaid: orderData.isPaid,
        notes: orderData.notes,
        subtotalAmount: orderData.subtotalAmount,
        discountAmount: orderData.discountAmount,
        totalAmount: orderData.totalAmount,
        isActive: orderData.isActive,
      })
      .returning();

    return mapRowToOrder(row);
  },

  async createOrderItems(
    orderId: string,
    itemsData: CreateOrderItemData[],
  ): Promise<OrderItem[]> {
    if (itemsData.length === 0) return [];

    const rows = await db
      .insert(orderItemsTable)
      .values(
        itemsData.map((item) => ({
          orderId,
          productId: item.productId,
          productNameSnapshot: item.productNameSnapshot,
          quantity: item.quantity,
          unitSalePriceSnapshot: item.unitSalePriceSnapshot,
          unitCostSnapshot: item.unitCostSnapshot,
          lineSubtotal: item.lineSubtotal,
        })),
      )
      .returning();

    return rows.map(mapRowToOrderItem);
  },

  async replaceOrderItems(
    orderId: string,
    itemsData: CreateOrderItemData[],
  ): Promise<OrderItem[]> {
    await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
    return await this.createOrderItems(orderId, itemsData);
  },

  async updateOrder(
    id: string,
    input: Partial<
      Pick<
        Order,
        | "clientId"
        | "customerNameSnapshot"
        | "customerPhoneSnapshot"
        | "customerAddressSnapshot"
        | "status"
        | "channel"
        | "deliveryDate"
        | "paymentMethod"
        | "isPaid"
        | "notes"
        | "subtotalAmount"
        | "discountAmount"
        | "totalAmount"
        | "isActive"
      >
    >,
  ): Promise<Order | null> {
    const [row] = await db
      .update(ordersTable)
      .set({
        clientId: input.clientId,
        customerNameSnapshot: input.customerNameSnapshot,
        status: input.status,
        channel: input.channel,
        deliveryDate: input.deliveryDate,
        paymentMethod: input.paymentMethod,
        isPaid: input.isPaid,
        notes: input.notes,
        subtotalAmount: input.subtotalAmount,
        discountAmount: input.discountAmount,
        totalAmount: input.totalAmount,
        isActive: input.isActive,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, id))
      .returning();

    return row ? mapRowToOrder(row) : null;
  },

  async deactivateOrder(id: string): Promise<Order | null> {
    const [row] = await db
      .update(ordersTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(ordersTable.id, id))
      .returning();

    return row ? mapRowToOrder(row) : null;
  },

  async reactivateOrder(id: string): Promise<Order | null> {
    const [row] = await db
      .update(ordersTable)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(ordersTable.id, id))
      .returning();

    return row ? mapRowToOrder(row) : null;
  },

  async hardDeleteOrder(id: string): Promise<boolean> {
    await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, id));

    const [row] = await db
      .delete(ordersTable)
      .where(eq(ordersTable.id, id))
      .returning();

    return !!row;
  },
};