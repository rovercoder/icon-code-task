import { z } from 'zod';
import { regexBase62 } from '~/utils/regex.utils';

export const TaskIdOnlySchema = z.object({
    id: z.string().trim().regex(regexBase62).min(1),
});

export const TaskStatusIdStringSchema = z.string().trim().regex(regexBase62).min(1);

export const taskTitleMinLength = 2;
export const taskTitleMaxLength = 50;
export const taskDescriptionMinLength = 0;
export const taskDescriptionMaxLength = 1000;

export const TaskAllExceptIdSchema = z.object({
    title: z.string().trim().min(taskTitleMinLength).max(taskTitleMaxLength),
    description: z.string().trim().min(taskDescriptionMinLength).max(taskDescriptionMaxLength),
    statusId: TaskStatusIdStringSchema
});

export const TaskAllExceptIdCriteriaSchema = z.object({
    title: z.string().max(taskTitleMaxLength).optional(),
    description: z.string().max(taskDescriptionMaxLength).optional(),
    statusId: TaskStatusIdStringSchema.optional()
});

export const TaskAllExceptIdCriteriaWithDefaultsSchema = z.object({
    title: z.string().max(taskTitleMaxLength).default('').optional(),
    description: z.string().max(taskDescriptionMaxLength).default('').optional(),
    statusId: TaskStatusIdStringSchema.optional()
});

export const TaskSchema = z.intersection(TaskIdOnlySchema, TaskAllExceptIdSchema);

export const TaskListSchema = z.array(TaskSchema);

export const TaskAllExceptIdOptionalSchema = TaskAllExceptIdSchema.partial();

export const TaskAllExceptIdOptionalListSchema = z.array(TaskAllExceptIdOptionalSchema);

export const TaskIdOnlyRequiredSchema = z.intersection(TaskIdOnlySchema, TaskAllExceptIdOptionalSchema);

export const TaskStatusSchema = z.object({
    id: TaskStatusIdStringSchema,
    name: z.string().trim().min(1)
});

export const TaskStatusListSchema = z.array(TaskStatusSchema);

export const TaskListsByMultipleCriteriaSchema = z.array(z.object({
    globalQuery: TaskAllExceptIdCriteriaSchema,
    query: TaskAllExceptIdCriteriaSchema,
    results: TaskListSchema
}));

export type Task = z.infer<typeof TaskSchema>;
export type TaskList = z.infer<typeof TaskListSchema>;
export type TaskIdOnly = z.infer<typeof TaskIdOnlySchema>;
export type TaskStatusIdString = z.infer<typeof TaskStatusIdStringSchema>;
export type TaskAllExceptId = z.infer<typeof TaskAllExceptIdSchema>;
export type TaskAllExceptIdCriteria = z.infer<typeof TaskAllExceptIdCriteriaSchema>;
export type TaskAllExceptIdOptional = z.infer<typeof TaskAllExceptIdOptionalSchema>;
export type TaskAllExceptIdOptionalList = z.infer<typeof TaskAllExceptIdOptionalListSchema>;
export type TaskIdOnlyRequired = z.infer<typeof TaskIdOnlyRequiredSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskStatusList = z.infer<typeof TaskStatusListSchema>;
export type TaskListsByMultipleCriteria = z.infer<typeof TaskListsByMultipleCriteriaSchema>;

export const TaskAllExceptIdExceptStatusIdCriteriaSchema = TaskAllExceptIdCriteriaSchema.omit({ statusId: true }); // Omit statusId from query params
export const TaskAllExceptIdExceptStatusIdCriteriaWithDefaultsSchema = TaskAllExceptIdCriteriaWithDefaultsSchema.omit({ statusId: true }); // Omit statusId from query params

export const TasksBasedOnStatusByStatusPartQuerySchema = z.record(TaskStatusIdStringSchema, TaskAllExceptIdExceptStatusIdCriteriaSchema);
export const TasksBasedOnStatusByStatusPartQueryWithDefaultsSchema = z.record(TaskStatusIdStringSchema, TaskAllExceptIdExceptStatusIdCriteriaWithDefaultsSchema);

export const TasksBasedOnStatusNonPartialQueryWithDefaultsSchema = z.object({
    global: TaskAllExceptIdCriteriaWithDefaultsSchema,
    byStatus: TasksBasedOnStatusByStatusPartQueryWithDefaultsSchema,
});

export const TasksBasedOnStatusQuerySchema = z.object({
    global: TaskAllExceptIdCriteriaSchema.optional(),
    byStatus: TasksBasedOnStatusByStatusPartQuerySchema.optional(),
});

export type TaskAllExceptIdExceptStatusIdCriteria = z.infer<typeof TaskAllExceptIdExceptStatusIdCriteriaSchema>;
export type TasksBasedOnStatusByStatusPartQuery = z.infer<typeof TasksBasedOnStatusByStatusPartQuerySchema>;
export type TasksBasedOnStatusQuery = z.infer<typeof TasksBasedOnStatusQuerySchema>;
export type TasksBasedOnStatusNonPartialQuery = z.infer<typeof TasksBasedOnStatusNonPartialQueryWithDefaultsSchema>;
