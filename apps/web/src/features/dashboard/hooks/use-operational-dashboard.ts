import { useQuery } from "@tanstack/react-query";
import { getOperationalDashboard } from "../../../services/api/dashboard.api";

export function useOperationalDashboard() {
  return useQuery({
    queryKey: ["dashboard-operational"],
    queryFn: getOperationalDashboard,
    // Refetch cada 60 segundos — la operación cambia seguido
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}