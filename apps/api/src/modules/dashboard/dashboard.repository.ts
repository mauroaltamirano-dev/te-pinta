import { clientsRepository } from '../clients/clients.repository';
import { ordersRepository } from '../orders/orders.repository';

export const dashboardRepository = {
  findAllOrders() {
    return ordersRepository.findAllOrders();
  },

  findItemsByOrderId(orderId: string) {
    return ordersRepository.findItemsByOrderId(orderId);
  },

  findClientNameById(clientId: string | null): string | null {
    if (!clientId) {
      return null;
    }

    const client = clientsRepository.findById(clientId);
    return client?.name ?? null;
  },
};