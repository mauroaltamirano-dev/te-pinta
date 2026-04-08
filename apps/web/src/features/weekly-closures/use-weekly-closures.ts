import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getClosures,
  getCurrentOpenClosure,
  getLiveMetrics,
  getClosureById,
  createClosure,
  closeClosure,
  deleteClosure,
} from "../../services/api/weekly-closures.api";

export function useWeeklyClosures() {
  return useQuery({
    queryKey: ["weekly-closures"],
    queryFn: getClosures,
  });
}

export function useCurrentOpenClosure() {
  return useQuery({
    queryKey: ["weekly-closures", "open"],
    queryFn: getCurrentOpenClosure,
  });
}

export function useWeeklyClosure(id: string | undefined) {
  return useQuery({
    queryKey: ["weekly-closures", id],
    queryFn: () => getClosureById(id as string),
    enabled: !!id,
  });
}

export function useLiveMetrics(closureId: string | null) {
  return useQuery({
    queryKey: ["weekly-closures", "metrics", closureId],
    queryFn: () => getLiveMetrics(closureId as string),
    enabled: !!closureId,
    refetchInterval: 30000,
  });
}

export function useCreateClosure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClosure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-closures"] });
    },
  });
}

export function useCloseClosure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: closeClosure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-closures"] });
    },
  });
}

export function useDeleteClosure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClosure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-closures"] });
    },
  });
}
