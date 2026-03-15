import { useQuery } from "@tanstack/react-query";
import {
  getSalesDashboard,
  type DashboardRange,
} from "../../services/api/dashboard.api";

export function useSalesDashboard(range: DashboardRange) {
  return useQuery({
    queryKey: ["sales-dashboard", range],
    queryFn: () => getSalesDashboard(range),
  });
}