import * as z from "zod";

export const taskApiSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  reminder: z.string().nullable().optional(),
  estimate: z.number().int().nonnegative().optional(),
  priority: z.enum(["NONE", "LOW", "MEDIUM", "HIGH"]).optional(),
  listId: z.string(),
  parentId: z.string().nullable().optional(),
  completed: z.boolean().optional(),
});

export const taskUpdateApiSchema = taskApiSchema
  .partial()
  .omit({ listId: true });
