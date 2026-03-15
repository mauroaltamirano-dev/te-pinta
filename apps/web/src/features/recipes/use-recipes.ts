import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createRecipe,
  createRecipeItem,
  getRecipeByProductId,
  getRecipeItems,
  getRecipes,
} from "../../services/api/recipes.api";

export function useRecipes() {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: getRecipes,
  });
}

export function useRecipeByProductId(productId: string) {
  return useQuery({
    queryKey: ["recipe-by-product", productId],
    queryFn: () => getRecipeByProductId(productId),
    enabled: Boolean(productId),
    retry: false,
  });
}

export function useRecipeItems(recipeId: string) {
  return useQuery({
    queryKey: ["recipe-items", recipeId],
    queryFn: () => getRecipeItems(recipeId),
    enabled: Boolean(recipeId),
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecipe,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({
        queryKey: ["recipe-by-product", variables.productId],
      });
    },
  });
}

export function useCreateRecipeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recipeId,
      data,
    }: {
      recipeId: string;
      data: {
        ingredientId: string;
        quantity: number;
        unit: "kg" | "g" | "l" | "ml" | "unit";
      };
    }) => createRecipeItem(recipeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["recipe-items", variables.recipeId],
      });
    },
  });
}