import { clientsRepository } from './clients.repository';
import type {
  CreateClientInput,
  UpdateClientInput,
} from './clients.types';

export const clientsService = {
  getAll() {
    return clientsRepository.findAll();
  },

  getById(id: string) {
    return clientsRepository.findById(id);
  },

  create(input: CreateClientInput) {
    return clientsRepository.create(input);
  },

  update(id: string, input: UpdateClientInput) {
    const existingClient = clientsRepository.findById(id);

    if (!existingClient) {
      return null;
    }

    return clientsRepository.update(id, input);
  },

  deactivate(id: string) {
    return clientsRepository.deactivate(id);
  },
};