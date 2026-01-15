import TaskEditorPage from "~/pages/tasks/task-editor/task-editor";
import type { Route } from "../../routes/tasks/+types/task-editor";
import { useActionData, useFetcher, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { createTask, deleteTask, getTask, updateTask } from "~/adapters/tasks.api";
import { Result, StatusInternal, type ResultJson } from "~/adapters/result";
import { TaskSchema, type Task } from "~/types/tasks.types";
import { closeToastById, showToast, showToastByResult } from "~/components/toast/toast";
import { useCallback, useContext, useEffect } from "react";
import { TasksContext } from "~/contexts/tasks.context";
import { type TaskAllExceptIdWithIdempotencyKey, TaskAllExceptIdWithIdempotencyKeySchema } from "~/adapters/tasks.api.types";
import { ToastIdPrefix } from "~/constants/toasts.constants";
import ErrorAlert from "~/components/error-alert/error-alert";
import Loader from "~/components/loader/loader";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Task Editor" },
        { name: "description", content: "This is the task editor." },
    ];
}

function isNewTask(taskId: string | null | undefined) {
    const _taskId = taskId?.toString().trim();
    return _taskId == null || _taskId.length === 0 || _taskId.toLowerCase() === 'new';
}

const getLoadingTaskResult = () => Result.Loading<Task>('Task is loading!').toJson();

// 🔹 LOADER: Fetch task (for edit) or statuses (for create)
export async function loader({ params }: LoaderFunctionArgs): Promise<{task: ResultJson<Task | null>}> {
    const { taskId } = params;

    const _taskId = taskId?.toString().trim();

    const loadingToastId = showToast(ToastIdPrefix.TASK_EDITOR_TASK_LOADING, getLoadingTaskResult());

    if (_taskId == null || isNewTask(_taskId)) {
        // For "create"
        return { task: Result.Success(null, StatusInternal.OK, 'New task to be created!').toJson() };
    }

    // For "edit", load task
    const taskResult = await getTask({ id: _taskId });

    if (loadingToastId) {
        closeToastById(loadingToastId);
    }

    return { task: taskResult.toJson() };
}

// 🔹 ACTION: Handle form submission (create/update/delete)
export async function action({ request }: ActionFunctionArgs): Promise<{ isDelete: boolean, result: ResultJson<Task> | ResultJson<unknown> }> {

    const formData = await request.formData();
    const taskId = formData.get('taskId')?.toString().trim();

    const createTaskMode = taskId == null || taskId.length === 0;

    const intent = formData.get('intent')?.toString().trim();

    const isDelete = intent?.toLowerCase() === 'delete';
    
    if (isDelete) {
        if (createTaskMode) {
            return { isDelete, result: Result.Failure(StatusInternal.INVALID_STATE, 'Delete requested during task creation!').toJson() };
        } else {
            return { isDelete, result: (await deleteTask({ id: taskId })).toJson() };
        }
    }

    // Validate and parse form data
    const title = formData.get('title')?.toString().trim();
    const description = formData.get('description')?.toString().trim();
    const statusId = formData.get('statusId')?.toString().trim();
    const idempotencyKey = formData.get('idempotencyKey')?.toString().trim();

    const taskWithoutId: Partial<TaskAllExceptIdWithIdempotencyKey> = {
        title,
        description,
        statusId,
        idempotencyKey
    };

    const parsedTask = TaskAllExceptIdWithIdempotencyKeySchema.safeParse(taskWithoutId);

    if (!parsedTask.success) {
        return { isDelete, result: Result.Failure(StatusInternal.VALIDATION_FAILED, 'Task details invalid!', parsedTask.error).toJson() };
    }

    if (createTaskMode) {
        return { isDelete, result: (await createTask(parsedTask.data)).toJson() };
    } else {
        return { isDelete, result: (await updateTask({ id: taskId,...parsedTask.data })).toJson() };
    }
}

export default function TaskEditor() {
    const fetcher = useFetcher<{ task: ResultJson<Task> }>();
    const loaderData = useLoaderData<typeof loader>();
    const { task } = fetcher.data != null ? fetcher.data : (loaderData != null ? loaderData : { task: getLoadingTaskResult() })

    const handleRetry = useCallback(() => {
        fetcher.load(location.pathname);
    }, [fetcher]);

    const tasksContext = useContext(TasksContext);
    if (tasksContext == null) {
        return <ErrorAlert message="TasksContext not found in scope!" />
    }

    if (task.isLoading) {
        return <Loader message="Loading task..." />;
    }

    useEffect(() => {
        showToast(ToastIdPrefix.TASK_EDITOR_TASK_LOADING, task, { onRetry: handleRetry })
    }, [task]);

    let _task: Task | null = null;
    if (task.value != null) {
        const validationResult = TaskSchema.safeParse(task.value);
        if (validationResult.success) {
            _task = validationResult.data;
        } else {
            showToastByResult(ToastIdPrefix.TASK_EDITOR_TASK_VALIDATION, Result.Failure(StatusInternal.VALIDATION_FAILED, 'Task validation failed!'), { onRetry: handleRetry })
            return <div>Task validation failed!</div>
        }
    }

    const isCreateMode = _task == null;

    const actionData = useActionData<typeof action>();
    // Show errors from action
    useEffect(() => {
        if (actionData != null && actionData.result != null) {
            showToast(ToastIdPrefix.TASK_EDITOR_ACTION_DATA_RESULT_LOADED, actionData.result);
            if (actionData.result.isSuccess) {
                if (isCreateMode) {
                    const _res = TaskSchema.safeParse(actionData.result.value);
                    if (!_res.success) {
                        showToastByResult(ToastIdPrefix.TASK_EDITOR_ACTION_DATA_RESULT_VALIDATION, Result.Failure(StatusInternal.INVALID_STATE, 'Action data result validation failed for create action!'));
                        tasksContext.refreshAllTasks();
                    } else {
                        tasksContext.addTask(_res.data);
                    }
                } else if (actionData.isDelete) {
                    if (_task != null && _task.id != null) {
                        tasksContext.deleteTask({ id: _task.id });
                    } else {
                        showToastByResult(ToastIdPrefix.TASK_EDITOR_ACTION_DATA_RESULT_DELETE_TASK_ID_VALIDATION, Result.Failure(StatusInternal.INVALID_STATE, 'Task ID cannot be undefined for delete action!'));
                        tasksContext.refreshAllTasks();
                    }
                } else if (_task != null && _task.id != null) {
                    const _res = TaskSchema.safeParse(actionData.result.value);
                    if (!_res.success) {
                        showToastByResult(ToastIdPrefix.TASK_EDITOR_ACTION_DATA_RESULT_VALIDATION, Result.Failure(StatusInternal.INVALID_STATE, 'Action data result validation failed for update action!'));
                        tasksContext.refreshAllTasks();
                    } else {
                        tasksContext.updateTask(_res.data);
                    }
                }
                tasksContext.goToTasksList({ isDeleteAction: actionData.isDelete });
            }
        }
    }, [actionData]);
    
    return <TaskEditorPage task={_task} taskStatuses={tasksContext.taskStatuses} goToTasksList={tasksContext.goToTasksList} />;
}
