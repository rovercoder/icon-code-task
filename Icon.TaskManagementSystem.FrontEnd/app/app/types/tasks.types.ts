import { z } from 'zod';
import { regexBase62 } from '~/utils/regex.utils';

export const TaskIdOnlySchema = z.object({
    id: z.string().trim().regex(regexBase62).min(1),
});

export const taskTitleMinLength = 2;
export const taskTitleMaxLength = 50;
export const taskDescriptionMinLength = 0;
export const taskDescriptionMaxLength = 1000;

export const TaskAllExceptIdSchema = z.object({
    title: z.string().trim().min(taskTitleMinLength).max(taskTitleMaxLength),
    description: z.string().trim().min(taskDescriptionMinLength).max(taskDescriptionMaxLength),
    statusId: z.string().trim().regex(regexBase62).min(1)
});

export const TaskSchema = z.intersection(TaskIdOnlySchema, TaskAllExceptIdSchema);

export const TaskListSchema = z.array(TaskSchema);

export const TaskAllExceptIdOptionalSchema = TaskAllExceptIdSchema.partial();

export const TaskIdOnlyRequiredSchema = z.intersection(TaskIdOnlySchema, TaskAllExceptIdOptionalSchema);

export const TaskStatusSchema = z.object({
    id: z.string().trim().regex(regexBase62).min(1),
    name: z.string().trim().min(1)
});

export const TaskStatusListSchema = z.array(TaskStatusSchema);

export type Task = z.infer<typeof TaskSchema>;
export type TaskList = z.infer<typeof TaskListSchema>;
export type TaskIdOnly = z.infer<typeof TaskIdOnlySchema>;
export type TaskAllExceptId = z.infer<typeof TaskAllExceptIdSchema>;
export type TaskAllExceptIdOptional = z.infer<typeof TaskAllExceptIdOptionalSchema>;
export type TaskIdOnlyRequired = z.infer<typeof TaskIdOnlyRequiredSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskStatusList = z.infer<typeof TaskStatusListSchema>;
