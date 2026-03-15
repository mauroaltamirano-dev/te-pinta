import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createIngredient,
  getIngredients,
} from "../../services/api/ingredients.api";

export function useIngredients() {
  return useQuery({
    queryKey: ["ingredients"],
    queryFn: getIngredients,
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