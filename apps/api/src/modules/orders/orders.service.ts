import { clientsRepository } from "../clients/clients.repository";
import { productionService } from "../production/production.service";
import { productsRepository } from "../products/products.repository";
import { ordersRepository } from "./orders.repository";
import type {
  CreateOrderInput,
  Order,
  UpdateOrderInput,
  UpdateOrderStatusInput,
} from "./orders.types";

type ServiceError = {
  statusCode: number;
  message: string;
};

function createServiceError(statusCode: number, message: string): ServiceError {
  return { statusCode, message };
}

type BuiltOrderItem = {
  productId: string;
  productNameSnapshot: string;
  quantity: number;
  unitSalePriceSnapshot: number;
  unitCostSnapshot: number;
  lineSubtotal: number;
};

async function resolveUnitCostSnapshot(productId: string) {
  const productResult = await productsRepository.findById(productId);

  if (!productResult) {
    throw createServiceError(400, `Product ${productId} does not exist`);
  }

  const product = productResult.product;

  if (product.kind === "prepared") {
    const costResult = await productionService.getProductCost(productId);
    return costResult.totalUnitCost;
  }

  if (product.kind === "resale" || product.kind === "combo") {
    if (product.directCost === null) {
      throw createServiceError(400, `Product ${product.name} requires direct cost`);
    }

    return product.directCost;
  }

  throw createServiceError(400, `Unsupported product kind "${product.kind}"`);
}

function resolveLineSaleAmount(
  product: {
    name: string;
    unitPrice: number;
    halfDozenPrice: number | null;
    dozenPrice: number | null;
  },
  quantity: number,
) {
  let remaining = quantity;

  let dozens = 0;
  let halfDozens = 0;
  let units = 0;

  if (product.dozenPrice !== null) {
    dozens = Math.floor(remaining / 12);
    remaining = remaining % 12;
  }

  if (product.halfDozenPrice !== null) {
    halfDozens = Math.floor(remaining / 6);
    remaining = remaining % 6;
  }

  units = remaining;

  return (
    dozens * (product.dozenPrice ?? 0) +
    halfDozens * (product.halfDozenPrice ?? 0) +
    units * product.unitPrice
  );
}

async function buildOrderItems(
  items: Array<{ productId: string; quantity: number }>,
): Promise<{
  builtItems: BuiltOrderItem[];
  subtotalAmount: number;
}> {
  const builtItems: BuiltOrderItem[] = [];

  for (const item of items) {
    const productResult = await productsRepository.findById(item.productId);

    if (!productResult) {
      throw createServiceError(400, `Product ${item.productId} does not exist`);
    }

    const product = productResult.product;

    if (!product.isActive) {
      throw createServiceError(400, `Product ${product.name} is inactive`);
    }

    const unitCostSnapshot = await resolveUnitCostSnapshot(item.productId);
    const lineSubtotal = resolveLineSaleAmount(product, item.quantity);
    const unitSalePriceSnapshot = lineSubtotal / item.quantity;

    builtItems.push({
      productId: product.id,
      productNameSnapshot: product.name,
      quantity: item.quantity,
      unitSalePriceSnapshot,
      unitCostSnapshot,
      lineSubtotal,
    });
  }

  const subtotalAmount = builtItems.reduce((sum, item) => sum + item.lineSubtotal, 0);

  return {
    builtItems,
    subtotalAmount,
  };
}

async function resolveCustomerData(
  clientId: string | null | undefined,
  customerName: string | null | undefined,
  customerPhone: string | null | undefined,
  customerAddress: string | null | undefined,
) {
  const trimmedName = customerName?.trim() || null;
  const trimmedPhone = customerPhone?.trim() || null;
  const trimmedAddress = customerAddress?.trim() || null;

  if (!clientId) {
    if (trimmedName) {
      // Find exactly by name or create a new client
      const existingClient = await clientsRepository.findByName(trimmedName);
      let targetClient = existingClient;

      if (!targetClient) {
        targetClient = await clientsRepository.create({
          name: trimmedName,
          phone: trimmedPhone || undefined,
          address: trimmedAddress || undefined,
        });
      }

      return {
        clientId: targetClient.id,
        customerNameSnapshot: targetClient.name,
        customerPhoneSnapshot: targetClient.phone || trimmedPhone,
        customerAddressSnapshot: targetClient.address || trimmedAddress,
      };
    }

    return {
      clientId: null,
      customerNameSnapshot: null,
      customerPhoneSnapshot: null,
      customerAddressSnapshot: null,
    };
  }

  const client = await clientsRepository.findById(clientId);

  if (!client) {
    throw createServiceError(400, "Client does not exist");
  }

  if (!client.isActive) {
    throw createServiceError(400, "Client is inactive");
  }

  return {
    clientId: client.id,
    customerNameSnapshot: trimmedName ?? client.name,
    customerPhoneSnapshot: trimmedPhone !== undefined ? trimmedPhone : client.phone,
    customerAddressSnapshot: trimmedAddress !== undefined ? trimmedAddress : client.address,
  };
}

function ensureOrderEditable(status: Order["status"]) {
  if (status === "cancelled") {
    throw createServiceError(409, `Order in status "${status}" cannot be edited`);
  }
}

function getDayRange(dateString: string) {
  const start = new Date(`${dateString}T00:00:00.000Z`);
  const end = new Date(`${dateString}T00:00:00.000Z`);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

export const ordersService = {
  async getAllOrders() {
    return await ordersRepository.findAllOrders();
  },

async getOperationalSummary(date?: string) {
  const statuses: Array<Order["status"]> = ["confirmed"];

  const orders = date
    ? await (async () => {
        const { start, end } = getDayRange(date);
        return ordersRepository.findOrdersByDeliveryDateAndStatuses(
          start,
          end,
          statuses,
        );
      })()
    : await ordersRepository.findOrdersByStatuses(statuses);

  const orderIds = orders.map((order) => order.id);
  const items = await ordersRepository.findItemsByOrderIds(orderIds);

  const varietiesMap = new Map<
    string,
    { productId: string; productName: string; units: number; dozens: number }
  >();

  for (const item of items) {
    const current = varietiesMap.get(item.productId);

    if (current) {
      current.units += item.quantity;
      current.dozens = current.units / 12;
    } else {
      varietiesMap.set(item.productId, {
        productId: item.productId,
        productName: item.productNameSnapshot,
        units: item.quantity,
        dozens: item.quantity / 12,
      });
    }
  }

  const varieties = Array.from(varietiesMap.values()).sort(
    (a, b) => b.units - a.units,
  );

  const totalUnits = varieties.reduce((sum, item) => sum + item.units, 0);
  const totalDozens = totalUnits / 12;

  return {
    date: date ?? null,
    ordersCount: orders.length,
    totalUnits,
    totalDozens,
    varieties,
  };
},
  

  async getOrderById(id: string) {
    const order = await ordersRepository.findOrderById(id);

    if (!order) {
      return null;
    }

    const items = await ordersRepository.findItemsByOrderId(id);

    return { order, items };
  },

  async createOrder(input: CreateOrderInput) {
    const customerData = await resolveCustomerData(
      input.clientId,
      input.customerName,
      input.customerPhone,
      input.customerAddress,
    );
    const { builtItems, subtotalAmount } = await buildOrderItems(input.items);
    const discountAmount = input.discountAmount ?? 0;
    const totalAmount = subtotalAmount - discountAmount;

    if (totalAmount < 0) {
      throw createServiceError(400, "Discount cannot be greater than subtotal");
    }

    const order = await ordersRepository.createOrder({
      clientId: customerData.clientId,
      customerNameSnapshot: customerData.customerNameSnapshot,
      customerPhoneSnapshot: customerData.customerPhoneSnapshot,
      customerAddressSnapshot: customerData.customerAddressSnapshot,
      status: "pending",
      channel: input.channel,
      deliveryDate: input.deliveryDate ?? null,
      deliveryShift: input.deliveryShift ?? null,
      paymentMethod: input.paymentMethod ?? "cash",
      isPaid: input.isPaid ?? false,
      notes: input.notes || null,
      subtotalAmount,
      discountAmount,
      totalAmount,
      isActive: true,
    });

    const items = await ordersRepository.createOrderItems(order.id, builtItems);

    return { order, items };
  },

  

  async updateOrder(id: string, input: UpdateOrderInput) {
    const existing = await ordersRepository.findOrderById(id);

    if (!existing) {
      return null;
    }

    const isOnlyPaymentUpdate = Object.keys(input).every((key) =>
      ["isPaid", "paymentMethod"].includes(key)
    );

    if (!isOnlyPaymentUpdate) {
      ensureOrderEditable(existing.status);
    }

    const nextCustomerData =
      input.clientId !== undefined || 
      input.customerName !== undefined ||
      input.customerPhone !== undefined ||
      input.customerAddress !== undefined
        ? await resolveCustomerData(
            input.clientId ?? existing.clientId,
            input.customerName !== undefined
              ? input.customerName
              : existing.customerNameSnapshot,
            input.customerPhone !== undefined
              ? input.customerPhone
              : existing.customerPhoneSnapshot,
            input.customerAddress !== undefined
              ? input.customerAddress
              : existing.customerAddressSnapshot,
          )
        : {
            clientId: existing.clientId,
            customerNameSnapshot: existing.customerNameSnapshot,
            customerPhoneSnapshot: existing.customerPhoneSnapshot,
            customerAddressSnapshot: existing.customerAddressSnapshot,
          };

    const nextChannel = input.channel ?? existing.channel;
    const nextNotes = input.notes ?? existing.notes;
    const nextDiscountAmount = input.discountAmount ?? existing.discountAmount;
    const nextDeliveryDate =
      input.deliveryDate !== undefined ? input.deliveryDate : existing.deliveryDate;
    const nextPaymentMethod = input.paymentMethod ?? existing.paymentMethod;
    const nextIsPaid = input.isPaid ?? existing.isPaid;

    let subtotalAmount = existing.subtotalAmount;
    let items = await ordersRepository.findItemsByOrderId(id);

    if (input.items) {
      const builtResult = await buildOrderItems(input.items);
      subtotalAmount = builtResult.subtotalAmount;
      items = await ordersRepository.replaceOrderItems(id, builtResult.builtItems);
    }

    const totalAmount = subtotalAmount - nextDiscountAmount;

    if (totalAmount < 0) {
      throw createServiceError(400, "Discount cannot be greater than subtotal");
    }

    const order = await ordersRepository.updateOrder(id, {
      clientId: nextCustomerData.clientId,
      customerNameSnapshot: nextCustomerData.customerNameSnapshot,
      customerPhoneSnapshot: nextCustomerData.customerPhoneSnapshot,
      customerAddressSnapshot: nextCustomerData.customerAddressSnapshot,
      channel: nextChannel,
      deliveryDate: nextDeliveryDate ?? null,
      deliveryShift: input.deliveryShift !== undefined ? input.deliveryShift : existing.deliveryShift,
      paymentMethod: nextPaymentMethod,
      isPaid: nextIsPaid,
      notes: nextNotes,
      subtotalAmount,
      discountAmount: nextDiscountAmount,
      totalAmount,
    });

    if (!order) {
      return null;
    }

    return { order, items };
  },

  async updateOrderStatus(id: string, input: UpdateOrderStatusInput) {
    const existing = await ordersRepository.findOrderById(id);

    if (!existing) {
      return null;
    }

    return await ordersRepository.updateOrder(id, {
      status: input.status,
    });
  },

  async deactivateOrder(id: string) {
    const existing = await ordersRepository.findOrderById(id);

    if (!existing) {
      return null;
    }

    return await ordersRepository.deactivateOrder(id);
  },

  async reactivateOrder(id: string) {
    const existing = await ordersRepository.findOrderById(id);

    if (!existing) {
      return null;
    }

    return await ordersRepository.reactivateOrder(id);
  },

  

  async hardDeleteOrder(id: string): Promise<boolean> {
    const existing = await ordersRepository.findOrderById(id);
    if (!existing) return false;
    return await ordersRepository.hardDeleteOrder(id);
  },

  async getSummary() {
    const orders = await ordersRepository.findAllOrders();

    const deliveredOrders = orders.filter((order) => order.status === "delivered");

    const totalRevenue = deliveredOrders.reduce(
      (acc, order) => acc + order.totalAmount,
      0,
    );

    const deliveredCount = deliveredOrders.length;

    const averageTicket = deliveredCount > 0 ? totalRevenue / deliveredCount : 0;

    return {
      totalRevenue,
      deliveredCount,
      averageTicket,
    };
  },
};