import TasksPage from "~/pages/tasks/tasks";
import type { Route } from "../../routes/tasks/+types/tasks";
import { Outlet, useLoaderData, useRevalidator, type ShouldRevalidateFunction } from "react-router";
import { useCallback, useEffect } from "react";
import { getDetailsForTasks } from "~/adapters/details.api";
import { type ResultJson, Result } from "~/adapters/result";
import { getTasks } from "~/adapters/tasks.api";
import { closeToastById, showToast, showToastsGroup } from "~/components/helpers/toast/toast";
import ErrorAlert from "~/components/helpers/error-alert/error-alert";
import Loader from "~/components/helpers/loader/loader";
import { type DetailsForTasks } from "~/types/details.types";
import { type TaskList } from "~/types/tasks.types";
import { shouldRevalidateRouteNavigation } from "~/utils/routing.utils";
import { ToastIdPrefix } from "~/constants/toasts.constants";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Tasks Route Container" },
        { name: "description", content: "This is the tasks route container." },
    ];
}

const getDetailsForTasksLoadingResult = () => Result.Loading<DetailsForTasks>('Details for tasks are being fetched!').toJson();
const getTasksLoadingResult = () => Result.Loading<TaskList>('Tasks are being fetched!').toJson();

export const loader = async (): Promise<{ details: ResultJson<DetailsForTasks>, tasks: ResultJson<TaskList> }> => {

    const detailsForTasksLoadingToastId = showToast(ToastIdPrefix.TASKS_DETAILS_FOR_TASKS_LOADING, getDetailsForTasksLoadingResult());
    const tasksLoadingToastId = showToast(ToastIdPrefix.TASKS_TASKS_LOADING, getTasksLoadingResult());

    const [detailsResult, tasksResult] = await Promise.all([getDetailsForTasks(), getTasks({})]);

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
            showToastsGroup({ [ToastIdPrefix.TASKS_DETAILS_FOR_TASKS_LOADING]: details, [ToastIdPrefix.TASKS_TASKS_LOADING]: tasks }, { onRetry: handleRetry });
        }
    }, [details, tasks]);

    if (details.isLoading || tasks.isLoading) {
        return <Loader message="Loading tasks and details..." />;
    }

    if (!details.isSuccess || !tasks.isSuccess) {
        const errors = [!details.isSuccess ? details.fullDescription : '', !tasks.isSuccess ? tasks.fullDescription : ''].filter(x => !!x && x.length > 0);
        return <>
            { errors.map(errorMessage => <ErrorAlert message={errorMessage} onRetry={handleRetry} />) }
        </>;
    }

    if (tasks.value == null || details.value == null) {
        return <ErrorAlert message="Inconsistent state!" onRetry={handleRetry} />;
    }

    const refreshAllTasks = () => {
        handleRetry();
    };

    return <TasksPage tasks={tasks.value} details={details.value} refreshAllTasks={refreshAllTasks}>
        <Outlet />
    </TasksPage>
}
