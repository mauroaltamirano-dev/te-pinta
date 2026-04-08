import { useQuery } from "@tanstack/react-query";
import {
  getClosures,
  getCurrentOpenClosure,
  getLiveMetrics,
} from "../../../services/api/weekly-closures.api";

export function useWeeklyClosures() {
  return useQuery({
    queryKey: ["weekly-closures"],
    queryFn: getClosures,
    staleTime: 60_000,
  });
}

export function useOpenClosure() {
  return useQuery({
    queryKey: ["weekly-closures", "open"],
    queryFn: getCurrentOpenClosure,
    staleTime: 30_000,
  });
}

export function useClosureMetrics(closureId: string | null) {
  return useQuery({
    queryKey: ["weekly-closures", closureId, "metrics"],
    queryFn: () => getLiveMetrics(closureId!),
    enabled: !!closureId,
    staleTime: 60_000,
  });
}
