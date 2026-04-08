import { z } from "zod";

export const createWeeklyClosureSchema = z.object({
  name: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  notes: z.string().optional(),
});
