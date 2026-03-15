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

export function usePurchasesSummary() {
  return useQuery({
    queryKey: ["purchases-summary"],
    queryFn: getPurchasesSummary,
  });
}