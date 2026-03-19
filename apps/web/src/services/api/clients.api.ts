import { apiClient } from './client';

export type Client = {
  id:        string;
  name:      string;
  phone:     string | null;
  address:   string | null;
  notes:     string | null;
  isActive:  boolean;
  createdAt: string;
  updatedAt: string;
};

export type ClientOrderItem = {
  productNameSnapshot: string;
  quantity:            number;
  lineSubtotal:        number;
};

export type ClientOrder = {
  id:           string;
  createdAt:    string;
  deliveryDate: string | null;
  status:       string;
  channel:      string;
  totalAmount:  number;
  notes:        string | null;
  items:        ClientOrderItem[];
};

export type ClientStats = {
  totalOrders:    number;
  totalSpent:     number;
  averageTicket:  number;
  totalUnits:     number;
  totalItems:     number;
};

export type ClientStatsResponse = {
  client: Client;
  stats:  ClientStats;
  orders: ClientOrder[];
};

export function getClients(options?: { includeInactive?: boolean }) {
  return apiClient.get<Client[]>('/clients', {
    params: { includeInactive: options?.includeInactive },
  });
}

export function getClientById(id: string) {
  return apiClient.get<Client>(`/clients/${id}`);
}

export function getClientStats(id: string) {
  return apiClient.get<ClientStatsResponse>(`/clients/${id}/stats`);
}

export function createClient(data: {
  name:     string;
  phone?:   string;
  address?: string;
  notes?:   string;
}) {
  return apiClient.post<Client>('/clients', data);
}

export function updateClient(
  id: string,
  data: {
    name?:    string;
    phone?:   string;
    address?: string;
    notes?:   string;
  },
) {
  return apiClient.patch<Client>(`/clients/${id}`, data);
}

export function deactivateClient(id: string) {
  return apiClient.delete<Client>(`/clients/${id}`);
}

export function reactivateClient(id: string) {
  return apiClient.patch<Client>(`/clients/${id}/reactivate`, {});
}