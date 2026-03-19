import type { ZodIssue } from "zod";

export function formatZodIssues(issues: ZodIssue[]) {
  return issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}