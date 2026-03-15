import { z } from 'zod';

export const dashboardRangeSchema = z.enum(['today', '7d', '30d', 'month']);

export const getSalesDashboardQuerySchema = z.object({
  range: dashboardRangeSchema.default('7d'),
});

export const dashboardRangeValues = ['today', '7d', '30d', 'month'] as const;