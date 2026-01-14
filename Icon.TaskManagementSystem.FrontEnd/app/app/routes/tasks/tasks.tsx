import TasksPage from "~/pages/tasks/tasks";
import type { Route } from "../../routes/tasks/+types/tasks";
import { Outlet, useLoaderData, useRevalidator, type ShouldRevalidateFunction } from "react-router";
import { useCallback, useEffect } from "react";
import { getDetailsForTasks } from "~/adapters/details.api";
import { type ResultJson, Result, StatusInternal } from "~/adapters/result";
import { getTasks } from "~/adapters/tasks.api";
import { closeToastById, showToast, showToastsGroup } from "~/components/toast/toast";
import type { DetailsForTasks } from "~/types/details.types";
import type { Task, TaskList } from "~/types/tasks.types";
import { shouldRevalidateRouteNavigation } from "~/utils/routing.utils";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Tasks Route Container" },
        { name: "description", content: "This is the tasks route container." },
    ];
}

const getDetailsForTasksLoadingResult = () => Result.Loading<DetailsForTasks>('Details for tasks are being fetched!').toJson();
const getTasksLoadingResult = () => Result.Loading<Task[]>('Tasks are being fetched!').toJson();

export const loader = async (): Promise<{ details: ResultJson<DetailsForTasks>, tasks: ResultJson<TaskList> }> => {

    const detailsForTasksLoadingToastId = showToast(getDetailsForTasksLoadingResult(), 'details-for-tasks-loading');
    const tasksLoadingToastId = showToast(getTasksLoadingResult(), 'tasks-loading');

    const detailsResult = await getDetailsForTasks();
    const tasksResult = await getTasks({});

    if (detailsForTasksLoadingToastId) {
        closeToastById(detailsForTasksLoadingToastId);
    }
    if (tasksLoadingToastId) {
        closeToastById(tasksLoadingToastId);
    }

    return { details: detailsResult.toJson(), tasks: tasksResult.toJson() };
};

export const shouldRevalidate: ShouldRevalidateFunction = ({
    actionResult,
    currentParams,
    currentUrl,
    defaultShouldRevalidate,
    formAction,
    formData,
    formEncType,
    formMethod,
    nextParams,
    nextUrl,
}) => {
    // Prevent revalidation when navigating between sibling routes under /tasks
    return shouldRevalidateRouteNavigation({ startsWithUrlPath: '/tasks', currentUrl, nextUrl, formMethod, defaultShouldRevalidate });
};

export default function Tasks() {

    const revalidator = useRevalidator();

    const handleRetry = useCallback(() => {
        revalidator.revalidate();
    }, [revalidator]);

    const loaderData = useLoaderData<typeof loader>();

    const { details, tasks } = loaderData != null ? loaderData : { details: getDetailsForTasksLoadingResult(), tasks: getTasksLoadingResult() };

    useEffect(() => {
        if (details && tasks) {
            showToastsGroup({ 'details-for-tasks-loading': details, 'tasks-loading': tasks }, { onRetry: handleRetry });
        }
    }, [details, tasks]);

    if (details.isLoading || tasks.isLoading) {
        return <div>Loader...</div>;
    }

    if (!details.isSuccess || !tasks.isSuccess) {
        const errorMessage = [!details.isSuccess ? details.fullDescription : '', !tasks.isSuccess ? tasks.fullDescription : ''].join('\r\n\r\n').trim();
        return <div>
            <p>{errorMessage}</p>
            <button onClick={handleRetry}>Retry</button>
        </div>
    }

    if (tasks.value == null || details.value == null) {
        return <div>
            <p>Inconsistent state!</p>
            <button onClick={handleRetry}>Retry</button>
        </div>;
    }

    const refreshAllTasks = () => {
        handleRetry();
    };

    return <TasksPage tasks={tasks.value} details={details.value} refreshAllTasks={refreshAllTasks}>
        <Outlet />
    </TasksPage>
}
