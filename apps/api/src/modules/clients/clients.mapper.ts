import type { Client } from './clients.types';

export const clientsMapper = {
  toResponse(client: Client) {
    return {
      id:        client.id,
      name:      client.name,
      phone:     client.phone,
      address:   client.address,
      notes:     client.notes,
      isActive:  client.isActive,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    };
  },

  toResponseList(clients: Client[]) {
    return clients.map((c) => this.toResponse(c));
  },
};