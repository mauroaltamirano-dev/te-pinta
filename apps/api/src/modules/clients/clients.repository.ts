import type {
  Client,
  CreateClientInput,
  UpdateClientInput,
} from './clients.types';

const clients = new Map<string, Client>();

function generateClientId() {
  return crypto.randomUUID();
}

export const clientsRepository = {
  findAll(): Client[] {
    return Array.from(clients.values());
  },

  findById(id: string): Client | null {
    return clients.get(id) ?? null;
  },

  create(input: CreateClientInput): Client {
    const now = new Date().toISOString();

    const client: Client = {
      id: generateClientId(),
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      address: input.address || null,
      notes: input.notes || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    clients.set(client.id, client);

    return client;
  },

  update(id: string, input: UpdateClientInput): Client | null {
    const existingClient = clients.get(id);

    if (!existingClient) {
      return null;
    }

    const updatedClient: Client = {
      ...existingClient,
      name: input.name ?? existingClient.name,
      phone: input.phone ?? existingClient.phone,
      email: input.email === '' ? null : (input.email ?? existingClient.email),
      address: input.address ?? existingClient.address,
      notes: input.notes ?? existingClient.notes,
      updatedAt: new Date().toISOString(),
    };

    clients.set(id, updatedClient);

    return updatedClient;
  },

  deactivate(id: string): Client | null {
    const existingClient = clients.get(id);

    if (!existingClient) {
      return null;
    }

    const updatedClient: Client = {
      ...existingClient,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    clients.set(id, updatedClient);

    return updatedClient;
  },
};