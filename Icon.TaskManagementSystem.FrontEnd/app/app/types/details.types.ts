import { z } from "zod";
import { TaskStatusListSchema } from "./tasks.types";

export const DetailsForTasksSchema = z.object({
    taskStatuses: TaskStatusListSchema
});

export type DetailsForTasks = z.infer<typeof DetailsForTasksSchema>
