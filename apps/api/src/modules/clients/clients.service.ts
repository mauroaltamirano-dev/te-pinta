import { ordersRepository } from '../orders/orders.repository';
import { clientsRepository } from './clients.repository';
import type { CreateClientInput, UpdateClientInput } from './clients.types';

type ServiceError = { statusCode: number; message: string };
function err(statusCode: number, message: string): ServiceError {
  return { statusCode, message };
}

export const clientsService = {
  async getAll(options?: { includeInactive?: boolean }) {
    return clientsRepository.findAll(options);
  },

  async getById(id: string) {
    return clientsRepository.findById(id);
  },

  async create(input: CreateClientInput) {
    return clientsRepository.create(input);
  },

  async update(id: string, input: UpdateClientInput) {
    const existing = await clientsRepository.findById(id);
    if (!existing) return null;
    return clientsRepository.update(id, input);
  },

  async deactivate(id: string) {
    const existing = await clientsRepository.findById(id);
    if (!existing) return null;
    return clientsRepository.deactivate(id);
  },

  async reactivate(id: string) {
    const existing = await clientsRepository.findById(id);
    if (!existing) return null;
    return clientsRepository.reactivate(id);
  },

  /**
   * Historial y estadísticas del cliente basadas en pedidos entregados.
   */
  async getClientStats(clientId: string) {
    const client = await clientsRepository.findById(clientId);
    if (!client) throw err(404, 'Client not found');

    const allOrders = await ordersRepository.findAllOrders();

    const clientOrders = allOrders.filter(
      (o) => o.clientId === clientId && o.status === 'delivered',
    );

    let totalSpent     = 0;
    let totalItems     = 0;
    let totalUnits     = 0;

    const orderDetails = await Promise.all(
      clientOrders.map(async (order) => {
        const items = await ordersRepository.findItemsByOrderId(order.id);

        const orderUnits = items.reduce((sum, i) => sum + i.quantity, 0);
        totalSpent  += order.totalAmount;
        totalItems  += items.length;
        totalUnits  += orderUnits;

        return {
          id:           order.id,
          createdAt:    order.createdAt.toISOString(),
          deliveryDate: (order as any).deliveryDate
            ? new Date((order as any).deliveryDate).toISOString()
            : null,
          status:       order.status,
          channel:      order.channel,
          totalAmount:  order.totalAmount,
          notes:        order.notes,
          items: items.map((i) => ({
            productNameSnapshot: i.productNameSnapshot,
            quantity:            i.quantity,
            lineSubtotal:        i.lineSubtotal,
          })),
        };
      }),
    );

    // Ordenar por fecha descendente
    orderDetails.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const averageTicket =
      clientOrders.length > 0 ? totalSpent / clientOrders.length : 0;

    return {
      client,
      stats: {
        totalOrders:    clientOrders.length,
        totalSpent,
        averageTicket,
        totalUnits,
        totalItems,
      },
      orders: orderDetails,
    };
  },
};