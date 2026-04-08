import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPurchase,
  getPurchases,
  getPurchasesSummary,
} from "../../services/api/purchases.api";

export function usePurchases() {
  return useQuery({
    queryKey: ["purchases"],
    queryFn: getPurchases,
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchases-summary"] });
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}

import {
  getPurchaseById,
  updatePurchase,
  deletePurchase,
} from "../../services/api/purchases.api";

export function usePurchaseById(id: string) {
  return useQuery({
    queryKey: ["purchase", id],
    queryFn: () => getPurchaseById(id),
    enabled: !!id,
  });
}

export function useUpdatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updatePurchase>[1];
    }) => updatePurchase(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchases-summary"] });
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["purchase"] });
    },
  });
}

export function useDeletePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchases-summary"] });
    },
  });
}

export function usePurchasesSummary() {
  return useQuery({
    queryKey: ["purchases-summary"],
    queryFn: getPurchasesSummary,
  });
}