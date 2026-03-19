import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deactivateCategory,
  getCategories,
  reactivateCategory,
  updateCategory,
} from "../../services/api/categories.api";

export function useCategories(options?: { includeInactive?: boolean }) {
  return useQuery({
    queryKey: ["categories", options?.includeInactive ?? false],
    queryFn: () => getCategories(options),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; description?: string };
    }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeactivateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useReactivateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}