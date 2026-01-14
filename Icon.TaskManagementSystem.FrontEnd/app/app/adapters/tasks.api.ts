import { api, performRequest } from "./axios";
import { TaskAllExceptIdOptionalSchema, TaskIdOnlySchema, TaskListSchema, TaskSchema, type Task, type TaskAllExceptIdOptional, type TaskIdOnly, type TaskList } from "~/types/tasks.types";
import { TaskAllExceptIdWithIdempotencyKeySchema, TaskIdOnlyRequiredWithIdempotencyKeySchema, type TaskAllExceptIdWithIdempotencyKey, type TaskIdOnlyRequiredWithIdempotencyKey } from "./tasks.api.types";
import { StatusInternal, Result } from "./result";

export const getTasks = async (data: TaskAllExceptIdOptional): Promise<Result<TaskList>> => {
    const validationResult = TaskAllExceptIdOptionalSchema.safeParse(data);
    if (!validationResult.success) {
        return Result.Failure<TaskList>(StatusInternal.VALIDATION_FAILED, 'Validation failed for getTasks parameters!', validationResult.error);
    }
    return await performRequest<TaskList>(api.get("/tasks", { params: data }), TaskListSchema, 'Tasks obtained successfully!', 'Tasks fetching failed!');
}

export const getTask = async (data: TaskIdOnly): Promise<Result<Task>> => {
    const validationResult = TaskIdOnlySchema.safeParse(data);
    if (!validationResult.success) {
        return Result.Failure<Task>(StatusInternal.VALIDATION_FAILED, 'Validation failed for getTask parameters!', validationResult.error);
    }
    return await performRequest<Task>(api.get(`/tasks/${data.id}`), TaskSchema, 'Task obtained successfully!', 'Task fetching failed!');
}

export const createTask = async (data: TaskAllExceptIdWithIdempotencyKey): Promise<Result<Task>> => {
    const validationResult = TaskAllExceptIdWithIdempotencyKeySchema.safeParse(data);
    if (!validationResult.success) {
        return Result.Failure<Task>(StatusInternal.VALIDATION_FAILED, 'Validation failed for createTask parameters!', validationResult.error);
    }
    const { idempotencyKey, ...postData } = data;
    return await performRequest<Task>(api.post("/tasks", postData, { headers: { 'Idempotency-Key': idempotencyKey } }), TaskSchema, 'Task created successfully!', 'Task creation failed!');
}

export const updateTask = async (data: TaskIdOnlyRequiredWithIdempotencyKey): Promise<Result<Task>> => {
    const validationResult = TaskIdOnlyRequiredWithIdempotencyKeySchema.safeParse(data);
    if (!validationResult.success) {
        return Result.Failure<Task>(StatusInternal.VALIDATION_FAILED, 'Validation failed for updateTask parameters!', validationResult.error);
    }
    const { idempotencyKey, id, ...patchData } = data;
    return await performRequest<Task>(api.patch(`/tasks/${id}`, patchData, { headers: { 'Idempotency-Key': idempotencyKey } }), TaskSchema, 'Task updated successfully!', 'Task update failed!');
}

export const deleteTask = async (data: TaskIdOnly): Promise<Result<unknown>> => {
    const validationResult = TaskIdOnlySchema.safeParse(data);
    if (!validationResult.success) {
        return Result.Failure<unknown>(StatusInternal.VALIDATION_FAILED, 'Validation failed for deleteTask parameters!', validationResult.error);
    }
    return await performRequest(api.delete(`/tasks/${data.id}`), undefined, 'Task deleted successfully!', 'Task deletion failed!');
}
