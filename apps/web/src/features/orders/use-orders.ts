import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createOrder,
  getOrderById,
  getOrders,
  getOrdersSummary,
  updateOrderStatus,
} from '../../services/api/orders.api';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
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
        | 'preparing'
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