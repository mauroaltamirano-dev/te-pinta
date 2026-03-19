import { clientsRepository } from '../clients/clients.repository';
import { ordersRepository }  from '../orders/orders.repository';

export const dashboardRepository = {
  // ordersRepository.findAllOrders() es async → await obligatorio
  async findAllOrders() {
    return await ordersRepository.findAllOrders();
  },

  async findItemsByOrderId(orderId: string) {
    return await ordersRepository.findItemsByOrderId(orderId);
  },

  async findClientNameById(clientId: string | null): Promise<string | null> {
    if (!clientId) return null;
    // clientsRepository.findById es async → await
    const client = await clientsRepository.findById(clientId);
    return client?.name ?? null;
  },
};