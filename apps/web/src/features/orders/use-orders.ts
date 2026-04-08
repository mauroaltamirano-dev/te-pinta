import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createOrder,
  getOrderById,
  getOrders,
  getOrdersSummary,
  updateOrderStatus,
  updateOrder,
  deactivateOrder,
  reactivateOrder,
  hardDeleteOrder,
  getOperationalOrdersSummary,
} from '../../services/api/orders.api';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });
}

export function useOperationalOrdersSummary(date?: string) {
  return useQuery({
    queryKey: ["orders", "operational-summary", date],
    queryFn: () => getOperationalOrdersSummary(date),
  });
}

export function useOrdersSummary() {
  return useQuery({
    queryKey: ['orders-summary'],
    queryFn: getOrdersSummary,
  });
}

export function useOrderById(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: Boolean(orderId),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-summary'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status:
        | 'pending'
        | 'confirmed'
        | 'prepared'
        | 'delivered'
        | 'cancelled';
    }) => {
      return updateOrderStatus(orderId, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders-summary'] });
    },
    onError: (error) => {
      console.error('Failed to update order status:', error);
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: Parameters<typeof updateOrder>[1];
    }) => updateOrder(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders-summary'] });
    },
  });
}

export function useDeactivateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateOrder,
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders-summary'] });
    },
  });
}

export function useReactivateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateOrder,
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders-summary'] });
    },
  });
}

export function useHardDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hardDeleteOrder,
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.removeQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders-summary'] });
    },
  });
}