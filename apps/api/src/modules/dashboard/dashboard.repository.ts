import { clientsRepository } from '../clients/clients.repository';
import { ordersRepository }  from '../orders/orders.repository';

export const dashboardRepository = {
  async findAllOrders() {
    return await ordersRepository.findAllOrders();
  },

  // Query individual — se mantiene por compatibilidad pero preferir el batch
  async findItemsByOrderId(orderId: string) {
    return await ordersRepository.findItemsByOrderId(orderId);
  },

  // Batch: trae items de múltiples pedidos en una sola query.
  // Evita el patrón N+1 al operar sobre listas de pedidos.
  async findItemsByOrderIds(orderIds: string[]) {
    if (orderIds.length === 0) return [];
    return await ordersRepository.findItemsByOrderIds(orderIds);
  },

  async findClientNameById(clientId: string | null): Promise<string | null> {
    if (!clientId) return null;
    const client = await clientsRepository.findById(clientId);
    return client?.name ?? null;
  },
};