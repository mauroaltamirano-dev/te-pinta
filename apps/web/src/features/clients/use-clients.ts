import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createClient,
  deactivateClient,
  getClientById,
  getClients,
  getClientStats,
  reactivateClient,
  updateClient,
} from '../../services/api/clients.api';

export function useClients(options?: { includeInactive?: boolean }) {
  return useQuery({
    queryKey: ['clients', options?.includeInactive ?? false],
    queryFn:  () => getClients(options),
  });
}

export function useClientById(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn:  () => getClientById(id),
    enabled:  Boolean(id),
  });
}

export function useClientStats(id: string) {
  return useQuery({
    queryKey: ['client-stats', id],
    queryFn:  () => getClientStats(id),
    enabled:  Boolean(id),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateClient>[1] }) =>
      updateClient(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      queryClient.invalidateQueries({ queryKey: ['client-stats', id] });
    },
  });
}

export function useDeactivateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateClient,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', id] });
    },
  });
}

export function useReactivateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reactivateClient,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', id] });
    },
  });
}