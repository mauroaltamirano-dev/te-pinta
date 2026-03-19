import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createRecipe,
  createRecipeItem,
  deactivateRecipe,
  deleteRecipeItem,
  getAllRecipeItems,
  getRecipeByProductId,
  getRecipeItems,
  getRecipes,
  reactivateRecipe,
  updateRecipe,
  updateRecipeItem,
} from "../../services/api/recipes.api";

export function useRecipes() {
  return useQuery({
    queryKey: ["recipes"],
    queryFn:  getRecipes,
  });
}

// ── nuevo ──────────────────────────────────────────────────────
export function useAllRecipeItems() {
  return useQuery({
    queryKey: ["recipe-items-all"],
    queryFn:  getAllRecipeItems,
  });
}

export function useRecipeByProductId(
  productId: string,
  options?: { includeInactive?: boolean },
) {
  return useQuery({
    queryKey: ["recipe-by-product", productId, options?.includeInactive ?? false],
    queryFn:  () => getRecipeByProductId(productId, options),
    enabled:  Boolean(productId),
    retry:    false,
  });
}

export function useRecipeItems(recipeId: string) {
  return useQuery({
    queryKey: ["recipe-items", recipeId],
    queryFn:  () => getRecipeItems(recipeId),
    enabled:  Boolean(recipeId),
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

export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recipeId,
      data,
    }: {
      recipeId: string;
      data: { yieldQuantity?: number; notes?: string };
    }) => updateRecipe(recipeId, data),
    onSuccess: (recipe) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({
        queryKey: ["recipe-by-product", recipe.productId],
      });
    },
  });
}

export function useDeactivateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateRecipe,
    onSuccess: (recipe) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({
        queryKey: ["recipe-by-product", recipe.productId],
      });
    },
  });
}

export function useReactivateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateRecipe,
    onSuccess: (recipe) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({
        queryKey: ["recipe-by-product", recipe.productId],
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
      // invalidar también el global para mantener filtros en sync
      queryClient.invalidateQueries({ queryKey: ["recipe-items-all"] });
    },
  });
}

export function useUpdateRecipeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recipeId,
      itemId,
      data,
    }: {
      recipeId: string;
      itemId: string;
      data: {
        ingredientId?: string;
        quantity?: number;
        unit?: "kg" | "g" | "l" | "ml" | "unit";
      };
    }) => updateRecipeItem(recipeId, itemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["recipe-items", variables.recipeId],
      });
      queryClient.invalidateQueries({ queryKey: ["recipe-items-all"] });
    },
  });
}

export function useDeleteRecipeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recipeId,
      itemId,
    }: {
      recipeId: string;
      itemId: string;
    }) => deleteRecipeItem(recipeId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["recipe-items", variables.recipeId],
      });
      queryClient.invalidateQueries({ queryKey: ["recipe-items-all"] });
    },
  });
}