import { z } from "zod";
import { TaskAllExceptIdSchema, TaskIdOnlyRequiredSchema } from "~/types/tasks.types";

const IdempotencyKeyObjectSchema = z.object({
    idempotencyKey: z.guid(),
});

export const TaskAllExceptIdWithIdempotencyKeySchema = z.intersection(TaskAllExceptIdSchema, IdempotencyKeyObjectSchema);
export const TaskIdOnlyRequiredWithIdempotencyKeySchema = z.intersection(TaskIdOnlyRequiredSchema, IdempotencyKeyObjectSchema);

export type TaskAllExceptIdWithIdempotencyKey = z.infer<typeof TaskAllExceptIdWithIdempotencyKeySchema>;
export type TaskIdOnlyRequiredWithIdempotencyKey = z.infer<typeof TaskIdOnlyRequiredWithIdempotencyKeySchema>;
