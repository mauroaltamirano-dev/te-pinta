import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createIngredient,
  deactivateIngredient,
  getIngredients,
  updateIngredient,
} from "../../services/api/ingredients.api";

export function useIngredients(options?: { includeInactive?: boolean }) {
  return useQuery({
    queryKey: ["ingredients", options?.includeInactive ?? false],
    queryFn: () => getIngredients(options),
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        description?: string;
        unit?: "kg" | "g" | "l" | "ml" | "unit";
        currentCost?: number;
      };
    }) => updateIngredient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}

export function useDeactivateIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}