import { clientsRepository } from '../clients/clients.repository';
import { productionService } from '../production/production.service';
import { productsRepository } from '../products/products.repository';
import { ordersRepository } from './orders.repository';
import type {
  CreateOrderInput,
  UpdateOrderInput,
  UpdateOrderStatusInput,
} from './orders.types';

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

function resolveUnitCostSnapshot(productId: string) {
  const product = productsRepository.findById(productId);

  if (!product) {
    throw createServiceError(400, `Product ${productId} does not exist`);
  }

  if (product.kind === 'prepared') {
    const costResult = productionService.getProductCost(productId);
    return costResult.totalUnitCost;
  }

  if (product.kind === 'resale' || product.kind === 'combo') {
    if (product.directCost === null) {
      throw createServiceError(
        400,
        `Product ${product.name} requires direct cost`,
      );
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

  const total =
    dozens * (product.dozenPrice ?? 0) +
    halfDozens * (product.halfDozenPrice ?? 0) +
    units * product.unitPrice;

  return total;
}

function buildOrderItems(
  items: Array<{ productId: string; quantity: number }>,
): {
  builtItems: BuiltOrderItem[];
  subtotalAmount: number;
} {
  const builtItems = items.map((item) => {
    const product = productsRepository.findById(item.productId);

    if (!product) {
      throw createServiceError(400, `Product ${item.productId} does not exist`);
    }

    if (!product.isActive) {
      throw createServiceError(400, `Product ${product.name} is inactive`);
    }

    const unitCostSnapshot = resolveUnitCostSnapshot(item.productId);
    const lineSubtotal = resolveLineSaleAmount(product, item.quantity);
    const unitSalePriceSnapshot = lineSubtotal / item.quantity;

    return {
      productId: product.id,
      productNameSnapshot: product.name,
      quantity: item.quantity,
      unitSalePriceSnapshot,
      unitCostSnapshot,
      lineSubtotal,
    };
  });

  const subtotalAmount = builtItems.reduce(
    (sum, item) => sum + item.lineSubtotal,
    0,
  );

  return {
    builtItems,
    subtotalAmount,
  };
}

function validateClient(clientId: string | null | undefined) {
  if (!clientId) {
    return null;
  }

  const client = clientsRepository.findById(clientId);

  if (!client) {
    throw createServiceError(400, 'Client does not exist');
  }

  if (!client.isActive) {
    throw createServiceError(400, 'Client is inactive');
  }

  return client.id;
}

function ensureOrderEditable(status: string) {
  if (status === 'delivered' || status === 'cancelled') {
    throw createServiceError(
      409,
      `Order in status "${status}" cannot be edited`,
    );
  }
}

export const ordersService = {
  getAllOrders() {
    return ordersRepository.findAllOrders();
  },

  getOrderById(id: string) {
    const order = ordersRepository.findOrderById(id);

    if (!order) {
      return null;
    }

    const items = ordersRepository.findItemsByOrderId(id);

    return {
      order,
      items,
    };
  },

  createOrder(input: CreateOrderInput) {
    const clientId = validateClient(input.clientId);
    const { builtItems, subtotalAmount } = buildOrderItems(input.items);
    const discountAmount = input.discountAmount ?? 0;
    const totalAmount = subtotalAmount - discountAmount;

    if (totalAmount < 0) {
      throw createServiceError(400, 'Discount cannot be greater than subtotal');
    }

    const order = ordersRepository.createOrder({
      clientId,
      status: 'pending',
      channel: input.channel,
      notes: input.notes || null,
      subtotalAmount,
      discountAmount,
      totalAmount,
      isActive: true,
    });

    const items = ordersRepository.createOrderItems(order.id, builtItems);

    return {
      order,
      items,
    };
  },

  updateOrder(id: string, input: UpdateOrderInput) {
    const existing = ordersRepository.findOrderById(id);

    if (!existing) {
      return null;
    }

    ensureOrderEditable(existing.status);

    const nextClientId =
      input.clientId !== undefined
        ? validateClient(input.clientId)
        : existing.clientId;

    const nextChannel = input.channel ?? existing.channel;
    const nextNotes = input.notes ?? existing.notes;
    const nextDiscountAmount = input.discountAmount ?? existing.discountAmount;

    let subtotalAmount = existing.subtotalAmount;
    let items = ordersRepository.findItemsByOrderId(id);

    if (input.items) {
      const builtResult = buildOrderItems(input.items);
      subtotalAmount = builtResult.subtotalAmount;
      items = ordersRepository.replaceOrderItems(id, builtResult.builtItems);
    }

    const totalAmount = subtotalAmount - nextDiscountAmount;

    if (totalAmount < 0) {
      throw createServiceError(400, 'Discount cannot be greater than subtotal');
    }

    const order = ordersRepository.updateOrder(id, {
      clientId: nextClientId,
      channel: nextChannel,
      notes: nextNotes,
      subtotalAmount,
      discountAmount: nextDiscountAmount,
      totalAmount,
    });

    if (!order) {
      return null;
    }

    return {
      order,
      items,
    };
  },

  updateOrderStatus(id: string, input: UpdateOrderStatusInput) {
    const existing = ordersRepository.findOrderById(id);

    if (!existing) {
      return null;
    }

    return ordersRepository.updateOrder(id, {
      status: input.status,
    });
  },

  deactivateOrder(id: string) {
    const existing = ordersRepository.findOrderById(id);

    if (!existing) {
      return null;
    }

    return ordersRepository.deactivateOrder(id);
  },

  getSummary() {
    const orders = ordersRepository.findAllOrders();

    const deliveredOrders = orders.filter(
      (order) => order.status === 'delivered',
    );

    const totalRevenue = deliveredOrders.reduce(
      (acc, order) => acc + order.totalAmount,
      0,
    );

    const deliveredCount = deliveredOrders.length;

    const averageTicket =
      deliveredCount > 0 ? totalRevenue / deliveredCount : 0;

    return {
      totalRevenue,
      deliveredCount,
      averageTicket,
    };
  },
};