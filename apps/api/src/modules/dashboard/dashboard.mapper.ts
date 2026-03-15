import type { SalesDashboardResponse } from './dashboard.types';

export const dashboardMapper = {
  toSalesResponse(data: SalesDashboardResponse): SalesDashboardResponse {
    return data;
  },
};