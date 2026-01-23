import { z } from "zod";
import { TaskAllExceptIdOptionalListSchema, TaskAllExceptIdOptionalSchema, TaskAllExceptIdSchema, TaskIdOnlyRequiredSchema, TaskListSchema, type TaskAllExceptIdOptional } from "~/types/tasks.types";

const IdempotencyKeyObjectSchema = z.object({
    idempotencyKey: z.guid(),
});

export const TaskAllExceptIdWithIdempotencyKeySchema = z.intersection(TaskAllExceptIdSchema, IdempotencyKeyObjectSchema);
export const TaskIdOnlyRequiredWithIdempotencyKeySchema = z.intersection(TaskIdOnlyRequiredSchema, IdempotencyKeyObjectSchema);
export const TasksQueryByMultipleCriteriaWithGlobalCriteriaSchema = TaskAllExceptIdOptionalSchema.safeExtend({
    multiple: TaskAllExceptIdOptionalListSchema.nonempty()
});

export type TaskAllExceptIdWithIdempotencyKey = z.infer<typeof TaskAllExceptIdWithIdempotencyKeySchema>;
export type TaskIdOnlyRequiredWithIdempotencyKey = z.infer<typeof TaskIdOnlyRequiredWithIdempotencyKeySchema>;
export type TasksQueryByMultipleCriteriaWithGlobalCriteria = z.infer<typeof TasksQueryByMultipleCriteriaWithGlobalCriteriaSchema>;
