import type { Client } from './clients.types';

export const clientsMapper = {
  toResponse(client: Client) {
    return {
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
      notes: client.notes,
      isActive: client.isActive,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  },

  toResponseList(clients: Client[]) {
    return clients.map((client) => this.toResponse(client));
  },
};