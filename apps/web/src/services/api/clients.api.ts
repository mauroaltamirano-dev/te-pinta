import { apiClient } from "./client";

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export function getClients() {
  return apiClient.get<Client[]>("/clients");
}